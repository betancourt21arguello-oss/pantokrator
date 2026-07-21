"use client";

import { useEffect } from "react";
import { useLlamaStore } from "@/lib/llama/store";

export function LlamaHydrator() {
  const refreshIntensity = useLlamaStore((s) => s.refreshIntensity);

  useEffect(() => {
    refreshIntensity();
  }, [refreshIntensity]);

  return null;
}
