import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActiveIntention = {
  id: string;
  content: string;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string
  intensityLevel: number;
};

type LlamaState = {
  activeIntention: ActiveIntention | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  lightCandle: (intention: ActiveIntention) => void;
  clearCandle: () => void;
  refreshIntensity: () => Promise<void>;
};

export const useLlamaStore = create<LlamaState>()(
  persist(
    (set, get) => ({
      activeIntention: null,
      isModalOpen: false,

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),

      lightCandle: (intention: ActiveIntention) =>
        set({ activeIntention: intention }),

      clearCandle: () => set({ activeIntention: null }),

      refreshIntensity: async () => {
        try {
          const res = await fetch("/api/llama/current");
          if (!res.ok) return;
          const data = await res.json();

          if (data.activeIntention) {
            set({ activeIntention: data.activeIntention });
          } else {
            set({ activeIntention: null });
          }
        } catch (error) {
          console.error("Error al refrescar intensidad de La Llama:", error);
        }
      },
    }),
    {
      name: "camino.llama",
      partialize: (state) => ({ activeIntention: state.activeIntention }),
    }
  )
);
