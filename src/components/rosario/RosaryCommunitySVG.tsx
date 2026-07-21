"use client";

import { useMemo } from "react";

const SACRED_PALETTE = {
  gold: "#C6A15B",
  marianBlue: "#5E81AC",
  ivory: "#FAF8F5",
  deepSpace: "#0f1526",
  softGlow: "#FFF7E0",
} as const;

type CountryAccent = {
  hue: number;
  saturation: number;
};

const COUNTRY_ACCENTS: Record<string, CountryAccent> = {
  AR: { hue: 38, saturation: 70 },
  BR: { hue: 150, saturation: 60 },
  CO: { hue: 200, saturation: 55 },
  ES: { hue: 25, saturation: 65 },
  FR: { hue: 260, saturation: 40 },
  IT: { hue: 0, saturation: 55 },
  JP: { hue: 320, saturation: 45 },
  MX: { hue: 85, saturation: 60 },
  PE: { hue: 175, saturation: 50 },
  PH: { hue: 45, saturation: 70 },
  PL: { hue: 220, saturation: 50 },
  PT: { hue: 12, saturation: 60 },
  US: { hue: 210, saturation: 40 },
  VE: { hue: 130, saturation: 55 },
  DEFAULT: { hue: 40, saturation: 50 },
};

function getCountryAccent(countryCode?: string): CountryAccent {
  if (!countryCode) return COUNTRY_ACCENTS.DEFAULT;
  return COUNTRY_ACCENTS[countryCode.toUpperCase()] ?? COUNTRY_ACCENTS.DEFAULT;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function bezierPathToCenter(
  x: number,
  y: number,
  cx: number,
  cy: number,
  tension: number = 0.35,
): string {
  const dx = cx - x;
  const dy = cy - y;
  const c1x = x + dx * tension;
  const c1y = y;
  const c2x = cx - dx * tension;
  const c2y = cy;
  return `M ${x} ${y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cx} ${cy}`;
}

export interface RosaryCommunitySVGProps {
  totalUsers: number;
  respondingUsers: number;
  uniqueCountriesCount: number;
  currentStepIndex: number;
  countryCodes?: string[];
  pulseIntensity?: number;
}

export function RosaryCommunitySVG({
  totalUsers,
  respondingUsers,
  uniqueCountriesCount,
  currentStepIndex,
  countryCodes = [],
  pulseIntensity = 0,
}: RosaryCommunitySVGProps) {
  const nodes = useMemo(() => {
    if (totalUsers <= 0) return [];

    const count = Math.min(totalUsers, 120);
    const angleStep = 360 / count;
    const baseRadius = 140;
    const radiusVariation = 18;

    const nodes: Array<{
      id: number;
      cx: number;
      cy: number;
      r: number;
      fill: string;
      glowColor: string;
      opacity: number;
      delay: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const wobble =
        Math.sin(i * 2.7 + currentStepIndex) * radiusVariation * 0.5;
      const r = baseRadius + wobble;
      const pos = polarToCartesian(200, 200, r, angle);

      const accent = getCountryAccent(countryCodes[i % countryCodes.length]);
      const lightness = 55 + (i % 3) * 8;
      const fill = `hsl(${accent.hue}, ${accent.saturation}%, ${lightness}%)`;
      const glowColor = `hsl(${accent.hue}, ${accent.saturation}%, 75%)`;
      const opacity = 0.7 + (i % 5) * 0.06;

      nodes.push({
        id: i,
        cx: pos.x,
        cy: pos.y,
        r: 2.8 + (i % 4) * 0.6,
        fill,
        glowColor,
        opacity,
        delay: (i / count) * 1.2,
      });
    }

    return nodes;
  }, [totalUsers, currentStepIndex, countryCodes]);

  const centerGlowRadius = useMemo(() => {
    const base = 28;
    const pulse = respondingUsers > 0 ? respondingUsers * 1.8 : 0;
    return base + pulse;
  }, [respondingUsers]);

  const centerGlowOpacity = useMemo(() => {
    const base = 0.35;
    const pulse = respondingUsers > 0 ? Math.min(respondingUsers * 0.04, 0.5) : 0;
    return base + pulse + pulseIntensity * 0.3;
  }, [respondingUsers, pulseIntensity]);

  const connectionPaths = useMemo(() => {
    if (nodes.length === 0) return [];

      const respondingSet = new Set<number>();
      for (let i = 0; i < Math.min(respondingUsers, nodes.length); i++) {
        respondingSet.add(i);
      }

    return nodes.map((node, i) => {
      const isResponding = respondingSet.has(i);
      const baseOpacity = isResponding ? 0.55 : 0.18;
      const stroke = isResponding ? SACRED_PALETTE.gold : SACRED_PALETTE.marianBlue;
      const path = bezierPathToCenter(node.cx, node.cy, 200, 200, 0.38);

      return {
        id: i,
        path,
        stroke,
        opacity: baseOpacity,
        isResponding,
        delay: node.delay,
      };
    });
  }, [nodes, respondingUsers]);

  const outerRingDash = useMemo(() => {
    const base = 8;
    const gap = 12 + uniqueCountriesCount * 1.5;
    return `${base} ${gap}`;
  }, [uniqueCountriesCount]);

  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full select-none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={SACRED_PALETTE.gold} stopOpacity="0.9" />
          <stop
            offset="45%"
            stopColor={SACRED_PALETTE.marianBlue}
            stopOpacity="0.5"
          />
          <stop offset="100%" stopColor={SACRED_PALETTE.deepSpace} stopOpacity="0" />
        </radialGradient>

        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="40%" stopColor={SACRED_PALETTE.softGlow} stopOpacity="0.5" />
          <stop offset="100%" stopColor={SACRED_PALETTE.gold} stopOpacity="0" />
        </radialGradient>

        <filter id="blurGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="400" height="400" fill={SACRED_PALETTE.deepSpace} />

      <g opacity="0.25">
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke={SACRED_PALETTE.marianBlue}
          strokeWidth="0.6"
          strokeDasharray={outerRingDash}
        />
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke={SACRED_PALETTE.gold}
          strokeWidth="0.4"
          strokeDasharray={outerRingDash}
          opacity="0.6"
        />
        <circle
          cx="200"
          cy="200"
          r="185"
          fill="none"
          stroke={SACRED_PALETTE.ivory}
          strokeWidth="0.3"
          strokeDasharray="4 18"
          opacity="0.4"
        />
      </g>

      <g opacity="0.5">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = i * 30;
          const pos = polarToCartesian(200, 200, 185, angle);
          const inner = polarToCartesian(200, 200, 155, angle);
          return (
            <line
              key={`tick-${i}`}
              x1={inner.x}
              y1={inner.y}
              x2={pos.x}
              y2={pos.y}
              stroke={SACRED_PALETTE.gold}
              strokeWidth="0.5"
              opacity="0.5"
            />
          );
        })}
      </g>

      {connectionPaths.map((conn) => (
        <path
          key={`conn-${conn.id}`}
          d={conn.path}
          fill="none"
          stroke={conn.stroke}
          strokeWidth={conn.isResponding ? 1.6 : 0.8}
          opacity={conn.opacity}
          strokeLinecap="round"
          style={{
            transition: "opacity 0.8s ease, stroke-width 0.8s ease",
          }}
        >
          {conn.isResponding && (
            <animate
              attributeName="stroke-width"
              values="1.6;2.4;1.6"
              dur="1.8s"
              repeatCount="indefinite"
              begin={`${conn.delay}s`}
            />
          )}
        </path>
      ))}

      {nodes.map((node) => {
        const isResponding = node.id < respondingUsers;
        return (
          <g key={`node-${node.id}`}>
            {isResponding && (
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 5}
                fill={node.glowColor}
                opacity="0.35"
                filter="url(#blurGlow)"
                style={{ transition: "r 0.6s ease, opacity 0.6s ease" }}
              >
                <animate
                  attributeName="r"
                  values={`${node.r + 3};${node.r + 7};${node.r + 3}`}
                  dur="2.2s"
                  repeatCount="indefinite"
                  begin={`${node.delay}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.25;0.55;0.25"
                  dur="2.2s"
                  repeatCount="indefinite"
                  begin={`${node.delay}s`}
                />
              </circle>
            )}

            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill={node.fill}
              opacity={node.opacity}
              style={{
                transition: "r 0.6s ease, fill 0.8s ease, opacity 0.6s ease",
              }}
            >
              {isResponding && (
                <animate
                  attributeName="r"
                  values={`${node.r};${node.r + 1.2};${node.r}`}
                  dur="1.6s"
                  repeatCount="indefinite"
                  begin={`${node.delay}s`}
                />
              )}
            </circle>

            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r * 0.55}
              fill={SACRED_PALETTE.softGlow}
              opacity={isResponding ? 0.9 : 0.5}
              style={{ transition: "opacity 0.6s ease" }}
            />
          </g>
        );
      })}

      <circle
        cx="200"
        cy="200"
        r={centerGlowRadius}
        fill="url(#centerGlow)"
        opacity={centerGlowOpacity}
        filter="url(#softGlow)"
        style={{ transition: "r 1s ease, opacity 0.8s ease" }}
      >
        {respondingUsers > 0 && (
          <animate
            attributeName="r"
            values={`${centerGlowRadius};${centerGlowRadius + 6};${centerGlowRadius}`}
            dur="2.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <circle
        cx="200"
        cy="200"
        r="18"
        fill="none"
        stroke={SACRED_PALETTE.gold}
        strokeWidth="0.8"
        opacity="0.6"
      />

      <circle
        cx="200"
        cy="200"
        r="6"
        fill={SACRED_PALETTE.ivory}
        opacity="0.9"
        filter="url(#blurGlow)"
        style={{ transition: "r 0.8s ease, opacity 0.8s ease" }}
      >
        {respondingUsers > 0 && (
          <animate
            attributeName="r"
            values="5;7;5"
            dur="1.4s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {totalUsers > 0 && (
        <text
          x="200"
          y="205"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={SACRED_PALETTE.ivory}
          fontSize="7"
          fontWeight="600"
          opacity="0.85"
          fontFamily="system-ui, sans-serif"
        >
          {totalUsers}
        </text>
      )}
    </svg>
  );
}
