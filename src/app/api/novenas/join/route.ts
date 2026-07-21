// POST /api/novenas/join { novenaId, intention? } — inscribe al peregrino.
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { userNovenas } from "@/db/schema";
import { getOrCreateProfile } from "@/lib/identity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      novenaId?: string;
      intention?: string;
    };
    if (!body.novenaId) {
      return Response.json(
        { ok: false, error: "novenaId es obligatorio." },
        { status: 400 },
      );
    }

    const profile = await getOrCreateProfile();

    const existing = await db
      .select()
      .from(userNovenas)
      .where(
        and(
          eq(userNovenas.profileId, profile.id),
          eq(userNovenas.novenaId, body.novenaId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ ok: true, userNovena: existing[0] });
    }

    const [created] = await db
      .insert(userNovenas)
      .values({
        profileId: profile.id,
        novenaId: body.novenaId,
        intention: body.intention,
      })
      .returning();

    return Response.json({ ok: true, userNovena: created });
  } catch (err) {
    console.error("[novenas/join]", err);
    return Response.json(
      { ok: false, error: "No se pudo iniciar la novena." },
      { status: 500 },
    );
  }
}
