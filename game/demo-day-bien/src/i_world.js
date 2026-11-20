
// =====================================================================
// SHARED WORLD — AI bots that farm like players, parties, town NPCs, trading
// =====================================================================
const BOT_NAMES = ['LongHuyết', 'ThiênKiếm', 'BăngTâm', 'HỏaPhượng', 'LụcCung', 'TiểuLong', 'MinhNguyệt', 'HắcVũ', 'KimLân', 'PhongVân', 'TuyếtLiên', 'ThanhPhong', 'LôiĐiện', 'HoaRơi', 'ÁnhDương', 'DạXoa', 'NgọcTiêu', 'BạchHổ', 'ThầnPhong', 'VôSong'];
const SAY_TOWN = ['Ai đi Sa Mạc farm không?', 'Bán Bùa Chiến Thần, giá tốt!', 'Cần tổ đội đánh boss!', 'Vừa lên cấp, vui quá', 'Thu mua Linh Thạch nè', 'Ai có Lông Vũ Thần bán không?', 'Nghỉ tí rồi đi cày tiếp', 'Olympus quái đông lắm', 'Đồ +9 ai mua không?', 'Tối nay đi Thiên Giới nhé'];
const SAY_HUNT = ['Quái đông quá!', 'Boss sắp ra rồi', 'Hút máu ngon', 'Rơi đồ xịn rồi!', 'Cẩn thận tinh anh!', 'Cày tiếp nào', 'Gom quái lại đi'];
const SAY_NO = ['Bận cày rồi bạn ơi', 'Để lúc khác nhé', 'Mình đang có nhóm rồi', 'Cấp chênh quá'];
const isTown = () => !!MAPS[S.map].town;
function newBots() { return BOT_NAMES.map((name, i) => ({ id: 'b' + i, name, cls: CORDER[i % 5], hue: (i * 0.137) % 1, lv: clamp(Math.round(S.lv * rr(0.6, 1.5) + ri(0, 25)), 1, MAXLV), exp: 0,
  gold: ri(2000, 20000), map: Math.random() < 0.45 ? TOWN : 0, stT: rr(20, 200), inv: [], kills: 0 })).map(b => { if (b.map !== TOWN) b.map = pickMapFor(b.lv); for (let k = 0; k < 3; k++) botLoot(b, true); return b; }); }
function pickMapFor(lv) { let best = 0; for (let i = 0; i < MAPS.length; i++) if (!MAPS[i].town && MAPS[i].lo <= lv + 10) best = i; return Math.random() < 0.3 && best > 0 ? best - 1 : best; }
function botLoot(b, force) { if (b.inv.length >= 10) b.inv.shift();
  if (!force && Math.random() < 0.08) { const c = makeCharm(pick(['dmg', 'hp', 'mp']), b.lv); if (!stackInto(b.inv, c)) b.inv.push(c); return; }
  const q = Math.random(), r = q < 0.08 ? 3 : q < 0.3 ? 2 : q < 0.65 ? 1 : 0; const g = makeGear(Math.random() < 0.35 ? pick(AS_SLOTS) : pick(SLOT_ORDER), r, Math.max(1, b.lv - ri(0, 20)), r >= 1 && Math.random() < 0.4 ? MAPS[pickMapFor(b.lv)].set : null); if (r >= 1 && Math.random() < 0.5) g.plus = ri(1, 3 + r * 2); b.inv.push(g); }
function botGain(b, xp) { b.exp += xp; let up = false; while (b.lv < MAXLV && b.exp >= expNeed(b.lv)) { b.exp -= expNeed(b.lv); b.lv++; up = true; }
  const e = ents.get(b.id); if (up && e) { const st = botStats(b); e.maxHp = st.hp; e.hp = st.hp; fxRing(e.pos.x, e.pos.z, 0, 1.4, '#ffd27a', 0.6); e.el.querySelector('.nm').innerHTML = botName(b); } }
function botStats(b) { const C = CLS[b.cls], g = 1.4 + b.lv * 0.004; return { atk: (12 + b.lv * 3.2) * C.atk * g, hp: Math.round((380 + b.lv * 55) * C.hp * 1.8), def: b.lv * 3, aps: apsOf(C.aps, asRef(b.lv) * 0.85) }; }
const inParty = b => !!(S.party && S.party.members.includes(b.id));
const botName = b => `${inParty(b) ? (S.party.leader === b.id ? '♛ ' : '◆ ') : ''}${b.name} · Lv ${b.lv}`;

// ---------- 3D characters (same armored mannequin as the hero, each bot in its own colours) ----------
function charMats(hue, cls) { const c = (s, l) => new THREE.Color().setHSL(hue, s, l);
  return { suit: stylized({ color: c(0.5, 0.1), roughness: 0.75 }, 0x5d7dff, 0.25, 3), steel: stylized({ color: c(0.2, 0.68), metalness: 0.9, roughness: 0.28, envMapIntensity: 1.2 }, 0x8fe6ff, 0.45, 2.6),
    dark: stylized({ color: c(0.45, 0.2), metalness: 0.85, roughness: 0.34 }, 0x7fb8ff, 0.35, 2.6), gold: heroMats.gold, blade: heroMats.blade,
    cape: stylized({ color: c(0.7, 0.32), roughness: 0.7, side: THREE.DoubleSide, emissive: c(0.7, 0.08) }, 0x9f8bff, 0.5, 2), glow: new THREE.MeshBasicMaterial({ color: new THREE.Color(CLS[cls].glow).multiplyScalar(2.4) }) }; }
function makeChar(cls, hue, wingTier) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); scene.add(g);
  const model = SkeletonUtils.clone(heroGLTF.scene); const T3 = { tip: null }; buildArmor(model, cls, charMats(hue, cls), T3);
  const box = new THREE.Box3().setFromObject(model); const k = HERO_H / (box.max.y - box.min.y); model.scale.setScalar(k); model.position.y = -box.min.y * k; body.add(model);
  model.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  const mx = new THREE.AnimationMixer(model), acts = {}; for (const c of heroGLTF.animations) acts[c.name] = mx.clipAction(c);
  let wg = null, wR = null, wL = null; if (wingTier >= 0) { const wm = wingMat.clone(); wm.uniforms.uTime = U.uTime; const W = WTIER[Math.min(5, wingTier)]; wm.uniforms.uRoot.value.setHex(W[0]); wm.uniforms.uTip.value.setHex(new THREE.Color().setHSL(hue, 0.9, 0.5).getHex()); wm.uniforms.uEdge.value.setHex(W[2]); wm.uniforms.uB.value = 0.62 + wingTier * 0.05;
    wg = new THREE.Group(); wg.position.set(0, HERO_H * 0.66, -0.3 * HERO_H / 2.3); wg.scale.setScalar(HERO_H / 2.3 * 1.15 * WSCALE[Math.min(5, wingTier)]); body.add(wg);
    wR = new THREE.Mesh(wingGeo, wm); wR.position.x = 0.1; wg.add(wR); wL = new THREE.Mesh(wingGeo, wm); wL.scale.x = -1; wL.position.x = -0.1; wg.add(wL); }
  const shadow = blob(1.5); scene.add(shadow);
  const C = { g, body, model, mx, acts, cur: null, tip: T3.tip, wR, wL, shadow, melee: CLS[cls].melee, phase: rr(0, 6.28) };
  C.idle = C.melee ? 'Sword_Idle' : 'Spell_Simple_Idle_Loop'; C.atk = C.melee ? 'Sword_Attack' : 'Spell_Simple_Shoot';
  mx.addEventListener('finished', () => charPlay(C, C.idle, 0.25)); charPlay(C, C.idle, 0); return C;
}
function charPlay(C, name, dur, once = false, speed = 1) { const a = C.acts[name]; if (!a) return; if (C.cur === a && !once) return; a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = once; a.timeScale = speed; a.enabled = true; a.setEffectiveWeight(1);
  if (C.cur && C.cur !== a) a.crossFadeFrom(C.cur, dur, false); a.play(); C.cur = a; }
function charPose(C, x, z, face, t, moving) { C.g.position.set(x, 0.55 + Math.sin(t * 2.2 + C.phase) * 0.1, z); C.g.rotation.y = face; C.shadow.position.set(x, 0.03, z);
  C.body.rotation.x = lerp(C.body.rotation.x, moving ? 0.22 : 0, 0.1); if (C.wR) { const fl = Math.sin(t * 2.2 + C.phase + 0.6); C.wR.rotation.set(-0.5 + fl * 0.08, -0.12 - fl * 0.22 - (moving ? 0.25 : 0), 0.05 + fl * 0.1); C.wL.rotation.set(-0.5 + fl * 0.08, 0.12 + fl * 0.22 + (moving ? 0.25 : 0), -0.05 - fl * 0.1); } }
function charRemove(C) { scene.remove(C.g); scene.remove(C.shadow); }

// ---------- bots that share the map with the player ----------
const ents = new Map(); // bot id -> live entity
function charLabel(html, cls) { const el = document.createElement('div'); el.className = 'lbl ' + cls; el.innerHTML = html; el.style.display = 'none'; labelsEl.appendChild(el); return el; }
function spawnBot(b, x, z) { if (!heroGLTF || ents.has(b.id)) return; const st = botStats(b); const C = makeChar(b.cls, b.hue, Math.min(5, Math.floor(b.lv / 120)));
  const el = charLabel(`<div class="nm">${botName(b)}</div><div class="hp"><i></i></div><div class="say"></div>`, 'bot');
  const e = { b, C, el, bar: el.querySelector('.hp i'), sayEl: el.querySelector('.say'), pos: new THREE.Vector3(x, 0, z), face: rr(0, 6.28), hp: st.hp, maxHp: st.hp, atkCd: 0, skT: rr(2, 4), tgt: null, dead: 0, alive: true, wT: 0, goal: null, sayT: rr(4, 15), nav: null, stuck: 0 };
  ents.set(b.id, e); fxBeam(x, z, '#9fe8ff', 0.9, 0.7); return e; }
function despawnBot(id, beam) { const e = ents.get(id); if (!e) return; if (beam) fxBeam(e.pos.x, e.pos.z, '#9fe8ff', 0.9, 0.7); charRemove(e.C); e.el.remove(); e.alive = false; ents.delete(id); for (const m of mobs) if (m.tgt === e) m.tgt = null; }
function syncBots() { // who stands in the player's current map
  const want = new Set(); const cap = isTown() ? 10 : 8; let n = 0;
  for (const b of S.bots) if (inParty(b)) { b.map = S.map; want.add(b.id); n++; }
  for (const b of S.bots) if (!want.has(b.id) && b.map === S.map && n < cap) { want.add(b.id); n++; }
  for (const id of [...ents.keys()]) if (!want.has(id)) despawnBot(id, true);
  for (const id of want) if (!ents.has(id)) { const b = S.bots.find(q => q.id === id); const a = rr(0, 6.28), d = inParty(b) ? 1.5 : rr(3, 12); spawnBot(b, S.pos.x * (inParty(b) ? 1 : 0) + Math.cos(a) * d, (inParty(b) ? S.pos.z : 2) + Math.sin(a) * d); }
}
function clearBots() { for (const id of [...ents.keys()]) despawnBot(id, false); }
let worldT = 0;
function worldTick() { // once a second: the off-screen world keeps playing
  for (const b of S.bots) { if (inParty(b)) continue; b.stT -= 1;
    if (b.map !== TOWN && !ents.has(b.id)) { botGain(b, expNeed(b.lv) / lvSeconds(b.lv) * 0.5); b.gold += Math.round((5 + b.lv) * rr(2, 6)); if (Math.random() < 0.025) botLoot(b); }
    if (b.stT <= 0) { if (b.map === TOWN) { b.map = pickMapFor(b.lv); b.stT = rr(150, 400); } else { b.map = TOWN; b.stT = rr(50, 140); } } }
  if (S.party && S.party.leader !== 'me' && !S.bots.some(b => b.id === S.party.leader)) S.party = null;
  botMarket();
  syncBots();
  // bots sometimes invite the player
  S.invT = (S.invT ?? 40) - 1; if (S.invT <= 0) { S.invT = rr(60, 120); if (!S.party && !inviteOpen) { const c = [...ents.values()].filter(e => !e.dead); if (c.length) offerInvite(pick(c).b); } }
}
// bots trade with each other: the market keeps moving even when you are away
function botMarket() { if (Math.random() > 0.2) return; const sellers = S.bots.filter(b => b.inv.length && !inParty(b)); if (!sellers.length) return; const s = pick(sellers);
  const buyers = S.bots.filter(b => b !== s && b.map === s.map && !inParty(b)); if (!buyers.length) return; const b = pick(buyers); const g = pick(s.inv);
  const price = Math.round((g.slot === 'charm' ? 2500 + g.lv * 100 : sellPrice(g) * 2) * rr(0.8, 1.2)); if (b.gold < price) return;
  const item = takeOne(s.inv, g); b.gold -= price; s.gold += price; b.traded = (b.traded || 0) + price; s.traded = (s.traded || 0) + price; if (!stackInto(b.inv, item)) { b.inv.push(item); if (b.inv.length > 12) b.inv.shift(); }
  if (s.map === S.map) { const e = ents.get(b.id); if (e) botSay(e, 'Mua được ' + item.name + '!'); if (isTown() && Math.random() < 0.5) log(`🛒 ${b.name} mua [${item.name}] của ${s.name} giá ${fmt(price)} vàng.`, '#c8b88a'); } }
function botMove(e, tx, tz, dt, sp) { const dx = tx - e.pos.x, dz = tz - e.pos.z, d = Math.hypot(dx, dz); if (d < 0.05) return false;
  let ux = dx / d, uz = dz / d; if (!los(e.pos.x, e.pos.z, tx, tz)) { if (!e.nav || Math.hypot(e.nav.tx - tx, e.nav.tz - tz) > 1 || S.time - e.nav.t > 1.5) { const pts = findPath(e.pos.x, e.pos.z, tx, tz); e.nav = { tx, tz, t: S.time, pts: pts || [[tx, tz]], i: 0 }; }
    const N = e.nav; while (N.i < N.pts.length - 1 && Math.hypot(N.pts[N.i][0] - e.pos.x, N.pts[N.i][1] - e.pos.z) < 0.35) N.i++; const w = N.pts[N.i], wd = Math.hypot(w[0] - e.pos.x, w[1] - e.pos.z) || 1; ux = (w[0] - e.pos.x) / wd; uz = (w[1] - e.pos.z) / wd; }
  const st = Math.min(d, sp * dt), nx = e.pos.x + ux * st, nz = e.pos.z + uz * st; if (!collides(nx, e.pos.z, 0.45)) e.pos.x = nx; if (!collides(e.pos.x, nz, 0.45)) e.pos.z = nz;
  const r = Math.hypot(e.pos.x, e.pos.z); if (r > 21) { e.pos.x *= 21 / r; e.pos.z *= 21 / r; }
  let da = Math.atan2(ux, uz) - e.face; da = Math.atan2(Math.sin(da), Math.cos(da)); e.face += da * Math.min(1, dt * 8); return true; }
function botSay(e, txt) { e.sayEl.textContent = txt; e.sayEl.style.display = 'block'; e.sayHide = S.time + 3.5; }
function botHitMob(m, dmg, e) { if (m.dead) return; const crit = Math.random() < 0.12; dmg *= DMG_SCALE * rr(0.9, 1.1) * (crit ? 1.8 : 1) * vuln(m, CLS[e.b.cls].el) * lvDealK(m.lv - e.b.lv);
  m.hp -= dmg; m.flash = 1; m.aggro = true; if (!m.tgt || Math.random() < 0.35) m.tgt = e;
  if (textN < 22) fxText(m.x + rr(-0.3, 0.3), m.z, fmtN(dmg), crit ? '#ffd0a0' : '#b8c4cc', crit ? 14 : 12, null, m.T.y + 0.9 * Math.max(1, m.scale));
  burst(m.x, mobH(m), m.z, 4, C3(m.T.color), 3, 0.3, 0.4); if (m.hp <= 0) killMob(m, e); }
function botTakeDmg(e, dmg) { const st = botStats(e.b); dmg *= 1 - st.def / (st.def + 10 * e.b.lv + 100); e.hp -= dmg; e.lastHit = S.time;
  if (e.hp <= 0) { e.dead = 6; e.hp = 0; e.C.g.visible = false; e.C.shadow.visible = false; burst(e.pos.x, 1, e.pos.z, 30, C3('#ff6a6a'), 4, 0.4, 0.7); for (const m of mobs) if (m.tgt === e) { m.tgt = null; m.aggro = false; }
    if (inParty(e.b)) log(`${e.b.name} đã gục ngã, hồi sinh sau 6 giây.`, '#ff9a9a'); } }
function partyLeaderPos() { if (!S.party) return null; if (S.party.leader === 'me') return S.pos; const e = ents.get(S.party.leader); return e && !e.dead ? e.pos : null; }
function updateBots(dt, t) {
  if (!S) return; worldT -= dt; if (worldT <= 0) { worldT = 1; worldTick(); }
  const town = isTown(); let k = 0;
  for (const e of ents.values()) { const b = e.b, C = e.C; k++; C.mx.update(dt);
    if (e.sayHide && S.time > e.sayHide) { e.sayEl.style.display = 'none'; e.sayHide = 0; }
    if (e.dead > 0) { e.dead -= dt; if (e.dead <= 0) { e.hp = e.maxHp; const L = partyLeaderPos() || S.pos; e.pos.set(L.x + rr(-1.5, 1.5), 0, L.z + rr(-1.5, 1.5)); C.g.visible = C.shadow.visible = true; fxBeam(e.pos.x, e.pos.z, '#9fe8ff', 1); } continue; }
    const st = botStats(b); e.maxHp = st.hp; if (S.time - (e.lastHit || -9) > 4) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.03 * dt);
    e.atkCd -= dt; e.skT -= dt; e.sayT -= dt; let moving = false; const sp = HS.spd * 0.95;
    const party = inParty(b), follow = party && S.party.follow && S.party.leader === 'me';
    if (e.sayT <= 0) { e.sayT = rr(8, 22); if (Math.random() < 0.6) botSay(e, pick(town ? SAY_TOWN : SAY_HUNT)); }
    if (town) { if (!e.goal || Math.hypot(e.goal[0] - e.pos.x, e.goal[1] - e.pos.z) < 0.3) { e.wT -= dt; if (e.wT <= 0) { const a = rr(0, 6.28), d = rr(4, 12); e.goal = [Math.cos(a) * d, Math.sin(a) * d + 1]; e.wT = rr(2, 7); } }
      else moving = botMove(e, e.goal[0], e.goal[1], dt, sp * 0.45); if (party && S.party.leader === 'me') { const d = Math.hypot(S.pos.x - e.pos.x, S.pos.z - e.pos.z); if (d > 2) { e.goal = null; moving = botMove(e, S.pos.x, S.pos.z + 1, dt, sp); } } }
    else {
      const range = CLS[b.cls].range + (C.melee ? 0.3 : 0);
      if (e.tgt && (e.tgt.dead || Math.hypot(e.tgt.x - e.pos.x, e.tgt.z - e.pos.z) > 14)) e.tgt = null;
      if (!e.tgt) { let best = 12; for (const m of mobs) { if (m.dead) continue; const d = Math.hypot(m.x - e.pos.x, m.z - e.pos.z) - (m.tgt === e ? 4 : 0) - (m.boss ? 2 : 0); if (d < best) { best = d; e.tgt = m; } } }
      const L = partyLeaderPos();
      if (follow) { const slot = [...S.party.members].indexOf(b.id), a = S.face + Math.PI + (slot - 1.5) * 0.9; const gx = S.pos.x + Math.sin(a) * 1.2, gz = S.pos.z + Math.cos(a) * 1.2;
        if (Math.hypot(S.pos.x - e.pos.x, S.pos.z - e.pos.z) > 1.6 || Math.hypot(gx - e.pos.x, gz - e.pos.z) > 0.8) moving = botMove(e, gx, gz, dt, sp * 1.15); }
      else if (party && L && Math.hypot(L.x - e.pos.x, L.z - e.pos.z) > 9) moving = botMove(e, L.x, L.z, dt, sp * 1.1);
      else if (e.tgt) { const d = Math.hypot(e.tgt.x - e.pos.x, e.tgt.z - e.pos.z); if (d > range - 0.2) moving = botMove(e, e.tgt.x, e.tgt.z, dt, sp); }
      else { if (!e.goal || Math.hypot(e.goal[0] - e.pos.x, e.goal[1] - e.pos.z) < 0.4) { const zn = MAPS[S.map].zones.length ? pick(MAPS[S.map].zones) : { x: 0, z: 0, r: 8 }; e.goal = [zn.x + rr(-zn.r, zn.r) * 0.6, zn.z + rr(-zn.r, zn.r) * 0.6]; } moving = botMove(e, e.goal[0], e.goal[1], dt, sp * 0.8); }
      const m = e.tgt; if (m && !m.dead) { const d = Math.hypot(m.x - e.pos.x, m.z - e.pos.z);
        if (d <= range + (m.boss ? 1 : 0) && e.atkCd <= 0) { e.atkCd = 1 / st.aps; e.face = Math.atan2(m.x - e.pos.x, m.z - e.pos.z); charPlay(C, C.atk, 0.04, true, Math.max(1.6, st.aps * 0.5));
          if (C.melee) { setTimeout(() => { if (e.alive && !m.dead) { botHitMob(m, st.atk, e); burst(m.x, mobH(m), m.z, 6, C3(CLS[b.cls].col), 3, 0.3, 0.35); } }, 90); }
          else { const from = C.tip ? C.tip.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(e.pos.x, 1.2, e.pos.z); const p = { type: CLS[b.cls].proj, m: PROJM[CLS[b.cls].proj](), pos: from.clone(), tgt: m, speed: CLS[b.cls].ps, mult: st.atk, el: CLS[b.cls].el, bot: e }; p.m.position.copy(from); scene.add(p.m); projs.push(p); } }
        if (e.skT <= 0 && d <= Math.max(range, 5)) { e.skT = rr(2.5, 4.5); const col = ELC[CLS[b.cls].el]; fxRing(m.x, m.z, 0, 2.2, col, 0.45); burst(m.x, 0.5, m.z, 24, C3(col), 5, 0.4, 0.6); charPlay(C, C.atk, 0.04, true, 1.4);
          for (const o of mobsNear(m.x, m.z, 2.2)) botHitMob(o, st.atk * 1.6, e); } } }
    charPose(C, e.pos.x, e.pos.z, e.face, t, moving);
  }
}
// ---------- party ----------
let inviteOpen = false;
function partyBots() { return S.party ? S.party.members.map(id => S.bots.find(b => b.id === id)).filter(Boolean) : []; }
function createParty() { S.party = { leader: 'me', members: [], follow: false }; log('Đã lập nhóm. Mời người chơi khác ở gần vào nhóm.', '#9fe8ff'); }
function leaveParty() { if (!S.party) return; const ids = S.party.members; S.party = null; for (const id of ids) { const b = S.bots.find(q => q.id === id); if (b) { b.stT = rr(30, 120); const e = ents.get(id); if (e) e.el.querySelector('.nm').innerHTML = botName(b); } } log('Đã rời nhóm.', '#9fe8ff'); }
function inviteBot(b) { if (!S.party) createParty(); if (S.party.leader !== 'me') { log('Chỉ trưởng nhóm mới mời được.', '#ff9a9a'); return; } if (S.party.members.length >= 4) { log('Nhóm đã đủ 5 người.', '#ff9a9a'); return; }
  if (inParty(b)) return; log(`Đã gửi lời mời tới ${b.name}…`, '#9fe8ff');
  setTimeout(() => { if (!S || !S.party) return; const ok = Math.random() < (Math.abs(b.lv - S.lv) < 100 ? 0.8 : 0.4);
    if (ok) { S.party.members.push(b.id); b.map = S.map; syncBots(); const e = ents.get(b.id); if (e) { e.el.querySelector('.nm').innerHTML = botName(b); botSay(e, 'Vào nhóm nè!'); } log(`${b.name} (Lv ${b.lv}) đã vào nhóm.`, '#7dff9a'); }
    else { const e = ents.get(b.id); const no = pick(SAY_NO); if (e) botSay(e, no); log(`${b.name} từ chối: "${no}"`, '#ff9a9a'); } renderWorldPanel(); }, 1200); }
function kickBot(id) { if (!S.party || S.party.leader !== 'me') return; S.party.members = S.party.members.filter(x => x !== id); const b = S.bots.find(q => q.id === id); if (b) { b.stT = rr(30, 90); const e = ents.get(id); if (e) e.el.querySelector('.nm').innerHTML = botName(b); } }
function offerInvite(b) { inviteOpen = true; const box = $('invite'); box.innerHTML = `<b>${b.name}</b> · ${CLS[b.cls].name} Lv ${b.lv}<br>mời bạn vào nhóm cùng cày!<div class="acts"><button class="pb pri" id="invY">Đồng ý</button><button class="pb" id="invN">Từ chối</button></div>`; box.classList.remove('hide');
  const close = () => { box.classList.add('hide'); inviteOpen = false; clearTimeout(tm); }; const tm = setTimeout(close, 15000);
  $('invN').onclick = close; $('invY').onclick = () => { close(); if (S.party) return; const others = [...ents.values()].filter(e => e.b !== b && !e.dead).slice(0, ri(0, 2)).map(e => e.b.id);
    S.party = { leader: b.id, members: [b.id, ...others], follow: true }; syncBots(); for (const id of S.party.members) { const e = ents.get(id); if (e) e.el.querySelector('.nm').innerHTML = botName(e.b); }
    log(`Đã vào nhóm của ${b.name}. Chế độ theo sát trưởng nhóm: BẬT.`, '#7dff9a'); updateHud(); }; }
// player as a member following the bot leader (stays within 2 m)
function followLeaderDir() { if (!S.party || S.party.leader === 'me' || !S.party.follow) return null; const L = partyLeaderPos(); if (!L) return null; const d = Math.hypot(L.x - S.pos.x, L.z - S.pos.z); return d > 1.6 ? navDir(L.x, L.z) : [0, 0]; }

// ---------- town: NPCs and scenery ----------
const NPCS = [{ id: 'shop', n: 'Hermes · Thương Nhân', cls: 'holy', hue: 0.1, x: -6, z: 1.5 }, { id: 'smith', n: 'Hephaestus · Thợ Rèn', cls: 'fire', hue: 0.02, x: 6, z: 1.5 },
  { id: 'pets', n: 'Artemis · Chuồng Thú', cls: 'elf', hue: 0.35, x: -6.5, z: -6 }, { id: 'guide', n: 'Iris · Dẫn Đường', cls: 'ice', hue: 0.55, x: 6.5, z: -6 }, { id: 'market', n: 'Agora · Chợ Giao Dịch', cls: 'thunder', hue: 0.75, x: 0, z: 5.5 }];
const npcEnts = [];
function spawnNpcs() { clearNpcs(); if (!heroGLTF || !isTown()) return; for (const n of NPCS) { const C = makeChar(n.cls, n.hue, -1); const el = charLabel(`<div class="nm">${n.n}</div><div class="say" style="display:block">!</div>`, 'npc');
    colliders.push({ x: n.x, z: n.z, r: 0.5 }); npcEnts.push({ n, C, el, pos: new THREE.Vector3(n.x, 0, n.z), face: Math.atan2(-n.x, 8 - n.z) }); } buildNav(); }
function clearNpcs() { for (const e of npcEnts) { charRemove(e.C); e.el.remove(); } npcEnts.length = 0; }
function updateNpcs(dt, t) { for (const e of npcEnts) { e.C.mx.update(dt); charPose(e.C, e.pos.x, e.pos.z, e.face, t, false); e.C.g.position.y = 0.0; } }
REALM.town = function (M) { const marble = M_(0xa8a090, { roughness: 0.6, rim: 0xfff0d0, rimS: 0.2 });
  // fountain
  const f = new THREE.Group(); part(new THREE.CylinderGeometry(1.9, 2.05, 0.45, 32), marble, 1, 1, 1, 0, 0.22, 0, f); part(new THREE.CylinderGeometry(1.7, 1.7, 0.06, 32), M_(0x2a7ab8, { roughness: 0.05, metalness: 0.3, emissive: new THREE.Color(0x0a2a4a), rim: 0x9fe8ff, rimS: 0.8 }), 1, 1, 1, 0, 0.42, 0, f);
  part(new THREE.CylinderGeometry(0.2, 0.3, 1.6, 12), marble, 1, 1, 1, 0, 1.0, 0, f); part(new THREE.CylinderGeometry(0.7, 0.35, 0.2, 20), marble, 1, 1, 1, 0, 1.8, 0, f); part(SPH, M_(0xe0c070, { metalness: 0.8, roughness: 0.25 }), 0.25, 0.25, 0.25, 0, 2.15, 0, f);
  prop(f, 0, -2, 1.9); scenery.push(() => { for (let i = 0; i < 3; i++) { const a = rr(0, 6.28); emit(Math.cos(a) * 0.2, 2.1, -2 + Math.sin(a) * 0.2, Math.cos(a) * rr(0.6, 1.1), rr(1.6, 2.4), Math.sin(a) * rr(0.6, 1.1), C3(Math.random() < 0.5 ? '#bfe8ff' : '#ffffff'), 0.18, 0.9, 4, 0.99); } });
  // temple facade behind the gate
  const tp = new THREE.Group(); part(new THREE.BoxGeometry(14, 0.8, 5), marble, 1, 1, 1, 0, 0.4, 0, tp); for (let i = 0; i < 8; i++) { const c = column(4.2, false, marble); c.position.set(-6 + i * 12 / 7, 0.8, 1.6); tp.add(c); }
  part(new THREE.BoxGeometry(14.2, 0.5, 4.8), marble, 1, 1, 1, 0, 5.6, 0.2, tp); const tri = new THREE.Shape(); tri.moveTo(-7.2, 0); tri.lineTo(7.2, 0); tri.lineTo(0, 1.5); tri.lineTo(-7.2, 0); part(new THREE.ExtrudeGeometry(tri, { depth: 4.6, bevelEnabled: false }), marble, 1, 1, 1, 0, 5.85, -2.1, tp);
  part(new THREE.BoxGeometry(5, 0.6, 0.1), glowM(0xffd86a), 1, 1, 1, 0, 6.1, 2.6, tp); tp.position.set(0, 0, -23); world.add(tp);
  // market stalls with striped canopies and goods
  const stall = (x, z, c) => { const g = new THREE.Group(); const wood = M_(0x6a4a2a); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) part(CYL, wood, 0.05, 2.1, 0.05, a * 0.9, 1.05, b * 0.6, g);
    const cg = new THREE.PlaneGeometry(2.1, 1.6, 8, 1); const col = []; const A = new THREE.Color(c), B = new THREE.Color(0xf4ecd8); const p = cg.attributes.position; for (let i = 0; i < p.count; i++) { const s = Math.floor((p.getX(i) + 1.05) / 2.1 * 8) % 2; const q = s ? A : B; col.push(q.r, q.g, q.b); } cg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const cn = new THREE.Mesh(cg, windy(M_(0xffffff, { vertexColors: true, side: THREE.DoubleSide, roughness: 0.8 }), 0.02, 2.2)); cn.rotation.x = -Math.PI / 2 + 0.25; cn.position.y = 2.15; g.add(cn);
    part(new THREE.BoxGeometry(1.8, 0.1, 1.0), wood, 1, 1, 1, 0, 0.85, 0, g); for (let i = 0; i < 5; i++) part(i % 2 ? SPH_LO : new THREE.BoxGeometry(1, 1, 1), M_(pick([0xff8a3a, 0x9adf5a, 0xffd23a, 0xc84a8a, 0x6fe7ff]), { roughness: 0.5 }), 0.12, 0.12, 0.12, rr(-0.7, 0.7), 1.0, rr(-0.35, 0.35), g);
    g.rotation.y = Math.atan2(-x, -z); prop(g, x, z, 1.0); };
  stall(-11, 4, 0xc8281a); stall(11, 4, 0x1a5ac8); stall(-12, -4, 0x2a8a3a); stall(12, -4, 0xc89a1a);
  for (const [x, z] of [[-9, 10], [9, 10], [-15, 0], [15, 0], [-9, -11], [9, -11]]) prop(Math.random() < 0.5 ? oliveTree() : cypress(rr(3, 4)), x, z, 0.4);
  for (const [x, z] of [[-3, 9], [3, 9], [-4, -9], [4, -9]]) prop(brazier('#ffb04a'), x, z, 0.3);
  for (let k = 0; k < 20; k++) { const a = k / 20 * 6.283, d = rr(23, 27); world.add(at(Math.random() < 0.6 ? cypress(rr(3.5, 5)) : column(rr(2, 4), Math.random() < 0.5, marble), Math.cos(a) * d, 0, Math.sin(a) * d)); }
  wisps(8, '#ffe8b0');
};
