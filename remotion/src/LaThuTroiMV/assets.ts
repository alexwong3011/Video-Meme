import { staticFile } from "remotion";

export type Rect = [number, number, number, number]; // x0, y0, x1, y1 (fractions of the image)
export type StillAsset = {
  kind: "still";
  w: number;
  h: number;
  bg: string;
  fg: string;
  bloom: string;
  glows: Array<{ x: number; y: number; r: number }>; // lantern / lamp glow points
  water?: Rect; // where to twinkle sunlight on water
};
export type VideoAsset = { kind: "video"; w: number; h: number; src: string; fps: number };
export type Asset = StillAsset | VideoAsset;

const still = (name: string, w: number, h: number, extra: Partial<StillAsset> = {}): StillAsset => ({
  kind: "still",
  w,
  h,
  bg: staticFile(`mv/${name}-bg.jpg`),
  fg: staticFile(`mv/${name}-fg.png`),
  bloom: staticFile(`mv/${name}-bloom.jpg`),
  glows: [],
  ...extra,
});

export const ASSETS = {
  palace: still("palace", 1792, 1008, {
    glows: [
      { x: 0.394, y: 0.655, r: 0.05 },
      { x: 0.757, y: 0.635, r: 0.05 },
    ],
    water: [0.0, 0.72, 0.17, 1.0],
  }),
  stream: still("stream", 1152, 1712, { water: [0.0, 0.56, 0.45, 0.97] }),
  boat: still("boat", 1152, 1712, { water: [0.0, 0.36, 0.3, 0.62] }),
  bridge: still("bridge", 784, 1168, { water: [0.25, 0.72, 0.85, 0.99] }),
  walk: { kind: "video", w: 1080, h: 1608, src: staticFile("mv/walk.mp4"), fps: 48 } as VideoAsset,
};
export type AssetName = keyof typeof ASSETS;
