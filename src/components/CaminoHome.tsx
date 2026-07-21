"use client";

// ============================================================================
// CAMINO · CaminoHome — Vista principal (Minimalismo Sagrado, Apple HIG)
// ----------------------------------------------------------------------------
// Anillo de progreso diario + Tarjeta Hero (frase del día) + Santo del día +
// CTA "Comenzar mi jornada" (enruta exclusivamente a /jornada) + cuadrícula
// de "Momentos de Hoy".
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProgressiveAuth } from "@/hooks/useProgressiveAuth";
import { AnonymousBanner } from "@/components/AnonymousBanner";
import { BottomNav } from "@/components/BottomNav";
import { useLlamaStore } from "@/lib/llama/store";

interface DailyContentDTO {
  liturgicalSeason: string | null;
  saintName: string | null;
  saintTitle: string | null;
  dailyPhrase: string | null;
  dailyPhraseRef: string | null;
}

interface TaskDTO {
  kind: string;
  completed: boolean;
}

const MOMENTS = [
  {
    kind: "laudes",
    title: "Laudes",
    icon: "☀️",
    subtitle: "Alaba a Dios al amanecer",
    reward: "hope" as const,
  },
  {
    kind: "angelus",
    title: "Ángelus",
    icon: "🔔",
    subtitle: "Recuerda la Encarnación",
    reward: "hope" as const,
  },
];

export function CaminoHome() {
  const router = useRouter();
  const { profile, isAnonymous, loading, linkEmail } = useProgressiveAuth();
  const openModal = useLlamaStore((s) => s.openModal);
  const activeIntention = useLlamaStore((s) => s.activeIntention);
  const [content, setContent] = useState<DailyContentDTO | null>(null);
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [shared, setShared] = useState(false);

  const loadAll = useCallback(async () => {
    const [contentRes, tasksRes, countsRes] = await Promise.all([
      fetch("/api/daily-content", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/tasks/today", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/tasks/community-counts", { cache: "no-store" }).then((r) =>
        r.json(),
      ),
    ]);
    if (contentRes.ok) setContent(contentRes.content);
    if (tasksRes.ok) setTasks(tasksRes.tasks);
    if (countsRes.ok) setCounts(countsRes.counts);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const isDone = (kind: string) => tasks.some((t) => t.kind === kind && t.completed);

  const completedCount = useMemo(
    () => ["jornada", "laudes", "angelus"].filter(isDone).length,
    [tasks],
  );
  const progressFraction = completedCount / 3;

  async function completeMoment(m: (typeof MOMENTS)[number]) {
    if (isDone(m.kind)) return;
    await fetch("/api/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: m.kind,
        title: m.title,
        subtitle: m.subtitle,
        rewardVirtue: m.reward,
        rewardAmount: 1,
      }),
    });
    void loadAll();
  }

  async function shareLight() {
    const text = content?.dailyPhrase
      ? `"${content.dailyPhrase}" — ${content.dailyPhraseRef ?? ""}`
      : "CAMINO: la luz de hoy.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "CAMINO", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* usuario canceló el share, no pasa nada */
    }
    setShared(true);
    await fetch("/api/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "share_light",
        title: "Comparte la Luz",
        subtitle: "Llevaste la frase de hoy a alguien.",
        rewardVirtue: "charity",
        rewardAmount: 1,
      }),
    });
    void loadAll();
  }

  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleDateString("es-ES", { month: "long" }).toUpperCase();

  // Anillo de progreso (estilo Apple Activity Ring)
  const R = 46;
  const C = 2 * Math.PI * R;
  const dashOffset = C * (1 - progressFraction);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-[0.28em]">CAMINO</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openModal}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/80 border border-[#1c1c1e]/10 px-2.5 text-sm hover:bg-white transition-colors"
            title={activeIntention ? "Intención activa" : "Ofrecer intención"}
            aria-label="Ofrecer intención"
          >
            <span className={activeIntention ? "animate-pulse" : "opacity-70"}>🕯️</span>
          </button>
          <span className="flex items-center gap-1.5 text-[13px] text-[#6b6b70]">
            <span className="h-2 w-2 rounded-full bg-[#6f7f5f]" />
            {content?.liturgicalSeason ?? "Tiempo Ordinario"}
          </span>
        </div>
      </header>

      {/* Anillo de progreso diario */}
      <div className="flex justify-center py-2">
        <div className="relative grid h-28 w-28 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#eae7df" strokeWidth="6" />
            <motion.circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="#6f7f5f"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </svg>
          <div className="rounded-full bg-white/0 text-center">
            <div className="text-3xl font-semibold leading-none">{day}</div>
            <div className="mt-1 text-[11px] tracking-[0.15em] text-[#6b6b70]">
              {month}
            </div>
          </div>
        </div>
      </div>

      <AnonymousBanner profile={profile} isAnonymous={isAnonymous} onLink={linkEmail} />

      {/* Tarjeta Hero */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden rounded-[16px] bg-[#0f1526] p-6 text-white shadow-[0_16px_40px_rgba(15,21,38,0.25)]"
      >
        <p className="text-lg font-medium leading-snug">
          {content?.dailyPhrase
            ? `"${content.dailyPhrase}"`
            : "Cargando la luz de hoy…"}
        </p>
        {content?.dailyPhraseRef && (
          <p className="mt-3 text-sm text-white/60">{content.dailyPhraseRef}</p>
        )}
      </motion.section>

      {/* Santo del día */}
      <section className="flex items-center gap-3 rounded-[16px] border border-[#eae7df] bg-white p-4">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[#6f7f5f]/15 font-semibold text-[#4b5740]">
          {content?.saintName?.[0] ?? "S"}
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#6b6b70]">
            Santo del día
          </p>
          <p className="text-[15px] font-semibold">
            {content?.saintName ?? "—"}
          </p>
          <p className="text-[13px] text-[#6b6b70]">{content?.saintTitle}</p>
        </div>
      </section>

      {/* CTA — enruta exclusivamente a /jornada */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push("/jornada")}
        className="min-h-[52px] w-full rounded-full bg-[#1c1c1e] text-[15px] font-medium text-white"
      >
        {isDone("jornada") ? "Repetir mi jornada" : "Comenzar mi jornada"}
      </motion.button>

      {/* Momentos de Hoy */}
      <section>
        <p className="text-[11px] uppercase tracking-wide text-[#6b6b70]">
          Momentos de hoy
        </p>
        <p className="mt-0.5 text-[12px] text-[#b0aca0]">
          Entra cuando tu corazón esté listo.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {MOMENTS.map((m) => (
            <motion.button
              key={m.kind}
              whileTap={{ scale: 0.97 }}
              onClick={() => completeMoment(m)}
              className={`rounded-[16px] border p-4 text-left transition-colors ${
                isDone(m.kind)
                  ? "border-[#6f7f5f]/40 bg-[#6f7f5f]/10"
                  : "border-[#eae7df] bg-white"
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <p className="mt-2 text-[14px] font-semibold">{m.title}</p>
              <p className="text-[12px] text-[#6b6b70]">
                {counts[m.kind] ?? 0} personas rezando
              </p>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={shareLight}
          className="mt-3 w-full rounded-[16px] border border-[#eae7df] bg-white p-4 text-left"
        >
          <p className="text-[14px] font-semibold text-[#2f4a7a]">
            Comparte la Luz
          </p>
          <p className="text-[12px] text-[#6b6b70]">
            {shared ? "¡Compartiste la frase de hoy!" : "Lleva la frase de hoy a alguien."}
          </p>
        </motion.button>
      </section>

      <BottomNav />
    </main>
  );
}
