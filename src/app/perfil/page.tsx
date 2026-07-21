"use client";

// CAMINO · Mi Perfil / SoulGarden — el jardín procedural del alma.

import { useEffect, useState } from "react";
import { useProgressiveAuth } from "@/hooks/useProgressiveAuth";
import { AnonymousBanner } from "@/components/AnonymousBanner";
import { BottomNav } from "@/components/BottomNav";
import { SoulGarden } from "@/components/SoulGarden";

const VIRTUES = [
  { key: "seedsFaith", label: "FE", emoji: "🌱", bg: "bg-[#eef3ea]" },
  { key: "seedsCharity", label: "CARIDAD", emoji: "🌸", bg: "bg-[#fbeef2]" },
  { key: "seedsHope", label: "ESPERANZA", emoji: "🍃", bg: "bg-[#eaf2ee]" },
  { key: "candlesLit", label: "VELAS", emoji: "🕯️", bg: "bg-[#f7f0e2]" },
] as const;

export default function PerfilPage() {
  const { profile, isAnonymous, loading, linkEmail } = useProgressiveAuth();
  const [reflection, setReflection] = useState<string | null>(null);

  // Oratorio personal: última reflexión guardada en la jornada de hoy.
  useEffect(() => {
    fetch("/api/tasks/today", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return;
        const jornada = d.tasks.find(
          (t: { kind: string }) => t.kind === "jornada",
        );
        const r = jornada?.metadata?.reflection;
        if (typeof r === "string" && r.trim()) setReflection(r);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-[0.28em]">
          MI PERFIL
        </span>
        <span className="text-[12px] text-[#b0aca0]">SoulGarden</span>
      </header>

      <AnonymousBanner
        profile={profile}
        isAnonymous={isAnonymous}
        onLink={linkEmail}
      />

      {/* Jardín del Alma procedural */}
      {!loading && profile ? (
        <SoulGarden />
      ) : (
        <div className="grid h-[340px] place-items-center rounded-[16px] border border-[#eae7df] bg-[#fdfcf9] text-[13px] text-[#b0aca0]">
          Cultivando tu jardín…
        </div>
      )}

      {/* Métricas rápidas */}
      <section className="grid grid-cols-4 gap-2">
        {[
          { label: "DÍAS", value: profile?.streakDays ?? 0, suffix: "🌱" },
          { label: "ORACIONES", value: profile?.prayersCount ?? 0 },
          { label: "INTENCIONES", value: profile?.intentionsCount ?? 0 },
          { label: "VELAS", value: profile?.candlesLit ?? 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[16px] border border-[#eae7df] bg-white py-3 text-center"
          >
            <div className="text-lg font-semibold">
              {loading ? "—" : s.value}
              {s.suffix && (s.value as number) > 0 ? (
                <span className="text-[12px]"> {s.suffix}</span>
              ) : null}
            </div>
            <div className="text-[9px] tracking-wide text-[#6b6b70]">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* Virtudes acumuladas */}
      <section className="rounded-[16px] border border-[#eae7df] bg-white p-4">
        <p className="text-[11px] uppercase tracking-wide text-[#6b6b70]">
          Virtudes acumuladas
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {VIRTUES.map((v) => (
            <div
              key={v.key}
              className={`rounded-[16px] ${v.bg} py-3 text-center`}
            >
              <div className="text-xl">{v.emoji}</div>
              <div className="mt-1 text-lg font-semibold">
                {loading
                  ? "—"
                  : ((profile?.[v.key as keyof typeof profile] as number) ?? 0)}
              </div>
              <div className="text-[9px] tracking-wide text-[#6b6b70]">
                {v.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Oratorio personal */}
      <section className="rounded-[16px] border border-[#eae7df] bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wide text-[#6b6b70]">
            Oratorio personal
          </p>
          <span className="text-[11px] text-[#8f2d2d]">● Tu reflexión</span>
        </div>
        <div className="mt-3 min-h-[72px] rounded-[16px] bg-[#faf9f6] p-4 text-[14px] leading-relaxed text-[#3a3a3c]">
          {reflection ? (
            <>
              <p className="italic">“{reflection}”</p>
              <p className="mt-2 text-[11px] text-[#b0aca0]">
                Reflexión de tu jornada de hoy
              </p>
            </>
          ) : (
            <p className="text-[#b0aca0]">
              Tus notas aparecerán aquí. Escribe tu primera reflexión al
              terminar la jornada.
            </p>
          )}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
