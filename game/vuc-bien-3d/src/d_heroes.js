
// =====================================================================
// HEROES 3D — one CC0 mannequin rig, five original armor sets built in code
// =====================================================================
const HERO_H = 1.15;
const HPAL = {
  thunder: { plate: 0xc9cadb, dark: 0x55536e, trim: 0xf0c040, accent: 0xb98cff, cape: 0x5a2aa0, suit: 0x1c1a33, rim: 0xc8b0ff, helm: 'wing', weapon: 'spear', shield: true },
  fire: { plate: 0xa8322a, dark: 0x3a0c0a, trim: 0xe8b94a, accent: 0xff7a1a, cape: 0x4a0808, suit: 0x200606, rim: 0xff9a5a, helm: 'horn', weapon: 'greatsword' },
  ice: { plate: 0x4a7ed0, dark: 0x16305e, trim: 0xe2ecff, accent: 0x6fe8ff, cape: 0x1a2e6a, suit: 0x0b1a3e, rim: 0x9ff4ff, helm: 'hood', weapon: 'staff' },
  elf: { plate: 0x2f9a52, dark: 0x0f3a1c, trim: 0xf2d27a, accent: 0x7dff9a, cape: 0x1f7a44, suit: 0x0b2614, rim: 0xb0ffb0, helm: 'hair', weapon: 'bow', slim: true },
  holy: { plate: 0xeee4c8, dark: 0x8a7a50, trim: 0xffd85a, accent: 0xffd85a, cape: 0xf2e6c0, suit: 0x3a3020, rim: 0xfff0b0, helm: 'circlet', weapon: 'orbstaff' }
};
const WING_COL = { thunder: [0xffffff, 0x8a6aff, 0xe0d0ff], fire: [0xffe0a0, 0xff3a0a, 0xffb050], ice: [0xeafcff, 0x2f8bff, 0x9ff0ff], elf: [0xf0ffd8, 0x2ab85a, 0xb0ffb0], holy: [0xfffbe8, 0xffb820, 0xfff0a0] };
const wingFrag = `uniform float uTime, uB; uniform vec3 uRoot, uTip, uEdge; varying vec2 vP;
  float layer(vec2 p, float t0, float t1, float N, float L0, float L1, float wob, out float shaft, out float rr){
    float r = length(p); float th = atan(p.y, p.x); float s = (th - t0) / (t1 - t0); shaft = 0.0; rr = 0.0;
    if (s < 0.0 || s > 1.0) return 0.0;
    float fi = floor(s * N); float fs = fract(s * N); float sc = (fi + 0.5) / N;
    float L = mix(L0, L1, pow(sc, 1.25)) * (1.0 + sin(uTime * 2.2 + fi * 0.7) * wob);
    float w = 1.0 - pow(abs(fs - 0.5) * 2.0, 2.2); float tipR = L * (0.78 + 0.22 * w);
    float inside = smoothstep(tipR, tipR - 0.05, r) * smoothstep(0.0, 0.12, fs) * smoothstep(1.0, 0.88, fs);
    shaft = exp(-pow((fs - 0.5) * 9.0, 2.0)) * inside; rr = clamp(r / L, 0.0, 1.0);
    float edge = smoothstep(tipR - 0.22, tipR - 0.02, r) * inside;
    return inside * (0.55 + 0.45 * sin(fs * 3.14159)) + edge * 0.9; }
  void main(){ float sh1, r1, sh2, r2, sh3, r3;
    float a1 = layer(vP, -1.9, 0.85, 12.0, 1.0, 2.75, 0.02, sh1, r1); float a2 = layer(vP, -1.6, 0.95, 10.0, 0.6, 1.45, 0.03, sh2, r2); float a3 = layer(vP, -1.2, 1.05, 8.0, 0.32, 0.7, 0.04, sh3, r3);
    vec3 c1 = mix(uRoot, uTip, smoothstep(0.1, 1.0, r1)); vec3 c2 = mix(uRoot, uEdge, r2);
    vec3 col = c1 * (a1 * 0.32 + sh1 * 0.5) + c2 * (a2 * 0.36 + sh2 * 0.4) + uRoot * (a3 * 0.3 + sh3 * 0.15);
    float r = length(vP); float th = atan(vP.y, vP.x); col += uEdge * exp(-pow((th - 0.9) * 7.0, 2.0)) * smoothstep(1.9, 0.2, r) * step(0.05, r) * 0.6;
    col *= 0.9 + 0.1 * sin(uTime * 3.0 + r * 6.0); gl_FragColor = vec4(col * uB, 1.0); }`;
const wingGeo = new THREE.PlaneGeometry(3.2, 4.2); wingGeo.translate(1.45, 0.6, 0);
function makeWingMat(type) { const c = WING_COL[type]; return new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uRoot: { value: new THREE.Color(c[0]) }, uTip: { value: new THREE.Color(c[1]) }, uEdge: { value: new THREE.Color(c[2]) }, uB: { value: 0.6 } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: wingFrag }); }

function heroMaterials(pal) {
  return {
    suit: stylized({ color: pal.suit, roughness: 0.75 }, pal.rim, 0.25, 3),
    plate: stylized({ color: pal.plate, metalness: 0.85, roughness: 0.3, envMapIntensity: 1.2 }, pal.rim, 0.45, 2.6),
    dark: stylized({ color: pal.dark, metalness: 0.8, roughness: 0.36, envMapIntensity: 1.0 }, pal.rim, 0.35, 2.6),
    trim: stylized({ color: pal.trim, metalness: 1.0, roughness: 0.28, envMapIntensity: 1.5 }, 0xffe0a0, 0.45, 2.4),
    cape: stylized({ color: pal.cape, roughness: 0.7, side: THREE.DoubleSide, emissive: pal.cape, emissiveIntensity: 0.25, transparent: !!pal.slim, opacity: pal.slim ? 0.75 : 1 }, pal.rim, 0.5, 2),
    glow: glowMat(pal.accent, 2.6),
    blade: stylized({ color: 0xdfe8f4, metalness: 0.95, roughness: 0.15, envMapIntensity: 1.8 }, pal.accent, 0.9, 1.8),
    skin: stylized({ color: 0xf0cdb0, roughness: 0.6 }, 0xffe0c0, 0.2),
    hair: stylized({ color: 0xf2dc8a, roughness: 0.5, metalness: 0.1 }, 0xfff4c0, 0.5)
  };
}
function buildArmor(model, pal, M) {
  model.updateMatrixWorld(true);
  const bone = n => model.getObjectByName(n);
  const P = n => bone(n).getWorldPosition(new THREE.Vector3());
  const Y = new THREE.Vector3(0, 1, 0);
  const fwd = P('ball_l').sub(P('foot_l')).setY(0).normalize();
  const right = new THREE.Vector3().crossVectors(Y, fwd).normalize();
  const basis = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, Y, fwd));
  const put = (b, geo, mat, pos, q) => { const m = new THREE.Mesh(geo, mat); m.position.copy(pos); m.quaternion.copy(basis); if (q) m.quaternion.multiply(q); bone(b).attach(m); return m; };
  const off = (p, x, y, z) => p.clone().addScaledVector(right, x).addScaledVector(Y, y).addScaledVector(fwd, z);
  const eul = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
  const seg = (a, b, rT, rB, mat, len = 1) => { const A = P(a), B = P(b); const d = B.clone().sub(A); const L = d.length() * len; const g = new THREE.CylinderGeometry(rB, rT, L, 10, 1); g.translate(0, L / 2, 0); const m = new THREE.Mesh(g, mat); m.position.copy(A); m.quaternion.setFromUnitVectors(Y, d.normalize()); bone(a).attach(m); return m; };
  const slim = pal.slim ? 0.8 : 1;
  for (const s of ['l', 'r']) {
    const side = P('upperarm_' + s).sub(P('spine_03')).dot(right) > 0 ? 1 : -1; const sh = P('upperarm_' + s);
    const nl = pal.slim ? 1 : 3;
    for (let i = 0; i < nl; i++) { const g = new THREE.SphereGeometry((0.135 - i * 0.012) * slim, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55); g.scale(1.15, 0.8, 1.05); put('upperarm_' + s, g, i === 0 ? M.plate : M.dark, off(sh, side * (0.03 + i * 0.025), 0.06 - i * 0.05, 0), eul(0, 0, -side * (0.35 + i * 0.12))); }
    const trim = put('upperarm_' + s, new THREE.TorusGeometry(0.13 * slim, 0.012, 6, 20), M.trim, off(sh, side * 0.03, 0.05, 0), eul(Math.PI / 2, 0, -side * 0.35)); trim.scale.set(1.15, 1.05, 1);
    if (pal.helm === 'horn' || pal.helm === 'wing') for (let k = 0; k < 2; k++) put('upperarm_' + s, new THREE.ConeGeometry(0.022, 0.16 - k * 0.04, 6), M.trim, off(sh, side * (0.1 + k * 0.03), 0.15 - k * 0.03, -0.02 + k * 0.05), eul(0, 0, -side * (0.55 + k * 0.2)));
    if (pal.helm === 'hood') put('upperarm_' + s, new THREE.OctahedronGeometry(0.06).scale(0.6, 1.8, 0.6), M.glow, off(sh, side * 0.08, 0.16, 0), eul(0, 0, -side * 0.4));
    seg('upperarm_' + s, 'lowerarm_' + s, 0.052 * slim, 0.048 * slim, M.dark, 0.85);
    put('lowerarm_' + s, new THREE.SphereGeometry(0.05 * slim, 10, 8), M.plate, P('lowerarm_' + s));
    seg('lowerarm_' + s, 'hand_' + s, 0.058 * slim, 0.045 * slim, M.plate, 1.0);
    { const A = P('lowerarm_' + s), B = P('hand_' + s); const c = new THREE.Mesh(new THREE.TorusGeometry(0.058 * slim, 0.011, 6, 16).rotateX(Math.PI / 2), M.trim); c.position.lerpVectors(A, B, 0.82); c.quaternion.setFromUnitVectors(Y, B.clone().sub(A).normalize()); bone('lowerarm_' + s).attach(c); }
    put('hand_' + s, new THREE.SphereGeometry(0.045, 10, 8).scale(1, 0.8, 1.3), M.dark, P('hand_' + s).lerp(P('middle_01_' + s), 0.5));
    seg('thigh_' + s, 'calf_' + s, 0.07 * slim, 0.078 * slim, M.dark, 0.92);
    const knee = P('calf_' + s); put('calf_' + s, new THREE.SphereGeometry(0.058 * slim, 10, 8), M.plate, off(knee, 0, 0, 0.03));
    seg('calf_' + s, 'foot_' + s, 0.06 * slim, 0.05 * slim, M.plate, 1.0);
    { const A = P('foot_' + s), B = P('ball_' + s); const g = new THREE.BoxGeometry(0.085, 0.07, A.distanceTo(B) + 0.06); const m = new THREE.Mesh(g, M.plate); m.position.lerpVectors(A, B, 0.5).addScaledVector(Y, -0.02); m.quaternion.copy(basis); bone('foot_' + s).attach(m); }
  }
  const chest = P('spine_03'), neck = P('neck_01'), pel = P('pelvis');
  put('spine_03', new THREE.SphereGeometry(0.17, 22, 14).scale(1.2 * slim, 1.12, 0.82), M.plate, off(chest, 0, 0.05, 0.02));
  put('spine_03', new THREE.TorusGeometry(0.075, 0.018, 8, 18), M.trim, off(neck, 0, -0.03, 0), eul(Math.PI / 2, 0, 0));
  put('spine_03', new THREE.OctahedronGeometry(0.035).scale(1, 1.4, 0.6), M.glow, off(chest, 0, 0.08, 0.15));
  put('spine_03', new THREE.BoxGeometry(0.018, 0.2, 0.02), M.trim, off(chest, 0, 0.02, 0.155), eul(-0.25, 0, 0));
  put('spine_02', new THREE.CylinderGeometry(0.155 * slim, 0.15 * slim, 0.08, 16), M.dark, off(P('spine_02'), 0, -0.02, 0));
  put('spine_01', new THREE.CylinderGeometry(0.15 * slim, 0.155 * slim, 0.08, 16), M.dark, off(P('spine_01'), 0, 0.02, 0));
  put('pelvis', new THREE.TorusGeometry(0.16 * slim, 0.022, 8, 22).scale(1, 1, 0.8), M.trim, off(pel, 0, 0.05, 0), eul(Math.PI / 2, 0, 0));
  for (let i = -2; i <= 2; i++) { const a = i * 0.5; const g = pal.slim ? new THREE.SphereGeometry(0.07, 8, 6).scale(0.8, 2.2, 0.25) : new THREE.BoxGeometry(0.11, 0.24, 0.015); g.translate(0, -0.12, 0);
    const host = i === 0 ? 'pelvis' : (P('thigh_l').sub(pel).dot(right) * Math.sin(a) > 0 ? 'thigh_l' : 'thigh_r');
    put(host, g, i % 2 ? M.dark : M.plate, off(pel, Math.sin(a) * 0.15, 0.02, Math.cos(a) * 0.14), eul(0.22, a, 0)); }
  { const len = pal.slim ? 0.6 : 1.0; const g = new THREE.CylinderGeometry(0.2, 0.34, len, 16, 6, true, Math.PI * 0.62, Math.PI * 0.76); g.translate(0, -len / 2, 0);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, p.getZ(i) - y * y * 0.12); } g.computeVertexNormals();
    put('spine_03', g, M.cape, off(chest, 0, 0.12, -0.05)); }
  // helmets
  const head = P('Head'); const hc = off(head, 0, 0.1, 0.02);
  if (pal.helm === 'hair' || pal.helm === 'circlet') {
    put('Head', new THREE.SphereGeometry(0.11, 18, 14).scale(1, 1.15, 1.1), M.skin, hc);
    if (pal.helm === 'hair') { put('Head', new THREE.SphereGeometry(0.125, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.6).scale(1.05, 1.15, 1.12), M.hair, off(hc, 0, 0.01, -0.01));
      const tail = new THREE.CylinderGeometry(0.07, 0.02, 0.5, 8); tail.translate(0, -0.25, 0); put('Head', tail, M.hair, off(hc, 0, 0.02, -0.11), eul(0.25, 0, 0));
      for (const sd of [-1, 1]) put('Head', new THREE.ConeGeometry(0.025, 0.12, 5), M.skin, off(hc, sd * 0.11, 0.02, -0.01), eul(0, 0, -sd * 1.2)); }
    else { put('Head', new THREE.SphereGeometry(0.12, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1.05, 1.1, 1.12), M.hair, off(hc, 0, 0.01, -0.012));
      const veil = new THREE.CylinderGeometry(0.12, 0.2, 0.45, 14, 1, true, Math.PI * 0.55, Math.PI * 0.9); veil.translate(0, -0.2, 0); put('Head', veil, M.cape, off(hc, 0, 0.03, -0.01));
      const halo = put('Head', new THREE.TorusGeometry(0.15, 0.012, 6, 28), M.glow, off(hc, 0, 0.2, -0.04), eul(Math.PI / 2 - 0.3, 0, 0)); }
    put('Head', new THREE.TorusGeometry(0.115, 0.01, 6, 24), M.trim, off(hc, 0, 0.04, 0), eul(Math.PI / 2 + 0.15, 0, 0));
    put('Head', new THREE.OctahedronGeometry(0.02), M.glow, off(hc, 0, 0.055, 0.115));
  } else if (pal.helm === 'hood') {
    put('Head', new THREE.SphereGeometry(0.135, 18, 14).scale(1, 1.18, 1.15), M.plate, hc);
    put('Head', new THREE.SphereGeometry(0.1, 14, 10).scale(1, 1.05, 0.5), new THREE.MeshBasicMaterial({ color: 0x02040a }), off(hc, 0, -0.01, 0.08));
    for (const sd of [-1, 1]) put('Head', new THREE.SphereGeometry(0.014, 6, 4).scale(1.4, 0.6, 1), M.glow, off(hc, sd * 0.035, 0.0, 0.125));
    put('Head', new THREE.OctahedronGeometry(0.045).scale(0.6, 1.8, 0.6), M.glow, off(hc, 0, 0.19, 0.03));
  } else {
    put('Head', new THREE.SphereGeometry(0.125, 22, 14).scale(1, 1.1, 1.12), M.plate, hc);
    put('Head', new THREE.BoxGeometry(0.13, 0.014, 0.02), M.glow, off(hc, 0, -0.005, 0.128));
    if (pal.helm === 'horn') for (const sd of [-1, 1]) { const hg = new THREE.ConeGeometry(0.03, 0.26, 8); hg.translate(0, 0.13, 0); put('Head', hg, M.trim, off(hc, sd * 0.1, 0.06, -0.01), eul(-0.3, 0, -sd * 0.7)); }
    else { const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.quadraticCurveTo(0.08, 0.1, 0.22, 0.12); fin.quadraticCurveTo(0.12, 0.04, 0.2, -0.02); fin.quadraticCurveTo(0.1, -0.01, 0, -0.04); fin.lineTo(0, 0);
      const wg = new THREE.ExtrudeGeometry(fin, { depth: 0.01, bevelEnabled: false }); for (const sd of [-1, 1]) put('Head', wg, M.trim, off(hc, sd * 0.12, 0.02, -0.02), eul(0, sd > 0 ? -2.6 : -0.54, sd * 0.15)); }
    put('Head', new THREE.BoxGeometry(0.02, 0.1, 0.16), M.trim, off(hc, 0, 0.12, -0.01));
  }
  // weapons — grip axis runs across the knuckles
  const hand = s => { const k = P('index_01_' + s).lerp(P('pinky_01_' + s), 0.5); return { grip: P('index_01_' + s).sub(P('pinky_01_' + s)).normalize(), palm: P('hand_' + s).lerp(k, 0.6) }; };
  const wpn = new THREE.Group(); const tip = new THREE.Object3D(); const r = hand('r');
  const addW = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; wpn.add(m); return m; };
  if (pal.weapon === 'greatsword') {
    const S = new THREE.Shape(); S.moveTo(-0.04, 0); S.lineTo(0.04, 0); S.lineTo(0.035, 0.9); S.lineTo(0, 1.04); S.lineTo(-0.035, 0.9); S.lineTo(-0.04, 0);
    const b = new THREE.Mesh(new THREE.ExtrudeGeometry(S, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }), M.blade); b.position.set(0, 0.16, -0.006); wpn.add(b);
    addW(new THREE.PlaneGeometry(0.014, 0.8), M.glow, 0.6).position.z = 0.021;
    addW(new THREE.BoxGeometry(0.28, 0.035, 0.05), M.trim, 0.14); addW(new THREE.CylinderGeometry(0.016, 0.016, 0.24, 8), M.dark, 0.01); addW(new THREE.OctahedronGeometry(0.032), M.glow, -0.13); tip.position.y = 1.15;
  } else if (pal.weapon === 'spear') {
    addW(new THREE.CylinderGeometry(0.014, 0.014, 1.5, 8), M.trim, 0.25);
    addW(new THREE.ConeGeometry(0.045, 0.26, 4).scale(1, 1, 0.35), M.blade, 1.12); addW(new THREE.OctahedronGeometry(0.03).scale(1, 1.6, 1), M.glow, 0.96); tip.position.y = 1.25;
  } else if (pal.weapon === 'staff' || pal.weapon === 'orbstaff') {
    addW(new THREE.CylinderGeometry(0.014, 0.016, 1.5, 8), pal.weapon === 'staff' ? M.trim : M.trim, 0.3);
    if (pal.weapon === 'staff') { for (const sd of [-1, 1]) { const c = new THREE.TorusGeometry(0.06, 0.008, 6, 12, Math.PI); const m = addW(c, M.trim, 1.08); m.rotation.z = sd > 0 ? 0 : Math.PI; m.rotation.y = Math.PI / 2; }
      addW(new THREE.OctahedronGeometry(0.06).scale(0.7, 1.4, 0.7), M.glow, 1.12); }
    else { addW(new THREE.TorusGeometry(0.075, 0.01, 6, 20), M.trim, 1.12); addW(new THREE.SphereGeometry(0.05, 14, 10), M.glow, 1.12); }
    tip.position.y = 1.12;
  } else if (pal.weapon === 'bow') {
    const l = hand('l'); const bow = new THREE.Group();
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, -0.42, 0), new THREE.Vector3(0, 0, -0.26), new THREE.Vector3(0, 0.42, 0));
    bow.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.012, 6), M.trim));
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.84, 4), M.glow); bow.add(str);
    bow.position.copy(l.palm); bow.quaternion.setFromUnitVectors(Y, l.grip); bone('hand_l').attach(bow);
    const t2 = new THREE.Object3D(); t2.position.copy(l.palm); bone('hand_l').attach(t2);
    model.userData.tip = t2; model.userData.weapon = bow;
  }
  if (pal.weapon !== 'bow') { wpn.add(tip); wpn.position.copy(r.palm).addScaledVector(r.grip, -0.03); wpn.quaternion.setFromUnitVectors(Y, r.grip); bone('hand_r').attach(wpn); model.userData.tip = tip; model.userData.weapon = wpn; }
  if (pal.shield) { const l = hand('l'); const sg = new THREE.Group(); const S = new THREE.Shape(); S.moveTo(-0.14, 0.18); S.lineTo(0.14, 0.18); S.lineTo(0.15, -0.02); S.lineTo(0, -0.22); S.lineTo(-0.15, -0.02); S.lineTo(-0.14, 0.18);
    sg.add(new THREE.Mesh(new THREE.ExtrudeGeometry(S, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.012, bevelSegments: 1 }), M.plate));
    const em = new THREE.Mesh(new THREE.OctahedronGeometry(0.05).scale(0.6, 1.3, 0.4), M.glow); em.position.z = 0.05; sg.add(em);
    sg.position.copy(P('lowerarm_l').lerp(P('hand_l'), 0.55)).addScaledVector(right, P('hand_l').sub(P('spine_03')).dot(right) > 0 ? 0.06 : -0.06); sg.quaternion.copy(basis); sg.rotateY(P('hand_l').sub(P('spine_03')).dot(right) > 0 ? Math.PI / 2 : -Math.PI / 2); bone('lowerarm_l').attach(sg); }
  model.traverse(o => { if (o.isSkinnedMesh) { o.material = M.suit; } if (o.isMesh) o.frustumCulled = false; });
}

const HERO3D = [];
let heroAssetsReady = false, heroGLTF = null;
fetch('assets/hero.json').then(r => r.json()).then(j => {
  const bin = Uint8Array.from(atob(j.data), c => c.charCodeAt(0));
  return new Promise((res, rej) => new GLTFLoader().parse(bin.buffer, '', res, rej));
}).then(g => { heroGLTF = g; heroAssetsReady = true; $('loadTxt').textContent = ''; buildHeroes3D(); })
  .catch(e => { console.error(e); $('loadTxt').textContent = 'Không tải được mô hình anh hùng — vẫn chơi được với hình đơn giản.'; heroAssetsReady = true; });

function buildHeroes3D() {
  for (const h3 of HERO3D) { scene.remove(h3.root); scene.remove(h3.sh); if (h3.label) h3.label.el.remove(); }
  HERO3D.length = 0;
  S.heroes.forEach((h, i) => {
    const pal = HPAL[h.type]; const M = heroMaterials(pal);
    const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
    const P = S.hpos[i]; root.position.copy(V(P.x, P.y, 0.08)); scene.add(root);
    const sh = blob(0.9); sh.position.copy(V(P.x, P.y, 0.1)); sh.position.y = 0.1; scene.add(sh);
    const h3 = { sh, root, body, M, mixer: null, acts: {}, cur: null, tip: null, face: 0, wingMat: makeWingMat(h.type), wings: new THREE.Group(), wingTier: -1, evo: -1, aura: null, label: null };
    if (heroGLTF) {
      const model = SkeletonUtils.clone(heroGLTF.scene);
      buildArmor(model, pal, M);
      const box = new THREE.Box3().setFromObject(model); const k = HERO_H / (box.max.y - box.min.y);
      model.scale.setScalar(k); model.position.y = -box.min.y * k; body.add(model);
      h3.tip = model.userData.tip;
      h3.mixer = new THREE.AnimationMixer(model);
      for (const c of heroGLTF.animations) h3.acts[c.name] = h3.mixer.clipAction(c);
      h3.melee = h.type === 'fire' || h.type === 'thunder';
      h3.idle = h3.melee ? 'Sword_Idle' : 'Spell_Simple_Idle_Loop'; h3.attack = h3.melee ? 'Sword_Attack' : 'Spell_Simple_Shoot';
      h3.mixer.addEventListener('finished', () => heroAnim(h3, h3.idle, 0.2));
      heroAnim(h3, h3.idle, 0); h3.mixer.update(Math.random() * 2);
    } else {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.6, 4, 10), M.plate); m.position.y = 0.5; body.add(m); const t = new THREE.Object3D(); t.position.y = 1.0; body.add(t); h3.tip = t;
    }
    h3.wings.position.set(0, HERO_H * 0.66, -0.15); body.add(h3.wings);
    const wr = new THREE.Mesh(wingGeo, h3.wingMat); wr.position.x = 0.05; h3.wings.add(wr); const wl = new THREE.Mesh(wingGeo, h3.wingMat); wl.scale.x = -1; wl.position.x = -0.05; h3.wings.add(wl); h3.wr = wr; h3.wl = wl;
    const aura = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uC: { value: new THREE.Color(0xffd85a) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: daisMat.vertexShader, fragmentShader: daisMat.fragmentShader })); aura.position.y = 0.11; aura.visible = false; root.add(aura); h3.aura = aura;
    const el = document.createElement('div'); el.className = 'lbl'; el.innerHTML = `<div class="hl"><span class="n"></span><span class="badge hide">!</span></div><div class="mp"><i></i></div>`; labelsEl.appendChild(el);
    h3.label = { el, n: el.querySelector('.n'), badge: el.querySelector('.badge'), mp: el.querySelector('.mp i') };
    HERO3D.push(h3);
  });
}
function heroAnim(h3, name, dur, once = false, speed = 1) {
  const a = h3.acts[name]; if (!a) return; a.reset(); a.timeScale = speed; a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = once;
  if (h3.cur && h3.cur !== a) { a.play(); h3.cur.crossFadeTo(a, dur, false); } else a.play(); h3.cur = a;
}
const WS3 = [0, 0.2, 0.24, 0.28, 0.32, 0.36];
function syncHero3D(h, i, dt, t) {
  const h3 = HERO3D[i]; if (!h3) return;
  if (h3.mixer) h3.mixer.update(dt);
  if (h.anim > 0.15 && !h3.attacking) { h3.attacking = true; heroAnim(h3, h3.attack, 0.06, true, h3.melee ? 2.2 : 1.8); }
  if (h.anim <= 0) h3.attacking = false;
  if (h.aimX !== undefined) { const P = S.hpos[i]; const want = Math.atan2(h.aimX - P.x, h.aimY - P.y); let d = want - h3.face; d = Math.atan2(Math.sin(d), Math.cos(d)); h3.face += d * Math.min(1, dt * 8); }
  h3.root.rotation.y = h3.face;
  const flying = h.wing > 0;
  h3.body.position.y = flying ? 0.12 + Math.sin(t * 2.2 + i) * 0.04 : 0;
  if (h3.wingTier !== h.wing) { h3.wingTier = h.wing; h3.wings.visible = h.wing > 0; const s = WS3[h.wing] || 0; h3.wings.scale.setScalar(s); h3.wingMat.uniforms.uB.value = 0.45 + h.wing * 0.08; }
  if (h.wing > 0) { const f = Math.sin(t * 2.2 + i * 0.7); h3.wr.rotation.set(-0.5 + f * 0.08, -0.12 - f * 0.22, 0.05 + f * 0.1); h3.wl.rotation.set(-0.5 + f * 0.08, 0.12 + f * 0.22, -0.05 - f * 0.1); }
  if (h3.evo !== h.evo) { h3.evo = h.evo; h3.aura.visible = !!h.evo; h3.body.scale.setScalar(h.evo ? 1.08 : 1); h3.M.trim.userData.u.uRimStr.value = h.evo ? 1.0 : 0.45; h3.M.plate.userData.u.uRim.value.setHex(h.evo ? 0xffd85a : HPAL[h.type].rim); }
}
function heroTip3(i) { const h3 = HERO3D[i]; if (h3 && h3.tip) return h3.tip.getWorldPosition(new THREE.Vector3()); const P = S.hpos[i]; return V(P.x, P.y, 1.0); }
