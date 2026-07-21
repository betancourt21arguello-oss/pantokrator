"use client";

import { useState, useCallback } from "react";

interface IntentionInputProps {
  onSubmit: (intention: string) => void;
  isLoading?: boolean;
}

export function IntentionInput({ onSubmit, isLoading = false }: IntentionInputProps) {
  const [text, setText] = useState("");
  const maxLength = 40;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > maxLength) return;
      onSubmit(trimmed);
      setText("");
    },
    [text, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-center text-sm text-white/70">
        Ofrece una intención de oración a la comunidad
      </p>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        placeholder="Ej: Por la paz en mi familia..."
        maxLength={maxLength}
        disabled={isLoading}
        className="rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C6A15B]/50 disabled:opacity-50"
      />
      <div className="flex items-center justify-between text-[11px] text-white/40">
        <span>{text.length}/{maxLength}</span>
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="rounded-full bg-[#C6A15B] px-6 py-2 text-sm font-semibold text-[#0f1526] transition hover:bg-[#d4b36b] disabled:opacity-40"
        >
          Ofrecer intención
        </button>
      </div>
    </form>
  );
}
