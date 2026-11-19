
// =====================================================================
// MONSTERS 3D — original procedural designs, sized next to a 1.15-unit hero
// =====================================================================
function vcolSphere(seg, fn) { const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.66)); const p = g.attributes.position, cols = []; for (let i = 0; i < p.count; i++) { const c = fn(p.getX(i), p.getY(i), p.getZ(i)); cols.push(c.r, c.g, c.b); } g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); return g; }
const C = h => new THREE.Color(h);
const GEO = {};
function geo(key, make) { return GEO[key] || (GEO[key] = make()); }
function mobMat(params, rim, rs = 0.6) { return stylized(Object.assign({ roughness: 0.5, metalness: 0.15, emissive: 0x000000 }, params), rim, rs, 2.4); }
function finShape(w, h) { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(w, h); s.quadraticCurveTo(w * 0.3, h * 0.5, 0, h * 0.45); s.quadraticCurveTo(-w * 0.3, h * 0.5, -w, h); s.lineTo(0, 0); return new THREE.ShapeGeometry(s); }

function mkAngler() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const m = mobMat({ vertexColors: true }, 0xffb36b);
  const bg = geo('anglerBody', () => vcolSphere(20, (x, y, z) => { const c = C(0xd8a070).lerp(C(0x3a2214), clamp(y * 1.6 + 0.45, 0, 1)); if (Math.sin(x * 20 + z * 9) > 0.8) c.lerp(C(0x150a04), 0.5); return c; }));
  const b = new THREE.Mesh(bg, m); b.scale.set(0.3, 0.27, 0.42); body.add(b);
  const fin = mobMat({ color: 0xe8a060, side: THREE.DoubleSide, emissive: 0x5a2a0a, emissiveIntensity: 0.5 }, 0xffd0a0);
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(geo('spike', () => new THREE.ConeGeometry(0.025, 0.2, 5)), fin); const t = i / 5; s.position.set(0, 0.22 + Math.sin(t * Math.PI) * 0.05, 0.22 - t * 0.42); s.rotation.x = -0.45; s.scale.y = 0.7 + Math.sin(t * Math.PI) * 0.6; body.add(s); }
  const tail = new THREE.Group(); tail.position.z = -0.4; body.add(tail);
  const tf = new THREE.Mesh(geo('fin1', () => finShape(0.2, 0.32).rotateX(-Math.PI / 2).rotateZ(Math.PI / 2)), fin); tail.add(tf);
  const teeth = glowMat(0xfff8e8, 1.2); for (let i = 0; i < 6; i++) { const tt = new THREE.Mesh(geo('tooth', () => new THREE.ConeGeometry(0.012, 0.05, 4)), teeth); const a = (i / 5 - 0.5) * 1.6; tt.position.set(Math.sin(a) * 0.17, -0.05 + (i % 2 ? 0.05 : 0), 0.38 + Math.cos(a) * 0.02); tt.rotation.x = i % 2 ? Math.PI : 0; body.add(tt); }
  const eye = glowMat(0xffd84a, 2.4); for (const sd of [-1, 1]) { const e = new THREE.Mesh(geo('eye', () => new THREE.SphereGeometry(0.035, 8, 6)), eye); e.position.set(sd * 0.17, 0.1, 0.26); body.add(e); }
  const stalk = new THREE.Mesh(geo('stalk', () => new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.22, 0.2), new THREE.Vector3(0, 0.6, 0.35), new THREE.Vector3(0, 0.45, 0.62)), 10, 0.012, 5)), mobMat({ color: 0x3a2414 }, 0xffb36b));
  body.add(stalk); const lure = new THREE.Mesh(geo('lure', () => new THREE.SphereGeometry(0.06, 10, 8)), glowMat(0x7ffcff, 3.5)); lure.position.set(0, 0.45, 0.63); body.add(lure);
  return { g, body, mats: [m], tail, lure, kind: 'fish', h: 0.42, top: 0.85, anim(e, t) { tail.rotation.y = Math.sin(t * 7 + e.seed) * 0.5; body.rotation.y = Math.sin(t * 7 + e.seed) * 0.06; lure.scale.setScalar(0.85 + 0.25 * Math.sin(t * 5 + e.seed)); } };
}
function mkEel() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body); const N = 11; const segs3 = [];
  const m = mobMat({ color: 0x1d3f7a, metalness: 0.4, roughness: 0.3 }, 0x9fd0ff, 0.8); const spot = glowMat(0xffe14a, 2.6);
  for (let i = 0; i < N; i++) { const r = i === 0 ? 0.1 : 0.095 * (1 - i / N) + 0.025; const s = new THREE.Mesh(geo('eelseg', () => new THREE.SphereGeometry(1, 12, 8)), m); s.scale.set(r, r * 0.9, r * 1.5); body.add(s); segs3.push(s);
    if (i > 0 && i % 2 === 0) { const sp = new THREE.Mesh(geo('eelspot', () => new THREE.SphereGeometry(0.018, 6, 4)), spot); s.add(sp); sp.position.set(0, 0.85, 0); sp.scale.set(1 / r * 0.1, 1 / (r * 0.9) * 0.1, 1 / (r * 1.5) * 0.1); } }
  const eye = glowMat(0xffe14a, 2.6); for (const sd of [-1, 1]) { const e = new THREE.Mesh(geo('eye', () => new THREE.SphereGeometry(0.035, 8, 6)), eye); e.position.set(sd * 0.06, 0.05, 0.06); e.scale.setScalar(0.7); segs3[0].add(e); e.scale.setScalar(0.7 / 0.1); }
  return { g, body, mats: [m], kind: 'eel', h: 0.3, top: 0.6, anim(e, t) { for (let i = 0; i < N; i++) { const s = segs3[i]; s.position.set(Math.sin(t * 8 + e.seed - i * 0.6) * (0.02 + i * 0.012), 0, 0.3 - i * 0.075); } } };
}
const jellyShader = { vertexShader: `varying vec3 vN; varying vec3 vV; varying vec2 vUv; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 uC, uC2; uniform float uTime, uFlash; uniform vec3 uTint; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    void main(){ float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); float lines = 0.75 + 0.25 * sin(vUv.x * 6.2831 * 10.0);
      float spots = smoothstep(0.75, 1.0, sin(vUv.x * 62.0) * sin(vUv.y * 30.0 - uTime));
      vec3 col = mix(uC, uC2, vUv.y) * (0.08 + fr * 0.95) * lines + uC2 * spots * 0.35; col += uTint * (0.3 + fr) + vec3(0.5, 0.7, 1.0) * uFlash * 0.25; gl_FragColor = vec4(col, 1.0); }` };
const tentShader = { vertexShader: `uniform float uTime, uPh; varying float vY; void main(){ vec3 p = position; float k = -p.y; vY = k; p.x += sin(uTime * 2.4 + uPh + k * 3.0) * 0.18 * k; p.z += cos(uTime * 1.9 + uPh + k * 2.4) * 0.12 * k; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
  fragmentShader: `uniform vec3 uC; varying float vY; void main(){ gl_FragColor = vec4(uC * (1.0 - vY / 1.6) * 0.45, 1.0); }` };
function mkJelly(scale = 0.4, crown = false, hue = 0.8) {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const mat = new THREE.ShaderMaterial({ ...jellyShader, uniforms: { uC: { value: new THREE.Color().setHSL(hue + Math.random() * 0.08, 0.95, 0.5) }, uC2: { value: new THREE.Color().setHSL(0.52, 0.95, 0.5) }, uTime: U.uTime, uFlash: { value: 0 }, uTint: { value: new THREE.Color(0, 0, 0) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const bell = new THREE.Mesh(geo('bell', () => new THREE.SphereGeometry(0.62, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.55)), mat); body.add(bell);
  const inner = new THREE.Mesh(geo('bellin', () => new THREE.SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.6)), mat); inner.position.y = 0.05; body.add(inner);
  const core = new THREE.Mesh(geo('jcore', () => new THREE.SphereGeometry(0.11, 10, 8)), glowMat(mat.uniforms.uC2.value.getHex(), 2.0)); core.position.y = 0.15; body.add(core);
  const tmat = new THREE.ShaderMaterial({ ...tentShader, uniforms: { uC: { value: mat.uniforms.uC.value.clone().lerp(C(0xffffff), 0.15) }, uTime: U.uTime, uPh: { value: Math.random() * 6 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const tg = geo('tent', () => { const t = new THREE.PlaneGeometry(0.05, 1.6, 1, 10); t.translate(0, -0.8, 0); return t; });
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28, r = i % 2 ? 0.45 : 0.2; const t = new THREE.Mesh(tg, tmat); t.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r); t.rotation.y = a; t.scale.y = 0.7 + Math.random() * 0.5; body.add(t); }
  if (crown) { const gold = mobMat({ color: 0xffc84a, metalness: 1, roughness: 0.25 }, 0xfff0b0, 0.8); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; const sp = new THREE.Mesh(geo('crownsp', () => new THREE.ConeGeometry(0.06, 0.32, 5)), gold); sp.position.set(Math.cos(a) * 0.32, 0.6, Math.sin(a) * 0.32); body.add(sp); const gm = new THREE.Mesh(geo('gem', () => new THREE.OctahedronGeometry(0.05)), glowMat(0xff6ad8, 2.5)); gm.position.set(Math.cos(a) * 0.36, 0.5, Math.sin(a) * 0.36); body.add(gm); }
    const band = new THREE.Mesh(geo('crownband', () => new THREE.TorusGeometry(0.34, 0.035, 6, 28)), gold); band.rotation.x = Math.PI / 2; band.position.y = 0.48; body.add(band); }
  body.scale.setScalar(scale);
  return { g, body, mats: [], jmat: mat, kind: 'jelly', h: 0.6 * scale / 0.4, top: 1.0 * scale / 0.4, anim(e, t) { const p = Math.sin(t * 2.6 + e.seed); bell.scale.set(1 + p * 0.08, 1 - p * 0.12, 1 + p * 0.08); body.rotation.y = t * 0.3 + e.seed; body.position.y = Math.sin(t * 1.3 + e.seed) * 0.06; } };
}
function mkCrab() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const m = mobMat({ vertexColors: true, metalness: 0.25, roughness: 0.4 }, 0xffa070, 0.7);
  const bg = geo('crabBody', () => vcolSphere(18, (x, y, z) => C(0xff8a50).lerp(C(0x5a1206), clamp(-y * 1.5 + 0.6, 0, 1)).lerp(C(0x7a5a4a), Math.max(0, Math.sin(x * 9) * Math.sin(z * 9)) * 0.4)));
  const shell = new THREE.Mesh(bg, m); shell.scale.set(0.42, 0.2, 0.32); shell.position.y = 0.26; body.add(shell);
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(geo('rockbump', () => new THREE.DodecahedronGeometry(0.06)), mobMat({ color: 0x6a5a50, flatShading: true }, 0xffa070, 0.3)); const a = i / 6 * 6.28; r.position.set(Math.cos(a) * 0.2, 0.42, Math.sin(a) * 0.15); body.add(r); }
  const legM = mobMat({ color: 0xc0622e }, 0xffa070); const legs = [];
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const l = new THREE.Group(); l.position.set(sd * 0.32, 0.25, 0.15 - i * 0.12); const up = new THREE.Mesh(geo('leg1', () => { const c = new THREE.CylinderGeometry(0.025, 0.02, 0.28, 5); c.translate(0, 0.14, 0); return c; }), legM); up.rotation.z = -sd * 1.0; l.add(up);
    const lo = new THREE.Mesh(geo('leg2', () => { const c = new THREE.CylinderGeometry(0.02, 0.008, 0.3, 5); c.translate(0, -0.15, 0); return c; }), legM); lo.position.set(sd * 0.23, 0.15, 0); lo.rotation.z = sd * 0.35; l.add(lo); body.add(l); legs.push([l, sd, i]); }
  const claws = []; for (const sd of [-1, 1]) { const c = new THREE.Group(); c.position.set(sd * 0.34, 0.3, 0.3); const arm = new THREE.Mesh(geo('carm', () => { const k = new THREE.CylinderGeometry(0.04, 0.035, 0.25, 6); k.translate(0, 0.12, 0); return k; }), legM); arm.rotation.x = 1.0; c.add(arm);
    const pin = new THREE.Mesh(geo('claw', () => new THREE.SphereGeometry(0.12, 12, 8).scale(1, 0.7, 1.4)), m); pin.position.set(0, 0.15, 0.24); c.add(pin); const tip = new THREE.Mesh(geo('ctip', () => new THREE.ConeGeometry(0.04, 0.16, 5)), legM); tip.rotation.x = Math.PI / 2; tip.position.set(0, 0.18, 0.4); c.add(tip); body.add(c); claws.push(c); }
  const eye = glowMat(0x2a0a04, 1); for (const sd of [-1, 1]) { const st = new THREE.Mesh(geo('estalk', () => new THREE.CylinderGeometry(0.012, 0.012, 0.12, 4)), legM); st.position.set(sd * 0.08, 0.44, 0.22); body.add(st); const e = new THREE.Mesh(geo('ceye', () => new THREE.SphereGeometry(0.03, 6, 4)), eye); e.position.set(sd * 0.08, 0.51, 0.22); body.add(e); }
  return { g, body, mats: [m], kind: 'crab', h: 0.3, top: 0.75, anim(e, t) { legs.forEach(([l, sd, i]) => { l.rotation.x = Math.sin(t * 9 + i * 1.3 + (sd > 0 ? Math.PI : 0) + e.seed) * 0.35; }); claws.forEach((c, k) => { c.rotation.x = Math.sin(t * 2 + k) * 0.2; }); } };
}
function tentacleChain(n, r0, mat, parent) { const out = []; let prev = parent; for (let i = 0; i < n; i++) { const s = new THREE.Mesh(geo('tseg', () => new THREE.SphereGeometry(1, 10, 8)), mat); const r = r0 * (1 - i / n) + 0.02; s.scale.setScalar(r); s.position.set(0, -r0 * 1.2, 0); const holder = new THREE.Group(); holder.add(s); out.push(holder); } return out; }
function mkKraken() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const m = mobMat({ vertexColors: true, roughness: 0.35, metalness: 0.2 }, 0xff6ab0, 0.7);
  const hg = geo('krakenHead', () => vcolSphere(28, (x, y, z) => C(0x7a2a6a).lerp(C(0x2a0a2a), clamp(-y + 0.3, 0, 1)).lerp(C(0xff7ab8), Math.max(0, Math.sin(x * 12) * Math.sin(y * 12) - 0.7) * 2)));
  const head = new THREE.Mesh(hg, m); head.scale.set(0.75, 0.95, 0.75); head.position.y = 0.95; body.add(head);
  const eye = glowMat(0xffcc22, 3); for (const sd of [-1, 1]) { const e = new THREE.Mesh(geo('keye', () => new THREE.SphereGeometry(0.12, 12, 8)), eye); e.position.set(sd * 0.32, 0.75, 0.6); body.add(e); const p = new THREE.Mesh(geo('kpupil', () => new THREE.BoxGeometry(0.03, 0.16, 0.02)), new THREE.MeshBasicMaterial({ color: 0x000000 })); p.position.set(sd * 0.32, 0.75, 0.72); body.add(p); }
  const tm = mobMat({ color: 0x9a3a7a, roughness: 0.4 }, 0xff9ad8, 0.6); const tents = [];
  for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; const root = new THREE.Group(); root.position.set(Math.cos(a) * 0.45, 0.35, Math.sin(a) * 0.45); root.rotation.y = -a; body.add(root); let par = root; const chain = [];
    for (let i = 0; i < 7; i++) { const seg = new THREE.Group(); seg.position.set(i === 0 ? 0 : 0.2, 0, 0); const s = new THREE.Mesh(geo('tseg', () => new THREE.SphereGeometry(1, 10, 8)), tm); s.scale.setScalar(0.13 * (1 - i / 8) + 0.03); seg.add(s); par.add(seg); chain.push(seg); par = seg; }
    tents.push(chain); }
  return { g, body, mats: [m, tm], kind: 'boss', h: 0.9, top: 2.2, anim(e, t) { tents.forEach((ch, k) => ch.forEach((s, i) => { s.rotation.z = Math.sin(t * 1.6 + k + i * 0.6) * 0.25 - 0.12; s.rotation.y = Math.cos(t * 1.2 + k * 2 + i * 0.4) * 0.2; })); head.scale.y = 0.95 + Math.sin(t * 1.5) * 0.04; } };
}
function mkShark() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const m = stylized({ vertexColors: true, roughness: 0.3, metalness: 0.3, transparent: true, opacity: 0.85, emissive: 0x103040, emissiveIntensity: 1 }, 0x9ff0ff, 1.0, 2.0);
  const bg = geo('sharkBody', () => vcolSphere(28, (x, y, z) => C(0xdff8ff).lerp(C(0x2a5a7a), clamp(y * 1.5 + 0.4, 0, 1))));
  const b = new THREE.Mesh(bg, m); b.scale.set(0.45, 0.42, 1.25); body.add(b);
  const fin = stylized({ color: 0x4a8aaa, side: THREE.DoubleSide, emissive: 0x2a6a8a, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 }, 0xbff8ff, 1.0);
  const dorsal = new THREE.Mesh(geo('sdorsal', () => { const s = new THREE.Shape(); s.moveTo(-0.3, 0); s.quadraticCurveTo(0, 0.2, 0.2, 0.62); s.quadraticCurveTo(0.12, 0.2, 0.32, 0); s.lineTo(-0.3, 0); return new THREE.ShapeGeometry(s).rotateY(Math.PI / 2); }), fin); dorsal.position.set(0, 0.38, 0); body.add(dorsal);
  const tail = new THREE.Group(); tail.position.z = -1.15; body.add(tail); tail.add(new THREE.Mesh(geo('stail', () => finShape(0.45, 0.6).rotateX(-Math.PI / 2).rotateZ(Math.PI / 2)), fin));
  for (const sd of [-1, 1]) { const p = new THREE.Mesh(geo('spec', () => finShape(0.12, 0.45).rotateX(-Math.PI / 2)), fin); p.position.set(sd * 0.4, -0.15, 0.3); p.rotation.set(0, sd * 0.6, sd * 0.4); body.add(p); }
  const teeth = glowMat(0xffffff, 1.5); for (let i = 0; i < 10; i++) { const a = (i / 9 - 0.5) * 2.2; const tt = new THREE.Mesh(geo('stooth', () => new THREE.ConeGeometry(0.025, 0.08, 4)), teeth); tt.position.set(Math.sin(a) * 0.3, -0.12, 1.0 + Math.cos(a) * 0.12); tt.rotation.x = Math.PI; body.add(tt); }
  const eye = glowMat(0x9ff0ff, 3.2); for (const sd of [-1, 1]) { const e = new THREE.Mesh(geo('seye', () => new THREE.SphereGeometry(0.05, 8, 6)), eye); e.position.set(sd * 0.3, 0.1, 0.85); body.add(e); }
  return { g, body, mats: [m], kind: 'boss', h: 0.8, top: 1.8, anim(e, t) { tail.rotation.y = Math.sin(t * 4) * 0.4; body.rotation.y = Math.sin(t * 4) * 0.05; } };
}
function mkSerpent() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body); const N = 18; const sg = [];
  const m = mobMat({ vertexColors: true, metalness: 0.5, roughness: 0.3 }, 0x3affc0, 0.9);
  const bg = geo('serpSeg', () => vcolSphere(14, (x, y, z) => C(0x1a6a5a).lerp(C(0x9ff0c0), clamp(-y * 1.4 + 0.2, 0, 1))));
  const spine = mobMat({ color: 0x3affc0, emissive: 0x0a6a4a, emissiveIntensity: 1 }, 0xbfffe0);
  for (let i = 0; i < N; i++) { const s = new THREE.Group(); const r = i === 0 ? 0.3 : 0.26 * (1 - i / (N + 4)) + 0.05; const ball = new THREE.Mesh(bg, m); ball.scale.set(r, r * 0.9, r * 1.2); s.add(ball);
    if (i > 0 && i % 2) { const sp = new THREE.Mesh(geo('spine', () => new THREE.ConeGeometry(0.04, 0.22, 4)), spine); sp.position.y = r * 0.9; s.add(sp); } body.add(s); sg.push(s); }
  const horn = mobMat({ color: 0xe8e0c0, metalness: 0.3 }, 0xfff8e0); for (const sd of [-1, 1]) { const hh = new THREE.Mesh(geo('shorn', () => { const c = new THREE.ConeGeometry(0.05, 0.4, 6); c.translate(0, 0.2, 0); return c; }), horn); hh.position.set(sd * 0.14, 0.18, -0.05); hh.rotation.set(-0.9, 0, -sd * 0.3); sg[0].add(hh); }
  const eye = glowMat(0x3affc0, 3); for (const sd of [-1, 1]) { const e = new THREE.Mesh(geo('eye', () => new THREE.SphereGeometry(0.035, 8, 6)), eye); e.position.set(sd * 0.17, 0.1, 0.22); e.scale.setScalar(1.4); sg[0].add(e); }
  return { g, body, mats: [m], kind: 'boss', h: 0.55, top: 1.4, anim(e, t) { sg.forEach((s, i) => s.position.set(Math.sin(t * 3 - i * 0.5) * (0.05 + i * 0.03), Math.sin(t * 2 - i * 0.4) * 0.06, 0.9 - i * 0.2)); } };
}
function mkTurtle() {
  const g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  const shellM = stylized({ color: 0x2a1c1a, roughness: 0.6, metalness: 0.2, flatShading: true, emissive: 0xff4a0a, emissiveIntensity: 0.0 }, 0xff6a1a, 0.9, 2.2);
  const shell = new THREE.Mesh(geo('tshell', () => new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5)), shellM); shell.scale.set(1.0, 0.6, 1.15); shell.position.y = 0.3; body.add(shell);
  const lava = glowMat(0xff6a1a, 2.6); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; const c = new THREE.Mesh(geo('crack', () => new THREE.BoxGeometry(0.03, 0.03, 0.45)), lava); c.position.set(Math.cos(a) * 0.55, 0.62, Math.sin(a) * 0.6); c.rotation.y = -a; c.rotation.x = 0.4; body.add(c); }
  const vol = new THREE.Mesh(geo('tvol', () => new THREE.ConeGeometry(0.25, 0.35, 7)), shellM); vol.position.y = 0.95; body.add(vol); const vg = new THREE.Mesh(geo('tvg', () => new THREE.SphereGeometry(0.12, 8, 6)), lava); vg.position.y = 1.1; body.add(vg);
  const skin = mobMat({ color: 0x5a4a3a, roughness: 0.7 }, 0xff8a3a, 0.5);
  const head = new THREE.Mesh(geo('thead', () => new THREE.SphereGeometry(0.28, 14, 10).scale(1, 0.85, 1.3)), skin); head.position.set(0, 0.35, 1.15); body.add(head);
  for (const sd of [-1, 1]) { const e = new THREE.Mesh(geo('eye', () => new THREE.SphereGeometry(0.035, 8, 6)), lava); e.position.set(sd * 0.16, 0.45, 1.4); e.scale.setScalar(1.3); body.add(e); }
  const flips = []; for (const [x, z] of [[-0.85, 0.6], [0.85, 0.6], [-0.75, -0.6], [0.75, -0.6]]) { const f = new THREE.Mesh(geo('tflip', () => new THREE.SphereGeometry(0.3, 10, 6).scale(1.3, 0.3, 0.7)), skin); f.position.set(x, 0.15, z); body.add(f); flips.push(f); }
  return { g, body, mats: [skin], shellM, kind: 'boss', h: 0.6, top: 1.6, anim(e, t) { flips.forEach((f, k) => f.rotation.z = Math.sin(t * 2 + k * 1.5) * 0.25); shellM.emissiveIntensity = 0.15 + 0.1 * Math.sin(t * 3); } };
}
const MOB3 = {
  angler: () => mkAngler(), eel: () => mkEel(), jelly: () => mkJelly(0.38, false, 0.78), crab: () => mkCrab(),
  kraken: () => { const k = mkKraken(); k.body.scale.setScalar(1.1); return k; }, shark: () => mkShark(), serpent: () => { const s = mkSerpent(); s.body.scale.setScalar(1.3); return s; },
  jqueen: () => mkJelly(1.05, true, 0.82), turtle: () => mkTurtle()
};
function spawnMob3(e) {
  const v = MOB3[e.t](); const sc = ET[e.t].boss ? 1 : 1; v.g.scale.setScalar(sc);
  const sh = blob(ET[e.t].boss ? 2.2 : 0.9); scene.add(sh); v.shadow = sh; scene.add(v.g);
  const el = document.createElement('div'); el.className = 'lbl'; el.innerHTML = (ET[e.t].label ? `<div class="ename">${ET[e.t].name}</div>` : '') + `<div class="ebar${ET[e.t].boss ? ' b' : ''}"><i></i></div>`; labelsEl.appendChild(el);
  v.el = el; v.bar = el.querySelector('i'); v.face = 0; e.v = v;
  if (v.jmat) v.isJelly = true;
}
function removeMob3(e, dying) {
  const v = e.v; if (!v) return; v.el.remove();
  if (dying) { v.dieT = 0.35; dyingMobs.push(v); } else { scene.remove(v.g); scene.remove(v.shadow); }
  e.v = null;
}
const dyingMobs = [];
function updDying(dt) { for (const v of dyingMobs) { v.dieT -= dt; const k = Math.max(0, v.dieT / 0.35); v.g.scale.setScalar(0.2 + 0.8 * k); v.g.position.y += dt * 0.8; if (v.dieT <= 0) { scene.remove(v.g); scene.remove(v.shadow); } } for (let i = dyingMobs.length - 1; i >= 0; i--) if (dyingMobs[i].dieT <= 0) dyingMobs.splice(i, 1); }
const TINT = new THREE.Color();
function syncMob3(e, dt, t) {
  const v = e.v; if (!v) return;
  const p = V(e.x, e.y, 0);
  // face direction of travel
  const ahead = posAt(Math.min(PATH_LEN, e.d + 8)); const want = Math.atan2(ahead.x - (e.x - e.ox), ahead.y - (e.y - e.oy)); let d = want - v.face; d = Math.atan2(Math.sin(d), Math.cos(d)); v.face += d * Math.min(1, dt * 6);
  v.g.position.set(p.x, v.h - (v.kind === 'crab' ? v.h : 0) + (v.kind === 'boss' ? 0 : 0), p.z);
  if (v.kind !== 'crab') v.g.position.y = v.kind === 'jelly' ? v.h * 0.6 : v.h * 0.5;
  v.g.rotation.y = v.face;
  v.shadow.position.set(p.x, 0.03, p.z);
  if (!(e.frzT > 0) && !(e.stunT > 0)) v.anim(e, t);
  // tint: hit flash, frozen, burning, shocked
  TINT.setRGB(0, 0, 0);
  if (e.frzT > 0) TINT.setRGB(0.25, 0.6, 0.9); else if (e.burnT > 0) TINT.setRGB(0.5, 0.15, 0.0).multiplyScalar(0.7 + 0.3 * Math.sin(t * 20)); else if (e.shockT > 0) TINT.setRGB(0.35, 0.25, 0.6).multiplyScalar(0.5 + 0.5 * Math.random());
  if (e.hitT > 0) TINT.addScalar(0.6);
  if (v.isJelly) { v.jmat.uniforms.uTint.value.copy(TINT); } else for (const m of v.mats) m.emissive.copy(TINT);
  const top = V(e.x, e.y, v.top);
  const [sx, sy, vis] = toScreen(top);
  if (!vis) v.el.style.display = 'none'; else { v.el.style.display = ''; v.el.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-100%)`; }
  v.bar.style.transform = `scaleX(${Math.max(0, e.hp / e.max)})`;
}
function eh(e) { return e.v ? (e.v.kind === 'jelly' ? e.v.h * 0.6 : e.v.h * 0.5) + (e.v.kind === 'boss' ? 0.5 : 0.1) : 0.4; }
