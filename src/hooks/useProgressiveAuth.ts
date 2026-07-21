"use client";

// ============================================================================
// CAMINO · Hook de Autenticación Progresiva (frontend)
// ----------------------------------------------------------------------------
// Expone:
//   - profile:      perfil del peregrino (anónimo o vinculado)
//   - isAnonymous:  true mientras no haya email vinculado (la UI debe avisar)
//   - loading:      estado de carga inicial
//   - linkEmail():  vincula un email conservando el progreso
//   - refresh():    recarga el perfil
//
// El usuario se inicializa de forma anónima automáticamente al montar
// (cero fricción). No hay pantalla de login obligatoria.
// ============================================================================

import { useCallback, useEffect, useState } from "react";

export interface CaminoProfile {
  id: string;
  isAnonymous: boolean;
  email: string | null;
  displayName: string | null;
  avatarSeed?: string | null;
  streakDays?: number;
  seedsFaith?: number;
  seedsHope?: number;
  seedsCharity?: number;
  candlesLit?: number;
  prayersCount?: number;
  intentionsCount?: number;
}

interface UseProgressiveAuth {
  profile: CaminoProfile | null;
  isAnonymous: boolean;
  loading: boolean;
  error: string | null;
  linkEmail: (
    email: string,
    displayName?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

export function useProgressiveAuth(): UseProgressiveAuth {
  const [profile, setProfile] = useState<CaminoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (data.ok) {
        setProfile(data.profile as CaminoProfile);
        setError(null);
      } else {
        setError(data.error ?? "No se pudo cargar la sesión.");
      }
    } catch {
      setError("Sin conexión. Reintentando…");
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicialización anónima automática al montar.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const linkEmail = useCallback(
    async (email: string, displayName?: string) => {
      try {
        const res = await fetch("/api/auth/link-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, displayName }),
        });
        const data = await res.json();
        if (data.ok) {
          setProfile((prev) => ({ ...(prev ?? ({} as CaminoProfile)), ...data.profile }));
          return { ok: true as const };
        }
        return { ok: false as const, error: data.error as string };
      } catch {
        return { ok: false as const, error: "No se pudo vincular el email." };
      }
    },
    [],
  );

  return {
    profile,
    isAnonymous: profile?.isAnonymous ?? true,
    loading,
    error,
    linkEmail,
    refresh,
  };
}
