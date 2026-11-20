
// =====================================================================
// GAME — state, combat, skills, loot, all drawn with the template's visuals
// =====================================================================
WNAME[0] = 'Cánh Sơ Khai';
let S = null;
function newState(cls) { return { v: 2, cls, lv: 1, exp: 0, gold: 0, mats: { e: 3, c: 0, p: 0, d: 0, t: 0, x: 0, f: 0 }, st: { c: 0, p: 0, d: 0, t: 0, x: 0 }, wing: 0, inv: [], eq: {}, map: 0, auto: true,
  hp: 1, mp: 100, pos: new THREE.Vector3(0, 0, 8), face: Math.PI, atkCd: 0, atkT: 0, skCd: [0, 0, 0], castT: 0, dead: 0, lastHit: -99, time: 0, kills: 0, skillT: 0,
  pets: [], pet: null, mounts: [], mount: null, playT: 0, autoLoot: true, lootF: lootDefaults(), bossHunt: false, miniT: 70, mini: null, rec: { t: 0, hp: 0, mp: 0 }, lvLog: [] }; }
let uidN = 1; const uid = () => 'i' + Date.now().toString(36) + (uidN++);
function makeGear(slot, r, lv, set) {
  const base = {}; for (const k in SLOTS[slot].base) base[k] = k === 'crit' ? SLOTS[slot].base[k] * (r + 1) : Math.round(SLOTS[slot].base[k] * RMULT[r] * (1 + lv * 0.09));
  if (AS_SLOTS.includes(slot)) base.as = gearAS(lv, r); if (set && !SETS[set].names[slot]) set = null;
  return { id: uid(), slot, r, lv, name: set ? SETS[set].names[slot] : pick(PLAIN[slot]), base, plus: 0, set: set || null };
}
const gearAS = (lv, r) => Math.round((10 + 0.3 * lv) * ASR[r]);
function gearStats(g) { const o = {}; for (const k in g.base) o[k] = k === 'crit' ? +(g.base[k] + g.plus * 0.5).toFixed(1) : k === 'as' ? g.base[k] + g.plus : Math.round(g.base[k] * plusMult(g.plus)); return o; }
const gearScore = g => { const s = gearStats(g); return (s.atk || 0) * 3 + (s.def || 0) * 2.5 + (s.hp || 0) * 0.25 + (s.crit || 0) * 4 + (s.as || 0) * 4 + (g.set ? 6 : 0); };
const sellPrice = g => Math.round((20 + g.lv * 6) * RMULT[g.r] * (1 + g.plus * 0.3) * (g.charm ? CHARMS[g.charm].pv : 1));
function setCounts() { const c = {}; for (const s of SLOT_ORDER) { const g = S.eq[s]; if (g && g.set) c[g.set] = (c[g.set] || 0) + 1; } return c; }
function heroStats() {
  const Cl = CLS[S.cls]; const st = { atk: (12 + S.lv * 3.2) * Cl.atk, def: S.lv * 1.2, hp: (380 + S.lv * 55) * Cl.hp, mp: 100 + S.lv * 3, crit: 0, as: Math.round(S.lv * 0.1) };
  for (const s of SLOT_ORDER) { const g = S.eq[s]; if (!g) continue; const gs = gearStats(g); for (const k in gs) st[k] += gs[k]; }
  st.def += WDEF[S.wing]; st.hp += WHP[S.wing]; st.as += S.wing * 8;
  const P = curPet(), Mt = curMount(); if (P) st.as += P.as; if (Mt) { st.as += Mt.as; st.def *= 1 + Mt.defP; st.hp *= 1 + Mt.hpP; }
  const b = { atkP: 0, hpP: 0, defP: 0, dmgP: 0, crit: 0 }; const sc = setCounts();
  for (const k in sc) { const T = SETS[k]; if (sc[k] >= 2) for (const x in T.b2) b[x] += T.b2[x]; if (sc[k] >= 4) for (const x in T.b4) b[x] += T.b4[x]; }
  st.atk = Math.round(st.atk * (1 + b.atkP)); st.hp = Math.round(st.hp * (1 + b.hpP)); st.def = Math.round(st.def * (1 + b.defP)); st.crit += b.crit;
  const ch = { dmg: 0, hp: 0, mp: 0, soul: 0 }; for (const g of S.inv) if (g.slot === 'charm') ch[g.charm] += qty(g); for (const k in ch) ch[k] = Math.min(CHARM_CAP, ch[k]); st.charms = ch; st.hp = Math.round(st.hp * (1 + ch.hp * 0.01)); st.mp = Math.round(st.mp * (1 + ch.mp * 0.01));
  st.dmgMul = WINGM[S.wing] * (1 + b.dmgP) * (1 + ch.dmg * 0.01) * (1 + ch.soul * 0.01); st.dr = ch.soul * 0.003; st.sets = sc; st.aps = apsOf(Cl.aps, st.as);
  st.loot = P ? P.loot : 0.9; st.expB = P ? P.exp : 0; st.goldB = P ? P.gold : 0; st.hpCap = REC.hpCap + (P ? P.rec : 0); st.spd = (4.6 + S.wing * 0.3) * 0.6 * (1 + (Mt ? Mt.spd : 0)); return st;
}
const curPet = () => S && S.pet ? PETS.find(p => p.id === S.pet) : null;
const curMount = () => S && S.mount ? MOUNTS.find(p => p.id === S.mount) : null;
function skCd(sk) { return Math.max(0.1, sk.cdk / (HS ? HS.aps : 3)); }
function skMp(sk) { return Math.ceil((HS ? HS.mp : 100) * sk.mpP); }
// recovery from hitting / killing monsters, capped per second so it never becomes god mode
function recover(hpF, mpF) { const R = S.rec; if (S.time - R.t >= 1) { R.t = S.time; R.hp = R.mp = 0; }
  const h = Math.min(hpF, HS.hpCap - R.hp), m = Math.min(mpF, REC.mpCap - R.mp); if (h > 0) { R.hp += h; S.hp = Math.min(HS.hp, S.hp + HS.hp * h); } if (m > 0) { R.mp += m; S.mp = Math.min(HS.mp, S.mp + HS.mp * m); }
}
let HS = null;
function rates() { const Cl = CLS[S.cls], o = {}; for (const k of SK) { const s = STONES[k]; const base = s.stat === 'crit' ? (Cl.crit || BASE_RATE.crit) : BASE_RATE[s.stat]; o[s.stat] = Math.min(s.cap, base + s.inc * (S.st[k] || 0)); } o.crit = Math.min(0.85, o.crit + (HS ? HS.crit : 0) / 100); return o; }
function canStone(k) { const s = STONES[k]; const base = s.stat === 'crit' ? (CLS[S.cls].crit || BASE_RATE.crit) : BASE_RATE[s.stat]; return base + s.inc * (S.st[k] || 0) < s.cap - 1e-9; }
function avgMult() { const r = rates(); let m = 1; for (const k of SK) { const s = STONES[k]; m *= 1 + r[s.stat] * (s.mult - 1); } return m; }
function recalc(heal) { const old = HS; HS = null; HS = heroStats(); if (heal || !old) { S.hp = HS.hp; S.mp = HS.mp; } else { S.hp = Math.min(HS.hp, S.hp * HS.hp / old.hp); S.mp = Math.min(HS.mp, S.mp); } }
function roll() { const r = rates(); let m = 1, ty = 'n', L = 0; for (const k of SK) { const s = STONES[k]; if (Math.random() < r[s.stat]) { m *= s.mult; ty = k; L++; } } return { m, ty, L }; }
const fmtN = n => { n = Math.max(1, Math.round(n)); return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : String(n); };

// ---------- template-style effects ----------
const COLS = {}; const C3 = h => COLS[h] || (COLS[h] = new THREE.Color(h));
const tmpV = new THREE.Vector3();
function toScreen(v) { tmpV.copy(v).project(camera); return [(tmpV.x * 0.5 + 0.5) * innerWidth, (-tmpV.y * 0.5 + 0.5) * innerHeight, tmpV.z < 1]; }
let textN = 0;
function fxText(x, z, s, col, size, o, h = 1) { if (textN > 50) return; o = o || {}; const [sx, sy] = toScreen(tmpV.set(x, h, z)); const d = document.createElement('div'); d.className = 'dmg' + (o.big ? ' big' : ''); d.textContent = s; if (col) d.style.color = col; if (size && !o.big) d.style.fontSize = size + 'px'; if (o.glow) d.style.textShadow = '0 2px 3px #000,0 0 12px ' + col;
  d.style.left = sx + 'px'; d.style.top = sy + 'px'; if (o.life) d.style.animationDuration = o.life + 's'; labelsEl.appendChild(d); textN++; setTimeout(() => { d.remove(); textN--; }, (o.life || 0.9) * 1000 + 60); }
function fxBurst(x, z, hex, n, spd, size, h = 0.5) { burst(x, h, z, n, C3(hex), spd, size * 4, 0.7); }
const arcs = [];
function fxRing(x, z, r0, r1, hex, life = 0.5, _f, h = 0.6) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), skillMat.clone()); m.material.uniforms.uC.value = new THREE.Color(hex); m.scale.setScalar(Math.max(0.3, r1)); m.position.set(x, h, z); scene.add(m); arcs.push({ m, t: 0, dur: Math.max(0.3, life), spin: rr(3, 6) }); }
const beamGeo = new THREE.CylinderGeometry(0.12, 0.3, 3.2, 12, 1, true); beamGeo.translate(0, 1.6, 0);
const beamMatBase = new THREE.ShaderMaterial({ uniforms: { uC: { value: new THREE.Color() }, uTime: U.uTime, uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform vec3 uC; uniform float uTime, uA; varying vec2 vUv; void main(){ float a = (1.0 - vUv.y) * (0.7 + 0.3 * sin(uTime * 4.0 + vUv.y * 10.0)); gl_FragColor = vec4(uC * a * a * 0.9 * uA, 1.0); }' });
const beams = [];
function fxBeam(x, z, hex, life, w = 1) { const m = new THREE.Mesh(beamGeo, beamMatBase.clone()); m.material.uniforms.uC.value = new THREE.Color(hex).multiplyScalar(1.3); m.scale.set(w * 2, 1, w * 2); m.position.set(x, 0, z); scene.add(m); beams.push({ m, t: 0, dur: life }); return m; }
const bolts = [];
function fxBolt(points, hex, life) { const pts = []; for (let i = 0; i < points.length - 1; i++) { const a = points[i], b = points[i + 1]; for (let j = 0; j < 6; j++) { const p = a.clone().lerp(b, j / 6); if (j) p.add(new THREE.Vector3(rr(-0.12, 0.12), rr(-0.12, 0.12), rr(-0.12, 0.12))); pts.push(p); } } pts.push(points[points.length - 1]);
  const g = new THREE.BufferGeometry().setFromPoints(pts); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(l); bolts.push({ l, t: 0, dur: life });
  for (const p of pts) if (Math.random() < 0.4) emit(p.x, p.y, p.z, 0, 0, 0, C3(hex), 0.3, 0.25, 0, 1); }
function updateFx(dt) {
  for (const a of arcs) { a.t += dt; const k = a.t / a.dur; a.m.material.uniforms.uT.value = Math.min(1, k); a.m.rotation.y -= a.spin * dt; if (k >= 1) { scene.remove(a.m); a.m.material.dispose(); } }
  for (let i = arcs.length - 1; i >= 0; i--) if (arcs[i].t >= arcs[i].dur) arcs.splice(i, 1);
  for (const b of beams) { b.t += dt; b.m.material.uniforms.uA.value = Math.max(0, Math.sin(Math.PI * Math.min(1, b.t / b.dur))); if (b.t >= b.dur) { scene.remove(b.m); b.m.material.dispose(); } }
  for (let i = beams.length - 1; i >= 0; i--) if (beams[i].t >= beams[i].dur) beams.splice(i, 1);
  for (const b of bolts) { b.t += dt; b.l.material.opacity = Math.max(0, 1 - b.t / b.dur); if (b.t >= b.dur) { scene.remove(b.l); b.l.geometry.dispose(); b.l.material.dispose(); } }
  for (let i = bolts.length - 1; i >= 0; i--) if (bolts[i].t >= bolts[i].dur) bolts.splice(i, 1);
}

// ---------- world (template layout, per-sea palette) ----------
const rockSpots = [[-14, -9, 1.8, 2.6], [14, -12, 2.2, 3.4], [-16, 6, 2.0, 2.2], [16, 4, 1.6, 2.8], [-4, -9, 1.0, 1.4], [5, 2, 0.9, 1.1], [-3, 15, 1.6, 2.4], [11, 16, 2.0, 3.0], [-12, 16, 1.4, 1.8], [2, -6, 0.7, 0.9]];
const coralSpots = [[-6, -12], [7, -13], [-13, -2], [13, -2], [-11, 12], [12, 11], [-2, 11], [4, 13], [-18, -12], [18, -10], [-6, 3], [8, -1]];
function collides(x, z, r) { for (const c of colliders) { const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz < (c.r + r) ** 2) return true; } return false; }
// ---------- navigation (grid A* so the hero walks around rocks and coral) ----------
const NAV = { n: 88, c: 0.5, o: -22, g: null, R: 0.56 };
function navCell(v) { return clamp(Math.floor((v - NAV.o) / NAV.c), 0, NAV.n - 1); }
function navX(i) { return NAV.o + (i + 0.5) * NAV.c; }
function buildNav() { const n = NAV.n; NAV.g = new Uint8Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = navX(i), z = navX(j); NAV.g[j * n + i] = Math.hypot(x, z) > 20.8 || collides(x, z, NAV.R) ? 1 : 0; } }
function navFree(i, j) { return i >= 0 && j >= 0 && i < NAV.n && j < NAV.n && !NAV.g[j * NAV.n + i]; }
function los(ax, az, bx, bz, r = 0.5) { const d = Math.hypot(bx - ax, bz - az), k = Math.ceil(d / 0.2); for (let s = 1; s <= k; s++) { const f = s / k; if (collides(ax + (bx - ax) * f, az + (bz - az) * f, r)) return false; } return true; }
function nearestFree(i, j) { if (navFree(i, j)) return [i, j]; for (let r = 1; r < 8; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) if (Math.max(Math.abs(di), Math.abs(dj)) === r && navFree(i + di, j + dj)) return [i + di, j + dj]; return null; }
function findPath(sx, sz, tx, tz) {
  if (!NAV.g) return null; const n = NAV.n; const s = nearestFree(navCell(sx), navCell(sz)), t = nearestFree(navCell(tx), navCell(tz)); if (!s || !t) return null;
  const S0 = s[1] * n + s[0], T0 = t[1] * n + t[0]; const gs = new Float32Array(n * n).fill(1e9), from = new Int32Array(n * n).fill(-1), shut = new Uint8Array(n * n);
  const heap = [], H = k => { const i = k % n, j = (k / n) | 0, dx = Math.abs(i - t[0]), dz = Math.abs(j - t[1]); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
  const push = (k, f) => { heap.push([f, k]); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { const l = 2 * c + 1, r = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top[1]; };
  gs[S0] = 0; push(S0, H(S0)); let found = false, it = 0;
  while (heap.length && it++ < 9000) { const k = pop(); if (shut[k]) continue; shut[k] = 1; if (k === T0) { found = true; break; } const i = k % n, j = (k / n) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const a = i + di, b = j + dj; if (!navFree(a, b)) continue; if (di && dj && (!navFree(i + di, j) || !navFree(i, j + dj))) continue;
      const q = b * n + a, g = gs[k] + (di && dj ? 1.414 : 1); if (g < gs[q]) { gs[q] = g; from[q] = k; push(q, g + H(q)); } } }
  if (!found) return null; const pts = []; for (let k = T0; k !== -1 && k !== S0; k = from[k]) pts.push([navX(k % n), navX((k / n) | 0)]); pts.reverse(); pts.push([tx, tz]);
  const out = []; let ax = sx, az = sz, i = 0; // string-pull: keep only corners the hero cannot see past
  while (i < pts.length) { let j = pts.length - 1; while (j > i && !los(ax, az, pts[j][0], pts[j][1], 0.45)) j--; out.push(pts[j]); [ax, az] = pts[j]; i = j + 1; }
  return out;
}
// direction (unit vector) the hero should walk now to reach (tx,tz), going around obstacles
function navDir(tx, tz) {
  const px = S.pos.x, pz = S.pos.z;
  if (los(px, pz, tx, tz)) { S.nav = null; const d = Math.hypot(tx - px, tz - pz) || 1; return [(tx - px) / d, (tz - pz) / d]; }
  let N = S.nav; if (!N || Math.hypot(N.tx - tx, N.tz - tz) > 1 || S.time - N.t > 1.5) { const pts = findPath(px, pz, tx, tz); N = S.nav = { tx, tz, t: S.time, pts: pts || [[tx, tz]], i: 0, fail: !pts }; }
  while (N.i < N.pts.length - 1 && (Math.hypot(N.pts[N.i][0] - px, N.pts[N.i][1] - pz) < 0.35 || los(px, pz, N.pts[N.i + 1][0], N.pts[N.i + 1][1]))) N.i++;
  const [wx, wz] = N.pts[N.i]; const d = Math.hypot(wx - px, wz - pz) || 1; return [(wx - px) / d, (wz - pz) / d];
}
function spawnPos(z) { for (let k = 0; k < 20; k++) { const a = rr(0, 6.28), d = Math.sqrt(rand()) * z.r; const x = z.x + Math.cos(a) * d, zz = z.z + Math.sin(a) * d; if (!collides(x, zz, 0.8)) return [x, zz]; } return [z.x, z.z]; }
function setMap(i) {
  S.map = i; const M = MAPS[i]; PAL = M.pal; seed = 20261119 + i * 977;
  while (world.children.length) { const c = world.children.pop(); c.traverse(o => { if (o.geometry && o.geometry !== blobGeo && !SHARED.has(o.geometry)) o.geometry.dispose(); }); }
  colliders.length = 0; scenery.length = 0; const env = M.env || 'sea';
  const G = groundMat.uniforms; G.uSA.value.set(...PAL.sa); G.uSB.value.set(...PAL.sb); G.uPt.value.set(...PAL.pt); G.uCa.value.set(...PAL.ca);
  FOG.setHex(PAL.fog); scene.background.setHex(PAL.bg); moteMats[0].uniforms.uC.value.setHex(PAL.mote[0]); moteMats[1].uniforms.uC.value.setHex(PAL.mote[1]);
  heroLight.color.setHex(PAL.light ?? (i === 2 ? 0xff9a5a : 0x5ab8ff));
  const hm = PAL.hemi || [0x8fefff, 0x0a2c36, 1.4], sn = PAL.sun || [0xc8f7ff, 2.4]; hemi.color.setHex(hm[0]); hemi.groundColor.setHex(hm[1]); hemi.intensity = hm[2]; sun.color.setHex(sn[0]); sun.intensity = sn[1];
  renderer.toneMappingExposure = M.exposure ?? 0.95;
  scene.fog.density = G.uFogD.value = PAL.fogD ?? 0.022; G.uSpk.value = PAL.spk ?? 0; shaftMat.uniforms.uC.value.set(...(PAL.shaft || [0.16, 0.4, 0.45]));
  const mr = PAL.moteRise || [0.25, 1.1]; moteMats[0].uniforms.uRise.value = mr[0]; moteMats[1].uniforms.uRise.value = mr[1]; moteMats[0].uniforms.uSize.value = mr[0] < 0 ? 0.2 : 0.12;
  addGate(0, -15, 0);
  if (env !== 'sea') REALM[env](M); else {
  for (const [x, z, r, h] of rockSpots) addRock(x, z, r, h, rr(0.8, 1.6));
  for (let k = 0; k < 26; k++) { const a = (k / 26) * 6.28 + rr(-0.1, 0.1), d = rr(23, 28); addRock(Math.cos(a) * d, Math.sin(a) * d, rr(2.2, 3.6), rr(2.5, 5.5), rr(1.0, 2.0)); }
  for (let k = 0; k < 12; k++) { const [x, z] = [rr(-18, 18), rr(-18, 18)]; if (!collides(x, z, 0.5) && Math.hypot(x, z - 8) > 3) addRock(x, z, rr(0.25, 0.5), rr(0.25, 0.5), 0.6, false); }
  for (const [x, z] of coralSpots) {
    const [c, t] = pick(PAL.coral);
    const cg = coralBranches(rr(0.5, 0.8), rr(0.06, 0.09), 3, c, t); cg.position.set(x, 0, z); cg.scale.setScalar(rr(0.9, 1.5)); cg.rotation.y = rr(0, 6); world.add(cg);
    const sp = tubeSponge(pick(PAL.sponge)); sp.position.set(x + rr(-1.2, 1.2), 0, z + rr(-1.2, 1.2)); world.add(sp);
    const fan = seaFan(pick(PAL.fan)); fan.position.set(x + rr(-1.5, 1.5), 0, z + rr(-1.5, 1.5)); fan.rotation.y = rr(0, 6); fan.scale.setScalar(rr(0.8, 1.3)); world.add(fan);
    const b = blob(3); b.position.set(x, 0.02, z); world.add(b); colliders.push({ x, z, r: 0.7 });
  }
  const wk = i === 1 ? 1.8 : 1;
  addSeaweed(-15, 0, Math.round(40 * wk), 3.5); addSeaweed(15, 10, Math.round(36 * wk), 3); addSeaweed(-6, 17, Math.round(30 * wk), 3); addSeaweed(6, -18, Math.round(34 * wk), 4); addSeaweed(-17, -15, Math.round(28 * wk), 3); addSeaweed(18, -16, Math.round(26 * wk), 3); addSeaweed(1, 13, 10, 1.2);
  if (i === 1) { addSeaweed(-11, -4, 30, 2.5); addSeaweed(13, 5, 30, 2.5); addSeaweed(-2, -20, 30, 3); } }
  for (const m of mobs) removeMob(m); mobs.length = 0; for (const l of loots) removeLoot(l); loots.length = 0;
  for (const zn of M.zones) for (let n = 0; n < zn.n; n++) { const [x, z] = spawnPos(zn); addMob(zn.k, zoneLv(zn), x, z, zn); }
  S.bossT = Math.min(S.bossT ?? 60, 60); S.boss = null; S.boss2 = null; S.mini = null; S.miniT = Math.min(S.miniT ?? 40, 40);
  S.pos.set(0, 0, 8); buildNav(); if (S.bots) { clearBots(); spawnNpcs(); syncBots(); } S.nav = null; S.moveTo = null; S.tapMob = null;
}

// ---------- monsters (template jelly & spiked fish) ----------
const mobs = [];
function addMob(k, lv, x, z, zone, mini = false) {
  const T = MT[k]; const boss = !!T.boss; const v = MAKERS[T.model](T.p || T.pal);
  const scale = T.size * (boss ? (T.p ? 2.6 : 1) : mini ? 1.75 : T.model === 'fish' ? rr(0.9, 1.15) : rr(0.85, 1.2));
  const shadow = blob((T.model === 'fish' ? 1.6 : 1.3) * scale); scene.add(shadow); scene.add(v.group);
  const el = document.createElement('div'); el.className = 'lbl'; el.style.display = 'none';
  el.innerHTML = `<div class="nm" style="color:${T.color}">${mini ? '★ ' : ''}${T.name} · Lv ${lv}</div><div class="hp${boss || mini ? ' b' : ''}"><i></i></div>`; labelsEl.appendChild(el);
  const m = { ...v, T, k, lv, boss, zone, x, z, home: { x, z }, scale, shadow, el, bar: el.querySelector('.hp i'), hpEl: el.querySelector('.hp'), mini, baseE: v.mats[0].emissive ? v.mats[0].emissive.clone() : null, maxHp: mobHp(lv) * (zone.hk || 1) * (boss ? 60 : mini ? 15 : 1), atk: mobAtk(lv) * (zone.hk || 1) * (boss ? 4 : mini ? 2.5 : 1),
    hp: 0, face: rr(0, 6.28), state: 'idle', wait: rr(0, 3), flash: 0, dead: 0, respawn: 0, aggro: false, atkCd: 0, phase: rr(0, 6.28), spawnT: 0.6 };
  m.hp = m.maxHp; mobs.push(m); return m;
}
// zone monsters follow the hero's level inside the map's range (grind anywhere in the map)
function zoneLv(zn) { const M = MAPS[S.map]; return clamp(S.lv + (zn.off || 0) + ri(-1, 1), M.lo, M.hi); }
function setMobLv(m, lv) { m.lv = lv; m.maxHp = mobHp(lv) * (m.zone.hk || 1); m.atk = mobAtk(lv) * (m.zone.hk || 1); m.el.querySelector('.nm').textContent = `${m.mini ? '★ ' : ''}${m.T.name} · Lv ${lv}`; }
function removeMob(m) { scene.remove(m.group); scene.remove(m.shadow); m.el.remove(); }
const mobH = m => m.T.y + m.T.hh * m.scale;
function vuln(m, el) { let k = 1; if (m.frzT > 0) k *= 1.3; if (m.shockT > 0) k *= 1.2; if (m.burnT > 0) k *= 1.15; if (m.wetT > 0) k *= (el === 'ice' || el === 'thunder') ? 1.35 : 1.1; return k; }
const DMG_TEXT = 0.6; // damage numbers at 60% of their old size (min 9px)
const dmgSize = px => Math.max(9, Math.round(px * DMG_TEXT));
function hitMob(m, mult, el, show = true) {
  if (m.dead) return; const r = roll(); const dmg = HS.atk * mult * HS.dmgMul * DMG_SCALE * rr(0.9, 1.1) * vuln(m, el) * r.m * lvDealK(m.lv - S.lv);
  m.hp -= dmg; m.flash = 1; m.aggro = true; m.tgt = null; recover(REC.hpHit, REC.mpHit); show = show && textN < 34;
  if (show) { const y = m.T.y + 0.9 * Math.max(1, m.scale);
    fxText(m.x + rr(-0.3, 0.3), m.z, fmtN(dmg), r.ty === 'n' ? '' : DMGC[r.ty], dmgSize({ n: 17, c: 22, p: 23, d: 24, t: 26, x: 30 }[r.ty] + Math.max(0, r.L - 1) * 2), r.ty === 'n' ? null : { glow: r.ty === 'x' || r.L >= 3, life: 1.1 }, y);
    if (r.L >= 2) fxText(m.x, m.z, (r.L >= 3 ? 'SIÊU ĐÒN ' : '') + '×' + (Math.round(r.m * 10) / 10), DMGC[r.ty], dmgSize(13), { life: 1.3, glow: true }, y + 0.55);
    burst(m.x, mobH(m), m.z, r.ty !== 'n' ? 10 : 4, C3(m.T.color), 4, 0.35, 0.5);
    if (r.L >= 4) { fxRing(m.x, m.z, 0, 1.6, DMGC[r.ty], 0.4); S.shake = Math.max(S.shake || 0, 0.12); } }
  if (m.hp <= 0) killMob(m);
}
function dot(m, dmg) { if (m.dead) return; m.hp -= dmg; if (m.hp <= 0) killMob(m); }
function burn(m, mult) { m.burnT = 2.5; m.burnD = Math.max(m.burnD || 0, HS.atk * mult * HS.dmgMul * DMG_SCALE * 0.15 * lvDealK(m.lv - S.lv)); }
function freeze(m, t, ch) { if (ch !== undefined && Math.random() >= ch * (m.wetT > 0 ? 2 : 1)) return; const d = m.boss ? t * 0.35 : t; if (d > (m.frzT || 0)) m.frzT = d; }
function shock(m, t) { m.shockT = Math.max(m.shockT || 0, t); m.stunT = Math.max(m.stunT || 0, m.boss ? 0.1 : 0.35); }
function knock(m, d) { const dx = m.x - S.pos.x, dz = m.z - S.pos.z, l = Math.hypot(dx, dz) || 1; const k = m.boss ? d * 0.2 : d; const nx = m.x + dx / l * k, nz = m.z + dz / l * k; if (!collides(nx, nz, 0.4) && Math.hypot(nx, nz) < 21) { m.x = nx; m.z = nz; } }
function killMob(m, killer) {
  m.dead = 1; m.hp = 0; m.respawn = m.boss ? 0 : 2.5;
  const share = killer && inParty(killer.b) && !S.dead && Math.hypot(killer.pos.x - S.pos.x, killer.pos.z - S.pos.z) < 15;
  if (!killer) { S.kills++; recover(REC.hpKill, REC.mpKill); }
  burst(m.x, mobH(m), m.z, m.boss ? 80 : 40, C3(m.T.color), m.boss ? 9 : 6, m.boss ? 0.8 : 0.5, 0.9); burst(m.x, mobH(m), m.z, m.boss ? 40 : 20, C3('#ffffff'), 3, 0.3, 0.7);
  if (m.mini) { banner('HẠ TINH ANH ' + m.T.name.toUpperCase() + '!', 'gold'); S.mini = null; S.miniT = MAPS[S.map].boss.respawn / 3; fxBeam(m.x, m.z, '#ffd27a', 1.5, 1.2); }
  const B = m.boss ? 1 : m.mini ? 1 / 3 : 0;
  if (m.boss) { S.shake = 0.5; banner('ĐÃ HẠ ' + m.T.name.toUpperCase() + '!', 'gold'); log('Hạ boss ' + m.T.name + '! Phần thưởng lớn rơi ra.', '#ffd27a'); if (S.boss === m) S.boss = null; if (S.boss2 === m) S.boss2 = null; if (!S.boss && !S.boss2) S.bossT = MAPS[S.map].boss.respawn; fxBeam(m.x, m.z, '#ffd27a', 2, 1.6); }
  const xp0 = mobExp(m.lv) * (B ? 30 * B : 1);
  if (killer) { killer.b.kills++; botGain(killer.b, xp0); if (m.boss && Math.random() < SOUL_RATE) { const c = makeCharm('soul', m.lv); if (!stackInto(killer.b.inv, c)) killer.b.inv.push(c); } killer.b.gold += Math.round((5 + m.lv) * rr(3, 8)); if (Math.random() < 0.02 + B) botLoot(killer.b); if (!share) return; }
  else for (const b of partyBots()) if (ents.has(b.id)) botGain(b, xp0 * 0.5);
  let xp = xp0 * clamp(1 + (m.lv - S.lv) * 0.05, 0.3, 1.5) * (1 + HS.expB) * (killer ? 0.5 : 1) * (S.party && S.party.members.length ? 1.1 : 1); gainExp(Math.round(xp));
  const lvl = m.lv, set = MAPS[S.map].set;
  if (m.boss && Math.random() < SOUL_RATE) { const c = makeCharm('soul', lvl); dropLoot(m.x, m.z, { kind: 'gear', gear: c }); banner('SOUL OF ANCIENT!', 'gold'); log('✦✦ Cực hiếm! Soul of Ancient rơi ra từ boss!', CHARMS.soul.col); }
  if (Math.random() < CHARM_RATE) { const c = makeCharm(pick(['dmg', 'hp', 'mp']), lvl); dropLoot(m.x, m.z, { kind: 'gear', gear: c }); log('✦ Siêu hiếm! ' + c.name + ' rơi ra!', CHARMS[c.charm].col); }
  if (B || Math.random() < 0.25) dropLoot(m.x, m.z, { kind: 'gold', amount: Math.round((5 + lvl) * rr(6, 14) * (B ? 25 * B : 1) * (1 + HS.goldB)) });
  const mats = {}; for (const k of MKEYS) if (Math.random() < DROP[k]) mats[k] = 1;
  if (B) { const big = { e: 8, c: 4, p: 3, d: 2, f: 6 }; for (const k in big) { const v = big[k] * B; mats[k] = Math.floor(v) + (Math.random() < v % 1 ? 1 : 0); if (!mats[k]) delete mats[k]; } if (Math.random() < 0.4 * B) mats.t = 1; if (Math.random() < 0.1 * B) mats.x = 1; }
  for (const k in mats) dropLoot(m.x, m.z, { kind: 'mat', k, amount: mats[k] });
  const ng = B ? Math.round(3 * B) : (Math.random() < 0.045 ? 1 : 0);
  for (let n = 0; n < ng; n++) { const q = Math.random(); let r = q < 0.03 ? 3 : q < 0.15 ? 2 : q < 0.45 ? 1 : 0; if (B) r = Math.min(3, Math.max(1, r + (Math.random() < 0.4 ? 1 : 0)));
    const g = makeGear(Math.random() < 0.3 ? pick(AS_SLOTS) : pick(SLOT_ORDER), r, lvl, r >= 1 && Math.random() < (B ? 0.75 : 0.45) ? set : null); if (r >= 1 && Math.random() < 0.4) g.plus = ri(1, r + 1); dropLoot(m.x, m.z, { kind: 'gear', gear: g }); }
  updateHud();
}
function gainExp(n) {
  if (S.lv >= MAXLV) return; S.exp += n;
  while (S.lv < MAXLV && S.exp >= expNeed(S.lv)) { S.exp -= expNeed(S.lv); S.lv++; recalc(); levelFx();
    const sk = SKILLS[S.cls].find(s => s.lv === S.lv); if (sk) { banner('MỞ KỸ NĂNG: ' + sk.name.toUpperCase(), 'gold'); log('Mở khóa kỹ năng ' + sk.name + '!', ELC[sk.el]); }
    const nm = MAPS.findIndex(mp => mp.req === S.lv); if (nm > 0) log('Đủ cấp vào ' + MAPS[nm].name + ' — mở Bản đồ để dịch chuyển.', '#9fe8ff');
    S.lvLog.push([Math.round(S.playT), S.lv]); if (S.lvLog.length > 60) S.lvLog.shift(); }
  updateHud();
}
let levelFxT = 0;
function levelFx() { if (levelFxT > 0.8) return; levelFxT = 1.6; fxText(S.pos.x, S.pos.z, 'LÊN CẤP!', '', 30, { big: true, life: 1.2 }, 3.4); if (S.lv % 10 === 0) log(`Đạt cấp ${S.lv}.`, '#6fe7ff');
  for (let i = 0; i < 60; i++) { const a = (i / 60) * 6.28; emit(S.pos.x + Math.cos(a) * 1.2, 0.2, S.pos.z + Math.sin(a) * 1.2, Math.cos(a) * 0.6, rr(3, 6), Math.sin(a) * 0.6, C3('#ffe08a'), 0.45, 1.2, -1, 0.97); } }

// ---------- loot on the ground (template gems, coins and beams) ----------
const loots = [];
const FEATHER = (() => { const s = new THREE.Shape(); s.moveTo(0, -0.2); s.quadraticCurveTo(0.12, 0, 0, 0.24); s.quadraticCurveTo(-0.12, 0, 0, -0.2); return new THREE.ShapeGeometry(s); })();
function dropLoot(x, z, it) {
  const g = new THREE.Group(); let col, geo, name, beam = false, cls = '';
  if (it.kind === 'gold') { col = new THREE.Color(0xffd36a); geo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 16); name = `${it.amount} Vàng`; cls = 'var(--gold)'; }
  else if (it.kind === 'mat') { const M = MATS[it.k]; col = new THREE.Color(M.col); geo = it.k === 'e' ? new THREE.IcosahedronGeometry(0.14) : it.k === 'f' ? FEATHER : new THREE.OctahedronGeometry(0.15).scale(0.8, 1.3, 0.8); name = M.name + (it.amount > 1 ? ' ×' + it.amount : ''); cls = M.col; beam = ['t', 'x', 'f'].includes(it.k); }
  else { const gr = it.gear; col = new THREE.Color(gr.charm ? CHARMS[gr.charm].col : gr.set ? SETS[gr.set].col : RARITY[gr.r].css); geo = new THREE.OctahedronGeometry(0.18); name = gr.name + (gr.plus ? ` +${gr.plus}` : ''); cls = gr.charm ? CHARMS[gr.charm].col : gr.set ? SETS[gr.set].col : RARITY[gr.r].css; beam = gr.r >= 1; }
  const gem = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, metalness: 0.8, roughness: 0.2, emissive: col, emissiveIntensity: it.kind === 'gold' ? 0.6 : 1.4, side: THREE.DoubleSide })); gem.position.y = 0.45; g.add(gem);
  if (beam) { const bm = beamMatBase.clone(); bm.uniforms.uC.value = col.clone().multiplyScalar(1.2); g.add(new THREE.Mesh(beamGeo, bm)); }
  const ox = rr(-0.8, 0.8), oz = rr(-0.8, 0.8); g.position.set(x + ox, 0, z + oz); scene.add(g);
  const el = document.createElement('div'); el.className = 'lbl loot-lbl'; el.style.color = cls; el.textContent = name; el.style.display = 'none'; labelsEl.appendChild(el);
  loots.push({ g, gem, x: x + ox, z: z + oz, it, el, t: 0, name, col });
}
// loot filter: with auto-loot on, only the chosen kinds are picked up (by walking over, auto-hunt or the pet)
const LOOT_KINDS = [['gold', 'Vàng', '#ffd36a'], ['e', 'Đá Cường Hóa', '#6fe7ff'], ['stone', 'Linh Thạch', '#c06aff'], ['f', 'Lông Vũ Thần', '#ffd85a'],
  ['g0', 'Đồ Thường', '#e9f1f2'], ['g1', 'Đồ Hiếm', '#5fb4ff'], ['g2', 'Đồ Sử Thi', '#c58bff'], ['g3', 'Đồ Huyền Thoại', '#ffb347'], ['set', 'Đồ Bộ (mọi độ hiếm)', '#7dffb0'], ['charm', 'Bùa & Soul of Ancient', '#ff9ad8']];
function lootDefaults() { const o = {}; for (const [k] of LOOT_KINDS) o[k] = true; return o; }
function lootOk(it) { const F = S.lootF || (S.lootF = lootDefaults());
  if (it.kind === 'gold') return F.gold; if (it.kind === 'mat') return it.k === 'e' ? F.e : it.k === 'f' ? F.f : F.stone;
  const g = it.gear; if (g.charm) return F.charm; if (g.set) return F.set; return F['g' + g.r]; }
function removeLoot(l) { scene.remove(l.g); l.el.remove(); }
const BAG_MAX = 120, CHARM_CAP = 100;
// stackable items (charms; not personal equipment) share one slot and carry a count n
const stackKey = g => g.slot === 'charm' ? 'charm:' + g.charm : null;
const qty = g => g.n || 1;
function stackInto(list, g) { const k = stackKey(g); if (!k) return false; const s = list.find(q => q !== g && stackKey(q) === k); if (!s) return false; s.n = qty(s) + qty(g); return true; }
function takeOne(list, g) { if (qty(g) > 1) { g.n--; return Object.assign({}, g, { id: uid(), n: 1 }); } const i = list.indexOf(g); if (i >= 0) list.splice(i, 1); return g; }
function addItem(g) { if (stackInto(S.inv, g)) return; if (S.inv.length >= BAG_MAX) { const p = sellPrice(g); S.gold += p; log(`Túi đầy, tự bán [${g.name}] được ${p} vàng`, '#6fe7ff'); return; } S.inv.push(g); }
function updateLoot(dt, t) {
  for (let i = loots.length - 1; i >= 0; i--) { const l = loots[i]; l.t += dt;
    l.gem.rotation.y = t * 2; l.gem.position.y = 0.45 + Math.sin(t * 3 + i) * 0.08 + Math.max(0, 1.2 - l.t * 3) * Math.sin(Math.min(l.t * 3, 1) * Math.PI);
    const ld = Math.hypot(l.x - S.pos.x, l.z - S.pos.z);
    if (!S.dead && S.autoLoot && l.t > 0.5 && ld < HS.loot && ld > 0.5 && lootOk(l.it)) { const k = Math.min(1, dt * 7 / Math.max(ld, 0.6)); l.x += (S.pos.x - l.x) * k * 1.5; l.z += (S.pos.z - l.z) * k * 1.5; l.g.position.set(l.x, 0, l.z); }
    if ((!S.dead && ld < 0.9 && (!S.autoLoot || lootOk(l.it))) || l.t > 40) {
      if (l.t <= 40) { const it = l.it;
        if (it.kind === 'gold') { S.gold += it.amount; }
        else if (it.kind === 'mat') { S.mats[it.k] += it.amount; log(`Nhặt được [${l.name}]`, MATS[it.k].col); }
        else { addItem(it.gear); if (it.gear.charm) recalc(); log(`Nhặt được [${l.name}] · ${RARITY[it.gear.r].n}${it.gear.set ? ' · ' + SETS[it.gear.set].n : ''}`, it.gear.set ? SETS[it.gear.set].col : RARITY[it.gear.r].css); }
        burst(l.x, 0.5, l.z, 6, l.col, 2, 0.25, 0.5); }
      removeLoot(l); loots.splice(i, 1); } }
}

// ---------- combat ----------
function nearestMob(maxD, x = S.pos.x, z = S.pos.z) { let b = null, bd = maxD; for (const m of mobs) { if (m.dead) continue; const d = Math.hypot(m.x - x, m.z - z); if (d < bd) { bd = d; b = m; } } return b; }
function mobsNear(x, z, r) { return mobs.filter(m => !m.dead && Math.hypot(m.x - x, m.z - z) <= r + (m.boss ? 1 : 0)); }
function bestCluster(range, R_) { let b = null, bc = -1; for (const m of mobsNear(S.pos.x, S.pos.z, range)) { let c = 0; for (const o of mobs) if (!o.dead && Math.hypot(o.x - m.x, o.z - m.z) <= R_) c++; if (m.boss) c += 2; if (c > bc) { bc = c; b = m; } } return b; }
const projs = [];
const PG = { shard: [new THREE.OctahedronGeometry(0.09).scale(0.6, 0.6, 2.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xbff8ff).multiplyScalar(2.6) })],
  arrow: [new THREE.OctahedronGeometry(0.06).scale(0.5, 0.5, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xb0ffc8).multiplyScalar(2.6) })],
  holy: [new THREE.SphereGeometry(0.13, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0b0).multiplyScalar(2.8) })],
  pet: [new THREE.SphereGeometry(0.08, 10, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe08a).multiplyScalar(3) })] };
const PROJM = { shard: () => new THREE.Mesh(...PG.shard), arrow: () => new THREE.Mesh(...PG.arrow), holy: () => new THREE.Mesh(...PG.holy), pet: () => new THREE.Mesh(...PG.pet) };
function heroTip() { return H3.tip ? H3.tip.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(S.pos.x, heroG.position.y + 1, S.pos.z); }
function attack(pref) {
  if (S.dead || S.atkCd > 0 || S.castT > 0) return; const Cl = CLS[S.cls];
  const tg = pref && !pref.dead && Math.hypot(pref.x - S.pos.x, pref.z - S.pos.z) <= Cl.range + 0.6 + (pref.boss ? 1 : 0) ? pref : nearestMob(Cl.melee ? Cl.range + 0.6 : Cl.range); if (!Cl.melee && !tg) return;
  S.atkCd = 1 / HS.aps; S.atkT = 0.001; fadeTo(H3.attack || 'Sword_Attack', 0.04, true, Math.max(1.6, HS.aps * 0.5));
  if (tg) S.face = Math.atan2(tg.x - S.pos.x, tg.z - S.pos.z);
  if (Cl.melee) {
    slash.visible = true; slashMat.uniforms.uT.value = 0; slashMat.uniforms.uC.value.set(S.cls === 'thunder' ? '#c8b0ff' : '#8ff0ff');
    slash.position.set(S.pos.x, heroG.position.y + HERO_H * 0.5, S.pos.z); slash.rotation.y = S.face - Math.PI / 2;
    setTimeout(() => { if (!S || S.dead) return; for (const m of mobs) { if (m.dead) continue; const dx = m.x - S.pos.x, dz = m.z - S.pos.z, d = Math.hypot(dx, dz); if (d > Cl.range + (m.boss ? 1 : 0)) continue;
        let da = Math.atan2(dx, dz) - S.face; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 1.25 || d < 0.6) { hitMob(m, 1, Cl.el); if (S.cls === 'fire') burn(m, 0.4); if (S.cls === 'thunder' && Math.random() < 0.2) chain(m); } } }, Math.min(120, 600 / HS.aps));
  } else { const from = heroTip(); const p = { type: Cl.proj, m: PROJM[Cl.proj](), pos: from.clone(), tgt: tg, speed: Cl.ps, mult: 1, el: Cl.el }; p.m.position.copy(from); scene.add(p.m); projs.push(p); }
}
function chain(m0) { const list = [m0]; for (let j = 0; j < 2; j++) { const l = list[list.length - 1]; let b = null, bd = 3; for (const m of mobs) { if (m.dead || list.includes(m)) continue; const d = Math.hypot(m.x - l.x, m.z - l.z); if (d < bd) { bd = d; b = m; } } if (!b) break; list.push(b); }
  fxBolt([heroTip(), ...list.map(m => new THREE.Vector3(m.x, mobH(m), m.z))], '#c8a8ff', 0.22); list.slice(1).forEach(m => { hitMob(m, 0.6, 'thunder'); if (Math.random() < 0.3) shock(m, 1.5); }); }
function projHit(p, m) {
  if (p.bot) { if (p.bot.alive) botHitMob(m, p.mult, p.bot); return; }
  const Cl = CLS[S.cls]; if (p.type === 'pet') { hitMob(m, p.mult, 'holy'); burst(m.x, mobH(m), m.z, 6, C3('#ffe08a'), 2, 0.25, 0.4); return; }
  if (p.type === 'holy') { for (const o of mobsNear(m.x, m.z, Cl.splash)) hitMob(o, p.mult, 'holy'); fxRing(m.x, m.z, 0, Cl.splash, '#ffd85a', 0.35); burst(m.x, mobH(m), m.z, 14, C3('#ffe680'), 3, 0.3, 0.5); return; }
  hitMob(m, p.mult, p.el);
  if (p.type === 'shard') { m.slowT = 1.6; m.slow = m.boss ? 0.2 : 0.4; if (Math.random() < 0.1) freeze(m, 1.2); burst(m.x, mobH(m), m.z, 8, C3('#bff6ff'), 2, 0.25, 0.4); }
  else { if (Math.random() < 0.25) m.wetT = 3; burst(m.x, mobH(m), m.z, 6, C3('#9dd8ff'), 2, 0.22, 0.4); }
}
function updateProjs(dt) {
  for (const p of projs) {
    if (p.dir) { p.pos.addScaledVector(p.dir, p.speed * dt); p.trav += p.speed * dt; for (const m of mobs) { if (m.dead) continue; if (Math.hypot(m.x - p.pos.x, m.z - p.pos.z) < (m.boss ? 1.4 : 0.6)) { projHit(p, m); p.done = true; break; } } if (p.trav > p.max) p.done = true; }
    else { if (!p.tgt || p.tgt.dead) { p.done = true; } else { const tgt = new THREE.Vector3(p.tgt.x, mobH(p.tgt), p.tgt.z); const d = tgt.clone().sub(p.pos); const step = p.speed * dt; if (d.length() <= step + 0.1) { projHit(p, p.tgt); p.done = true; } else { p.pos.addScaledVector(d.normalize(), step); p.look = tgt; } } }
    if (!p.done) { p.m.position.copy(p.pos); p.m.lookAt(p.look || p.pos.clone().add(p.dir)); if (projs.length < 30 || Math.random() < 0.3) emit(p.pos.x, p.pos.y, p.pos.z, rr(-0.2, 0.2), rr(-0.2, 0.2), rr(-0.2, 0.2), C3(CLS[S.cls].col), p.type === 'holy' ? 0.4 : 0.22, 0.3, 0, 0.95); }
    if (p.done) scene.remove(p.m);
  }
  for (let i = projs.length - 1; i >= 0; i--) if (projs[i].done) projs.splice(i, 1);
}

// ---------- skills (template arc ring, beams and particles) ----------
const sks = [];
function skillReady(j, strict) { const sk = SKILLS[S.cls][j]; return S.lv >= sk.lv && S.skCd[j] <= 0 && (!strict || S.atkCd <= 0) && S.mp >= skMp(sk) && !S.dead; }
let skNameT = [0, 0, 0];
function heroRing(hex) { skillRing.visible = true; skillMat.uniforms.uT.value = 0; skillMat.uniforms.uC.value.set(hex); skillRing.position.set(S.pos.x, 0.6, S.pos.z); S.skillT = 0.001; }
function castSkill(j, pref) {
  if (!skillReady(j, !!pref)) return false; const sk = SKILLS[S.cls][j]; const Cl = CLS[S.cls]; const rng = Math.max(Cl.range, 7);
  const self = ['spinbolt', 'firespin', 'tide', 'blessing'].includes(sk.id);
  const tg = pref && !pref.dead ? pref : (bestCluster(rng, 2.4) || nearestMob(rng));
  if (!tg && sk.id !== 'blessing') return false;
  if (self && sk.id !== 'blessing' && !mobsNear(S.pos.x, S.pos.z, 3.2).length) return false;
  const zoneSk = ['storm', 'blizzard', 'judg', 'arrowrain', 'meteor'];
  if (zoneSk.includes(sk.id)) { const live = sks.filter(o => o.sk === sk.id); if (live.length >= 3) { const o = live[0]; o.done = true; if (o.m && o.type === 'meteor') scene.remove(o.m); } }
  S.mp -= skMp(sk); S.skCd[j] = skCd(sk); S.atkCd = 1 / HS.aps; S.castT = Math.min(0.3, 1 / HS.aps); fadeTo(H3.attack || 'Sword_Attack', 0.04, true, Math.max(1.4, HS.aps * 0.5));
  if (tg) S.face = Math.atan2(tg.x - S.pos.x, tg.z - S.pos.z);
  const col = ELC[sk.el]; // skill names are no longer shown when casting
  const nP = Math.round(40 * Math.min(1, skCd(sk) / 0.8));
  for (let i = 0; i < nP; i++) { const a = rr(0, 6.28), s = rr(3, 7); emit(S.pos.x, heroG.position.y + 0.7, S.pos.z, Math.cos(a) * s, rr(0, 2), Math.sin(a) * s, C3(col), 0.4, 0.6, 0, 0.9); }
  const D = sk.mult, px = S.pos.x, pz = S.pos.z;
  switch (sk.id) {
    case 'bolts': { const list = []; for (let n = 0; n < 5; n++) { const pool = mobsNear(tg.x, tg.z, 2.2); const m = pool.length ? pick(pool) : tg; list.push({ x: m.x + rr(-0.3, 0.3), z: m.z + rr(-0.3, 0.3) }); } sks.push({ type: 'boltseq', list, t: 0, n: 0, D }); break; }
    case 'storm': fxRing(tg.x, tg.z, 0, 2.6, col, 0.8); sks.push({ type: 'storm', sk: 'storm', x: tg.x, z: tg.z, R: 2.6, t: 0, dur: 2, tick: 0.1, D, col }); break;
    case 'spinbolt': case 'firespin': { heroRing(col); S.spinT = 0.5; const el = sk.id === 'spinbolt' ? 'thunder' : 'fire'; setTimeout(() => { if (!S) return; for (const m of mobsNear(S.pos.x, S.pos.z, 3.2)) { hitMob(m, D, el); if (el === 'thunder') shock(m, 2); else burn(m, 0.5); } }, 160); break; }
    case 'flamewave': case 'pierce': { const dir = new THREE.Vector3(tg.x - px, 0, tg.z - pz).normalize(); sks.push({ type: 'line', el: sk.id === 'flamewave' ? 'fire' : 'water', col, x: px, z: pz, dir, sp: 13, trav: 0, max: 10, W: sk.id === 'flamewave' ? 1.1 : 0.9, hit: new Set(), D }); break; }
    case 'meteor': { const o = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa040).multiplyScalar(3) })); scene.add(o); sks.push({ type: 'meteor', sk: 'meteor', x: tg.x, z: tg.z, t: 0, dur: 0.6, D, m: o }); break; }
    case 'blizzard': fxRing(tg.x, tg.z, 0, 2.6, col, 0.8); sks.push({ type: 'blizzard', sk: 'blizzard', x: tg.x, z: tg.z, R: 2.6, t: 0, dur: 2, tick: 0.1, D, pulse: 0 }); break;
    case 'icepillars': { const list = mobsNear(tg.x, tg.z, 3.6).sort((a, b) => Math.hypot(a.x - tg.x, a.z - tg.z) - Math.hypot(b.x - tg.x, b.z - tg.z)).slice(0, 8); list.forEach((m, n) => sks.push({ type: 'pillar', m, t: -n * 0.08, D })); break; }
    case 'icefan': case 'arrowfan': { const n = sk.id === 'icefan' ? 7 : 5, spread = sk.id === 'icefan' ? 0.5 : 0.35; const base = Math.atan2(tg.x - px, tg.z - pz); const from = heroTip(); const type = sk.id === 'icefan' ? 'shard' : 'arrow';
      for (let k = 0; k < n; k++) { const a = base + (k / (n - 1) - 0.5) * 2 * spread; const p = { type, m: PROJM[type](), pos: from.clone(), dir: new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), speed: 14, trav: 0, max: 9, mult: D, el: sk.el }; p.m.position.copy(from); scene.add(p.m); projs.push(p); } break; }
    case 'arrowrain': { fxRing(tg.x, tg.z, 0, 2.5, col, 1.0); const arr = []; for (let n = 0; n < 14; n++) { const a = rr(0, 6.28), r = Math.sqrt(Math.random()) * 2.5; arr.push({ x: tg.x + Math.cos(a) * r, z: tg.z + Math.sin(a) * r, t: Math.random() * 0.75, hit: false }); } sks.push({ type: 'arrowrain', sk: 'arrowrain', arr, t: 0, dur: 1.1, D }); break; }
    case 'tide': heroRing(col); sks.push({ type: 'tide', x: px, z: pz, R: 3.6, t: 0, dur: 0.6, hit: new Set(), D }); break;
    case 'judg': { let c = tg; for (const m of mobsNear(px, pz, rng)) if (m.hp > c.hp) c = m; sks.push({ type: 'judg', sk: 'judg', m: c, x: c.x, z: c.z, t: 0, dur: 1.2, tick: 0, D, beam: fxBeam(c.x, c.z, '#ffd070', 1.5, 1.4) }); break; }
    case 'blessing': { heroRing(col); const heal = Math.round(HS.hp * 0.1); S.hp = Math.min(HS.hp, S.hp + heal); fxText(px, pz, '+' + heal, '#7dff9a', 20, { life: 1.3 }, HERO_H + 0.8); fxBeam(px, pz, '#ffe08a', 1.2, 1.2); setTimeout(() => { if (!S) return; for (const m of mobsNear(S.pos.x, S.pos.z, 3)) hitMob(m, D, 'holy'); }, 160); break; }
  }
  return true;
}
function updSkills(dt) {
  for (const s of sks) { s.t += dt;
    switch (s.type) {
      case 'boltseq': while (s.n < s.list.length && s.t >= s.n * 0.1) { const q = s.list[s.n++]; fxBolt([new THREE.Vector3(q.x, 7, q.z), new THREE.Vector3(q.x, 0.3, q.z)], '#c8a8ff', 0.3); fxRing(q.x, q.z, 0, 1.0, '#c8a8ff', 0.35); burst(q.x, 0.4, q.z, 14, C3('#e0d0ff'), 4, 0.3, 0.5); for (const m of mobsNear(q.x, q.z, 0.9)) { shock(m, 2); hitMob(m, s.D, 'thunder'); } } if (s.n >= s.list.length && s.t > 0.6) s.done = true; break;
      case 'storm': for (let k = 0; k < 3; k++) { const a = rr(0, 6.28), r = Math.sqrt(Math.random()) * s.R; emit(s.x + Math.cos(a) * r, 3.2, s.z + Math.sin(a) * r, 0, -7, 0, C3('#9fc8ff'), 0.18, 0.45, 0, 1); }
        s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.5; fxRing(s.x, s.z, 0, s.R, s.col, 0.5); const pool = mobsNear(s.x, s.z, s.R); pool.forEach(m => m.wetT = 3); for (let n = 0; n < 2 && pool.length; n++) { const m = pick(pool); fxBolt([new THREE.Vector3(m.x + rr(-0.5, 0.5), 4, m.z), new THREE.Vector3(m.x, mobH(m), m.z)], '#c8a8ff', 0.22); shock(m, 1.5); hitMob(m, s.D, 'thunder'); } }
        if (s.t >= s.dur) s.done = true; break;
      case 'line': { const step = s.sp * dt; s.x += s.dir.x * step; s.z += s.dir.z * step; s.trav += step;
        for (let n = 0; n < 6; n++) emit(s.x + rr(-s.W, s.W) * 0.6, rr(0.2, 1.0), s.z + rr(-s.W, s.W) * 0.6, -s.dir.x * 1.5 + rr(-0.5, 0.5), rr(0.2, 1), -s.dir.z * 1.5 + rr(-0.5, 0.5), C3(n % 2 ? s.col : '#ffffff'), rr(0.25, 0.5), 0.45, 0, 0.95);
        for (const m of mobs) { if (m.dead || s.hit.has(m)) continue; if (Math.hypot(m.x - s.x, m.z - s.z) <= s.W + (m.boss ? 0.8 : 0)) { s.hit.add(m); if (s.el === 'fire') burn(m, 0.5); else { m.wetT = 3; knock(m, 1.5); } hitMob(m, s.D, s.el); } }
        if (s.trav >= s.max) s.done = true; break; }
      case 'meteor': { const k = Math.min(1, s.t / s.dur); s.m.position.set(s.x + 3 * (1 - k), 0.3 + 7 * (1 - k), s.z - 1.5 * (1 - k)); for (let n = 0; n < 4; n++) emit(s.m.position.x, s.m.position.y, s.m.position.z, rr(-0.5, 1), rr(0.5, 1.5), rr(-0.5, 0.5), C3(n % 2 ? '#ff7a1a' : '#ffd060'), 0.5, 0.45, 0, 0.95);
        if (k >= 1) { scene.remove(s.m); S.shake = Math.max(S.shake || 0, 0.35); burst(s.x, 0.4, s.z, 60, C3('#ff7a1a'), 8, 0.6, 0.8); burst(s.x, 0.4, s.z, 24, C3('#ffe08a'), 5, 0.4, 0.6); fxRing(s.x, s.z, 0, 2.8, '#ff9a3a', 0.55);
          for (const m of mobsNear(s.x, s.z, 2.4)) { burn(m, 0.6); hitMob(m, s.D, 'fire'); } sks.push({ type: 'firezone', sk: 'meteor', x: s.x, z: s.z, R: 2, t: 0, dur: 2, tick: 0, D: s.D * 0.04 }); s.done = true; } break; }
      case 'firezone': if (Math.random() < dt * 30) { const a = rr(0, 6.28), r = Math.sqrt(Math.random()) * s.R; emit(s.x + Math.cos(a) * r, 0.05, s.z + Math.sin(a) * r, 0, rr(1, 2.2), 0, C3(Math.random() < 0.5 ? '#ff7a1a' : '#ffcf5a'), 0.4, 0.7, 0.3, 0.98); }
        s.tick -= dt; if (s.tick <= 0) { s.tick = 0.3; for (const m of mobsNear(s.x, s.z, s.R)) { burn(m, 0.4); dot(m, HS.atk * s.D * HS.dmgMul * DMG_SCALE * vuln(m, 'fire') * lvDealK(m.lv - S.lv)); } } if (s.t >= s.dur) s.done = true; break;
      case 'blizzard': if (s.t < s.dur) for (let n = 0; n < 5; n++) { const a = rr(0, 6.28), r = Math.sqrt(Math.random()) * s.R; emit(s.x + Math.cos(a) * r, rr(0.2, 2.6), s.z + Math.sin(a) * r, Math.cos(a + 1.6) * 2, -1, Math.sin(a + 1.6) * 2, C3('#e8fbff'), 0.22, 0.6, 0, 0.98); }
        s.pulse -= dt; if (s.pulse <= 0 && s.t < s.dur) { s.pulse = 0.8; fxRing(s.x, s.z, 0, s.R, '#9ff0ff', 0.6, 0, 0.3); }
        s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.4; for (const m of mobsNear(s.x, s.z, s.R)) { m.slowT = 1; m.slow = m.boss ? 0.25 : 0.5; freeze(m, 1.2, 0.12); hitMob(m, s.D, 'ice'); } } if (s.t >= s.dur + 0.3) s.done = true; break;
      case 'pillar': if (s.t >= 0 && !s.fired) { s.fired = true; const x = s.m.x, z = s.m.z; fxRing(x, z, 0, 0.9, '#9ff0ff', 0.4, 0, 0.2); for (let n = 0; n < 24; n++) emit(x + rr(-0.25, 0.25), 0.1, z + rr(-0.25, 0.25), rr(-0.3, 0.3), rr(3, 6), rr(-0.3, 0.3), C3(n % 3 ? '#bff8ff' : '#ffffff'), rr(0.25, 0.45), 0.6, -6, 0.95);
          for (const o of mobsNear(x, z, 0.9)) { freeze(o, 1.6); hitMob(o, s.D, 'ice'); } } if (s.t >= 0.6) s.done = true; break;
      case 'arrowrain': for (const a of s.arr) { if (!a.hit && s.t >= a.t && s.t < a.t + 0.25) { const k = (s.t - a.t) / 0.25; emit(a.x, 3 * (1 - k), a.z, 0, -12, 0, C3('#9fe0ff'), 0.25, 0.12, 0, 1); }
          if (!a.hit && s.t >= a.t + 0.25) { a.hit = true; burst(a.x, 0.2, a.z, 8, C3('#9fe0ff'), 2, 0.25, 0.4); for (const m of mobsNear(a.x, a.z, 0.8)) { m.wetT = 3; hitMob(m, s.D, 'water'); } } } if (s.t >= s.dur) s.done = true; break;
      case 'tide': { const r = s.R * (1 - Math.pow(1 - Math.min(1, s.t / s.dur), 3)); for (const m of mobs) { if (m.dead || s.hit.has(m)) continue; if (Math.hypot(m.x - s.x, m.z - s.z) <= r) { s.hit.add(m); m.wetT = 3; knock(m, 2); hitMob(m, s.D, 'water'); } }
        for (let n = 0; n < 4; n++) { const a = rr(0, 6.28); emit(s.x + Math.cos(a) * r, 0.2, s.z + Math.sin(a) * r, Math.cos(a), 1.6, Math.sin(a), C3(n % 2 ? '#bfe8ff' : '#4ab8ff'), 0.3, 0.45, -3, 0.97); } if (s.t >= s.dur + 0.2) s.done = true; break; }
      case 'judg': if (s.m && !s.m.dead) { s.x = s.m.x; s.z = s.m.z; } s.beam.position.set(s.x, 0, s.z); if (s.t < s.dur) emit(s.x + rr(-0.5, 0.5), 0.1, s.z + rr(-0.5, 0.5), 0, rr(3, 5), 0, C3(Math.random() < 0.5 ? '#fff0b0' : '#ffb040'), 0.35, 0.6, 0, 0.98);
        s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.2; for (const m of mobsNear(s.x, s.z, 1.5)) { burn(m, 0.3); hitMob(m, s.D, 'fire'); } } if (s.t >= s.dur + 0.3) s.done = true; break;
    }
  }
  for (let i = sks.length - 1; i >= 0; i--) if (sks[i].done) sks.splice(i, 1);
}


// ---------- pets & mounts ----------
function makeRay(c1, c2) { // manta ray: flat diamond body with undulating wing tips + whip tail
  const g = new THREE.Group(); const geo = new THREE.PlaneGeometry(2.4, 1.5, 28, 14); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, cols = [], A = new THREE.Color(c1), B = new THREE.Color(c2), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const u = x / 1.2, v = z / 0.75; // u: span, v: length (+v = nose)
    const halfW = (1 - Math.pow(Math.abs(v - 0.1), 1.6)) * (v > 0.1 ? 0.75 : 1); const xx = u * Math.max(0.04, halfW) * 1.2;
    const bump = Math.max(0, 1 - u * u * 2.5) * Math.max(0, 1 - v * v) * 0.22; p.setXYZ(i, xx, bump, z);
    tmp.copy(A).lerp(B, Math.min(0.85, Math.pow(Math.abs(u), 2.2) * 0.85 + (Math.abs(v) > 0.7 ? 0.2 : 0))); cols.push(tmp.r, tmp.g, tmp.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const mat = stylized({ vertexColors: true, roughness: 0.45, metalness: 0.2, side: THREE.DoubleSide, emissive: new THREE.Color(c2).multiplyScalar(0.04) }, c2, 0.55, 2.6);
  const body = new THREE.Mesh(geo, mat); g.add(body);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.005, 1.4, 6).rotateX(Math.PI / 2).translate(0, 0.02, -1.4), stylized({ color: c1, roughness: 0.4 }, c2, 0.8)); g.add(tail);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(c2).multiplyScalar(3) }));
  for (const sx of [-0.18, 0.18]) { const e = glow.clone(); e.position.set(sx, 0.12, 0.62); g.add(e); }
  const base = Float32Array.from(p.array); g.userData = { geo, base, tail };
  return { group: g, kind: 'ray' };
}
function animRay(r, t, moving) { const { geo, base, tail } = r.group.userData; const p = geo.attributes.position, f = moving ? 5 : 2.4, a = moving ? 0.28 : 0.16;
  for (let i = 0; i < p.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; const w = Math.abs(x) / 1.2; p.setY(i, base[i * 3 + 1] + Math.sin(t * f - z * 2.2) * a * w * w); }
  p.needsUpdate = true; geo.computeVertexNormals(); tail.rotation.y = Math.sin(t * f * 0.7) * 0.25; }

function makeUnicorn() { // divine unicorn: pearl body, glowing golden horn, flowing rainbow mane and tail, golden hooves
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const pearl = stylized({ color: 0xb8b2d0, roughness: 0.4, metalness: 0.2, envMapIntensity: 1.0 }, 0xc8a0ff, 0.6, 2.2);
  const gold = stylized({ color: 0xffd86a, metalness: 0.95, roughness: 0.2, emissive: new THREE.Color(0x553300) }, 0xfff0b0, 0.8);
  const rbM = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
  const rainbowStrip = (w, h, segs) => { const geo = new THREE.PlaneGeometry(w, h, 1, segs); const p = geo.attributes.position, c = [], col = new THREE.Color(); for (let i = 0; i < p.count; i++) { col.setHSL((p.getY(i) / h + 0.5) * 0.85, 1, 0.62); c.push(col.r * 1.6, col.g * 1.6, col.b * 1.6); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; };
  part(SPH, pearl, 0.3, 0.29, 0.58, 0, 0.78, 0, body);
  const neck = new THREE.Group(); neck.position.set(0, 0.95, 0.42); neck.rotation.x = -0.55; body.add(neck);
  part(SPH, pearl, 0.13, 0.32, 0.15, 0, 0.22, 0, neck);
  const head = new THREE.Group(); head.position.set(0, 0.5, 0.05); neck.add(head); head.rotation.x = 0.95;
  part(SPH, pearl, 0.12, 0.13, 0.27, 0, 0, 0.12, head); part(SPH, pearl, 0.09, 0.08, 0.1, 0, -0.03, 0.34, head);
  for (const s of [-1, 1]) { part(SPH_LO, glowM(0x9fd0ff), 0.025, 0.025, 0.02, s * 0.1, 0.04, 0.2, head); const e = part(CONE, pearl, 0.035, 0.12, 0.03, s * 0.07, 0.15, 0.0, head); e.rotation.z = -s * 0.3; }
  const horn = new THREE.Group(); horn.position.set(0, 0.12, 0.14); horn.rotation.x = -0.7; head.add(horn);
  part(new THREE.ConeGeometry(0.035, 0.42, 12, 6).translate(0, 0.21, 0), gold, 1, 1, 1, 0, 0, 0, horn);
  for (let k = 0; k < 5; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.03 - k * 0.005, 0.007, 6, 16), glowM(0xfff0b0)); r.rotation.x = Math.PI / 2; r.position.y = 0.06 + k * 0.07; horn.add(r); }
  const hornGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: new THREE.Color(0xffe8a0).multiplyScalar(1.4), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); hornGlow.position.y = 0.44; hornGlow.scale.setScalar(0.35); horn.add(hornGlow);
  const mane = []; for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(rainbowStrip(0.1, 0.32, 6), rbM); m.position.set(0, 0.08 + k * 0.075, -0.1); m.rotation.set(-0.4, 0, 0); neck.add(m); mane.push(m); }
  const tail = new THREE.Group(); tail.position.set(0, 0.9, -0.55); body.add(tail); const tails = []; for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(rainbowStrip(0.12, 0.6, 8).translate(0, -0.3, 0), rbM); m.rotation.set(0.6 + k * 0.05, (k - 1.5) * 0.25, 0); tail.add(m); tails.push(m); }
  const legs = []; for (const [x, z] of [[-0.15, 0.36], [0.15, 0.36], [-0.15, -0.36], [0.15, -0.36]]) { const hip = new THREE.Group(); hip.position.set(x, 0.62, z); body.add(hip);
    part(CYL, pearl, 0.055, 0.32, 0.055, 0, -0.16, 0, hip); const knee = new THREE.Group(); knee.position.y = -0.32; hip.add(knee); part(CYL, pearl, 0.04, 0.26, 0.04, 0, -0.13, 0, knee); part(CYL, gold, 0.052, 0.06, 0.052, 0, -0.28, 0, knee); legs.push({ hip, knee }); }
  return { group: g, kind: 'unicorn', body, legs, mane, tail, tails, neck, head, hornGlow }; }
function animUnicorn(u, t, moving) { const f = moving ? 9 : 1.6, a = moving ? 0.6 : 0.04;
  u.legs.forEach((L, i) => { const ph = t * f + [0, Math.PI, Math.PI * 0.5, Math.PI * 1.5][i]; L.hip.rotation.x = Math.sin(ph) * a; L.knee.rotation.x = Math.max(0, -Math.cos(ph)) * a * 1.4; });
  u.body.position.y = moving ? Math.abs(Math.sin(t * f)) * 0.05 : Math.sin(t * 1.5) * 0.01; u.body.rotation.x = moving ? Math.sin(t * f * 2) * 0.03 : 0;
  u.neck.rotation.x = -0.55 + (moving ? Math.sin(t * f) * 0.08 : Math.sin(t * 0.8) * 0.04); u.hornGlow.scale.setScalar(0.32 + Math.sin(t * 4) * 0.06);
  u.mane.forEach((m, k) => { m.rotation.x = -0.4 - (moving ? 0.5 : 0.1) + Math.sin(t * 6 - k * 0.7) * 0.18; });
  u.tail.rotation.x = (moving ? 0.5 : 0) + Math.sin(t * 2) * 0.1; u.tails.forEach((m, k) => { m.rotation.y = (k - 1.5) * 0.25 + Math.sin(t * 5 + k) * 0.15; });
  if (moving && Math.random() < 0.6) { const p = new THREE.Vector3(); u.legs[ri(0, 3)].knee.localToWorld(p.set(0, -0.3, 0)); emit(p.x, p.y + 0.05, p.z, rr(-0.4, 0.4), rr(0.3, 0.9), rr(-0.4, 0.4), new THREE.Color().setHSL(Math.random(), 1, 0.65), 0.3, 0.7, -0.3, 0.95); } }
let petObj = null, mountObj = null, petShotT = 0; const petPos = new THREE.Vector3(0, 1.4, 8);
function applyPetMount() {
  if (petObj) { scene.remove(petObj.group); petObj = null; } if (mountObj) { heroG.remove(mountObj.group); mountObj = null; }
  heroBody.position.y = 0; if (!S) return;
  const P = curPet(); if (P) { petObj = P.model === 'jelly' ? makeJelly(P.pal) : makeFish(P.pal); petObj.group.scale.setScalar(P.size); scene.add(petObj.group); petPos.set(S.pos.x + 1, 1.4, S.pos.z); }
  const Mt = curMount(); if (Mt) { mountObj = Mt.model === 'ray' ? makeRay(Mt.c1, Mt.c2) : Mt.model === 'unicorn' ? makeUnicorn() : makeFish(Mt.pal);
    if (Mt.model === 'unicorn') { mountObj.group.position.set(0, -0.43, -0.05); heroBody.position.y = 0.6; }
    else if (Mt.model === 'ray') { mountObj.group.position.set(0, -0.34, 0); mountObj.group.scale.setScalar(0.78); heroBody.position.y = -0.15; }
    else { mountObj.group.scale.setScalar(Mt.size); mountObj.group.position.set(0, -0.25, -0.05); heroBody.position.y = 0.28; }
    heroG.add(mountObj.group); }
}
function updatePet(dt, t) {
  if (!petObj || S.dead) { if (petObj) petObj.group.visible = !S.dead; return; } petObj.group.visible = true;
  const P = curPet(); const c = Math.cos(S.face), sn = Math.sin(S.face); const tx = S.pos.x - 0.9 * c - 0.7 * sn, tz = S.pos.z + 0.9 * sn - 0.7 * c;
  petPos.x += (tx - petPos.x) * Math.min(1, dt * 3); petPos.z += (tz - petPos.z) * Math.min(1, dt * 3); petPos.y = 1.5 + Math.sin(t * 2.4) * 0.15;
  const g = petObj.group; g.position.copy(petPos); g.rotation.y = Math.atan2(tx - petPos.x + sn * 0.01, tz - petPos.z + c * 0.01);
  if (petObj.kind === 'jelly') { const pu = Math.sin(t * 3); petObj.bell.scale.set(1 + pu * 0.08, 1 - pu * 0.12, 1 + pu * 0.08); g.rotation.set(Math.sin(t) * 0.15, t * 0.6, 0); } else petObj.tail.rotation.y = Math.sin(t * 9) * 0.45;
  if (Math.random() < dt * 6) emit(petPos.x + rr(-0.15, 0.15), petPos.y, petPos.z + rr(-0.15, 0.15), 0, rr(-0.4, -0.1), 0, C3(Math.random() < 0.5 ? '#ffffff' : '#9fe8ff'), 0.16, 0.8, 0, 0.99);
  if (P.atk > 0) { petShotT -= dt; if (petShotT <= 0) { const m = nearestMob(6.5, petPos.x, petPos.z); if (m) { petShotT = 3 / HS.aps; const p = { type: 'pet', m: PROJM.pet(), pos: petPos.clone(), tgt: m, speed: 11, mult: P.atk * 3, el: 'holy' }; p.m.position.copy(petPos); scene.add(p.m); projs.push(p); } } }
}
function updateMount(dt, t, moving) { if (!mountObj) return; if (mountObj.kind === 'unicorn') animUnicorn(mountObj, t, moving); else if (mountObj.kind === 'ray') animRay(mountObj, t, moving); else mountObj.tail.rotation.y = Math.sin(t * (moving ? 10 : 4)) * 0.4; }
// ---------- hero update (template motion) ----------
const input = { x: 0, z: 0, keys: {} };
function heroDie() { S.dead = 3; const lost = Math.floor(S.exp * 0.03); S.exp -= lost; banner('BẠN ĐÃ GỤC NGÃ', 'red'); log('Hồi sinh sau 3 giây' + (lost ? ` (mất ${lost} EXP)` : '') + '.', '#ff9a9a'); for (const m of mobs) m.aggro = false; heroG.visible = false; burst(S.pos.x, 1, S.pos.z, 40, C3('#ff6a6a'), 5, 0.4, 0.8); }
const WTIER = [[0xeafcff, 0x2f6bff, 0x9ff0ff], [0xeafcff, 0x2f6bff, 0x9ff0ff], [0xe6f6ff, 0x1d8bff, 0x7fd8ff], [0xf6e8ff, 0x8a3dff, 0xd8a8ff], [0xfff4d8, 0xff9d1f, 0xffe08a], [0xfff4d8, 0xff9d1f, 0xffe08a]];
const WSCALE = [1, 1.06, 1.12, 1.18, 1.25, 1.32];
function applyGearVisuals() {
  if (!S) return; const w = S.eq.weapon, a = Math.max(S.eq.armor?.plus || 0, S.eq.helm?.plus || 0);
  const wt = tier(w?.plus || 0); heroMats.glow.color.set(wt ? TIER_COL[wt] : CLS[S.cls].glow).multiplyScalar(2.2 + wt * 0.6);
  const at = tier(a);
  heroMats.steel.userData.u.uRim.value.setHex(0xcfeaff); heroMats.steel.userData.u.uRimStr.value = Math.max(0.6, [0.45, 0.9, 1.1, 1.3][at] * 1.1); // cool rim keeps the hero apart from warm scenes
  heroMats.dark.userData.u.uRim.value.setHex(0xa8d8ff); heroMats.dark.userData.u.uRimStr.value = [0.35, 0.7, 0.9, 1.1][at] * 1.5;
  heroMats.gold.userData.u.uRimStr.value = [0.45, 0.6, 0.9, 1.0][at];
  const c = WTIER[S.wing]; wingMat.uniforms.uRoot.value.setHex(c[0]); wingMat.uniforms.uTip.value.setHex(c[1]); wingMat.uniforms.uEdge.value.setHex(c[2]); wingMat.uniforms.uB.value = 0.62 + S.wing * 0.05;
  wings.scale.setScalar(1.0 * HERO_H / 2.3 * 1.15 * WSCALE[S.wing]); lookShield();
  S.glowTier = Math.max(wt, at);
}
function updateHero(dt, t) {
  S.playT += dt; updatePet(dt, t); updateMount(dt, t, Math.hypot(input.x, input.z) > 0 || !!S.moveTo);
  if (S.dead > 0) { S.dead -= dt; if (S.dead <= 0) { S.dead = 0; if (!isTown()) travel(TOWN); S.pos.set(0, 0, 8); recalc(true); heroG.visible = true; fxBeam(0, 8, '#9fe8ff', 1.2); } return; }
  let mx = 0, mz = 0;
  if (input.keys.KeyW || input.keys.ArrowUp) mz -= 1; if (input.keys.KeyS || input.keys.ArrowDown) mz += 1; if (input.keys.KeyA || input.keys.ArrowLeft) mx -= 1; if (input.keys.KeyD || input.keys.ArrowRight) mx += 1;
  let mag = Math.hypot(mx, mz); const keys = mag > 0.12; const Cl = CLS[S.cls];
  if (keys) { S.moveTo = null; S.tapMob = null; S.nav = null; }
  const fol = !keys && !S.moveTo ? followLeaderDir() : null;
  if (fol) { if (fol[0] || fol[1]) { [mx, mz] = fol; mag = 1; } else if (S.auto && !isTown()) { const m = nearestMob(Cl.range + 0.4); if (m) { S.face = Math.atan2(m.x - S.pos.x, m.z - S.pos.z); for (let j = 2; j >= 0; j--) if (castSkill(j, m)) break; attack(m); } } }
  if (S.tapMob && (S.tapMob.dead || !mobs.includes(S.tapMob))) S.tapMob = null;
  if (!keys && S.moveTo) { // touch / click: walk to the touched point
    const d = Math.hypot(S.moveTo.x - S.pos.x, S.moveTo.z - S.pos.z);
    if (d > 0.25) { [mx, mz] = navDir(S.moveTo.x, S.moveTo.z); mag = 1; if (!S.moveTo.hold && S.nav && S.nav.fail && S.time - S.moveTo.t > 4) S.moveTo = null; }
    else if (!S.moveTo.hold) S.moveTo = null;
  } else if (!fol && !keys && (S.auto || S.tapMob) && !isTown()) {
    let target = S.tapMob, best = 1e9;
    // boss hunt: the main boss (then the elite) comes first; shortly before the boss spawns, wait at its gate
    if (!target && S.bossHunt) { const M = MAPS[S.map]; const bs = [S.boss, S.boss2].filter(b => b && !b.dead).sort((a, b) => Math.hypot(a.x - S.pos.x, a.z - S.pos.z) - Math.hypot(b.x - S.pos.x, b.z - S.pos.z)); const bm = bs[0] || (S.mini && !S.mini.dead ? S.mini : null);
      if (bm) target = bm; else if (M.boss && !S.boss && !S.boss2 && S.bossT < 10) { const gx = 0, gz = M.boss.z + 2.5; if (Math.hypot(gx - S.pos.x, gz - S.pos.z) > 1.2) target = { x: gx, z: gz, wait: true }; } }
    if (!target && S.autoLoot) for (const l of loots) { const d = Math.hypot(l.x - S.pos.x, l.z - S.pos.z); if (d < 9 && d < best && !(l.noReach > S.time) && lootOk(l.it)) { best = d; target = l; } }
    if (!target) for (const m of mobs) { if (m.dead || m.noReach > S.time) continue; if (m.boss && HS.hp < m.atk * 6) continue; if (!m.aggro && m.lv > S.lv + 4) continue; const d = Math.hypot(m.x - S.pos.x, m.z - S.pos.z) - (m.aggro ? 3 : 0); if (d < best) { best = d; target = m; } }
    if (target) { const isLoot = !target.T; const dx = target.x - S.pos.x, dz = target.z - S.pos.z, d = Math.hypot(dx, dz); const want = isLoot ? 0.3 : (Cl.melee ? Cl.range - 0.3 + (target.boss ? 0.8 : 0) : Cl.range - 1);
      const sees = isLoot || Cl.melee || los(S.pos.x, S.pos.z, target.x, target.z, 0.15);
      if (d > want || !sees) { [mx, mz] = navDir(target.x, target.z); mag = 1;
        if (S.nav && S.nav.fail && target !== S.tapMob) { target.noReach = S.time + 6; S.nav = null; } }
      else if (!isLoot) { S.face = Math.atan2(dx, dz); const crowd = mobsNear(target.x, target.z, 2.6).filter(o => o.lv <= S.lv + 4 || o.aggro).length;
        if (S.auto && (crowd >= 2 || target.boss || S.mp > HS.mp * 0.35)) { for (let j = 2; j >= 0; j--) if (castSkill(j, target)) break; } attack(target); } }
  }
  if (mag > 0.12 && S.castT <= 0) { const sp = Math.min(mag, 1) * HS.spd; const nx = S.pos.x + mx / Math.max(mag, 1) * sp * dt, nz = S.pos.z + mz / Math.max(mag, 1) * sp * dt;
    if (!collides(nx, S.pos.z, 0.5)) S.pos.x = nx; if (!collides(S.pos.x, nz, 0.5)) S.pos.z = nz; const r = Math.hypot(S.pos.x, S.pos.z); if (r > 21) { S.pos.x *= 21 / r; S.pos.z *= 21 / r; }
    const want = Math.atan2(mx, mz); let da = want - S.face; da = Math.atan2(Math.sin(da), Math.cos(da)); S.face += da * Math.min(1, dt * 10); }
  const moving = mag > 0.12;
  if (mixer.m) mixer.m.update(dt);
  heroG.position.set(S.pos.x, 0.55 + Math.sin(t * 2.2) * 0.1, S.pos.z);
  heroG.rotation.y = S.face; heroBody.rotation.y = S.spinT > 0 ? (0.5 - S.spinT) * Math.PI * 4 : 0; if (S.spinT > 0) S.spinT -= dt;
  heroBody.rotation.x = lerp(heroBody.rotation.x, moving ? 0.22 : 0.0, dt * 5);
  const flap = Math.sin(t * 2.2 + 0.6);
  wingR.rotation.set(-0.5 + flap * 0.08, -0.12 - flap * 0.22 - (moving ? 0.25 : 0), 0.05 + flap * 0.1);
  wingL.rotation.set(-0.5 + flap * 0.08, 0.12 + flap * 0.22 + (moving ? 0.25 : 0), -0.05 - flap * 0.1);
  if (S.atkT > 0) { S.atkT += dt; slashMat.uniforms.uT.value = Math.min(1, S.atkT / 0.38); if (S.atkT > 0.38) { S.atkT = 0; slash.visible = false; } }
  if (S.skillT > 0) { S.skillT += dt; const k = clamp(S.skillT / 0.6, 0, 1); skillMat.uniforms.uT.value = k; skillRing.rotation.y = -k * 4; skillRing.position.set(S.pos.x, 0.6, S.pos.z); if (k >= 1) { S.skillT = 0; skillRing.visible = false; } }
  S.atkCd = Math.max(0, S.atkCd - dt); S.castT = Math.max(0, S.castT - dt); for (let j = 0; j < 3; j++) S.skCd[j] = Math.max(0, S.skCd[j] - dt);
  const ooc = S.time - S.lastHit > 4; S.hp = Math.min(HS.hp, S.hp + HS.hp * (ooc ? 0.03 : 0.004) * dt); S.mp = Math.min(HS.mp, S.mp + (4 + S.lv * 0.05) * dt);
  aura.position.set(S.pos.x, 0.04, S.pos.z); aura.rotation.y = t * 0.4; heroBlob.position.set(S.pos.x, 0.03, S.pos.z); heroLight.position.set(S.pos.x, 2.2, S.pos.z); groundMat.uniforms.uHero.value.copy(S.pos);
  if (levelFxT > 0) { levelFxT -= dt; auraMat.uniforms.uC.value.setHex(0xffd36a); } else auraMat.uniforms.uC.value.setHex(0x4fc8ff);
  if (rand() < dt * (40 + S.wing * 12)) { const side = rand() < 0.5 ? -1 : 1, s = rand(); const sc = WSCALE[S.wing]; const lx = side * (0.3 + s * 1.6) * sc * 0.5, ly = (1.4 + s * 0.8 - rr(0, 1.2) * s) * 0.5, lz = (-0.5 - s * 0.6) * 0.5; const c = Math.cos(S.face), sn = Math.sin(S.face);
    emit(S.pos.x + lx * c + lz * sn, heroG.position.y + ly, S.pos.z - lx * sn + lz * c, rr(-0.2, 0.2), rr(-0.6, -0.1), rr(-0.2, 0.2), C3(S.wing >= 4 ? (rand() < 0.4 ? '#ffffff' : '#ffd27a') : (rand() < 0.3 ? '#ffffff' : '#7fd8ff')), rr(0.12, 0.25), rr(0.8, 1.6), 0, 0.99); }
  if (S.glowTier > 0 && rand() < dt * 18 * S.glowTier) { const p = heroTip(); emit(p.x + rr(-0.1, 0.1), p.y + rr(-0.3, 0.1), p.z + rr(-0.1, 0.1), rr(-0.2, 0.2), rr(0.1, 0.5), rr(-0.2, 0.2), new THREE.Color(TIER_COL[S.glowTier]), rr(0.08, 0.16), rr(0.5, 1), 0, 0.98); }
}

// ---------- monsters update (template motion) ----------
const TINT = new THREE.Color();
function updateMobs(dt, t) {
  const M = MAPS[S.map];
  if (!S.boss && !S.boss2 && M.boss) { S.bossT -= dt; if (S.bossT <= 0) { S.bossT = M.boss.respawn; const spawnB = b => { const lv = zoneLv(b); const m = addMob(b.k, lv, b.x, b.z, { x: b.x, z: b.z, r: 3 }); fxBeam(b.x, b.z, '#ff6a8a', 2, 2); return m; };
      S.boss = spawnB(M.boss); if (M.boss2) S.boss2 = spawnB(M.boss2); S.shake = 0.3;
      banner(M.boss2 ? '2 BOSS XUẤT HIỆN!' : 'BOSS XUẤT HIỆN: ' + MT[M.boss.k].name.toUpperCase(), 'red'); log(`Boss ${MT[M.boss.k].name} (Lv ${S.boss.lv})${S.boss2 ? ` và ${MT[M.boss2.k].name} (Lv ${S.boss2.lv})` : ''} xuất hiện trước cổng đá phía bắc!`, '#ff9a9a'); } }
  if (!S.mini && M.mini) { S.miniT -= dt; if (S.miniT <= 0) { const zn = pick(M.zones); const [x, z] = spawnPos(zn); S.mini = addMob(M.mini, Math.min(M.hi, zoneLv(zn) + 4), x, z, zn, true);
      banner('TINH ANH XUẤT HIỆN: ' + MT[M.mini].name.toUpperCase(), 'gold'); log(`★ Tinh anh ${MT[M.mini].name} xuất hiện! Phần thưởng bằng 1/3 boss.`, '#ffd27a'); fxBeam(x, z, '#ffd27a', 1.6, 1.4); } }
  for (const m of mobs) {
    const g = m.group;
    if (m.dead) { if (m.dead === 1) { m.deadT = 0; m.dead = 2; m.el.style.display = 'none'; } m.deadT += dt; const k = clamp(1 - m.deadT / 0.4, 0, 1); g.scale.setScalar(m.scale * (0.2 + 0.8 * k)); g.visible = k > 0; m.shadow.visible = k > 0;
      if (!m.boss && !m.mini) { m.respawn -= dt; if (m.respawn <= 0) { const [x, z] = spawnPos(m.zone); m.x = x; m.z = z; setMobLv(m, zoneLv(m.zone)); m.hp = m.maxHp; m.dead = 0; m.aggro = false; m.state = 'idle'; m.wait = 1; m.frzT = m.burnT = m.shockT = m.wetT = m.slowT = 0; g.visible = true; m.shadow.visible = true; m.spawnT = 0.6; burst(x, m.T.y, z, 18, C3('#7fe9ff'), 2, 0.3, 0.8); } }
      continue; }
    for (const k of ['slowT', 'frzT', 'stunT', 'shockT', 'wetT']) if (m[k] > 0) m[k] -= dt;
    if (m.burnT > 0) { m.burnT -= dt; dot(m, m.burnD * dt); if (Math.random() < dt * 10) emit(m.x + rr(-0.2, 0.2), mobH(m), m.z + rr(-0.2, 0.2), 0, 0.8, 0, C3('#ff7a1a'), 0.25, 0.5, 0.3, 0.98); if (m.dead) continue; }
    if (m.shockT > 0 && Math.random() < dt * 6) emit(m.x + rr(-0.3, 0.3), mobH(m) + rr(-0.2, 0.2), m.z + rr(-0.3, 0.3), rr(-0.5, 0.5), rr(-0.5, 0.5), rr(-0.5, 0.5), C3('#d8c0ff'), 0.2, 0.15, 0, 1);
    if (m.wetT > 0 && Math.random() < dt * 3) emit(m.x + rr(-0.2, 0.2), mobH(m), m.z, 0, -1.2, 0, C3('#7fd0ff'), 0.15, 0.5, -2, 1);
    const stopped = m.frzT > 0 || m.stunT > 0; const spd = (m.T.speed || 1.2) * (m.slowT > 0 ? 1 - (m.slow || 0) : 1);
    if (m.tgt && (!m.tgt.alive || m.tgt.dead > 0)) m.tgt = null;
    const dP = Math.hypot(S.pos.x - m.x, S.pos.z - m.z);
    if (!m.aggro && !S.dead && dP < (m.boss ? 7 : 4.5) + Math.min(4, Math.max(0, m.lv - S.lv) * 0.02) && m.lv >= S.lv - 25) { m.aggro = true; m.tgt = null; }
    if (!m.aggro && ents.size && Math.random() < 0.1) for (const e of ents.values()) if (!e.dead && Math.hypot(e.pos.x - m.x, e.pos.z - m.z) < 3.5) { m.aggro = true; m.tgt = e; break; }
    const TP = m.tgt ? m.tgt.pos : S.pos, tGone = m.tgt ? false : !!S.dead;
    const dh = Math.hypot(TP.x - m.x, TP.z - m.z); let moving = false; const reach = m.boss ? 2.2 : 1.0;
    if (m.aggro && !tGone) {
      if (dh > (m.boss ? 18 : 14)) { m.aggro = false; m.tgt = null; }
      else if (dh > reach) { if (!stopped) { m.tx = TP.x; m.tz = TP.z; moving = true; } }
      else if (!stopped) { m.face = Math.atan2(TP.x - m.x, TP.z - m.z); m.atkCd -= dt;
        if (m.atkCd <= 0) { m.atkCd = m.boss ? 1.4 : rr(1.0, 1.5); m.lunge = 0.3; if (m.tgt) { botTakeDmg(m.tgt, m.atk * rr(0.85, 1.15) * lvTakeK(m.lv - m.tgt.b.lv)); } else { const dmg = Math.max(1, Math.round(m.atk * rr(0.85, 1.15) * lvTakeK(m.lv - S.lv) * (1 - HS.def / (HS.def + 10 * m.lv + 100)) * (1 - HS.dr))); S.hp -= dmg; S.lastHit = S.time;
          fxText(S.pos.x, S.pos.z, '-' + dmg, '#ff6b6b', 14, null, HERO_H + 0.9); if (m.boss) { fxRing(m.x, m.z, 0, 3, '#ff6a6a', 0.5, 0, 0.3); S.shake = Math.max(S.shake || 0, 0.2); } if (S.hp <= 0) heroDie(); } } }
    } else if (!stopped) { m.wait -= dt; if (m.wait <= 0) { if (m.state === 'idle') { const a = rr(0, 6.28), d = rr(1, m.zone.r * 0.8); m.tx = m.zone.x + Math.cos(a) * d; m.tz = m.zone.z + Math.sin(a) * d; m.state = 'move'; } else { m.state = 'idle'; m.wait = rr(1.5, 4); } } if (m.state === 'move') moving = true; }
    if (moving && !stopped) { const dx = m.tx - m.x, dz = m.tz - m.z, d = Math.hypot(dx, dz);
      if (d < 0.3) { if (!m.aggro) { m.state = 'idle'; m.wait = rr(1.5, 4); } }
      else { const sp = spd * (m.aggro ? 1.8 : 1); const nx = m.x + dx / d * sp * dt, nz = m.z + dz / d * sp * dt; if (!collides(nx, nz, m.boss ? 0.9 : 0.5)) { m.x = nx; m.z = nz; } else if (!m.aggro) { m.state = 'idle'; m.wait = 0.5; }
        const want = Math.atan2(dx, dz); let da = want - m.face; da = Math.atan2(Math.sin(da), Math.cos(da)); m.face += da * Math.min(1, dt * 4); } }
    let y = m.T.y;
    if (!stopped) {
      if (m.anim) { m.anim(t, moving, m); g.rotation.set(0, m.face, 0); }
      else if (m.kind === 'jelly') { const pulse = Math.sin(t * 2.6 + m.phase); y += Math.sin(t * 1.3 + m.phase) * 0.12 + pulse * 0.04; m.bell.scale.set(1 + pulse * 0.08, 1 - pulse * 0.12, 1 + pulse * 0.08); g.rotation.set(Math.sin(t * 0.9 + m.phase) * 0.12, t * 0.3 + m.phase, Math.cos(t * 0.8 + m.phase) * 0.12); }
      else { y += Math.sin(t * 1.8 + m.phase) * 0.1; m.tail.rotation.y = Math.sin(t * (moving ? 12 : 5) + m.phase) * 0.45; g.rotation.set(0, m.face + Math.sin(t * (moving ? 12 : 5) + m.phase) * 0.06, Math.sin(t * 1.4 + m.phase) * 0.08); }
    }
    TINT.setRGB(0, 0, 0); if (m.frzT > 0) TINT.setRGB(0.25, 0.6, 0.9); else if (m.burnT > 0) TINT.setRGB(0.35, 0.1, 0).multiplyScalar(0.7 + 0.3 * Math.sin(t * 20)); else if (m.shockT > 0) TINT.setRGB(0.35, 0.25, 0.6).multiplyScalar(0.5 + 0.5 * Math.random());
    if (m.kind === 'jelly') { m.jmat.uniforms.uFlash.value = m.flash; m.jmat.uniforms.uTint.value.copy(TINT); } else if (m.baseE) { m.mats[0].emissive.copy(m.baseE).addScalar(m.flash * 1.2).add(TINT); }
    let lz = 0; if (m.lunge > 0) { m.lunge -= dt; lz = Math.sin((m.lunge / 0.3) * Math.PI) * (m.boss ? 0.9 : 0.5); }
    m.flash = Math.max(0, m.flash - dt * 6);
    const sc = m.spawnT > 0 ? (m.spawnT -= dt, 1 - m.spawnT / 0.6) : 1; g.scale.setScalar(m.scale * clamp(sc, 0.05, 1));
    g.position.set(m.x + Math.sin(m.face) * lz, y, m.z + Math.cos(m.face) * lz); m.shadow.position.set(m.x, 0.025, m.z);
    if (m.boss && Math.random() < dt * 8) emit(m.x + rr(-1, 1), y + rr(-0.5, 0.5), m.z + rr(-1, 1), 0, rr(0.3, 0.8), 0, C3(m.T.color), 0.3, 1, 0, 0.99);
  }
  for (let i = mobs.length - 1; i >= 0; i--) { const m = mobs[i]; if ((m.boss || m.mini) && m.dead && m.deadT > 0.5) { removeMob(m); mobs.splice(i, 1); } }
}
