import React from "react";
import { random, useVideoConfig } from "remotion";

/** Slow floating gold dust / bokeh over the whole frame (deterministic). */
export const Dust: React.FC<{ t: number; count?: number }> = ({ t, count = 34 }) => {
  const { width, height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, k) => {
        const r = (n: number) => random(`dust-${k}-${n}`);
        const depth = 0.35 + r(1) * 0.65;
        const size = 2 + depth * 7;
        const vx = (r(2) - 0.5) * 18 * depth;
        const vy = -(6 + r(3) * 16) * depth;
        const x = (((r(4) * width + vx * t + Math.sin(t * 0.4 + r(5) * 6) * 20) % width) + width) % width;
        const y = (((r(6) * height + vy * t) % height) + height) % height;
        const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + r(7) * 1.6) + r(8) * 6.28);
        const a = (0.12 + depth * 0.33) * (0.4 + 0.6 * tw);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255,240,200,${a}) 0%, rgba(255,200,100,${a * 0.6}) 40%, rgba(255,190,90,0) 70%)`,
              filter: depth < 0.6 ? "blur(1.5px)" : undefined,
            }}
          />
        );
      })}
    </div>
  );
};
