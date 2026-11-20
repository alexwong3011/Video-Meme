// ---------- mobs ----------
const labelsEl = document.getElementById('labels');
const jellyMatBase = new THREE.ShaderMaterial({
  uniforms: { uC: { value: new THREE.Color(0xc06bff) }, uC2: { value: new THREE.Color(0x5fe3ff) }, uTime: U.uTime, uFlash: { value: 0 }, uFade: { value: 1 }, uTint: { value: new THREE.Color(0, 0, 0) } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: `varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 uC, uC2, uTint; uniform float uTime, uFlash, uFade; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
    void main(){ float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
      float lines = 0.75 + 0.25 * sin(vUv.x * 6.2831 * 10.0);
      float spots = smoothstep(0.75, 1.0, sin(vUv.x * 62.0) * sin(vUv.y * 30.0 - uTime));
      vec3 col = mix(uC, uC2, vUv.y) * (0.08 + fr * 0.95) * lines + uC2 * spots * 0.35;
      col += vec3(0.5, 0.7, 1.0) * uFlash * 0.2 + uTint * (0.3 + fr);
      gl_FragColor = vec4(col * uFade, 1.0); }`
});
const tentMatBase = new THREE.ShaderMaterial({
  uniforms: { uC: { value: new THREE.Color(0xd59bff) }, uTime: U.uTime, uFade: { value: 1 }, uPh: { value: 0 } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: `uniform float uTime, uPh; varying float vY;
    void main(){ vec3 p = position; float k = -p.y; vY = k;
      p.x += sin(uTime * 2.4 + uPh + k * 3.0) * 0.18 * k; p.z += cos(uTime * 1.9 + uPh + k * 2.4) * 0.12 * k;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
  fragmentShader: `uniform vec3 uC; uniform float uFade; varying float vY;
    void main(){ gl_FragColor = vec4(uC * (1.0 - vY / 1.6) * 0.45 * uFade, 1.0); }`
});
const tentGeo = new THREE.PlaneGeometry(0.05, 1.6, 1, 12); tentGeo.translate(0, -0.8, 0);
const bellGeo = new THREE.SphereGeometry(0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
const bellInnerGeo = new THREE.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.6);

function makeJelly(pal = {}) {
  const g = new THREE.Group();
  const hueShift = rand();
  const mat = jellyMatBase.clone();
  mat.uniforms.uC.value = new THREE.Color().setHSL((pal.h1 ?? 0.8) + hueShift * 0.1, 0.95, pal.l1 ?? 0.5);
  mat.uniforms.uC2.value = new THREE.Color().setHSL((pal.h2 ?? 0.52) + hueShift * 0.05, 0.95, pal.l2 ?? 0.5);
  const bell = new THREE.Mesh(bellGeo, mat); g.add(bell);
  const inner = new THREE.Mesh(bellInnerGeo, mat); inner.position.y = 0.05; g.add(inner);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), new THREE.MeshBasicMaterial({ color: mat.uniforms.uC2.value.clone().multiplyScalar(2.2), transparent: true }));
  core.position.y = 0.15; g.add(core);
  const tmat = tentMatBase.clone(); tmat.uniforms.uC.value = mat.uniforms.uC.value.clone().lerp(new THREE.Color(1, 1, 1), 0.15); tmat.uniforms.uPh.value = rr(0, 6);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 6.28, r = i % 2 ? 0.45 : 0.2;
    const t = new THREE.Mesh(tentGeo, tmat); t.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r); t.rotation.y = a; t.scale.y = rr(0.7, 1.2); g.add(t);
  }
  if (pal.crown) { const gold = stylized({ color: 0xffc84a, metalness: 1, roughness: 0.25, envMapIntensity: 1.5 }, 0xfff0b0, 0.8);
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; const sp = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 5), gold); sp.position.set(Math.cos(a) * 0.3, 0.6, Math.sin(a) * 0.3); g.add(sp);
      const gm = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.gem || 0xff6ad8).multiplyScalar(2.5) })); gm.position.set(Math.cos(a) * 0.34, 0.5, Math.sin(a) * 0.34); g.add(gm); }
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 28), gold); band.rotation.x = Math.PI / 2; band.position.y = 0.48; g.add(band); }
  return { group: g, mats: [mat, tmat], jmat: mat, core, bell, kind: 'jelly' };
}
function makeFish(pal = {}) {
  const g = new THREE.Group();
  const body = new THREE.SphereGeometry(0.5, 24, 16);
  const p = body.attributes.position, cols = [];
  const back = new THREE.Color(pal.back ?? 0x2a1a14), belly = new THREE.Color(pal.belly ?? 0xff8a3a), stripe = new THREE.Color(pal.stripe ?? 0xffd27a);
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), z = p.getZ(i);
    const c = belly.clone().lerp(back, clamp(y * 1.6 + 0.45, 0, 1));
    if (Math.sin(z * 18) > 0.75 && y > -0.1) c.lerp(stripe, 0.5);
    cols.push(c.r, c.g, c.b);
  }
  body.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const mat = stylized({ vertexColors: true, roughness: 0.45, metalness: 0.2, envMapIntensity: 1.0, emissive: 0x000000 }, 0xffb36b, 0.6, 2.4);
  const fin = stylized({ color: pal.fin ?? 0xffa64d, roughness: 0.5, side: THREE.DoubleSide, emissive: pal.finE ?? 0xff6a1a, emissiveIntensity: 0.4, metalness: pal.crown ? 0.8 : 0 }, pal.rim ?? 0xffe0a0, 0.6);
  const bodyM = new THREE.Mesh(body, mat); bodyM.scale.set(0.62, 0.7, 1.35); g.add(bodyM);
  // dorsal spikes
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.05, rr(0.35, 0.55), 6), fin);
    const t = i / 6; s.position.set(0, 0.3 + Math.sin(t * Math.PI) * 0.06, 0.45 - t * 0.9); s.rotation.x = -0.5; g.add(s);
  }
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.28, 6), fin);
    s.position.set(0.28 * sd, 0.05, 0.3 - i * 0.22); s.rotation.set(-0.4, 0, -1.1 * sd); g.add(s);
  }
  const tailShape = new THREE.Shape(); tailShape.moveTo(0, 0); tailShape.lineTo(0.42, 0.62); tailShape.quadraticCurveTo(0.12, 0.3, 0, 0.28); tailShape.quadraticCurveTo(-0.12, 0.3, -0.42, 0.62); tailShape.lineTo(0, 0);
  const tail = new THREE.Mesh(new THREE.ShapeGeometry(tailShape), fin);
  const tailPivot = new THREE.Group(); tailPivot.position.z = -0.62; g.add(tailPivot);
  tail.geometry.rotateX(-Math.PI / 2); tail.geometry.rotateZ(Math.PI / 2); // vertical fin pointing backwards
  tailPivot.add(tail);
  const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.eye ?? 0xfff07a).multiplyScalar(3) });
  for (const sd of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), eyeM); e.position.set(0.24 * sd, 0.1, 0.5); g.add(e); }
  return { group: g, mats: [mat], fin, tail: tailPivot, kind: 'fish' };
}
