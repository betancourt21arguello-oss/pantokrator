import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/identity";
import { db } from "@/db";
import { intentionsWall } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const profile = await getOrCreateProfile();

    let body: { content?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Formato de solicitud no válido." },
        { status: 400 }
      );
    }

    const rawContent = body.content?.trim() || "";
    // Eliminar etiquetas HTML sencillas para sanear
    const sanitizedContent = rawContent.replace(/<[^>]*>/g, "").trim();

    if (!sanitizedContent || sanitizedContent.length > 40) {
      return NextResponse.json(
        { error: "La intención debe tener entre 1 y 40 caracteres." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Comprobar si ya existe una vela activa
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

    if (activeList.length > 0) {
      const active = activeList[0];
      return NextResponse.json(
        {
          error: "Ya tienes una vela encendida.",
          activeIntention: {
            id: active.id,
            content: active.content,
            createdAt: active.createdAt.toISOString(),
            expiresAt: active.expiresAt.toISOString(),
            intensityLevel: active.intensityLevel,
          },
        },
        { status: 409 }
      );
    }

    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [created] = await db
      .insert(intentionsWall)
      .values({
        userId: profile.id,
        content: sanitizedContent,
        createdAt: now,
        expiresAt,
        intensityLevel: 1,
        transformedToSeed: false,
        supporters: [],
      })
      .returning();

    return NextResponse.json({
      activeIntention: {
        id: created.id,
        content: created.content,
        createdAt: created.createdAt.toISOString(),
        expiresAt: created.expiresAt.toISOString(),
        intensityLevel: created.intensityLevel,
      },
    });
  } catch (error) {
    console.error("Error al encender vela:", error);
    return NextResponse.json(
      { error: "Error al encender la vela." },
      { status: 500 }
    );
  }
}
