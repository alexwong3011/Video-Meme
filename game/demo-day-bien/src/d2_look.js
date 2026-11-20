
// =====================================================================
// HERO LOOK v2 — approved in the A/B test: richer armour, purple glow outline (40%),
// hero size +60%, crisp feather wings with a rainbow wave (80%, speed 25%), tip glints and falling sparkles
// =====================================================================
const LOOK = { size: 1.6, outline: 0.016, outlineCol: 0xb46aff, outlineGlow: 2.6, rainbow: 0.8 * 1.25, waveSpeed: 0.4 + 0.25 * 2.4 };
(function richerArmour() { const H = heroMats;
  H.suit.color.multiplyScalar(0.45); H.suit.userData.u.uRim.value.setHex(0x9fd0ff); H.suit.userData.u.uRimStr.value = 0.75; H.suit.userData.u.uRimPow.value = 2.2;
  H.steel.color.multiplyScalar(0.62); H.steel.envMapIntensity *= 1.7; H.steel.userData.u.uRimPow.value = 2.2;
  H.dark.color.multiplyScalar(0.55); H.dark.envMapIntensity *= 1.45; H.dark.userData.u.uRimPow.value = 2.2;
  H.gold.color.multiplyScalar(0.85); H.gold.envMapIntensity *= 1.25;
  H.cape.color.offsetHSL(0, 0.2, -0.12); H.cape.emissive.multiplyScalar(1.6); H.cape.userData.u.uRimStr.value *= 1.6;
  H.blade.envMapIntensity *= 1.3; })();
// glowing ink outline (inverted hull, works on the skinned body and every armour piece)
const LOOK_TH = { value: LOOK.outline };
function lookOutlineMat(k) { const m = new THREE.MeshBasicMaterial({ color: LOOK.outlineCol, side: THREE.BackSide });
  m.onBeforeCompile = s => { s.uniforms.uTh = LOOK_TH; s.vertexShader = 'uniform float uTh;\n' + s.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * uTh * ${k.toFixed(3)};`); }; m.customProgramCacheKey = () => 'heroOutline' + k; return m; }
const lookOM = lookOutlineMat(1), lookOMS = lookOutlineMat(0.65);
function heroLookBuild(model) { const meshes = []; model.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) { if (o.material === heroMats.glow) continue; let ol; if (o.isSkinnedMesh) { ol = new THREE.SkinnedMesh(o.geometry, lookOM); ol.bind(o.skeleton, o.bindMatrix); } else ol = new THREE.Mesh(o.geometry, lookOMS);
    ol.position.copy(o.position); ol.quaternion.copy(o.quaternion); ol.scale.copy(o.scale); ol.frustumCulled = false; o.parent.add(ol); }
  heroG.scale.setScalar(LOOK.size); }
// light that only matters around the hero, firmer contact shadow, faint dark halo behind for contrast
const lookKey = new THREE.PointLight(0xe8f0ff, 5, 4.5 * LOOK.size, 1.4); scene.add(lookKey);
const lookBlob = blobMat.clone(); lookBlob.opacity = 1; heroBlob.material = lookBlob; heroBlob.scale.multiplyScalar(1.25 * LOOK.size);
const lookShade = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false })); lookShade.scale.setScalar(3 * LOOK.size); scene.add(lookShade);
// wings
const wingB = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uRoot: { value: new THREE.Color() }, uTip: { value: new THREE.Color() }, uEdge: { value: new THREE.Color() }, uB: { value: 0.7 }, uRb: { value: LOOK.rainbow }, uRs: { value: LOOK.waveSpeed } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, vertexShader: wingMat.vertexShader,
  fragmentShader: wingMat.fragmentShader.replace('void main(){', 'uniform float uRb, uRs;\nvoid main(){')
    .replace('float inside = smoothstep(tipR, tipR - 0.05, r) * smoothstep(0.0, 0.12, fs) * smoothstep(1.0, 0.88, fs);', 'float inside = smoothstep(tipR, tipR - 0.022, r) * smoothstep(0.02, 0.2, fs) * smoothstep(0.98, 0.8, fs);')
    .replace('vec3 col = c1 * (a1 * 0.32 + sh1 * 0.5) + c2 * (a2 * 0.36 + sh2 * 0.4) + uRoot * (a3 * 0.3 + sh3 * 0.15);', 'vec3 col = c1 * (a1 * 0.17 + sh1 * 0.6) + c2 * (a2 * 0.2 + sh2 * 0.48) + uRoot * (a3 * 0.18 + sh3 * 0.22);')
    .replace('shaft = exp(-pow((fs - 0.5) * 9.0, 2.0)) * inside;', 'shaft = exp(-pow((fs - 0.5) * 16.0, 2.0)) * inside;')
    .replace('float edge = smoothstep(tipR - 0.22, tipR - 0.02, r) * inside;', 'float edge = (smoothstep(tipR - 0.1, tipR - 0.015, r) + 0.6 * (smoothstep(0.26, 0.2, fs) + smoothstep(0.74, 0.8, fs)) * smoothstep(0.15, 0.5, r / tipR)) * inside;')
    .replace('gl_FragColor = vec4(col * uB, 1.0);', `
      // rainbow waves racing from the body out to the wing tips
      float cov = clamp(a1 * 0.9 + a2 * 0.8 + a3 * 0.6 + sh1 * 1.2 + sh2, 0.0, 1.6);
      float ph = r * 0.42 - uTime * uRs;
      float wave = pow(1.0 - fract(ph), 2.2) * smoothstep(0.0, 0.25, fract(ph) + 0.02) + pow(1.0 - fract(ph + 0.5), 5.0) * 0.45;
      vec3 rb = 0.55 + 0.45 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + ph * 1.6 + th * 0.12));
      float cm = clamp(cov, 0.0, 1.0); // everything below is masked by the feathers, so empty parts of the wing plane stay black
      col = col * (1.0 - 0.3 * clamp(uRb, 0.0, 1.0) * cm) + rb * cm * 0.18 * uRb + rb * wave * cov * uRb * 1.7;
      float s1 = (th + 1.9) / 2.75; if (s1 > 0.0 && s1 < 1.0) { float fi = floor(s1 * 12.0); float sc = (fi + 0.5) / 12.0; float L = mix(1.0, 2.75, pow(sc, 1.25)); float ang = -1.9 + sc * 2.75;
        float d = length(vP - vec2(cos(ang), sin(ang)) * L * 0.86); float tw = pow(0.5 + 0.5 * sin(uTime * 3.0 + fi * 2.7), 10.0); col += vec3(1.0, 0.97, 0.92) * exp(-d * d * 700.0) * tw * 1.8; }
      gl_FragColor = vec4(col * uB, 1.0);`)
});
wingR.material = wingL.material = wingB;
const lookSparks = []; { const sm = new THREE.SpriteMaterial({ map: haloTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  for (let i = 0; i < 36; i++) { const sp = new THREE.Sprite(sm.clone()); sp.visible = false; scene.add(sp); lookSparks.push({ sp, life: 0, v: new THREE.Vector3() }); } }
const lookTip = new THREE.Vector3(), lookBack = new THREE.Vector3();
function heroLookTick(dt, t) { const on = !!(S && heroG.visible && !S.dead);
  for (const k of ['uRoot', 'uTip', 'uEdge']) wingB.uniforms[k].value.copy(wingMat.uniforms[k].value); wingB.uniforms.uB.value = wingMat.uniforms.uB.value * 0.92;
  const p = LOOK.outlineGlow * (0.82 + 0.18 * Math.sin(t * 3)); lookOM.color.setHex(LOOK.outlineCol).multiplyScalar(p); lookOMS.color.copy(lookOM.color);
  lookKey.visible = lookShade.visible = on;
  if (on) { lookKey.position.set(S.pos.x + 0.6, heroG.position.y + 1.8 * LOOK.size, S.pos.z + 1.6); lookBack.set(S.pos.x, heroG.position.y + 0.6 * LOOK.size, S.pos.z).sub(camera.position).normalize(); lookShade.position.set(S.pos.x, heroG.position.y + 0.6 * LOOK.size, S.pos.z).addScaledVector(lookBack, 0.9 * LOOK.size);
    for (const w of [wingL, wingR]) if (Math.random() < 0.55) { const s = lookSparks.find(q => q.life <= 0); if (!s) break; const ang = -1.9 + Math.random() * 2.75, L = 1.4 + Math.random() * 1.3;
      w.localToWorld(lookTip.set(1.45 + Math.cos(ang) * L, 0.6 + Math.sin(ang) * L, 0)); s.sp.position.copy(lookTip); s.v.set((Math.random() - 0.5) * 0.3, -0.25 - Math.random() * 0.3, (Math.random() - 0.5) * 0.3); s.life = 1.4; s.sp.material.color.setHSL(Math.random(), 0.9, 0.7).multiplyScalar(1.8); } }
  for (const s of lookSparks) { if (s.life <= 0) { s.sp.visible = false; continue; } s.life -= dt; s.sp.visible = true; s.sp.position.addScaledVector(s.v, dt); const k = Math.max(0, s.life / 1.4); s.sp.scale.setScalar((0.06 + 0.08 * Math.sin(k * Math.PI)) * LOOK.size); s.sp.material.opacity = k; } }
