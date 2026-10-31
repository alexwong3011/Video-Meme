import data from "./lyrics.json";

export type Word = { text: string; start: number; end: number };
export type Line = { words: Word[] };

export const LINES: Line[] = data.lines;
export const DURATION: number = data.duration;

export const ENTER = 0.5; // word entrance duration (s)
export const ENTER_LEAD = 0.18; // a word starts appearing this long before it is sung
export const FADE = 0.3; // word body fade during dissolve (s)
export const STAGGER_TOTAL = 0.32; // left→right dissolve spread across a line (s)

/** When line i starts to dissolve (song-synced, avoids overlapping the next line). */
export const dissolveStart = (i: number): number => {
  const w = LINES[i].words;
  const last = w[w.length - 1];
  const next = LINES[i + 1]?.words[0];
  if (!next) return Math.min(last.end + 0.25, DURATION - 1.4);
  return Math.max(last.start + 0.35, Math.min(last.end + 0.6, next.start - 0.45));
};

export const wordDissolve = (i: number, j: number): number => {
  const n = LINES[i].words.length;
  return dissolveStart(i) + (n > 1 ? (j / (n - 1)) * STAGGER_TOTAL : 0);
};
