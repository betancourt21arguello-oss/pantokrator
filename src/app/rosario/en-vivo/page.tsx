"use client";

import { useState, useEffect, useCallback } from "react";
import { useProgressiveAuth } from "@/hooks/useProgressiveAuth";
import { LivePrayerScreen } from "@/components/rosario/LivePrayerScreen";
import { useRosarioSync } from "@/hooks/useRosarioSync";
import { CommunityTreeSVG } from "@/components/rosario/CommunityTreeSVG";
import { BottomNav } from "@/components/BottomNav";
import { FloatingCandle } from "@/components/llama/FloatingCandle";

type MysteryType = "gozosos" | "dolorosos" | "gloriosos" | "luminosos";

interface MysterySet {
  slug: MysteryType;
  label: string;
  title: string;
}

const MYSTERY_SETS: Record<number, MysterySet[]> = {
  0: [{ slug: "gozosos", label: "Misterios Gozosos", title: "La Anunciación del Ángel a María" }],
  1: [{ slug: "dolorosos", label: "Misterios Dolorosos", title: "La Oración en el Huerto" }],
  2: [{ slug: "gloriosos", label: "Misterios Gloriosos", title: "La Resurrección del Señor" }],
  3: [{ slug: "luminosos", label: "Misterios Luminosos", title: "El Bautismo del Señor en el Jordán" }],
  4: [{ slug: "dolorosos", label: "Misterios Dolorosos", title: "La Oración en el Huerto" }],
  5: [{ slug: "gozosos", label: "Misterios Gozosos", title: "La Visitación a Isabel" }],
  6: [{ slug: "gloriosos", label: "Misterios Gloriosos", title: "La Resurrección del Señor" }],
};

function getMysteryForToday(): MysterySet {
  const day = new Date().getDay();
  return MYSTERY_SETS[day]?.[0] ?? MYSTERY_SETS[1][0];
}

export default function RosarioEnVivoPage() {
  const { profile, loading: authLoading } = useProgressiveAuth();
  const mystery = getMysteryForToday();

  const [participants, setParticipants] = useState<Array<{
    id: string;
    displayName: string;
    seedsFaith?: number;
    seedsHope?: number;
    seedsCharity?: number;
  }>>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const profileId = profile?.id || "guest";
  const displayName = profile?.displayName || "Peregrino";

  const handleParticipantsChange = useCallback((newParticipants: Array<{ id: string; displayName: string }>) => {
    setParticipants((prev) =>
      newParticipants.map((p) => ({
        ...p,
        seedsFaith: prev.find((pp) => pp.id === p.id)?.seedsFaith || 0,
        seedsHope: prev.find((pp) => pp.id === p.id)?.seedsHope || 0,
        seedsCharity: prev.find((pp) => pp.id === p.id)?.seedsCharity || 0,
      }))
    );
  }, []);

  const { sendResponse } = useRosarioSync({
    programId: "rosario-misterios-dolorosos",
    profileId,
    displayName,
    onStepChange: setCurrentStepIndex,
    onParticipantsChange: handleParticipantsChange,
  });

  const handlePrayer = useCallback(() => {
    sendResponse();
  }, [sendResponse]);

  if (authLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#0f1526] text-white">
        <p className="text-sm text-white/60">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-between bg-[#0f1526] px-6 py-10 text-white">
      <div className="absolute inset-0 opacity-30">
        <CommunityTreeSVG participants={participants} currentUserId={profileId} />
      </div>

      <div className="relative z-10 w-full text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#C6A15B]">
          Oración Perpetua
        </p>
        <h1 className="mt-2 text-[20px] font-semibold">
          {mystery.label}
        </h1>
        <p className="mt-1 text-[13px] text-white/60">
          Paso {currentStepIndex + 1} de 10
        </p>
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-400" : "bg-yellow-400"}`} />
          <span className="text-[11px] text-white/60">
            {isConnected ? "Conectado" : "Reconectando..."}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8">
        <LivePrayerScreen
          profileId={profileId}
          displayName={displayName}
          participants={participants}
          currentStepIndex={currentStepIndex}
          onResponse={handlePrayer}
        />
      </div>

      <FloatingCandle />
      <BottomNav />
    </main>
  );
}
