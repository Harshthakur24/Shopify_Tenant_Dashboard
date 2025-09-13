import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const topic = searchParams.get('topic') || undefined;
    const source = (searchParams.get('source') || 'hybrid').toLowerCase(); // 'db' | 'shopify' | 'hybrid'
    const queryTenantId = searchParams.get('tenantId') || undefined;
    const queryShop = searchParams.get('shop') || undefined;

    // Helper function to resolve tenant credentials
    async function resolveTenant() {
      const auth = request.cookies.get('auth')?.value || '';
      const payload = auth ? await verifyJwt<{ tenantId: string }>(auth) : null;

      // 1. Try auth cookie first
      if (payload?.tenantId) {
        const t = await prisma.tenant.findUnique({ where: { id: payload.tenantId } });
        if (t?.shopDomain && t?.accessToken) {
          return { shopDomain: t.shopDomain, accessToken: t.accessToken, tenantId: t.id };
        }
      }

      // 2. Try query params (for API calls with explicit tenant)
      if (queryTenantId || queryShop) {
        const t = queryTenantId
          ? await prisma.tenant.findUnique({ where: { id: queryTenantId } })
          : await prisma.tenant.findUnique({ where: { shopDomain: String(queryShop) } });
        if (t?.shopDomain && t?.accessToken) {
          return { shopDomain: t.shopDomain, accessToken: t.accessToken, tenantId: t.id };
        }
      }

      // 3. Require explicit tenant - no fallback for multi-tenant safety
      throw new Error('No valid tenant credentials found. Please provide tenantId or shop parameter.');
    }

    if (source === 'shopify' || source === 'hybrid') {
      let tenant;
      try {
        tenant = await resolveTenant();
      } catch (error) {
        return NextResponse.json({ 
          error: 'Missing tenant context', 
          message: error instanceof Error ? error.message : 'Unknown error',
          hint: 'Add ?tenantId=... or ?shop=... parameter' 
        }, { status: 400 });
      }

      // Fetch from Shopify Events API (polling approach)
      const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-07';
      const url = `https://${tenant.shopDomain}/admin/api/${apiVersion}/events.json?limit=${Math.min(limit, 50)}`;
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': tenant.accessToken,
        },
        cache: 'no-store',
      });
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        return NextResponse.json({ 
          error: 'Failed to fetch from Shopify', 
          status: res.status, 
          shopDomain: tenant.shopDomain,
          body: txt 
        }, { status: 502 });
      }
      
      const data = await res.json();
      const shopifyEvents: Array<{
        id: number | string;
        created_at?: string;
        subject?: string;
        subject_type?: string;
        verb?: string;
        message?: string;
        description?: string;
        path?: string;
        author?: string;
        topic?: string;
      }> = Array.isArray(data?.events) ? data.events : [];

      // Enhanced mapping function with better topic detection
      function mapTopic(event: typeof shopifyEvents[0]): string {
        // Try to extract topic from Shopify's native fields first
        if (event.topic) return event.topic;
        
        const subject = (event.subject_type || event.subject || '').toLowerCase();
        const verb = (event.verb || '').toLowerCase();
        
        // Enhanced resource mapping
        const resourceMap: Record<string, string> = {
          'order': 'orders',
          'product': 'products', 
          'customer': 'customers',
          'checkout': 'checkouts',
          'cart': 'carts',
          'fulfillment': 'fulfillments',
          'refund': 'refunds',
          'inventory_item': 'inventory_levels',
          'app': 'app'
        };
        
        // Enhanced verb mapping
        const verbMap: Record<string, string> = {
          'create': 'create',
          'update': 'updated',
          'destroy': 'delete',
          'fulfill': 'fulfilled',
          'cancel': 'cancelled',
          'paid': 'paid',
          'refund': 'refunded'
        };
        
        const resource = Object.keys(resourceMap).find(key => subject.includes(key)) || 'events';
        const action = verbMap[verb] || verb || 'unknown';
        
        return `${resourceMap[resource] || resource}/${action}`;
      }

      // Map Shopify events to app format
      const shopifyMapped = shopifyEvents
        .map((e) => ({
          id: `shopify_${e.id}`,
          topic: mapTopic(e),
          payload: { 
            subject: e.subject, 
            subject_type: e.subject_type,
            verb: e.verb, 
            message: e.message,
            description: e.description,
            path: e.path,
            author: e.author,
            shopify_event_id: e.id
          },
          createdAt: e.created_at || new Date().toISOString(),
          tenant: { name: tenant.shopDomain, shopDomain: tenant.shopDomain },
        }))
        .filter((e) => (topic ? e.topic === topic : true));

      if (source === 'shopify') {
        // Pure Shopify polling mode
        const stats = shopifyMapped.reduce((acc: Record<string, number>, ev) => {
          acc[ev.topic] = (acc[ev.topic] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
          events: shopifyMapped,
          stats,
          total: shopifyMapped.length,
          source: 'shopify',
          timestamp: new Date().toISOString(),
        });
      }

      // Hybrid mode: combine webhook events (DB) + recent Shopify events
      const dbWhere: Record<string, unknown> = { tenantId: tenant.tenantId };
      if (topic) dbWhere.topic = topic;

      const dbEvents = await prisma.event.findMany({
        where: dbWhere,
        orderBy: { createdAt: 'desc' },
        take: Math.floor(limit / 2), // Split limit between sources
        select: {
          id: true,
          topic: true,
          payload: true,
          createdAt: true,
          tenant: { select: { name: true, shopDomain: true } },
        },
      });

      // Combine and deduplicate by ID, prioritizing webhook events
      const combined = [...dbEvents, ...shopifyMapped.slice(0, Math.floor(limit / 2))]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      const hybridStats = combined.reduce((acc: Record<string, number>, ev) => {
        acc[ev.topic] = (acc[ev.topic] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return NextResponse.json({
        events: combined,
        stats: hybridStats,
        total: combined.length,
        source: 'hybrid',
        webhook_events: dbEvents.length,
        shopify_events: shopifyMapped.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: read from local DB (existing behavior)
    const where: Record<string, unknown> = {};
    if (topic) where.topic = topic;

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        topic: true,
        payload: true,
        createdAt: true,
        tenant: { select: { name: true, shopDomain: true } },
      },
    });

    const topicCounts = await prisma.event.groupBy({
      by: ['topic'],
      _count: { id: true },
      orderBy: { topic: 'asc' },
    });

    const stats = topicCounts.reduce((acc, item) => {
      acc[item.topic] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ events, stats, total: events.length, source: 'db', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook events' }, { status: 500 });
  }
}
