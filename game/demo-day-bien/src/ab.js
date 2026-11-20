
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
.abBar select,.abBar button{font:700 12px var(--ui);color:#fbeecb;background:rgba(4,16,22,.88);border:1px solid rgba(242,198,107,.55);border-radius:10px;padding:8px 10px}
</style>`);
document.body.classList.add('ab');
document.body.insertAdjacentHTML('beforeend', `<div id="abUI">
  <div class="abTag l">A · Hiện tại</div><div class="abTag r">B · Nâng cấp</div><div class="abSplit"></div>
  <div class="abBar"><select id="abMap"></select><select id="abCls"></select><button id="abZoom">Cận cảnh: TẮT</button><button id="abAtk">Ra chiêu: BẬT</button></div></div>`);
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
function outlineMat(th) { const m = new THREE.MeshBasicMaterial({ color: OUT_COL, side: THREE.BackSide });
  m.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * ${th.toFixed(4)};`); }; m.customProgramCacheKey = () => 'outline' + th; return m; }
let AB = { mats: [], outlines: [] };
function prepVariants() {
  for (const o of AB.outlines) o.parent && o.parent.remove(o); AB = { mats: [], outlines: [] };
  if (!H3.model) return; const seen = new Set(); const meshes = []; H3.model.traverse(o => { if (o.isMesh) meshes.push(o); });
  const om = outlineMat(0.04), omS = outlineMat(0.026);
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
  for (const o of AB.outlines) o.visible = B;
  keyLight.intensity = B ? 5 : 0; shade.visible = B; heroBlob.material = B ? blobB : blobMat; heroBlob.scale.set(B ? 1.25 : 1, 1, B ? 1.25 : 1);
}
// ---- harness loop: wrap the game's composer so each frame renders A then B
let zoom = false, autoAtk = true, atkT = 0;
composer = { render(dt) { if (!cA) abResize();
    if (S && H3.model && !AB.mats.length) prepVariants();
    if (S) { S.hp = HS.hp; S.mp = HS.mp; for (const m of mobs) { m.aggro = false; m.tgt = null; } atkT -= dt; if (autoAtk && atkT <= 0 && H3.attack) { atkT = 1.5; fadeTo(H3.attack, 0.06, true, 1.3); if (Math.random() < 0.35) heroRing(ELC[CLS[S.cls].el]); } }
    const keep = camera.position.clone(); if (zoom && S) { camera.position.lerp(new THREE.Vector3(S.pos.x, heroG.position.y + 1, S.pos.z), 0.62); camera.lookAt(S.pos.x, heroG.position.y + 0.6, S.pos.z); }
    if (S) { keyLight.position.set(S.pos.x + 0.6, heroG.position.y + 1.8, S.pos.z + 1.6); const back = new THREE.Vector3(S.pos.x, heroG.position.y + 0.6, S.pos.z).sub(camera.position).normalize(); shade.position.set(S.pos.x, heroG.position.y + 0.6, S.pos.z).addScaledVector(back, 0.9); }
    setVariant('A'); cA.render(dt); setVariant('B'); cB.render(dt); setVariant('A');
    if (zoom && S) camera.position.copy(keep); }, dispose() {} };
// ---- scene setup: same build as the player (Thánh Quang Lv 419, wings V, +12 gear) on the brightest realm
const abMaps = [9, 4, 5, 0, TOWN]; $('abMap').innerHTML = abMaps.map(i => `<option value="${i}">${MAPS[i].name}</option>`).join('');
$('abCls').innerHTML = CORDER.map(k => `<option value="${k}">${CLS[k].name}</option>`).join(''); $('abCls').value = 'holy';
$('abMap').onchange = e => { travel(+e.target.value); };
$('abCls').onchange = e => { S.cls = e.target.value; buildHero3D(); applyGearVisuals(); AB.mats = []; };
$('abZoom').onclick = e => { zoom = !zoom; e.target.textContent = 'Cận cảnh: ' + (zoom ? 'BẬT' : 'TẮT'); };
$('abAtk').onclick = e => { autoAtk = !autoAtk; e.target.textContent = 'Ra chiêu: ' + (autoAtk ? 'BẬT' : 'TẮT'); };
(function boot() { if (!heroGLTF) { setTimeout(boot, 200); return; }
  const G = (slot, base) => ({ id: slot, slot, r: 3, lv: 410, name: slot, base, plus: 12, set: slot === 'pendant' ? null : 'thien' });
  S = newState('holy'); Object.assign(S, { lv: 419, wing: 5, gold: 0, auto: false, autoLoot: false, bots: [], eq: { weapon: G('weapon', { atk: 1400, as: 200 }), helm: G('helm', { def: 400, hp: 3500 }), armor: G('armor', { def: 800, hp: 7000 }), ring: G('ring', { hp: 4700, crit: 8 }), pendant: G('pendant', { hp: 2900, as: 200 }) } });
  startRun(false); travel(9); $('hud').classList.add('hide'); abResize(); })();
