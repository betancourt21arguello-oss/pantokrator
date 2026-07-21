import { db } from "@/db";
import { intentionsWall } from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

/**
 * Incrementa en 1 la intensidad de la vela activa del perfil (hasta máximo 5)
 * cuando el usuario completa una oración.
 */
export async function bumpIntensityIfActive(
  profileId: string,
  _prayerKind?: string
): Promise<void> {
  const now = new Date();

  await db
    .update(intentionsWall)
    .set({
      intensityLevel: sql`LEAST(${intentionsWall.intensityLevel} + 1, 5)`,
    })
    .where(
      and(
        eq(intentionsWall.userId, profileId),
        gt(intentionsWall.expiresAt, now),
        eq(intentionsWall.transformedToSeed, false)
      )
    );
}
