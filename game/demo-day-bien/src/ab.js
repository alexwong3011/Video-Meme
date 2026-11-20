
// =====================================================================
// A/B HARNESS — same live scene rendered twice per frame:
// left = current hero look (A), right = proposed hero look (B). Not part of the game build.
// =====================================================================
document.head.insertAdjacentHTML('beforeend', `<style>
body.ab #game{display:flex}body.ab #game canvas{width:50%!important;height:100%!important}body.ab #labels,body.ab #hud,body.ab .ov{display:none!important}
#abUI{position:fixed;inset:0;pointer-events:none;z-index:20;font:600 12px var(--ui)}
.abTag{position:absolute;top:calc(10px + env(safe-area-inset-top,0px));padding:5px 12px;border-radius:14px;background:rgba(4,16,22,.82);border:1px solid rgba(242,198,107,.55);color:#ffe7a8;font:700 13px var(--display);letter-spacing:.06em}
.abTag.l{left:calc(25% - 60px)}.abTag.r{left:calc(75% - 64px)}
.abSplit{position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:linear-gradient(transparent,#f2c66b 20%,#f2c66b 80%,transparent);box-shadow:0 0 10px #f2c66b}
.abBar{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:6px;flex-wrap:wrap;justify-content:center;width:min(96vw,640px);pointer-events:auto}
.abSl{display:flex;align-items:center;gap:6px;font:700 12px var(--ui);color:#fbeecb;background:rgba(4,16,22,.88);border:1px solid rgba(242,198,107,.55);border-radius:10px;padding:5px 10px}.abSl input{width:110px;accent-color:#f2c66b}.abSl b{min-width:34px;text-align:right;color:#ffe7a8;font-variant-numeric:tabular-nums}
.abBar select,.abBar button{font:700 12px var(--ui);color:#fbeecb;background:rgba(4,16,22,.88);border:1px solid rgba(242,198,107,.55);border-radius:10px;padding:8px 10px}
</style>`);
document.body.classList.add('ab');
document.body.insertAdjacentHTML('beforeend', `<div id="abUI">
  <div class="abTag l">A · Hiện tại</div><div class="abTag r">B · Nâng cấp</div><div class="abSplit"></div>
  <div class="abBar"><select id="abMap"></select><select id="abCls"></select><select id="abOut"><option value="purple">Viền: Tím glow</option><option value="blue">Viền: Xanh lam glow</option><option value="black">Viền: Đen</option><option value="off">Viền: Tắt</option></select><label class="abSl">Độ dày viền <input type="range" id="abTh" min="0" max="100" value="40"><b id="abThV">40%</b></label><label class="abSl">Cỡ nhân vật <input type="range" id="abSz" min="0" max="100" value="60"><b id="abSzV">60%</b></label><button id="abZoom">Cận cảnh: TẮT</button><button id="abWing">Hiệu ứng cánh B: BẬT</button><button id="abAtk">Ra chiêu: BẬT</button></div></div>`);
const rB = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
rB.toneMapping = THREE.ACESFilmicToneMapping; host.appendChild(rB.domElement);
function composerFor(r, w, h) { const rt = new THREE.WebGLRenderTarget(w * DPR, h * DPR, { type: THREE.HalfFloatType, samples: 4 }); const c = new EffectComposer(r, rt); c.setPixelRatio(DPR); c.setSize(w, h);
  c.addPass(new RenderPass(scene, camera)); c.addPass(new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.55, 0.45, 0.95)); c.addPass(new OutputPass()); return c; }
let cA = null, cB = null;
function abResize() { const w = Math.floor(innerWidth / 2), h = innerHeight; for (const r of [renderer, rB]) { r.setPixelRatio(DPR); r.setSize(w, h); }
  camera.aspect = w / h; camera.fov = h > w ? 46 : 36; camera.updateProjectionMatrix(); cA = composerFor(renderer, w, h); cB = composerFor(rB, w, h);
  const s = h * DPR * 0.5; pMat.uniforms.uScale.value = s; moteMats.forEach(m => m.uniforms.uScale.value = s); }
removeEventListener('resize', onResize); onResize = abResize; addEventListener('resize', abResize);

// ---- variant B: richer, darker armour, stronger coloured rim, ink outline, hero key light, firmer contact shadow
const keyLight = new THREE.PointLight(0xe8f0ff, 0, 4.5, 1.4); scene.add(keyLight);
const blobB = blobMat.clone(); blobB.opacity = 1;
const shade = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false })); shade.scale.setScalar(3.0); shade.visible = false; scene.add(shade);
const OUT_COL = 0x000000;
const OUT_TH = { value: 0.016 }; // shared, driven by the thickness slider (100% = 0.04)
function outlineMat(k) { const m = new THREE.MeshBasicMaterial({ color: OUT_COL, side: THREE.BackSide });
  m.onBeforeCompile = s => { s.uniforms.uTh = OUT_TH; s.vertexShader = 'uniform float uTh;\n' + s.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * uTh * ${k.toFixed(3)};`); }; m.customProgramCacheKey = () => 'outline' + k; return m; }
let AB = { mats: [], outlines: [] };
function prepVariants() {
  for (const o of AB.outlines) o.parent && o.parent.remove(o); AB = { mats: [], outlines: [] };
  if (!H3.model) return; const seen = new Set(); const meshes = []; H3.model.traverse(o => { if (o.isMesh) meshes.push(o); });
  const om = outlineMat(1), omS = outlineMat(0.65); AB.om = om; AB.omS = omS;
  for (const o of meshes) {
    const m = o.material; if (m && !seen.has(m)) { seen.add(m); AB.mats.push({ m, A: { color: m.color && m.color.clone(), em: m.emissive && m.emissive.clone(), env: m.envMapIntensity, rs: m.userData.u?.uRimStr.value, rp: m.userData.u?.uRimPow.value, rc: m.userData.u?.uRim.value.clone() } }); }
    if (m === heroMats.glow) continue;
    let ol; if (o.isSkinnedMesh) { ol = new THREE.SkinnedMesh(o.geometry, om); ol.bind(o.skeleton, o.bindMatrix); } else ol = new THREE.Mesh(o.geometry, omS);
    ol.position.copy(o.position); ol.quaternion.copy(o.quaternion); ol.scale.copy(o.scale); ol.frustumCulled = false; ol.visible = false; o.parent.add(ol); AB.outlines.push(ol); }
}
const glowC = () => new THREE.Color(CLS[S.cls].glow);
function setVariant(v) { const B = v === 'B';
  for (const { m, A } of AB.mats) {
    if (A.color) m.color.copy(A.color); if (A.em) m.emissive.copy(A.em); if (A.env !== undefined) m.envMapIntensity = A.env;
    if (A.rs !== undefined) { m.userData.u.uRimStr.value = A.rs; m.userData.u.uRimPow.value = A.rp; m.userData.u.uRim.value.copy(A.rc); }
    if (!B) continue;
    const H = heroMats;
    if (m === H.suit) { m.color.multiplyScalar(0.45); m.userData.u.uRim.value.setHex(0x9fd0ff); m.userData.u.uRimStr.value = 0.75; m.userData.u.uRimPow.value = 2.2; }
    else if (m === H.steel) { m.color.multiplyScalar(0.62); m.envMapIntensity = A.env * 1.7; m.userData.u.uRim.value.setHex(0xcfeaff); m.userData.u.uRimStr.value = Math.max(0.6, A.rs * 1.1); m.userData.u.uRimPow.value = 2.2; }
    else if (m === H.dark) { m.color.multiplyScalar(0.55); m.envMapIntensity = A.env * 1.45; m.userData.u.uRim.value.setHex(0xa8d8ff); m.userData.u.uRimStr.value = A.rs * 1.5; m.userData.u.uRimPow.value = 2.2; }
    else if (m === H.gold) { m.color.multiplyScalar(0.85); m.envMapIntensity = A.env * 1.25; }
    else if (m === H.cape) { m.color.offsetHSL(0, 0.2, -0.12); m.emissive.multiplyScalar(1.6); m.userData.u.uRimStr.value = A.rs * 1.6; }
    else if (m === H.blade) { m.envMapIntensity = A.env * 1.3; }
  }
  for (const o of AB.outlines) o.visible = B && outCol !== 'off';
  const wb = B && wingFx; if (wb) for (const k of ['uRoot', 'uTip', 'uEdge']) wingB.uniforms[k].value.copy(wingMat.uniforms[k].value); wingB.uniforms.uB.value = wingMat.uniforms.uB.value * 0.92;
  wingR.material = wingL.material = wb ? wingB : wingMat; sparkG.visible = wb;
  keyLight.intensity = B ? 5 : 0; shade.visible = B; heroBlob.material = B ? blobB : blobMat; heroBlob.scale.set((B ? 1.25 : 1) * heroSize, 1, (B ? 1.25 : 1) * heroSize);
}
// ---- wings B: crisper feathers (clear gaps, thin bright feather rims, sharper shafts) + light sweep, iridescence, tip glints, falling sparkles
const wingB = new THREE.ShaderMaterial({ uniforms: { uTime: U.uTime, uRoot: { value: new THREE.Color() }, uTip: { value: new THREE.Color() }, uEdge: { value: new THREE.Color() }, uB: { value: 0.7 } },
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, vertexShader: wingMat.vertexShader,
  fragmentShader: wingMat.fragmentShader
    .replace('float inside = smoothstep(tipR, tipR - 0.05, r) * smoothstep(0.0, 0.12, fs) * smoothstep(1.0, 0.88, fs);', 'float inside = smoothstep(tipR, tipR - 0.022, r) * smoothstep(0.02, 0.2, fs) * smoothstep(0.98, 0.8, fs);')
    .replace('vec3 col = c1 * (a1 * 0.32 + sh1 * 0.5) + c2 * (a2 * 0.36 + sh2 * 0.4) + uRoot * (a3 * 0.3 + sh3 * 0.15);', 'vec3 col = c1 * (a1 * 0.17 + sh1 * 0.6) + c2 * (a2 * 0.2 + sh2 * 0.48) + uRoot * (a3 * 0.18 + sh3 * 0.22);')
    .replace('shaft = exp(-pow((fs - 0.5) * 9.0, 2.0)) * inside;', 'shaft = exp(-pow((fs - 0.5) * 16.0, 2.0)) * inside;')
    .replace('float edge = smoothstep(tipR - 0.22, tipR - 0.02, r) * inside;', 'float edge = (smoothstep(tipR - 0.1, tipR - 0.015, r) + 0.6 * (smoothstep(0.26, 0.2, fs) + smoothstep(0.74, 0.8, fs)) * smoothstep(0.15, 0.5, r / tipR)) * inside;')
    .replace('gl_FragColor = vec4(col * uB, 1.0);', `
      float sw = exp(-pow((r / 2.6 - fract(uTime * 0.4)) * 7.0, 2.0)); col += mix(uEdge, vec3(1.0), 0.45) * sw * (a1 * 0.3 + sh1 * 0.8 + a2 * 0.25 + sh2 * 0.5);
      vec3 iri = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + th * 0.35 + r * 0.18 - uTime * 0.12)); col += iri * (sh1 * 0.32 + sh2 * 0.22);
      float s1 = (th + 1.9) / 2.75; if (s1 > 0.0 && s1 < 1.0) { float fi = floor(s1 * 12.0); float sc = (fi + 0.5) / 12.0; float L = mix(1.0, 2.75, pow(sc, 1.25)); float ang = -1.9 + sc * 2.75;
        float d = length(vP - vec2(cos(ang), sin(ang)) * L * 0.86); float tw = pow(0.5 + 0.5 * sin(uTime * 3.0 + fi * 2.7), 10.0); col += vec3(1.0, 0.97, 0.92) * exp(-d * d * 700.0) * tw * 1.8; }
      gl_FragColor = vec4(col * uB, 1.0);`)
});
const sparkG = new THREE.Group(); scene.add(sparkG); const sparkM = new THREE.SpriteMaterial({ map: haloTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
const sparks = []; for (let i = 0; i < 36; i++) { const sp = new THREE.Sprite(sparkM.clone()); sp.visible = false; sparkG.add(sp); sparks.push({ sp, life: 0, v: new THREE.Vector3() }); }
const tmpTip = new THREE.Vector3();
function updSparks(dt) { if (!wingFx) return; for (const k of [0, 1]) if (Math.random() < 0.55) { const s = sparks.find(q => q.life <= 0); if (!s) break; const w = k ? wingR : wingL; const ang = -1.9 + Math.random() * 2.75, L = 1.4 + Math.random() * 1.3;
    w.localToWorld(tmpTip.set(1.45 + Math.cos(ang) * L, 0.6 + Math.sin(ang) * L, 0)); s.sp.position.copy(tmpTip); s.v.set((Math.random() - 0.5) * 0.3, -0.25 - Math.random() * 0.3, (Math.random() - 0.5) * 0.3); s.life = 1.4; s.sp.material.color.copy(wingMat.uniforms.uEdge.value).lerp(new THREE.Color(1, 1, 1), 0.5).multiplyScalar(1.6); }
  for (const s of sparks) { if (s.life <= 0) { s.sp.visible = false; continue; } s.life -= dt; s.sp.visible = true; s.sp.position.addScaledVector(s.v, dt); const k = Math.max(0, s.life / 1.4); s.sp.scale.setScalar(0.06 + 0.08 * Math.sin(k * Math.PI)); s.sp.material.opacity = k; } }
// ---- harness loop: wrap the game's composer so each frame renders A then B
let zoom = false, autoAtk = true, atkT = 0, outCol = 'purple', heroSize = 1.6, wingFx = true;
const OUTS = { blue: [0x3a9cff, 2.6], purple: [0xb46aff, 2.6], black: [0x000000, 1] };
function tintOutline(t) { if (!AB.om || outCol === 'off') return; const [c, k] = OUTS[outCol]; const p = k * (0.82 + 0.18 * Math.sin(t * 3)); for (const m of [AB.om, AB.omS]) m.color.setHex(c).multiplyScalar(p); }
composer = { render(dt) { if (!cA) abResize();
    if (S && H3.model && !AB.mats.length) prepVariants();
    if (S) { S.hp = HS.hp; S.mp = HS.mp; for (const m of mobs) { m.aggro = false; m.tgt = null; } atkT -= dt; if (autoAtk && atkT <= 0 && H3.attack) { atkT = 1.5; fadeTo(H3.attack, 0.06, true, 1.3); if (Math.random() < 0.35) heroRing(ELC[CLS[S.cls].el]); } }
    const keep = camera.position.clone(); if (zoom && S) { camera.position.lerp(new THREE.Vector3(S.pos.x, heroG.position.y + 1, S.pos.z), 0.62); camera.lookAt(S.pos.x, heroG.position.y + 0.6, S.pos.z); }
    heroG.scale.setScalar(heroSize); shade.scale.setScalar(3 * heroSize);
    if (S) { keyLight.position.set(S.pos.x + 0.6, heroG.position.y + 1.8, S.pos.z + 1.6); const back = new THREE.Vector3(S.pos.x, heroG.position.y + 0.6, S.pos.z).sub(camera.position).normalize(); shade.position.set(S.pos.x, heroG.position.y + 0.6, S.pos.z).addScaledVector(back, 0.9); }
    updSparks(dt); tintOutline(U.uTime.value); setVariant('A'); cA.render(dt); setVariant('B'); cB.render(dt); setVariant('A');
    if (zoom && S) camera.position.copy(keep); }, dispose() {} };
// ---- scene setup: same build as the player (Thánh Quang Lv 419, wings V, +12 gear) on the brightest realm
const abMaps = [9, 4, 5, 0, TOWN]; $('abMap').innerHTML = abMaps.map(i => `<option value="${i}">${MAPS[i].name}</option>`).join('');
$('abCls').innerHTML = CORDER.map(k => `<option value="${k}">${CLS[k].name}</option>`).join(''); $('abCls').value = 'holy';
$('abMap').onchange = e => { travel(+e.target.value); };
$('abCls').onchange = e => { S.cls = e.target.value; buildHero3D(); applyGearVisuals(); AB.mats = []; };
$('abTh').oninput = e => { OUT_TH.value = 0.04 * e.target.value / 100; $('abThV').textContent = e.target.value + '%'; };
$('abSz').oninput = e => { heroSize = 1 + e.target.value / 100; $('abSzV').textContent = e.target.value + '%'; };
$('abOut').onchange = e => { outCol = e.target.value; };
$('abWing').onclick = e => { wingFx = !wingFx; e.target.textContent = 'Hiệu ứng cánh B: ' + (wingFx ? 'BẬT' : 'TẮT'); };
$('abZoom').onclick = e => { zoom = !zoom; e.target.textContent = 'Cận cảnh: ' + (zoom ? 'BẬT' : 'TẮT'); };
$('abAtk').onclick = e => { autoAtk = !autoAtk; e.target.textContent = 'Ra chiêu: ' + (autoAtk ? 'BẬT' : 'TẮT'); };
(function boot() { if (!heroGLTF) { setTimeout(boot, 200); return; }
  const G = (slot, base) => ({ id: slot, slot, r: 3, lv: 410, name: slot, base, plus: 12, set: slot === 'pendant' ? null : 'thien' });
  S = newState('holy'); Object.assign(S, { lv: 419, wing: 5, gold: 0, auto: false, autoLoot: false, bots: [], eq: { weapon: G('weapon', { atk: 1400, as: 200 }), helm: G('helm', { def: 400, hp: 3500 }), armor: G('armor', { def: 800, hp: 7000 }), ring: G('ring', { hp: 4700, crit: 8 }), pendant: G('pendant', { hp: 2900, as: 200 }) } });
  startRun(false); travel(9); $('hud').classList.add('hide'); abResize(); })();
