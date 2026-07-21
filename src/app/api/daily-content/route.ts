// GET /api/daily-content — contenido de la jornada de hoy (seed si es necesario).
import { getOrCreateTodayContent } from "@/lib/dailyContent";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await getOrCreateTodayContent();
    return Response.json({ ok: true, content });
  } catch (err) {
    console.error("[daily-content]", err);
    return Response.json(
      { ok: false, error: "No se pudo cargar el contenido de hoy." },
      { status: 500 },
    );
  }
}
