// GET /api/tasks/today — "Momentos de Hoy" del peregrino actual.
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { spiritualTasks } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/identity";

export const dynamic = "force-dynamic";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const profile = await getOrCreateProfile();
    const today = todayISO();

    const tasks = await db
      .select()
      .from(spiritualTasks)
      .where(
        and(
          eq(spiritualTasks.profileId, profile.id),
          eq(spiritualTasks.taskDate, today),
        ),
      );

    return Response.json({ ok: true, tasks });
  } catch (err) {
    console.error("[tasks/today]", err);
    return Response.json(
      { ok: false, error: "No se pudieron cargar tus momentos de hoy." },
      { status: 500 },
    );
  }
}
