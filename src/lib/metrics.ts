// ============================================================================
// CAMINO · Escritura diferida (servidor)
// ----------------------------------------------------------------------------
// En producción: Hono -> Cloudflare Queue (`CAMINO_QUEUE.send`) -> Worker
// consumidor -> batch insert. Aquí exponemos la MISMA función que usará el
// endpoint /api/queues/consume, para que la semántica de "batch insert" sea
// idéntica en ambos entornos y la migración sea un simple cambio de
// transporte (HTTP directo -> cola).
// ============================================================================

import "server-only";
import { db } from "@/db";
import { metricEvents, type NewMetricEvent } from "@/db/schema";

export async function recordEventsBatch(events: NewMetricEvent[]) {
  if (events.length === 0) return { inserted: 0 };
  await db.insert(metricEvents).values(events);
  return { inserted: events.length };
}

/** Encola (aquí: procesa in-process) un único evento de métrica. */
export async function enqueueMetricEvent(event: NewMetricEvent) {
  return recordEventsBatch([event]);
}
