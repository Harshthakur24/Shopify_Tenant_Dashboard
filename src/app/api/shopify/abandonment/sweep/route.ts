import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tryLock, unlock } from "@/lib/redis";

export const dynamic = "force-dynamic";

type CheckoutEventPayload = {
  id?: string;
  token?: string;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
  line_items?: Array<unknown>;
};

export async function POST(request: NextRequest) {
  // Optional simple auth for cron
  const apiKey = request.headers.get("x-cron-key");
  if (process.env.CRON_SECRET && apiKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const lockKey = "abandon_sweep_lock";
  const locked = await tryLock(lockKey, 60 * 5); // 5 minutes lock
  if (!locked) return NextResponse.json({ error: "already running" }, { status: 429 });

  const thresholdMinutes = Number(process.env.ABANDON_THRESHOLD_MINUTES || 60);
  const windowHours = Number(process.env.ABANDON_WINDOW_HOURS || 48);

  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const now = Date.now();

  try {
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
    const results: Array<{ tenantId: string; abandoned: number }> = [];

    for (const t of tenants) {
      // Get recent checkout/cart events
      const events = await prisma.event.findMany({
        where: {
          tenantId: t.id,
          topic: { in: ["checkouts/create", "checkouts/update", "carts/create", "carts/update"] },
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "asc" },
        take: 500,
      });

      // Map by token or id
      const sessions = new Map<string, { firstAt: number; lastAt: number; email: string | null; payload: CheckoutEventPayload }>();

      for (const ev of events) {
        const payload = ev.payload as CheckoutEventPayload;
        const key = (payload.token || payload.id || "").toString();
        if (!key) continue;
        const createdAt = Date.parse(payload.created_at || ev.createdAt.toISOString());
        const updatedAt = Date.parse(payload.updated_at || ev.createdAt.toISOString());
        const prev = sessions.get(key);
        if (!prev) {
          sessions.set(key, { firstAt: createdAt || ev.createdAt.getTime(), lastAt: updatedAt || ev.createdAt.getTime(), email: payload.email ?? null, payload });
        } else {
          prev.firstAt = Math.min(prev.firstAt, createdAt || prev.firstAt);
          prev.lastAt = Math.max(prev.lastAt, updatedAt || prev.lastAt);
          if (!prev.email && payload.email) prev.email = payload.email;
        }
      }

      // Fetch existing abandoned markers recently to avoid duplicates
      const recentAbandoned = await prisma.event.findMany({
        where: { tenantId: t.id, topic: "checkouts/abandoned", createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 500,
      });

      const abandonedTokens = new Set<string>();
      for (const ev of recentAbandoned) {
        const p = ev.payload as CheckoutEventPayload;
        const token = (p.token || p.id || "").toString();
        if (token) abandonedTokens.add(token);
      }

      let abandonedCount = 0;

      for (const [token, info] of sessions.entries()) {
        const minutesSinceLast = (now - info.lastAt) / 60000;
        if (minutesSinceLast < thresholdMinutes) continue;
        if (abandonedTokens.has(token)) continue;

        // If we can infer conversion via customer email, skip
        if (info.email) {
          const customer = await prisma.customer.findFirst({ where: { tenantId: t.id, email: info.email } });
          if (customer) {
            const orderCount = await prisma.order.count({ where: { tenantId: t.id, customerId: customer.id, processedAt: { gte: new Date(info.firstAt) } } });
            if (orderCount > 0) continue; // converted
          }
        }

        await prisma.event.create({
          data: {
            tenantId: t.id,
            topic: "checkouts/abandoned",
            payload: { token, email: info.email, firstAt: new Date(info.firstAt).toISOString(), lastAt: new Date(info.lastAt).toISOString(), minutesInactive: Math.round(minutesSinceLast) },
          },
        });
        abandonedCount += 1;
      }

      results.push({ tenantId: t.id, abandoned: abandonedCount });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    await unlock(lockKey);
  }
}


