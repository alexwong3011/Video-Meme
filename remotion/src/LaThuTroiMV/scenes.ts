import beatsData from "./beats.json";
import type { AssetName } from "./assets";
import type { GradeName } from "./grades";

export type FX = "leaves" | "leavesHeavy" | "rain" | "rays" | "mist" | "sparkle" | "dust";
export type SceneSpec = {
  bars: number;
  asset: AssetName;
  z: [number, number]; // zoom start → end
  f: [[number, number], [number, number]]; // focus point start → end (fractions of the asset)
  grade?: GradeName;
  fx?: FX[];
  par?: number; // parallax strength (stills)
  mirror?: boolean;
  src?: [number, number]; // video: source in/out seconds (played to fill the scene)
  trans?: "fade" | "flash" | "slow"; // transition INTO this scene
};

const S = (bars: number, asset: AssetName, z: [number, number], f0: [number, number], f1: [number, number], o: Partial<SceneSpec> = {}): SceneSpec => ({
  bars, asset, z, f: [f0, f1], grade: "golden", fx: ["leaves", "dust"], par: 0.14, ...o,
});

// Song structure (86 BPM, bar ≈ 2.79 s): intro 8 · verse1 8 · verse2 7 · chorus1 19 · bridge 6 ·
// verse3 8 · verse4 9 · chorus2 17 · outro1 8 · half-chorus 9 · outro2 (to the end)
export const SPECS: SceneSpec[] = [
  // ── Intro: dawn over the palace (title)
  S(2, "palace", [1.3, 1.14], [0.56, 0.2], [0.55, 0.24], { grade: "dawn", fx: ["rays", "leaves", "dust"], trans: "slow" }),
  S(3, "palace", [1.0, 1.04], [0.17, 0.55], [0.46, 0.5], { grade: "dawn", fx: ["rays", "leaves", "dust", "sparkle"] }),
  S(3, "palace", [1.1, 1.34], [0.5, 0.45], [0.5, 0.34], { fx: ["leaves", "dust"], par: 0.08 }),
  // ── Verse 1: night in the palace, the leaf set adrift
  S(2, "palace", [1.22, 1.32], [0.27, 0.55], [0.3, 0.5], { grade: "night", fx: ["leaves", "dust"], trans: "slow" }),
  S(2, "palace", [1.2, 1.12], [0.82, 0.55], [0.6, 0.45], { grade: "night", fx: ["leaves", "dust"] }),
  S(2, "stream", [1.6, 1.75], [0.53, 0.2], [0.53, 0.18], { grade: "dusk", fx: ["leaves", "dust"], par: 0.1 }),
  S(2, "stream", [1.7, 1.9], [0.27, 0.55], [0.3, 0.66], { fx: ["leaves", "sparkle", "dust"], par: 0.1 }),
  // ── Verse 2: lamp-lit study, the pier at dusk
  S(2, "palace", [2.2, 2.0], [0.394, 0.62], [0.394, 0.6], { grade: "night", fx: ["dust", "mist"] }),
  S(2, "boat", [1.05, 1.16], [0.5, 0.5], [0.5, 0.46], { grade: "dusk", fx: ["leaves", "mist", "sparkle"] }),
  S(3, "boat", [1.7, 1.85], [0.43, 0.27], [0.44, 0.25], { grade: "dusk", fx: ["leaves", "dust"], par: 0.16 }),
  // ── Chorus 1: golden, walking the bridge
  S(3, "walk", [1.0, 1.08], [0.5, 0.5], [0.5, 0.46], { src: [0, 5], trans: "flash", fx: ["leaves", "dust"] }),
  S(2, "stream", [1.0, 1.12], [0.5, 0.5], [0.52, 0.45], { fx: ["leaves", "sparkle", "rays"], par: 0.16 }),
  S(2, "boat", [1.1, 1.22], [0.42, 0.5], [0.47, 0.45], { fx: ["leaves", "rays", "sparkle"], par: 0.18 }),
  S(2, "walk", [1.45, 1.55], [0.45, 0.3], [0.6, 0.25], { src: [5.5, 9.5], fx: ["leaves", "dust"] }),
  S(2, "palace", [1.15, 1.05], [0.5, 0.5], [0.5, 0.48], { fx: ["leaves", "dust"], par: 0.08 }),
  S(3, "bridge", [1.15, 1.3], [0.42, 0.42], [0.4, 0.36], { fx: ["leaves", "sparkle", "dust"], par: 0.1 }),
  S(2, "stream", [1.5, 1.55], [0.52, 0.22], [0.32, 0.5], { fx: ["leaves", "dust"], par: 0.12 }),
  S(3, "walk", [1.1, 1.14], [0.5, 0.48], [0.5, 0.45], { src: [1.5, 7], mirror: true, fx: ["leaves", "dust"] }),
  // ── Bridge (vocalise): dreamlike, storm of leaves
  S(2, "stream", [1.45, 1.2], [0.5, 0.12], [0.5, 0.2], { grade: "dream", fx: ["rays", "leavesHeavy", "dust"], trans: "flash" }),
  S(2, "palace", [1.4, 1.62], [0.62, 0.22], [0.58, 0.2], { grade: "dream", fx: ["rays", "leavesHeavy"], par: 0.08 }),
  S(2, "bridge", [1.5, 1.05], [0.45, 0.35], [0.5, 0.5], { grade: "dream", fx: ["leavesHeavy", "sparkle", "rays"], par: 0.14 }),
  // ── Verse 3: rain, separation
  S(2, "boat", [1.08, 1.16], [0.5, 0.45], [0.5, 0.42], { grade: "rain", fx: ["rain", "mist"], trans: "slow" }),
  S(2, "stream", [1.6, 1.7], [0.52, 0.22], [0.52, 0.2], { grade: "rain", fx: ["rain", "mist"], par: 0.12 }),
  S(2, "palace", [1.2, 1.2], [0.48, 0.45], [0.52, 0.45], { grade: "rain", fx: ["rain", "mist"], par: 0.08 }),
  S(2, "boat", [1.8, 1.6], [0.43, 0.27], [0.43, 0.3], { grade: "rain", fx: ["rain", "mist"], par: 0.15 }),
  // ── Verse 4: the decree, light returns, crossing the bridge
  S(2, "palace", [1.3, 1.1], [0.5, 0.5], [0.5, 0.47], { grade: "dawn", fx: ["rays", "leaves", "dust"], trans: "flash", par: 0.08 }),
  S(2, "palace", [1.22, 1.15], [0.28, 0.5], [0.48, 0.45], { fx: ["leaves", "dust"], par: 0.08 }),
  S(3, "walk", [1.0, 1.06], [0.5, 0.5], [0.5, 0.47], { src: [0, 6], fx: ["leaves", "dust", "rays"] }),
  S(2, "boat", [1.25, 1.04], [0.5, 0.48], [0.5, 0.5], { fx: ["rays", "leaves", "sparkle"], par: 0.16 }),
  // ── Chorus 2: the peak
  S(2, "stream", [1.15, 1.0], [0.5, 0.48], [0.5, 0.5], { fx: ["leaves", "sparkle", "rays"], trans: "flash", par: 0.16 }),
  S(2, "walk", [1.5, 1.62], [0.48, 0.27], [0.6, 0.22], { src: [6.5, 10], fx: ["leaves", "dust"] }),
  S(2, "palace", [1.0, 1.25], [0.5, 0.48], [0.5, 0.4], { fx: ["leaves", "dust"], par: 0.08 }),
  S(2, "boat", [1.25, 1.4], [0.45, 0.45], [0.44, 0.38], { fx: ["leaves", "sparkle"], par: 0.2 }),
  S(2, "bridge", [1.6, 1.4], [0.36, 0.3], [0.38, 0.33], { fx: ["leaves", "dust"], par: 0.12 }),
  S(2, "stream", [1.9, 1.7], [0.27, 0.55], [0.3, 0.6], { fx: ["leaves", "sparkle"], par: 0.1 }),
  S(3, "walk", [1.08, 1.0], [0.5, 0.46], [0.5, 0.5], { src: [0, 6], mirror: true, fx: ["leaves", "dust", "rays"] }),
  S(2, "palace", [1.18, 1.25], [0.8, 0.5], [0.9, 0.42], { grade: "dusk", fx: ["leaves", "dust"], par: 0.08 }),
  // ── Outro 1: "Chạm bàn tay … hồng diệp nay se trọn kiếp"
  S(3, "stream", [2.0, 2.2], [0.32, 0.52], [0.3, 0.54], { grade: "dream", fx: ["dust", "sparkle"], trans: "slow", par: 0.08 }),
  S(2, "boat", [1.7, 1.7], [0.42, 0.28], [0.45, 0.26], { fx: ["leaves", "dust"], par: 0.14 }),
  S(3, "bridge", [1.3, 1.05], [0.42, 0.4], [0.5, 0.5], { fx: ["rays", "leaves", "sparkle"], par: 0.12 }),
  // ── Half chorus: memories of the palace walls
  S(2, "palace", [2.0, 1.85], [0.757, 0.6], [0.74, 0.58], { grade: "night", fx: ["dust", "mist"], trans: "flash" }),
  S(2, "stream", [1.1, 1.18], [0.5, 0.5], [0.48, 0.46], { grade: "dusk", fx: ["leaves", "sparkle"], par: 0.16 }),
  S(2, "walk", [1.12, 1.2], [0.5, 0.42], [0.52, 0.38], { src: [4, 9], fx: ["leaves", "dust"] }),
  S(3, "palace", [1.06, 1.06], [0.85, 0.5], [0.16, 0.55], { grade: "dusk", fx: ["leaves", "dust"], par: 0.08 }),
  // ── Outro 2: sunset, the leaf drifts away
  S(3, "stream", [1.8, 1.9], [0.3, 0.6], [0.25, 0.76], { grade: "sunset", fx: ["leaves", "sparkle"], trans: "slow", par: 0.1 }),
  S(3, "boat", [1.3, 1.02], [0.47, 0.46], [0.5, 0.5], { grade: "sunset", fx: ["leaves", "rays", "sparkle"], par: 0.16 }),
  S(4, "bridge", [1.4, 1.0], [0.42, 0.38], [0.5, 0.5], { grade: "sunset", fx: ["leaves", "rays", "sparkle", "dust"], par: 0.12 }),
];

export const SONG_END = 306.48;
const beats: number[] = beatsData.beats;
const barTime = (k: number) => (4 * k < beats.length ? beats[4 * k] : beats[beats.length - 1] + (4 * k - beats.length + 1) * 0.697);

export type Scene = SceneSpec & { start: number; end: number; id: number };
export const SCENES: Scene[] = (() => {
  let bar = 0;
  return SPECS.map((s, i) => {
    const start = i === 0 ? 0 : barTime(bar);
    bar += s.bars;
    const end = i === SPECS.length - 1 ? SONG_END : barTime(bar);
    return { ...s, start, end, id: i };
  });
})();
