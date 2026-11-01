import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "../LaThuTroi/fonts";
import { GoldWord } from "../LaThuTroi/GoldWord";
import { PAD, SceneView } from "./Scene";
import { SCENES, SONG_END } from "./scenes";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Title: React.FC<{ t: number; appear: number; dissolve: number; top: number }> = ({ t, appear, dissolve, top }) => {
  const words = ["Lá", "Thu", "Trôi"];
  const sub = interpolate(t, [appear + 0.8, appear + 1.8, dissolve - 0.6, dissolve + 0.2], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {words.map((w, j) => (
          <GoldWord
            key={w}
            text={w}
            t={t}
            appear={appear + j * 0.35}
            sung={appear + 0.8 + j * 0.3}
            dissolve={dissolve + j * 0.2}
            seed={`mvtitle-${appear}-${j}`}
            fontSize={150}
            italic
            weight={900}
            sparkCount={34}
            sparkScale={1.5}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: "0.32em",
          color: "#fff1c9",
          opacity: sub,
          textShadow: "0 2px 8px rgba(0,0,0,0.85), 0 0 18px rgba(255,200,100,0.45)",
        }}
      >
        — hồng diệp đề thi —
      </div>
    </div>
  );
};

export const MV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const fadeIn = interpolate(t, [0, 2.2], [1, 0], clamp);
  const fadeOut = interpolate(t, [SONG_END - 3.5, SONG_END - 0.3], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("mv/song.m4a")} />
      {SCENES.map((s, i) => {
        const from = Math.max(0, Math.floor((s.start - PAD) * fps));
        const to = Math.ceil((s.end + PAD) * fps);
        const trans = s.trans ?? "fade";
        const tl = trans === "slow" ? 1.6 : 1.0;
        const opacity = i === 0 ? 1 : interpolate(t, [s.start - tl / 2, s.start + tl / 2], [0, 1], clamp);
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} layout="none">
            <AbsoluteFill style={{ opacity }}>
              <SceneView s={s} t={t} fps={fps} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      {/* light flash on accented cuts */}
      {SCENES.filter((s) => s.trans === "flash").map((s) => {
        const a = interpolate(t, [s.start - 0.35, s.start, s.start + 0.7], [0, 0.85, 0], clamp);
        return a > 0 ? (
          <AbsoluteFill
            key={`f${s.id}`}
            style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,246,220,1), rgba(255,210,140,0.8) 60%, rgba(255,180,90,0.6))", opacity: a, mixBlendMode: "screen" }}
          />
        ) : null;
      })}
      {/* vignette + letterbox softness */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
      {t > 4 && t < 22 && <Title t={t} appear={5.2} dissolve={19.5} top={240} />}
      {t > 290 && <Title t={t} appear={294.5} dissolve={303.4} top={300} />}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};
