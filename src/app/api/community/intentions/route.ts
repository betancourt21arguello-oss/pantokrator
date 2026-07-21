import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/identity";
import { db } from "@/db";
import { intentionsWall, metricEvents } from "@/db/schema";
import { and, gt, eq, lt, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Cache simple en memoria para las métricas globales del día (60 segundos)
let cachedMetrics: {
  timestamp: number;
  data: { candlesToday: number; rosariesToday: number };
} | null = null;

async function getGlobalMetrics() {
  const now = Date.now();
  if (cachedMetrics && now - cachedMetrics.timestamp < 60000) {
    return cachedMetrics.data;
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  const [candlesRes, rosariesRes] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(intentionsWall)
      .where(sql`DATE(${intentionsWall.createdAt}) = DATE(${todayStr})`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(metricEvents)
      .where(
        and(
          eq(metricEvents.eventType, "task.completed.rosario"),
          sql`DATE(${metricEvents.occurredAt}) = DATE(${todayStr})`
        )
      ),
  ]);

  const candlesToday = Number(candlesRes[0]?.count || 0);
  const rosariesToday = Number(rosariesRes[0]?.count || 0);

  const data = { candlesToday, rosariesToday };
  cachedMetrics = { timestamp: now, data };
  return data;
}

export async function GET(request: Request) {
  try {
    const profile = await getOrCreateProfile();
    const { searchParams } = new URL(request.url);

    const limitParam = parseInt(searchParams.get("limit") || "30", 10);
    const limit = Math.min(Math.max(limitParam, 1), 60);
    const cursor = searchParams.get("cursor");

    const now = new Date();

    const conditions = [
      gt(intentionsWall.expiresAt, now),
      eq(intentionsWall.transformedToSeed, false),
    ];

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!isNaN(cursorDate.getTime())) {
        conditions.push(lt(intentionsWall.createdAt, cursorDate));
      }
    }

    const items = await db
      .select()
      .from(intentionsWall)
      .where(and(...conditions))
      .orderBy(desc(intentionsWall.createdAt))
      .limit(limit + 1);

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      if (nextItem) {
        nextCursor = nextItem.createdAt.toISOString();
      }
    }

    const globalMetrics = await getGlobalMetrics();

    const formattedItems = items.map((item) => {
      const supporters = (item.supporters as string[]) || [];
      return {
        id: item.id,
        content: item.content,
        createdAt: item.createdAt.toISOString(),
        expiresAt: item.expiresAt.toISOString(),
        intensityLevel: item.intensityLevel,
        isOwner: item.userId === profile.id,
        hasJoined: supporters.includes(profile.id),
      };
    });

    return NextResponse.json({
      items: formattedItems,
      nextCursor,
      globalMetrics,
    });
  } catch (error) {
    console.error("Error al obtener intenciones comunitarias:", error);
    return NextResponse.json(
      { error: "Error al cargar las intenciones de la comunidad." },
      { status: 500 }
    );
  }
}
