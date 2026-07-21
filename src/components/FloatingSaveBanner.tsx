"use client";

// Banner flotante para pantallas devocionales (Novenas, 100 Réquiem).
// Recuerda al usuario anónimo que cree cuenta para no perder sus sufragios.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isAnonymous: boolean;
  onLink: (
    email: string,
    displayName?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export function FloatingSaveBanner({ isAnonymous, onLink }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (!isAnonymous || dismissed) return null;

  async function submit() {
    setError(null);
    setBusy(true);
    const res = await onLink(email);
    setBusy(false);
    if (res.ok) setOpen(false);
    else setError(res.error ?? "No se pudo vincular.");
  }

  return (
    <>
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-x-4 z-30 flex items-center justify-between gap-3 rounded-[16px] border border-[#e6dcc0] bg-[#f4ecd8] px-4 py-3 shadow-lg"
        style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
      >
        <p className="text-[12.5px] leading-snug text-[#5a4a1c]">
          Crea tu cuenta gratis para guardar tus sufragios.
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setOpen(true)}
            className="min-h-[36px] rounded-full bg-[#1c1c1e] px-4 text-[12.5px] font-medium text-white"
          >
            Crear cuenta
          </button>
          <button
            aria-label="Cerrar"
            onClick={() => setDismissed(true)}
            className="grid h-9 w-9 place-items-center text-[#8a6d1f]/60"
          >
            ✕
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            onClick={() => !busy && setOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold">Guarda tus sufragios</h2>
              <p className="mt-1 text-sm text-[#6b6b70]">
                Vincula tu email para conservar el progreso de tus novenas y
                oraciones por los difuntos.
              </p>
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="mt-4 min-h-[44px] w-full rounded-[16px] border border-[#e5e3dd] bg-[#faf9f6] px-4 text-base outline-none focus:border-[#c9a24b]"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  disabled={busy}
                  className="min-h-[44px] flex-1 rounded-full border border-[#e5e3dd] text-sm font-medium"
                >
                  Ahora no
                </button>
                <button
                  onClick={submit}
                  disabled={busy || !email}
                  className="min-h-[44px] flex-1 rounded-full bg-[#1c1c1e] text-sm font-medium text-white disabled:opacity-50"
                >
                  {busy ? "Guardando…" : "Vincular"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
