
// =====================================================================
// VIEW — projectiles, skill visuals, drops, camera, HUD, input, save, loop
// =====================================================================
const PROJ = {
  flame: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glowMat(0xff8a2a, 3))); const c = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 8).rotateX(-Math.PI / 2).translate(0, 0, -0.15), addMat(0xff5a00, 1.6, 0.8)); g.add(c); return g; },
  shard: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.07).scale(0.6, 0.6, 2.4), glowMat(0xbff8ff, 2.6))); return g; },
  arrow: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 4).rotateX(Math.PI / 2), glowMat(0xb0ffb0, 2))); const t = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 4).rotateX(Math.PI / 2), glowMat(0x7dff9a, 3)); t.position.z = 0.22; g.add(t); return g; },
  holy: () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), glowMat(0xfff0b0, 3))); g.add(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 6, 20), glowMat(0xffd85a, 2.6))); return g; }
};
function spawnProj3(p) { const m = PROJ[p.type](); m.position.copy(p.from); scene.add(m); p.m = m; }
function removeProj3(p) { if (p.m) { scene.remove(p.m); p.m = null; } }
const tA = new THREE.Vector3(), tB = new THREE.Vector3();
function syncProj(dt) {
  for (const p of S.pr) { if (!p.m) continue; const rem = Math.hypot(p.tx - p.x, p.ty - p.y); const k = clamp(1 - rem / p.d0, 0, 1);
    const tgt = p.tgt && !p.tgt.dead ? V(p.tgt.x, p.tgt.y, eh(p.tgt)) : V(p.tx, p.ty + 20, 0.4);
    tA.copy(p.from).lerp(tgt, k); tA.y += Math.sin(k * Math.PI) * (p.type === 'arrow' ? 0.35 : 0.2);
    p.m.lookAt(tA.x + (tA.x - p.m.position.x), tA.y + (tA.y - p.m.position.y), tA.z + (tA.z - p.m.position.z)); p.m.position.copy(tA);
    if (p.type === 'holy') p.m.rotation.z += dt * 6;
    if (Math.random() < 0.8) emit(tA.x, tA.y, tA.z, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, p.col, p.type === 'flame' || p.type === 'holy' ? 0.14 : 0.07, 0.25, 0, 0.95); }
}
// skill visuals
function syncSkills(dt) {
  for (const s of S.sk) {
    switch (s.type) {
      case 'storm': if (!s.v) { s.v = new THREE.Group(); const cl = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8).scale(s.R * K * 1.2, 0.25, s.R * K * 1.0), new THREE.MeshBasicMaterial({ color: 0x241640, transparent: true, opacity: 0.45, depthWrite: false })); s.v.add(cl); s.v.add(new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8).scale(s.R * K * 1.3, 0.3, s.R * K * 1.1), addMat(0x8a5aff, 0.5, 0.5))); s.v.position.copy(V(s.x, s.y, 2.7)); scene.add(s.v); }
        s.v.children[1].material.opacity = 0.3 + 0.3 * Math.random(); s.v.scale.setScalar(Math.min(1, s.t * 3) * (s.t > s.dur ? Math.max(0, 1 - (s.t - s.dur) * 3) : 1) + 0.001);
        if (Math.random() < dt * 30) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * s.R; const p = V(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r, 2.4); emit(p.x, p.y, p.z, 0, -5, 0, '#7fc8ff', 0.04, 0.45, 0, 1); } break;
      case 'line': if (!s.v) { s.v = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10).scale(s.W * K, 0.25, s.W * K * 1.6), addMat(s.kind === 'fire' ? 0xff7a1a : 0x4ab8ff, 2, 0.9)); scene.add(s.v); }
        s.v.position.copy(V(s.x, s.y + 40, 0.5)); s.v.rotation.y = Math.atan2(s.dx, s.dy);
        for (let n = 0; n < 3; n++) { const p = V(s.x + (Math.random() - 0.5) * 22, s.y + 40 + (Math.random() - 0.5) * 22, 0.3 + Math.random() * 0.5); emit(p.x, p.y, p.z, -s.dx * 0.7, 0.4, -s.dy * 0.7, s.kind === 'fire' ? (Math.random() < 0.5 ? '#ff7a1a' : '#ffd060') : (Math.random() < 0.5 ? '#4ab8ff' : '#dff4ff'), 0.14, 0.45, 0, 0.95); } break;
      case 'meteor': if (!s.v) { s.v = new THREE.Group(); s.v.add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.28), stylized({ color: 0x3a1a10, emissive: 0xff4a0a, emissiveIntensity: 1.5, flatShading: true }, 0xffa040, 1))); scene.add(s.v); }
        { const k = Math.min(1, s.t / s.dur); const tgt = V(s.x, s.y, 0.2); s.v.position.set(tgt.x + 2.3 * (1 - k), 0.2 + 5.3 * (1 - k), tgt.z - 1.2 * (1 - k)); s.v.rotation.x += dt * 8;
          for (let n = 0; n < 3; n++) emit(s.v.position.x + (Math.random() - 0.5) * 0.2, s.v.position.y + (Math.random() - 0.5) * 0.2, s.v.position.z, 0.6, 0.8, 0, Math.random() < 0.5 ? '#ff7a1a' : '#ffd060', 0.18, 0.45, 0, 0.95); } break;
      case 'firezone': if (!s.v) { s.v = new THREE.Mesh(new THREE.CircleGeometry(s.R * K, 32).rotateX(-Math.PI / 2), addMat(0xff4a0a, 1.2, 0.5)); s.v.position.copy(V(s.x, s.y, 0.04)); scene.add(s.v); }
        s.v.material.opacity = 0.35 * Math.min(1, (s.dur - s.t) * 2) * (0.8 + 0.2 * Math.sin(s.t * 20));
        if (Math.random() < dt * 28) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * s.R; const p = V(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r, 0.05); emit(p.x, p.y, p.z, 0, 1 + Math.random(), 0, Math.random() < 0.5 ? '#ff7a1a' : '#ffcf5a', 0.12, 0.6, 0.3, 0.98); } break;
      case 'blizzard': if (!s.v) { s.v = new THREE.Mesh(new THREE.CircleGeometry(s.R * K, 32).rotateX(-Math.PI / 2), addMat(0x9ff0ff, 0.8, 0.35)); s.v.position.copy(V(s.x, s.y, 0.04)); scene.add(s.v); }
        s.v.material.opacity = 0.3 * Math.min(1, Math.max(0, s.dur + 0.3 - s.t) * 2);
        if (s.t < s.dur) for (let n = 0; n < 4; n++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * s.R; const p = V(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r, 0.2 + Math.random() * 1.4); emit(p.x, p.y, p.z, Math.cos(a + 1.6) * 1.2, -0.6, Math.sin(a + 1.6) * 1.2, '#e8fbff', 0.06, 0.6, 0, 0.98); } break;
      case 'pillar': if (s.t >= 0) { if (!s.v) { s.v = new THREE.Group(); for (let n = 0; n < 4; n++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.09 + Math.random() * 0.05, 0.6 + Math.random() * 0.4, 5), stylized({ color: 0xbff4ff, emissive: 0x3fb8ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.85, roughness: 0.1 }, 0xffffff, 1)); c.position.set((Math.random() - 0.5) * 0.25, 0.3, (Math.random() - 0.5) * 0.25); c.rotation.set((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4); s.v.add(c); } s.v.position.copy(V(s.x, s.y, 0)); scene.add(s.v); }
          const k = s.t / s.dur; s.v.scale.set(1, k < 0.15 ? k / 0.15 : k > 0.8 ? Math.max(0.01, (1 - k) / 0.2) : 1, 1); } break;
      case 'arrowrain': if (!s.v) s.v = true; for (const a of s.arr) { if (!a.hit && s.t >= a.t && s.t < a.t + 0.25) { const k = (s.t - a.t) / 0.25; const p = V(a.x, a.y, 2.2 * (1 - k)); emit(p.x, p.y, p.z, 0, -6, 0, '#9fe0ff', 0.06, 0.12, 0, 1); } } break;
      case 'tide': if (!s.v) { s.v = new THREE.Mesh(ringGeo, addMat(0x4ab8ff, 1.5, 0.9)); s.v.position.copy(V(s.x, s.y, 0.12)); scene.add(s.v); }
        { const r = s.R * easeOut(Math.min(1, s.t / s.dur)) * K; s.v.scale.set(Math.max(0.01, r), 1, Math.max(0.01, r * 0.6)); s.v.material.opacity = Math.max(0, 1 - Math.max(0, s.t - s.dur) * 4);
          for (let n = 0; n < 2; n++) { const a = Math.random() * 6.28; const p = V(s.x + Math.cos(a) * r / K, s.y + Math.sin(a) * r / K * 0.6, 0.15); emit(p.x, p.y, p.z, Math.cos(a) * 0.5, 0.9, Math.sin(a) * 0.5, Math.random() < 0.5 ? '#bfe8ff' : '#4ab8ff', 0.1, 0.45, -2, 0.97); } } break;
      case 'judg': if (!s.v) { s.v = new THREE.Mesh(pillarGeo, new THREE.ShaderMaterial({ ...pillarShader, uniforms: { uC: { value: new THREE.Color(0xffd070).multiplyScalar(1.6) }, uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); s.v.scale.set(1.3, 1.4, 1.3); scene.add(s.v); }
        s.v.position.copy(V(s.x, s.y, 0)); s.v.material.uniforms.uA.value = s.t < s.dur ? 1 : Math.max(0, 1 - (s.t - s.dur) * 3);
        if (s.t < s.dur) { const p = V(s.x + (Math.random() - 0.5) * 34, s.y, 0.1); emit(p.x, p.y, p.z, 0, 2.5 + Math.random() * 1.5, 0, Math.random() < 0.5 ? '#fff0b0' : '#ffb040', 0.1, 0.6, 0, 0.98); } break;
    }
  }
}
// drops
const DROP_GEO = { stone: new THREE.OctahedronGeometry(0.11).scale(0.8, 1.3, 0.8), feather: (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(0.08, 0.12, 0, 0.3); s.quadraticCurveTo(-0.08, 0.12, 0, 0); return new THREE.ShapeGeometry(s).translate(0, -0.15, 0); })(),
  jewel: new THREE.SphereGeometry(0.08, 12, 8), pend: new THREE.TorusGeometry(0.08, 0.02, 6, 16), ring: new THREE.TorusGeometry(0.07, 0.025, 6, 16), crystal: new THREE.OctahedronGeometry(0.14).scale(0.6, 1.6, 0.6) };
function dropGeo(k) { return SK.includes(k) ? DROP_GEO.stone : k === 'f' ? DROP_GEO.feather : k === 'pd' ? DROP_GEO.pend : k === 'rg' ? DROP_GEO.ring : k === 'sc' ? DROP_GEO.crystal : DROP_GEO.jewel; }
function spawnDrop3(d) { const col = new THREE.Color(ITEMS[d.k].col); const m = new THREE.Mesh(dropGeo(d.k), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.2, metalness: 0.6, roughness: 0.25, side: THREE.DoubleSide, transparent: true }));
  if (['x', 't', 'sc', 'pd'].includes(d.k)) { const b = new THREE.Mesh(pillarGeo, new THREE.ShaderMaterial({ ...pillarShader, uniforms: { uC: { value: col.clone() }, uA: { value: 0.6 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); b.scale.set(0.3, 0.5, 0.3); m.userData.beam = b; scene.add(b); }
  scene.add(m); d.m = m; }
function removeDrop3(d) { if (d.m) { scene.remove(d.m); if (d.m.userData.beam) scene.remove(d.m.userData.beam); d.m.material.dispose(); d.m = null; } }
function syncDrops(dt, t) { for (const d of S.drops) { if (!d.m) continue; const p = V(d.x, d.y, d.z + 0.12);
  if (d.state === 'fly') { const k = d.t / 0.5; p.y += k * 1.6; d.m.material.opacity = 1 - k; d.m.scale.setScalar(1 + k); } d.m.position.copy(p); d.m.rotation.y = t * 2 + d.x; if (d.m.userData.beam) d.m.userData.beam.position.set(p.x, 0, p.z); } }

// ---------- camera fit ----------
const camTarget = new THREE.Vector3(); let camDist = 20; const PITCH = 0.98;
function fitCamera() {
  const portrait = innerHeight > innerWidth; camera.fov = portrait ? 40 : 34; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  const topM = (MAPS[CUR_MAP] && MAPS[CUR_MAP].coop ? 116 : 70) / innerHeight * 2, botM = 92 / innerHeight * 2; const coop = MAPS[CUR_MAP] && MAPS[CUR_MAP].coop; const yT = coop ? 200 : 250, yB = coop ? 810 : 830; const corners = [V(45, yT), V(coop ? 520 : 495, yT), V(45, yB), V(coop ? 520 : 495, yB)];
  camTarget.set(0, 0, 0);
  for (let it = 0; it < 4; it++) {
    let lo = 4, hi = 80; for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; placeCam(mid); camera.updateMatrixWorld(); let ok = true; for (const c of corners) { tA.copy(c).project(camera); if (Math.abs(tA.x) > 1.02 || tA.y > 1 - topM || tA.y < -1 + botM) { ok = false; break; } } if (ok) hi = mid; else lo = mid; }
    camDist = hi; placeCam(camDist); camera.updateMatrixWorld();
    const yt = tA.copy(V(270, yT)).project(camera).y, yb = tB.copy(V(270, yB)).project(camera).y; const want = ((1 - topM) + (-1 + botM)) / 2; const have = (yt + yb) / 2;
    camTarget.z += (want - have) * camDist * 0.35;
  }
}
function placeCam(d) { camera.position.set(camTarget.x, camTarget.y + Math.sin(PITCH) * d, camTarget.z + Math.cos(PITCH) * d); camera.lookAt(camTarget); }

// ---------- post-processing ----------
function makeComposer() { const w = innerWidth, h = innerHeight; const rt = new THREE.WebGLRenderTarget(w * DPR, h * DPR, { type: THREE.HalfFloatType, samples: 4 }); const c = new EffectComposer(renderer, rt); c.setPixelRatio(DPR); c.setSize(w, h);
  c.addPass(new RenderPass(scene, camera)); c.addPass(new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.55, 0.45, 0.95)); c.addPass(new OutputPass()); return c; }
let composer = makeComposer();
function onResize() { renderer.setSize(innerWidth, innerHeight); fitCamera(); composer.dispose?.(); composer = makeComposer(); const s = innerHeight * DPR * 0.5; pMat.uniforms.uScale.value = s; moteMats.forEach(m => m.uniforms.uScale.value = s); }
addEventListener('resize', onResize);

// ---------- HUD ----------
const ICON = {
  stone: c => `<svg viewBox="0 0 24 24"><path d="M12 2l7 7-7 13-7-13z" fill="${c}" stroke="#000" stroke-width="1"/><path d="M5 9h14M12 2l-3 7 3 13 3-13z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="0.8"/></svg>`,
  f: c => `<svg viewBox="0 0 24 24"><path d="M5 20C8 12 13 6 20 3c-1 7-6 13-14 16z" fill="${c}" stroke="#000" stroke-width="1"/><path d="M5 20L17 7" stroke="#fff8d0" stroke-width="1"/></svg>`,
  jewel: c => `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="${c}" stroke="#000" stroke-width="1"/><circle cx="9.5" cy="9.5" r="2" fill="rgba(255,255,255,.7)"/></svg>`,
  pd: c => `<svg viewBox="0 0 24 24"><path d="M5 4c1 6 13 6 14 0" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M12 10l4 5-4 6-4-6z" fill="${c}" stroke="#000" stroke-width="1"/></svg>`,
  rg: c => `<svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="6" fill="none" stroke="${c}" stroke-width="2.6"/><path d="M9 6h6l-3 4z" fill="${c}" stroke="#000" stroke-width=".8"/></svg>`,
  sc: c => `<svg viewBox="0 0 24 24"><path d="M12 1l4 8-4 14-4-14z" fill="${c}" stroke="#fff" stroke-width=".8"/><path d="M3 12h18M12 3v18" stroke="rgba(255,255,255,.5)" stroke-width=".7"/></svg>`
};
const icon = k => (SK.includes(k) ? ICON.stone : k === 'f' ? ICON.f : k === 'pd' ? ICON.pd : k === 'rg' ? ICON.rg : k === 'sc' ? ICON.sc : ICON.jewel)(ITEMS[k].col);
const invEl = $('inv'); const invBtn = {};
for (const k of IKEYS) { const b = document.createElement('button'); b.style.setProperty('--c', ITEMS[k].col); b.innerHTML = icon(k) + '<b>0</b>'; b.setAttribute('aria-label', ITEMS[k].name); b.title = ITEMS[k].name + ' — ' + ITEMS[k].desc; invEl.appendChild(b); invBtn[k] = b;
  b.addEventListener('click', () => { if (['jb', 'js', 'pd', 'rg', 'f', 'sc'].includes(k)) log('Chạm vào anh hùng để dùng ' + ITEMS[k].name, ITEMS[k].col); else openForge(); }); }
document.querySelectorAll('[data-ic]').forEach(s => s.outerHTML = icon(s.dataset.ic));
function pulseInv(k) { const b = invBtn[k]; if (!b) return; b.classList.add('pulse'); setTimeout(() => b.classList.remove('pulse'), 300); }
const lastInv = {};
function updateHud() {
  const coop = MODE === 'coop';
  $('hWave').firstChild.nodeValue = 'ĐỢT ' + S.wave; $('hMap').textContent = coop ? '🛡 LIÊN MINH' : S.auto ? '● TỰ ĐỘNG' : MAPS[CUR_MAP].name; $('hMap').style.color = coop ? '#9dffb4' : S.auto ? '#7dff9a' : '';
  $('teams').classList.toggle('hide', !coop); $('chat').classList.toggle('hide', !coop); $('log').classList.toggle('hide', coop); $('bossbar').classList.toggle('coop', coop);
  if (coop) { const mvp = [0, 1, 2].sort((a, b) => S.score[b] - S.score[a])[0];
    $('teams').innerHTML = [1, 0, 2].map(t => `<div class="${t === 0 ? 'me' : ''}" style="--c:${TEAMS[t].col}"><b>${mvp === t && S.score[t] > 0 ? '👑 ' : ''}${TEAMS[t].short} ${S.tmode[t] === 'hunt' ? '⚔' : '🛡'}</b><big>${S.score[t]}</big><small>quái hạ · đồ ${S.loot[t]}</small></div>`).join(''); }
  document.querySelector('.orb small').textContent = coop ? 'THÁNH VẬT' : 'THÁNH THẠCH';
  const prog = S.phase === 'fight' ? Math.min(1, S.waveDone / S.waveTotal) : 0; $('hProg').style.transform = `scaleX(${prog})`;
  $('hProgT').textContent = S.phase === 'fight' ? `${S.waveDone} / ${S.waveTotal}` : 'Chuẩn bị...';
  $('hProgS').textContent = S.phase === 'fight' ? 'Quái còn lại: ' + (S.waveTotal - S.waveDone) : 'Đợt kế tiếp sau ' + Math.max(0, Math.ceil(S.breakT)) + 's';
  const boss = S.en.find(e => ET[e.t].boss); $('bossbar').classList.toggle('hide', !boss); $('log').classList.toggle('boss', !!boss);
  if (boss) { $('bossName').textContent = ET[boss.t].name.toUpperCase(); $('bossHp').style.transform = `scaleX(${Math.max(0, boss.hp / boss.max)})`; }
  $('hpTxt').textContent = Math.round(S.hp); $('hpFill').style.transform = `scaleY(${S.hp / 100})`;
  for (const k of IKEYS) if (lastInv[k] !== S.inv[k]) { lastInv[k] = S.inv[k]; const n = S.inv[k]; invBtn[k].querySelector('b').textContent = n > 999 ? Math.floor(n / 1000) + 'k' : n; invBtn[k].style.opacity = n ? 1 : 0.55; }
  $('bAuto').classList.toggle('on', S.auto && !coop); $('bAuto').setAttribute('aria-pressed', String(S.auto)); $('bAuto').firstChild.nodeValue = coop ? 'CHAT' : 'TỰ ĐỘNG'; $('bAutoT').textContent = coop ? '💬' : S.auto ? 'BẬT' : 'TẮT';
  $('bSpd').classList.toggle('on', S.speed > 1); $('bSpdT').textContent = 'x' + S.speed;
  $('callWave').classList.toggle('hide', !(S.phase === 'break' && !S.auto && S.running && !coop));
  relicLbl.style.display = coop ? '' : 'none';
}
const relicLbl = document.createElement('div'); relicLbl.className = 'lbl relic'; labelsEl.appendChild(relicLbl); relicLbl.style.display = 'none';
function updateHeroLabels() {
  if (MODE === 'coop') { const [sx0, sy] = toScreen(V(SH.x, SH.y, 3.1)); const sx = Math.min(innerWidth - 50, Math.max(50, sx0)); relicLbl.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-100%)`; const RL = S.relic; relicLbl.innerHTML = `THÁNH VẬT Lv ${RL.lv}<i style="--x:${RL.lv >= RLMAX ? 100 : Math.min(100, RL.exp / rneed(RL.lv) * 100)}%"></i>`; }
  S.heroes.forEach((h, i) => { const h3 = HERO3D[i]; if (!h3 || !h3.label) return; const P = S.hpos[i]; const [sx, sy, vis] = toScreen(V(P.x, P.y, -0.02));
    const L = h3.label; if (!vis) { L.el.style.display = 'none'; return; } L.el.style.display = ''; L.el.style.transform = `translate(${sx}px,${sy + 4}px) translate(-50%,0)`;
    const bot = teamOf(i) !== 0; const txt = (h.evo ? '★ ' : '') + 'Lv ' + h.lv; if (L.n.textContent !== txt) { L.n.textContent = txt; L.n.style.color = bot ? TEAMS[teamOf(i)].col : h.evo ? '#ffe08a' : UT[h.type].col; }
    L.el.style.opacity = bot ? 0.75 : 1; L.badge.classList.toggle('hide', bot || !upgradable(h)); L.mp.style.transform = `scaleX(${h.mp / maxMP(h)})`; });
}

// ---------- hero panel (same controls as the original) ----------
const panel = $('panel');
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function openPanel(i) { closeForge(); S.sel = i; panel.classList.remove('hide'); refreshPanel(); }
function closePanel() { S.sel = -1; panel.classList.add('hide'); }
function refreshPanel() { if (S.sel < 0) return; const h = S.heroes[S.sel], T = UT[h.type], st = hstats(h), r = rates(h);
  const pp = $('pPort'); pp.textContent = T.icon; pp.style.color = h.evo ? '#ffe08a' : T.col;
  $('pName').textContent = (h.evo ? '★ ' : '') + hname(h); $('pName').style.color = h.evo ? '#ffe08a' : T.col; $('pLv').textContent = 'Cấp ' + h.lv + '/' + lvCap(h) + (h.evo ? ' · Tiến hóa II' : '');
  const k = h.lv >= lvCap(h) ? 1 : h.exp / need(h.lv); $('pXp').style.width = (k * 100).toFixed(1) + '%'; $('pXpT').textContent = h.lv >= lvCap(h) ? (canEvolve(h) ? 'Đạt cấp 99 — hãy Tiến hóa!' : 'Đã đạt cấp tối đa') : `${Math.floor(h.exp)} / ${need(h.lv)} EXP`;
  $('sDmg').textContent = Math.round(st.dmg); $('sSpd').textContent = (1 / st.rate).toFixed(2) + '/s'; $('sRng').textContent = st.range;
  $('pSkills').innerHTML = SKILLS[h.type].map((sk, j) => { const on = hasSk(h, j), c = ELC[sk.el[0]]; const cdl = on ? (h.sk[j] <= 0.05 ? '<span style="color:#7dff9a">sẵn sàng</span>' : 'hồi ' + Math.ceil(h.sk[j]) + 's') : 'mở khóa ở Lv ' + sk.lv;
    return `<div class="skc${on ? '' : ' lk'}"><div class="ic" style="background:${hexA(c, 0.18)};border:1.5px solid ${c}">${ELI[sk.el[0]]}</div><div><b style="color:${c}">${sk.name}</b>${sk.el.map(e => `<span class="el" style="background:${hexA(ELC[e], 0.2)};color:${ELC[e]}">${ELN[e]}</span>`).join('')} <span style="color:#9a907a">· ${sk.cd}s · <span style="color:#5ab0ff">${SKC[j]} Mana</span> · ${cdl}</span><br>${sk.act}<br><span style="color:#f2d27a">Nội tại:</span> ${sk.pas}</div></div>`; }).join('');
  $('sMP').textContent = Math.floor(h.mp) + '/' + maxMP(h); $('sBon').textContent = '+' + (Math.round(((1 + 0.001 * h.jb + 0.002 * h.js) * (1 + 0.01 * h.pend) * (1 + 0.1 * (h.sc || 0)) * (h.evo ? 1.3 : 1) - 1) * 1000) / 10) + '%';
  $('sEvo').textContent = h.evo ? TITLE2[h.type] : 'Cấp I · ' + T.name; $('sCap').textContent = h.evo ? 'giới hạn cấp 200' : 'mở ở cấp 99';
  $('sEvoT').innerHTML = h.evo ? '<span style="color:#ffe08a">★ Đã tiến hóa:</span> +30% sát thương · +10% tốc đánh · +20% kỹ năng · +10 tầm đánh · cấp tối đa 200' : 'Tiến hóa thành <b style="color:#ffe08a">' + TITLE2[h.type] + '</b>: +30% sát thương, +10% tốc đánh, +20% kỹ năng, +10 tầm, mở giới hạn cấp <b>200</b>, thưởng 10 điểm tiềm năng.';
  const be = $('bEvo'); be.style.display = h.evo ? 'none' : ''; be.disabled = !canEvolve(h); be.innerHTML = canEvolve(h) ? '✦ TIẾN HÓA NGAY ✦<small>' + TITLE2[h.type] + '</small>' : 'Cần đạt cấp 99<small>hiện tại cấp ' + h.lv + '</small>';
  const ns = h.sc || 0; $('aSC').textContent = S.inv.sc; $('uSC').textContent = ns; $('pSC').textContent = ns ? `+${ns * 10}% sức mạnh · +${ns * 20} tấn công · +${ns * 5}% tốc đánh · +${ns * 2}% phép` : 'chưa dùng';
  $('aJB').textContent = S.inv.jb; $('uJB').textContent = h.jb; $('pJB').textContent = (Math.round(h.jb * 1) / 10); $('aJS').textContent = S.inv.js; $('uJS').textContent = h.js; $('pJS').textContent = (Math.round(h.js * 2) / 10);
  $('aPD').textContent = S.inv.pd; $('lPD').textContent = h.pend; $('bPD').textContent = h.pend; $('mPD').textContent = h.pend ? (Math.round(pendRec(h.pend) * 1000) / 10) + '%' : '0%'; $('aRG').textContent = S.inv.rg; $('lRG').textContent = h.ring; $('bRG').textContent = h.ring;
  for (const [a, dis] of [['jb1', S.inv.jb <= 0], ['jbA', S.inv.jb <= 0], ['js1', S.inv.js <= 0], ['jsA', S.inv.js <= 0], ['pd1', S.inv.pd <= 0 || h.pend >= ACCMAX], ['pdA', S.inv.pd <= 0 || h.pend >= ACCMAX], ['rg1', S.inv.rg <= 0 || h.ring >= ACCMAX], ['rgA', S.inv.rg <= 0 || h.ring >= ACCMAX], ['sc1', S.inv.sc <= 0], ['scA', S.inv.sc <= 0]]) panel.querySelector('[data-a=' + a + ']').disabled = dis;
  const pc = v => (Math.round(v * 1000) / 10) + '%'; $('sC').textContent = pc(r.crit); $('sP').textContent = pc(r.perf); $('sD').textContent = pc(r.dbl); $('sT').textContent = pc(r.tri); $('sX').textContent = pc(r.ult); $('sAvg').textContent = '×' + avgMult(h).toFixed(2);
  $('sPts').textContent = h.pts; $('sStr').textContent = h.str; $('sAgi').textContent = h.agi; $('sSkill').textContent = T.skill;
  panel.querySelector('[data-a=str]').disabled = h.pts <= 0; panel.querySelector('[data-a=agi]').disabled = h.pts <= 0; panel.querySelector('[data-a=autopts]').disabled = h.pts <= 0;
  for (const s of SK) { $('i' + s.toUpperCase()).textContent = S.inv[s]; panel.querySelector('[data-a=' + s + ']').disabled = S.inv[s] <= 0 || !canStone(h, s); }
  $('iF').textContent = S.inv.f; $('pUsed').innerHTML = `<span><b style="color:#4aa8ff">${h.st.c}</b>Sơ Cấp</span><span><b style="color:#4cff6a">${h.st.p}</b>Cao Cấp</span><span><b style="color:#c87aff">${h.st.d}</b>Huyền Bí</span><span><b style="color:#ff4a4a">${h.st.t}</b>Tối Thượng</span><span><b style="color:#ffd23a">${h.st.x}</b>Thần Thánh</span><span><b style="color:#ffd85a">${featherUsed(h)}</b>Lông Vũ</span><span><b style="color:#e6dcff">${h.sc || 0}</b>Tĩnh Lặng</span>`;
  $('sWing').textContent = WNAME[h.wing] + (h.wing ? ` (+${Math.round((WINGM[h.wing] - 1) * 100)}% ST)` : '');
  const bw = $('bWing'); if (h.wing >= WMAX) { bw.innerHTML = 'Cánh đã đạt cấp tối đa<small>+150% sát thương</small>'; bw.disabled = true; } else { bw.innerHTML = `${h.wing ? 'Nâng cấp' : 'Chế tạo'} ${WNAME[h.wing + 1]} — ${WCOST[h.wing]} lông vũ<small>+${Math.round((WINGM[h.wing + 1] - 1) * 100)}% sát thương</small>`; bw.disabled = S.inv.f < WCOST[h.wing]; }
}
panel.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; const a = b.dataset.a; if (S.sel < 0) return; const h = S.heroes[S.sel];
  if (a === 'close') { closePanel(); return; } else if (a === 'prev' || a === 'next') { const ids = S.heroes.map((h, k) => k).filter(k => teamOf(k) === 0); const q = ids.indexOf(S.sel); S.sel = ids[(q + (a === 'prev' ? ids.length - 1 : 1)) % ids.length]; }
  else if (a === 'str' || a === 'agi') spendPt(h, a); else if (a === 'autopts') autoPts(h); else if (SK.includes(a)) useStone(S.sel, a); else if (a === 'jb1' || a === 'jbA') useJewel(S.sel, 'jb', a === 'jbA'); else if (a === 'js1' || a === 'jsA') useJewel(S.sel, 'js', a === 'jsA');
  else if (a === 'pd1' || a === 'pdA') upgradeAcc(S.sel, 'pd', a === 'pdA'); else if (a === 'rg1' || a === 'rgA') upgradeAcc(S.sel, 'rg', a === 'rgA'); else if (a === 'forge') { openForge(); return; } else if (a === 'wing') craftWing(S.sel); else if (a === 'evo') evolve(S.sel); else if (a === 'sc1' || a === 'scA') useSilence(S.sel, a === 'scA');
  refreshPanel(); });
const forge = $('forge');
function openForge() { closePanel(); forge.classList.remove('hide'); buildForge(); }
function closeForge() { forge.classList.add('hide'); }
function buildForge() { const box = $('forgeRows'); if (!box.dataset.b) { box.dataset.b = '1'; box.innerHTML = FORGE.map(([f, t]) => `<div class="frow">${icon(f)}<div class="ft"><b style="color:${ITEMS[f].col}">3 × ${ITEMS[f].name.replace('Linh Thạch ', '')}</b> → <b style="color:${ITEMS[t].col}">1 × ${ITEMS[t].name.replace('Linh Thạch ', '')}</b><br>Đang có: <span id="fc_${f}"></span> · <span style="color:${ITEMS[t].col}">${ITEMS[t].desc}</span></div>${icon(t)}<button data-f="one" data-k="${f}">Hợp 1</button><button data-f="all" data-k="${f}">Hợp hết</button></div>`).join(''); }
  for (const [f] of FORGE) { $('fc_' + f).textContent = S.inv[f]; box.querySelectorAll(`[data-k="${f}"]`).forEach(b => b.disabled = S.inv[f] < 3); } }
forge.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; const a = b.dataset.f; if (a === 'close') { closeForge(); return; }
  if (a === 'chain') { for (const [f, t] of FORGE) forgeAll(f, t); } else { const pair = FORGE.find(p => p[0] === b.dataset.k); if (pair) { a === 'one' ? forgeOne(pair[0], pair[1]) : forgeAll(pair[0], pair[1]); } } buildForge(); });

// ---------- save / load ----------
const SKEY = 'htvb3d_save'; let SAVE = null;
const Store = { db: null, uid: null, writing: false, pending: null };
function snapshot() { const sp = MODE === 'coop' ? SPPROG : { wave: S.wave, hp: S.hp }; return { v: 1, ts: Date.now(), wave: sp.wave, hp: Math.max(1, Math.round(sp.hp)), auto: S.auto, speed: S.speed, inv: { ...S.inv }, relic: { ...(S.relic || { lv: 1, exp: 0 }) }, best, heroes: S.profile.map(h => ({ type: h.type, lv: h.lv, exp: Math.floor(h.exp), pts: h.pts, str: h.str, agi: h.agi, st: { ...h.st }, wing: h.wing, jb: h.jb, js: h.js, pend: h.pend, ring: h.ring, sc: h.sc || 0, evo: h.evo || 0 })) }; }
function clearBoard() { if (!S) return; for (const e of S.en) removeMob3(e, false); for (const p of S.pr) removeProj3(p); for (const d of S.drops) removeDrop3(d); for (const s of S.sk) if (s.v && s.v !== true) scene.remove(s.v); for (const f of (S.rfb || [])) scene.remove(f.m); }
function applySave(d) { clearBoard(); MODE = 'sp'; S = newState(); S.wave = d.wave || 1; S.hp = d.hp || 100; S.auto = !!d.auto; S.speed = d.speed || 1; S.inv = Object.assign({ c: 0, p: 0, d: 0, t: 0, x: 0, f: 0, jb: 0, js: 0, pd: 0, rg: 0, sc: 0 }, d.inv || {}); S.relic = Object.assign({ lv: 1, exp: 0 }, d.relic || {});
  (d.heroes || []).forEach(o => { const i = HORDER.indexOf(o.type); if (i < 0) return; Object.assign(S.heroes[i], { lv: o.lv || 1, exp: o.exp || 0, pts: o.pts || 0, str: o.str || 0, agi: o.agi || 0, st: Object.assign({ c: 0, p: 0, d: 0, t: 0, x: 0 }, o.st || {}), wing: Math.min(WMAX, o.wing || 0), jb: o.jb || 0, js: o.js || 0, pend: Math.min(ACCMAX, o.pend || 0), ring: Math.min(ACCMAX, o.ring || 0), sc: o.sc || 0, evo: o.evo ? 1 : 0 }); });
  setMap(mapFor(S.wave)); S.breakT = S.auto ? 1.5 : 15; }
// cloud save: each player's own private document, newest copy wins (same scheme as the 2D original)
async function initStore() { try { if (window.claude && typeof window.claude.use === 'function') { const db = await window.claude.use('db'); const u = await window.claude.use('user'); if (db && u) { const id = await u.id(); if (id) { Store.db = db; Store.uid = id; } } } } catch (e) { } await refreshSave(); }
async function readSave() { let b = null; try { const l = JSON.parse(localStorage.getItem(SKEY) || 'null'); if (l && l.v) b = l; } catch (e) { }
  if (Store.db) { try { const s = await Promise.race([Store.db.doc(`data/users/${Store.uid}/save`).get(), new Promise((_, r) => setTimeout(() => r('timeout'), 9000))]); if (s && s.exists) { const d = s.data(); if (d && d.v && (!b || d.ts > b.ts)) b = JSON.parse(JSON.stringify(d)); } } catch (e) { } }
  return b; }
async function refreshSave() { SAVE = await readSave(); if (SAVE && SAVE.best > best) best = SAVE.best; updateStartUI(); }
async function saveGame(quiet) { if (MODE === 'sp' && (S.over || S.hp <= 0)) return false; const d = snapshot(); SAVE = d; let local = false; try { localStorage.setItem(SKEY, JSON.stringify(d)); local = true; } catch (e) { }
  let cloud = false; if (Store.db) { Store.pending = d; if (!Store.writing) { Store.writing = true; while (Store.pending) { const x = Store.pending; Store.pending = null; try { await Store.db.doc(`data/users/${Store.uid}/save`).set(x); cloud = true; } catch (e) { cloud = false; } } Store.writing = false; } else cloud = true; }
  if (quiet) log(MODE === 'coop' ? 'Đã lưu tiến trình nhân vật & vật phẩm' : 'Đã tự động lưu (đợt ' + d.wave + ')', '#9fe8d0');
  return { local, cloud, any: local || cloud }; }
function updateStartUI() { const c = $('contBtn'); if (SAVE) { c.classList.remove('hide'); c.textContent = 'TIẾP TỤC · ĐỢT ' + SAVE.wave; } else c.classList.add('hide'); if (best) $('bestTxt').textContent = 'Kỷ lục: đợt ' + best;
  $('cloudTxt').textContent = Store.db ? 'Tiến trình được lưu lên tài khoản của bạn — mở trên máy khác vẫn chơi tiếp được.' : 'Tiến trình chỉ lưu trên trình duyệt này.'; }

// ---------- start / pause / input ----------
$('legend').innerHTML = HORDER.map(t => `<div><i style="color:${UT[t].col};background:${UT[t].col}"></i><span><b style="color:${UT[t].col}">${UT[t].name}</b>${UT[t].skill}</span></div>`).join('');
function beginRun() { $('startOv').classList.add('hide'); $('overOv').classList.add('hide'); $('pauseOv').classList.add('hide'); $('mpSelOv').classList.add('hide'); $('mpEndOv').classList.add('hide'); $('hud').classList.remove('hide'); S.running = true; buildHeroes3D(); fitCamera(); renderChat(); updateHud(); }
function toMenu() { const d = snapshot(); closePanel(); closeForge(); closeMp(); applySave(d); buildHeroes3D(); fitCamera(); $('hud').classList.add('hide'); for (const h3 of HERO3D) if (h3.label) h3.label.el.style.visibility = 'hidden'; $('startOv').classList.remove('hide'); updateStartUI(); }
$('playBtn').onclick = () => { clearBoard(); MODE = 'sp'; S = newState(); setMap(0); beginRun(); log('Bảo vệ Thánh Thạch! Chạm vào anh hùng để nâng cấp.', '#9fe8d0'); };
$('contBtn').onclick = () => { if (!SAVE) return; applySave(SAVE); beginRun(); log('Đã tải bản lưu – Đợt ' + S.wave, '#9fe8d0'); };
$('loadBtn').onclick = () => { if (!SAVE) return; applySave(SAVE); beginRun(); };
$('againBtn').onclick = () => { clearBoard(); MODE = 'sp'; S = newState(); setMap(0); beginRun(); };
function setPaused(p) { S.paused = p; $('pauseOv').classList.toggle('hide', !p); if (p) { $('newGameBtn').classList.toggle('hide', MODE === 'coop'); $('menuBtn').textContent = MODE === 'coop' ? 'Rời trận & về menu' : 'Về menu chính'; $('pauseInfo').innerHTML = (MODE === 'coop' ? 'Liên minh 3 đội · ' : '') + `Đợt <b>${S.wave}</b> · ${MODE === 'coop' ? 'Thánh Vật' : 'Thánh Thạch'} <b>${Math.round(S.hp)}</b>/100` + (SAVE ? `<br>Bản lưu gần nhất: đợt ${SAVE.wave}` : ''); $('autoBtn').textContent = 'Tự động: ' + (S.auto ? 'BẬT' : 'TẮT'); $('autoBtn').classList.toggle('on', S.auto); $('saveMsg').textContent = ''; $('newGameBtn').textContent = 'Chơi mới'; $('newGameBtn').dataset.c = ''; } }
$('bPause').onclick = () => setPaused(true);
$('resumeBtn').onclick = () => setPaused(false);
$('saveBtn').onclick = async () => { $('saveMsg').textContent = 'Đang lưu...'; const r = await saveGame(false); $('saveMsg').textContent = r && r.any ? `Đã lưu đợt ${SAVE.wave} lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}${Store.db ? (r.cloud ? ' (đám mây + máy này)' : ' (chỉ máy này)') : ''}.` : 'Không lưu được trên trình duyệt này.'; };
$('autoBtn').onclick = () => { S.auto = !S.auto; $('autoBtn').textContent = 'Tự động: ' + (S.auto ? 'BẬT' : 'TẮT'); $('autoBtn').classList.toggle('on', S.auto); };
$('menuBtn').onclick = async () => { await saveGame(true); setPaused(false); toMenu(); };
$('newGameBtn').onclick = () => { const b = $('newGameBtn'); if (!b.dataset.c) { b.dataset.c = '1'; b.textContent = 'Chạm lần nữa để xác nhận'; return; } try { localStorage.removeItem(SKEY); } catch (e) { } SAVE = null; if (Store.db) Store.db.doc(`data/users/${Store.uid}/save`).delete().catch(() => { }); clearBoard(); MODE = 'sp'; S = newState(); setMap(0); beginRun(); };
$('bAuto').onclick = () => { if (MODE === 'coop') { if (mpMenu.classList.contains('hide')) openMp(); else closeMp(); return; } S.auto = !S.auto; log(S.auto ? 'Tự động: BẬT — tự gọi đợt & cộng điểm (không dùng vật phẩm)' : 'Tự động: TẮT', S.auto ? '#7dff9a' : '#d8ccb0'); };
$('bSpd').onclick = () => { S.speed = S.speed % 3 + 1; };
$('callWave').onclick = () => { if (S.phase === 'break') S.breakT = 0; };
renderer.domElement.addEventListener('pointerdown', ev => { if (!S.running || S.paused) return; const x = ev.clientX, y = ev.clientY;
  for (const d of S.drops) { if (d.state !== 'ground' || !d.m || d.owner) continue; const [sx, sy] = toScreen(d.m.position); if (Math.hypot(sx - x, sy - y) < 28) { collect(d); return; } }
  let hi = -1, bd = 46; S.heroes.forEach((h, i) => { if (teamOf(i) !== 0) return; const P = S.hpos[i]; const [sx, sy] = toScreen(V(P.x, P.y, 0.6)); const dd = Math.hypot(sx - x, sy - y); if (dd < bd) { bd = dd; hi = i; } });
  if (hi >= 0) { if (S.sel === hi) closePanel(); else openPanel(hi); return; }
  closePanel(); closeForge(); closeMp(); });
addEventListener('keydown', e => { if (!S.running) return; if (e.code === 'Escape') { if (!panel.classList.contains('hide') || !forge.classList.contains('hide')) { closePanel(); closeForge(); } else setPaused(!S.paused); } if (e.code === 'Space' && S.phase === 'break') { e.preventDefault(); S.breakT = 0; } });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.running && !S.over) { saveGame(false); if (!S.paused) setPaused(true); } });

// ---------- alliance UI: chat, tactics, hero pick, results ----------
const chatEl = $('chat');
function renderChat() { if (MODE !== 'coop') { chatEl.innerHTML = ''; return; } chatEl.innerHTML = S.chat.slice(-4).map(m => { const nm = m.team >= 0 ? `<b style="color:${TEAMS[m.team].col}">[${m.team === 0 ? 'Bạn' : TEAMS[m.team].cap}]</b> ` : ''; const sp = document.createElement('span'); sp.textContent = m.text; return `<div style="${m.col ? 'color:' + m.col : ''}">${nm}${sp.innerHTML}</div>`; }).join(''); }
const mpMenu = $('mpMenu');
function openMp() { closePanel(); closeForge(); mpMenu.classList.remove('hide'); refreshMp(); }
function closeMp() { mpMenu.classList.add('hide'); }
function refreshMp() { mpMenu.querySelectorAll('[data-m]').forEach(b => { if (['lane', 'hunt'].includes(b.dataset.m)) b.classList.toggle('on', S.tmode[0] === b.dataset.m); });
  const qc = $('qchat'); if (!qc.dataset.b) { qc.dataset.b = '1'; qc.innerHTML = QUICKC.map(([k, tx]) => `<button data-q="${k}">${tx}</button>`).join(''); } }
mpMenu.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; if (b.dataset.m === 'close') { closeMp(); return; }
  if (b.dataset.m) { S.tmode[0] = b.dataset.m; sysChat('Chiến thuật đội bạn: ' + (b.dataset.m === 'lane' ? 'Chặn đầu' : 'Săn boss & quái'), '#9fe8ff'); refreshMp(); return; }
  if (b.dataset.q) { playerSay(b.dataset.q); closeMp(); } });
function renderMpSel() { const mo = $('mpOff'); mo.innerHTML = [[0, 'Theo tiến độ'], [5, '+5 đợt'], [10, '+10 đợt']].map(([v, l]) => `<button class="btn2${MPOFF === v ? ' on' : ''}" data-o="${v}" style="margin:2px">${l}</button>`).join(''); mo.querySelectorAll('button').forEach(b => b.onclick = () => { MPOFF = +b.dataset.o; renderMpSel(); });
  $('mpGrid').innerHTML = HORDER.map(k => { const h = S.profile.find(x => x.type === k); const on = MPPICK.includes(k); return `<button class="mpc${on ? ' on' : ''}" data-k="${k}" aria-pressed="${on}"><i style="color:${UT[k].col};background:${UT[k].col}"></i><span><b style="color:${h.evo ? '#ffe08a' : UT[k].col}">${hname(h)}</b><br>Lv ${h.lv} · ${WNAME[h.wing]}</span></button>`; }).join('');
  $('mpGrid').querySelectorAll('.mpc').forEach(b => b.onclick = () => { const k = b.dataset.k; if (MPPICK.includes(k)) MPPICK = MPPICK.filter(x => x !== k); else if (MPPICK.length < 3) MPPICK.push(k); renderMpSel(); });
  $('mpGo').disabled = !MPPICK.length; $('mpGo').textContent = `VÀO TRẬN (${MPPICK.length}/3)`;
  $('mpInfo').innerHTML = `Bắt đầu từ <b>đợt ${Math.max(1, S.wave + MPOFF)}</b>. Đồng minh: <b style="color:${TEAMS[1].col}">Hồng Liên</b> (AI xông xáo) và <b style="color:${TEAMS[2].col}">Thanh Phong</b> (AI chi viện). Cấp độ, EXP và vật phẩm nhận được sẽ được giữ lại.`; }
function openMpSel() { const d = SAVE || snapshot(); applySave(d); MPPICK = []; renderMpSel(); $('startOv').classList.add('hide'); $('mpSelOv').classList.remove('hide'); }
$('coopBtn').onclick = openMpSel;
$('mpBack').onclick = () => { $('mpSelOv').classList.add('hide'); $('startOv').classList.remove('hide'); };
$('mpGo').onclick = () => { if (!MPPICK.length) return; startCoop(MPPICK.slice()); };
$('mpAgain').onclick = () => { $('mpEndOv').classList.add('hide'); toMenu(); $('startOv').classList.add('hide'); openMpSel(); };
$('mpHome').onclick = () => { $('mpEndOv').classList.add('hide'); toMenu(); };

// ---------- main loop ----------
setMap(0); fitCamera(); updateStartUI(); initStore();
const clock = new THREE.Clock(); let panelT = 0, fpsAcc = 0, fpsN = 0, fpsCheck = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05); const t = clock.elapsedTime; U.uTime.value = t;
  if (S.running && !S.over && !S.paused) { for (let k = 0; k < S.speed; k++) update(dt); }
  if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('banner').classList.remove('show'); }
  const sim = S.running && !S.paused ? dt * S.speed : 0;
  S.heroes.forEach((h, i) => syncHero3D(h, i, sim, t));
  for (const e of S.en) syncMob3(e, sim, t);
  updDying(dt); syncProj(sim); syncSkills(sim); syncDrops(sim, t);
  updateParticles(sim || dt * 0.3); updateFx(sim || dt); updateBolts(sim || dt);
  // shrine
  const cr = shrine.userData.crystal; cr.position.y = 1.25 + Math.sin(t * 1.6) * 0.08; cr.rotation.y = t * 0.6;
  shrineCrystalMat.emissive.setHex(S.shrineHit > 0 ? 0xff3a3a : MODE === 'coop' ? 0xffa030 : 0x3fe0ff); shrineCrystalMat.color.setHex(MODE === 'coop' ? 0xffe0a0 : 0x9ff8ff); shrineCrystalMat.emissiveIntensity = 1.2 + 0.4 * Math.sin(t * 3);
  for (let i = 0; i < 4; i++) { const s = shrine.userData['s' + i]; const a = t * 0.8 + i * Math.PI / 2; s.position.set(Math.cos(a) * 0.55, 1.1 + Math.sin(t * 2 + i) * 0.12, Math.sin(a) * 0.55); s.rotation.y = a; }
  // vents on the lava map
  for (const a of ambient) if (a.kind === 'vent' && Math.random() < dt * 4) emit(a.x + (Math.random() - 0.5) * 0.3, 0.05, a.z + (Math.random() - 0.5) * 0.2, 0, 0.6 + Math.random() * 0.5, 0, Math.random() < 0.5 ? '#ff7a2a' : '#ffd060', 0.07, 1.4, 0, 0.99);
  placeCam(camDist); if (S.shake > 0) { camera.position.x += (Math.random() - 0.5) * S.shake * 0.25; camera.position.y += (Math.random() - 0.5) * S.shake * 0.25; }
  updateHeroLabels();
  panelT -= dt; if (panelT <= 0) { panelT = 0.25; if (S.running) updateHud(); if (S.sel >= 0) refreshPanel(); if (!forge.classList.contains('hide')) buildForge(); }
  composer.render(dt);
  fpsAcc += dt; fpsN++; fpsCheck += dt;
  if (fpsCheck > 5 && DPR > 1) { if (fpsN / fpsAcc < 38) { DPR = Math.max(1, DPR - 0.5); renderer.setPixelRatio(DPR); onResize(); } fpsAcc = fpsN = fpsCheck = 0; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
</script>
