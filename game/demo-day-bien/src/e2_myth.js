
// =====================================================================
// MYTHIC MONSTERS — serpents, wraiths, golems, birds, scarabs, spirits
// Each builder returns { group, mats, kind, anim(t, moving, m) }; mats[0] takes the hit flash.
// =====================================================================
const glowM = hex => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.4) });
const SPH = new THREE.SphereGeometry(1, 18, 12), SPH_LO = new THREE.SphereGeometry(1, 10, 8), CONE = new THREE.ConeGeometry(1, 1, 10), CYL = new THREE.CylinderGeometry(1, 1, 1, 10);
function part(geo, mat, sx, sy, sz, x = 0, y = 0, z = 0, parent) { const o = new THREE.Mesh(geo, mat); o.scale.set(sx, sy, sz); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
function horns(parent, mat, y, z, spread, len, curve = 0.5) { for (const s of [-1, 1]) { const h = part(CONE, mat, 0.05, len, 0.05, s * spread, y + len * 0.4, z); h.rotation.z = -s * curve; h.rotation.x = -0.3; parent.add(h); } }
function crown(parent, y, r, hex = 0xffd23a) { const m = stylized({ color: hex, metalness: 0.9, roughness: 0.25, emissive: new THREE.Color(hex).multiplyScalar(0.25) }, 0xfff0b0, 0.8); const c = new THREE.Group();
  part(new THREE.CylinderGeometry(1, 1, 0.3, 14, 1, true), m, r, r * 0.8, r, 0, 0, 0, c); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; part(CONE, m, r * 0.18, r * 0.7, r * 0.18, Math.cos(a) * r, r * 0.45, Math.sin(a) * r, c); }
  part(SPH_LO, glowM(0xff4a6a), r * 0.16, r * 0.16, r * 0.16, 0, r * 0.1, r * 0.95, c); c.position.y = y; parent.add(c); return c; }

// --- serpent: naga, cobra (Apep), Chinese/Norse dragon. body is a chain of glowing-spined segments
function makeSerpent(p = {}) {
  const g = new THREE.Group(), N = p.segs || 10, segs = [];
  const bodyM = stylized({ color: p.body || 0x2a6a4a, roughness: 0.4, metalness: 0.35 }, p.glow || 0x9fffc0, 0.9, 2.2);
  const bellyM = stylized({ color: p.belly || 0xd8c890, roughness: 0.5 }, p.glow || 0x9fffc0, 0.4);
  const gl = glowM(p.glow || 0x9fffc0);
  for (let i = 0; i < N; i++) { const s = new THREE.Group(); const k = 1 - (i / N) * 0.72;
    part(SPH, bodyM, 0.2 * k, 0.17 * k, 0.3 * k, 0, 0, 0, s); part(SPH_LO, bellyM, 0.15 * k, 0.09 * k, 0.27 * k, 0, -0.08 * k, 0, s);
    if (i % 3 === 0) part(CONE, gl, 0.025 * k, 0.1 * k, 0.025 * k, 0, 0.17 * k, 0, s);
    if (p.mane && i < N - 2) { const f = part(CONE, stylized({ color: p.mane, roughness: 0.6 }, p.glow, 0.6), 0.06 * k, 0.22 * k, 0.03 * k, 0, 0.2 * k, -0.04, s); f.rotation.x = -0.6; }
    g.add(s); segs.push(s); }
  const head = new THREE.Group(); g.add(head);
  part(SPH, bodyM, 0.2, 0.15, 0.3, 0, 0, 0.08, head); const jaw = part(SPH, bellyM, 0.15, 0.06, 0.24, 0, -0.09, 0.1, head);
  const eyeM = glowM(p.eye || 0xffe04a); for (const s of [-1, 1]) part(SPH_LO, eyeM, 0.04, 0.035, 0.04, s * 0.11, 0.06, 0.2, head);
  if (p.hood) { const hd = part(SPH, stylized({ color: p.hood, roughness: 0.45, metalness: 0.3, side: THREE.DoubleSide }, p.glow, 0.8), 0.42, 0.36, 0.05, 0, 0.08, -0.12, head); for (const s of [-1, 1]) part(SPH_LO, gl, 0.06, 0.08, 0.02, s * 0.18, 0.14, -0.09, head); }
  if (p.horn) horns(head, stylized({ color: p.horn, roughness: 0.35, metalness: 0.5 }, 0xffffff, 0.6), 0.1, -0.05, 0.1, 0.32, 0.6);
  if (p.whisk) for (const s of [-1, 1]) { const w = part(CYL, gl, 0.008, 0.6, 0.008, s * 0.14, -0.05, 0.42, head); w.rotation.set(1.2, 0, s * 0.6); }
  if (p.crown) crown(head, 0.2, 0.16);
  const fly = !!p.fly;
  return { group: g, mats: [bodyM], kind: 'serpent', head, anim(t, moving, m) { const sp = moving ? 7 : 3; const ph = m.phase;
    for (let i = 0; i < N; i++) { const a = t * sp - i * 0.65 + ph; const s = segs[i];
      s.position.set(Math.sin(a) * (0.06 + i * 0.02), (fly ? Math.sin(a * 0.5) * 0.12 : 0) + (p.rear ? Math.max(0, 3 - i) * 0.16 : 0), -0.02 - i * 0.17); s.rotation.y = Math.cos(a) * 0.45; }
    head.position.set(Math.sin(t * sp + ph + 0.65) * 0.06, (p.rear ? 0.62 : 0.05) + (fly ? Math.sin((t * sp + ph) * 0.5) * 0.12 : 0), 0.2);
    jaw.rotation.x = m.lunge > 0 ? 0.5 : Math.max(0, Math.sin(t * 1.3 + ph)) * 0.15; } };
}

// --- wraith: mummy, yurei, draugr, banshee. hooded robe with a fluttering hem, glowing eyes and claws
function robeMat(hex, glow) { const m = stylized({ color: hex, roughness: 0.75, side: THREE.DoubleSide, vertexColors: true }, glow, 0.8, 2.0); const prev = m.onBeforeCompile;
  m.onBeforeCompile = s => { prev(s); s.uniforms.uTime = U.uTime; s.vertexShader = 'uniform float uTime;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float hm = 1.0 - clamp(position.y / 0.9, 0.0, 1.0); float an = atan(position.z, position.x);
      float ph = modelMatrix[3].x * 1.7 + modelMatrix[3].z;
      transformed.xz *= 1.0 + sin(uTime * 4.0 + an * 5.0 + ph) * 0.14 * hm; transformed.y += sin(uTime * 5.0 + an * 7.0 + ph) * 0.06 * hm;`); };
  m.customProgramCacheKey = () => 'robe'; return m; }
function makeWraith(p = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const prof = [[0.001, 1.5], [0.16, 1.47], [0.25, 1.33], [0.27, 1.12], [0.24, 0.98], [0.3, 0.75], [0.4, 0.42], [0.52, 0.08], [0.47, 0.0]].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(prof, 28); const pos = geo.attributes.position, cols = [], A = new THREE.Color(p.robe || 0x3a4a5a), B = new THREE.Color(p.robe2 || p.robe || 0x3a4a5a), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); const band = p.bands ? (Math.sin(y * 34 + Math.atan2(pos.getZ(i), pos.getX(i)) * 2) > 0.2 ? 1 : 0.72) : 1; tmp.copy(A).lerp(B, 1 - y / 1.5).multiplyScalar(band); cols.push(tmp.r, tmp.g, tmp.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const rm = robeMat(0xffffff, p.glow || 0x9fe8ff); const robe = new THREE.Mesh(geo, rm); body.add(robe);
  part(SPH, new THREE.MeshBasicMaterial({ color: 0x020205 }), 0.17, 0.19, 0.12, 0, 1.2, 0.12, body);
  const eyeM = glowM(p.eye || 0x9fe8ff); for (const s of [-1, 1]) part(SPH_LO, eyeM, 0.035, 0.022, 0.02, s * 0.065, 1.23, 0.23, body);
  if (p.horn) horns(body, stylized({ color: p.horn, roughness: 0.4, metalness: 0.5 }, 0xffffff, 0.5), 1.35, -0.02, 0.17, 0.3, 0.9);
  if (p.crown) crown(body, 1.5, 0.17);
  if (p.hair) for (let i = 0; i < 9; i++) { const h = part(new THREE.PlaneGeometry(0.06, 0.7), new THREE.MeshStandardMaterial({ color: 0x050505, side: THREE.DoubleSide, roughness: 0.9 }), 1, 1, 1, (i - 4) * 0.045, 1.05, 0.2 + Math.abs(i - 4) * -0.012, body); h.rotation.x = 0.1; }
  const arms = []; const sleeveM = stylized({ color: p.robe || 0x3a4a5a, roughness: 0.8 }, p.glow || 0x9fe8ff, 0.6); const clawM = glowM(p.claw || p.eye || 0x9fe8ff);
  for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.set(s * 0.25, 1.0, 0.05); const sl = part(CONE, sleeveM, 0.09, 0.5, 0.09, 0, -0.22, 0, a); sl.rotation.x = Math.PI;
    for (let f = 0; f < 3; f++) { const c = part(CONE, clawM, 0.015, 0.13, 0.015, (f - 1) * 0.035, -0.52, 0.02, a); c.rotation.x = Math.PI + 0.3; } body.add(a); arms.push(a); }
  return { group: g, mats: [sleeveM], kind: 'wraith', anim(t, moving, m) { const ph = m.phase; body.position.y = Math.sin(t * 1.6 + ph) * 0.08; body.rotation.z = Math.sin(t * 1.1 + ph) * 0.05; body.rotation.x = moving ? 0.25 : 0.05;
    const reach = m.lunge > 0 ? 1.2 : 0; arms.forEach((a, i) => { a.rotation.x = -0.5 - reach + Math.sin(t * 2.2 + ph + i * 1.7) * 0.25; a.rotation.z = (i ? -1 : 1) * (0.25 + Math.sin(t * 1.7 + ph + i) * 0.1); });
    if (Math.random() < 0.05) emit(m.x + rr(-0.3, 0.3), m.T.y + 0.1, m.z + rr(-0.3, 0.3), 0, rr(0.2, 0.6), 0, C3(m.T.color), 0.25, 0.9, 0, 0.98); } };
}

// --- golem: sand guardian, marble cyclops/titan, ice jotunn, swamp treant. floating fists, rune ring, glowing core
function rockyGeo(r, det, amp, seedK) { const g = new THREE.IcosahedronGeometry(r, det); const p = g.attributes.position; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = vnoise(v.x * 3 + seedK, v.y * 3, v.z * 3 - seedK); v.multiplyScalar(1 + (n - 0.5) * amp); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }
function makeGolem(p = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const st = stylized({ color: p.stone || 0xb08a5a, roughness: p.metal ? 0.3 : 0.8, metalness: p.metal ? 0.85 : 0.05, flatShading: true }, p.glow || 0xffd27a, 0.6, 2.4);
  const gl = glowM(p.glow || 0xffd27a);
  part(rockyGeo(0.42, 1, 0.35, 1.3), st, 1, 1.15, 0.85, 0, 0.95, 0, body);
  const core = part(SPH_LO, gl, 0.11, 0.11, 0.11, 0, 1.0, 0.33, body);
  const head = new THREE.Group(); head.position.set(0, 1.62, 0.04); body.add(head);
  part(rockyGeo(0.2, 1, 0.3, 4.1), st, 1, 0.95, 1, 0, 0, 0, head);
  if (p.cyclops) { part(SPH, new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: 0.2 }), 0.1, 0.1, 0.06, 0, 0.02, 0.17, head); part(SPH_LO, gl, 0.05, 0.05, 0.03, 0, 0.02, 0.22, head); }
  else for (const s of [-1, 1]) part(SPH_LO, gl, 0.035, 0.025, 0.02, s * 0.075, 0.03, 0.18, head);
  if (p.halo) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.018, 8, 40), gl); h.position.set(0, 0.1, -0.2); head.add(h); }
  if (p.horn) horns(head, stylized({ color: p.horn, roughness: 0.4 }, 0xffffff, 0.5), 0.1, 0, 0.12, 0.25, 0.7);
  if (p.crown) crown(head, 0.2, 0.16);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 6, 48), gl); ring.position.y = 0.95; ring.rotation.x = 1.3; body.add(ring);
  const fists = []; for (const s of [-1, 1]) { const sh = part(rockyGeo(0.17, 0, 0.4, s * 2), st, 1, 1, 1, s * 0.5, 1.38, 0, body); const f = part(rockyGeo(0.19, 1, 0.35, s * 3.3), st, 1, 1, 1, s * 0.62, 0.62, 0.15, body); fists.push(f); }
  const peb = []; for (let i = 0; i < 4; i++) peb.push(part(rockyGeo(0.06, 0, 0.5, i), st, 1, 1, 1, 0, 0, 0, body));
  if (p.crystal) { const cm = stylized({ color: p.crystal, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85, emissive: new THREE.Color(p.crystal).multiplyScalar(0.25) }, 0xffffff, 1.2);
    for (let i = 0; i < 7; i++) { const c = part(new THREE.OctahedronGeometry(1), cm, 0.07, rr(0.2, 0.38), 0.07, rr(-0.35, 0.35), 1.35 + rr(0, 0.2), rr(-0.25, 0.1), body); c.rotation.set(rr(-0.5, 0.5), 0, rr(-0.6, 0.6)); } }
  if (p.wood) { for (const s of [-1, 1]) { const br = coralBranches(0.55, 0.05, 2, p.stone, p.leaf || 0x6aaa3a); br.position.set(s * 0.32, 1.45, -0.05); br.rotation.z = -s * 0.5; br.scale.setScalar(0.9); body.add(br); }
    const lm = stylized({ color: p.leaf || 0x4a8a2a, roughness: 0.8, flatShading: true }, 0xc8ff8a, 0.4); for (let i = 0; i < 6; i++) part(new THREE.IcosahedronGeometry(1, 0), lm, rr(0.12, 0.2), rr(0.1, 0.16), rr(0.12, 0.2), rr(-0.5, 0.5), rr(1.6, 2.0), rr(-0.3, 0.2), body); }
  return { group: g, mats: [st], kind: 'golem', anim(t, moving, m) { const ph = m.phase; body.position.y = Math.sin(t * 1.4 + ph) * 0.05; body.rotation.z = moving ? Math.sin(t * 6 + ph) * 0.06 : 0;
    head.position.y = 1.62 + Math.sin(t * 2 + ph) * 0.03; ring.rotation.z = t * 0.8; core.scale.setScalar(0.11 * (1 + Math.sin(t * 4 + ph) * 0.25));
    const slam = m.lunge > 0 ? Math.sin((m.lunge / 0.3) * Math.PI) : 0;
    fists.forEach((f, i) => { const s = i ? 1 : -1; f.position.set(s * 0.62, 0.62 + Math.sin(t * 2.4 + ph + i * 2) * 0.08 + slam * 0.5, 0.15 + slam * 0.45); f.rotation.y = t * 0.6; });
    peb.forEach((q, i) => { const a = t * 1.3 + i * 1.57 + ph; q.position.set(Math.cos(a) * 0.75, 1.0 + Math.sin(a * 2) * 0.25, Math.sin(a) * 0.75); }); } };
}

// --- bird: harpy, phoenix, raven, griffin, ice bird. glowing feather-fan wings (hero wing shader)
function makeBird(p = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const fm = stylized({ color: p.body || 0x6a3a8a, roughness: 0.6, metalness: 0.15 }, p.glow || 0xd8a8ff, 0.8);
  const gl = glowM(p.glow || 0xd8a8ff);
  part(SPH, fm, 0.2, 0.2, 0.34, 0, 0, 0, body); part(SPH, fm, 0.13, 0.13, 0.13, 0, 0.14, 0.3, body);
  const bk = part(CONE, stylized({ color: p.beak || 0xffc84a, roughness: 0.3, metalness: 0.4 }, 0xffffff, 0.4), 0.045, 0.16, 0.045, 0, 0.12, 0.47, body); bk.rotation.x = Math.PI / 2 + 0.25;
  for (const s of [-1, 1]) part(SPH_LO, glowM(p.eye || 0xffe04a), 0.025, 0.025, 0.02, s * 0.07, 0.18, 0.4, body);
  for (let i = 0; i < 3; i++) { const c = part(CONE, gl, 0.025, 0.2, 0.02, (i - 1) * 0.04, 0.3, 0.24 - i * 0.04, body); c.rotation.x = -0.7 - i * 0.15; }
  const tail = new THREE.Group(); tail.position.set(0, 0.02, -0.3); body.add(tail);
  for (let i = 0; i < 5; i++) { const f = part(new THREE.PlaneGeometry(0.08, 0.55).translate(0, -0.27, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(i % 2 ? p.glow || 0xd8a8ff : p.tail || p.glow || 0xd8a8ff).multiplyScalar(1.6), side: THREE.DoubleSide, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), 1, 1, 1, 0, 0, 0, tail); f.rotation.set(Math.PI / 2 - 0.25, (i - 2) * 0.28, 0); }
  const wm = wingMat.clone(); wm.uniforms.uTime = U.uTime; wm.uniforms.uRoot.value.setHex(p.w1 || 0xfff0ff); wm.uniforms.uTip.value.setHex(p.w2 || 0x8a3dff); wm.uniforms.uEdge.value.setHex(p.w3 || 0xd8a8ff); wm.uniforms.uB.value = 0.7;
  const wings = []; for (const s of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(s * 0.12, 0.08, 0.02); const w = new THREE.Mesh(wingGeo, wm); w.scale.set(s * 0.32, 0.32, 0.32); w.rotation.set(-Math.PI / 2, 0, s * 0.15); piv.add(w); body.add(piv); wings.push(piv); }
  for (const s of [-1, 1]) { const l = part(CYL, stylized({ color: p.beak || 0xffc84a, roughness: 0.4 }, 0xffffff, 0.3), 0.015, 0.22, 0.015, s * 0.08, -0.22, 0.02, body); l.rotation.x = 0.4; }
  if (p.crown) crown(body, 0.3, 0.12);
  return { group: g, mats: [fm], kind: 'bird', anim(t, moving, m) { const ph = m.phase, f = moving ? 9 : 5.5; const fl = Math.sin(t * f + ph);
    wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (fl * 0.65 + 0.1); w.rotation.y = (i ? 1 : -1) * 0.15; });
    body.position.y = Math.sin(t * f + ph - 1) * 0.08; body.rotation.x = moving ? 0.2 : -0.05 + Math.sin(t * 1.3) * 0.05; tail.rotation.x = Math.sin(t * 2 + ph) * 0.15;
    if (p.trail && Math.random() < 0.35) emit(m.x + rr(-0.2, 0.2), m.T.y + 0.1, m.z + rr(-0.2, 0.2), rr(-0.3, 0.3), rr(-0.2, 0.4), rr(-0.3, 0.3), C3(Math.random() < 0.5 ? p.trail : '#ffffff'), 0.28, 0.6, 0, 0.96); } };
}

// --- scarab: golden scarab, swamp beetle, crystal beetle. iridescent shell with a glowing seam, walking legs
function makeScarab(p = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const sm = stylized({ color: p.shell || 0x2a6a5a, roughness: 0.22, metalness: 0.9 }, p.glow || 0x9fffd0, 1.0, 1.8);
  const dm = stylized({ color: p.dark || 0x10140f, roughness: 0.5, metalness: 0.4 }, p.glow || 0x9fffd0, 0.5);
  const gl = glowM(p.glow || 0x9fffd0);
  for (const s of [-1, 1]) { const h = part(new THREE.SphereGeometry(1, 16, 10, s > 0 ? 0 : Math.PI, Math.PI, 0, Math.PI / 2), sm, 0.36, 0.3, 0.44, s * 0.012, 0.2, -0.05, body); }
  part(CYL, gl, 0.012, 0.86, 0.012, 0, 0.36, -0.05, body).rotation.x = Math.PI / 2;
  part(SPH, dm, 0.24, 0.13, 0.17, 0, 0.22, 0.38, body);
  const head = part(SPH, dm, 0.15, 0.1, 0.12, 0, 0.2, 0.55, body);
  const hn = part(CONE, sm, 0.04, 0.28, 0.04, 0, 0.32, 0.62, body); hn.rotation.x = 0.6;
  for (const s of [-1, 1]) { part(SPH_LO, glowM(p.eye || 0xffe04a), 0.03, 0.03, 0.03, s * 0.1, 0.24, 0.63, body); const a = part(CYL, dm, 0.008, 0.25, 0.008, s * 0.07, 0.3, 0.68, body); a.rotation.set(1.0, 0, s * 0.5); }
  if (p.gem) part(new THREE.OctahedronGeometry(1), gl, 0.07, 0.1, 0.07, 0, 0.5, -0.05, body);
  if (p.crown) crown(body, 0.48, 0.14);
  const legs = []; for (let i = 0; i < 6; i++) { const s = i % 2 ? 1 : -1, row = Math.floor(i / 2); const piv = new THREE.Group(); piv.position.set(s * 0.25, 0.14, 0.25 - row * 0.25);
    const l = part(CYL, dm, 0.02, 0.32, 0.02, s * 0.14, -0.06, 0, piv); l.rotation.z = s * 1.1; body.add(piv); legs.push(piv); }
  return { group: g, mats: [sm], kind: 'scarab', anim(t, moving, m) { const f = moving ? 14 : 2, ph = m.phase; legs.forEach((l, i) => { l.rotation.y = Math.sin(t * f + ph + i * 1.9) * (moving ? 0.5 : 0.08); });
    body.position.y = moving ? Math.abs(Math.sin(t * f)) * 0.02 : 0; head.rotation.y = Math.sin(t * 1.5 + ph) * 0.3; } };
}

// --- spirit: kitsune fox-fire, oni mask, seraph eye, will-o-wisp, aurora spirit
const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
function makeSpirit(p = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: new THREE.Color(p.glow || 0x7fd8ff).multiplyScalar(0.55), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); halo.scale.setScalar(1.0); body.add(halo);
  const cm = stylized({ color: p.core || 0xffffff, roughness: 0.3, emissive: new THREE.Color(p.glow || 0x7fd8ff).multiplyScalar(0.45) }, p.glow || 0x7fd8ff, 1.2);
  part(SPH, cm, 0.16, 0.16, 0.16, 0, 0, 0, body);
  const orbs = []; for (let i = 0; i < (p.orbs ?? 3); i++) orbs.push(part(SPH_LO, glowM(p.glow || 0x7fd8ff), 0.05, 0.05, 0.05, 0, 0, 0, body));
  let face = null; const rings = [];
  if (p.mask) { face = new THREE.Group(); face.position.z = 0.16; body.add(face); const mm = stylized({ color: p.mask, roughness: 0.35, metalness: 0.2 }, 0xffd0a0, 0.6); cm.emissive.multiplyScalar(0.4);
    part(new THREE.SphereGeometry(1, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mm, 0.3, 0.34, 0.16, 0, 0, 0, face).rotation.x = Math.PI / 2;
    horns(face, stylized({ color: 0xf4e8d0, roughness: 0.3 }, 0xffffff, 0.4), 0.2, 0.05, 0.15, 0.3, 0.4);
    for (const s of [-1, 1]) { part(SPH_LO, glowM(0xffe04a), 0.05, 0.03, 0.02, s * 0.1, 0.06, 0.15, face); const b = part(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x1a0505 }), 0.12, 0.025, 0.03, s * 0.1, 0.13, 0.14, face); b.rotation.z = s * 0.35; part(CONE, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }), 0.025, 0.08, 0.02, s * 0.06, -0.15, 0.13, face).rotation.x = Math.PI; } }
  if (p.eye) { const em = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 }); const eye = part(SPH, em, 0.2, 0.2, 0.2, 0, 0, 0.02, body); part(SPH_LO, glowM(p.eye), 0.1, 0.1, 0.04, 0, 0, 0.2, body); part(SPH_LO, new THREE.MeshBasicMaterial({ color: 0x000000 }), 0.045, 0.06, 0.02, 0, 0, 0.235, body);
    for (let i = 0; i < 2; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.34 + i * 0.1, 0.014, 6, 48), glowM(p.glow || 0xffe08a)); body.add(r); rings.push(r); } }
  return { group: g, mats: [cm], kind: 'spirit', anim(t, moving, m) { const ph = m.phase; body.position.y = Math.sin(t * 2 + ph) * 0.12; halo.scale.setScalar(0.95 + Math.sin(t * 5 + ph) * 0.12);
    orbs.forEach((o, i) => { const a = t * 2.5 + i * 2.09 + ph; o.position.set(Math.cos(a) * 0.35, Math.sin(a * 1.5) * 0.15, Math.sin(a) * 0.35); });
    rings.forEach((r, i) => { r.rotation.set(t * (0.8 + i * 0.5) + i, t * (0.5 - i), 0); }); if (face) face.rotation.y = Math.sin(t * 1.2 + ph) * 0.3;
    if (Math.random() < 0.45) emit(m.x + rr(-0.12, 0.12), m.T.y + body.position.y + 0.05, m.z + rr(-0.12, 0.12), rr(-0.2, 0.2), rr(0.6, 1.4), rr(-0.2, 0.2), C3(Math.random() < 0.6 ? (p.flame || m.T.color) : '#ffffff'), rr(0.15, 0.3), 0.55, -0.5, 0.95); } };
}
const SHARED = new Set([SPH, SPH_LO, CONE, CYL, wingGeo]);
const MAKERS = { jelly: makeJelly, fish: makeFish, serpent: makeSerpent, wraith: makeWraith, golem: makeGolem, bird: makeBird, scarab: makeScarab, spirit: makeSpirit };

// =====================================================================
// SCENERY — themed, animated props for the land / sky realms
// =====================================================================
function windy(m, amp, freq = 1.4) { const prev = m.onBeforeCompile; m.onBeforeCompile = s => { prev(s); s.uniforms.uTime = U.uTime;
    s.vertexShader = 'uniform float uTime;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float wh = max(position.y, 0.0); float wp = modelMatrix[3].x * 0.7 + modelMatrix[3].z * 0.4;
      transformed.x += sin(uTime * ${freq.toFixed(2)} + wp) * ${amp.toFixed(3)} * wh * wh; transformed.z += cos(uTime * ${(freq * 0.8).toFixed(2)} + wp) * ${(amp * 0.6).toFixed(3)} * wh * wh;`); };
  m.customProgramCacheKey = () => 'windy' + amp + freq; return m; }
const scenery = [];
function at(o, x, y, z) { o.position.set(x, y, z); return o; } // per-frame updaters for the current map
function prop(obj, x, z, r) { obj.position.set(x, obj.position.y, z); world.add(obj); if (r) { colliders.push({ x, z, r }); const b = blob(r * 3); b.position.set(x, 0.02, z); world.add(b); } return obj; }
function M_(hex, o = {}) { return stylized(Object.assign({ color: hex, roughness: 0.7, metalness: 0.05 }, o), o.rim ?? 0xffffff, o.rimS ?? 0.35, 2.4); }
function leafBlob(hex, s) { const m = M_(hex, { flatShading: true, rim: 0xe8ffd0, rimS: 0.3 }); return new THREE.Mesh(rockyGeo(s, 1, 0.45, s * 7), m); }

function palmTree(h) { const g = new THREE.Group(); const pts = []; const lean = rr(0.4, 1.0), dir = rr(0, 6.28);
  for (let i = 0; i <= 8; i++) { const k = i / 8; pts.push(new THREE.Vector3(Math.cos(dir) * lean * k * k, k * h, Math.sin(dir) * lean * k * k)); }
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.13, 7), windy(M_(0x8a6a44, { roughness: 0.9 }), 0.004)); g.add(trunk);
  for (let i = 1; i < 8; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.03, 4, 10), M_(0x6a4a2a)); r.position.copy(pts[i]); r.rotation.x = Math.PI / 2; g.add(r); }
  const top = pts[8]; const fm = windy(M_(0x3a8a3a, { side: THREE.DoubleSide, rim: 0xc8ff8a, rimS: 0.4 }), 0.03, 1.8);
  for (let i = 0; i < 9; i++) { const geo = new THREE.PlaneGeometry(0.42, 2.0, 1, 10); const p = geo.attributes.position; for (let j = 0; j < p.count; j++) { const y = p.getY(j) + 1; p.setXYZ(j, p.getX(j) * Math.sin(Math.min(1, y / 2) * Math.PI) * 1.1, y, -y * y * 0.22); } geo.computeVertexNormals();
    const f = new THREE.Mesh(geo, fm); f.position.copy(top); f.rotation.set(-0.9, i / 9 * 6.283, 0, 'YXZ'); g.add(f); }
  for (let i = 0; i < 3; i++) part(SPH_LO, M_(0x5a3a1a), 0.09, 0.09, 0.09, top.x + rr(-0.12, 0.12), top.y - 0.12, top.z + rr(-0.12, 0.12), g);
  return g; }
function obelisk(h, glyph) { const g = new THREE.Group(); const st = M_(0xc8a46a, { flatShading: true, rim: 0xffe0a0, rimS: 0.3 });
  part(new THREE.CylinderGeometry(0.28, 0.42, h, 4), st, 1, 1, 1, 0, h / 2 + 0.25, 0, g).rotation.y = Math.PI / 4;
  part(new THREE.ConeGeometry(0.3, 0.45, 4), M_(0xffd23a, { metalness: 0.9, roughness: 0.2, emissive: new THREE.Color(0x553300) }), 1, 1, 1, 0, h + 0.47, 0, g).rotation.y = Math.PI / 4;
  part(new THREE.BoxGeometry(1, 1, 1), st, 1.0, 0.25, 1.0, 0, 0.12, 0, g);
  const gm = new THREE.MeshBasicMaterial({ color: new THREE.Color(glyph).multiplyScalar(2) }); for (let i = 0; i < 7; i++) for (const s of [0, 1]) { const q = part(new THREE.BoxGeometry(1, 1, 1), gm, rr(0.05, 0.14), rr(0.06, 0.16), 0.02, rr(-0.1, 0.1), 0.6 + i * (h - 0.8) / 7, 0, g); q.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), s * Math.PI); q.position.z += s ? -0.3 : 0.3; }
  scenery.push(t => { gm.color.setRGB(...new THREE.Color(glyph).multiplyScalar(1.4 + Math.sin(t * 2 + h) * 0.8).toArray()); }); return g; }
function column(h, broken, mat) { const g = new THREE.Group(); const geo = new THREE.CylinderGeometry(0.32, 0.36, h, 20, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)); const k = 1 - 0.06 * Math.max(0, Math.cos(a * 10)); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } geo.computeVertexNormals();
  part(geo, mat, 1, 1, 1, 0, h / 2 + 0.2, 0, g); part(new THREE.CylinderGeometry(0.48, 0.5, 0.2, 16), mat, 1, 1, 1, 0, 0.1, 0, g);
  if (!broken) { part(new THREE.BoxGeometry(0.95, 0.16, 0.95), mat, 1, 1, 1, 0, h + 0.33, 0, g); part(new THREE.CylinderGeometry(0.46, 0.34, 0.2, 16), mat, 1, 1, 1, 0, h + 0.2, 0, g); }
  else { const top = part(rockyGeo(0.33, 0, 0.5, h), mat, 1, 0.5, 1, 0, h + 0.2, 0, g); } return g; }
function brazier(fire) { const g = new THREE.Group(); const br = M_(0x8a5a2a, { metalness: 0.8, roughness: 0.35 });
  part(CYL, br, 0.05, 0.9, 0.05, 0, 0.45, 0, g); part(new THREE.CylinderGeometry(0.32, 0.16, 0.22, 14, 1, true), br, 1, 1, 1, 0, 1.0, 0, g); part(SPH_LO, glowM(fire), 0.16, 0.1, 0.16, 0, 1.05, 0, g);
  for (let i = 0; i < 3; i++) { const l = part(CYL, br, 0.03, 0.5, 0.03, Math.cos(i * 2.1) * 0.15, 0.22, Math.sin(i * 2.1) * 0.15, g); l.rotation.set(Math.sin(i * 2.1) * 0.3, 0, -Math.cos(i * 2.1) * 0.3); }
  scenery.push(() => { if (Math.random() < 0.6) { const w = g.position; emit(w.x + rr(-0.12, 0.12), 1.12, w.z + rr(-0.12, 0.12), rr(-0.1, 0.1), rr(1.2, 2.4), rr(-0.1, 0.1), C3(Math.random() < 0.5 ? fire : '#ffe08a'), rr(0.3, 0.5), 0.6, -0.8, 0.96); } }); return g; }
function cypress(h) { const g = new THREE.Group(); part(CYL, M_(0x4a3424), 0.07, 0.6, 0.07, 0, 0.3, 0, g); const m = windy(M_(0x1f4a2a, { flatShading: true, rim: 0xb0ffb0, rimS: 0.25 }), 0.012);
  const geo = rockyGeo(1, 1, 0.3, h); part(geo, m, 0.38, h * 0.5, 0.38, 0, h * 0.5 + 0.4, 0, g); return g; }
function oliveTree() { const g = coralBranches(1.1, 0.12, 3, 0x6a5a48, 0x8aa070); const lm = windy(M_(0x8aa070, { flatShading: true, rim: 0xe0ffd0, rimS: 0.3 }), 0.02);
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(rockyGeo(rr(0.35, 0.55), 1, 0.4, i), lm); b.position.set(rr(-0.7, 0.7), rr(1.3, 1.9), rr(-0.7, 0.7)); b.scale.y = 0.65; g.add(b); } return g; }
function bambooClump(n) { const g = new THREE.Group(); const sm = windy(M_(0x6aa84a, { roughness: 0.45, rim: 0xd8ff9a, rimS: 0.4 }), 0.006, 1.6), nm = windy(M_(0x4a7a2a), 0.006, 1.6), lm = windy(M_(0x5aa040, { side: THREE.DoubleSide, flatShading: true }), 0.006, 1.6);
  for (let i = 0; i < n; i++) { const h = rr(4, 6.5), x = rr(-0.6, 0.6), z = rr(-0.6, 0.6); part(new THREE.CylinderGeometry(0.06, 0.075, h, 8).translate(0, h / 2, 0), sm, 1, 1, 1, x, 0, z, g);
    for (let k = 1; k < h / 0.7; k++) part(new THREE.TorusGeometry(0.07, 0.016, 4, 10).rotateX(Math.PI / 2).translate(0, k * 0.7, 0), nm, 1, 1, 1, x, 0, z, g);
    for (let k = 0; k < 6; k++) { const y = h * rr(0.55, 1); const lf = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.55).translate(0, 0.27, 0).rotateZ(rr(-2.3, -0.8)).rotateY(rr(0, 6.28)).translate(x, y, z), lm); g.add(lf); } } return g; }
function torii(c) { const g = new THREE.Group(); const rm = M_(c, { roughness: 0.5, rim: 0xffd0a0, rimS: 0.4 }), dm = M_(0x1a1010);
  for (const s of [-1, 1]) { part(CYL, rm, 0.17, 3.4, 0.17, s * 1.25, 1.7, 0, g); part(CYL, dm, 0.22, 0.3, 0.22, s * 1.25, 0.15, 0, g); }
  const top = part(new THREE.BoxGeometry(3.6, 0.22, 0.3), dm, 1, 1, 1, 0, 3.45, 0, g); part(new THREE.BoxGeometry(3.2, 0.18, 0.26), rm, 1, 1, 1, 0, 3.25, 0, g); part(new THREE.BoxGeometry(3.0, 0.16, 0.2), rm, 1, 1, 1, 0, 2.7, 0, g);
  return g; }
function lantern(glow) { const g = new THREE.Group(); const st = M_(0x8a8a80, { flatShading: true });
  part(new THREE.CylinderGeometry(0.22, 0.3, 0.15, 6), st, 1, 1, 1, 0, 0.08, 0, g); part(new THREE.CylinderGeometry(0.08, 0.1, 0.7, 6), st, 1, 1, 1, 0, 0.5, 0, g);
  part(new THREE.BoxGeometry(0.34, 0.3, 0.34), glowM(glow), 1, 1, 1, 0, 1.0, 0, g); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(CYL, st, 0.025, 0.32, 0.025, x * 0.18, 1.0, z * 0.18, g);
  part(new THREE.ConeGeometry(0.38, 0.28, 6), st, 1, 1, 1, 0, 1.3, 0, g); part(SPH_LO, st, 0.06, 0.08, 0.06, 0, 1.48, 0, g); return g; }
function blossomTree(col) { const g = coralBranches(1.3, 0.13, 3, 0x4a3030, col); const lm = windy(M_(col, { flatShading: true, emissive: new THREE.Color(col).multiplyScalar(0.12), rim: 0xffffff, rimS: 0.5 }), 0.02);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(rockyGeo(rr(0.4, 0.6), 1, 0.4, i + 3), lm); b.position.set(rr(-0.8, 0.8), rr(1.5, 2.2), rr(-0.8, 0.8)); b.scale.y = 0.6; g.add(b); }
  scenery.push(() => { if (Math.random() < 0.08) { const w = g.position; emit(w.x + rr(-1, 1), 2.2, w.z + rr(-1, 1), rr(-0.4, 0.4), -0.4, rr(-0.2, 0.2), C3(Math.random() < 0.7 ? '#ffb8d8' : '#ffffff'), 0.22, 3, 0.05, 0.995); } }); return g; }
function deadTree() { const g = coralBranches(1.4, 0.15, 3, 0x2a2420, 0x3a3020); const mm = windy(new THREE.MeshStandardMaterial({ color: 0x4a6a3a, side: THREE.DoubleSide, roughness: 1 }), 0.05, 1.2);
  for (let i = 0; i < 8; i++) { const h = rr(0.5, 1.1); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.06, h).translate(0, -h / 2, 0), mm); s.position.set(rr(-0.8, 0.8), rr(1.4, 2.0), rr(-0.8, 0.8)); s.rotation.y = rr(0, 3); g.add(s); } return g; }
function mushrooms(glow) { const g = new THREE.Group(); const cm = M_(glow, { emissive: new THREE.Color(glow).multiplyScalar(0.6), roughness: 0.4 }); const stm = M_(0xd8d0b8);
  for (let i = 0; i < 6; i++) { const h = rr(0.15, 0.5), x = rr(-0.5, 0.5), z = rr(-0.5, 0.5); part(CYL, stm, 0.035, h, 0.035, x, h / 2, z, g); part(new THREE.SphereGeometry(1, 12, 8, 0, 6.283, 0, 1.6), cm, h * 0.4 + 0.06, h * 0.25 + 0.04, h * 0.4 + 0.06, x, h, z, g); }
  scenery.push(t => { cm.emissiveIntensity = 0.8 + Math.sin(t * 1.7 + g.position.x) * 0.4; }); return g; }
function pine(h, snow) { const g = new THREE.Group(); part(CYL, M_(0x4a3424), 0.1, 0.8, 0.1, 0, 0.4, 0, g);
  const geoCol = (r, hh) => { const geo = new THREE.ConeGeometry(r, hh, 9, 3); const p = geo.attributes.position, c = []; const A = new THREE.Color(0x1f4a3a), B = new THREE.Color(snow); for (let i = 0; i < p.count; i++) { const k = (p.getY(i) / hh + 0.5); const s = k > 0.55 || (k < 0.2 && Math.random() < 0.5) ? 0.85 : 0; const t = A.clone().lerp(B, s); c.push(t.r, t.g, t.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; };
  const m = windy(M_(0xffffff, { vertexColors: true, flatShading: true, rim: 0xdff4ff, rimS: 0.3 }), 0.006); for (let k = 0; k < 4; k++) { const r = (1.1 - k * 0.22) * h / 4, hh = h * 0.38; part(geoCol(r, hh), m, 1, 1, 1, 0, 0.6 + k * h * 0.2 + hh / 2, 0, g); } return g; }
function runeStone(glow) { const g = new THREE.Group(); const st = M_(0x5a6470, { flatShading: true }); const h = rr(1.6, 2.4);
  const s = part(rockyGeo(0.5, 1, 0.25, h * 3), st, 0.7, h, 0.35, 0, h * 0.85, 0, g); s.rotation.z = rr(-0.08, 0.08);
  const gm = new THREE.MeshBasicMaterial({ color: new THREE.Color(glow).multiplyScalar(2) }); for (let i = 0; i < 5; i++) { const r = part(new THREE.BoxGeometry(1, 1, 1), gm, 0.03, rr(0.15, 0.3), 0.02, rr(-0.15, 0.15), 0.6 + i * h * 0.28, 0.2, g); r.rotation.z = rr(-0.7, 0.7); }
  scenery.push(t => { gm.color.setRGB(...new THREE.Color(glow).multiplyScalar(1.2 + Math.sin(t * 1.5 + h * 5) * 0.9).toArray()); }); return g; }
function iceSpire(c) { const g = new THREE.Group(); const m = M_(c, { roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.82, emissive: new THREE.Color(c).multiplyScalar(0.2), rim: 0xffffff, rimS: 1.1 });
  for (let i = 0; i < 6; i++) { const h = rr(0.8, 2.8); const o = part(new THREE.OctahedronGeometry(1, 0), m, rr(0.15, 0.32), h, rr(0.15, 0.32), rr(-0.4, 0.4), h * 0.6, rr(-0.4, 0.4), g); o.rotation.set(rr(-0.35, 0.35), rr(0, 3), rr(-0.35, 0.35)); } return g; }
function floatIsle(s) { const g = new THREE.Group(); part(rockyGeo(1, 1, 0.4, s), M_(0x9a8a7a, { flatShading: true }), 1.2 * s, 1.4 * s, 1.2 * s, 0, -0.7 * s, 0, g).scale.y *= -1;
  part(new THREE.CylinderGeometry(1.25 * s, 1.15 * s, 0.18 * s, 12), M_(0x9adf7a, { flatShading: true, rim: 0xffffe0 }), 1, 1, 1, 0, 0.02, 0, g);
  const tr = leafBlob(0xf0d070, 0.45 * s); tr.position.set(0.3 * s, 0.5 * s, 0); g.add(tr); part(CYL, M_(0x8a6a4a), 0.05 * s, 0.4 * s, 0.05 * s, 0.3 * s, 0.25 * s, 0, g); return g; }
function cloudPuff(s, hex = 0xd8d0c4) { const g = new THREE.Group(); const m = M_(hex, { emissive: new THREE.Color(hex).multiplyScalar(0.04), roughness: 1, rim: 0xffe8b0, rimS: 0.35 });
  for (let i = 0; i < 6; i++) part(SPH, m, rr(0.5, 0.9) * s, rr(0.35, 0.6) * s, rr(0.5, 0.9) * s, rr(-1, 1) * s, rr(0, 0.3) * s, rr(-0.6, 0.6) * s, g); return g; }
function goldPillar(h) { const g = column(h, false, M_(0xc8bca8, { roughness: 0.45, rim: 0xffe8a0, rimS: 0.3 })); const gm = glowM(0xffd86a);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 40), gm); ring.position.y = h + 1.0; ring.rotation.x = Math.PI / 2; g.add(ring); const orb = part(SPH_LO, gm, 0.14, 0.14, 0.14, 0, h + 1.0, 0, g);
  scenery.push(t => { ring.rotation.z = t; ring.position.y = h + 1.0 + Math.sin(t * 1.3 + h) * 0.1; orb.position.y = ring.position.y; }); return g; }
function aurora(c1, c2) { const m = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uA: { value: new THREE.Color(c1) }, uB: { value: new THREE.Color(c2) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: 'varying vec2 vUv; uniform float uTime; void main(){ vUv = uv; vec3 p = position; p.z += sin(p.x * 0.08 + uTime * 0.3) * 6.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: `uniform float uTime; uniform vec3 uA, uB; varying vec2 vUv; void main(){ float s = sin(vUv.x * 40.0 + uTime * 0.7) * 0.5 + 0.5; float f = sin(vUv.x * 13.0 - uTime * 0.4) * 0.5 + 0.5;
      float a = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.35, vUv.y) * (0.35 + 0.65 * s * f); gl_FragColor = vec4(mix(uA, uB, vUv.y + f * 0.3) * a * 0.55, 1.0); }` });
  const g = new THREE.Group(); for (let i = 0; i < 2; i++) { const a = new THREE.Mesh(new THREE.PlaneGeometry(90, 12, 60, 1), m); a.position.set(0, 16 + i * 3, -38 - i * 6); a.rotation.x = 0.35; g.add(a); } world.add(g); }
function wisps(n, hex, area = 16) { const mm = new THREE.SpriteMaterial({ map: haloTex, color: new THREE.Color(hex).multiplyScalar(1.6), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }); const list = [];
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(mm); s.scale.setScalar(rr(0.4, 0.8)); s.userData = { x: rr(-area, area), z: rr(-area, area), p: rr(0, 6.28) }; world.add(s); list.push(s); }
  scenery.push(t => { for (const s of list) { const u = s.userData; s.position.set(u.x + Math.sin(t * 0.3 + u.p) * 2, 1.2 + Math.sin(t * 1.1 + u.p) * 0.5, u.z + Math.cos(t * 0.25 + u.p) * 2); } }); }

// one builder per realm; underwater realms keep the template's coral seabed
const REALM = {
  desert(M) { const R = ringSpots();
    for (const [x, z] of R.mid.slice(0, 6)) prop(palmTree(rr(3.2, 4.4)), x, z, 0.35);
    for (const [x, z] of R.mid.slice(6, 10)) prop(obelisk(rr(2.6, 3.6), 0x6fe7ff), x, z, 0.5);
    for (const [x, z] of R.mid.slice(10)) prop(column(rr(0.8, 2), true, M_(0xd8b480, { flatShading: true })), x, z, 0.45);
    for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283 + 0.3, d = rr(32, 40); const py = part(new THREE.ConeGeometry(1, 1, 4), M_(0xd8b070, { flatShading: true, rim: 0xffe0a0, rimS: 0.4 }), rr(6, 10), rr(5, 8), rr(6, 10), Math.cos(a) * d, 0, Math.sin(a) * d); py.position.y = py.scale.y / 2 - 0.3; py.rotation.y = Math.PI / 4; world.add(py);
      part(new THREE.ConeGeometry(1, 1, 4), M_(0xffd23a, { metalness: 0.9, roughness: 0.2, emissive: new THREE.Color(0x553300) }), py.scale.x * 0.12, py.scale.y * 0.12, py.scale.z * 0.12, py.position.x, py.scale.y - 0.3 - py.scale.y * 0.06, py.position.z, world).rotation.y = Math.PI / 4; }
    duneRing(0xd8b070); },
  olympus(M) { const R = ringSpots(); const marble = M_(0xc8c2b6, { roughness: 0.55, rim: 0xfff0d0, rimS: 0.25 });
    for (const [x, z] of R.mid.slice(0, 7)) prop(column(rr(2.4, 3.4), Math.random() < 0.45, marble), x, z, 0.45);
    for (const [x, z] of R.mid.slice(7, 10)) prop(brazier('#ff9a3a'), x, z, 0.3);
    for (const [x, z] of R.mid.slice(10)) prop(Math.random() < 0.5 ? cypress(rr(2.5, 3.5)) : oliveTree(), x, z, 0.4);
    for (let k = 0; k < 18; k++) { const a = k / 18 * 6.283, d = rr(24, 29); world.add(at(Math.random() < 0.5 ? cypress(rr(3, 5)) : oliveTree(), Math.cos(a) * d, 0, Math.sin(a) * d)); }
    cliffRing(0x9a9488); },
  bamboo(M) { const R = ringSpots();
    for (const [x, z] of R.mid.slice(0, 6)) prop(bambooClump(ri(4, 7)), x, z, 0.6);
    for (const [x, z] of R.mid.slice(6, 9)) prop(lantern('#ffc870'), x, z, 0.3);
    for (const [x, z] of R.mid.slice(9)) prop(blossomTree(0xffa8c8), x, z, 0.4);
    const t = torii(0xd8301a); t.position.set(0, 0, 4); world.add(t);
    for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283, d = rr(23, 28); world.add(at(bambooClump(ri(5, 8)), Math.cos(a) * d, 0, Math.sin(a) * d)); }
    wisps(10, '#8ad8ff'); },
  swamp(M) { const R = ringSpots();
    for (const [x, z] of R.mid.slice(0, 7)) prop(deadTree(), x, z, 0.45);
    for (const [x, z] of R.mid.slice(7)) prop(mushrooms('#7dff9a'), x, z, 0);
    addSeaweed(-12, 3, 30, 3); addSeaweed(12, -6, 30, 3); addSeaweed(3, 14, 24, 3);
    for (let k = 0; k < 20; k++) { const a = k / 20 * 6.283, d = rr(23, 29); world.add(at(deadTree(), Math.cos(a) * d, 0, Math.sin(a) * d)); }
    wisps(16, '#9affb0'); },
  snow(M) { const R = ringSpots();
    for (const [x, z] of R.mid.slice(0, 8)) prop(pine(rr(3, 4.5), 0xf0f8ff), x, z, 0.45);
    for (const [x, z] of R.mid.slice(8, 11)) prop(runeStone('#6fe7ff'), x, z, 0.4);
    for (const [x, z] of R.mid.slice(11)) addRock(x, z, rr(0.6, 1.0), rr(0.5, 0.9), 1.3);
    for (let k = 0; k < 30; k++) { const a = k / 30 * 6.283, d = rr(23, 30); world.add(at(pine(rr(4, 6.5), 0xf0f8ff), Math.cos(a) * d, 0, Math.sin(a) * d)); }
    aurora(0x3aff9a, 0x8a5aff); },
  ice(M) { const R = ringSpots();
    for (const [x, z] of R.mid.slice(0, 9)) prop(iceSpire(0x9fe8ff), x, z, 0.5);
    for (const [x, z] of R.mid.slice(9)) addRock(x, z, rr(0.6, 1.0), rr(0.4, 0.7), 1.1);
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, d = rr(25, 31); const s = iceSpire(0xbff4ff); s.scale.setScalar(rr(2.5, 4)); s.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); world.add(s); }
    aurora(0x6affff, 0xff6ad8); },
  heaven(M) { const R = ringSpots();
    for (const [x, z] of R.mid.slice(0, 6)) prop(goldPillar(rr(2.6, 3.4)), x, z, 0.45);
    for (const [x, z] of R.mid.slice(6, 10)) prop(cloudPuff(rr(0.8, 1.2)), x, z, 0.6);
    const isles = []; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, d = rr(17, 26); const i = floatIsle(rr(0.9, 1.6)); i.position.set(Math.cos(a) * d, rr(5, 9), Math.sin(a) * d); world.add(i); isles.push(i); }
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, d = rr(24, 32); const c = cloudPuff(rr(2, 3.2)); c.position.set(Math.cos(a) * d, rr(-0.5, 0.5), Math.sin(a) * d); world.add(c); }
    scenery.push(t => isles.forEach((i, k) => { i.position.y += Math.sin(t * 0.6 + k) * 0.003; i.rotation.y = t * 0.03 + k; }));
    wisps(14, '#ffe08a'); }
};
function ringSpots() { const mid = []; for (let k = 0; k < 14; k++) { for (let tries = 0; tries < 30; tries++) { const a = rr(0, 6.283), d = rr(5, 19); const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (Math.hypot(x, z - 8) > 3.5 && Math.hypot(x, z + 14) > 4 && !collides(x, z, 1.4) && !MAPS[S.map].zones.some(zn => Math.hypot(x - zn.x, z - zn.z) < zn.r * 0.55)) { mid.push([x, z]); colliders.push({ x, z, r: 0.01 }); break; } } }
  return { mid }; }
function duneRing(hex) { const m = M_(hex, { roughness: 0.95, rim: 0xffe0a0, rimS: 0.3 }); for (let k = 0; k < 20; k++) { const a = k / 20 * 6.283, d = rr(25, 30); part(SPH, m, rr(5, 8), rr(1.2, 2.6), rr(3, 5), Math.cos(a) * d, -0.4, Math.sin(a) * d, world).rotation.y = -a; } }
function cliffRing(hex) { for (let k = 0; k < 22; k++) { const a = (k / 22) * 6.28, d = rr(26, 31); addRock(Math.cos(a) * d, Math.sin(a) * d, rr(2.2, 3.4), rr(2.5, 5), rr(1.0, 1.6)); } }
