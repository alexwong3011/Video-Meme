import React from "react";
import { random } from "remotion";

/**
 * A sparse, seek-safe spark burst. Every particle is a pure function of time
 * since the burst (t) and a seed, so any frame renders identically.
 */
export const Sparks: React.FC<{ seed: string; t: number; count: number; scale?: number }> = ({
  seed,
  t,
  count,
  scale = 1,
}) => {
  if (t < 0 || t > 2.2) return null;
  const parts: React.ReactNode[] = [];
  const G = 150 * scale; // gravity px/s²
  const K = 1.7; // drag
  for (let k = 0; k < count; k++) {
    const r = (n: number) => random(`${seed}-${k}-${n}`);
    const star = r(9) < 0.12;
    const life = (star ? 1.3 : 0.75) + r(1) * 0.9;
    const age = t - r(8) * 0.12; // slight per-particle delay
    if (age < 0 || age > life) continue;
    const u = age / life;
    const ang = r(2) * Math.PI * 2;
    const spd = (star ? 45 : 70) + r(3) * (star ? 80 : 190);
    const vx0 = Math.cos(ang) * spd * scale;
    const vy0 = Math.sin(ang) * spd * scale - 55 * scale;
    const decay = (1 - Math.exp(-K * age)) / K;
    const x = vx0 * decay;
    const y = vy0 * decay + 0.5 * G * age * age * 0.55;
    const vx = vx0 * Math.exp(-K * age);
    const vy = vy0 * Math.exp(-K * age) + G * age * 0.55;
    const v = Math.hypot(vx, vy);
    const twinkle = 0.55 + 0.45 * Math.sin(age * (16 + r(4) * 18) + r(5) * 6.28);
    const alpha = Math.min(1, u * 12) * Math.pow(1 - u, 1.4) * twinkle;
    // white-hot → gold → amber
    const hue = 48 - u * 18;
    const light = 96 - u * 38;
    const color = `hsla(${hue}, 100%, ${light}%, ${alpha})`;
    const glow = `hsla(${hue - 4}, 100%, ${Math.max(50, light - 15)}%, ${alpha * 0.9})`;
    const size = ((star ? 8 : 2.8) + r(6) * (star ? 5 : 2.6)) * scale * (1 - u * 0.35);
    const left = `${8 + r(7) * 84}%`;
    const top = `${28 + r(10) * 50}%`;

    if (star) {
      const rot = age * 120 * (r(11) < 0.5 ? -1 : 1);
      parts.push(
        <div
          key={k}
          style={{
            position: "absolute",
            left,
            top,
            width: size * 3,
            height: size * 3,
            marginLeft: -size * 1.5,
            marginTop: -size * 1.5,
            transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${0.6 + twinkle * 0.6})`,
            opacity: alpha,
            background: `radial-gradient(circle, rgba(255,252,235,1) 0 8%, rgba(255,214,110,0.9) 14%, rgba(255,190,70,0) 34%),
              linear-gradient(90deg, transparent 0 46%, rgba(255,240,190,0.95) 50%, transparent 54% 100%),
              linear-gradient(0deg, transparent 0 46%, rgba(255,240,190,0.95) 50%, transparent 54% 100%)`,
            filter: `drop-shadow(0 0 ${size * 0.8}px rgba(255,200,90,${alpha}))`,
          }}
        />,
      );
    } else {
      const len = size + Math.min(26 * scale, v * 0.05);
      const rot = (Math.atan2(vy, vx) * 180) / Math.PI;
      parts.push(
        <div
          key={k}
          style={{
            position: "absolute",
            left,
            top,
            width: len,
            height: size,
            marginLeft: -len,
            marginTop: -size / 2,
            borderRadius: size,
            transformOrigin: "100% 50%",
            transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
            background: `linear-gradient(90deg, hsla(${hue}, 100%, ${light}%, 0), ${color})`,
            boxShadow: `0 0 ${size * 2.6}px ${size * 0.7}px ${glow}`,
          }}
        />,
      );
    }
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      {parts}
    </div>
  );
};
