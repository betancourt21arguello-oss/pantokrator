// ============================================================================
// CAMINO · Identidad progresiva (servidor)
// ----------------------------------------------------------------------------
// Estrategia de autenticación de CERO FRICCIÓN:
//   1. El peregrino entra sin registrarse -> se crea un perfil anónimo.
//   2. La identidad anónima se ancla a un `deviceId` guardado en cookie
//      httpOnly, de modo que la sesión sobrevive recargas.
//   3. Cuando el usuario "vincula email", el mismo perfil pasa a
//      is_anonymous = false conservando racha, jardín y virtudes.
//
// En producción esta capa se sustituye/complementa por Supabase Auth
// (signInAnonymously + linkIdentity). El contrato de datos es idéntico.
// ============================================================================

import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, type Profile } from "@/db/schema";
import {
  spiritualInventory,
  type NewSpiritualInventory,
} from "@/db/schema";

const DEVICE_COOKIE = "camino_device_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 años

function newDeviceId(): string {
  return `dev_${randomUUID()}`;
}

/**
 * Devuelve el perfil del peregrino asociado a la cookie de dispositivo.
 * Si no existe, crea uno anónimo. Idempotente por deviceId.
 */
export async function getOrCreateProfile(): Promise<Profile> {
  const cookieStore = await cookies();
  let deviceId = cookieStore.get(DEVICE_COOKIE)?.value;

  // 1) ¿Ya hay un perfil para este dispositivo?
  if (deviceId) {
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.deviceId, deviceId))
      .limit(1);
    if (existing.length > 0) return existing[0];
  }

  // 2) No hay dispositivo o no hay perfil -> crear anónimo.
  if (!deviceId) deviceId = newDeviceId();

  const created = await db.transaction(async (tx) => {
    const [profile] = await tx
      .insert(profiles)
      .values({
        deviceId,
        isAnonymous: true,
        displayName: "Peregrino",
        avatarSeed: randomUUID().slice(0, 8),
      })
      .returning();

    const inventory: NewSpiritualInventory = {
      profileId: profile.id,
    };

    await tx.insert(spiritualInventory).values(inventory).onConflictDoNothing();

    return profile;
  });

  // Persistir la cookie (httpOnly evita manipulación desde JS del cliente).
  cookieStore.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return created;
}

/**
 * Vincula un email al perfil anónimo actual, conservando todo el progreso.
 * En producción, aquí se invocaría Supabase Auth `linkIdentity` / OTP.
 */
export async function linkEmailToProfile(
  email: string,
  displayName?: string,
): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(normalized)) {
    return { ok: false, error: "Email no válido." };
  }

  const profile = await getOrCreateProfile();

  // ¿El email ya está en uso por otro perfil?
  const clash = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, normalized))
    .limit(1);
  if (clash.length > 0 && clash[0].id !== profile.id) {
    return { ok: false, error: "Ese email ya está vinculado a otra cuenta." };
  }

  const [updated] = await db
    .update(profiles)
    .set({
      email: normalized,
      isAnonymous: false,
      displayName: displayName?.trim() || profile.displayName || "Peregrino",
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profile.id))
    .returning();

  return { ok: true, profile: updated };
}

export { DEVICE_COOKIE };
