"use client";

// ============================================================================
// CAMINO · DevotionsHub — Gestor de Novenas (Comunidad / Devociones)
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProgressiveAuth } from "@/hooks/useProgressiveAuth";
import { FloatingSaveBanner } from "@/components/FloatingSaveBanner";
import { BottomNav } from "@/components/BottomNav";

interface NovenaCatalogDTO {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  patron: string | null;
  accentColor: string | null;
  totalDays: number;
  isFeatured: boolean;
}

interface DayEntry {
  day: number;
  title: string;
  meditation?: string;
  prayer: string;
}

interface UserNovenaDTO {
  id: string;
  novenaId: string;
  currentDay: number;
  completedDays: number[];
  completed: boolean;
  intention: string | null;
  title: string;
  subtitle: string | null;
  accentColor: string | null;
  totalDays: number;
  days: DayEntry[];
}

export function DevotionsHub() {
  const router = useRouter();
  const { isAnonymous, linkEmail } = useProgressiveAuth();
  const [catalog, setCatalog] = useState<NovenaCatalogDTO[]>([]);
  const [mine, setMine] = useState<UserNovenaDTO[]>([]);
  const [praying, setPraying] = useState<UserNovenaDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const [c, m] = await Promise.all([
      fetch("/api/novenas", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/novenas/mine", { cache: "no-store" }).then((r) => r.json()),
    ]);
    if (c.ok) setCatalog(c.novenas);
    if (m.ok) setMine(m.novenas);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function joinNovena(novenaId: string) {
    await fetch("/api/novenas/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novenaId }),
    });
    void loadAll();
  }

  async function completeDay(userNovenaId: string, day: number) {
    await fetch("/api/novenas/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userNovenaId, day }),
    });
    setPraying(null);
    void loadAll();
  }

  const joinedIds = new Set(mine.map((n) => n.novenaId));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-[0.28em]">COMUNIDAD</span>
        <button
          onClick={() => router.push("/comunidad/cien-requiem")}
          className="rounded-full border border-[#eae7df] px-3 py-1.5 text-[12px] font-medium text-[#2f4a7a]"
        >
          100 Réquiem →
        </button>
      </header>

      {/* Mis novenas en curso */}
      {mine.length > 0 && (
        <section>
          <p className="text-[11px] uppercase tracking-wide text-[#6b6b70]">
            Mis novenas en curso
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {mine.map((n) => (
              <div
                key={n.id}
                className="rounded-[16px] border border-[#eae7df] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-semibold">{n.title}</p>
                  <span className="text-[12px] text-[#6b6b70]">
                    Día {n.currentDay}/{n.totalDays}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#eae7df]">
                  <div
                    className="h-full rounded-full bg-[#6f7f5f]"
                    style={{
                      width: `${(n.completedDays.length / n.totalDays) * 100}%`,
                    }}
                  />
                </div>
                {!n.completed ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPraying(n)}
                    className="mt-3 min-h-[44px] w-full rounded-full bg-[#1c1c1e] text-[14px] font-medium text-white"
                  >
                    Rezar Día {n.currentDay}
                  </motion.button>
                ) : (
                  <p className="mt-3 text-center text-[13px] font-medium text-[#4b5740]">
                    Novena completada 🙏
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Catálogo */}
      <section>
        <p className="text-[11px] uppercase tracking-wide text-[#6b6b70]">
          Novenas disponibles
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {loading && (
            <p className="text-center text-[13px] text-[#b0aca0]">Cargando…</p>
          )}
          {catalog.map((n) => (
            <div
              key={n.id}
              className="overflow-hidden rounded-[16px] border border-[#eae7df] bg-white"
            >
              <div
                className="h-2 w-full"
                style={{ background: n.accentColor ?? "#6f7f5f" }}
              />
              <div className="p-4">
                <p className="text-[14px] font-semibold">{n.title}</p>
                <p className="mt-0.5 text-[13px] text-[#6b6b70]">{n.subtitle}</p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={joinedIds.has(n.id)}
                  onClick={() => joinNovena(n.id)}
                  className="mt-3 min-h-[40px] rounded-full border border-[#1c1c1e]/10 bg-[#faf9f6] px-4 text-[13px] font-medium text-[#1c1c1e] disabled:opacity-40"
                >
                  {joinedIds.has(n.id) ? "Ya la iniciaste" : "Comenzar novena"}
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FloatingSaveBanner isAnonymous={isAnonymous} onLink={linkEmail} />
      <BottomNav />

      {/* Modal de oración del día */}
      <AnimatePresence>
        {praying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setPraying(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.22 }}
              className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-[24px] bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const dayData =
                  praying.days.find((d) => d.day === praying.currentDay) ??
                  praying.days[0];
                return (
                  <>
                    <p className="text-[11px] uppercase tracking-wide text-[#6b6b70]">
                      {praying.title} · Día {praying.currentDay}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      {dayData?.title}
                    </h2>
                    {dayData?.meditation && (
                      <p className="mt-3 text-[14px] italic text-[#6b6b70]">
                        {dayData.meditation}
                      </p>
                    )}
                    <p className="mt-4 text-[16px] leading-relaxed text-[#1c1c1e]">
                      {dayData?.prayer}
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => completeDay(praying.id, praying.currentDay)}
                      className="mt-6 min-h-[48px] w-full rounded-full bg-[#1c1c1e] text-[15px] font-medium text-white"
                    >
                      Terminé de rezar
                    </motion.button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
