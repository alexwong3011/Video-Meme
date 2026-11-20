
// =====================================================================
// UNICORN LAB — four candidate designs for the Kỳ Lân mount, live in the game engine.
// Bodies are swept along a spine curve (not stacked spheres) for a slim horse silhouette.
// =====================================================================
document.head.insertAdjacentHTML('beforeend', `<style>
body.lab #game{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}body.lab #game canvas{width:100%!important;height:100%!important}
body.lab #labels,body.lab #hud,body.lab .ov{display:none!important}
#labUI{position:fixed;inset:0;pointer-events:none;z-index:20;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr}
#labUI .cell{position:relative;border:1px solid rgba(242,198,107,.35)}
#labUI .tag{position:absolute;left:8px;top:calc(8px + env(safe-area-inset-top,0px));max-width:calc(100% - 16px);padding:5px 10px;border-radius:12px;background:rgba(4,16,22,.84);border:1px solid rgba(242,198,107,.55)}
#labUI .tag b{display:block;font:700 13px var(--display);color:#ffe7a8;letter-spacing:.04em}#labUI .tag span{font:600 10.5px/1.35 var(--ui);color:#cfe6ee}
#labBar{position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:21;display:flex;gap:6px}
#labBar button{font:700 12px var(--ui);color:#fbeecb;background:rgba(4,16,22,.9);border:1px solid rgba(242,198,107,.6);border-radius:10px;padding:8px 12px}
</style>`);
document.body.classList.add('lab');
const DES = [
  { id: 'A', n: 'A · Thiên Mã Bạch Ngọc', d: 'Ngựa trắng ngọc thon dài, sừng xoắn vàng, bờm và đuôi lụa cầu vồng, cổ chân tỏa sáng.' },
  { id: 'B', n: 'B · Kỳ Lân Phương Đông', d: 'Thân vảy ngọc bích viền vàng, sừng cong, bờm và đuôi lửa vàng, móng mây lửa.' },
  { id: 'C', n: 'C · Tinh Linh Pha Lê', d: 'Thân pha lê trong, sao lấp lánh bên trong, sừng tinh thể, bờm cực quang.' },
  { id: 'D', n: 'D · Thánh Mã Có Cánh', d: 'Trắng vàng, giáp ngực, sừng xoắn, đôi cánh lông vũ sóng cầu vồng như cánh nhân vật.' }];
document.body.insertAdjacentHTML('beforeend', `<div id="labUI">${DES.map(d => `<div class="cell"><div class="tag"><b>${d.n}</b><span>${d.d}</span></div></div>`).join('')}</div>
  <div id="labBar"><button id="labRun">Phi nước đại: BẬT</button><button id="labSpin">Xoay: BẬT</button></div>`);

// ---------- geometry helpers ----------
const XA = new THREE.Vector3(1, 0, 0);
function sweep(pts, prof, segs = 56, rad = 16, colFn) { // tube along a curve in the YZ plane with an elliptical, varying cross-section
  const curve = new THREE.CatmullRomCurve3(pts); const pos = [], idx = [], col = [], T = new THREE.Vector3(), Uv = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i <= segs; i++) { const s = i / segs; curve.getPointAt(s, p); curve.getTangentAt(s, T); Uv.crossVectors(XA, T).normalize(); const [rx, ry] = prof(s);
    for (let j = 0; j <= rad; j++) { const a = j / rad * Math.PI * 2; const cx = Math.cos(a) * rx, cy = Math.sin(a) * ry; pos.push(p.x + cx, p.y + Uv.y * cy, p.z + Uv.z * cy); if (colFn) { colFn(s, a, c); col.push(c.r, c.g, c.b); } } }
  for (let i = 0; i < segs; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (colFn) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpP = (k, pts) => { const t = Math.min(pts.length - 1.0001, k * (pts.length - 1)); const i = Math.floor(t), f = t - i; return pts[i] + (pts[i + 1] - pts[i]) * f; };
function spiralHorn(len, r, mat) { const g = new THREE.ConeGeometry(r, len, 6, 24); const p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = (v.y / len + 0.5) * 9; const c = Math.cos(k), s = Math.sin(k); p.setXYZ(i, v.x * c - v.z * s, v.y, v.x * s + v.z * c); } g.translate(0, len / 2, 0); g.computeVertexNormals(); return new THREE.Mesh(g, mat); }
function ribbonGeo(w, h, segs, hueA = 0, hueB = 0.85, sat = 1, li = 0.62, k = 1.6) { const geo = new THREE.PlaneGeometry(w, h, 1, segs); geo.translate(0, -h / 2, 0); const p = geo.attributes.position, c = [], col = new THREE.Color();
  for (let i = 0; i < p.count; i++) { col.setHSL(hueA + (-p.getY(i) / h) * (hueB - hueA), sat, li); c.push(col.r * k, col.g * k, col.b * k); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); geo.userData.base = Float32Array.from(p.array); return geo; }
const glowAdd = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
function waveRibbon(m, t, amp, f, ph) { const g = m.geometry, p = g.attributes.position, b = g.userData.base; for (let i = 0; i < p.count; i++) { const y = b[i * 3 + 1]; const k = -y; p.setZ(i, b[i * 3 + 2] + Math.sin(t * f + k * 6 + ph) * amp * k); p.setX(i, b[i * 3] + Math.cos(t * f * 0.8 + k * 5 + ph) * amp * 0.4 * k); } p.needsUpdate = true; }
function sprite(hex, s, op = 1) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: new THREE.Color(hex).multiplyScalar(op), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.scale.setScalar(s); return sp; }

// ---------- the shared horse build ----------
// spine from tail root to muzzle (z = forward, y = up); slim waist, deep chest, arched neck, long wedge head
const SPINE = [V(0, 1.02, -0.66), V(0, 1.06, -0.45), V(0, 1.0, -0.12), V(0, 1.04, 0.22), V(0, 1.16, 0.42), V(0, 1.42, 0.56), V(0, 1.66, 0.64), V(0, 1.62, 0.76), V(0, 1.47, 0.95), V(0, 1.36, 1.08)];
const RX = [0.08, 0.2, 0.19, 0.2, 0.16, 0.125, 0.105, 0.105, 0.088, 0.06], RY = [0.09, 0.24, 0.26, 0.29, 0.21, 0.16, 0.13, 0.12, 0.1, 0.07];
function makeHorse(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(new THREE.Mesh(sweep(SPINE, s => [lerpP(s, RX), lerpP(s, RY)], 80, 20, o.bodyCol), o.bodyMat));
  const head = new THREE.Group(); head.position.set(0, 1.62, 0.76); body.add(head);
  for (const sx of [-1, 1]) { part(SPH_LO, glowM(o.eye || 0x9fd0ff), 0.022, 0.026, 0.02, sx * 0.085, 0.0, 0.07, head); const ear = part(CONE, o.bodyMat, 0.03, 0.12, 0.02, sx * 0.05, 0.11, -0.06, head); ear.rotation.set(-0.3, 0, -sx * 0.25); }
  const legs = []; // [x, shoulderY, z, hind]
  for (const [x, y, z, hind] of [[-0.11, 0.9, 0.3, 0], [0.11, 0.9, 0.3, 0], [-0.12, 0.92, -0.46, 1], [0.12, 0.92, -0.46, 1]]) {
    const hip = new THREE.Group(); hip.position.set(x, y, z); body.add(hip);
    const up = hind ? [V(0, 0, 0), V(0, -0.2, -0.04), V(0, -0.42, -0.08)] : [V(0, 0, 0), V(0, -0.2, 0.02), V(0, -0.4, 0.0)];
    hip.add(new THREE.Mesh(sweep(up, s => [0.085 - s * 0.032, 0.11 - s * 0.055], 12, 10), o.bodyMat));
    const knee = new THREE.Group(); knee.position.copy(up[2]); hip.add(knee);
    const lo = [V(0, 0, 0), V(0, -0.22, hind ? 0.04 : 0), V(0, -0.42, hind ? 0.06 : 0.02)];
    knee.add(new THREE.Mesh(sweep(lo, s => [0.043 - s * 0.007, 0.048 - s * 0.007], 10, 10), o.bodyMat));
    const hoof = part(new THREE.CylinderGeometry(0.04, 0.05, 0.07, 12), o.hoofMat, 1, 1, 1, lo[2].x, lo[2].y - 0.02, lo[2].z, knee);
    let fx = null; if (o.fetlock) { fx = sprite(o.fetlock, 0.22, 1.2); fx.position.copy(lo[2]).add(V(0, 0.04, 0)); knee.add(fx); }
    legs.push({ hip, knee, hind, fx, hoof }); }
  // horn
  let horn; if (o.horn === 'crystal') { horn = new THREE.Group(); const cm = stylized({ color: 0xbff4ff, roughness: 0.05, transparent: true, opacity: 0.85, emissive: new THREE.Color(0x3a8aff).multiplyScalar(0.4) }, 0xffffff, 1.4); for (let i = 0; i < 3; i++) { const c = part(new THREE.OctahedronGeometry(1, 0), cm, 0.035 - i * 0.008, 0.2 + i * 0.05, 0.035 - i * 0.008, (i - 1) * 0.02, 0.15 + i * 0.05, 0, horn); c.rotation.z = (i - 1) * 0.15; } }
  else if (o.horn === 'curved') { horn = new THREE.Group(); const hm = new THREE.Mesh(sweep([V(0, 0, 0), V(0, 0.16, 0.03), V(0, 0.3, -0.04), V(0, 0.38, -0.14)], s => [0.032 * (1 - s * 0.85), 0.032 * (1 - s * 0.85)], 16, 8), o.hornMat); horn.add(hm); }
  else horn = spiralHorn(o.hornLen || 0.42, 0.034, o.hornMat);
  const hg = new THREE.Group(); hg.position.set(0, 0.11, 0.07); hg.rotation.x = 0.55; hg.add(horn); head.add(hg); const tipGlow = sprite(o.hornGlow || 0xffe8a0, 0.32, 1.3); tipGlow.position.y = (o.hornLen || 0.42) + 0.02; hg.add(tipGlow);
  // mane along the neck crest and tail
  const mane = []; const crest = new THREE.CatmullRomCurve3([V(0, 1.18, 0.38), V(0, 1.44, 0.5), V(0, 1.7, 0.6)]);
  const MN = o.maneN || 14; for (let k = 0; k < MN; k++) { const s = k / (MN - 1); const p = crest.getPointAt(s); const side = k % 2 ? 1 : -1;
    const m = new THREE.Mesh(ribbonGeo((o.maneW || 0.09) * 1.4, (o.maneLen || 0.42) * (1.05 - s * 0.35), 8, ...(o.maneHue || [0, 0.85])), o.maneMat || glowAdd);
    m.position.copy(p).add(V(side * 0.03, 0.02, -0.04)); m.userData.side = side; m.rotation.set(0.5, 0, side * 0.35); body.add(m); mane.push(m); }
  const tail = []; for (let k = 0; k < (o.tailN || 5); k++) { const m = new THREE.Mesh(ribbonGeo(0.1, o.tailLen || 0.9, 12, ...(o.maneHue || [0, 0.85])), o.maneMat || glowAdd); m.position.set((k - 2) * 0.025, 1.02, -0.66); m.rotation.set(-0.5, (k - 2) * 0.12, 0); body.add(m); tail.push(m); }
  return { g, body, head, legs, mane, tail, tipGlow, extras: [] };
}
function animHorse(h, t, run) { const f = run ? 8 : 1.4, a = run ? 0.75 : 0.05;
  h.legs.forEach((L, i) => { const ph = t * f + [0, 0.5, Math.PI, Math.PI + 0.5][i]; L.hip.rotation.x = Math.sin(ph) * a * (L.hind ? -1 : 1); L.knee.rotation.x = (L.hind ? -1 : 1) * Math.max(0, Math.sin(ph + 1.2)) * a * 1.3; if (L.fx) L.fx.scale.setScalar(0.18 + Math.sin(t * 5 + i) * 0.04 + (run ? 0.06 : 0)); });
  h.body.position.y = run ? Math.abs(Math.sin(t * f)) * 0.07 : Math.sin(t * 1.4) * 0.012; h.body.rotation.x = run ? Math.sin(t * f) * 0.05 : 0;
  h.head.rotation.x = run ? Math.sin(t * f) * 0.08 : Math.sin(t * 0.7) * 0.04; h.tipGlow.scale.setScalar(0.3 + Math.sin(t * 4) * 0.06);
  h.mane.forEach((m, k) => { waveRibbon(m, t, run ? 0.1 : 0.04, run ? 9 : 3, k * 0.6); m.rotation.x = run ? 0.95 : 0.5; m.rotation.z = m.userData.side * (run ? 0.2 : 0.35); });
  h.tail.forEach((m, k) => { waveRibbon(m, t, run ? 0.16 : 0.07, run ? 7 : 2.4, k); m.rotation.x = run ? -1.2 : -0.5; }); }

// ---------- the four designs ----------
const goldM = stylized({ color: 0xffd86a, metalness: 0.95, roughness: 0.2, emissive: new THREE.Color(0x553300) }, 0xfff0b0, 0.8);
function designA() { return makeHorse({ bodyMat: stylized({ color: 0xd8d4e8, roughness: 0.35, metalness: 0.2, envMapIntensity: 1.2 }, 0xd8b8ff, 0.7, 2.2), hoofMat: goldM, hornMat: goldM, fetlock: 0xffd0ff, maneHue: [0, 0.85] }); }
function designB() { const scale = (s, a, c) => { const u = s * 70, v = a * 4; const k = Math.sin(u + Math.floor(v) * 1.6) * Math.sin(v * Math.PI); c.set(a > 3.6 && a < 5.8 ? 0x1f8a6a : 0x2fbf8a); if (k > 0.55) c.lerp(new THREE.Color(0xffd86a), 0.65); if (a > 3.9 && a < 5.5) c.lerp(new THREE.Color(0xf0d080), 0.5); };
  const bm = stylized({ vertexColors: true, roughness: 0.3, metalness: 0.55, envMapIntensity: 1.3 }, 0xffe08a, 0.7, 2.2);
  const h = makeHorse({ bodyMat: bm, bodyCol: scale, hoofMat: goldM, hornMat: goldM, horn: 'curved', fetlock: 0xff9a3a, maneHue: [0.02, 0.13], maneW: 0.12, maneLen: 0.36, tailLen: 0.75, eye: 0xffd23a, hornGlow: 0xffb04a });
  h.legs.forEach(L => { const c = sprite(0xff8a2a, 0.3, 1.1); c.position.copy(L.hoof.position); L.knee.add(c); h.extras.push(c); }); h.flame = true; return h; }
function designC() { const cm = stylized({ color: 0xa8d8ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.55, emissive: new THREE.Color(0x2a4aff).multiplyScalar(0.25), depthWrite: false }, 0xffffff, 1.5, 1.8);
  const h = makeHorse({ bodyMat: cm, hoofMat: stylized({ color: 0xdff4ff, roughness: 0.05, emissive: new THREE.Color(0x6aa8ff).multiplyScalar(0.5) }, 0xffffff, 1.2), horn: 'crystal', fetlock: 0x9affe8, maneHue: [0.38, 0.8], maneLen: 0.5, tailLen: 1.0, eye: 0xffffff, hornGlow: 0xbff4ff });
  for (let i = 0; i < 26; i++) { const st = sprite(Math.random() < 0.5 ? 0xffffff : 0x9fe8ff, rr(0.04, 0.09), 1.5); const s = Math.random() * 0.85 + 0.05; const p = new THREE.CatmullRomCurve3(SPINE).getPointAt(s); st.position.set(rr(-0.08, 0.08), p.y + rr(-0.08, 0.08), p.z); h.body.add(st); h.extras.push(st); } h.stars = true; return h; }
function designD() { const h = makeHorse({ bodyMat: stylized({ color: 0xe8e2d8, roughness: 0.3, metalness: 0.25, envMapIntensity: 1.3 }, 0xffe8b0, 0.7, 2.2), hoofMat: goldM, hornMat: goldM, hornLen: 0.48, fetlock: 0xffe8a0, maneHue: [0.1, 0.16], maneW: 0.08, eye: 0x6fd8ff });
  const plate = new THREE.Mesh(sweep([V(0, 1.08, 0.36), V(0, 1.0, 0.48), V(0, 0.86, 0.5)], s => [0.2 - s * 0.04, 0.05], 10, 14), goldM); plate.scale.z = 0.5; h.body.add(plate);
  const saddle = part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20, 1, false, 0, Math.PI), stylized({ color: 0x6a1a2a, roughness: 0.6 }, 0xffd86a, 0.5), 1, 1, 1.4, 0, 1.24, -0.12, h.body); saddle.rotation.set(0, 0, Math.PI / 2);
  const wm = wingB.clone(); wm.uniforms.uTime = U.uTime; wm.uniforms.uRoot.value.setHex(0xfff4d8); wm.uniforms.uTip.value.setHex(0xff9d1f); wm.uniforms.uEdge.value.setHex(0xffe08a); wm.uniforms.uB.value = 0.8;
  h.wings = []; for (const s of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(s * 0.14, 1.22, 0.18); const w = new THREE.Mesh(wingGeo, wm); w.scale.set(s * 0.42, 0.42, 0.42); w.rotation.set(-0.3, s * 0.2, 0); piv.add(w); h.body.add(piv); h.wings.push(piv); } return h; }
const labs = [designA(), designB(), designC(), designD()];
const spots = [[-6.6, 16.5], [-2.2, 16], [2.2, 16], [6.6, 16.5]];
labs.forEach((h, i) => { h.g.position.set(spots[i][0], 0.02, spots[i][1]); scene.add(h.g); const b = blob(1.8); b.position.set(spots[i][0], 0.03, spots[i][1]); scene.add(b); });

// ---------- four live viewports ----------
const views = labs.map((h, i) => { const r = i === 0 ? renderer : new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' }); if (i) { r.toneMapping = THREE.ACESFilmicToneMapping; host.appendChild(r.domElement); }
  const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 200); return { h, r, cam, comp: null }; });
function labResize() { const w = Math.floor(innerWidth / 2), hh = Math.floor(innerHeight / 2);
  for (const v of views) { v.r.setPixelRatio(DPR); v.r.setSize(w, hh); v.cam.aspect = w / hh; v.cam.fov = hh > w ? 46 : 34; v.cam.updateProjectionMatrix(); v.comp = composerFor(v.r, v.cam, w, hh); }
  const s = hh * DPR * 0.5; pMat.uniforms.uScale.value = s; moteMats.forEach(m => m.uniforms.uScale.value = s); }
function composerFor(r, cam, w, h) { const rt = new THREE.WebGLRenderTarget(w * DPR, h * DPR, { type: THREE.HalfFloatType, samples: 4 }); const c = new EffectComposer(r, rt); c.setPixelRatio(DPR); c.setSize(w, h);
  c.addPass(new RenderPass(scene, cam)); c.addPass(new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.55, 0.45, 0.95)); c.addPass(new OutputPass()); return c; }
removeEventListener('resize', onResize); onResize = labResize; addEventListener('resize', labResize);
let run = true, spin = true, ang = 0.6;
$('labRun').onclick = e => { run = !run; e.target.textContent = 'Phi nước đại: ' + (run ? 'BẬT' : 'TẮT'); };
$('labSpin').onclick = e => { spin = !spin; e.target.textContent = 'Xoay: ' + (spin ? 'BẬT' : 'TẮT'); };
composer = { render(dt) { if (!views[1].comp) labResize(); const t = U.uTime.value; if (spin) ang += dt * 0.35;
    for (const v of views) { const h = v.h; animHorse(h, t, run);
      if (h.wings) h.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (Math.sin(t * (run ? 7 : 2.2)) * 0.5 + 0.2); });
      if (h.flame && run && Math.random() < 0.7) { const L = pick(h.legs); const p = L.hoof.getWorldPosition(new THREE.Vector3()); emit(p.x, p.y + 0.05, p.z, rr(-0.3, 0.3), rr(0.4, 1.0), rr(-0.3, 0.3), C3(Math.random() < 0.5 ? '#ff9a3a' : '#ffd86a'), 0.35, 0.6, -0.4, 0.95); }
      if (h.stars) h.extras.forEach((s, k) => s.material.opacity = 0.5 + 0.5 * Math.sin(t * 3 + k));
      if (!h.flame && run && Math.random() < 0.35) { const L = pick(h.legs); const p = L.hoof.getWorldPosition(new THREE.Vector3()); emit(p.x, p.y + 0.05, p.z, rr(-0.2, 0.2), rr(0.3, 0.8), rr(-0.2, 0.2), new THREE.Color().setHSL(Math.random(), 1, 0.7), 0.25, 0.6, -0.3, 0.95); }
      const cx = h.g.position.x, cz = h.g.position.z, a = ang + views.indexOf(v) * 0.4; v.cam.position.set(cx + Math.sin(a) * 3.7, 2.05, cz + Math.cos(a) * 3.7); v.cam.lookAt(cx, 1.2, cz + 0.2); }
    for (const v of views) v.comp.render(dt); }, dispose() {} };
(function boot() { if (!heroGLTF) { setTimeout(boot, 200); return; } S = newState('holy'); Object.assign(S, { lv: 400, auto: false, autoLoot: false, bots: [] }); startRun(false); heroG.visible = false; heroBlob.visible = false; labResize(); })();
