import { db } from "@/db";
import { intentionsWall } from "@/db/schema";
import { and, eq, lt } from "drizzle-orm";

/**
 * Recorre todas las intenciones expiradas que no han sido transformadas en semillas
 * y las marca como transformedToSeed = true.
 * El trigger de base de datos fn_expire_intention_to_seed se encarga de incrementar
 * las semillas de Jornada en el inventario espiritual del usuario.
 */
export async function sweepExpiredIntentions(): Promise<{ updatedCount: number }> {
  const now = new Date();
  
  const updated = await db
    .update(intentionsWall)
    .set({
      transformedToSeed: true,
    })
    .where(
      and(
        lt(intentionsWall.expiresAt, now),
        eq(intentionsWall.transformedToSeed, false)
      )
    )
    .returning({ id: intentionsWall.id });

  return { updatedCount: updated.length };
}
