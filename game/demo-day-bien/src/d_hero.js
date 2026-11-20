const hero = { pos: new THREE.Vector3(0, 0, 4), face: Math.PI, hp: 500, maxHp: 500, lv: 1, exp: 0, gold: 0, items: 0, atkT: 0, atkCd: 0, skillCd: 0, skillT: 0 };
const heroG = new THREE.Group(); scene.add(heroG);
const heroBody = new THREE.Group(); heroG.add(heroBody);
const heroBlob = blob(1.5); scene.add(heroBlob);
// Hero: Quaternius UAL mannequin (CC0) for skeleton + animations, with an original ornate armor set built in code
const mixer = { m: null, acts: {}, cur: null };
const HERO_SCALE = 0.5;                // half the original size (user tuned: 1/4, then x2)
const HERO_H = 2.3 * HERO_SCALE;       // world height of the armored hero
const heroMats = {
  suit: stylized({ color: 0x141c38, roughness: 0.75 }, 0x5d7dff, 0.25, 3),
  steel: stylized({ color: 0xa9bdd2, metalness: 0.92, roughness: 0.26, envMapIntensity: 1.25 }, 0x8fe6ff, 0.45, 2.6),
  dark: stylized({ color: 0x27345a, metalness: 0.85, roughness: 0.34, envMapIntensity: 1.1 }, 0x7fb8ff, 0.35, 2.6),
  gold: stylized({ color: 0xe0ac4c, metalness: 1.0, roughness: 0.28, envMapIntensity: 1.5 }, 0xffe0a0, 0.45, 2.4),
  cape: stylized({ color: 0x1b2f8f, roughness: 0.7, side: THREE.DoubleSide, emissive: 0x0a1650, emissiveIntensity: 0.4 }, 0x9f8bff, 0.5, 2),
  glow: new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7fe9ff).multiplyScalar(2.6) }),
  blade: stylized({ color: 0xcfe6ff, metalness: 0.95, roughness: 0.15, envMapIntensity: 1.8 }, 0x9ff4ff, 0.9, 1.8)
};
function buildArmor(model, cls) {
  model.updateMatrixWorld(true);
  const bone = n => model.getObjectByName(n);
  const P = n => bone(n).getWorldPosition(new THREE.Vector3());
  const Y = new THREE.Vector3(0, 1, 0);
  const fwd = P('ball_l').sub(P('foot_l')).setY(0).normalize();
  const right = new THREE.Vector3().crossVectors(Y, fwd).normalize();
  const basis = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, Y, fwd));
  // place a mesh built in the hero frame (x = side, y = up, z = forward) at a world point, then parent it to a bone
  const put = (boneName, geo, mat, pos, extraQ) => {
    const m = new THREE.Mesh(geo, mat); m.position.copy(pos); m.quaternion.copy(basis); if (extraQ) m.quaternion.multiply(extraQ);
    bone(boneName).attach(m); return m;
  };
  const off = (p, x, y, z) => p.clone().addScaledVector(right, x).addScaledVector(Y, y).addScaledVector(fwd, z);
  const eul = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));
  // limb segment: geometry along +Y, stretched between two bones
  const seg = (a, b, rTop, rBot, mat, inset = 0.0, len = 1) => {
    const A = P(a), B = P(b); const d = B.clone().sub(A); const L = d.length() * len;
    const g = new THREE.CylinderGeometry(rBot, rTop, L, 12, 1); g.translate(0, L / 2 + inset, 0);
    const m = new THREE.Mesh(g, mat); m.position.copy(A); m.quaternion.setFromUnitVectors(Y, d.normalize());
    bone(a).attach(m); return m;
  };
  const M = heroMats;
  for (const s of ['l', 'r']) {
    const side = P('upperarm_' + s).sub(P('spine_03')).dot(right) > 0 ? 1 : -1;
    // pauldron: three overlapping lames, gold trim and a pair of spikes
    const sh = P('upperarm_' + s);
    for (let i = 0; i < 3; i++) {
      const g = new THREE.SphereGeometry(0.135 - i * 0.012, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
      g.scale(1.15, 0.8, 1.05);
      put('upperarm_' + s, g, i === 0 ? M.steel : M.dark, off(sh, side * (0.03 + i * 0.025), 0.06 - i * 0.05, 0), eul(0, 0, -side * (0.35 + i * 0.12)));
    }
    const trim = put('upperarm_' + s, new THREE.TorusGeometry(0.13, 0.012, 6, 24), M.gold, off(sh, side * 0.03, 0.05, 0), eul(Math.PI / 2, 0, -side * 0.35)); trim.scale.set(1.15, 1.05, 1);
    for (let k = 0; k < 2; k++) put('upperarm_' + s, new THREE.ConeGeometry(0.022, 0.16 - k * 0.04, 6), M.gold, off(sh, side * (0.1 + k * 0.03), 0.15 - k * 0.03, -0.02 + k * 0.05), eul(0, 0, -side * (0.55 + k * 0.2)));
    // arms
    seg('upperarm_' + s, 'lowerarm_' + s, 0.052, 0.048, M.dark, 0.02, 0.85);
    put('lowerarm_' + s, new THREE.SphereGeometry(0.05, 12, 8), M.steel, P('lowerarm_' + s));
    seg('lowerarm_' + s, 'hand_' + s, 0.058, 0.045, M.steel, 0.0, 1.0);
    const cuff = new THREE.TorusGeometry(0.058, 0.011, 6, 18); cuff.rotateX(Math.PI / 2);
    { const A = P('lowerarm_' + s), B = P('hand_' + s); const c = new THREE.Mesh(cuff, M.gold); c.position.lerpVectors(A, B, 0.82); c.quaternion.setFromUnitVectors(Y, B.clone().sub(A).normalize()); bone('lowerarm_' + s).attach(c); }
    put('hand_' + s, new THREE.SphereGeometry(0.045, 10, 8).scale(1, 0.8, 1.3), M.dark, P('hand_' + s).lerp(P('middle_01_' + s), 0.5));
    // legs
    seg('thigh_' + s, 'calf_' + s, 0.07, 0.078, M.dark, 0.0, 0.92);
    const knee = P('calf_' + s);
    put('calf_' + s, new THREE.SphereGeometry(0.058, 12, 8), M.steel, off(knee, 0, 0, 0.03));
    put('calf_' + s, new THREE.ConeGeometry(0.02, 0.08, 6), M.gold, off(knee, 0, 0.01, 0.09), eul(Math.PI / 2, 0, 0));
    seg('calf_' + s, 'foot_' + s, 0.06, 0.05, M.steel, 0.0, 1.0);
    { const A = P('foot_' + s), B = P('ball_' + s); const L = A.distanceTo(B) + 0.06;
      const g = new THREE.BoxGeometry(0.085, 0.07, L); const m = new THREE.Mesh(g, M.steel);
      m.position.lerpVectors(A, B, 0.5).addScaledVector(Y, -0.02); m.quaternion.copy(basis); bone('foot_' + s).attach(m); }
  }
  // cuirass, abdomen bands, gorget and chest gem
  const chest = P('spine_03'), neck = P('neck_01');
  put('spine_03', new THREE.SphereGeometry(0.17, 24, 16).scale(1.2, 1.12, 0.82), M.steel, off(chest, 0, 0.05, 0.02));
  put('spine_03', new THREE.TorusGeometry(0.075, 0.018, 8, 20), M.gold, off(neck, 0, -0.03, 0), eul(Math.PI / 2, 0, 0));
  put('spine_03', new THREE.OctahedronGeometry(0.035).scale(1, 1.4, 0.6), M.glow, off(chest, 0, 0.08, 0.15));
  const ridge = new THREE.BoxGeometry(0.018, 0.2, 0.02); put('spine_03', ridge, M.gold, off(chest, 0, 0.02, 0.155), eul(-0.25, 0, 0));
  put('spine_02', new THREE.CylinderGeometry(0.155, 0.15, 0.08, 18), M.dark, off(P('spine_02'), 0, -0.02, 0.0));
  put('spine_01', new THREE.CylinderGeometry(0.15, 0.155, 0.08, 18), M.dark, off(P('spine_01'), 0, 0.02, 0.0));
  const pel = P('pelvis');
  put('pelvis', new THREE.TorusGeometry(0.16, 0.022, 8, 24).scale(1, 1, 0.8), M.gold, off(pel, 0, 0.05, 0), eul(Math.PI / 2, 0, 0));
  put('pelvis', new THREE.BoxGeometry(0.07, 0.05, 0.02), M.gold, off(pel, 0, 0.05, 0.13));
  // tassets: hanging plates around the hips
  for (let i = -2; i <= 2; i++) {
    const a = i * 0.5; const g = new THREE.BoxGeometry(0.11, 0.24, 0.015); g.translate(0, -0.12, 0);
    const host = i < 0 ? 'thigh_l' : i > 0 ? 'thigh_r' : 'pelvis';
    const hostSide = i === 0 ? 0 : P(host).sub(pel).dot(right);
    const sideHost = i === 0 ? 'pelvis' : (Math.sign(hostSide) === Math.sign(Math.sin(a)) ? host : (host === 'thigh_l' ? 'thigh_r' : 'thigh_l'));
    put(sideHost, g, i % 2 ? M.dark : M.steel, off(pel, Math.sin(a) * 0.15, 0.02, Math.cos(a) * 0.14), eul(0.22, a, 0));
  }
  // cape from the shoulders
  { const g = new THREE.CylinderGeometry(0.2, 0.34, 1.0, 18, 8, true, Math.PI * 0.62, Math.PI * 0.76); g.translate(0, -0.5, 0);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, p.getZ(i) - y * y * 0.12); } g.computeVertexNormals();
    H3.cape = put('spine_03', g, M.cape, off(chest, 0, 0.12, -0.05)); }
  // helmet with visor glow, crest fin and swept side wings
  const head = P('Head'); const hc = off(head, 0, 0.1, 0.02);
  put('Head', new THREE.SphereGeometry(0.125, 24, 16).scale(1, 1.1, 1.12), M.steel, hc);
  put('Head', new THREE.SphereGeometry(0.128, 24, 12, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.45, Math.PI * 0.4).scale(1, 1.1, 1.12), M.dark, hc, eul(0, Math.PI, 0));
  put('Head', new THREE.BoxGeometry(0.13, 0.014, 0.02), M.glow, off(hc, 0, -0.005, 0.128));
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.quadraticCurveTo(0.02, 0.2, -0.14, 0.34); fin.quadraticCurveTo(-0.08, 0.15, -0.22, 0.02); fin.lineTo(0, 0);
  const finG = new THREE.ExtrudeGeometry(fin, { depth: 0.012, bevelEnabled: false }); finG.translate(0, 0, -0.006);
  put('Head', finG, M.gold, off(hc, 0, 0.09, 0.06), eul(0, -Math.PI / 2, 0));
  for (const sd of [-1, 1]) {
    const w = new THREE.Shape(); w.moveTo(0, 0); w.quadraticCurveTo(0.08, 0.1, 0.22, 0.12); w.quadraticCurveTo(0.12, 0.04, 0.2, -0.02); w.quadraticCurveTo(0.1, -0.01, 0, -0.04); w.lineTo(0, 0);
    const wg = new THREE.ExtrudeGeometry(w, { depth: 0.01, bevelEnabled: false });
    put('Head', wg, M.gold, off(hc, sd * 0.12, 0.02, -0.02), eul(0, sd > 0 ? -2.6 : -0.54, sd * 0.15));
  }
  // class weapon in the right hand (bow in the left): grip axis runs across the knuckles
  { const hand = s => { const k = P('index_01_' + s).lerp(P('pinky_01_' + s), 0.5); return { grip: P('index_01_' + s).sub(P('pinky_01_' + s)).normalize(), palm: P('hand_' + s).lerp(k, 0.6) }; };
    const sw = new THREE.Group(); const tip = new THREE.Object3D(); const add = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; sw.add(m); return m; };
    if (cls === 'fire') {
      const bladeS = new THREE.Shape(); bladeS.moveTo(-0.035, 0); bladeS.lineTo(0.035, 0); bladeS.lineTo(0.03, 0.85); bladeS.lineTo(0, 0.98); bladeS.lineTo(-0.03, 0.85); bladeS.lineTo(-0.035, 0);
      const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(bladeS, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }), M.blade); blade.position.set(0, 0.16, -0.006); sw.add(blade);
      const rune = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.72), M.glow); rune.position.set(0, 0.56, 0.021); sw.add(rune); const rune2 = rune.clone(); rune2.position.z = -0.021; sw.add(rune2);
      add(new THREE.BoxGeometry(0.26, 0.035, 0.05), M.gold, 0.14); for (const sd of [-1, 1]) { const c = add(new THREE.ConeGeometry(0.02, 0.09, 6), M.gold, 0.17); c.position.x = sd * 0.15; c.rotation.z = -sd * 0.9; }
      add(new THREE.CylinderGeometry(0.016, 0.016, 0.24, 8), M.dark, 0.01); add(new THREE.OctahedronGeometry(0.032), M.glow, -0.13); tip.position.y = 1.1;
    } else if (cls === 'thunder') {
      add(new THREE.CylinderGeometry(0.016, 0.016, 1.55, 8), M.gold, 0.28); add(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8), M.dark, 0.95);
      const head = add(new THREE.ConeGeometry(0.05, 0.32, 4).scale(1, 1, 0.35), M.blade, 1.2); for (const sd of [-1, 1]) { const w = add(new THREE.ConeGeometry(0.025, 0.14, 4).scale(1, 1, 0.4), M.blade, 1.03); w.position.x = sd * 0.06; w.rotation.z = sd * 0.8; }
      add(new THREE.OctahedronGeometry(0.035).scale(1, 1.6, 1), M.glow, 1.0); add(new THREE.PlaneGeometry(0.01, 0.22), M.glow, 1.2).position.z = 0.012; tip.position.y = 1.36;
    } else if (cls === 'ice' || cls === 'holy') {
      add(new THREE.CylinderGeometry(0.015, 0.018, 1.5, 8), cls === 'ice' ? M.steel : M.gold, 0.32);
      for (const y of [0.55, 0.85]) add(new THREE.TorusGeometry(0.022, 0.008, 6, 12).rotateX(Math.PI / 2), M.gold, y);
      if (cls === 'ice') { for (const sd of [-1, 1]) { const c = add(new THREE.TorusGeometry(0.07, 0.01, 6, 14, Math.PI), M.gold, 1.12); c.rotation.set(0, Math.PI / 2, sd > 0 ? 0 : Math.PI); } add(new THREE.OctahedronGeometry(0.07).scale(0.7, 1.5, 0.7), M.glow, 1.15); }
      else { add(new THREE.TorusGeometry(0.085, 0.012, 6, 22), M.gold, 1.15); add(new THREE.SphereGeometry(0.055, 14, 10), M.glow, 1.15); for (let k = 0; k < 4; k++) { const s = add(new THREE.ConeGeometry(0.012, 0.08, 4), M.gold, 1.15); s.rotation.z = k * Math.PI / 2; s.position.x = Math.sin(k * Math.PI / 2) * 0.11; s.position.y = 1.15 + Math.cos(k * Math.PI / 2) * 0.11; } }
      tip.position.y = 1.15;
    }
    if (cls === 'elf') { const l = hand('l'); const bow = new THREE.Group();
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, -0.45, 0), new THREE.Vector3(0, 0, -0.28), new THREE.Vector3(0, 0.45, 0));
      bow.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.013, 6), M.gold)); bow.add(new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.9, 4), M.glow));
      for (const sd of [-1, 1]) { const g = new THREE.Mesh(new THREE.OctahedronGeometry(0.025), M.glow); g.position.y = sd * 0.45; bow.add(g); }
      bow.position.copy(l.palm); bow.quaternion.setFromUnitVectors(Y, l.grip); bone('hand_l').attach(bow); const t2 = new THREE.Object3D(); t2.position.copy(l.palm); bone('hand_l').attach(t2); H3.tip = t2; }
    else { const r = hand('r'); sw.add(tip); sw.position.copy(r.palm).addScaledVector(r.grip, -0.03); sw.quaternion.setFromUnitVectors(Y, r.grip); bone('hand_r').attach(sw); H3.tip = tip; } }
  // under-suit for the mannequin itself
  model.traverse(o => { if (o.isSkinnedMesh) { o.material = M.suit; o.frustumCulled = false; } });
}
const H3 = { tip: null, model: null };
let heroGLTF = null;
fetch('assets/hero.json').then(r => r.json()).then(j => {
  const bin = Uint8Array.from(atob(j.data), c => c.charCodeAt(0));
  return new Promise((res, rej) => new GLTFLoader().parse(bin.buffer, '', res, rej));
}).then((gltf) => { heroGLTF = gltf; $('loadTxt').textContent = ''; if (S) buildHero3D(); })
  .catch((e) => { console.error(e); $('loadTxt').textContent = 'Không tải được mô hình nhân vật.'; });
function buildHero3D() {
  if (H3.model) { heroBody.remove(H3.model); H3.model = null; }
  if (!heroGLTF) return;
  const cls = S.cls; heroMats.glow.color.set(CLS[cls].glow).multiplyScalar(2.6);
  const model = SkeletonUtils.clone(heroGLTF.scene);
  buildArmor(model, cls);
  const box = new THREE.Box3().setFromObject(model); const h = box.max.y - box.min.y;
  const k = HERO_H / h;
  model.scale.setScalar(k); model.position.y = -box.min.y * k;
  heroBody.add(model); H3.model = model;
  model.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  mixer.m = new THREE.AnimationMixer(model); mixer.acts = {}; mixer.cur = null;
  for (const c of heroGLTF.animations) mixer.acts[c.name] = mixer.m.clipAction(c);
  H3.melee = CLS[cls].melee; H3.idle = H3.melee ? 'Sword_Idle' : 'Spell_Simple_Idle_Loop'; H3.attack = H3.melee ? 'Sword_Attack' : 'Spell_Simple_Shoot';
  mixer.m.addEventListener('finished', () => fadeTo(H3.idle, 0.25));
  fadeTo(H3.idle, 0);
  applyGearVisuals();
}
function fadeTo(name, dur, once = false, speed = 1) {
  const a = mixer.acts[name]; if (!a) return;
  a.reset(); a.timeScale = speed; a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = once;
  if (mixer.cur && mixer.cur !== a) { a.play(); mixer.cur.crossFadeTo(a, dur, false); } else a.play();
  mixer.cur = a;
}

// wings: one procedural fan of feathers per side, drawn in a shader so feathers never pile up into a white blob
const wingMat = new THREE.ShaderMaterial({
  uniforms: { uTime: U.uTime, uRoot: { value: new THREE.Color(0xeafcff) }, uTip: { value: new THREE.Color(0x2f6bff) }, uEdge: { value: new THREE.Color(0x9ff0ff) }, uB: { value: 0.62 } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uTime, uB; uniform vec3 uRoot, uTip, uEdge; varying vec2 vP;
    float layer(vec2 p, float t0, float t1, float N, float L0, float L1, float wob, out float shaft, out float rr){
      float r = length(p); float th = atan(p.y, p.x);
      float s = (th - t0) / (t1 - t0);
      shaft = 0.0; rr = 0.0;
      if (s < 0.0 || s > 1.0) return 0.0;
      float fi = floor(s * N); float fs = fract(s * N);
      float sc = (fi + 0.5) / N;
      float L = mix(L0, L1, pow(sc, 1.25)) * (1.0 + sin(uTime * 2.2 + fi * 0.7) * wob);
      float w = 1.0 - pow(abs(fs - 0.5) * 2.0, 2.2);
      float tipR = L * (0.78 + 0.22 * w);
      float inside = smoothstep(tipR, tipR - 0.05, r) * smoothstep(0.0, 0.12, fs) * smoothstep(1.0, 0.88, fs);
      shaft = exp(-pow((fs - 0.5) * 9.0, 2.0)) * inside;
      rr = clamp(r / L, 0.0, 1.0);
      float edge = smoothstep(tipR - 0.22, tipR - 0.02, r) * inside;
      return inside * (0.55 + 0.45 * sin(fs * 3.14159)) + edge * 0.9;
    }
    void main(){
      float sh1, r1, sh2, r2, sh3, r3;
      float a1 = layer(vP, -1.9, 0.85, 12.0, 1.0, 2.75, 0.02, sh1, r1);
      float a2 = layer(vP, -1.6, 0.95, 10.0, 0.6, 1.45, 0.03, sh2, r2);
      float a3 = layer(vP, -1.2, 1.05, 8.0, 0.32, 0.7, 0.04, sh3, r3);
      vec3 c1 = mix(uRoot, uTip, smoothstep(0.1, 1.0, r1));
      vec3 c2 = mix(uRoot, uEdge, r2);
      vec3 col = c1 * (a1 * 0.32 + sh1 * 0.5) + c2 * (a2 * 0.36 + sh2 * 0.4) + uRoot * (a3 * 0.3 + sh3 * 0.15);
      float r = length(vP); float th = atan(vP.y, vP.x);
      float arm = exp(-pow((th - 0.9) * 7.0, 2.0)) * smoothstep(1.9, 0.2, r) * step(0.05, r);
      col += uEdge * arm * 0.6;
      col *= 0.9 + 0.1 * sin(uTime * 3.0 + r * 6.0);
      gl_FragColor = vec4(col * uB, 1.0);
    }`
});
const wingGeo = new THREE.PlaneGeometry(3.2, 4.2); wingGeo.translate(1.45, 0.6, 0);
const wings = new THREE.Group(); wings.position.set(0, HERO_H * 0.66, -0.3 * HERO_H / 2.3); wings.scale.setScalar(1.0 * HERO_H / 2.3 * 1.15); heroBody.add(wings);
const wingR = new THREE.Mesh(wingGeo, wingMat); wingR.position.x = 0.1; wings.add(wingR);
const wingL = new THREE.Mesh(wingGeo, wingMat); wingL.scale.x = -1; wingL.position.x = -0.1; wings.add(wingL);

// aura ring under hero
const auraMat = new THREE.ShaderMaterial({
  uniforms: { uTime: U.uTime, uC: { value: new THREE.Color(0x4fc8ff) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uTime; uniform vec3 uC; varying vec2 vUv;
    void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
      float ring = smoothstep(0.06, 0.0, abs(r - 0.82)) + smoothstep(0.03, 0.0, abs(r - 0.62)) * 0.7;
      float runes = step(0.5, fract(a * 6.0 / 3.14159 + uTime * 0.3)) * smoothstep(0.05, 0.0, abs(r - 0.72)) * 0.8;
      float glow = smoothstep(0.9, 0.0, r) * 0.25;
      gl_FragColor = vec4(uC * (ring + runes + glow) * 0.9, 1.0); }`
});
const aura = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2).rotateX(-Math.PI / 2), auraMat);
aura.position.y = 0.04; scene.add(aura);

// slash arc effect
const slashMat = new THREE.ShaderMaterial({
  uniforms: { uT: { value: 0 }, uC: { value: new THREE.Color(0x8ff0ff) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uT; uniform vec3 uC; varying vec2 vUv;
    void main(){ vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x) / 3.14159;
      float head = mix(-0.9, 0.9, uT);
      float trail = smoothstep(head - 0.9, head, a) * step(a, head);
      float band = smoothstep(0.62, 0.8, r) * smoothstep(1.0, 0.86, r);
      float core = smoothstep(0.86, 0.9, r) * smoothstep(0.96, 0.9, r);
      float fade = 1.0 - smoothstep(0.65, 1.0, uT);
      gl_FragColor = vec4((uC * band * 1.6 + vec3(1.0) * core * 2.5) * trail * fade, 1.0); }`
});
const slash = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2).rotateX(-Math.PI / 2), slashMat);
slash.visible = false; scene.add(slash);
const skillMat = slashMat.clone(); skillMat.uniforms.uC.value = new THREE.Color(0xb98cff);
const skillRing = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.4).rotateX(-Math.PI / 2), skillMat);
skillRing.visible = false; scene.add(skillRing);
