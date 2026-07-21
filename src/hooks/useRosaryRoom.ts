"use client";

// ============================================================================
// CAMINO · Hook Rosario Comunitario (Realtime Presence & Broadcast)
// ----------------------------------------------------------------------------
// Gestiona:
//   - Presencia (quién está orando en vivo)
//   - Broadcast (conteo de Ave Marías, jaculatorias, interludio)
// ============================================================================

import { useEffect, useState, useRef } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
  id: string;
  name: string;
  avatarSeed: string;
}

export function useRosaryRoom(roomId: string, user: PresenceUser) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [aveMariaCount, setAveMariaCount] = useState(0);
  const [isInterlude, setIsInterlude] = useState(false);
  const channel = useRef<RealtimeChannel | null>(null);
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (!supabase) return;

    channel.current = supabase.channel(`rosary:${roomId}`, {
      config: { presence: { key: user.id } },
    });

    // 1. Presencia (usuarios en vivo)
    channel.current
      .on("presence", { event: "sync" }, () => {
        const state = channel.current?.presenceState() || {};
        const users = Object.values(state).flat() as unknown as PresenceUser[];
        setOnlineUsers(users);
      })
      .on("broadcast", { event: "prayer" }, (payload) => {
        setAveMariaCount((prev) => prev + 1);
      })
      .on("broadcast", { event: "interlude" }, (payload) => {
        setIsInterlude(payload.active);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.current?.track(user);
        }
      });

    return () => {
      supabase.removeChannel(channel.current!);
    };
  }, [roomId, user, supabase]);

  const prayAveMaria = () => {
    setAveMariaCount((prev) => prev + 1);
    channel.current?.send({
      type: "broadcast",
      event: "prayer",
      payload: { userId: user.id },
    });
  };

  return { onlineUsers, aveMariaCount, isInterlude, prayAveMaria };
}
