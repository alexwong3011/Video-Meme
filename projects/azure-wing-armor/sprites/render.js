// Bake the 2.5D sprite frames from knight-3d.html#sprites (three.js, headless Chromium).
// usage: node render.js OUT_DIR mode[,mode...]     needs playwright + a local copy of three@0.147.0 (THREE_DIR)
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), OUT = process.argv[2], MODES = process.argv[3].split(','), NM = process.env.THREE_DIR;
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.glb': 'model/gltf-binary', '.js': 'text/javascript' };
const send = (r, fp) => fs.existsSync(fp) ? r.fulfill({ status: 200, contentType: types[path.extname(fp)] || 'application/octet-stream', body: fs.readFileSync(fp) }) : r.fulfill({ status: 404, body: '' });
const TAU = Math.PI * 2;
const DIRS = [['s', 0], ['se', Math.PI / 4], ['e', Math.PI / 2], ['ne', 3 * Math.PI / 4], ['n', Math.PI]];   // sw, w, nw are mirrors
function clips(nAtk) {
  const c = {
    idle: [...Array(6)].map((_, k) => ({ clock: k / 6 * TAU / 1.7 })),
    walk: [...Array(8)].map((_, k) => ({ walk: 1, phase: k / 8 * TAU })),
    run: [...Array(6)].map((_, k) => ({ walk: 1, run: 1, phase: k / 6 * TAU })),
    castS: [{ cast: 'single', pulse: 1 }, { cast: 'single', pulse: 0.15 }],
    castA: [{ cast: 'aoe', pulse: 1 }, { cast: 'aoe', pulse: 0.15 }],
    chop: [...Array(10)].map((_, k) => ({ atk: 'chop', u: (k + 0.5) / 10 })),
    rain: [...Array(8)].map((_, k) => ({ atk: 'rain', u: (k + 0.5) / 8, thrown: (k + 0.5) / 8 >= 0.3 })),
    fly: [...Array(6)].map((_, k) => ({ fly: 1, flap: k / 6 })),
    flym: [...Array(6)].map((_, k) => ({ fly: 1, flap: k / 6, speed: 3 })),
  };
  for (let a = 0; a < nAtk; a++) c['atk' + a] = [...Array(8)].map((_, k) => ({ atk: a, u: (k + 0.5) / 8 }));
  return c;
}
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 400, height: 400 } });
  await p.route('http://local.test/**', r => send(r, path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname))));
  await p.route('https://cdn.jsdelivr.net/npm/three@0.147.0/**', r => send(r, path.join(NM, new URL(r.request().url()).pathname.replace('/npm/three@0.147.0', ''))));
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await p.goto('http://local.test/knight-3d.html#sprites');
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
  for (const mode of MODES) {
    const info = await p.evaluate(m => ({ attacks: ATTACKS[m].map(a => ({ name: a.name, dur: a.dur, dmg: a.dmg, hit: a.hit, heavy: !!a.heavy, hands: Object.keys(a.hands) })),
      chop: chopDef(m).dur, rain: rainDef(m).dur, spr: { W: SPR.W, H: SPR.H, PPM: SPR.PPM } }), mode);
    const C = clips(info.attacks.length), meta = { mode, ...info, dirs: DIRS.map(d => d[0]), clips: {}, frames: {} };
    for (const [cl, list] of Object.entries(C)) meta.clips[cl] = list.length;
    let n = 0; const t0 = Date.now();
    for (const [dname, yaw] of DIRS) {
      const dir = path.join(OUT, mode, dname); fs.mkdirSync(dir, { recursive: true });
      for (const [cl, list] of Object.entries(C)) for (let k = 0; k < list.length; k++) {
        const r = await p.evaluate(st => spriteFrame(st), { mode, yaw, ...list[k] });
        fs.writeFileSync(path.join(dir, `${cl}_${k}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
        meta.frames[`${dname}/${cl}/${k}`] = r.meta; n++;
      }
      console.log(mode, dname, n, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
    fs.writeFileSync(path.join(OUT, mode, 'meta.json'), JSON.stringify(meta));
  }
  await b.close();
})();
