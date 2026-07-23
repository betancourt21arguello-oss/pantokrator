"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLlamaStore } from "@/lib/llama/store";

function formatRemainingTime(expiresAtIso: string): string {
  const expires = new Date(expiresAtIso).getTime();
  const now = new Date().getTime();
  const diffMs = expires - now;

  if (diffMs <= 0) return "Expirando...";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

export function FloatingCandle() {
  const activeIntention = useLlamaStore((s) => s.activeIntention);
  const [showPopover, setShowPopover] = useState(false);
  const [remainingText, setRemainingText] = useState("");

  useEffect(() => {
    if (!activeIntention) return;

    setRemainingText(formatRemainingTime(activeIntention.expiresAt));
    const interval = setInterval(() => {
      setRemainingText(formatRemainingTime(activeIntention.expiresAt));
    }, 30000);

    return () => clearInterval(interval);
  }, [activeIntention]);

  if (!activeIntention) return null;

  // Escala según intensidad (1..5)
  const scaleByIntensity = 0.9 + (activeIntention.intensityLevel - 1) * 0.06;

  return (
    <div className="fixed bottom-[88px] right-4 z-40 flex flex-col items-end">
      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="mb-2 w-64 rounded-2xl bg-[#f7f5f0] p-4 shadow-xl border border-[#1c1c1e]/10 text-[#1c1c1e]"
          >
            <div className="flex items-center justify-between border-b border-[#1c1c1e]/10 pb-2 mb-2">
              <span className="text-xs font-serif font-medium text-[#7c2d12] flex items-center gap-1">
                <span>🕯️</span> Intención viva
              </span>
              <button
                type="button"
                onClick={() => setShowPopover(false)}
                className="text-xs text-[#6e6e73] hover:text-[#1c1c1e] p-1"
                aria-label="Cerrar detalle"
              >
                ✕
              </button>
            </div>

            <p className="text-sm font-medium italic text-[#1c1c1e] mb-2 break-words">
              &ldquo;{activeIntention.content}&rdquo;
            </p>

            <div className="flex items-center justify-between text-xs text-[#6e6e73]">
              <span>Permanecerá: {remainingText}</span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: activeIntention.intensityLevel }).map((_, i) => (
                  <span key={i} className="text-[10px]">🕯️</span>
                ))}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setShowPopover((prev) => !prev)}
        style={{ transform: `scale(${scaleByIntensity})` }}
        whileTap={{ scale: 0.9 }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md border border-[#1c1c1e]/10 backdrop-blur-xs transition-shadow hover:shadow-lg"
        aria-label="Ver intención activa"
      >
        <span className="text-xl animate-[pulse_2s_infinite]">🕯️</span>
      </motion.button>
    </div>
  );
}
