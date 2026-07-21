import { NextResponse } from "next/server";
import { sweepExpiredIntentions } from "@/lib/intentions/sweeper";

export async function GET(request: Request) {
  // Verificar autorización si existe token CRON_SECRET en variables de entorno
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await sweepExpiredIntentions();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Error al ejecutar sweepExpiredIntentions:", error);
    return NextResponse.json(
      { error: "Error al barrer intenciones expiradas" },
      { status: 500 }
    );
  }
}
