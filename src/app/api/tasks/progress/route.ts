// POST /api/tasks/progress — autoguardado incremental (sin otorgar recompensa
// ni marcar como completado). Útil para contadores largos como "100 Réquiem".
import { db } from "@/db";
import { spiritualTasks } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/identity";

export const dynamic = "force-dynamic";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      kind?: string;
      title?: string;
      subtitle?: string;
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

    const [task] = await db
      .insert(spiritualTasks)
      .values({
        profileId: profile.id,
        kind: body.kind,
        title: body.title,
        subtitle: body.subtitle,
        taskDate: today,
        completed: false,
        metadata: body.metadata ?? {},
      })
      .onConflictDoUpdate({
        target: [
          spiritualTasks.profileId,
          spiritualTasks.kind,
          spiritualTasks.taskDate,
        ],
        set: { metadata: body.metadata ?? {} },
      })
      .returning();

    return Response.json({ ok: true, task });
  } catch (err) {
    console.error("[tasks/progress]", err);
    return Response.json(
      { ok: false, error: "No se pudo guardar el progreso." },
      { status: 500 },
    );
  }
}
