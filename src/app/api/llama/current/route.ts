import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/identity";
import { db } from "@/db";
import { intentionsWall } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET() {
  try {
    const profile = await getOrCreateProfile();
    const now = new Date();

    const activeList = await db
      .select()
      .from(intentionsWall)
      .where(
        and(
          eq(intentionsWall.userId, profile.id),
          gt(intentionsWall.expiresAt, now),
          eq(intentionsWall.transformedToSeed, false)
        )
      )
      .limit(1);

    if (activeList.length === 0) {
      return NextResponse.json({ activeIntention: null });
    }

    const active = activeList[0];
    return NextResponse.json({
      activeIntention: {
        id: active.id,
        content: active.content,
        createdAt: active.createdAt.toISOString(),
        expiresAt: active.expiresAt.toISOString(),
        intensityLevel: active.intensityLevel,
      },
    });
  } catch (error) {
    console.error("Error al obtener vela actual:", error);
    return NextResponse.json({ activeIntention: null }, { status: 500 });
  }
}
