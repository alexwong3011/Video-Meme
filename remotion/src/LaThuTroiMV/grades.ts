import React from "react";

export type GradeName = "golden" | "dawn" | "dusk" | "night" | "rain" | "sunset" | "dream";

/** filter: applied to the picture; overlays: colour layers drawn above it (inside the scene). */
export const GRADES: Record<GradeName, { filter: string; overlays: React.CSSProperties[]; glow: number; bloom: number }> = {
  golden: { filter: "saturate(1.06) contrast(1.03)", overlays: [], glow: 0.55, bloom: 0.35 },
  dawn: {
    filter: "brightness(1.04) saturate(0.88) contrast(0.95)",
    overlays: [{ background: "linear-gradient(180deg, rgba(255,226,214,0.45), rgba(255,240,220,0) 55%)", mixBlendMode: "screen" }],
    glow: 0.4,
    bloom: 0.45,
  },
  dusk: {
    filter: "sepia(0.15) saturate(1.12) brightness(0.86) hue-rotate(-8deg)",
    overlays: [{ background: "linear-gradient(180deg, rgba(255,140,60,0.35), rgba(120,40,110,0.35))", mixBlendMode: "multiply" }],
    glow: 0.8,
    bloom: 0.3,
  },
  night: {
    filter: "brightness(0.64) saturate(0.68) contrast(1.1)",
    overlays: [
      { background: "#1b2b5e", mixBlendMode: "multiply", opacity: 0.5 },
      { background: "radial-gradient(circle at 78% 10%, rgba(220,230,255,0.35), rgba(220,230,255,0) 32%)", mixBlendMode: "screen" },
    ],
    glow: 1.25,
    bloom: 0.08,
  },
  rain: {
    filter: "saturate(0.5) brightness(0.74) contrast(1.06)",
    overlays: [{ background: "#3a4a5c", mixBlendMode: "multiply", opacity: 0.45 }],
    glow: 0.6,
    bloom: 0.1,
  },
  sunset: {
    filter: "sepia(0.2) saturate(1.22) brightness(0.94)",
    overlays: [{ background: "linear-gradient(180deg, rgba(255,120,40,0.5), rgba(255,60,60,0.15) 60%, rgba(60,0,40,0.4))", mixBlendMode: "soft-light" }],
    glow: 0.8,
    bloom: 0.45,
  },
  dream: {
    filter: "brightness(1.06) saturate(1.1) contrast(0.96)",
    overlays: [{ background: "radial-gradient(circle at 50% 30%, rgba(255,240,200,0.35), rgba(255,240,200,0) 60%)", mixBlendMode: "screen" }],
    glow: 0.7,
    bloom: 0.75,
  },
};
