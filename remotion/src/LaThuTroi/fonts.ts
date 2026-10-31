import { continueRender, delayRender, staticFile } from "remotion";

export const FONT = "Playfair Display";

const faces: Array<[string, string, string]> = [
  ["PlayfairDisplay-Bold.ttf", "700", "normal"],
  ["PlayfairDisplay-ExtraBold.ttf", "800", "normal"],
  ["PlayfairDisplay-BoldItalic.ttf", "700", "italic"],
  ["PlayfairDisplay-BlackItalic.ttf", "900", "italic"],
];

const handle = delayRender("Loading Playfair Display");
Promise.all(
  faces.map(([file, weight, style]) =>
    new FontFace(FONT, `url(${staticFile(`fonts/${file}`)})`, { weight, style })
      .load()
      .then((f) => document.fonts.add(f)),
  ),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
