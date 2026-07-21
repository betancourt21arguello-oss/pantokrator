// ============================================================================
// CAMINO · Consumidor de eventos (emulación local del Worker de Cloudflare
// Queues). Recibe un batch de eventos y hace un único Bulk Insert en
// Supabase vía Drizzle. En producción este handler vive en el Worker
// consumidor (`queue()` handler de Hono) y se invoca automáticamente por
// Cloudflare cuando el batch alcanza `max_batch_size` o `max_batch_timeout`.
// ============================================================================

import { recordEventsBatch } from "@/lib/metrics";
import type { NewMetricEvent } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      events?: NewMetricEvent[];
    };
    const events = Array.isArray(body.events) ? body.events : [];

    const result = await recordEventsBatch(events);
    return Response.json({ ok: true, processed: result.inserted });
  } catch (err) {
    console.error("[queues/consume] batch insert failed:", err);
    return Response.json(
      { ok: false, error: "Fallo al procesar el batch." },
      { status: 500 },
    );
  }
}
