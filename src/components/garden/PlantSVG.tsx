"use client";

import { motion } from "framer-motion";
import type { PlantKind, PlantStage } from "@/lib/garden/plantKinds";

interface PlantSVGProps {
  kind: PlantKind;
  stage: PlantStage;
  count: number;
  x: number;
  y: number;
}

const PLANT_COLORS: Record<PlantKind, { primary: string; secondary: string; stem: string }> = {
  rosal: { primary: "#e11d48", secondary: "#fb7185", stem: "#15803d" }, // Rojo carmesí
  margarita: { primary: "#facc15", secondary: "#ffffff", stem: "#16a34a" }, // Blanco y amarillo
  lirio: { primary: "#a855f7", secondary: "#e9d5ff", stem: "#15803d" }, // Violeta/blanco
  nogal: { primary: "#15803d", secondary: "#166534", stem: "#78350f" }, // Árbol frondoso
  vides: { primary: "#7e22ce", secondary: "#a855f7", stem: "#854d0e" }, // Uvas/vides
  higuera: { primary: "#166534", secondary: "#422006", stem: "#713f12" }, // Verde oscuro
  olivo: { primary: "#65a30d", secondary: "#a3e635", stem: "#854d0e" }, // Olivo plateado/verde
};

export function PlantSVG({ kind, stage, count, x, y }: PlantSVGProps) {
  if (stage === "nada") return null;

  const colors = PLANT_COLORS[kind];

  // Stage 1: Semilla 🌱
  if (stage === "semilla") {
    return (
      <g transform={`translate(${x}, ${y})`}>
        <ellipse cx={0} cy={-2} rx={6} ry={4} fill="#854d0e" />
        <circle cx={-1} cy={-4} r={2} fill="#22c55e" />
      </g>
    );
  }

  // Stage 2: Brote 🌿
  if (stage === "brote") {
    return (
      <motion.g
        transform={`translate(${x}, ${y})`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <path d="M 0 0 Q -2 -15 0 -30" fill="none" stroke={colors.stem} strokeWidth={3} strokeLinecap="round" />
        <path d="M 0 -20 Q -10 -25 -15 -20 Q -8 -15 0 -20 Z" fill="#22c55e" />
        <path d="M 0 -25 Q 10 -30 15 -25 Q 8 -20 0 -25 Z" fill="#22c55e" />
      </motion.g>
    );
  }

  // Stage 3: Flor 🌼
  if (stage === "flor") {
    return (
      <motion.g
        transform={`translate(${x}, ${y})`}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <path d="M 0 0 Q 5 -30 0 -60" fill="none" stroke={colors.stem} strokeWidth={4} strokeLinecap="round" />
        <path d="M 0 -35 Q -14 -42 -20 -35 Q -10 -28 0 -35 Z" fill="#16a34a" />
        <path d="M 0 -45 Q 14 -52 20 -45 Q 10 -38 0 -45 Z" fill="#16a34a" />

        <g transform="translate(0, -60)">
          {Array.from({ length: 5 }).map((_, i) => {
            const rot = i * 72;
            return (
              <ellipse
                key={i}
                cx={0}
                cy={-10}
                rx={6}
                ry={10}
                fill={colors.primary}
                transform={`rotate(${rot})`}
              />
            );
          })}
          <circle r={5} fill={colors.secondary} />
        </g>
      </motion.g>
    );
  }

  // Stage 4: Árbol / Planta grande 🌳
  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Tronco */}
      <path d="M 0 0 Q -6 -50 0 -90" fill="none" stroke={colors.stem} strokeWidth={8} strokeLinecap="round" />
      <path d="M 0 -50 Q 20 -70 30 -85" fill="none" stroke={colors.stem} strokeWidth={5} strokeLinecap="round" />
      <path d="M 0 -65 Q -20 -85 -30 -100" fill="none" stroke={colors.stem} strokeWidth={4} strokeLinecap="round" />

      {/* Copa / Floración frondosa */}
      <circle cx={0} cy={-100} r={35} fill={colors.primary} opacity={0.88} />
      <circle cx={-25} cy={-90} r={26} fill={colors.secondary} opacity={0.85} />
      <circle cx={25} cy={-90} r={26} fill={colors.primary} opacity={0.85} />
      <circle cx={0} cy={-120} r={24} fill={colors.secondary} opacity={0.9} />

      {/* Detalle flotante de semillas abundante */}
      <text x={0} y={-100} textAnchor="middle" fontSize={10} fill="#ffffff" fontWeight="bold">
        {count}
      </text>
    </motion.g>
  );
}
