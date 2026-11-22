// Headless check of the game: serves the project folder, swaps three.js for a local copy, exposes a test hook, runs a snippet, saves screenshots.
// usage: node tools/check.js SNIPPET.js [outdir] [--class fire] [--page test-build/index.html]
//   needs three@0.160.0 in THREE_DIR (default /tmp/three160/node_modules/three: `npm i three@0.160.0 --prefix /tmp/three160`)
//   SNIPPET.js: the body of an async function (pg, T, shot) — T is window.__T in the page (evaluate with pg.evaluate), shot(name, clip?) saves a PNG
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), THREE_DIR = process.env.THREE_DIR || '/tmp/three160/node_modules/three';
const args = process.argv.slice(2), snip = fs.readFileSync(args[0], 'utf8'), OUT = args[1] && !args[1].startsWith('--') ? args[1] : '/tmp/ngah-shots';
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d), CLS = opt('--class', 'fire'), PAGE = opt('--page', 'index.html');
// the hook: put after "const CAM_ZOOM" (late in the module, every name it lists exists by then)
const HOOK = "window.__sim = (sec, dt = 0.05) => { for (let i = 0, n = Math.round(sec / dt); i < n; i++) { S.time += dt; updateHero(dt, S.time); updateMobs(dt, S.time); updateLoot(dt, S.time); updateProjs(dt); updSkills(dt); FX3.update(dt, S.time); } }; window.__T = { get S() { return S; }, get HS() { return HS; }, get BOSS3D() { return BOSS3D; }, get MT() { return MT; }, get MAPS() { return MAPS; }, get mobs() { return mobs; }, get castSkill() { return castSkill; }, get attack() { return attack; }, get ROSTER() { return ROSTER; }, get CUR() { return CUR; }, KN, ents, travel, recalc, applyGearVisuals, openBag, makeGear, makeCharm, makeWing, addItem, dropLoot, newBots, botKit, camera, heroG, FX3 };\n";
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const [VW, VH] = (process.env.VIEW || '430x860').split('x').map(Number); const pg = await b.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: VW > 800 ? 1 : 2 });
  const errs = []; pg.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errs.push(m.text()); }); pg.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await pg.route('**/*', r => { const u = new URL(r.request().url());
    if (u.hostname === 'cdn.jsdelivr.net') return r.fulfill({ path: path.join(THREE_DIR, u.pathname.replace(/^\/npm\/three@[^/]+\//, '')), contentType: 'application/javascript' });
    if (u.hostname === 'game.local') { const p = decodeURIComponent(u.pathname);
      if (p === '/' || p.endsWith('index.html')) { let h = fs.readFileSync(path.join(ROOT, PAGE), 'utf8'); const i = h.indexOf('const CAM_ZOOM'); const j = h.indexOf('\n', i) + 1; h = h.slice(0, j) + HOOK + h.slice(j); return r.fulfill({ body: h, contentType: 'text/html' }); }
      return r.fulfill({ path: path.join(ROOT, p) }); }
    return r.abort(); });
  await pg.goto('http://game.local/'); await pg.waitForTimeout(3000);
  await pg.evaluate(c => { (document.querySelector('[data-newslot]') || document.getElementById('newBtn')).click(); document.querySelector(`#classList button[data-c="${c}"]`).click(); document.getElementById('classGo').click(); }, CLS);
  for (let i = 0; i < 90; i++) { if (await pg.evaluate(c => window.__T && (c !== 'fire' || __T.KN.on), CLS)) break; await pg.waitForTimeout(1000); }
  const shot = async (name, clip) => pg.screenshot({ path: path.join(OUT, name + '.png'), ...(clip ? { clip } : {}) });
  await (new Function('pg', 'shot', 'return (async () => {' + snip + '})()'))(pg, shot);
  console.log('errors:', errs.slice(0, 10).join('\n') || 'none'); await b.close();
})();
