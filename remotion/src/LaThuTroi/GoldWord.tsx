import React from "react";
import { Easing, interpolate, random } from "remotion";
import { FONT } from "./fonts";
import { Sparks } from "./Sparks";

const GOLD_FACE =
  "linear-gradient(180deg, #fffef6 0%, #fff0b8 12%, #ffd86b 28%, #e6a93a 42%, #8a5410 49.5%, #5a3305 52%, #b47a22 58%, #f2c55c 70%, #ffe8a2 84%, #fffae2 100%)";
const SHEEN =
  "linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,250,0.95) 50%, rgba(255,255,255,0) 60%, rgba(255,255,255,0) 100%)";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Sheen position: sweeps once when the word is sung, then every `period` seconds. */
const sheenPos = (t: number, sung: number, delay: number, period = 3.2): number => {
  const sweep = 0.7;
  const local = t - sung;
  if (local >= 0 && local < sweep) return 1.15 - (local / sweep) * 1.3;
  const p = ((t - delay) % period + period) % period;
  if (p < sweep && t > sung + sweep) return 1.15 - (p / sweep) * 1.3;
  return 1.3; // parked off the left side
};

export type GoldWordProps = {
  text: string;
  t: number; // current time (s)
  appear: number; // start of entrance
  sung: number; // sing time (sheen sweep)
  dissolve: number; // start of dissolve
  seed: string;
  fontSize: number;
  italic?: boolean;
  weight?: number;
  sparkCount?: number;
  sparkScale?: number;
  letterSpacing?: string;
};

export const GoldWord: React.FC<GoldWordProps> = ({
  text,
  t,
  appear,
  sung,
  dissolve,
  seed,
  fontSize,
  italic = false,
  weight = 700,
  sparkCount,
  sparkScale = 1,
  letterSpacing = "0.01em",
}) => {
  const enter = interpolate(t, [appear, appear + 0.5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(t, [dissolve, dissolve + 0.3], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const visible = enter * (1 - out);
  const sp = sheenPos(t, sung, random(`${seed}-sheen`) * 3.2);
  const flash = interpolate(t, [sung, sung + 0.15, sung + 0.7], [0, 1, 0], clamp);
  const count = sparkCount ?? Math.max(12, Math.min(24, Math.round(text.length * 2.4)));

  const font: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: weight,
    fontStyle: italic ? "italic" : "normal",
    fontSize,
    lineHeight: 1.18,
    letterSpacing,
    whiteSpace: "pre",
  };

  // Glint: a 4-point star that flares on the word when it is sung.
  const glintT = t - (sung + 0.25);
  const glint = glintT > 0 && glintT < 0.6 ? Math.sin((glintT / 0.6) * Math.PI) * (1 - out) : 0;

  return (
    <span style={{ position: "relative", display: "inline-block", margin: `0 ${fontSize * 0.13}px` }}>
      {(
        <span
          style={{
            position: "relative",
            display: "inline-block",
            visibility: visible > 0.001 ? "visible" : "hidden",
            opacity: visible,
            transform: `translateY(${(1 - enter) * 22}px) scale(${0.96 + enter * 0.04 + out * 0.08})`,
            filter: `blur(${(1 - enter) * 9 + out * 6}px) brightness(${1 + flash * 0.25 + out * 0.9})`,
          }}
        >
          {/* depth / extrusion layer */}
          <span
            aria-hidden
            style={{
              ...font,
              position: "absolute",
              inset: 0,
              color: "#3a2306",
              textShadow: [
                "0 0 3px rgba(30,14,0,0.95)",
                "0 1px 0 #8a5a16",
                "0 2px 0 #6e4610",
                "0 3px 0 #58380b",
                "0 4px 1px #432a07",
                "0 7px 10px rgba(0,0,0,0.75)",
                "0 12px 26px rgba(0,0,0,0.55)",
                "0 0 30px rgba(255,186,80,0.35)",
              ].join(","),
            }}
          >
            {text}
          </span>
          {/* polished gold face + moving sheen */}
          <span
            style={{
              ...font,
              position: "relative",
              display: "inline-block",
              color: "transparent",
              backgroundImage: `${SHEEN}, ${GOLD_FACE}`,
              backgroundSize: "300% 100%, 100% 100%",
              backgroundPosition: `${sp * 100}% 0, 0 0`,
              backgroundRepeat: "no-repeat",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextStroke: `${Math.max(0.8, fontSize / 70)}px rgba(255, 238, 185, 0.55)`,
              filter: `drop-shadow(0 0 ${fontSize * 0.09}px rgba(255, 210, 120, ${0.45 + flash * 0.4}))`,
            }}
          >
            {text}
          </span>
          {glint > 0 && (
            <span
              style={{
                position: "absolute",
                left: `${20 + random(`${seed}-gx`) * 60}%`,
                top: `${18 + random(`${seed}-gy`) * 20}%`,
                width: fontSize * 0.9,
                height: fontSize * 0.9,
                marginLeft: -fontSize * 0.45,
                marginTop: -fontSize * 0.45,
                opacity: glint,
                transform: `scale(${0.3 + glint * 0.9}) rotate(${glintT * 60}deg)`,
                background: `radial-gradient(circle, #fff 0 6%, rgba(255,230,160,0.8) 12%, rgba(255,200,90,0) 30%),
                  linear-gradient(90deg, transparent 0 47%, rgba(255,250,225,1) 50%, transparent 53% 100%),
                  linear-gradient(0deg, transparent 0 47%, rgba(255,250,225,1) 50%, transparent 53% 100%)`,
                filter: "drop-shadow(0 0 6px rgba(255,220,140,0.9))",
              }}
            />
          )}
        </span>
      )}
      <Sparks seed={seed} t={t - dissolve - 0.05} count={count} scale={sparkScale} />
    </span>
  );
};
