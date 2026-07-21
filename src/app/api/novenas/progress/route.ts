// POST /api/novenas/progress { userNovenaId, day } — marca un día como rezado.
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { userNovenas, spiritualInventory } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/identity";
import { enqueueMetricEvent } from "@/lib/metrics";
import { bumpIntensityIfActive } from "@/lib/llama/bumpIntensity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      userNovenaId?: string;
      day?: number;
    };
    if (!body.userNovenaId || !body.day) {
      return Response.json(
        { ok: false, error: "userNovenaId y day son obligatorios." },
        { status: 400 },
      );
    }

    const profile = await getOrCreateProfile();

    const [row] = await db
      .select()
      .from(userNovenas)
      .where(eq(userNovenas.id, body.userNovenaId))
      .limit(1);

    if (!row || row.profileId !== profile.id) {
      return Response.json(
        { ok: false, error: "Novena no encontrada." },
        { status: 404 },
      );
    }

    const completedDays = Array.from(
      new Set([...(row.completedDays ?? []), body.day]),
    ).sort((a, b) => a - b);
    const nextDay = Math.min(body.day + 1, 9);
    const isCompleted = completedDays.length >= 9;

    const [updated] = await db
      .update(userNovenas)
      .set({
        completedDays,
        currentDay: nextDay,
        lastPrayedAt: new Date(),
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      })
      .where(eq(userNovenas.id, row.id))
      .returning();

    // Incrementar semillas de San José / Novena en spiritual_inventory
    await db
      .insert(spiritualInventory)
      .values({
        profileId: profile.id,
        seedsJose: 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: spiritualInventory.profileId,
        set: {
          seedsJose: sql`${spiritualInventory.seedsJose} + 1`,
          updatedAt: new Date(),
        },
      });

    // Aumentar intensidad de la vela activa si el usuario tiene una
    await bumpIntensityIfActive(profile.id, "novena");

    await enqueueMetricEvent({
      profileId: profile.id,
      eventType: "novena.day_completed",
      payload: { novenaId: row.novenaId, day: body.day },
    });

    return Response.json({ ok: true, userNovena: updated });
  } catch (err) {
    console.error("[novenas/progress]", err);
    return Response.json(
      { ok: false, error: "No se pudo registrar el progreso." },
      { status: 500 },
    );
  }
}
