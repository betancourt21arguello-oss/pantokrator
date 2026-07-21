import { NextResponse } from "next/server";
import { getOrCreateProfile } from "@/lib/identity";
import { db } from "@/db";
import { spiritualInventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLiturgicalSeason } from "@/lib/garden/seasons";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getOrCreateProfile();

    let invList = await db
      .select()
      .from(spiritualInventory)
      .where(eq(spiritualInventory.profileId, profile.id))
      .limit(1);

    if (invList.length === 0) {
      // Crear inventario por defecto si no existe
      const [created] = await db
        .insert(spiritualInventory)
        .values({
          profileId: profile.id,
          currentStreak: profile.streakDays || 0,
          longestStreak: profile.streakDays || 0,
        })
        .onConflictDoNothing()
        .returning();

      if (created) {
        invList = [created];
      } else {
        invList = await db
          .select()
          .from(spiritualInventory)
          .where(eq(spiritualInventory.profileId, profile.id))
          .limit(1);
      }
    }

    const inventory = invList[0] || {
      profileId: profile.id,
      seedsRosary: 0,
      seedsMercy: 0,
      seedsJose: 0,
      seedsGuadalupe: 0,
      seedsRequiem: 0,
      seedsJourney: 0,
      waterDrops: 0,
      currentStreak: profile.streakDays || 0,
      longestStreak: profile.streakDays || 0,
      updatedAt: new Date(),
    };

    const season = getLiturgicalSeason();

    return NextResponse.json({
      inventory,
      season,
      avatarSeed: profile.avatarSeed || profile.id,
    });
  } catch (error) {
    console.error("Error al obtener estado del jardín:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado del jardín." },
      { status: 500 }
    );
  }
}
