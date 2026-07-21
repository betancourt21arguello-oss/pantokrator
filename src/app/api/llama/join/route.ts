import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/identity";
import { db } from "@/db";
import { intentionsWall, spiritualInventory } from "@/db/schema";
import { eq, gt, and, sql } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const profile = await getOrCreateProfile();

    let body: { intentionId?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Formato de solicitud no válido." },
        { status: 400 }
      );
    }

    const intentionId = body.intentionId;
    if (!intentionId) {
      return NextResponse.json(
        { error: "Falta el identificador de la intención." },
        { status: 400 }
      );
    }

    const now = new Date();

    const intentionResult = await db
      .select()
      .from(intentionsWall)
      .where(
        and(
          eq(intentionsWall.id, intentionId),
          gt(intentionsWall.expiresAt, now),
          eq(intentionsWall.transformedToSeed, false)
        )
      )
      .limit(1);

    if (intentionResult.length === 0) {
      return NextResponse.json(
        { error: "La intención no existe o ha expirado." },
        { status: 404 }
      );
    }

    const intention = intentionResult[0];
    const supporters = (intention.supporters as string[]) || [];
    const alreadyJoined = supporters.includes(profile.id);

    if (alreadyJoined) {
      // Obtener gotas de agua actuales del inventario
      const inv = await db
        .select({ waterDrops: spiritualInventory.waterDrops })
        .from(spiritualInventory)
        .where(eq(spiritualInventory.profileId, profile.id))
        .limit(1);

      return NextResponse.json({
        ok: true,
        alreadyJoined: true,
        newIntensity: intention.intensityLevel,
        newWaterDrops: inv[0]?.waterDrops ?? 0,
      });
    }

    // Ejecutar actualización en transacción
    const result = await db.transaction(async (tx) => {
      let newIntensity = intention.intensityLevel;

      // Solo incrementamos intensidad si quien se une NO es el dueño de la vela
      if (intention.userId !== profile.id) {
        newIntensity = Math.min(intention.intensityLevel + 1, 5);
        const updatedSupporters = [...supporters, profile.id];

        await tx
          .update(intentionsWall)
          .set({
            intensityLevel: newIntensity,
            supporters: updatedSupporters,
          })
          .where(eq(intentionsWall.id, intention.id));
      }

      // Incrementar 1 gota de agua en el inventario espiritual del usuario que se une
      await tx
        .insert(spiritualInventory)
        .values({
          profileId: profile.id,
          waterDrops: 1,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: spiritualInventory.profileId,
          set: {
            waterDrops: sql`${spiritualInventory.waterDrops} + 1`,
            updatedAt: now,
          },
        });

      const inv = await tx
        .select({ waterDrops: spiritualInventory.waterDrops })
        .from(spiritualInventory)
        .where(eq(spiritualInventory.profileId, profile.id))
        .limit(1);

      return {
        newIntensity,
        newWaterDrops: inv[0]?.waterDrops ?? 0,
      };
    });

    return NextResponse.json({
      ok: true,
      alreadyJoined: false,
      newIntensity: result.newIntensity,
      newWaterDrops: result.newWaterDrops,
    });
  } catch (error) {
    console.error("Error al unirse a la oración:", error);
    return NextResponse.json(
      { error: "Error al unirse a la oración." },
      { status: 500 }
    );
  }
}
