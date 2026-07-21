"use client";

import { useState, useCallback, useEffect } from "react";
import { usePrayerExperience } from "@/hooks/usePrayerExperience";
import { CommunityTreeSVG } from "@/components/rosario/CommunityTreeSVG";

interface LivePrayerScreenProps {
  profileId: string;
  displayName: string;
  participants: Array<{
    id: string;
    displayName: string;
    seedsFaith?: number;
    seedsHope?: number;
    seedsCharity?: number;
  }>;
  currentStepIndex: number;
  onResponse?: () => void;
}

export function LivePrayerScreen({
  profileId,
  displayName,
  participants,
  currentStepIndex,
  onResponse,
}: LivePrayerScreenProps) {
  const [showIntentions, setShowIntentions] = useState(true);
  const [intentions, setIntentions] = useState<string[]>([
    "Por la paz en mi familia",
    "Por las almas del purgatorio",
    "Por la sanación de mi hermano",
  ]);

  const { triggerPrayer, progress, isResponding, voiceEnabled, isListening, toggleVoice } =
    usePrayerExperience({
      profileId,
      displayName,
      targetCount: 10,
      onComplete: onResponse,
      onSync: () => {
        // TODO: enviar respuesta a Supabase
      },
    });

  useEffect(() => {
    const interval = setInterval(() => {
      setIntentions((prev) => {
        if (prev.length > 0 && Math.random() > 0.7) {
          return [...prev.slice(1), `Intención ${Math.floor(Math.random() * 1000)}`];
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-between bg-[#0f1526] px-6 py-10 text-white">
      <div className="absolute inset-0 opacity-40">
        <CommunityTreeSVG participants={participants} currentUserId={profileId} />
      </div>

      <div className="relative z-10 w-full text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]">
          Oración Perpetua
        </p>
        <h1 className="mt-2 text-[20px] font-semibold">
          Paso {currentStepIndex + 1} de 10
        </h1>
      </div>

      <div className="relative z-10 mt-8 flex flex-col items-center gap-6">
        <div className="relative">
          <div
            className="flex h-56 w-56 items-center justify-center rounded-full border-2 border-[#C6A15B]/40 transition-all duration-300"
            style={{
              boxShadow: isResponding
                ? "0 0 40px rgba(198, 161, 91, 0.4)"
                : "0 0 20px rgba(198, 161, 91, 0.1)",
            }}
          >
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]">
                Ave María
              </p>
              <p className="mt-3 text-[56px] font-semibold leading-none text-[#C6A15B]">
                {Math.floor(progress / 10)}
              </p>
              <p className="mt-2 text-[13px] text-white/40">de 10</p>
            </div>
          </div>

          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 224 224"
          >
            <circle
              cx="112"
              cy="112"
              r="108"
              fill="none"
              stroke="rgba(198, 161, 91, 0.1)"
              strokeWidth="2"
            />
            <circle
              cx="112"
              cy="112"
              r="108"
              fill="none"
              stroke="#C6A15B"
              strokeWidth="2"
              strokeDasharray={`${progress * 6.79} 678`}
              strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 0.3s ease",
              }}
            />
          </svg>
        </div>

        <button
          onClick={triggerPrayer}
          className="h-32 w-32 rounded-full bg-[#C6A15B] text-[#0f1526] transition hover:bg-[#d4b36b] active:scale-95"
        >
          <span className="text-lg font-semibold">🙏</span>
        </button>

        <button
          onClick={toggleVoice}
          className={`rounded-full px-4 py-2 text-xs transition ${
            voiceEnabled
              ? "bg-[#5E81AC] text-white"
              : "bg-white/10 text-white/60"
          }`}
        >
          {voiceEnabled ? "🎤 Voz activa" : "🎤 Activar voz"}
        </button>

        {isListening && (
          <p className="text-[11px] text-white/40">
            Escuchando: "{isListening ? "..." : ""}"
          </p>
        )}
      </div>

      {showIntentions && intentions.length > 0 && (
        <div className="relative z-10 mt-6 w-full max-w-xs">
          <div className="flex flex-col gap-2 opacity-60">
            {intentions.slice(-3).map((intention, i) => (
              <p
                key={i}
                className="text-center text-[12px] italic text-white/70"
                style={{
                  animation: `fadeIn 0.5s ease ${i * 0.2}s both`,
                }}
              >
                "{intention}"
              </p>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
