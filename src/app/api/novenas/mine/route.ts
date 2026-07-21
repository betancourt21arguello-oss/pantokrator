// GET /api/novenas/mine — novenas activas del peregrino, con datos del catálogo.
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userNovenas, novenasCatalog } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/identity";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getOrCreateProfile();

    const rows = await db
      .select({
        id: userNovenas.id,
        novenaId: userNovenas.novenaId,
        currentDay: userNovenas.currentDay,
        completedDays: userNovenas.completedDays,
        completed: userNovenas.completed,
        intention: userNovenas.intention,
        startedAt: userNovenas.startedAt,
        title: novenasCatalog.title,
        subtitle: novenasCatalog.subtitle,
        accentColor: novenasCatalog.accentColor,
        totalDays: novenasCatalog.totalDays,
        days: novenasCatalog.days,
      })
      .from(userNovenas)
      .innerJoin(novenasCatalog, eq(userNovenas.novenaId, novenasCatalog.id))
      .where(eq(userNovenas.profileId, profile.id));

    return Response.json({ ok: true, novenas: rows });
  } catch (err) {
    console.error("[novenas/mine]", err);
    return Response.json(
      { ok: false, error: "No se pudieron cargar tus novenas." },
      { status: 500 },
    );
  }
}
