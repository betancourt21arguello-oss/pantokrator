// POST /api/auth/link-email
// Vincula un email al perfil anónimo actual conservando todo el progreso.
import { linkEmailToProfile } from "@/lib/identity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      displayName?: string;
    };

    if (!body.email) {
      return Response.json(
        { ok: false, error: "El email es obligatorio." },
        { status: 400 },
      );
    }

    const result = await linkEmailToProfile(body.email, body.displayName);
    if (!result.ok) {
      return Response.json(result, { status: 409 });
    }

    return Response.json({
      ok: true,
      profile: {
        id: result.profile.id,
        isAnonymous: result.profile.isAnonymous,
        email: result.profile.email,
        displayName: result.profile.displayName,
      },
    });
  } catch (err) {
    console.error("[auth/link-email]", err);
    return Response.json(
      { ok: false, error: "No se pudo vincular el email." },
      { status: 500 },
    );
  }
}
