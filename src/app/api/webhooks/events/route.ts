import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const topic = searchParams.get('topic') || undefined;

    // Build filter conditions
    const where: Record<string, unknown> = {};
    if (topic) {
      where.topic = topic;
    }

    // Fetch recent webhook events
    const events = await prisma.event.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.min(limit, 50), // Cap at 50 for performance
      select: {
        id: true,
        topic: true,
        payload: true,
        createdAt: true,
        tenant: {
          select: {
            name: true,
            shopDomain: true
          }
        }
      }
    });

    // Get count by topic for stats
    const topicCounts = await prisma.event.groupBy({
      by: ['topic'],
      _count: {
        id: true
      },
      orderBy: {
        topic: 'asc'
      }
    });

    const stats = topicCounts.reduce((acc, item) => {
      acc[item.topic] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      events,
      stats,
      total: events.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching webhook events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook events' },
      { status: 500 }
    );
  }
}
