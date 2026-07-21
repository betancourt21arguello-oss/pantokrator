"use client";

// Banner persistente de advertencia de cuenta anónima + modal para vincular
// email. Cumple el requisito UX: recordar constantemente al usuario que
// vincule su cuenta para no perder progreso (Racha, Jardín, Virtudes).

import { useState } from "react";
import type { CaminoProfile } from "@/hooks/useProgressiveAuth";

interface Props {
  profile: CaminoProfile | null;
  isAnonymous: boolean;
  onLink: (
    email: string,
    displayName?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export function AnonymousBanner({ profile, isAnonymous, onLink }: Props) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!isAnonymous) {
    return (
      <div className="rounded-[16px] border border-[#6f7f5f]/25 bg-[#6f7f5f]/10 px-4 py-3 text-sm text-[#4b5740]">
        Cuenta vinculada como{" "}
        <span className="font-semibold">
          {profile?.email ?? profile?.displayName}
        </span>
        . Tu progreso está a salvo.
      </div>
    );
  }

  if (dismissed && !open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-[16px] border border-[#c9a24b]/40 bg-[#c9a24b]/10 px-4 py-2.5 text-sm font-medium text-[#8a6d1f]"
      >
        Vincular tu cuenta para no perder tu progreso →
      </button>
    );
  }

  async function submit() {
    setError(null);
    setBusy(true);
    const res = await onLink(email, name || undefined);
    setBusy(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => setOpen(false), 900);
    } else {
      setError(res.error ?? "No se pudo vincular el email.");
    }
  }

  return (
    <>
      {/* Aviso persistente */}
      <div className="relative rounded-[16px] border border-[#e6dcc0] bg-[#f4ecd8] px-4 py-4 text-center">
        <button
          aria-label="Ocultar aviso"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-[#8a6d1f]/60"
        >
          ✕
        </button>
        <p className="m-0 text-sm font-semibold text-[#5a4a1c]">
          ¡Aviso! Cuenta Anónima
        </p>
        <p className="mx-auto mt-1 max-w-xs text-[13px] leading-snug text-[#7a6631]">
          Vincula tu cuenta para no perder este progreso (Racha, Jardín,
          Virtudes).
        </p>
        <button
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1c1c1e] px-6 text-sm font-medium text-white active:scale-[0.98]"
        >
          Vincular Email
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#6f7f5f]/15 text-2xl">
                  ✓
                </div>
                <p className="text-base font-semibold">¡Cuenta vinculada!</p>
                <p className="mt-1 text-sm text-[#6b6b70]">
                  Tu camino está a salvo.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold">Vincula tu email</h2>
                <p className="mt-1 text-sm text-[#6b6b70]">
                  Conserva tu racha, tu Jardín del Alma y tus virtudes en
                  cualquier dispositivo.
                </p>

                <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-[#6b6b70]">
                  Nombre (opcional)
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Peregrino"
                  className="mt-1 min-h-[44px] w-full rounded-[16px] border border-[#e5e3dd] bg-[#faf9f6] px-4 text-base outline-none focus:border-[#c9a24b]"
                />

                <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-[#6b6b70]">
                  Email
                </label>
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="mt-1 min-h-[44px] w-full rounded-[16px] border border-[#e5e3dd] bg-[#faf9f6] px-4 text-base outline-none focus:border-[#c9a24b]"
                />

                {error && (
                  <p className="mt-3 text-sm text-red-600">{error}</p>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    disabled={busy}
                    className="min-h-[44px] flex-1 rounded-full border border-[#e5e3dd] text-sm font-medium text-[#1c1c1e]"
                  >
                    Ahora no
                  </button>
                  <button
                    onClick={submit}
                    disabled={busy || !email}
                    className="min-h-[44px] flex-1 rounded-full bg-[#1c1c1e] text-sm font-medium text-white disabled:opacity-50 active:scale-[0.98]"
                  >
                    {busy ? "Vinculando…" : "Vincular"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
