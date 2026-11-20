
// =====================================================================
// GAME — state, hero, monsters, combat, skills, loot
// =====================================================================
let S = null;
function newState(cls) { return { v: 2, cls, lv: 1, exp: 0, gold: 0, mats: { e: 3, c: 0, p: 0, d: 0, t: 0, x: 0, f: 0 }, st: { c: 0, p: 0, d: 0, t: 0, x: 0 }, wing: 0, inv: [], eq: {}, map: 0, auto: true, unlocked: 0,
  hp: 1, mp: 100, pos: new THREE.Vector3(0, 0, 4), face: Math.PI, atkCd: 0, atkT: 0, skCd: [0, 0, 0], castT: 0, dead: 0, lastHit: -99, time: 0, kills: 0 }; }
let uidN = 1; const uid = () => 'i' + Date.now().toString(36) + (uidN++);
function makeGear(slot, r, lv, set) {
  const base = {}; for (const k in SLOTS[slot].base) base[k] = k === 'crit' ? SLOTS[slot].base[k] * (r + 1) : Math.round(SLOTS[slot].base[k] * RMULT[r] * (1 + lv * 0.09));
  const name = set ? SETS[set].names[slot] : pick(PLAIN[slot]);
  return { id: uid(), slot, r, lv, name, base, plus: 0, set: set || null };
}
function gearStats(g) { const o = {}; for (const k in g.base) o[k] = k === 'crit' ? +(g.base[k] + g.plus * 0.5).toFixed(1) : Math.round(g.base[k] * plusMult(g.plus)); return o; }
const gearScore = g => { const s = gearStats(g); return (s.atk || 0) * 3 + (s.def || 0) * 2.5 + (s.hp || 0) * 0.25 + (s.crit || 0) * 4 + (g.set ? 6 : 0); };
const sellPrice = g => Math.round((20 + g.lv * 6) * RMULT[g.r] * (1 + g.plus * 0.3));
function setCounts() { const c = {}; for (const s of SLOT_ORDER) { const g = S.eq[s]; if (g && g.set) c[g.set] = (c[g.set] || 0) + 1; } return c; }
function heroStats() {
  const C = CLS[S.cls]; const st = { atk: (12 + S.lv * 3.2) * C.atk, def: S.lv * 1.2, hp: (380 + S.lv * 55) * C.hp, mp: 100 + S.lv * 3, crit: 0 };
  for (const s of SLOT_ORDER) { const g = S.eq[s]; if (!g) continue; const gs = gearStats(g); for (const k in gs) st[k] += gs[k]; }
  st.def += WDEF[S.wing]; st.hp += WHP[S.wing];
  const b = { atkP: 0, hpP: 0, defP: 0, dmgP: 0, crit: 0 }; const sc = setCounts();
  for (const k in sc) { const T = SETS[k]; if (sc[k] >= 2) for (const x in T.b2) b[x] += T.b2[x]; if (sc[k] >= 4) for (const x in T.b4) b[x] += T.b4[x]; }
  st.atk = Math.round(st.atk * (1 + b.atkP)); st.hp = Math.round(st.hp * (1 + b.hpP)); st.def = Math.round(st.def * (1 + b.defP)); st.crit += b.crit;
  st.dmgMul = WINGM[S.wing] * (1 + b.dmgP); st.sets = sc; return st;
}
function rates() { const C = CLS[S.cls], o = {}; for (const k of SK) { const s = STONES[k]; const base = s.stat === 'crit' ? (C.crit || BASE_RATE.crit) : BASE_RATE[s.stat]; o[s.stat] = Math.min(s.cap, base + s.inc * (S.st[k] || 0)); } o.crit = Math.min(0.85, o.crit + (HS ? HS.crit : 0) / 100); return o; }
function canStone(k) { const s = STONES[k]; const base = s.stat === 'crit' ? (CLS[S.cls].crit || BASE_RATE.crit) : BASE_RATE[s.stat]; return base + s.inc * (S.st[k] || 0) < s.cap - 1e-9; }
function avgMult() { const r = rates(); let m = 1; for (const k of SK) { const s = STONES[k]; m *= 1 + r[s.stat] * (s.mult - 1); } return m; }
let HS = null; // cached hero stats
function recalc(heal) { const old = HS; HS = null; HS = heroStats(); if (heal || !old) { S.hp = HS.hp; S.mp = HS.mp; } else { S.hp = Math.min(HS.hp, S.hp * HS.hp / old.hp); S.mp = Math.min(HS.mp, S.mp); } }
function roll() { const r = rates(); let m = 1, ty = 'n', L = 0; for (const k of SK) { const s = STONES[k]; if (Math.random() < r[s.stat]) { m *= s.mult; ty = k; L++; } } return { m, ty, L }; }
const fmtN = n => { n = Math.max(1, Math.round(n)); return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : String(n); };

// ---------- hero 3D ----------
const heroG = new THREE.Group(); scene.add(heroG);
const heroBody = new THREE.Group(); heroG.add(heroBody);
const heroBlob = blob(1.5); scene.add(heroBlob);
const auraMat = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uC: { value: new THREE.Color(0x4fc8ff) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uTime; uniform vec3 uC; varying vec2 vUv; void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
    float ring = smoothstep(0.06, 0.0, abs(r - 0.82)) + smoothstep(0.03, 0.0, abs(r - 0.62)) * 0.7; float runes = step(0.5, fract(a * 6.0 / 3.14159 + uTime * 0.3)) * smoothstep(0.05, 0.0, abs(r - 0.72)) * 0.8;
    gl_FragColor = vec4(uC * (ring + runes + smoothstep(0.9, 0.0, r) * 0.25) * 0.9, 1.0); }` });
const aura = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2).rotateX(-Math.PI / 2), auraMat); aura.position.y = 0.04; scene.add(aura);
const H3 = { M: null, mixer: null, acts: {}, cur: null, tip: null, wingMat: null, wings: new THREE.Group(), model: null };
let heroGLTF = null;
fetch('assets/hero.json').then(r => r.json()).then(j => { const bin = Uint8Array.from(atob(j.data), c => c.charCodeAt(0)); return new Promise((res, rej) => new GLTFLoader().parse(bin.buffer, '', res, rej)); })
  .then(g => { heroGLTF = g; $('loadTxt').textContent = ''; if (S) buildHero3D(); })
  .catch(e => { console.error(e); $('loadTxt').textContent = 'Không tải được mô hình nhân vật — vẫn chơi được với hình đơn giản.'; });
function heroAnim(name, dur, once = false, speed = 1) { const a = H3.acts[name]; if (!a) return; a.reset(); a.timeScale = speed; a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = once; if (H3.cur && H3.cur !== a) { a.play(); H3.cur.crossFadeTo(a, dur, false); } else a.play(); H3.cur = a; }
function buildHero3D() {
  while (heroBody.children.length) heroBody.remove(heroBody.children[0]);
  const pal = HPAL[S.cls]; const M = heroMaterials(pal); H3.M = M; H3.melee = CLS[S.cls].melee;
  H3.idle = H3.melee ? 'Sword_Idle' : 'Spell_Simple_Idle_Loop'; H3.attack = H3.melee ? 'Sword_Attack' : 'Spell_Simple_Shoot';
  if (heroGLTF) {
    const model = SkeletonUtils.clone(heroGLTF.scene); buildArmor(model, pal, M);
    const box = new THREE.Box3().setFromObject(model); const k = HERO_H / (box.max.y - box.min.y); model.scale.setScalar(k); model.position.y = -box.min.y * k; heroBody.add(model);
    H3.tip = model.userData.tip; H3.mixer = new THREE.AnimationMixer(model); H3.acts = {}; H3.cur = null;
    for (const c of heroGLTF.animations) H3.acts[c.name] = H3.mixer.clipAction(c);
    H3.mixer.addEventListener('finished', () => heroAnim(H3.idle, 0.2)); heroAnim(H3.idle, 0);
  } else { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.6, 4, 10), M.plate); m.position.y = 0.5; heroBody.add(m); const t = new THREE.Object3D(); t.position.y = 1.0; heroBody.add(t); H3.tip = t; H3.mixer = null; }
  H3.wingMat = makeWingMat(S.cls); H3.wings = new THREE.Group(); H3.wings.position.set(0, HERO_H * 0.66, -0.15); heroBody.add(H3.wings);
  H3.wr = new THREE.Mesh(wingGeo, H3.wingMat); H3.wr.position.x = 0.05; H3.wings.add(H3.wr); H3.wl = new THREE.Mesh(wingGeo, H3.wingMat); H3.wl.scale.x = -1; H3.wl.position.x = -0.05; H3.wings.add(H3.wl);
  auraMat.uniforms.uC.value.set(CLS[S.cls].col);
  applyGearVisuals();
}
const WSC = [0, 0.36, 0.42, 0.48, 0.55, 0.62];
function applyGearVisuals() {
  if (!H3.M) return; const w = S.eq.weapon, a = Math.max(S.eq.armor?.plus || 0, S.eq.helm?.plus || 0); const pal = HPAL[S.cls];
  const wt = tier(w?.plus || 0); H3.M.glow.color.set(wt ? TIER_COL[wt] : pal.accent).multiplyScalar(2.4 + wt * 0.6);
  const at = tier(a); H3.M.plate.userData.u.uRim.value.set(at ? TIER_COL[at] : pal.rim); H3.M.plate.userData.u.uRimStr.value = [0.45, 0.9, 1.1, 1.3][at];
  H3.M.dark.userData.u.uRim.value.set(at ? TIER_COL[at] : pal.rim); H3.M.dark.userData.u.uRimStr.value = [0.35, 0.7, 0.9, 1.1][at];
  H3.wings.visible = S.wing > 0; H3.wings.scale.setScalar(WSC[S.wing]); if (H3.wingMat) H3.wingMat.uniforms.uB.value = 0.5 + S.wing * 0.07;
  S.glowTier = Math.max(wt, at);
}
function heroTip() { return H3.tip ? H3.tip.getWorldPosition(new THREE.Vector3()) : V(S.pos.x, S.pos.z, 1); }

// ---------- world per map ----------
const portalMat = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uC: { value: new THREE.Color(0x6fe7ff) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: `uniform float uTime; uniform vec3 uC; varying vec2 vUv; void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
    float sw = sin(a * 5.0 - uTime * 1.6 + r * 18.0) * 0.5 + 0.5; float m = smoothstep(1.0, 0.1, r);
    float ring = smoothstep(0.03, 0.0, abs(r - 0.95)) + smoothstep(0.02, 0.0, abs(r - 0.8)) * 0.6; gl_FragColor = vec4(uC * (m * (0.04 + 0.1 * sw) + ring * 0.9), 1.0); }` });
const colliders = [];
let bossCircle = null;
function collides(x, z, r) { for (const c of colliders) { const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz < (c.r + r) ** 2) return true; } return false; }
function setMap(i) {
  S.map = i; const M = MAPS[i]; R = mulberry32(31 + i * 17);
  while (world.children.length) { const c = world.children.pop(); c.traverse(o => { if (o.geometry && o.geometry !== weedGeo && o.geometry !== blobGeo) o.geometry.dispose(); }); }
  colliders.length = 0;
  groundU.uA.value.setHex(M.ground[0]); groundU.uB.value.setHex(M.ground[1]); groundU.uP.value.setHex(M.ground[2]); groundU.uC.value.setHex(M.ground[3]); groundU.uLava.value = M.theme === 'lava' ? 1 : 0;
  FOG.setHex(M.fog); scene.background.setHex(M.fog).multiplyScalar(0.85); portalMat.uniforms.uC.value.setHex(M.rune);
  const zoneOk = (x, z, m) => { if (Math.hypot(x, z - 8) < 3) return false; for (const zn of M.zones) if (Math.hypot(x - zn.x, z - zn.z) < zn.r * 0.6) return false; if (Math.hypot(x - M.boss.x, z - M.boss.z) < 4.5) return false; return !collides(x, z, m); };
  const addRock = (x, z, r, h, solid = true) => { const mesh = new THREE.Mesh(rockGeo(r, h, rr(0.8, 1.6), M.rock), rockMat); mesh.position.set(x, 0, z); mesh.rotation.y = rr(0, 6.28); world.add(mesh); const b = blob(r * 3.2); b.position.set(x, 0.02, z); world.add(b); if (solid) colliders.push({ x, z, r: r * 0.95 }); };
  for (let a = 0; a < 30; a++) { const ang = a / 30 * Math.PI * 2 + rr(-0.08, 0.08), d = rr(23, 27); addRock(Math.cos(ang) * d, Math.sin(ang) * d, rr(1.6, 2.8), rr(2, 4)); }
  let tr = 0, k = 0; while (k < 14 && tr++ < 800) { const x = rr(-19, 19), z = rr(-19, 19); if (Math.hypot(x, z) > 20 || !zoneOk(x, z, 1)) continue; addRock(x, z, rr(0.4, 1.1), rr(0.5, 1.4)); k++; }
  if (M.theme !== 'lava') {
    const cc = M.theme === 'kelp' ? [[0x6aff8a, 0xd8ffb0], [0x3fd1c8, 0xb8fff4], [0xb0ff5a, 0xf4ffc0]] : [[0xff4f9a, 0xffb0e0], [0x9a5bff, 0xd8b8ff], [0xff7a3d, 0xffd08a], [0x3fd1c8, 0xb8fff4]];
    tr = 0; k = 0; while (k < 18 && tr++ < 900) { const x = rr(-19, 19), z = rr(-19, 19); if (Math.hypot(x, z) > 20 || !zoneOk(x, z, 0.8)) continue; const [c, t] = pick(cc);
      const cg = coralBranches(0.3, 0.045, 3, c, t); cg.position.set(x, 0, z); cg.scale.setScalar(rr(1, 1.7)); cg.rotation.y = rr(0, 6); world.add(cg);
      if (R() < 0.7) { const sp = tubeSponge(pick([0xffb43d, 0xff6a5a, 0xc8ff6a]), 0.55); sp.position.set(x + rr(-0.7, 0.7), 0, z + rr(-0.7, 0.7)); world.add(sp); }
      if (R() < 0.7) { const f = seaFan(pick([0xff5fa8, 0xb07bff, 0xffa34d]), 0.75); f.position.set(x + rr(-0.8, 0.8), 0, z + rr(-0.8, 0.8)); f.rotation.y = rr(0, 6); world.add(f); }
      const b = blob(1.6); b.position.set(x, 0.02, z); world.add(b); colliders.push({ x, z, r: 0.45 }); k++; }
    const wl = []; const nw = M.theme === 'kelp' ? 45 : 18; tr = 0; while (wl.length < nw * 4 && tr++ < 3000) { const x = rr(-20, 20), z = rr(-20, 20); if (Math.hypot(x, z) > 21 || !zoneOk(x, z, 0.4)) continue;
      for (let j = 0, n = ri(3, 6); j < n; j++) wl.push([x + rr(-0.6, 0.6), z + rr(-0.6, 0.6), M.theme === 'kelp' ? rr(1.6, 3.6) : rr(0.9, 2.2)]); }
    weeds(wl, M.weed);
  } else {
    tr = 0; k = 0; while (k < 9 && tr++ < 900) { const x = rr(-19, 19), z = rr(-19, 19); if (Math.hypot(x, z) > 20 || !zoneOk(x, z, 1.4)) continue; const s = rr(1.2, 2.2);
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.6, s).rotateX(-Math.PI / 2), lavaPoolMat); pool.position.set(x, 0.025, z); pool.rotation.y = rr(0, 3); world.add(pool);
      const l = new THREE.PointLight(0xff5a1a, 4, 5, 1.8); l.position.set(x, 0.6, z); world.add(l); colliders.push({ x, z, r: s * 0.5 }); k++; }
    tr = 0; k = 0; while (k < 16 && tr++ < 900) { const x = rr(-19, 19), z = rr(-19, 19); if (Math.hypot(x, z) > 20 || !zoneOk(x, z, 0.6)) continue; const g = new THREE.Group();
      for (let j = 0; j < ri(2, 4); j++) { const h = rr(0.6, 1.6); const m = new THREE.Mesh(new THREE.ConeGeometry(rr(0.1, 0.22), h, 5), stylized({ color: 0x15101a, metalness: 0.6, roughness: 0.2, flatShading: true }, 0xff6a2a, 0.8, 2)); m.position.set(rr(-0.3, 0.3), h / 2, rr(-0.3, 0.3)); m.rotation.set(rr(-0.3, 0.3), 0, rr(-0.3, 0.3)); g.add(m); }
      g.position.set(x, 0, z); world.add(g); colliders.push({ x, z, r: 0.4 }); k++; }
  }
  // boss arena: rune circle and ruined pillars
  { const g = new THREE.Group(); g.position.set(M.boss.x, 0, M.boss.z); world.add(g);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(8, 8).rotateX(-Math.PI / 2), portalMat); c.position.y = 0.05; g.add(c); bossCircle = c;
    const stone = stylized({ color: M.theme === 'lava' ? 0x4a3a38 : 0x5f8f99, roughness: 0.75, flatShading: true }, M.rune, 0.45, 2.4);
    for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2 + 0.3; const h = rr(1.4, 3.2); const p = new THREE.Group(); p.position.set(Math.cos(a) * 4.6, 0, Math.sin(a) * 4.6);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, h, 8), stone); sh.position.y = h / 2; p.add(sh);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 6, 20), glowMat(M.rune, 2.4)); band.rotation.x = Math.PI / 2; band.position.y = h * 0.6; p.add(band); p.rotation.z = rr(-0.08, 0.08); g.add(p);
      colliders.push({ x: M.boss.x + Math.cos(a) * 4.6, z: M.boss.z + Math.sin(a) * 4.6, r: 0.45 }); } }
  // reset monsters
  for (const m of mobs) removeMob(m); mobs.length = 0; for (const l of loots) removeLoot(l); loots.length = 0;
  for (const zn of M.zones) for (let n = 0; n < zn.n; n++) { const [x, z] = spawnPos(zn); addMob(zn.k, ri(zn.lv[0], zn.lv[1]), x, z, zn); }
  S.bossT = Math.min(S.bossT ?? 60, 60); S.boss = null;
  S.pos.set(0, 0, 8); camera.position.set(0, 12, 18);
}
function spawnPos(z) { for (let k = 0; k < 20; k++) { const a = rr(0, 6.28), d = Math.sqrt(R()) * z.r; const x = z.x + Math.cos(a) * d, zz = z.z + Math.sin(a) * d; if (!collides(x, zz, 0.6)) return [x, zz]; } return [z.x, z.z]; }

// ---------- monsters ----------
function mkSpikefish(tint) {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const back = C(0x2a1a14), belly = C(tint || 0xff8a3a), stripe = C(0xffd27a);
  const m = mobMat({ vertexColors: true, roughness: 0.45, metalness: 0.2 }, 0xffb36b);
  const bg = geo('spikeBody' + (tint || ''), () => vcolSphere(22, (x, y, z) => { const c = belly.clone().lerp(back, clamp(y * 1.6 + 0.45, 0, 1)); if (Math.sin(z * 18) > 0.75 && y > -0.1) c.lerp(stripe, 0.5); return c; }));
  const b = new THREE.Mesh(bg, m); b.scale.set(0.2, 0.23, 0.44); body.add(b);
  const fin = mobMat({ color: tint || 0xffa64d, side: THREE.DoubleSide, emissive: tint || 0xff6a1a, emissiveIntensity: 0.4 }, 0xffe0a0);
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(geo('spike', () => new THREE.ConeGeometry(0.025, 0.2, 5)), fin); const t = i / 6; s.position.set(0, 0.2 + Math.sin(t * Math.PI) * 0.03, 0.2 - t * 0.38); s.rotation.x = -0.5; s.scale.y = 0.8 + Math.sin(t * Math.PI) * 0.6; body.add(s); }
  const tail = new THREE.Group(); tail.position.z = -0.42; body.add(tail); tail.add(new THREE.Mesh(geo('fin1', () => finShape(0.2, 0.32).rotateX(-Math.PI / 2).rotateZ(Math.PI / 2)), fin));
  const eye = glowMat(0xfff07a, 3); for (const sd of [-1, 1]) { const e = new THREE.Mesh(geo('eye', () => new THREE.SphereGeometry(0.035, 8, 6)), eye); e.position.set(sd * 0.1, 0.06, 0.32); body.add(e); }
  return { g, body, mats: [m, fin], kind: 'fish', h: 0.45, top: 0.85, anim(e, t) { tail.rotation.y = Math.sin(t * (e.moving ? 12 : 5) + e.seed) * 0.45; body.rotation.y = Math.sin(t * (e.moving ? 12 : 5) + e.seed) * 0.06; } };
}
function buildModel(T) {
  switch (T.model) {
    case 'jelly': return mkJelly(0.38, false, 0.78);
    case 'spikefish': return mkSpikefish(T.tint);
    case 'angler': return mkAngler();
    case 'eel': return mkEel();
    case 'crab': { const c = mkCrab(); if (T.tint) c.mats.forEach(m => { m.userData.base = T.tint; }); return c; }
    case 'shark': { const s = mkShark(); s.body.scale.setScalar(T.scale || 1); s.h *= T.scale || 1; s.top *= T.scale || 1; s.kind = 'fish'; return s; }
    case 'jqueen': return mkJelly(1.1, true, 0.82);
    case 'serpent': { const s = mkSerpent(); s.body.scale.setScalar(1.5); s.top = 2; return s; }
    case 'turtle': { const s = mkTurtle(); s.body.scale.setScalar(1.25); s.top = 2.2; return s; }
  }
}
const mobs = [];
function addMob(k, lv, x, z, zone) {
  const T = MT[k]; const boss = !!T.boss;
  const v = buildModel(T); scene.add(v.g); const sh = blob(boss ? 3.4 : v.kind === 'jelly' ? 1.0 : 1.2); scene.add(sh);
  const el = document.createElement('div'); el.className = 'lbl'; el.innerHTML = `<div class="nm" style="color:${boss ? '#ff9a9a' : '#ffd0b0'}">${T.name} · Lv ${lv}</div><div class="hp${boss ? ' b' : ''}"><i></i></div>`; el.style.display = 'none'; labelsEl.appendChild(el);
  const m = { k, T, lv, boss, v, sh, el, bar: el.querySelector('.hp i'), hpEl: el.querySelector('.hp'), x, z, home: { x, z }, zone, maxHp: mobHp(T.hp, lv) * (boss ? 30 : 1), atk: mobAtk(T.atk, lv) * (boss ? 2.4 : 1), hp: 0, face: rr(0, 6.28), state: 'idle', wait: rr(0, 3), aggro: false, atkCd: 0, dead: 0, seed: rr(0, 10), spawnT: 0.6, moving: false };
  m.hp = m.maxHp; mobs.push(m); return m;
}
function removeMob(m) { scene.remove(m.v.g); scene.remove(m.sh); m.el.remove(); }
const TINT = new THREE.Color();
function vuln(m, el) { let k = 1; if (m.frzT > 0) k *= 1.3; if (m.shockT > 0) k *= 1.2; if (m.burnT > 0) k *= 1.15; if (m.wetT > 0) k *= (el === 'ice' || el === 'thunder') ? 1.35 : 1.1; return k; }
function hitMob(m, mult, el, show = true) {
  if (m.dead) return; const r = roll(); const dmg = HS.atk * mult * HS.dmgMul * rr(0.9, 1.1) * vuln(m, el) * r.m;
  m.hp -= dmg; m.flash = 1; m.aggro = true;
  if (show) { const sz = { n: 14, c: 17, p: 18, d: 19, t: 21, x: 25 }[r.ty] + Math.max(0, r.L - 1) * 3; const h = m.v.top + 0.2;
    addText(m.x + rr(-0.3, 0.3), m.z, fmtN(dmg), DMGC[r.ty], sz, r.ty !== 'n' ? { life: 1.05 + r.L * 0.15, glow: r.ty === 'x' || r.L >= 3 } : null, h);
    if (r.L >= 2) addText(m.x, m.z, (r.L >= 3 ? 'SIÊU ĐÒN ' : '') + '×' + (Math.round(r.m * 10) / 10) + (r.L >= 3 ? ' · ' + r.L + ' TẦNG' : ''), DMGC[r.ty], r.L >= 3 ? 12 : 11, { life: 1.3, glow: r.L >= 3 }, h + 0.45);
    if (r.L >= 4) { burst(m.x, m.z, DMGC[r.ty], 16, 3, 0.05, mobH(m)); ring(m.x, m.z, 0.1, 1.6, DMGC[r.ty], 0.4); } }
  if (m.hp <= 0) killMob(m);
}
function dot(m, dmg) { if (m.dead) return; m.hp -= dmg; if (m.hp <= 0) killMob(m); }
function burn(m, mult) { m.burnT = 2.5; m.burnD = Math.max(m.burnD || 0, HS.atk * mult * HS.dmgMul * 0.15); }
function freeze(m, t, ch) { if (ch !== undefined && Math.random() >= ch * (m.wetT > 0 ? 2 : 1)) return; const d = m.boss ? t * 0.35 : t; if (d > (m.frzT || 0)) m.frzT = d; }
function shock(m, t) { m.shockT = Math.max(m.shockT || 0, t); m.stunT = Math.max(m.stunT || 0, m.boss ? 0.1 : 0.35); }
function knock(m, d) { const dx = m.x - S.pos.x, dz = m.z - S.pos.z, l = Math.hypot(dx, dz) || 1; const k = m.boss ? d * 0.2 : d; const nx = m.x + dx / l * k, nz = m.z + dz / l * k; if (!collides(nx, nz, 0.4) && Math.hypot(nx, nz) < 21) { m.x = nx; m.z = nz; } }
const mobH = m => m.v.kind === 'crab' ? 0.3 : m.v.h * (m.v.kind === 'jelly' ? 0.6 : 0.5) + (m.boss ? 0.6 : 0.1);
function killMob(m) {
  m.dead = 1; m.hp = 0; m.respawn = m.boss ? 0 : 7; S.kills++;
  burst(m.x, m.z, m.boss ? '#ffd27a' : '#b98cff', m.boss ? 60 : 30, m.boss ? 6 : 4, 0.08, mobH(m)); burst(m.x, m.z, '#ffffff', 14, 3, 0.05, mobH(m));
  if (m.boss) { S.shake = 0.5; banner('ĐÃ HẠ ' + m.T.name.toUpperCase() + '!', 'gold'); log('Hạ boss ' + m.T.name + '! Phần thưởng lớn rơi ra.', '#ffd27a'); S.boss = null; S.bossT = MAPS[S.map].boss.respawn; }
  let xp = mobExp(m.T.exp, m.lv) * (m.boss ? 30 : 1); if (!m.boss && m.lv < S.lv - 8) xp *= 0.3; gainExp(Math.round(xp));
  // loot
  const lvl = m.lv, set = MAPS[S.map].set;
  const gold = Math.round(lvl * rr(6, 14) * (m.boss ? 25 : 1)); if (Math.random() < (m.boss ? 1 : 0.5)) { S.gold += gold; addText(m.x, m.z, '+' + gold + ' vàng', '#ffd36a', 12, { life: 1.1 }, mobH(m) + 0.9); }
  const mats = {}; for (const k of MKEYS) if (Math.random() < DROP[k]) mats[k] = 1;
  if (m.boss) { Object.assign(mats, { e: 8, c: 4, p: 3, d: 2, f: 6 }); if (Math.random() < 0.4) mats.t = 1; if (Math.random() < 0.1) mats.x = 1; }
  for (const k in mats) { S.mats[k] += mats[k]; matFx(m, k, mats[k]); }
  const ng = m.boss ? 3 : (Math.random() < 0.12 ? 1 : 0);
  for (let n = 0; n < ng; n++) { const q = Math.random(); let r = q < 0.03 ? 3 : q < 0.15 ? 2 : q < 0.45 ? 1 : 0; if (m.boss) r = Math.max(1, r + (Math.random() < 0.4 ? 1 : 0)); r = Math.min(3, r);
    const slot = pick(SLOT_ORDER); const g = makeGear(slot, r, lvl, r >= 1 && Math.random() < (m.boss ? 0.75 : 0.45) ? set : null); if (r >= 1 && Math.random() < 0.4) g.plus = ri(1, r + 1); dropLoot(m.x, m.z, g); }
  updateHud();
}
function matFx(m, k, n) { const p = V(m.x, m.z, mobH(m)); for (let i = 0; i < 6; i++) emit(p.x, p.y, p.z, rr(-1, 1), rr(1.5, 3), rr(-1, 1), MATS[k].col, 0.1, 0.8, -4, 0.97);
  if (k !== 'e' || m.boss) log(`Nhận ${MATS[k].name}${n > 1 ? ' ×' + n : ''}`, MATS[k].col); pulseHud(); }
function gainExp(n) {
  if (S.lv >= MAXLV) return; S.exp += n;
  while (S.lv < MAXLV && S.exp >= expNeed(S.lv)) { S.exp -= expNeed(S.lv); S.lv++; recalc(true); levelFx();
    const sk = SKILLS[S.cls].find(s => s.lv === S.lv); if (sk) { banner('MỞ KỸ NĂNG: ' + sk.name.toUpperCase(), 'gold'); log('Mở khóa kỹ năng ' + sk.name + '!', ELC[sk.el]); }
    const nm = MAPS.findIndex(mp => mp.req === S.lv); if (nm > 0) log('Đủ cấp vào bản đồ ' + MAPS[nm].name + ' — mở bảng Bản đồ để dịch chuyển.', '#9fe8ff'); }
  updateHud();
}
let levelGlow = 0;
function levelFx() { levelGlow = 1.6; addText(S.pos.x, S.pos.z, 'LÊN CẤP ' + S.lv + '!', '#ffd86a', 26, { life: 1.6, big: true }, 2.4); log('Đạt cấp ' + S.lv + '. Sức mạnh tăng lên.', '#9fe8ff');
  pillar(S.pos.x, S.pos.z, '#ffe08a', 1.2, 0.8); for (let i = 0; i < 50; i++) { const a = i / 50 * 6.28; emit(S.pos.x + Math.cos(a) * 0.9, 0.2, S.pos.z + Math.sin(a) * 0.9, Math.cos(a) * 0.5, rr(2.5, 5), Math.sin(a) * 0.5, '#ffe08a', 0.1, 1.2, -1, 0.97); } }

// ---------- loot on the ground (gear) ----------
const loots = [];
const beamGeo = new THREE.CylinderGeometry(0.1, 0.24, 2.6, 12, 1, true); beamGeo.translate(0, 1.3, 0);
function dropLoot(x, z, gear) {
  const R_ = RARITY[gear.r]; const col = new THREE.Color(gear.set ? SETS[gear.set].col : R_.css); const g = new THREE.Group();
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshStandardMaterial({ color: col, metalness: 0.8, roughness: 0.2, emissive: col, emissiveIntensity: 1.4 })); gem.position.y = 0.4; g.add(gem);
  if (gear.r >= 1) g.add(new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({ ...pillarShader, uniforms: { uC: { value: col.clone().multiplyScalar(1.2) }, uA: { value: 0.7 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })));
  const ox = rr(-0.8, 0.8), oz = rr(-0.8, 0.8); g.position.set(x + ox, 0, z + oz); scene.add(g);
  const el = document.createElement('div'); el.className = 'lbl loot'; el.style.color = gear.set ? SETS[gear.set].col : R_.css; el.textContent = gear.name + (gear.plus ? ' +' + gear.plus : ''); labelsEl.appendChild(el);
  loots.push({ g, gem, x: x + ox, z: z + oz, gear, el, t: 0 });
}
function removeLoot(l) { scene.remove(l.g); l.el.remove(); }

// ---------- combat ----------
function nearestMob(maxD, x = S.pos.x, z = S.pos.z) { let b = null, bd = maxD; for (const m of mobs) { if (m.dead) continue; const d = Math.hypot(m.x - x, m.z - z); if (d < bd) { bd = d; b = m; } } return b; }
function mobsNear(x, z, r) { return mobs.filter(m => !m.dead && Math.hypot(m.x - x, m.z - z) <= r); }
function bestCluster(range, R_) { let b = null, bc = -1; for (const m of mobsNear(S.pos.x, S.pos.z, range)) { let c = 0; for (const o of mobs) if (!o.dead && Math.hypot(o.x - m.x, o.z - m.z) <= R_) c++; if (m.boss) c += 2; if (c > bc) { bc = c; b = m; } } return b; }
const projs = [];
function attack(pref) {
  if (S.dead || S.atkCd > 0 || S.castT > 0) return; const C = CLS[S.cls];
  const tg = pref && !pref.dead && Math.hypot(pref.x - S.pos.x, pref.z - S.pos.z) <= C.range + 0.6 ? pref : nearestMob(C.melee ? C.range + 0.6 : C.range); if (!C.melee && !tg) return;
  S.atkCd = C.rate; S.atkT = 0.001; heroAnim(H3.attack, 0.06, true, C.melee ? 2.2 : 1.8);
  if (tg) S.face = Math.atan2(tg.x - S.pos.x, tg.z - S.pos.z);
  if (C.melee) {
    slash.visible = true; slashMat.uniforms.uT.value = 0; slashMat.uniforms.uC.value.set(C.col); slash.position.set(S.pos.x, 0.6, S.pos.z); slash.rotation.y = S.face - Math.PI / 2;
    setTimeout(() => { if (!S || S.dead) return; for (const m of mobs) { if (m.dead) continue; const dx = m.x - S.pos.x, dz = m.z - S.pos.z, d = Math.hypot(dx, dz); if (d > C.range + (m.boss ? 1 : 0)) continue;
        let da = Math.atan2(dx, dz) - S.face; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 1.25 || d < 0.7) {
          hitMob(m, 1, C.el); if (S.cls === 'fire') burn(m, 0.4); if (S.cls === 'thunder' && Math.random() < 0.2) chain(m); } } }, 110);
  } else { const from = heroTip(); const p = { type: C.proj, m: PROJM[C.proj](), from, pos: from.clone(), tgt: tg, speed: C.ps, mult: 1, el: C.el }; p.m.position.copy(from); scene.add(p.m); projs.push(p); }
}
function chain(m0) { const list = [m0]; for (let j = 0; j < 2; j++) { const l = list[list.length - 1]; let b = null, bd = 3; for (const m of mobs) { if (m.dead || list.includes(m)) continue; const d = Math.hypot(m.x - l.x, m.z - l.z); if (d < bd) { bd = d; b = m; } } if (!b) break; list.push(b); }
  const pts = list.map(m => V(m.x, m.z, mobH(m))); pts.unshift(heroTip()); bolt(pts, '#b98cff', 0.22); list.slice(1).forEach(m => { hitMob(m, 0.6, 'thunder'); if (Math.random() < 0.3) shock(m, 1.5); }); }
const PROJM = {
  flame: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), glowMat(0xff8a2a, 3))); return g; },
  shard: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.08).scale(0.6, 0.6, 2.6), glowMat(0xbff8ff, 2.6))); return g; },
  arrow: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4).rotateX(Math.PI / 2), glowMat(0xb0ffb0, 2))); const t = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4).rotateX(Math.PI / 2), glowMat(0x7dff9a, 3)); t.position.z = 0.28; g.add(t); return g; },
  holy: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), glowMat(0xfff0b0, 3))); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.014, 6, 20), glowMat(0xffd85a, 2.6))); return g; }
};
function projHit(p, m) {
  const C = CLS[S.cls];
  if (p.type === 'holy') { for (const o of mobsNear(m.x, m.z, C.splash)) hitMob(o, p.mult, 'holy'); ring(m.x, m.z, 0.1, C.splash, '#ffd85a', 0.35); burst(m.x, m.z, '#ffe680', 14, 3, 0.07, mobH(m)); return; }
  hitMob(m, p.mult, p.el);
  if (p.type === 'shard') { m.slowT = 1.6; m.slow = m.boss ? 0.2 : 0.4; if (Math.random() < 0.1) freeze(m, 1.2); burst(m.x, m.z, '#bff6ff', 8, 2, 0.05, mobH(m)); }
  else if (p.type === 'arrow') { if (Math.random() < 0.25) m.wetT = 3; burst(m.x, m.z, '#9dd8ff', 5, 2, 0.05, mobH(m)); }
}
function updateProjs(dt) {
  for (const p of projs) {
    if (p.dir) { // straight-flying (fans)
      p.pos.addScaledVector(p.dir, p.speed * dt); p.trav += p.speed * dt;
      for (const m of mobs) { if (m.dead) continue; if (Math.hypot(m.x - p.pos.x, m.z - p.pos.z) < (m.boss ? 1.2 : 0.55)) { projHit(p, m); p.done = true; break; } }
      if (p.trav > p.max) p.done = true;
    } else { const tgt = p.tgt && !p.tgt.dead ? V(p.tgt.x, p.tgt.z, mobH(p.tgt)) : null; if (!tgt) { p.done = true; continue; }
      const d = tgt.clone().sub(p.pos); const step = p.speed * dt; if (d.length() <= step + 0.1) { projHit(p, p.tgt); p.done = true; } else p.pos.addScaledVector(d.normalize(), step); }
    if (!p.done) { const ahead = p.pos.clone().add(p.dir || V(0, 0, 0)); p.m.lookAt(p.dir ? ahead : (p.tgt && !p.tgt.dead ? V(p.tgt.x, p.tgt.z, mobH(p.tgt)) : ahead)); p.m.position.copy(p.pos); if (p.type === 'holy') p.m.rotation.z += dt * 6;
      if (Math.random() < 0.8) emit(p.pos.x, p.pos.y, p.pos.z, rr(-0.2, 0.2), rr(-0.2, 0.2), rr(-0.2, 0.2), CLS[S.cls].col, p.type === 'holy' ? 0.14 : 0.07, 0.25, 0, 0.95); }
    if (p.done) scene.remove(p.m);
  }
  for (let i = projs.length - 1; i >= 0; i--) if (projs[i].done) projs.splice(i, 1);
}
// slash arc (melee)
const slashMat = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uC: { value: new THREE.Color(0x8ff0ff) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uT; uniform vec3 uC; varying vec2 vUv; void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x) / 3.14159;
    float head = mix(-0.9, 0.9, uT); float trail = smoothstep(head - 0.9, head, a) * step(a, head); float band = smoothstep(0.62, 0.8, r) * smoothstep(1.0, 0.86, r);
    float core = smoothstep(0.86, 0.9, r) * smoothstep(0.96, 0.9, r); float fade = 1.0 - smoothstep(0.65, 1.0, uT);
    gl_FragColor = vec4((uC * band * 1.6 + vec3(1.0) * core * 2.5) * trail * fade, 1.0); }` });
const slash = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6).rotateX(-Math.PI / 2), slashMat); slash.visible = false; scene.add(slash);

// ---------- skills ----------
const sks = [];
function skillReady(j) { const sk = SKILLS[S.cls][j]; return S.lv >= sk.lv && S.skCd[j] <= 0 && S.mp >= sk.mp && !S.dead; }
function castSkill(j, pref) {
  if (!skillReady(j)) return false; const sk = SKILLS[S.cls][j]; const C = CLS[S.cls]; const rng = Math.max(C.range, 7);
  const tg = pref && !pref.dead ? pref : (bestCluster(rng, 2.4) || nearestMob(rng)); const self = ['spinbolt', 'firespin', 'tide', 'blessing'].includes(sk.id);
  if (!tg && !(self && sk.id === 'blessing')) return false;
  if (self && sk.id !== 'blessing' && !mobsNear(S.pos.x, S.pos.z, 3.4).length) return false;
  S.mp -= sk.mp; S.skCd[j] = sk.cd; S.castT = 0.35; heroAnim(H3.attack, 0.06, true, 1.6);
  if (tg) S.face = Math.atan2(tg.x - S.pos.x, tg.z - S.pos.z);
  addText(S.pos.x, S.pos.z, sk.name + '!', ELC[sk.el], 14, { life: 1.4, glow: true }, 2.4); ring(S.pos.x, S.pos.z, 0.1, 1.6, ELC[sk.el], 0.5);
  const D = sk.mult; const px = S.pos.x, pz = S.pos.z;
  switch (sk.id) {
    case 'bolts': { const list = []; for (let n = 0; n < 5; n++) { const pool = mobsNear(tg.x, tg.z, 2.2); const m = pool.length ? pick(pool) : tg; list.push({ x: m.x + rr(-0.3, 0.3), z: m.z + rr(-0.3, 0.3) }); } sks.push({ type: 'boltseq', list, t: 0, n: 0, D }); break; }
    case 'storm': sks.push({ type: 'storm', x: tg.x, z: tg.z, R: 2.6, t: 0, dur: 4, tick: 0.2, D }); break;
    case 'spinbolt': { for (const m of mobsNear(px, pz, 3.4)) { hitMob(m, D, 'thunder'); shock(m, 2); bolt([V(px, pz, 1.2), V(m.x, m.z, mobH(m))], '#c8a8ff', 0.3); } ring(px, pz, 0.2, 3.4, '#c8a8ff', 0.5); S.spinT = 0.5; break; }
    case 'flamewave': case 'pierce': { const dir = new THREE.Vector3(tg.x - px, 0, tg.z - pz).normalize(); sks.push({ type: 'line', kind: sk.id === 'flamewave' ? 'fire' : 'water', x: px, z: pz, dir, sp: 13, trav: 0, max: 10, W: sk.id === 'flamewave' ? 1.1 : 0.9, hit: new Set(), D }); break; }
    case 'meteor': sks.push({ type: 'meteor', x: tg.x, z: tg.z, t: 0, dur: 0.55, D }); break;
    case 'firespin': { for (const m of mobsNear(px, pz, 3.2)) { hitMob(m, D, 'fire'); burn(m, 0.5); } ring(px, pz, 0.2, 3.2, '#ff7a2a', 0.5); burst(px, pz, '#ff7a1a', 40, 6, 0.08, 0.6); S.spinT = 0.5; break; }
    case 'blizzard': sks.push({ type: 'blizzard', x: tg.x, z: tg.z, R: 2.6, t: 0, dur: 3.2, tick: 0.1, D }); break;
    case 'icepillars': { const list = mobsNear(tg.x, tg.z, 3.6).sort((a, b) => Math.hypot(a.x - tg.x, a.z - tg.z) - Math.hypot(b.x - tg.x, b.z - tg.z)).slice(0, 8); list.forEach((m, n) => sks.push({ type: 'pillar', m, x: m.x, z: m.z, t: -n * 0.07, dur: 1.1, D })); break; }
    case 'icefan': case 'arrowfan': { const n = sk.id === 'icefan' ? 7 : 5, spread = sk.id === 'icefan' ? 0.5 : 0.35; const base = Math.atan2(tg.x - px, tg.z - pz); const from = heroTip();
      for (let k = 0; k < n; k++) { const a = base + (k / (n - 1) - 0.5) * 2 * spread; const type = sk.id === 'icefan' ? 'shard' : 'arrow'; const p = { type, m: PROJM[type](), pos: from.clone(), dir: new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), speed: 14, trav: 0, max: 9, mult: D, el: sk.el }; p.m.position.copy(from); scene.add(p.m); projs.push(p); } break; }
    case 'arrowrain': { const arr = []; for (let n = 0; n < 14; n++) { const a = rr(0, 6.28), r = Math.sqrt(Math.random()) * 2.5; arr.push({ x: tg.x + Math.cos(a) * r, z: tg.z + Math.sin(a) * r, t: Math.random() * 0.75, hit: false }); } sks.push({ type: 'arrowrain', arr, t: 0, dur: 1.1, D }); break; }
    case 'tide': sks.push({ type: 'tide', x: px, z: pz, R: 4, t: 0, dur: 0.75, hit: new Set(), D }); break;
    case 'judg': { let c = tg; for (const m of mobsNear(px, pz, rng)) if (m.hp > c.hp) c = m; sks.push({ type: 'judg', m: c, x: c.x, z: c.z, t: 0, dur: 1.2, tick: 0, D }); break; }
    case 'blessing': { const heal = Math.round(HS.hp * 0.35); S.hp = Math.min(HS.hp, S.hp + heal); addText(px, pz, '+' + heal, '#7dff9a', 18, { life: 1.3 }, 2); pillar(px, pz, '#ffe08a', 1.2, 1);
      for (const m of mobsNear(px, pz, 3)) hitMob(m, D, 'holy'); ring(px, pz, 0.2, 3, '#ffd85a', 0.6); burst(px, pz, '#fff0b0', 40, 5, 0.08, 1); break; }
  }
  return true;
}
function updSkills(dt) {
  for (const s of sks) { s.t += dt;
    switch (s.type) {
      case 'boltseq': while (s.n < s.list.length && s.t >= s.n * 0.1) { const q = s.list[s.n++]; bolt([V(q.x, q.z, 6), V(q.x, q.z, 0.4)], '#c8a8ff', 0.3); burst(q.x, q.z, '#e0d0ff', 10, 3, 0.06, 0.4); ring(q.x, q.z, 0.1, 1.1, '#c8a8ff', 0.35); for (const m of mobsNear(q.x, q.z, 0.9)) { shock(m, 2); hitMob(m, s.D, 'thunder'); } } if (s.n >= s.list.length && s.t > 0.6) s.done = true; break;
      case 'storm': if (!s.v) { s.v = new THREE.Group(); s.v.add(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8).scale(s.R * 1.2, 0.3, s.R), new THREE.MeshBasicMaterial({ color: 0x241640, transparent: true, opacity: 0.5, depthWrite: false }))); s.v.add(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8).scale(s.R * 1.3, 0.35, s.R * 1.1), addMat(0x8a5aff, 0.5, 0.5))); s.v.position.set(s.x, 3.4, s.z); scene.add(s.v); }
        s.v.children[1].material.opacity = 0.3 + 0.3 * Math.random(); if (Math.random() < dt * 30) { const a = rr(0, 6.28), r = Math.sqrt(Math.random()) * s.R; emit(s.x + Math.cos(a) * r, 3.1, s.z + Math.sin(a) * r, 0, -6, 0, '#7fc8ff', 0.05, 0.5, 0, 1); }
        s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.5; const pool = mobsNear(s.x, s.z, s.R); pool.forEach(m => m.wetT = 3); for (let n = 0; n < 2 && pool.length; n++) { const m = pick(pool); bolt([V(s.x, s.z, 3.2), V(m.x, m.z, mobH(m))], '#c8a8ff', 0.22); shock(m, 1.5); hitMob(m, s.D, 'thunder'); } }
        if (s.t >= s.dur + 0.3) s.done = true; break;
      case 'line': { if (!s.v) { s.v = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10).scale(s.W, 0.3, s.W * 1.6), addMat(s.kind === 'fire' ? 0xff7a1a : 0x4ab8ff, 2, 0.9)); scene.add(s.v); }
        const step = s.sp * dt; s.x += s.dir.x * step; s.z += s.dir.z * step; s.trav += step; s.v.position.set(s.x, 0.5, s.z); s.v.rotation.y = Math.atan2(s.dir.x, s.dir.z);
        for (let n = 0; n < 3; n++) emit(s.x + rr(-0.4, 0.4), rr(0.2, 0.8), s.z + rr(-0.4, 0.4), -s.dir.x * 1.2, 0.5, -s.dir.z * 1.2, s.kind === 'fire' ? pick(['#ff7a1a', '#ffd060']) : pick(['#4ab8ff', '#dff4ff']), 0.16, 0.45, 0, 0.95);
        for (const m of mobs) { if (m.dead || s.hit.has(m)) continue; if (Math.hypot(m.x - s.x, m.z - s.z) <= s.W + (m.boss ? 0.8 : 0)) { s.hit.add(m); if (s.kind === 'fire') burn(m, 0.5); else { m.wetT = 3; knock(m, 1.5); } hitMob(m, s.D, s.kind); } }
        if (s.trav >= s.max) s.done = true; break; }
      case 'meteor': if (!s.v) { s.v = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4), stylized({ color: 0x3a1a10, emissive: 0xff4a0a, emissiveIntensity: 1.5, flatShading: true }, 0xffa040, 1)); scene.add(s.v); }
        { const k = Math.min(1, s.t / s.dur); s.v.position.set(s.x + 3 * (1 - k), 0.3 + 7 * (1 - k), s.z - 1.5 * (1 - k)); s.v.rotation.x += dt * 8; for (let n = 0; n < 3; n++) emit(s.v.position.x, s.v.position.y, s.v.position.z, 0.8, 1, 0, pick(['#ff7a1a', '#ffd060']), 0.22, 0.45, 0, 0.95); }
        if (s.t >= s.dur) { S.shake = Math.max(S.shake, 0.35); burst(s.x, s.z, '#ff7a1a', 40, 6, 0.1, 0.3); burst(s.x, s.z, '#ffe08a', 16, 4, 0.08, 0.3); ring(s.x, s.z, 0.2, 2.8, '#ff9a3a', 0.55); for (const m of mobsNear(s.x, s.z, 2.4)) { burn(m, 0.6); hitMob(m, s.D, 'fire'); } sks.push({ type: 'firezone', x: s.x, z: s.z, R: 2, t: 0, dur: 3, tick: 0, D: s.D * 0.04 }); s.done = true; } break;
      case 'firezone': if (!s.v) { s.v = new THREE.Mesh(new THREE.CircleGeometry(s.R, 32).rotateX(-Math.PI / 2), addMat(0xff4a0a, 1.2, 0.5)); s.v.position.set(s.x, 0.04, s.z); scene.add(s.v); }
        s.v.material.opacity = 0.18 * Math.min(1, (s.dur - s.t) * 2); if (Math.random() < dt * 28) { const a = rr(0, 6.28), r = Math.sqrt(Math.random()) * s.R; emit(s.x + Math.cos(a) * r, 0.05, s.z + Math.sin(a) * r, 0, rr(1, 2), 0, pick(['#ff7a1a', '#ffcf5a']), 0.14, 0.6, 0.3, 0.98); }
        s.tick -= dt; if (s.tick <= 0) { s.tick = 0.3; for (const m of mobsNear(s.x, s.z, s.R)) { burn(m, 0.4); dot(m, HS.atk * s.D * HS.dmgMul * vuln(m, 'fire')); } } if (s.t >= s.dur) s.done = true; break;
      case 'blizzard': if (!s.v) { s.v = new THREE.Mesh(new THREE.CircleGeometry(s.R, 32).rotateX(-Math.PI / 2), addMat(0x9ff0ff, 0.8, 0.35)); s.v.position.set(s.x, 0.04, s.z); scene.add(s.v); }
        s.v.material.opacity = 0.3 * Math.min(1, Math.max(0, s.dur + 0.3 - s.t) * 2); if (s.t < s.dur) for (let n = 0; n < 5; n++) { const a = rr(0, 6.28), r = Math.sqrt(Math.random()) * s.R; emit(s.x + Math.cos(a) * r, rr(0.2, 2.4), s.z + Math.sin(a) * r, Math.cos(a + 1.6) * 2, -1, Math.sin(a + 1.6) * 2, '#e8fbff', 0.07, 0.6, 0, 0.98); }
        s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.4; for (const m of mobsNear(s.x, s.z, s.R)) { m.slowT = 1; m.slow = m.boss ? 0.25 : 0.5; freeze(m, 1.2, 0.12); hitMob(m, s.D, 'ice'); } } if (s.t >= s.dur + 0.3) s.done = true; break;
      case 'pillar': if (s.t >= 0) { if (!s.v) { if (!s.m.dead) { s.x = s.m.x; s.z = s.m.z; } s.v = new THREE.Group(); for (let n = 0; n < 5; n++) { const c = new THREE.Mesh(new THREE.ConeGeometry(rr(0.14, 0.22), rr(0.9, 1.5), 5), stylized({ color: 0xbff4ff, emissive: 0x3fb8ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.85, roughness: 0.1 }, 0xffffff, 1)); c.position.set(rr(-0.3, 0.3), 0.45, rr(-0.3, 0.3)); c.rotation.set(rr(-0.2, 0.2), 0, rr(-0.2, 0.2)); s.v.add(c); } s.v.position.set(s.x, 0, s.z); scene.add(s.v);
          for (const m of mobsNear(s.x, s.z, 0.9)) { freeze(m, 1.6); hitMob(m, s.D, 'ice'); } burst(s.x, s.z, '#dffaff', 12, 3, 0.06, 0.5); }
          const k = s.t / s.dur; s.v.scale.set(1, k < 0.15 ? k / 0.15 : k > 0.8 ? Math.max(0.01, (1 - k) / 0.2) : 1, 1); } if (s.t >= s.dur) s.done = true; break;
      case 'arrowrain': for (const a of s.arr) { if (!a.hit && s.t >= a.t && s.t < a.t + 0.25) { const k = (s.t - a.t) / 0.25; emit(a.x, 3 * (1 - k), a.z, 0, -10, 0, '#9fe0ff', 0.07, 0.12, 0, 1); }
          if (!a.hit && s.t >= a.t + 0.25) { a.hit = true; burst(a.x, a.z, '#9fe0ff', 6, 2, 0.05, 0.2); ring(a.x, a.z, 0.05, 0.7, '#4ab8ff', 0.3); for (const m of mobsNear(a.x, a.z, 0.8)) { m.wetT = 3; hitMob(m, s.D, 'water'); } } }
        if (s.t >= s.dur) s.done = true; break;
      case 'tide': { if (!s.v) { s.v = new THREE.Mesh(ringGeo, addMat(0x4ab8ff, 1.5, 0.9)); s.v.position.set(s.x, 0.12, s.z); scene.add(s.v); } const r = s.R * (1 - Math.pow(1 - Math.min(1, s.t / s.dur), 3)); s.v.scale.setScalar(Math.max(0.01, r)); s.v.material.opacity = Math.max(0, 1 - Math.max(0, s.t - s.dur) * 4);
        for (const m of mobs) { if (m.dead || s.hit.has(m)) continue; if (Math.hypot(m.x - s.x, m.z - s.z) <= r) { s.hit.add(m); m.wetT = 3; knock(m, 2); hitMob(m, s.D, 'water'); } }
        for (let n = 0; n < 3; n++) { const a = rr(0, 6.28); emit(s.x + Math.cos(a) * r, 0.15, s.z + Math.sin(a) * r, Math.cos(a), 1.4, Math.sin(a), pick(['#bfe8ff', '#4ab8ff']), 0.12, 0.45, -3, 0.97); }
        if (s.t >= s.dur + 0.25) s.done = true; break; }
      case 'judg': if (!s.v) { s.v = new THREE.Mesh(pillarGeo, new THREE.ShaderMaterial({ ...pillarShader, uniforms: { uC: { value: new THREE.Color(0xffd070).multiplyScalar(1.6) }, uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); s.v.scale.set(2.4, 1.6, 2.4); scene.add(s.v); }
        if (s.m && !s.m.dead) { s.x = s.m.x; s.z = s.m.z; } s.v.position.set(s.x, 0, s.z); s.v.material.uniforms.uA.value = s.t < s.dur ? 1 : Math.max(0, 1 - (s.t - s.dur) * 3);
        if (s.t < s.dur) emit(s.x + rr(-0.5, 0.5), 0.1, s.z + rr(-0.5, 0.5), 0, rr(3, 5), 0, pick(['#fff0b0', '#ffb040']), 0.12, 0.6, 0, 0.98);
        s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.2; for (const m of mobsNear(s.x, s.z, 1.5)) { burn(m, 0.3); hitMob(m, s.D, 'fire'); } } if (s.t >= s.dur + 0.3) s.done = true; break;
    }
    if (s.done && s.v) { scene.remove(s.v); s.v = null; }
  }
  for (let i = sks.length - 1; i >= 0; i--) if (sks[i].done) sks.splice(i, 1);
}

// ---------- hero update ----------
const input = { x: 0, z: 0, keys: {} };
function heroDie() { S.dead = 3; const lost = Math.floor(S.exp * 0.03); S.exp -= lost; banner('BẠN ĐÃ GỤC NGÃ', 'red'); log('Hồi sinh sau 3 giây' + (lost ? ` (mất ${lost} EXP)` : '') + '.', '#ff9a9a'); for (const m of mobs) m.aggro = false; heroG.visible = false; burst(S.pos.x, S.pos.z, '#ff6a6a', 30, 4, 0.08, 0.8); }
function updateHero(dt, t) {
  if (S.dead > 0) { S.dead -= dt; if (S.dead <= 0) { S.pos.set(0, 0, 8); recalc(true); heroG.visible = true; pillar(0, 8, '#9fe8ff', 1.2); } return; }
  let mx = input.x, mz = input.z;
  if (input.keys.KeyW || input.keys.ArrowUp) mz -= 1; if (input.keys.KeyS || input.keys.ArrowDown) mz += 1; if (input.keys.KeyA || input.keys.ArrowLeft) mx -= 1; if (input.keys.KeyD || input.keys.ArrowRight) mx += 1;
  let mag = Math.hypot(mx, mz); const manual = mag > 0.12; const C = CLS[S.cls];
  if (!manual && S.auto) {
    let target = null, best = 1e9;
    for (const l of loots) { const d = Math.hypot(l.x - S.pos.x, l.z - S.pos.z); if (d < 9 && d < best) { best = d; target = { x: l.x, z: l.z, loot: true }; } }
    if (!target) for (const m of mobs) { if (m.dead) continue; if (m.boss && HS.hp < m.atk * 6) continue; if (!m.aggro && m.lv > S.lv + 4) continue; const d = Math.hypot(m.x - S.pos.x, m.z - S.pos.z) - (m.aggro ? 3 : 0) + (m.lv > S.lv + 6 ? 20 : 0); if (d < best) { best = d; target = m; } }
    if (target) { const dx = target.x - S.pos.x, dz = target.z - S.pos.z, d = Math.hypot(dx, dz); const want = target.loot ? 0.3 : (C.melee ? C.range - 0.3 : C.range - 1);
      if (d > want) { mx = dx / d; mz = dz / d; mag = 1; } else if (!target.loot) { S.face = Math.atan2(dx, dz); const crowd = mobsNear(target.x, target.z, 2.6).filter(o => o.lv <= S.lv + 4 || o.aggro).length; if (crowd >= 2 || target.boss || target.maxHp > HS.atk * 6) { for (let j = 2; j >= 0; j--) if (castSkill(j, target)) break; } attack(target); } }
  }
  if (mag > 0.12 && S.castT <= 0) { const sp = Math.min(mag, 1) * (4.2 + (S.wing ? 0.4 * S.wing : 0)); const nx = S.pos.x + mx / Math.max(mag, 1) * sp * dt, nz = S.pos.z + mz / Math.max(mag, 1) * sp * dt;
    if (!collides(nx, S.pos.z, 0.4)) S.pos.x = nx; if (!collides(S.pos.x, nz, 0.4)) S.pos.z = nz; const r = Math.hypot(S.pos.x, S.pos.z); if (r > 21) { S.pos.x *= 21 / r; S.pos.z *= 21 / r; }
    const want = Math.atan2(mx, mz); let da = want - S.face; da = Math.atan2(Math.sin(da), Math.cos(da)); S.face += da * Math.min(1, dt * 10); }
  const moving = mag > 0.12;
  if (H3.mixer) H3.mixer.update(dt);
  const fly = S.wing > 0; heroG.position.set(S.pos.x, (fly ? 0.45 : 0.05) + (fly ? Math.sin(t * 2.2) * 0.08 : 0), S.pos.z);
  heroG.rotation.y = S.face + (S.spinT > 0 ? (0.5 - S.spinT) * Math.PI * 4 : 0); if (S.spinT > 0) S.spinT -= dt;
  heroBody.rotation.x = lerp(heroBody.rotation.x, moving ? 0.22 : 0, dt * 5);
  if (S.wing > 0) { const f = Math.sin(t * 2.2 + 0.6); H3.wr.rotation.set(-0.5 + f * 0.08, -0.12 - f * 0.22 - (moving ? 0.25 : 0), 0.05 + f * 0.1); H3.wl.rotation.set(-0.5 + f * 0.08, 0.12 + f * 0.22 + (moving ? 0.25 : 0), -0.05 - f * 0.1); }
  if (S.atkT > 0) { S.atkT += dt; slashMat.uniforms.uT.value = Math.min(1, S.atkT / 0.32); if (S.atkT > 0.32) { S.atkT = 0; slash.visible = false; } }
  S.atkCd = Math.max(0, S.atkCd - dt); S.castT = Math.max(0, S.castT - dt); for (let j = 0; j < 3; j++) S.skCd[j] = Math.max(0, S.skCd[j] - dt);
  const ooc = S.time - S.lastHit > 4; S.hp = Math.min(HS.hp, S.hp + HS.hp * (ooc ? 0.03 : 0.004) * dt); S.mp = Math.min(HS.mp, S.mp + (4 + S.lv * 0.05) * dt);
  aura.position.set(S.pos.x, 0.04, S.pos.z); aura.rotation.y = t * 0.4; auraMat.uniforms.uC.value.set(levelGlow > 0 ? '#ffd36a' : CLS[S.cls].col); if (levelGlow > 0) levelGlow -= dt;
  heroBlob.position.set(S.pos.x, 0.03, S.pos.z); groundU.uTime.value = t;
  if (S.wing > 0 && Math.random() < dt * 30) { const side = Math.random() < 0.5 ? -1 : 1, s = Math.random(); const lx = side * (0.2 + s * 1.0) * WSC[S.wing] * 2, ly = 0.9 + s * 0.4, lz = -0.3; const c = Math.cos(S.face), sn = Math.sin(S.face);
    emit(S.pos.x + lx * c + lz * sn, heroG.position.y + ly, S.pos.z - lx * sn + lz * c, rr(-0.15, 0.15), rr(-0.5, -0.1), rr(-0.15, 0.15), Math.random() < 0.3 ? '#ffffff' : CLS[S.cls].col, rr(0.06, 0.12), rr(0.8, 1.4), 0, 0.99); }
  if (S.glowTier > 0 && Math.random() < dt * 14 * S.glowTier) { const p = heroTip(); emit(p.x + rr(-0.1, 0.1), p.y + rr(-0.3, 0.1), p.z + rr(-0.1, 0.1), rr(-0.2, 0.2), rr(0.1, 0.5), rr(-0.2, 0.2), '#' + new THREE.Color(TIER_COL[S.glowTier]).getHexString(), rr(0.05, 0.1), rr(0.5, 1), 0, 0.98); }
}

// ---------- monsters update ----------
function updateMobs(dt, t) {
  const M = MAPS[S.map];
  if (!S.boss) { S.bossT -= dt; if (S.bossT <= 0) { const b = M.boss; S.boss = addMob(b.k, b.lv, b.x, b.z, { x: b.x, z: b.z, r: 3.5 }); banner('BOSS XUẤT HIỆN: ' + MT[b.k].name.toUpperCase(), 'red'); log('Boss ' + MT[b.k].name + ' (Lv ' + b.lv + ') xuất hiện ở trận đồ phía bắc!', '#ff9a9a'); pillar(b.x, b.z, '#ff6a6a', 2, 2); S.shake = 0.3; } }
  for (const m of mobs) {
    const v = m.v, g = v.g;
    if (m.dead) { if (m.dead === 1) { m.deadT = 0; m.dead = 2; m.el.style.display = 'none'; } m.deadT += dt; const k = clamp(1 - m.deadT / 0.4, 0, 1); g.scale.setScalar(0.2 + 0.8 * k); g.visible = k > 0; m.sh.visible = k > 0;
      if (!m.boss) { m.respawn -= dt; if (m.respawn <= 0) { const [x, z] = spawnPos(m.zone); m.x = x; m.z = z; m.hp = m.maxHp; m.dead = 0; m.aggro = false; m.state = 'idle'; m.wait = 1; m.frzT = m.burnT = m.shockT = m.wetT = m.slowT = 0; g.visible = true; m.sh.visible = true; m.spawnT = 0.6; burst(x, z, '#7fe9ff', 14, 2, 0.06, 0.6); } }
      continue; }
    for (const k of ['slowT', 'frzT', 'stunT', 'shockT', 'wetT']) if (m[k] > 0) m[k] -= dt;
    if (m.burnT > 0) { m.burnT -= dt; dot(m, m.burnD * dt); if (Math.random() < dt * 10) emit(m.x + rr(-0.2, 0.2), mobH(m), m.z + rr(-0.2, 0.2), 0, 0.8, 0, '#ff7a1a', 0.08, 0.5, 0.3, 0.98); if (m.dead) continue; }
    if (m.shockT > 0 && Math.random() < dt * 6) emit(m.x + rr(-0.3, 0.3), mobH(m) + rr(-0.2, 0.2), m.z + rr(-0.3, 0.3), rr(-0.5, 0.5), rr(-0.5, 0.5), rr(-0.5, 0.5), '#d8c0ff', 0.06, 0.15, 0, 1);
    if (m.wetT > 0 && Math.random() < dt * 3) emit(m.x + rr(-0.2, 0.2), mobH(m), m.z, 0, -1.2, 0, '#7fd0ff', 0.05, 0.5, -2, 1);
    const stopped = m.frzT > 0 || m.stunT > 0; const spd = (m.T.speed || 1.2) * (m.slowT > 0 ? 1 - (m.slow || 0) : 1);
    const dh = Math.hypot(S.pos.x - m.x, S.pos.z - m.z); let moving = false; const reach = m.boss ? 2.4 : 1.0;
    if (m.boss && !m.aggro && dh < 7 && !S.dead) m.aggro = true;
    if (m.aggro && !S.dead) {
      if (dh > (m.boss ? 18 : 12)) m.aggro = false;
      else if (dh > reach) { if (!stopped) { m.tx = S.pos.x; m.tz = S.pos.z; moving = true; } }
      else if (!stopped) { m.face = Math.atan2(S.pos.x - m.x, S.pos.z - m.z); m.atkCd -= dt;
        if (m.atkCd <= 0) { m.atkCd = m.boss ? 1.8 : rr(1.4, 2.2); m.lunge = 0.3;
          const raw = m.atk * rr(0.85, 1.15) * (m.boss ? 1 : 1); const dmg = Math.max(1, Math.round(raw - HS.def * 0.5)); S.hp -= dmg; S.lastHit = S.time; addText(S.pos.x, S.pos.z, '-' + dmg, '#ff6b6b', 13, null, 1.8);
          if (m.boss) { ring(m.x, m.z, 0.3, 3, '#ff6a6a', 0.5); S.shake = Math.max(S.shake, 0.2); }
          if (S.hp <= 0) heroDie(); } }
    } else if (!stopped) { m.wait -= dt; if (m.wait <= 0) { if (m.state === 'idle') { const a = rr(0, 6.28), d = rr(1, m.zone.r * 0.8); m.tx = m.zone.x + Math.cos(a) * d; m.tz = m.zone.z + Math.sin(a) * d; m.state = 'move'; } else { m.state = 'idle'; m.wait = rr(1.5, 4); } } if (m.state === 'move') moving = true; }
    if (moving && !stopped) { const dx = m.tx - m.x, dz = m.tz - m.z, d = Math.hypot(dx, dz);
      if (d < 0.3) { if (!m.aggro) { m.state = 'idle'; m.wait = rr(1.5, 4); } }
      else { const sp = spd * (m.aggro ? 1.8 : 1); const nx = m.x + dx / d * sp * dt, nz = m.z + dz / d * sp * dt; if (!collides(nx, nz, m.boss ? 1 : 0.4)) { m.x = nx; m.z = nz; } else if (!m.aggro) { m.state = 'idle'; m.wait = 0.5; }
        const want = Math.atan2(dx, dz); let da = want - m.face; da = Math.atan2(Math.sin(da), Math.cos(da)); m.face += da * Math.min(1, dt * 4); } }
    m.moving = moving;
    if (!stopped) v.anim(m, t);
    let lz = 0; if (m.lunge > 0) { m.lunge -= dt; lz = Math.sin((m.lunge / 0.3) * Math.PI) * (m.boss ? 0.8 : 0.4); }
    const sc = m.spawnT > 0 ? (m.spawnT -= dt, 1 - m.spawnT / 0.6) : 1; g.scale.setScalar(clamp(sc, 0.05, 1));
    const y = v.kind === 'crab' ? 0 : (m.T.y || 0.5) + Math.sin(t * 1.5 + m.seed) * 0.08;
    g.position.set(m.x + Math.sin(m.face) * lz, y, m.z + Math.cos(m.face) * lz); g.rotation.y = m.face; m.sh.position.set(m.x, 0.03, m.z);
    m.flash = Math.max(0, (m.flash || 0) - dt * 6);
    TINT.setRGB(0, 0, 0); if (m.frzT > 0) TINT.setRGB(0.25, 0.6, 0.9); else if (m.burnT > 0) TINT.setRGB(0.35, 0.1, 0).multiplyScalar(0.7 + 0.3 * Math.sin(t * 20)); else if (m.shockT > 0) TINT.setRGB(0.35, 0.25, 0.6).multiplyScalar(0.5 + 0.5 * Math.random());
    TINT.addScalar(m.flash * 0.5);
    if (v.jmat) v.jmat.uniforms.uTint.value.copy(TINT); else for (const mm of v.mats) { mm.emissive.copy(TINT); if (mm.userData.base) mm.emissive.add(tmpC.setHex(mm.userData.base).multiplyScalar(0.25)); }
  }
  for (let i = mobs.length - 1; i >= 0; i--) { const m = mobs[i]; if (m.boss && m.dead && m.deadT > 0.5) { removeMob(m); mobs.splice(i, 1); } }
}
function updateLoot(dt, t) {
  for (let i = loots.length - 1; i >= 0; i--) { const l = loots[i]; l.t += dt; l.gem.rotation.y = t * 2; l.gem.position.y = 0.4 + Math.sin(t * 3 + i) * 0.08 + Math.max(0, 1.2 - l.t * 3) * Math.sin(Math.min(l.t * 3, 1) * Math.PI);
    if ((!S.dead && Math.hypot(l.x - S.pos.x, l.z - S.pos.z) < 1.0) || l.t > 90) {
      if (l.t <= 90) { addItem(l.gear); log(`Nhặt được [${l.gear.name}${l.gear.plus ? ' +' + l.gear.plus : ''}] · ${RARITY[l.gear.r].n}${l.gear.set ? ' · ' + SETS[l.gear.set].n : ''}`, l.gear.set ? SETS[l.gear.set].col : RARITY[l.gear.r].css); burst(l.x, l.z, l.gear.set ? SETS[l.gear.set].col : RARITY[l.gear.r].css, 10, 2, 0.05, 0.5); }
      removeLoot(l); loots.splice(i, 1); updateHud(); } }
}
const BAG_MAX = 40;
function addItem(g) { if (S.inv.length >= BAG_MAX) { const p = sellPrice(g); S.gold += p; log(`Túi đầy, tự bán [${g.name}] được ${p} vàng`, '#9fe8ff'); return; } S.inv.push(g); }
