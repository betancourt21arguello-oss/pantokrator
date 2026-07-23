"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { useLlamaStore } from "@/lib/llama/store";

interface CommunityIntention {
  id: string;
  content: string;
  createdAt: string;
  expiresAt: string;
  intensityLevel: number;
  isOwner: boolean;
  hasJoined: boolean;
}

interface GlobalMetrics {
  candlesToday: number;
  rosariesToday: number;
}

function formatRelativeTime(dateIso: string): string {
  const created = new Date(dateIso).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - created) / 1000);

  if (diffSec < 60) return "hace unos instantes";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays}d`;
}

export function CommunityWall() {
  const [items, setItems] = useState<CommunityIntention[]>([]);
  const [metrics, setMetrics] = useState<GlobalMetrics>({
    candlesToday: 0,
    rosariesToday: 0,
  });
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedToastId, setJoinedToastId] = useState<string | null>(null);

  const openModal = useLlamaStore((s) => s.openModal);

  const fetchIntentions = useCallback(async (cursor?: string) => {
    try {
      const url = new URL("/api/community/intentions", window.location.origin);
      url.searchParams.set("limit", "30");
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      if (cursor) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      setNextCursor(data.nextCursor);
      if (data.globalMetrics) {
        setMetrics(data.globalMetrics);
      }
    } catch (error) {
      console.error("Error al cargar muro comunitario:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchIntentions();
  }, [fetchIntentions]);

  const handleJoin = async (intentionId: string) => {
    if (joiningId) return;
    setJoiningId(intentionId);

    try {
      const res = await fetch("/api/llama/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === intentionId
              ? {
                  ...item,
                  hasJoined: true,
                  intensityLevel: data.newIntensity ?? item.intensityLevel,
                }
              : item
          )
        );

        setJoinedToastId(intentionId);
        setTimeout(() => {
          setJoinedToastId(null);
        }, 2200);
      }
    } catch (error) {
      console.error("Error al unirse a la oración:", error);
    } finally {
      setJoiningId(null);
    }
  };

  const numberFormatter = new Intl.NumberFormat("es-ES");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#f7f5f0] px-5 pb-28 pt-8 text-[#1c1c1e]">
      {/* Cabecera */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-semibold tracking-[0.28em] text-[#1c1c1e]">
            COMUNIDAD
          </span>
          <Link
            href="/comunidad/novenas"
            className="text-xs text-[#7c2d12] hover:underline flex items-center gap-1 font-medium min-h-[44px] px-2"
          >
            <span>Novenas y devociones</span>
            <span>→</span>
          </Link>
        </div>

        <p className="text-2xl font-serif text-[#1c1c1e] font-normal">
          Muro de Intenciones
        </p>

        <p className="mt-2 text-xs text-[#6e6e73]">
          Hoy: {numberFormatter.format(metrics.candlesToday)} velas encendidas ·{" "}
          {numberFormatter.format(metrics.rosariesToday)} rosarios rezados
        </p>
      </header>

      {/* Botón flotante superior para encender vela */}
      <div className="mb-6">
        <button
          type="button"
          onClick={openModal}
          className="w-full h-12 rounded-2xl bg-white border border-[#1c1c1e]/10 px-4 text-sm font-medium text-[#7c2d12] shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
        >
          <span>🕯️</span>
          <span>Ofrecer mi intención</span>
        </button>
      </div>

      {/* Feed de velas / intenciones */}
      {loading ? (
        <div className="flex justify-center py-12 text-sm text-[#6e6e73]">
          Uniendo oraciones...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-[#6e6e73]">
          <span className="text-3xl mb-2">🕯️</span>
          <p className="font-serif">Aún no hay velas encendidas en la comunidad.</p>
          <p className="text-xs mt-1">Sé el primero en encender una llama hoy.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-4 border border-[#1c1c1e]/10 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <span
                  className="text-2xl select-none pt-0.5 animate-pulse"
                  style={{
                    opacity: 0.7 + (item.intensityLevel - 1) * 0.075,
                  }}
                >
                  🕯️
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1c1c1e] break-words leading-snug font-serif">
                    &ldquo;{item.content}&rdquo;
                  </p>

                  <div className="mt-2 flex items-center justify-between text-xs text-[#6e6e73]">
                    <span>{formatRelativeTime(item.createdAt)}</span>

                    <div className="flex items-center gap-2">
                      {joinedToastId === item.id ? (
                        <span className="text-xs text-[#7c2d12] font-medium animate-pulse">
                          Has unido tu oración 🕊️
                        </span>
                      ) : item.isOwner ? (
                        <span className="text-[11px] text-[#7c2d12] italic">
                          Tu intención
                        </span>
                      ) : item.hasJoined ? (
                        <span className="text-[11px] text-[#6f7f5f] font-medium">
                          Oración unida 💧
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleJoin(item.id)}
                          disabled={joiningId === item.id}
                          className="text-xs text-[#7c2d12] underline hover:text-[#5c210d] transition-colors min-h-[44px] flex items-center px-1"
                        >
                          Unirme a esta oración
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {nextCursor && (
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setLoadingMore(true);
                  fetchIntentions(nextCursor);
                }}
                disabled={loadingMore}
                className="min-h-[44px] px-6 text-xs text-[#6e6e73] border border-[#1c1c1e]/10 rounded-full hover:bg-white transition-colors"
              >
                {loadingMore ? "Cargando..." : "Cargar más intenciones"}
              </button>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
