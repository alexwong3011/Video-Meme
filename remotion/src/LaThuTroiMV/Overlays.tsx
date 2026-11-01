import React from "react";
import { random } from "remotion";

const W = 1080;
const H = 1920;
const wrap = (v: number, m: number) => ((v % m) + m) % m;

const MAPLE =
  "M0,-46 L8,-24 L22,-32 L18,-12 L38,-16 L28,0 L44,8 L22,12 L26,28 L6,18 L2,46 L-2,46 L-6,18 L-26,28 L-22,12 L-44,8 L-28,0 L-38,-16 L-18,-12 L-22,-32 L-8,-24 Z";
const GINKGO = "M0,40 L0,10 C-28,8 -44,-18 -36,-38 C-20,-30 -10,-34 0,-24 C10,-34 20,-30 36,-38 C44,-18 28,8 0,10 Z";
const LEAF_COLORS = [
  ["#ffd34d", "#e09a1a"],
  ["#ffbe3b", "#d4700f"],
  ["#ff9a2e", "#c4460c"],
  ["#e8462a", "#9e1b10"],
  ["#ffe07a", "#d8a224"],
];

/** Falling leaves tumbling in 3D (deterministic). */
export const Leaves: React.FC<{ t: number; seed: string; count: number }> = ({ t, seed, count }) => (
  <div style={{ position: "absolute", inset: 0, perspective: 900, overflow: "hidden", pointerEvents: "none" }}>
    {Array.from({ length: count }, (_, k) => {
      const r = (n: number) => random(`${seed}-leaf-${k}-${n}`);
      const depth = 0.45 + r(1) * 0.95;
      const size = 26 + depth * 34;
      const vy = (55 + r(2) * 70) * depth;
      const span = H + 300;
      const y = wrap(r(3) * span + vy * (t + 40), span) - 150;
      const x = wrap(r(4) * (W + 200) + (r(5) - 0.35) * 40 * t + Math.sin(t * (0.6 + r(6)) + r(7) * 6) * 70 * depth, W + 200) - 100;
      const [c1, c2] = LEAF_COLORS[Math.floor(r(8) * LEAF_COLORS.length)];
      const ginkgo = r(9) < 0.45;
      const rx = (t * (60 + r(10) * 140) + r(11) * 360) % 360;
      const ry = (t * (40 + r(12) * 120) + r(13) * 360) % 360;
      const rz = r(14) * 360 + Math.sin(t * 1.3 + r(15) * 6) * 40;
      const id = `${seed}-g-${k}`;
      return (
        <svg
          key={k}
          width={size}
          height={size}
          viewBox="-50 -50 100 100"
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: `rotateZ(${rz}deg) rotateX(${rx}deg) rotateY(${ry}deg)`,
            opacity: 0.55 + depth * 0.35,
            filter: depth > 1.25 ? "blur(2px)" : depth < 0.6 ? "blur(1px)" : undefined,
          }}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={c1} />
              <stop offset="1" stopColor={c2} />
            </linearGradient>
          </defs>
          <path d={ginkgo ? GINKGO : MAPLE} fill={`url(#${id})`} stroke="rgba(120,50,0,0.35)" strokeWidth={1.5} />
          <path d="M0,44 L0,-30" stroke="rgba(120,60,10,0.45)" strokeWidth={2} />
        </svg>
      );
    })}
  </div>
);

export const Rain: React.FC<{ t: number; seed: string; count?: number }> = ({ t, seed, count = 140 }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {Array.from({ length: count }, (_, k) => {
      const r = (n: number) => random(`${seed}-rain-${k}-${n}`);
      const depth = 0.4 + r(1) * 0.8;
      const len = 50 + depth * 80;
      const v = 1500 * depth;
      const y = wrap(r(2) * (H + 300) + v * t, H + 300) - 200;
      const x = wrap(r(3) * (W + 300) + y * 0.14, W + 300) - 150;
      return (
        <div
          key={k}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: 1.2 + depth,
            height: len,
            transform: "rotate(8deg)",
            background: `linear-gradient(180deg, rgba(220,230,255,0), rgba(220,230,255,${0.18 + depth * 0.25}))`,
          }}
        />
      );
    })}
  </div>
);

export const Rays: React.FC<{ t: number; seed: string }> = ({ t, seed }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", mixBlendMode: "screen", pointerEvents: "none" }}>
    {Array.from({ length: 5 }, (_, k) => {
      const r = (n: number) => random(`${seed}-ray-${k}-${n}`);
      const a = 0.12 + 0.12 * (0.5 + 0.5 * Math.sin(t * (0.3 + r(1) * 0.4) + r(2) * 6));
      return (
        <div
          key={k}
          style={{
            position: "absolute",
            left: -200 + r(3) * 900,
            top: -400,
            width: 90 + r(4) * 160,
            height: 2800,
            transformOrigin: "50% 0",
            transform: `rotate(${-28 + r(5) * 16 + Math.sin(t * 0.15 + k) * 2}deg)`,
            background: `linear-gradient(180deg, rgba(255,236,180,${a}), rgba(255,220,150,${a * 0.5}) 45%, rgba(255,220,150,0) 85%)`,
            filter: "blur(18px)",
          }}
        />
      );
    })}
  </div>
);

export const Mist: React.FC<{ t: number; seed: string }> = ({ t, seed }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {Array.from({ length: 5 }, (_, k) => {
      const r = (n: number) => random(`${seed}-mist-${k}-${n}`);
      const x = wrap(r(1) * 1600 + t * (12 + r(2) * 18), 1900) - 700;
      return (
        <div
          key={k}
          style={{
            position: "absolute",
            left: x,
            top: 900 + r(3) * 900,
            width: 1100,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(240,240,235,0.22), rgba(240,240,235,0) 70%)",
          }}
        />
      );
    })}
  </div>
);

/** Twinkling sun glints inside a rectangle (coordinates in the layer's pixel space). */
export const Sparkle: React.FC<{ t: number; seed: string; x0: number; y0: number; x1: number; y1: number; count?: number }> = ({
  t,
  seed,
  x0,
  y0,
  x1,
  y1,
  count = 26,
}) => (
  <>
    {Array.from({ length: count }, (_, k) => {
      const r = (n: number) => random(`${seed}-spk-${k}-${n}`);
      const period = 1.6 + r(1) * 2.2;
      const ph = wrap(t + r(2) * period, period) / period;
      const a = ph < 0.35 ? Math.sin((ph / 0.35) * Math.PI) : 0;
      if (a <= 0.01) return null;
      const s = 10 + r(3) * 22;
      return (
        <div
          key={k}
          style={{
            position: "absolute",
            left: x0 + r(4) * (x1 - x0) - s / 2,
            top: y0 + r(5) * (y1 - y0) - s / 2,
            width: s,
            height: s,
            opacity: a,
            mixBlendMode: "screen",
            background: `radial-gradient(circle, #fff 0 8%, rgba(255,240,200,0.7) 16%, rgba(255,230,170,0) 36%),
              linear-gradient(90deg, transparent 0 46%, rgba(255,250,230,0.9) 50%, transparent 54% 100%),
              linear-gradient(0deg, transparent 0 46%, rgba(255,250,230,0.9) 50%, transparent 54% 100%)`,
          }}
        />
      );
    })}
  </>
);
