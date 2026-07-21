"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Participant {
  id: string;
  displayName: string;
  isResponding: boolean;
  countryCode?: string;
}

interface UseRosarioSyncOptions {
  programId: string;
  profileId: string;
  displayName: string;
  onStepChange?: (stepIndex: number) => void;
  onParticipantsChange?: (participants: Participant[]) => void;
}

interface UseRosarioSyncReturn {
  participants: Participant[];
  currentStepIndex: number;
  isConnected: boolean;
  sendResponse: () => void;
  sendChatMessage: (text: string) => void;
}

const HEARTBEAT_INTERVAL = 25_000;

export function useRosarioSync({
  programId,
  profileId,
  displayName,
  onStepChange,
  onParticipantsChange,
}: UseRosarioSyncOptions): UseRosarioSyncReturn {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = getSupabaseBrowser();

  const sendHeartbeat = useCallback(async () => {
    if (!supabase) return;
    try {
      await fetch("/api/rosario/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, displayName }),
      });
    } catch {
      // Silenciar errores de heartbeat
    }
  }, [supabase, profileId, displayName]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel(`rosario:${programId}`, {
      config: { presence: { key: profileId } },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: Participant[] = [];
        Object.values(state).forEach((entries: unknown) => {
          const list = entries as Participant[];
          users.push(...list);
        });
        setParticipants(users);
        onParticipantsChange?.(users);
      })
      .on("broadcast", { event: "step" }, (payload) => {
        setCurrentStepIndex(payload.stepIndex);
        onStepChange?.(payload.stepIndex);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: profileId,
            displayName,
            isResponding: false,
          });
          await sendHeartbeat();
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (supabase) supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [programId, profileId, displayName, supabase, sendHeartbeat, onStepChange, onParticipantsChange]);

  const sendResponse = useCallback(() => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: "broadcast",
      event: "response",
      payload: { profileId, stepIndex: currentStepIndex },
    });
  }, [profileId, currentStepIndex]);

  const sendChatMessage = useCallback(
    (text: string) => {
      if (!channelRef.current || !text.trim()) return;
      channelRef.current.send({
        type: "broadcast",
        event: "chat",
        payload: { message: { id: crypto.randomUUID(), displayName, text: text.trim(), createdAt: new Date().toISOString() } },
      });
    },
    [displayName],
  );

  return {
    participants,
    currentStepIndex,
    isConnected,
    sendResponse,
    sendChatMessage,
  };
}
