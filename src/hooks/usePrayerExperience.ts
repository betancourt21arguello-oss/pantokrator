"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PrayerState {
  count: number;
  isResponding: boolean;
  voiceEnabled: boolean;
  isListening: boolean;
  transcript: string;
}

interface UsePrayerExperienceOptions {
  targetCount?: number;
  profileId?: string;
  displayName?: string;
  onComplete?: () => void;
  onSync?: (count: number) => void;
}

interface UsePrayerExperienceReturn extends PrayerState {
  triggerPrayer: () => void;
  toggleVoice: () => void;
  reset: () => void;
  progress: number;
}

const VIBRATION_DURATION = 50;
const AUTO_ADVANCE_PHRASES = [
  "ahora y en la hora de nuestra muerte amén",
  "ahora y en la hora de nuestra muerte",
  "amén",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function detectCompletion(transcript: string): boolean {
  const lower = transcript.toLowerCase();
  return AUTO_ADVANCE_PHRASES.some((phrase) => lower.includes(phrase));
}

export function usePrayerExperience({
  targetCount = 10,
  profileId,
  displayName = "Peregrino",
  onComplete,
  onSync,
}: UsePrayerExperienceOptions = {}): UsePrayerExperienceReturn {
  const [count, setCount] = useState(0);
  const [isResponding, setIsResponding] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const respondingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenCountRef = useRef(0);

  const progress = targetCount > 0 ? (count / targetCount) * 100 : 0;

  const triggerPrayer = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      if (navigator.vibrate) {
        navigator.vibrate(VIBRATION_DURATION);
      }
      setIsResponding(true);
      if (respondingTimeoutRef.current) clearTimeout(respondingTimeoutRef.current);
      respondingTimeoutRef.current = setTimeout(() => setIsResponding(false), 2000);
      if (onSync) onSync(next);
      if (next >= targetCount && onComplete) onComplete();
      return next;
    });
  }, [targetCount, onComplete, onSync]);

  const reset = useCallback(() => {
    setCount(0);
    setIsResponding(false);
    setTranscript("");
    lastSpokenCountRef.current = 0;
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => !prev);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API no soportada en este navegador");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-ES";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullText = finalTranscript || interimTranscript;
      setTranscript(fullText);

      if (finalTranscript && detectCompletion(finalTranscript)) {
        const newCount = lastSpokenCountRef.current + 1;
        if (newCount <= targetCount && newCount > count) {
          lastSpokenCountRef.current = newCount;
          triggerPrayer();
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "no-speech") {
        console.error("Error en reconocimiento de voz:", event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (voiceEnabled) {
    try {
      recognition.start();
      setIsListening(true);
        } catch {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    if (voiceEnabled) {
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      if (respondingTimeoutRef.current) clearTimeout(respondingTimeoutRef.current);
    };
  }, [voiceEnabled, targetCount, count, triggerPrayer]);

  return {
    count,
    isResponding,
    voiceEnabled,
    isListening,
    transcript,
    triggerPrayer,
    toggleVoice,
    reset,
    progress,
  };
}
