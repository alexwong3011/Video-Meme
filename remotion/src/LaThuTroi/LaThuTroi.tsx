import React from "react";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { Dust } from "./Dust";
import { GoldWord } from "./GoldWord";
import { ENTER_LEAD, LINES, wordDissolve } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Title: React.FC<{ t: number }> = ({ t }) => {
  const words = ["Lá", "Thu", "Trôi"];
  const sub = interpolate(t, [0.9, 1.8, 7.6, 8.4], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {words.map((w, j) => (
          <GoldWord
            key={w}
            text={w}
            t={t}
            appear={0.25 + j * 0.22}
            sung={0.9 + j * 0.25}
            dissolve={8.0 + j * 0.18}
            seed={`title-${j}`}
            fontSize={138}
            italic
            weight={900}
            sparkCount={30}
            sparkScale={1.4}
          />
        ))}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: "0.32em",
          color: "#fff1c9",
          opacity: sub,
          textShadow: "0 2px 6px rgba(0,0,0,0.8), 0 0 18px rgba(255,200,100,0.45)",
        }}
      >
        — hồng diệp đề thi —
      </div>
    </div>
  );
};

export const LaThuTroi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile("la-thu-troi/bg.mp4")} />
      <Audio src={staticFile("la-thu-troi/hook.m4a")} />
      {/* legibility gradients */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(12,6,0,0.55) 0%, rgba(12,6,0,0) 22%, rgba(12,6,0,0) 52%, rgba(12,6,0,0.5) 74%, rgba(8,4,0,0.78) 100%)",
        }}
      />
      <Dust t={t} />
      {t < 10.5 && <Title t={t} />}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 210,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignContent: "flex-end",
          rowGap: 4,
        }}
      >
        {LINES.map((line, i) => {
          const first = line.words[0].start - ENTER_LEAD;
          const end = wordDissolve(i, line.words.length - 1) + 2.4;
          if (t < first - 0.05 || t > end) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                rowGap: 2,
              }}
            >
              {line.words.map((w, j) => (
                <GoldWord
                  key={j}
                  text={w.text}
                  t={t}
                  appear={w.start - ENTER_LEAD}
                  sung={w.start}
                  dissolve={wordDissolve(i, j)}
                  seed={`l${i}-w${j}`}
                  fontSize={74}
                />
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
