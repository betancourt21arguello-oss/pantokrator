"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { SpiritualInventory } from "@/db/schema";
import {
  PLANT_BY_SEED,
  PLANT_NAMES,
  getPlantStage,
  type SpiritualSeedKeys,
} from "@/lib/garden/plantKinds";
import { getGardenPalette } from "@/lib/garden/palette";
import { getLiturgicalSeason, type LiturgicalSeasonInfo } from "@/lib/garden/seasons";
import { PlantSVG } from "@/components/garden/PlantSVG";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const BASE_POSITIONS = [
  { x: 160, y: 500 },
  { x: 320, y: 500 },
  { x: 480, y: 500 },
  { x: 640, y: 500 },
  { x: 240, y: 510 },
  { x: 560, y: 510 },
];

export function SoulGarden() {
  const [data, setData] = useState<{
    inventory: SpiritualInventory;
    season: LiturgicalSeasonInfo;
    avatarSeed: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/garden/state", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => {
        if (res.inventory) {
          setData(res);
        }
      })
      .catch((err) => console.error("Error al cargar datos del jardín:", err))
      .finally(() => setLoading(false));
  }, []);

  const inventory = data?.inventory;
  const season = data?.season || getLiturgicalSeason();
  const avatarSeed = data?.avatarSeed || "camino";

  const seedKeys: SpiritualSeedKeys[] = [
    "seedsJourney",
    "seedsRosary",
    "seedsMercy",
    "seedsJose",
    "seedsGuadalupe",
    "seedsRequiem",
  ];

  const totalSeeds = useMemo(() => {
    if (!inventory) return 0;
    return (
      (inventory.seedsJourney || 0) +
      (inventory.seedsRosary || 0) +
      (inventory.seedsMercy || 0) +
      (inventory.seedsJose || 0) +
      (inventory.seedsGuadalupe || 0) +
      (inventory.seedsRequiem || 0)
    );
  }, [inventory]);

  const waterDrops = inventory?.waterDrops || 0;
  const streakDays = inventory?.currentStreak || 0;

  const palette = useMemo(
    () => getGardenPalette(waterDrops, totalSeeds),
    [waterDrops, totalSeeds]
  );

  const rand = useMemo(
    () => mulberry32(hashString(avatarSeed)),
    [avatarSeed]
  );

  // Posicionar plantas ordenadas por cantidad
  const placedPlants = useMemo(() => {
    if (!inventory) return [];

    const active = seedKeys
      .map((key) => {
        const count = (inventory[key] as number) || 0;
        const kind = PLANT_BY_SEED[key];
        const stage = getPlantStage(count);
        return { key, kind, count, stage };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    return active.slice(0, 6).map((item, index) => {
      const pos = BASE_POSITIONS[index] || { x: 400, y: 500 };
      const jitterX = (rand() - 0.5) * 30;
      return {
        ...item,
        x: pos.x + jitterX,
        y: pos.y,
      };
    });
  }, [inventory, rand]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white/50 border border-[#1c1c1e]/10 text-xs text-[#6e6e73]">
        Preparando el Jardín del Alma...
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1c1c1e]/10 bg-white shadow-xs">
      <svg
        viewBox="0 0 800 600"
        className="block w-full h-auto select-none"
        role="img"
        aria-label="Jardín del Alma"
      >
        {/* Cielo según estación litúrgica */}
        <rect width="800" height="500" fill={season.ambient.skyColor} />

        {/* Suelo */}
        <rect y="500" width="800" height="100" fill={season.ambient.groundColor} />
        <ellipse cx="400" cy="510" rx="380" ry="25" fill="#1c1c1e" opacity={0.06} />

        {/* Partículas de estación (nieve, arena, pétalos) */}
        {season.ambient.particles === "snow" &&
          Array.from({ length: 24 }).map((_, i) => (
            <circle
              key={i}
              cx={(i * 35 + 15) % 800}
              cy={(i * 20 + 30) % 480}
              r={2 + (i % 3)}
              fill="#ffffff"
              opacity={0.8}
            />
          ))}

        {season.ambient.particles === "petals" &&
          Array.from({ length: 20 }).map((_, i) => (
            <ellipse
              key={i}
              cx={(i * 40 + 20) % 800}
              cy={(i * 25 + 40) % 480}
              rx={4}
              ry={2}
              fill="#f472b6"
              opacity={0.7}
              transform={`rotate(${i * 18})`}
            />
          ))}

        {/* Fuente de agua si waterDrops >= 10 */}
        {waterDrops >= 10 && (
          <g transform="translate(90, 480)">
            <ellipse cx="0" cy="20" rx="35" ry="12" fill="#38bdf8" opacity={0.6} />
            <path d="M -20 20 Q 0 -20 20 20" fill="none" stroke="#0284c7" strokeWidth="3" />
            <path d="M -10 20 Q 0 -10 10 20" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="38" textAnchor="middle" fontSize="11" fill="#0369a1" fontWeight="bold">
              💧 {waterDrops}
            </text>
          </g>
        )}

        {/* Fauna sensible: Aves cruzando si streakDays >= 30 */}
        {streakDays >= 30 && (
          <g transform="translate(680, 120)">
            <path d="M 0 0 Q 10 -12 20 0 Q 30 -12 40 0" fill="none" stroke="#1c1c1e" strokeWidth="2" opacity={0.5} />
            <path d="M 50 20 Q 58 10 66 20 Q 74 10 82 20" fill="none" stroke="#1c1c1e" strokeWidth="2" opacity={0.5} />
          </g>
        )}

        {/* Paloma orbital si streakDays >= 100 */}
        {streakDays >= 100 && (
          <g transform="translate(400, 100)">
            <text x="0" y="0" fontSize="28" textAnchor="middle">
              🕊️
            </text>
          </g>
        )}

        {/* Grupo principal de plantas con filtro de agua / deshidratación */}
        <g style={{ filter: palette.filter }}>
          {placedPlants.length === 0 ? (
            <g transform="translate(400, 490)">
              <ellipse cx="0" cy="0" rx="8" ry="5" fill="#65a30d" />
              <text x="0" y="30" textAnchor="middle" fontSize="16" fill="#6e6e73" className="font-serif">
                Tu jardín espera su primera semilla. 🌱
              </text>
            </g>
          ) : (
            placedPlants.map((plant) => (
              <PlantSVG
                key={plant.key}
                kind={plant.kind}
                stage={plant.stage}
                count={plant.count}
                x={plant.x}
                y={plant.y}
              />
            ))
          )}
        </g>
      </svg>

      {/* Leyenda inferior */}
      <div className="p-4 bg-white/90 border-t border-[#1c1c1e]/10">
        <div className="flex items-center justify-between text-xs text-[#6e6e73] mb-2">
          <span className="font-serif font-medium text-[#1c1c1e]">
            {season.name} ({season.color})
          </span>
          <span>Días de Caminar: {streakDays}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#6e6e73]">
          {placedPlants.map((p) => (
            <span key={p.key} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#7c2d12]" />
              {PLANT_NAMES[p.kind]}: {p.count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
