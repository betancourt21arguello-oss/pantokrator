"use client";

// ============================================================================
// CAMINO · DailyJourney — Jornada Diaria (stepper full-screen tipo historias)
// ----------------------------------------------------------------------------
// 13 pasos exactos, navegación por swipe/tap, transiciones Framer Motion
// ≤ 250ms. Los pasos variables (5,6,7,8,9,10,13) consumen `daily_content`;
// los pasos de oración fija (2,3,4,11,12) son canónicos.
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface DailyContentDTO {
  saintName: string | null;
  saintTitle: string | null;
  dailyPhrase: string | null;
  dailyPhraseRef: string | null;
  firstReading: { ref?: string; text?: string } | null;
  psalm: { ref?: string; response?: string; text?: string } | null;
  secondReading: { ref?: string; text?: string } | null;
  gospel: { ref?: string; text?: string } | null;
  churchGuide: string | null;
  finalPrayer: string | null;
}

const TOTAL_STEPS = 13;
const TRANSITION = { duration: 0.22, ease: "easeOut" as const };

export function DailyJourney() {
  const router = useRouter();
  const [content, setContent] = useState<DailyContentDTO | null>(null);
  const [step, setStep] = useState(0); // 0-indexed, 0..12
  const [direction, setDirection] = useState(1);
  const [reflection, setReflection] = useState("");
  const [silenceLeft, setSilenceLeft] = useState(20);
  const [finishing, setFinishing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/daily-content", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.ok && setContent(d.content))
      .catch(() => {});
  }, []);

  // Temporizador visual del paso 11 (silencio)
  useEffect(() => {
    if (step !== 10) return;
    setSilenceLeft(20);
    const t = setInterval(() => {
      setSilenceLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const exitJourney = useCallback(() => router.push("/"), [router]);

  async function finishJourney() {
    setFinishing(true);
    try {
      await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "jornada",
          title: "Jornada Diaria",
          subtitle: "Completaste tu jornada de hoy.",
          rewardVirtue: "faith",
          rewardAmount: 2,
          metadata: { reflection },
        }),
      });
      setDone(true);
      setTimeout(() => router.push("/"), 1100);
    } finally {
      setFinishing(false);
    }
  }

  const stepBody = useMemo(() => renderStep(step, content, reflection, setReflection, silenceLeft), [
    step,
    content,
    reflection,
    silenceLeft,
  ]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#faf9f6]">
      {/* Línea de avance tipo historias */}
      <div className="flex gap-1 px-4 pt-4">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-[#eae7df]">
            <div
              className="h-full rounded-full bg-[#1c1c1e] transition-all duration-200"
              style={{ width: i < step ? "100%" : i === step ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 pt-3">
        <button
          onClick={exitJourney}
          aria-label="Cerrar jornada"
          className="grid h-11 w-11 place-items-center rounded-full text-xl text-[#6b6b70]"
        >
          ✕
        </button>
        <span className="text-[13px] text-[#b0aca0]">
          {step + 1}/{TOTAL_STEPS}
        </span>
      </div>

      {/* Zonas de navegación (swipe/tap) */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 40 }}
            transition={TRANSITION}
            drag="x"
            dragElastic={0.15}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) goNext();
              else if (info.offset.x > 60 && step > 0) goPrev();
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center"
          >
            {stepBody}
          </motion.div>
        </AnimatePresence>

        {/* Zona invisible de avance (tap central/derecho) */}
        <button
          aria-label="Siguiente paso"
          onClick={goNext}
          className="absolute inset-y-0 right-0 w-2/3"
          style={{ background: "transparent" }}
          tabIndex={-1}
        />
        {/* Zona invisible de retroceso (tap izquierdo) */}
        {step > 0 && (
          <button
            aria-label="Paso anterior"
            onClick={goPrev}
            className="absolute inset-y-0 left-0 w-1/4"
            style={{ background: "transparent" }}
            tabIndex={-1}
          />
        )}
      </div>

      {/* CTA fijo para pasos con acción explícita */}
      {step === 0 && (
        <div className="px-6 pb-8">
          <ActionButton onClick={goNext} label="Comenzar en paz" />
        </div>
      )}
      {step === TOTAL_STEPS - 1 && !done && (
        <div className="px-6 pb-8">
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              finishJourney();
            }}
            label={finishing ? "Guardando…" : "Terminar mi jornada"}
          />
        </div>
      )}
      {done && (
        <div className="px-6 pb-8 text-center text-[15px] font-medium text-[#4b5740]">
          ¡Que la luz de hoy te acompañe! ✝
        </div>
      )}

      <div className="h-1 w-24 self-center rounded-full bg-[#e5e3dd] mb-2" />
    </div>
  );
}

function ActionButton({
  onClick,
  label,
}: {
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className="min-h-[52px] w-full rounded-full bg-[#1c1c1e] text-[15px] font-medium text-white"
    >
      {label}
    </motion.button>
  );
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#b0aca0]">
      {children}
    </p>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-semibold leading-snug text-[#1c1c1e]">{children}</h2>;
}

function StepBody({ children }: { children: React.ReactNode }) {
  return <p className="text-[16px] leading-relaxed text-[#3a3a3c]">{children}</p>;
}

function renderStep(
  step: number,
  content: DailyContentDTO | null,
  reflection: string,
  setReflection: (v: string) => void,
  silenceLeft: number,
) {
  switch (step) {
    case 0:
      return (
        <>
          <StepLabel>Paso 1</StepLabel>
          <StepTitle>Dios te bendiga.</StepTitle>
          <StepBody>
            Hoy caminas con {content?.saintName ?? "un santo"}
            {content?.saintTitle ? `, ${content.saintTitle.toLowerCase()}` : ""}.
          </StepBody>
        </>
      );

    case 1:
      return (
        <>
          <StepTitle>Toma tres respiraciones lentas.</StepTitle>
          <StepBody>Pon este día en las manos de Dios.</StepBody>
          <div className="mt-2 h-24 w-24 animate-breathe rounded-full bg-[#c7d2c1]" />
        </>
      );

    case 2:
      return (
        <>
          <StepLabel>Paso 3</StepLabel>
          <StepTitle>Invocación al Espíritu Santo</StepTitle>
          <StepBody>
            Ven, Espíritu Santo, ven por medio de la poderosa intercesión del
            Inmaculado Corazón de María, tu amadísima Esposa.
          </StepBody>
          <p className="text-[13px] font-medium text-[#c9a24b]">Repite 3 veces</p>
        </>
      );

    case 3:
      return (
        <>
          <StepLabel>Paso 4</StepLabel>
          <StepTitle>Oración al Espíritu Santo</StepTitle>
          <StepBody>
            Oh Espíritu Santo, Amor del Padre y del Hijo, inspírame siempre lo
            que debo pensar, lo que debo decir… Dame acierto al empezar,
            dirección al progreso y perfección al acabar. Amén.
          </StepBody>
        </>
      );

    case 4:
      return (
        <>
          <StepLabel>Una frase para hoy</StepLabel>
          <StepTitle>
            {content?.dailyPhrase ? `"${content.dailyPhrase}"` : "Cargando…"}
          </StepTitle>
          {content?.dailyPhraseRef && (
            <p className="text-[13px] text-[#6b6b70]">{content.dailyPhraseRef}</p>
          )}
        </>
      );

    case 5:
      return (
        <>
          <StepLabel>Primera lectura</StepLabel>
          {content?.firstReading?.ref && (
            <p className="text-[13px] text-[#6b6b70]">{content.firstReading.ref}</p>
          )}
          <StepBody>{content?.firstReading?.text ?? "—"}</StepBody>
        </>
      );

    case 6:
      return (
        <>
          <StepLabel>Salmo del día</StepLabel>
          {content?.psalm?.ref && (
            <p className="text-[13px] text-[#6b6b70]">{content.psalm.ref}</p>
          )}
          {content?.psalm?.response && (
            <p className="text-[15px] font-semibold text-[#4b5740]">
              {content.psalm.response}
            </p>
          )}
          <StepBody>{content?.psalm?.text ?? "—"}</StepBody>
        </>
      );

    case 7:
      return (
        <>
          <StepLabel>Segunda lectura</StepLabel>
          {content?.secondReading?.ref && (
            <p className="text-[13px] text-[#6b6b70]">{content.secondReading.ref}</p>
          )}
          <StepBody>
            {content?.secondReading?.text ?? "Hoy la liturgia no propone segunda lectura."}
          </StepBody>
        </>
      );

    case 8:
      return (
        <>
          <StepLabel>Evangelio de hoy</StepLabel>
          {content?.gospel?.ref && (
            <p className="text-[13px] text-[#6b6b70]">{content.gospel.ref}</p>
          )}
          <StepBody>{content?.gospel?.text ?? "—"}</StepBody>
        </>
      );

    case 9:
      return (
        <>
          <StepLabel>Guía de la Iglesia</StepLabel>
          <StepBody>{content?.churchGuide ?? "—"}</StepBody>
        </>
      );

    case 10: {
      const pct = ((20 - silenceLeft) / 20) * 100;
      return (
        <>
          <StepLabel>Paso 11</StepLabel>
          <StepTitle>Un momento de silencio</StepTitle>
          <StepBody>Descansa en la presencia de Dios.</StepBody>
          <div className="relative mt-2 h-28 w-28">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#eae7df" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#6f7f5f"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - pct / 100)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-2xl font-semibold">
              {silenceLeft}
            </span>
          </div>
        </>
      );
    }

    case 11:
      return (
        <>
          <StepLabel>Paso 12 · Reflexión</StepLabel>
          <StepTitle>¿Cómo dio luz tu vida a alguien hoy?</StepTitle>
          <textarea
            onClick={(e) => e.stopPropagation()}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Escribe aquí (opcional)…"
            rows={4}
            className="mt-2 w-full max-w-sm rounded-[16px] border border-[#e5e3dd] bg-white p-4 text-[15px] outline-none focus:border-[#c9a24b]"
          />
        </>
      );

    case 12:
    default:
      return (
        <>
          <StepLabel>Paso 13</StepLabel>
          <StepTitle>Oración final temática</StepTitle>
          <StepBody>
            {content?.finalPrayer ??
              "Señor, que este día sea un reflejo de tu amor. Amén."}
          </StepBody>
        </>
      );
  }
}
