import React from "react";
import { Easing, Img, interpolate, OffthreadVideo } from "remotion";
import { ASSETS, StillAsset, VideoAsset } from "./assets";
import { GRADES } from "./grades";
import { Leaves, Mist, Rain, Rays, Sparkle } from "./Overlays";
import { Dust } from "../LaThuTroi/Dust";
import type { Scene } from "./scenes";

const W = 1080;
const H = 1920;
export const PAD = 0.6; // seconds a scene runs before / after its slot (for transitions)

type Cam = { z: number; fx: number; fy: number };

const camera = (s: Scene, t: number): { cam: Cam; u: number } => {
  const u = interpolate(t, [s.start - PAD, s.end + PAD], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  return {
    u,
    cam: {
      z: s.z[0] + (s.z[1] - s.z[0]) * u,
      fx: s.f[0][0] + (s.f[1][0] - s.f[0][0]) * u,
      fy: s.f[0][1] + (s.f[1][1] - s.f[0][1]) * u,
    },
  };
};

/** Layer transform: cover-fit, zoom about the focus point, clamped to stay inside the picture. */
const layerStyle = (w: number, h: number, cam: Cam, extraZ = 1, dfx = 0, dfy = 0): React.CSSProperties => {
  const S = Math.max(W / w, H / h);
  const z = cam.z * extraZ;
  const dw = w * S * z;
  const dh = h * S * z;
  const hx = W / 2 / dw;
  const hy = H / 2 / dh;
  const fx = Math.min(1 - hx, Math.max(hx, cam.fx)) + dfx;
  const fy = Math.min(1 - hy, Math.max(hy, cam.fy)) + dfy;
  return {
    position: "absolute",
    left: 0,
    top: 0,
    width: w * S,
    height: h * S,
    transformOrigin: "0 0",
    transform: `translate(${W / 2 - fx * dw}px, ${H / 2 - fy * dh}px) scale(${z})`,
  };
};

const StillLayers: React.FC<{ a: StillAsset; s: Scene; t: number }> = ({ a, s, t }) => {
  const { cam, u } = camera(s, t);
  const g = GRADES[s.grade ?? "golden"];
  const par = s.par ?? 0.14;
  // foreground grows faster on push-ins and drifts further on pans → depth
  const zr = cam.z / s.z[0] - 1;
  const fgZ = 1 + zr * par * 0.9 + par * 0.07 * u * (s.asset === "palace" ? 0.5 : 1);
  const dfx = (cam.fx - s.f[0][0]) * par * 0.35;
  const S = Math.max(W / a.w, H / a.h);
  const lw = a.w * S;
  const lh = a.h * S;
  const flip: React.CSSProperties = s.mirror ? { transform: "scaleX(-1)" } : {};
  return (
    <>
      <div style={{ position: "absolute", inset: 0, filter: g.filter, ...flip }}>
        <div style={layerStyle(a.w, a.h, cam)}>
          <Img src={a.bg} style={{ width: "100%", height: "100%", display: "block" }} />
          {a.water && s.fx?.includes("sparkle") && (
            <Sparkle t={t} seed={`w${s.id}`} x0={a.water[0] * lw} y0={a.water[1] * lh} x1={a.water[2] * lw} y1={a.water[3] * lh} />
          )}
        </div>
        <div style={layerStyle(a.w, a.h, cam, fgZ, dfx, 0)}>
          <Img src={a.fg} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{ ...layerStyle(a.w, a.h, cam), mixBlendMode: "screen", opacity: g.bloom }}>
          <Img src={a.bloom} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        {g.overlays.map((o, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, ...o }} />
        ))}
      </div>
      {/* lantern glows sit above the grade so they stay luminous at night */}
      {a.glows.length > 0 && (
        <div style={{ position: "absolute", inset: 0, ...flip }}>
          <div style={{ ...layerStyle(a.w, a.h, cam, fgZ, dfx, 0), mixBlendMode: "screen" }}>
            {a.glows.map((gl, i) => {
              const flick = 0.85 + 0.15 * Math.sin(t * 7.3 + i * 2) * Math.sin(t * 3.1 + i);
              const r = gl.r * lw * 2.4;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: gl.x * lw - r,
                    top: gl.y * lh - r,
                    width: r * 2,
                    height: r * 2,
                    borderRadius: "50%",
                    opacity: g.glow * flick,
                    background: "radial-gradient(circle, rgba(255,190,110,0.95) 0%, rgba(255,120,50,0.5) 22%, rgba(255,90,30,0) 62%)",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

const VideoLayer: React.FC<{ a: VideoAsset; s: Scene; t: number; fps: number }> = ({ a, s, t, fps }) => {
  const { cam } = camera(s, t);
  const g = GRADES[s.grade ?? "golden"];
  const [i0, i1] = s.src ?? [0, 10];
  const slot = s.end - s.start + 2 * PAD;
  const rate = Math.min(1, (i1 - i0) / slot);
  return (
    <div style={{ position: "absolute", inset: 0, filter: g.filter, transform: s.mirror ? "scaleX(-1)" : undefined }}>
      <div style={layerStyle(a.w, a.h, cam)}>
        <OffthreadVideo
          src={a.src}
          muted
          startFrom={Math.round(i0 * fps)}
          playbackRate={rate}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {g.overlays.map((o, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, ...o }} />
      ))}
    </div>
  );
};

export const SceneView: React.FC<{ s: Scene; t: number; fps: number }> = ({ s, t, fps }) => {
  const a = ASSETS[s.asset];
  const lt = t - s.start;
  const fx = s.fx ?? [];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#000" }}>
      {a.kind === "still" ? <StillLayers a={a} s={s} t={t} /> : <VideoLayer a={a} s={s} t={t} fps={fps} />}
      {fx.includes("mist") && <Mist t={lt} seed={`m${s.id}`} />}
      {fx.includes("rays") && <Rays t={lt} seed={`r${s.id}`} />}
      {fx.includes("rain") && <Rain t={lt} seed={`rn${s.id}`} />}
      {fx.includes("leaves") && <Leaves t={lt} seed={`l${s.id}`} count={s.grade === "night" ? 8 : 16} />}
      {fx.includes("leavesHeavy") && <Leaves t={lt} seed={`lh${s.id}`} count={34} />}
      {fx.includes("dust") && <Dust t={lt + s.id * 7} count={22} />}
    </div>
  );
};
