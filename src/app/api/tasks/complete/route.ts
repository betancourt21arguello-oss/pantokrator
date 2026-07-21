// POST /api/tasks/complete — completa un "Momento de Hoy" o la Jornada Diaria.
// Actualiza contadores del SoulGarden (virtudes, racha) y registra el evento
// de forma diferida (misma función usada por el consumidor de la cola).
import { and, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { profiles, spiritualTasks, spiritualInventory } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/identity";
import { enqueueMetricEvent } from "@/lib/metrics";
import { bumpIntensityIfActive } from "@/lib/llama/bumpIntensity";

export const dynamic = "force-dynamic";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type VirtueKey = "faith" | "hope" | "charity" | "candle";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      kind?: string;
      title?: string;
      subtitle?: string;
      rewardVirtue?: VirtueKey;
      rewardAmount?: number;
      metadata?: Record<string, unknown>;
    };

    if (!body.kind || !body.title) {
      return Response.json(
        { ok: false, error: "kind y title son obligatorios." },
        { status: 400 },
      );
    }

    const profile = await getOrCreateProfile();
    const today = todayISO();
    const rewardAmount = body.rewardAmount ?? 1;

    // 1) Upsert de la tarea del día (idempotente por profile+kind+día).
    const [task] = await db
      .insert(spiritualTasks)
      .values({
        profileId: profile.id,
        kind: body.kind,
        title: body.title,
        subtitle: body.subtitle,
        taskDate: today,
        completed: true,
        completedAt: new Date(),
        rewardVirtue: body.rewardVirtue,
        rewardAmount,
        metadata: body.metadata ?? {},
      })
      .onConflictDoUpdate({
        target: [
          spiritualTasks.profileId,
          spiritualTasks.kind,
          spiritualTasks.taskDate,
        ],
        set: {
          completed: true,
          completedAt: new Date(),
          metadata: body.metadata ?? {},
        },
      })
      .returning();

    // 2) Actualizar contadores del SoulGarden + racha diaria.
    const isNewDay = profile.lastActiveDate !== today;

    const virtueUpdate: Record<string, SQL<unknown>> = {};
    switch (body.rewardVirtue) {
      case "faith":
        virtueUpdate.seedsFaith = sql`${profiles.seedsFaith} + ${rewardAmount}`;
        break;
      case "hope":
        virtueUpdate.seedsHope = sql`${profiles.seedsHope} + ${rewardAmount}`;
        break;
      case "charity":
        virtueUpdate.seedsCharity = sql`${profiles.seedsCharity} + ${rewardAmount}`;
        break;
      case "candle":
        virtueUpdate.candlesLit = sql`${profiles.candlesLit} + ${rewardAmount}`;
        break;
      default:
        break;
    }

    const [updatedProfile] = await db
      .update(profiles)
      .set({
        streakDays: isNewDay
          ? sql`${profiles.streakDays} + 1`
          : profiles.streakDays,
        lastActiveDate: today,
        prayersCount: sql`${profiles.prayersCount} + 1`,
        ...virtueUpdate,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profile.id))
      .returning();

    // 2.1) Actualizar semillas en spiritual_inventory según el tipo de momento
    let seedColumn: "seedsJourney" | "seedsMercy" | "seedsRosary" | "seedsRequiem" | "seedsGuadalupe" = "seedsJourney";
    if (body.kind === "laudes" || body.kind === "angelus") {
      seedColumn = "seedsMercy";
    } else if (body.kind === "rosario") {
      seedColumn = "seedsRosary";
    } else if (body.kind === "cien_requiem") {
      seedColumn = "seedsRequiem";
    } else if (body.kind === "share_light") {
      seedColumn = "seedsGuadalupe";
    }

    await db
      .insert(spiritualInventory)
      .values({
        profileId: profile.id,
        [seedColumn]: 1,
        currentStreak: updatedProfile.streakDays,
        longestStreak: Math.max(updatedProfile.streakDays, 0),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: spiritualInventory.profileId,
        set: {
          [seedColumn]: sql`${spiritualInventory[seedColumn]} + 1`,
          currentStreak: updatedProfile.streakDays,
          longestStreak: sql`GREATEST(${spiritualInventory.longestStreak}, ${updatedProfile.streakDays})`,
          updatedAt: new Date(),
        },
      });

    // 2.2) Elevar la intensidad de la vela activa si el usuario tiene una encendida
    await bumpIntensityIfActive(profile.id, body.kind);

    // 3) Escritura diferida del evento (batch insert compartido con la cola).
    await enqueueMetricEvent({
      profileId: profile.id,
      eventType: `task.completed.${body.kind}`,
      payload: { title: body.title, reward: body.rewardVirtue, rewardAmount },
    });

    return Response.json({ ok: true, task, profile: updatedProfile });
  } catch (err) {
    console.error("[tasks/complete]", err);
    return Response.json(
      { ok: false, error: "No se pudo completar la tarea." },
      { status: 500 },
    );
  }
}
