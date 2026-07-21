"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface LongPressButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  holdDurationMs?: number;
  className?: string;
  children: React.ReactNode;
}

export function LongPressButton({
  onComplete,
  disabled = false,
  holdDurationMs = 500,
  className = "",
  children,
}: LongPressButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const startPress = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return;

      clearTimers();
      setIsPressed(true);
      setProgress(0);
      startTimeRef.current = Date.now();

      const tick = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min(elapsed / holdDurationMs, 1);
        setProgress(pct);

        if (pct >= 1) {
          clearTimers();
          setIsPressed(false);
          setProgress(0);

          if (navigator.vibrate) {
            navigator.vibrate(50);
          }

          onComplete();
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [disabled, holdDurationMs, onComplete, clearTimers],
  );

  const endPress = useCallback(() => {
    clearTimers();
    setIsPressed(false);
    setProgress(0);
  }, [clearTimers]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <button
      onMouseDown={(e) => startPress(e.clientX, e.clientY)}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startPress(touch.clientX, touch.clientY);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        endPress();
      }}
      onTouchCancel={endPress}
      disabled={disabled}
      className={`relative flex h-48 w-48 items-center justify-center rounded-full border-2 border-[#C6A15B]/40 transition-transform active:scale-[0.97] disabled:opacity-50 ${className}`}
      style={{
        background: isPressed
          ? "radial-gradient(circle, rgba(198,161,91,0.15) 0%, rgba(15,21,38,0.9) 100%)"
          : "radial-gradient(circle, rgba(198,161,91,0.05) 0%, rgba(15,21,38,0.7) 100%)",
      }}
    >
      {isPressed && (
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(198,161,91,0.2)"
            strokeWidth="3"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#C6A15B"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.05s linear",
            }}
          />
        </svg>
      )}

      <div className="relative z-10 text-center">
        {isPressed ? (
          <>
            <p className="text-3xl font-semibold text-[#C6A15B]">
              {Math.round(progress * 100)}%
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-white/60">
              Mantén presionado
            </p>
          </>
        ) : (
          children
        )}
      </div>

      {isPressed && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span
            className="inline-block h-24 w-24 rounded-full bg-[#C6A15B]/20"
            style={{
              animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
        </span>
      )}
    </button>
  );
}
