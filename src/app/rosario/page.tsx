"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useProgressiveAuth } from "@/hooks/useProgressiveAuth";
import { BottomNav } from "@/components/BottomNav";
import { FloatingCandle } from "@/components/llama/FloatingCandle";

type MysteryType = "gozosos" | "dolorosos" | "gloriosos" | "luminosos";

interface MysterySet {
  slug: MysteryType;
  label: string;
  title: string;
}

const MYSTERY_SETS: Record<number, MysterySet[]> = {
  0: [{ slug: "gozosos", label: "Misterios Gozosos", title: "La Anunciación del Ángel a María" }], // Domingo
  1: [{ slug: "dolorosos", label: "Misterios Dolorosos", title: "La Oración en el Huerto" }], // Lunes
  2: [{ slug: "gloriosos", label: "Misterios Gloriosos", title: "La Resurrección del Señor" }], // Martes
  3: [{ slug: "luminosos", label: "Misterios Luminosos", title: "El Bautismo del Señor en el Jordán" }], // Miércoles
  4: [{ slug: "dolorosos", label: "Misterios Dolorosos", title: "La Oración en el Huerto" }], // Jueves
  5: [{ slug: "gozosos", label: "Misterios Gozosos", title: "La Visitación a Isabel" }], // Viernes
  6: [{ slug: "gloriosos", label: "Misterios Gloriosos", title: "La Resurrección del Señor" }], // Sábado
};

function getMysteryForToday(): MysterySet {
  const day = new Date().getDay();
  return MYSTERY_SETS[day]?.[0] ?? MYSTERY_SETS[1][0];
}

interface ContemplationWall {
  rosariosHoy: number;
  paisesActivos: number;
  avemariasCompletadas: number;
}

function useContemplationWall(): ContemplationWall {
  return useMemo(
    () => ({
      rosariosHoy: 0,
      paisesActivos: 0,
      avemariasCompletadas: 0,
    }),
    [],
  );
}

export default function RosarioHomePage() {
  const { profile, loading: authLoading } = useProgressiveAuth();
  const mystery = getMysteryForToday();
  const wall = useContemplationWall();

  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const handlePrimaryAction = useCallback(async () => {
    setIsJoining(true);
    try {
      if (hasActiveSession) {
        window.location.href = "/rosario/en-vivo";
      } else {
        window.location.href = "/rosario/en-vivo";
      }
    } finally {
      setIsJoining(false);
    }
  }, [hasActiveSession]);

  if (authLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#0f1526] text-white">
        <p className="text-sm text-white/60">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center bg-[#0f1526] px-6 pb-28 pt-14 text-white">
      {showToast && (
        <div className="fixed left-4 right-4 top-4 z-50 rounded-2xl border border-[#C6A15B]/20 bg-[#1a1f2e] p-4 shadow-2xl">
          <p className="text-center text-sm text-[#C6A15B]">
            Tu hoja ya forma parte del Árbol de la Oración.
          </p>
        </div>
      )}

      <header className="w-full text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[#C6A15B]">
          Oración Perpetua
        </p>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight">
          Rosario Mundial Vivo
        </h1>
        <p className="mt-2 text-[15px] text-white/60">{mystery.label}</p>
      </header>

      <div className="relative mt-10 h-64 w-64">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-48 w-48 rounded-full border border-[#C6A15B]/30 bg-white/[0.03]">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]">
                Ave María
              </p>
              <p className="mt-2 text-[56px] font-semibold leading-none text-[#C6A15B]">
                0
              </p>
              <p className="mt-1 text-[13px] text-white/40">de 10</p>
            </div>

            {Array.from({ length: 10 }).map((_, i) => {
              const angle = i * 36;
              const rad = (angle * Math.PI) / 180;
              const r = 96;
              const x = 96 + r * Math.cos(rad);
              const y = 96 + r * Math.sin(rad);
              return (
                <div
                  key={i}
                  className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C6A15B]/40"
                  style={{ left: `${x}px`, top: `${y}px` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-[13px] text-white/60">
        0 personas rezando ahora mismo
      </p>

      <div className="mt-8 w-full text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#C6A15B]">
          1.º Misterio
        </p>
        <h2 className="mt-2 text-[22px] font-semibold">{mystery.title}</h2>
        <p className="mt-1 text-[14px] text-white/60">{mystery.title}</p>
      </div>

      <p className="mt-6 text-center text-[14px] leading-relaxed text-white/50">
        Una oración que nunca se apaga. Entra donde esté la comunidad y
        continúa con ella.
      </p>

      <button
        onClick={handlePrimaryAction}
        disabled={isJoining}
        className="mt-8 w-full rounded-full bg-[#C6A15B] py-4 text-center text-[16px] font-semibold text-[#0f1526] transition hover:bg-[#d4b36b] active:scale-[0.98] disabled:opacity-60"
      >
        {hasActiveSession ? "Unirme al Rosario en curso" : "Iniciar rosario en vivo"}
      </button>

      <p className="mt-3 text-center text-[12px] text-white/40">
        Comenzamos los misterios de este día.
      </p>

      <div className="mt-8 w-full rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-5">
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]">
          Muro de Contemplación
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-[28px] font-semibold text-[#C6A15B]">
              {wall.rosariosHoy}
            </p>
            <p className="mt-1 text-[11px] text-white/50">Rosarios hoy</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex-1 text-center">
            <p className="text-[28px] font-semibold text-[#C6A15B]">
              {wall.paisesActivos}
            </p>
            <p className="mt-1 text-[11px] text-white/50">Usuarios</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex-1 text-center">
            <p className="text-[28px] font-semibold text-[#C6A15B]">
              {wall.avemariasCompletadas}
            </p>
            <p className="mt-1 text-[11px] text-white/50">Avemarías</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          window.location.href = "/rosario/a-solas";
        }}
        className="mt-6 text-center text-[13px] text-white/40 transition hover:text-white/60"
      >
        Rezar el Rosario a solas
      </button>

      <FloatingCandle />
      <BottomNav />
    </main>
  );
}
