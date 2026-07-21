"use client";

// ============================================================================
// CAMINO · CienRequiem — Sufragio de los 100 Réquiem
// ----------------------------------------------------------------------------
// Cuenta 100 jaculatorias "Dale, Señor, el descanso eterno" con gestos
// táctiles nativos (tap), feedback háptico (vibration API) y visual (anillo +
// cuadrícula de cuentas). Autoguardado incremental; recompensa al completar.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProgressiveAuth } from "@/hooks/useProgressiveAuth";
import { FloatingSaveBanner } from "@/components/FloatingSaveBanner";

const TARGET = 100;
const JACULATORIA = "Dale, Señor, el descanso eterno,\ny brille para ellos la luz perpetua.";

export function CienRequiem() {
  const router = useRouter();
  const { isAnonymous, linkEmail } = useProgressiveAuth();
  const [count, setCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restaurar progreso del día
  useEffect(() => {
    fetch("/api/tasks/today", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return;
        const task = d.tasks.find((t: { kind: string }) => t.kind === "cien_requiem");
        if (task) {
          const c = (task.metadata?.count as number) ?? 0;
          setCount(Math.min(c, TARGET));
          setCompleted(Boolean(task.completed));
        }
      })
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((c: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/tasks/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "cien_requiem",
          title: "100 Réquiem",
          subtitle: "Sufragio por las almas del Purgatorio",
          metadata: { count: c },
        }),
      }).catch(() => {});
    }, 400);
  }, []);

  async function complete() {
    await fetch("/api/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "cien_requiem",
        title: "100 Réquiem",
        subtitle: "Sufragio por las almas del Purgatorio",
        rewardVirtue: "candle",
        rewardAmount: 1,
        metadata: { count: TARGET },
      }),
    });
    setCompleted(true);
  }

  function tap() {
    if (completed || count >= TARGET) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12);
    }
    const next = count + 1;
    setCount(next);
    persist(next);
    if (next >= TARGET) {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([20, 40, 20]);
      }
      void complete();
    }
  }

  const R = 90;
  const C = 2 * Math.PI * R;
  const fraction = Math.min(count / TARGET, 1);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 bg-[#faf9f6] px-5 pb-24 pt-8">
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.push("/comunidad")}
          aria-label="Volver"
          className="grid h-11 w-11 place-items-center rounded-full text-xl text-[#6b6b70]"
        >
          ←
        </button>
        <div>
          <p className="text-[15px] font-semibold">100 Réquiem</p>
          <p className="text-[12px] text-[#6b6b70]">Sufragio por los difuntos</p>
        </div>
      </header>

      <button
        onClick={tap}
        disabled={!ready}
        className="mx-auto grid place-items-center rounded-full active:scale-[0.97]"
        style={{ width: 220, height: 220 }}
        aria-label="Rezar un réquiem"
      >
        <div className="relative grid h-full w-full place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#eae7df" strokeWidth="10" />
            <motion.circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="#5a4a1c"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - fraction) }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          </svg>
          <div className="text-center">
            <div className="text-4xl font-semibold">{count}</div>
            <div className="text-[12px] text-[#6b6b70]">de {TARGET}</div>
          </div>
        </div>
      </button>

      <p className="text-center text-[12px] text-[#b0aca0]">
        {completed ? "Sufragio completado 🕯️ · Toca para repasar" : "Toca el círculo para rezar"}
      </p>

      <div className="rounded-[16px] border border-[#eae7df] bg-white p-5 text-center">
        <p className="text-[16px] leading-relaxed text-[#1c1c1e] whitespace-pre-line">
          {JACULATORIA}
        </p>
      </div>

      {/* Cuadrícula de cuentas (feedback visual de progreso) */}
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: TARGET }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full transition-colors duration-150 ${
              i < count ? "bg-[#5a4a1c]" : "bg-[#eae7df]"
            }`}
          />
        ))}
      </div>

      {completed && (
        <div className="rounded-[16px] bg-[#6f7f5f]/10 p-4 text-center text-[13px] font-medium text-[#4b5740]">
          Encendiste una vela por las almas del Purgatorio. 🕯️
        </div>
      )}

      <FloatingSaveBanner isAnonymous={isAnonymous} onLink={linkEmail} />
    </main>
  );
}
