// GET /api/auth/session
// Inicializa (si hace falta) y devuelve el perfil del peregrino.
// Cero fricción: siempre responde con una identidad válida (anónima o vinculada).
import { getOrCreateProfile } from "@/lib/identity";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getOrCreateProfile();
    return Response.json({
      ok: true,
      profile: {
        id: profile.id,
        isAnonymous: profile.isAnonymous,
        email: profile.email,
        displayName: profile.displayName,
        avatarSeed: profile.avatarSeed,
        streakDays: profile.streakDays,
        seedsFaith: profile.seedsFaith,
        seedsHope: profile.seedsHope,
        seedsCharity: profile.seedsCharity,
        candlesLit: profile.candlesLit,
        prayersCount: profile.prayersCount,
        intentionsCount: profile.intentionsCount,
      },
    });
  } catch (err) {
    console.error("[auth/session]", err);
    return Response.json(
      { ok: false, error: "No se pudo inicializar la sesión." },
      { status: 500 },
    );
  }
}
