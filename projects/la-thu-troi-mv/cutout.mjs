import { createRequire } from "node:module";
const req = createRequire(process.env.BGRM_DIR + "/package.json");
const { removeBackground } = await import(req.resolve("@imgly/background-removal-node"));
import fs from "node:fs";
import path from "node:path";
const [,, outDir, ...files] = process.argv;
for (const f of files) {
  const t = Date.now();
  const blob = await removeBackground(path.resolve(f), { publicPath: "file://" + process.env.BGRM_DIR + "/node_modules/@imgly/background-removal-node/dist/", model: "medium", output: { format: "image/png", quality: 1 } });
  const out = path.join(outDir, path.basename(f, path.extname(f)) + ".png");
  fs.writeFileSync(out, Buffer.from(await blob.arrayBuffer()));
  console.log(out, ((Date.now() - t) / 1000).toFixed(1) + "s");
}
