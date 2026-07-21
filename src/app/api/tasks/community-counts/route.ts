// GET /api/tasks/community-counts — "X personas rezando" hoy, por tipo de momento.
// Endpoint público (sin datos personales), solo agregados.
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { spiritualTasks } from "@/db/schema";

export const dynamic = "force-dynamic";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const rows = await db
      .select({
        kind: spiritualTasks.kind,
        count: sql<number>`count(*)::int`,
      })
      .from(spiritualTasks)
      .where(
        and(
          eq(spiritualTasks.taskDate, todayISO()),
          eq(spiritualTasks.completed, true),
        ),
      )
      .groupBy(spiritualTasks.kind);

    const counts = Object.fromEntries(rows.map((r) => [r.kind, r.count]));
    return Response.json({ ok: true, counts });
  } catch (err) {
    console.error("[tasks/community-counts]", err);
    return Response.json({ ok: true, counts: {} });
  }
}
