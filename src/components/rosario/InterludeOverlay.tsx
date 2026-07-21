"use client";

import { useState, useEffect, useRef } from "react";

interface InterludeOverlayProps {
  mysteryTitle: string;
  mysterySubtitle: string;
  bibleQuote: string;
  mysteryImage?: string;
  audioUrl?: string;
  chatMessages: Array<{ id: string; displayName: string; text: string }>;
  onSendChat: (text: string) => void;
  remainingSeconds: number;
}

export function InterludeOverlay({
  mysteryTitle,
  mysterySubtitle,
  bibleQuote,
  mysteryImage,
  audioUrl,
  chatMessages,
  onSendChat,
  remainingSeconds,
}: InterludeOverlayProps) {
  const [chatText, setChatText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current
        .play()
        .catch(() => {});
    }
  }, [audioUrl]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatText.trim();
    if (!trimmed || trimmed.length > 120) return;
    onSendChat(trimmed);
    setChatText("");
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1526]">
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop />}

      <div className="relative h-64 w-full shrink-0 overflow-hidden">
        {mysteryImage ? (
          <img
            src={mysteryImage}
            alt={mysteryTitle}
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#5E81AC]/30 to-transparent">
            <p className="px-6 text-center text-lg font-medium text-white/80">
              {mysterySubtitle}
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1526] via-transparent to-transparent" />

        <div className="absolute bottom-4 left-5 right-5">
          <p className="text-[11px] uppercase tracking-widest text-[#C6A15B]">
            {mysteryTitle}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/80">
            &ldquo;{bibleQuote}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-widest text-white/40">
            Interludio comunitario
          </p>
          <p className="text-[11px] tabular-nums text-[#C6A15B]">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
        </div>

        <div className="h-[calc(100%-40px)] overflow-y-auto rounded-[16px] border border-white/10 bg-white/5 p-3">
          <div className="flex flex-col gap-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="font-semibold text-[#C6A15B]">
                  {msg.displayName}
                </span>
                <span className="text-white/70"> {msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSend} className="shrink-0 border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatText}
            onChange={(e) => setChatText(e.target.value.slice(0, 120))}
            placeholder="Comparte una palabra de fe..."
            maxLength={120}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C6A15B]/50"
          />
          <button
            type="submit"
            disabled={!chatText.trim()}
            className="rounded-full bg-[#C6A15B] px-5 py-3 text-sm font-semibold text-[#0f1526] transition hover:bg-[#d4b36b] disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
