"use client";

import { useMemo } from "react";

interface Participant {
  id: string;
  displayName: string;
  seedsFaith?: number;
  seedsHope?: number;
  seedsCharity?: number;
}

export interface CommunityTreeSVGProps {
  participants: Participant[];
  currentUserId?: string;
  width?: number;
  height?: number;
}

const SACRED_PALETTE = [
  "#C6A15B",
  "#5E81AC",
  "#FAF8F5",
  "#8B7355",
  "#A0C4E8",
  "#D4AF37",
  "#7BA3A8",
  "#E8DCC4",
];

function deterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getLeafColor(seed: number): string {
  return SACRED_PALETTE[seed % SACRED_PALETTE.length];
}

function getLeafShape(seed: number): string {
  const shapes = [
    "M 0 0 Q 3 -4 0 -8 Q -3 -4 0 0",
    "M 0 0 Q 4 -3 2 -7 Q -2 -7 -2 -3 Q 0 0",
    "M 0 0 Q 3 -5 0 -9 Q -3 -5 0 0",
    "M 0 0 Q 2 -3 0 -6 Q -2 -3 0 0",
    "M 0 0 Q 5 -4 3 -8 Q -3 -8 -5 -4 Q 0 0",
  ];
  return shapes[seed % shapes.length];
}

function getLeafPosition(
  index: number,
  total: number,
  seed: number,
): { x: number; y: number; rotation: number } {
  const baseY = 40 + (seed % 60);
  const spread = 120 + (seed % 40);
  const x = 100 + (index / Math.max(total, 1)) * spread - spread / 2 + (seed % 20 - 10);
  const y = baseY + Math.sin((index / Math.max(total, 1)) * Math.PI * 2) * 30;
  const rotation = (seed % 360) - 180;
  return { x, y, rotation };
}

export function CommunityTreeSVG({
  participants,
  currentUserId,
  width = 400,
  height = 500,
}: CommunityTreeSVGProps) {
  const leaves = useMemo(() => {
    if (!participants || participants.length === 0) return [];

    return participants.map((participant, index) => {
      const gardenSeed = (participant.seedsFaith || 0) +
        (participant.seedsHope || 0) * 10 +
        (participant.seedsCharity || 0) * 100;
      const hashInput = `${participant.id}-${gardenSeed}`;
      const seed = deterministicHash(hashInput);

      const color = getLeafColor(seed);
      const shape = getLeafShape(seed);
      const { x, y, rotation } = getLeafPosition(index, participants.length, seed);

      const isCurrentUser = participant.id === currentUserId;

      return {
        id: participant.id,
        x,
        y,
        rotation,
        color,
        shape,
        opacity: isCurrentUser ? 1 : 0.7 + (seed % 3) * 0.1,
        scale: isCurrentUser ? 1.2 : 0.9 + (seed % 4) * 0.1,
        displayName: participant.displayName,
      };
    });
  }, [participants, currentUserId]);

  const trunkPath = useMemo(() => {
    return `M 200 480 Q 200 400 200 350 Q 190 300 180 250 Q 170 200 175 150`;
  }, []);

  const branchLeft = useMemo(() => {
    return `M 200 350 Q 150 320 120 280 Q 100 240 90 200`;
  }, []);

  const branchRight = useMemo(() => {
    return `M 200 350 Q 250 320 280 280 Q 300 240 310 200`;
  }, []);

  const totalLeaves = leaves.length;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
      aria-hidden="true"
    >
      <defs>
        <filter id="leafGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B7355" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#5C4A3A" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="transparent" />

      <g opacity="0.6">
        <path d={trunkPath} fill="none" stroke="url(#trunkGradient)" strokeWidth="4" strokeLinecap="round" />
        <path d={branchLeft} fill="none" stroke="url(#trunkGradient)" strokeWidth="3" strokeLinecap="round" />
        <path d={branchRight} fill="none" stroke="url(#trunkGradient)" strokeWidth="3" strokeLinecap="round" />
      </g>

      {leaves.map((leaf) => (
        <g
          key={leaf.id}
          transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotation}) scale(${leaf.scale})`}
          opacity={leaf.opacity}
          filter="url(#leafGlow)"
        >
          <path
            d={leaf.shape}
            fill={leaf.color}
            stroke={leaf.color}
            strokeWidth="0.5"
            opacity="0.9"
          />
        </g>
      ))}

      {totalLeaves > 0 && (
        <text x="200" y="30" textAnchor="middle" fill="#C6A15B" fontSize="12" fontWeight="600" opacity="0.8">
          {totalLeaves} {totalLeaves === 1 ? "hoja" : "hojas"} en el Árbol
        </text>
      )}
    </svg>
  );
}
