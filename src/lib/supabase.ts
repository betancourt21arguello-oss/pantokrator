// ============================================================================
// CAMINO · Cliente Supabase (browser) — abstracción para auth progresiva real
// ----------------------------------------------------------------------------
// En este sandbox la identidad progresiva se resuelve vía API routes + cookie
// de dispositivo (ver src/lib/identity.ts y useProgressiveAuth). Cuando el
// proyecto Supabase esté configurado, este cliente permite conmutar a
// Supabase Auth (signInAnonymously / linkIdentity) sin tocar la UI.
//
// Requiere las variables públicas:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
// ============================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/** Devuelve un cliente Supabase de navegador, o null si no está configurado. */
export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  if (cached) return cached;

  cached = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return cached;
}

/**
 * Inicia sesión anónima en Supabase (cero fricción). No-op si no está
 * configurado; en ese caso la identidad la gestiona la API interna.
 */
export async function ensureAnonymousSupabaseSession(): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    await supabase.auth.signInAnonymously();
  }
}
