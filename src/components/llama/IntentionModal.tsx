"use client";

import { useState, useEffect, useRef, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLlamaStore } from "@/lib/llama/store";

export function IntentionModal() {
  const isOpen = useLlamaStore((s) => s.isModalOpen);
  const closeModal = useLlamaStore((s) => s.closeModal);
  const lightCandle = useLlamaStore((s) => s.lightCandle);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLitAnimation, setIsLitAnimation] = useState(false);

  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContent("");
      setInfoMessage(null);
      setIsLitAnimation(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Cierre con Escape y trampilla de foco accesible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 40 || loading) return;

    setLoading(true);
    setInfoMessage(null);

    try {
      const res = await fetch("/api/llama/light", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (res.status === 409 && data.activeIntention) {
        lightCandle(data.activeIntention);
        const expires = new Date(data.activeIntention.expiresAt);
        const formattedTime = expires.toLocaleTimeString("es", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setInfoMessage(`Ya tienes una vela encendida. Vivirá hasta las ${formattedTime}.`);
        setTimeout(() => {
          closeModal();
        }, 2200);
        return;
      }

      if (!res.ok) {
        setInfoMessage(data.error || "No se pudo encender la vela.");
        return;
      }

      if (data.activeIntention) {
        setIsLitAnimation(true);
        lightCandle(data.activeIntention);

        setTimeout(() => {
          closeModal();
        }, 1200);
      }
    } catch {
      setInfoMessage("Ocurrió un error al ofrecer tu intención.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        aria-modal="true"
        role="dialog"
        aria-labelledby={titleId}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm rounded-2xl bg-[#f7f5f0] p-6 shadow-xl text-[#1c1c1e] relative overflow-hidden"
        >
          {isLitAnimation ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="text-5xl mb-3 animate-pulse">🕯️</div>
              <p className="text-base font-serif text-[#1c1c1e]">
                Tu vela ha sido encendida en la comunidad.
              </p>
              <p className="text-xs text-[#6e6e73] mt-1">
                Acompañará tu oración durante las próximas horas.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 id={titleId} className="text-lg font-serif text-[#1c1c1e]">
                  Ofrecer intención
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sm text-[#6e6e73] hover:text-[#1c1c1e] transition-colors"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-[#6e6e73] mb-4">
                Hoy rezas por una persona o intención especial.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={40}
                    placeholder="¿Por quién rezas hoy?"
                    className="w-full h-12 px-4 rounded-xl bg-white border border-[#1c1c1e]/10 text-[#1c1c1e] placeholder-[#6e6e73]/60 focus:outline-hidden focus:border-[#7c2d12] text-sm transition-colors"
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-[#6e6e73]">
                    {content.length}/40
                  </div>
                </div>

                {infoMessage && (
                  <p className="text-xs text-[#7c2d12] text-center font-medium">
                    {infoMessage}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!content.trim() || content.length > 40 || loading}
                    className="w-full h-12 rounded-xl bg-[#7c2d12] text-[#f7f5f0] text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="animate-spin text-base">🕯️</span>
                    ) : (
                      <>
                        <span>🕯️</span>
                        <span>Encender vela</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
