// ESRGAN-thick 4x upscaler (TF.js + WASM), tiled with overlap.  usage: node upscale.mjs in.png out.png [scale]
import { createRequire } from "node:module";
import fs from "node:fs"; import path from "node:path";
const S = process.env.TOOLS;       // dir with up/ (tfjs + esrgan-thick) and bgrm/ (sharp) installs
const rq = createRequire(S + "/up/package.json");
const tf = rq("@tensorflow/tfjs"); rq("@tensorflow/tfjs-backend-wasm");
const sharp = createRequire(S + "/bgrm/package.json")("sharp");
const [,, inp, out, sc = "4"] = process.argv; const scale = +sc;
const wasmDir = path.dirname(rq.resolve("@tensorflow/tfjs-backend-wasm")) + "/";
tf.wasm = rq("@tensorflow/tfjs-backend-wasm"); tf.wasm.setWasmPaths(wasmDir);
await tf.setBackend("wasm"); await tf.ready();
const { Layer } = tf.layers;
class MultiplyBeta extends Layer { constructor(){super({});} call(x){ return tf.mul(Array.isArray(x)?x[0]:x, 0.2); } static className="MultiplyBeta"; }
class PS extends Layer { constructor(){super({});} computeOutputShape(s){return [s[0],s[1],s[2],3];} call(x){ return tf.depthToSpace(Array.isArray(x)?x[0]:x, scale, "NHWC"); } static className=`PixelShuffle${scale}x`; }
tf.serialization.registerClass(MultiplyBeta); tf.serialization.registerClass(PS);
const mdir = S + `/up/node_modules/@upscalerjs/esrgan-thick/models/x${scale}/`;
const mj = JSON.parse(fs.readFileSync(mdir + "model.json"));
const bufs = mj.weightsManifest.flatMap(g => g.paths).map(p => fs.readFileSync(mdir + p));
const wd = Buffer.concat(bufs); 
const model = await tf.loadLayersModel(tf.io.fromMemory({ modelTopology: mj.modelTopology, weightSpecs: mj.weightsManifest.flatMap(g => g.weights), weightData: wd.buffer.slice(wd.byteOffset, wd.byteOffset + wd.length) }));
const { data, info } = await sharp(inp).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, T = 96, P = 12;
const outBuf = new Float32Array(W*scale*H*scale*3);
const t0 = Date.now(); let n = 0; const total = Math.ceil(W/T)*Math.ceil(H/T);
for (let y = 0; y < H; y += T) for (let x = 0; x < W; x += T) {
  const x0 = Math.max(0, x-P), y0 = Math.max(0, y-P), x1 = Math.min(W, x+T+P), y1 = Math.min(H, y+T+P);
  const tw = x1-x0, th = y1-y0, tile = new Float32Array(tw*th*3);
  for (let j = 0; j < th; j++) for (let i = 0; i < tw; i++) for (let c = 0; c < 3; c++) tile[(j*tw+i)*3+c] = data[((y0+j)*W+x0+i)*3+c]/255;
  const r = tf.tidy(() => model.predict(tf.tensor4d(tile, [1, th, tw, 3])));
  const o = await r.data(); r.dispose();
  const ow = tw*scale;
  const cx0 = (x-x0)*scale, cy0 = (y-y0)*scale, cw = Math.min(T, W-x)*scale, ch = Math.min(T, H-y)*scale;
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) for (let c = 0; c < 3; c++)
    outBuf[((y*scale+j)*W*scale + x*scale+i)*3+c] = o[((cy0+j)*ow+cx0+i)*3+c];
  if (++n % 10 === 0) console.error(`${n}/${total} ${((Date.now()-t0)/1000).toFixed(0)}s`);
}
const u8 = Buffer.alloc(outBuf.length); for (let k = 0; k < outBuf.length; k++) u8[k] = Math.max(0, Math.min(255, Math.round(outBuf[k]*255)));
await sharp(u8, { raw: { width: W*scale, height: H*scale, channels: 3 } }).png().toFile(out);
console.log(out, ((Date.now()-t0)/1000).toFixed(1)+"s");
