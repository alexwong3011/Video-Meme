
// =====================================================================
// UI — HUD, input, panels, save (local + cloud), start flow, main loop
// =====================================================================
const heroLabel = document.createElement('div'); heroLabel.className = 'lbl hero'; heroLabel.style.display = 'none'; labelsEl.appendChild(heroLabel);
function log(t, col) { const d = document.createElement('div'); d.textContent = t; d.style.color = col || '#e9dfc6'; const L = $('log'); L.appendChild(d); while (L.children.length > 5) L.firstChild.remove(); setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 700); }, 5500); }
let bannerT = 0; function banner(txt, col) { const b = $('banner'); b.textContent = txt; b.style.color = col === 'red' ? '#ff6a6a' : '#ffd86a'; b.classList.add('show'); bannerT = 2.6; }
let zoneT = 0; function showZone() { const M = MAPS[S.map]; if (M.town) { $('zoneName').textContent = M.name; $('zoneSub').textContent = 'Thành chính · không có quái · NPC, chợ và người chơi nghỉ ngơi'; $('zone').style.opacity = 1; zoneT = 4; return; } $('zoneName').textContent = M.name; $('zoneSub').textContent = `Quái cấp ${M.lo}–${M.hi} (theo cấp bạn) · Boss ${MT[M.boss.k].name}`; $('zone').style.opacity = 1; zoneT = 4; }
function pulseHud() { }

// ---------- HUD ----------
function upgradeHint() { return SK.some(k => S.mats[k] > 0 && canStone(k)) || (S.wing < WMAX && S.mats.f >= WCOST[S.wing]) || FORGE.some(([f]) => S.mats[f] >= 3); }
function updateHud() {
  if (!S || !HS) return; const C = CLS[S.cls];
  $('hLv').textContent = S.lv; $('hIcon').textContent = C.icon; $('hName').textContent = C.name; $('hName').style.color = C.col;
  $('hpBar').style.transform = `scaleX(${Math.max(0, S.hp) / HS.hp})`; $('hpTxt').textContent = `${Math.max(0, Math.ceil(S.hp))} / ${HS.hp}`;
  $('mpBar').style.transform = `scaleX(${S.mp / HS.mp})`; $('mpTxt').textContent = `${Math.floor(S.mp)} / ${HS.mp}`;
  $('hGold').textContent = S.gold.toLocaleString('vi-VN'); $('hBag').textContent = S.inv.length;
  $('bBag').classList.toggle('dot', upgradeHint());
  const need = expNeed(S.lv); $('expBar').style.transform = `scaleX(${S.lv >= MAXLV ? 1 : S.exp / need})`; $('expTxt').textContent = S.lv >= MAXLV ? 'CẤP TỐI ĐA' : `EXP ${(S.exp / need * 100).toFixed(1)}%`;
  $('bAuto').setAttribute('aria-pressed', String(S.auto)); $('bParty').classList.toggle('on', !!S.party);
  $('partyF').innerHTML = S.party ? partyBots().map(b => { const e = ents.get(b.id); return `<div>${S.party.leader === b.id ? '♛ ' : ''}${b.name} · ${b.lv}<i style="transform:scaleX(${e ? Math.max(0, e.hp / e.maxHp) : 1})"></i></div>`; }).join('') + (S.party.follow ? '<div style="color:#7dff9a">Theo sát trưởng nhóm: BẬT</div>' : '') : ''; $('bLoot').setAttribute('aria-pressed', String(S.autoLoot));
  SKILLS[S.cls].forEach((sk, j) => { const b = $('sk' + j); const lock = S.lv < sk.lv; b.classList.toggle('lock', lock); b.classList.toggle('nomp', !lock && S.mp < skMp(sk));
    b.style.setProperty('--c2', ELC[sk.el] + '99'); b.style.setProperty('--c3', ELC[sk.el] + '55');
    b.querySelector('.ic').textContent = ELI[sk.el]; b.querySelector('small').textContent = lock ? 'Lv ' + sk.lv : sk.name.split(' ').slice(0, 2).join(' ');
    b.querySelector('.cd').style.transform = `scaleY(${lock ? 0 : Math.min(1, S.skCd[j] / skCd(sk))})`; b.querySelector('.cdt').textContent = !lock && S.skCd[j] >= 1 ? Math.ceil(S.skCd[j]) : '';
    b.setAttribute('aria-label', sk.name + (lock ? ' (mở ở cấp ' + sk.lv + ')' : '')); });
  const boss = S.boss && !S.boss.dead ? S.boss : null; $('bossbar').classList.toggle('hide', !boss);
  if (boss) { $('bossName').textContent = boss.T.name.toUpperCase() + ' · Lv ' + boss.lv; $('bossHp').style.transform = `scaleX(${Math.max(0, boss.hp / boss.maxHp)})`; $('bossInfo').textContent = ''; }
  else if (!MAPS[S.map].boss) $('bossInfo').textContent = '';
  else { const s = Math.max(0, Math.ceil(S.bossT)); $('bossInfo').textContent = `Boss ${MT[MAPS[S.map].boss.k].name} sau ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
}
function updateLabels() {
  const place = (el, x, y, z) => { const [sx, sy, vis] = toScreen(tmpV.set(x, y, z)); if (!vis || sx < -80 || sx > innerWidth + 80 || sy < -40 || sy > innerHeight + 40) { el.style.display = 'none'; return; } el.style.display = ''; el.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-100%)`; };
  for (const m of mobs) { if (m.dead) continue; place(m.el, m.x, m.T.y + m.T.lh * m.scale + 0.15, m.z); if (!m.boss && !m.mini) m.hpEl.style.visibility = m.hp < m.maxHp ? 'visible' : 'hidden'; m.bar.style.transform = `scaleX(${Math.max(0, m.hp / m.maxHp)})`; }
  for (const l of loots) place(l.el, l.x, 1.05, l.z);
  for (const e of ents.values()) { if (e.dead) { e.el.style.display = 'none'; continue; } place(e.el, e.pos.x, e.C.g.position.y + HERO_H * LOOK.size + 0.4, e.pos.z); e.bar.style.transform = `scaleX(${e.hp / e.maxHp})`; e.el.querySelector('.hp').style.visibility = e.hp < e.maxHp || inParty(e.b) ? 'visible' : 'hidden'; }
  for (const e of npcEnts) place(e.el, e.pos.x, HERO_H * LOOK.size + 0.3, e.pos.z);
  heroLabel.textContent = CLS[S.cls].name; heroLabel.style.display = S.dead ? 'none' : ''; if (!S.dead) place(heroLabel, S.pos.x, heroG.position.y + HERO_H * LOOK.size + 0.5, S.pos.z);
}

// ---------- input ----------
$('bAtk').addEventListener('pointerdown', e => { e.preventDefault(); attack(); });
for (let j = 0; j < 3; j++) $('sk' + j).addEventListener('pointerdown', e => { e.preventDefault(); if (!castSkill(j)) { const sk = SKILLS[S.cls][j]; if (S.lv < sk.lv) log(sk.name + ' mở ở cấp ' + sk.lv + '.', '#93c6cf'); else if (S.mp < skMp(sk)) log('Không đủ Mana.', '#5ab0ff'); } });
$('bAuto').onclick = () => { S.auto = !S.auto; updateHud(); };
$('bLoot').onclick = () => { S.autoLoot = !S.autoLoot; log(S.autoLoot ? 'Tự lượm đồ: BẬT — nhân vật và thú cưng tự nhặt đồ rơi.' : 'Tự lượm đồ: TẮT — chỉ nhặt khi bạn đi qua đồ.', '#9fe8ff'); updateHud(); };
$('bBag').onclick = () => openBag(); $('bMap').onclick = () => openMap(); $('bMenu').onclick = () => openMenu();
addEventListener('keydown', e => { if (!S || !running) return; input.keys[e.code] = true;
  if (e.code === 'Escape') { closeBag(); closeMap(); return; }
  if (!$('bag').classList.contains('hide') || !$('mapP').classList.contains('hide')) { if (e.code === 'KeyI') closeBag(); if (e.code === 'KeyM') closeMap(); return; }
  if (e.code === 'Space') { e.preventDefault(); attack(); } if (e.code === 'Digit1') castSkill(0); if (e.code === 'Digit2') castSkill(1); if (e.code === 'Digit3') castSkill(2);
  if (e.code === 'KeyF') { S.auto = !S.auto; updateHud(); } if (e.code === 'KeyL') $('bLoot').click(); if (e.code === 'KeyI') openBag(); if (e.code === 'KeyM') openMap(); });
addEventListener('keyup', e => { input.keys[e.code] = false; });
// touch / click to move: tap the sea floor to walk there, hold and drag to steer, tap a monster to attack it
const cvs = renderer.domElement; cvs.style.touchAction = 'none';
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
const markMat = new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
const marker = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.4, 40), markMat); marker.rotation.x = -Math.PI / 2; scene.add(marker); let markT = 0;
function floorAt(cx, cy) { ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(floor, hitP) ? hitP : null; }
function mobAt(cx, cy) { let b = null, bd = 46; for (const m of mobs) { if (m.dead) continue; const [sx, sy, ok] = toScreen(tmpV.set(m.x, mobH(m), m.z)); const d = Math.hypot(sx - cx, sy - cy) - (m.boss ? 30 : 0); if (ok && d < bd) { bd = d; b = m; } } return b; }
function showMark(x, z, hex) { marker.position.set(x, 0.06, z); markMat.color.setHex(hex); markT = 0.6; }
let touchId = null, touchX = 0, touchY = 0;
function touchMove(cx, cy, hold) { const p = floorAt(cx, cy); if (!p) return; const r = Math.hypot(p.x, p.z); if (r > 20.5) p.multiplyScalar(20.5 / r); S.moveTo = { x: p.x, z: p.z, hold, t: S.time }; S.tapMob = null; showMark(p.x, p.z, 0x9fe8ff); }
cvs.addEventListener('pointerdown', e => { if (!S || !running || paused || S.dead) return; e.preventDefault();
  const who = charAt(e.clientX, e.clientY); if (who) { if (who.n) npcAct(who.n.id); else openWorld('bot', who.b.id); return; }
  touchId = e.pointerId; touchX = e.clientX; touchY = e.clientY; cvs.setPointerCapture(e.pointerId);
  const m = mobAt(e.clientX, e.clientY); if (m) { S.tapMob = m; S.moveTo = null; S.nav = null; showMark(m.x, m.z, 0xff7a7a); touchId = null; return; }
  touchMove(e.clientX, e.clientY, true); });
cvs.addEventListener('pointermove', e => { if (e.pointerId !== touchId || !S) return; touchX = e.clientX; touchY = e.clientY; });
const touchEnd = e => { if (e.pointerId !== touchId) return; touchId = null; if (S && S.moveTo) S.moveTo.hold = false; };
cvs.addEventListener('pointerup', touchEnd); cvs.addEventListener('pointercancel', touchEnd);
function updateTouch(dt) { if (touchId !== null && S && !S.dead) touchMove(touchX, touchY, true);
  if (markT > 0) { markT -= dt; markMat.opacity = Math.max(0, markT / 0.6) * 0.9; marker.scale.setScalar(1 + (0.6 - markT) * 0.8); if (S && S.tapMob && !S.tapMob.dead) marker.position.set(S.tapMob.x, 0.06, S.tapMob.z); } else markMat.opacity = 0; }

// ---------- icons ----------
const GI = {
  weapon: '<path d="M19 3l-9.5 9.5M19 3h-3.5M19 3v3.5M9.5 12.5l2 2M6 14l4 4M8 16l-4 4" />', helm: '<path d="M5 15a7 7 0 0114 0v3H5zM12 4v4M8.5 15h7" />',
  armor: '<path d="M7 4l5 2 5-2 3 4-3 2v10H7V10L4 8zM12 6v14" />', ring: '<circle cx="12" cy="14" r="6"/><path d="M9 4h6l-3 4z"/>', pendant: '<path d="M6 3c0 6 3 9 6 9s6-3 6-9"/><path d="M12 12l-3 4 3 5 3-5z"/>',
  charm: '<path d="M12 2l2.6 6.2L21 9l-5 4.6L17.4 21 12 17.3 6.6 21 8 13.6 3 9l6.4-.8z"/>',
  soul: '<path d="M12 3c3 4 6 6.5 6 10.5a6 6 0 01-12 0C6 9.5 9 7 12 3z"/><path d="M12 10c1.4 1.8 2.6 3 2.6 4.6a2.6 2.6 0 01-5.2 0c0-1.6 1.2-2.8 2.6-4.6z"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.3-3 7.6-7 9.5-4-1.9-7-5.2-7-9.5V6z"/><path d="M12 7v10M8.5 11h7"/>'
};
const gIcon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${GI[k]}</svg>`;
const mIcon = k => { const c = MATS[k].col; if (k === 'f') return `<svg viewBox="0 0 24 24"><path d="M5 20C8 12 13 6 20 3c-1 7-6 13-14 16z" fill="${c}" stroke="#000" stroke-width="1"/><path d="M5 20L17 7" stroke="#fff8d0" stroke-width="1"/></svg>`;
  if (k === 'e') return `<svg viewBox="0 0 24 24"><path d="M12 3l7 6-7 12L5 9z" fill="${c}" stroke="#000" stroke-width="1"/><path d="M5 9h14" stroke="rgba(255,255,255,.6)" stroke-width=".8"/></svg>`;
  return `<svg viewBox="0 0 24 24"><path d="M12 2l7 7-7 13-7-13z" fill="${c}" stroke="#000" stroke-width="1"/><path d="M5 9h14M12 2l-3 7 3 13 3-13z" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="0.8"/></svg>`; };

// ---------- bag panel ----------
const bagEl = $('bag'), bagBody = $('bagBody'); let tab = 'gear', selId = null, msgT = 0;
function openBag(t) { closeMap(); if (t) tab = t; bagEl.classList.remove('hide'); renderBag(); $('bagClose').focus(); }
function closeBag() { bagEl.classList.add('hide'); }
$('bagClose').onclick = closeBag;
bagEl.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; renderBag(); });
const fmt = n => n.toLocaleString('vi-VN');
const findItem = id => { for (const s of SLOT_ORDER) if (S.eq[s] && S.eq[s].id === id) return { g: S.eq[s], equipped: true }; const g = S.inv.find(x => x.id === id); return g ? { g, equipped: false } : null; };
function tileHtml(g, extra = '') { return `<button style="${g.charm ? 'color:' + CHARMS[g.charm].col : ''}" class="tile r${g.r}${selId === g.id ? ' sel' : ''}${g.plus >= 7 ? ' t' + tier(g.plus) : ''}" data-id="${g.id}" aria-label="${g.name} +${g.plus}" ${extra}>${gIcon(g.charm === 'soul' ? 'soul' : g.slot)}${g.plus ? `<span class="pl">+${g.plus}</span>` : ''}${qty(g) > 1 ? `<span class="qt">×${qty(g)}</span>` : ''}${g.set ? `<span class="st" style="--sc:${SETS[g.set].col}"></span>` : ''}</button>`; }
function flash(t, cls = '') { const m = bagBody.querySelector('.msg'); if (!m) return; m.textContent = t; m.className = 'msg show ' + cls; clearTimeout(msgT); msgT = setTimeout(() => { m.className = 'msg'; }, 2200); }
function afterChange(heal) { recalc(heal); applyGearVisuals(); applyPetMount(); updateHud(); renderBag(); saveGame(); }
function renderBag() {
  if (bagEl.classList.contains('hide')) return;
  $('bGold').textContent = fmt(S.gold); $('bE').textContent = S.mats.e; $('bF').textContent = S.mats.f;
  bagEl.querySelectorAll('.tabs button').forEach(b => { b.setAttribute('aria-selected', String(b.dataset.t === tab)); b.classList.toggle('dot', (b.dataset.t === 'stone' && (SK.some(k => S.mats[k] > 0 && canStone(k)) || FORGE.some(([f]) => S.mats[f] >= 3))) || (b.dataset.t === 'wing' && S.wing < WMAX && S.mats.f >= WCOST[S.wing])); });
  if (tab === 'gear') renderGear(); else if (tab === 'stone') renderStones(); else if (tab === 'wing') renderWing(); else if (tab === 'pet') renderPets(); else renderSkills();
}
function statLines(g, cmp) { const s = gearStats(g), c = cmp ? gearStats(cmp) : null; return Object.keys(s).map(k => { const d = c ? s[k] - (c[k] || 0) : 0; return `<li><span>${STAT_N[k]}</span><b>${s[k]}</b>${c && d ? `<em class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${+d.toFixed(1)}</em>` : ''}</li>`; }).join(''); }
function setInfo() { const sc = HS.sets; const ks = Object.keys(sc); if (!ks.length) return '<p class="muted">Mặc từ 2 món cùng bộ (chấm màu trên ô đồ) để nhận hiệu ứng bộ.</p>';
  return ks.map(k => `<div class="setb"><b style="color:${SETS[k].col}">${SETS[k].n} (${sc[k]}/4)</b><br><span class="${sc[k] >= 2 ? 'on' : 'off'}">2 món: ${SETS[k].d2}</span> · <span class="${sc[k] >= 4 ? 'on' : 'off'}">4 món: ${SETS[k].d4}</span></div>`).join(''); }
function renderGear() {
  const st = HS, r = rates();
  bagBody.innerHTML = `<div class="grid2"><div class="col">
    <div class="sect">Chỉ số</div>
    <div class="stats"><div><span>Cấp</span><b>${S.lv}</b></div><div><span>Tấn công</span><b>${fmt(st.atk)}</b></div><div><span>Phòng thủ</span><b>${fmt(st.def)}</b></div><div><span>Máu</span><b>${fmt(st.hp)}</b></div>
      <div><span>Chí mạng</span><b style="color:#4aa8ff">${(r.crit * 100).toFixed(1)}%</b></div><div><span>Siêu đòn TB</span><b>×${avgMult().toFixed(2)}</b></div><div><span>ST cánh & bộ</span><b>×${st.dmgMul.toFixed(2)}</b></div><div><span>Mana</span><b style="color:#5ab0ff">${st.mp}</b></div>
      <div><span>Tốc đánh</span><b style="color:#7dffb0">${st.as} / ${AS_MAX}</b></div><div><span>Đòn / giây</span><b style="color:#7dffb0">${st.aps.toFixed(1)} / ${APS_MAX}</b></div><div><span>Hút máu</span><b>${(REC.hpHit * 100).toFixed(2)}%/đòn</b></div><div><span>Hút mana</span><b>${(REC.mpHit * 100).toFixed(1)}%/đòn</b></div></div>
    <p class="muted" style="margin:4px 0 0">Hồi từ đánh quái tối đa ${(st.hpCap * 100).toFixed(0)}% máu và ${(REC.mpCap * 100).toFixed(0)}% mana mỗi giây. Tốc đánh đến từ cấp, vũ khí, dây chuyền, cánh và thú.</p>
    <div class="sect">Đang mặc</div>
    <div class="eqrow">${SLOT_ORDER.map(s => `<div class="eqslot"><span>${SLOTS[s].n}</span>${S.eq[s] ? tileHtml(S.eq[s]) : `<div class="tile empty">${gIcon(s)}</div>`}</div>`).join('')}</div>
    ${setInfo()}
    <div class="box" id="detail"></div><div class="msg" role="status"></div>
  </div><div class="col">
    <div class="sect" style="display:flex;justify-content:space-between;align-items:center">Túi đồ ${S.inv.length}/${BAG_MAX}<span><button class="pb" id="bBest">Mặc đồ tốt nhất</button> <button class="pb" id="bSellC">Bán đồ thường</button></span></div>
    <div id="bagGrid">${S.inv.map(g => tileHtml(g)).join('')}${'<div class="tile empty"></div>'.repeat(Math.max(0, BAG_MAX - S.inv.length))}</div>
  </div></div>`;
  bagBody.querySelectorAll('.tile[data-id]').forEach(b => b.onclick = () => { selId = b.dataset.id; renderBag(); });
  $('bBest').onclick = bestGear; $('bSellC').onclick = () => { const c = S.inv.filter(g => g.r === 0 && !g.set && g.plus === 0); let sum = 0; for (const g of c) sum += sellPrice(g); S.inv = S.inv.filter(g => !c.includes(g)); S.gold += sum; afterChange(); flash(c.length ? `Đã bán ${c.length} món, nhận ${fmt(sum)} vàng.` : 'Không có đồ thường để bán.'); };
  renderDetail();
}
function renderDetail() {
  const box = $('detail'); const f = selId && findItem(selId);
  if (!f) { box.innerHTML = '<p class="muted">Chọn một món đồ để xem chỉ số, mặc vào, cường hóa hoặc bán.</p>'; return; }
  const { g, equipped } = f;
  if (g.slot === 'charm') { const C = CHARMS[g.charm]; box.innerHTML = `<div class="dhead">${tileHtml(g, 'tabindex="-1"')}<div><h3 style="color:${C.col}">${g.name} ×${qty(g)}</h3><p class="muted">${g.charm === 'soul' ? 'Vật phẩm cổ đại' : 'Bùa siêu hiếm'} · ${C.d} mỗi ${g.charm === 'soul' ? 'viên' : 'lá'} khi mang trong túi · cộng dồn tối đa ${CHARM_CAP} lá (đang có tác dụng ${HS.charms[g.charm]}/${CHARM_CAP}) · xếp chồng trong 1 ô</p></div></div>
      <div class="acts"><button class="pb" id="aSell">Bán 1 · ${fmt(sellPrice(g))} vàng</button>${qty(g) > 1 ? `<button class="pb" id="aSellAll">Bán cả ${qty(g)} · ${fmt(sellPrice(g) * qty(g))} vàng</button>` : ''}</div>`;
    $('aSell').onclick = () => { takeOne(S.inv, g); S.gold += sellPrice(g); if (!S.inv.includes(g)) selId = null; afterChange(); };
    const all = $('aSellAll'); if (all) all.onclick = () => { S.gold += sellPrice(g) * qty(g); S.inv = S.inv.filter(x => x !== g); selId = null; afterChange(); }; return; }
  const cur = S.eq[g.slot]; const cost = upCost(g.plus), rate = upRate(g.plus); const canUp = g.plus < 15;
  box.innerHTML = `<div class="dhead">${tileHtml(g, 'tabindex="-1"')}<div><h3 style="color:${g.set ? SETS[g.set].col : RARITY[g.r].css}">${g.name}${g.plus ? ' +' + g.plus : ''}</h3>
    <p class="muted">${SLOTS[g.slot].n} · ${RARITY[g.r].n} · cấp ${g.lv}${g.set ? ' · ' + SETS[g.set].n : ''}${equipped ? ' · <b style="color:var(--cyan)">Đang mặc</b>' : ''}</p></div></div>
    <ul class="stl">${statLines(g, !equipped && cur ? cur : null)}</ul>
    ${canUp ? `<div class="upb"><b>+${g.plus} → +${g.plus + 1}</b><span>Tỉ lệ thành công ${Math.round(rate * 100)}%${g.plus >= 9 ? ' · thất bại giảm 1 cấp' : ''}</span><span>Cần ${cost.stones} Đá Cường Hóa · ${fmt(cost.gold)} vàng</span></div>` : '<p class="muted">Đã đạt +15.</p>'}
    <div class="acts"><button class="pb" id="aEq">${equipped ? 'Tháo ra' : 'Mặc vào'}</button>${canUp ? `<button class="pb pri" id="aUp"${S.mats.e < cost.stones || S.gold < cost.gold ? ' disabled' : ''}>Cường hóa</button>` : ''}${equipped ? '' : `<button class="pb" id="aSell">Bán · ${fmt(sellPrice(g))} vàng</button>`}</div>`;
  $('aEq').onclick = () => equipToggle(g, equipped);
  if (canUp) $('aUp').onclick = () => enhance(g);
  if (!equipped) $('aSell').onclick = () => { S.inv = S.inv.filter(x => x !== g); S.gold += sellPrice(g); selId = null; afterChange(); flash('Đã bán ' + g.name + '.'); };
}
function equipToggle(g, equipped) { if (equipped) { if (S.inv.length >= BAG_MAX) { flash('Túi đầy, không tháo được.', 'bad'); return; } delete S.eq[g.slot]; S.inv.push(g); } else { const old = S.eq[g.slot]; S.inv = S.inv.filter(x => x !== g); if (old) S.inv.push(old); S.eq[g.slot] = g; } afterChange(); }
function enhance(g) { const cost = upCost(g.plus); if (S.mats.e < cost.stones || S.gold < cost.gold) return; S.mats.e -= cost.stones; S.gold -= cost.gold; const ok = Math.random() < upRate(g.plus);
  if (ok) g.plus++; else if (g.plus >= 9) g.plus--; afterChange();
  flash(ok ? `Thành công! ${g.name} +${g.plus}` : g.plus >= 8 ? `Thất bại. ${g.name} còn +${g.plus}.` : 'Thất bại. Đồ giữ nguyên cấp.', ok ? 'ok' : 'bad');
  if (ok && Object.values(S.eq).includes(g)) burst(S.pos.x, heroG.position.y + HERO_H * 0.6, S.pos.z, 30, new THREE.Color(TIER_COL[tier(g.plus)]), 3, 0.3, 0.9); }
function bestGear() { let n = 0; for (const s of SLOT_ORDER) { const cand = S.inv.filter(g => g.slot === s).sort((a, b) => gearScore(b) - gearScore(a))[0]; if (cand && (!S.eq[s] || gearScore(cand) > gearScore(S.eq[s]))) { const old = S.eq[s]; S.inv = S.inv.filter(x => x !== cand); if (old) S.inv.push(old); S.eq[s] = cand; n++; } } afterChange(); flash(n ? `Đã mặc ${n} món tốt hơn.` : 'Đang mặc đồ tốt nhất rồi.'); }
function renderStones() {
  const r = rates();
  bagBody.innerHTML = `<p class="muted" style="margin-top:0">Mỗi đòn đánh tung riêng từng tầng và <b style="color:var(--gold)">nhân chồng lên nhau</b>: đủ 5 tầng = ×1.5 × 2 × 2 × 3 × 10 = <b style="color:#ffd23a">×180</b>. Khảm linh thạch để tăng tỉ lệ từng tầng (có giới hạn). Hiện tại siêu đòn trung bình ×${avgMult().toFixed(2)}.</p>
  <div class="sect" style="margin:8px 0 6px">Khảm vào nhân vật</div>
  ${SK.map(k => { const s = STONES[k]; const can = canStone(k); return `<div class="row">${mIcon(k)}<div class="t"><b style="color:${MATS[k].col}">${MATS[k].name}</b> · có ${S.mats[k]} · đã khảm ${S.st[k]}<br>${s.n} ×${s.mult}: <b>${(r[s.stat] * 100).toFixed(1)}%</b> / tối đa ${(s.cap * 100)}%${s.stat === 'crit' ? ' (đồ cộng thêm)' : ''}</div><button class="pb" data-s1="${k}"${!S.mats[k] || !can ? ' disabled' : ''}>Khảm 1</button><button class="pb" data-sa="${k}"${!S.mats[k] || !can ? ' disabled' : ''}>Khảm hết</button></div>`; }).join('')}
  <div class="sect" style="margin:12px 0 6px">Lò cường hóa: 3 viên cấp thấp → 1 viên cấp cao</div>
  ${FORGE.map(([f, t]) => `<div class="row">${mIcon(f)}<div class="t"><b style="color:${MATS[f].col}">3 × ${MATS[f].name.replace('Linh Thạch ', '')}</b> → <b style="color:${MATS[t].col}">1 × ${MATS[t].name.replace('Linh Thạch ', '')}</b> · có ${S.mats[f]}</div>${mIcon(t)}<button class="pb" data-f1="${f}"${S.mats[f] < 3 ? ' disabled' : ''}>Hợp 1</button><button class="pb" data-fa="${f}"${S.mats[f] < 3 ? ' disabled' : ''}>Hợp hết</button></div>`).join('')}
  <button class="pb pri" id="fChain" style="width:100%;margin-top:4px">Cường hóa liên hoàn (hợp hết từ thấp lên cao)</button><div class="msg" role="status"></div>`;
  const socket = (k, all) => { let n = 0; while (S.mats[k] > 0 && canStone(k) && (all || n < 1)) { S.mats[k]--; S.st[k]++; n++; } if (n) { fxRing(S.pos.x, S.pos.z, 0, 1.4, MATS[k].col, 0.5); burst(S.pos.x, 0.9, S.pos.z, 14, C3(MATS[k].col), 2, 0.3, 0.6); } afterChange(); flash(n ? `Đã khảm ${n} ${MATS[k].name}.` : 'Tầng này đã đạt giới hạn.', n ? 'ok' : 'bad'); };
  const forgeAll = (f, all) => { const t = FORGE.find(p => p[0] === f)[1]; let n = 0; while (S.mats[f] >= 3 && (all || n < 1)) { S.mats[f] -= 3; S.mats[t]++; n++; } return n; };
  bagBody.querySelectorAll('[data-s1]').forEach(b => b.onclick = () => socket(b.dataset.s1, false)); bagBody.querySelectorAll('[data-sa]').forEach(b => b.onclick = () => socket(b.dataset.sa, true));
  bagBody.querySelectorAll('[data-f1]').forEach(b => b.onclick = () => { forgeAll(b.dataset.f1, false); afterChange(); }); bagBody.querySelectorAll('[data-fa]').forEach(b => b.onclick = () => { forgeAll(b.dataset.fa, true); afterChange(); });
  $('fChain').onclick = () => { let n = 0; for (const [f] of FORGE) n += forgeAll(f, true); afterChange(); flash(n ? `Đã hợp ${n} viên.` : 'Chưa đủ 3 viên cùng loại.', n ? 'ok' : 'bad'); };
}
function renderWing() {
  const w = S.wing, nx = w < WMAX ? w + 1 : null;
  bagBody.innerHTML = `<div class="wingbig"><div><div class="sect">Cánh hiện tại</div><div class="tier">${WNAME[w]}</div></div>
    <ul class="stl" style="flex:1;min-width:200px"><li><span>Sát thương</span><b>×${WINGM[w]}</b></li><li><span>Phòng thủ</span><b>+${WDEF[w]}</b></li><li><span>Máu</span><b>+${WHP[w]}</b></li><li><span>Tốc chạy</span><b>+${(w * 0.4).toFixed(1)}</b></li></ul></div>
    <p class="muted">Cánh ghép từ <b style="color:#ffd85a">Lông Vũ Thần</b> (rơi từ quái và boss). Cánh càng cao càng to, càng sáng, và nhân vật bay lơ lửng khi đeo cánh.</p>
    ${nx ? `<div class="row">${mIcon('f')}<div class="t"><b style="color:var(--gold)">${w ? 'Nâng cấp' : 'Chế tạo'} ${WNAME[nx]}</b> — cần ${WCOST[w]} lông vũ (đang có ${S.mats.f})<br>Sát thương ×${WINGM[nx]} · Phòng thủ +${WDEF[nx]} · Máu +${WHP[nx]}</div><button class="pb pri" id="wCraft"${S.mats.f < WCOST[w] ? ' disabled' : ''}>${w ? 'Nâng cấp' : 'Chế tạo'}</button></div>` : '<p class="muted"><b style="color:var(--gold)">Cánh đã đạt cấp tối đa.</b></p>'}
    <div class="sect" style="margin-top:10px">Các cấp cánh</div>
    ${WNAME.slice(1).map((n, i) => `<div class="row"><div class="t"><b style="color:${i + 1 <= w ? 'var(--gold)' : '#93c6cf'}">${n}</b> · ${WCOST[i]} lông vũ · ×${WINGM[i + 1]} sát thương · +${WDEF[i + 1]} phòng thủ · +${WHP[i + 1]} máu</div>${i + 1 <= w ? '<b style="color:#6dff9c">✓</b>' : ''}</div>`).join('')}<div class="msg" role="status"></div>`;
  if (nx) $('wCraft').onclick = () => { if (S.mats.f < WCOST[S.wing]) return; S.mats.f -= WCOST[S.wing]; S.wing++; fxBeam(S.pos.x, S.pos.z, '#ffd85a', 1.4, 1); burst(S.pos.x, 1.2, S.pos.z, 40, C3('#fff0b0'), 4, 0.4, 0.9); banner(WNAME[S.wing].toUpperCase() + '!', 'gold'); afterChange(); };
}
function renderPets() {
  const P = curPet(), Mt = curMount();
  const row = (x, kind) => { const own = (kind === 'pet' ? S.pets : S.mounts).includes(x.id), on = (kind === 'pet' ? S.pet : S.mount) === x.id, lock = S.lv < x.lv;
    return `<div class="row"><div class="t"><b style="color:${on ? 'var(--gold)' : own ? '#9fe8ff' : '#93c6cf'}">${x.n}</b>${on ? ' · <b style="color:#6dff9c">đang dùng</b>' : ''}<br>${x.d}${own ? '' : `<br><span style="color:${lock ? '#ff9a9a' : 'var(--gold)'}">${lock ? 'Cần cấp ' + x.lv + ' · ' : ''}${fmt(x.price)} vàng</span>`}</div>
      ${own ? `<button class="pb${on ? '' : ' pri'}" data-${kind}="${x.id}">${on ? 'Cất đi' : kind === 'pet' ? 'Mang theo' : 'Cưỡi'}</button>` : `<button class="pb pri" data-buy${kind}="${x.id}"${lock || S.gold < x.price ? ' disabled' : ''}>Mua</button>`}</div>`; };
  bagBody.innerHTML = `<p class="muted" style="margin-top:0">Thú cưng bay theo bạn, <b style="color:var(--gold)">hút đồ rơi</b> quanh mình và tăng EXP, vàng, tốc đánh; thú mạnh còn tự bắn quái. Thú cưỡi giúp chạy nhanh và bền hơn.</p>
  <div class="sect" style="margin:6px 0">Thú cưng${P ? ' · ' + P.n : ''}</div>${PETS.map(x => row(x, 'pet')).join('')}
  <div class="sect" style="margin:12px 0 6px">Thú cưỡi${Mt ? ' · ' + Mt.n : ''}</div>${MOUNTS.map(x => row(x, 'mount')).join('')}<div class="msg" role="status"></div>`;
  const buy = (list, own, id) => { const x = list.find(q => q.id === id); if (!x || S.gold < x.price || S.lv < x.lv) return; S.gold -= x.price; own.push(id); return x; };
  bagBody.querySelectorAll('[data-buypet]').forEach(b => b.onclick = () => { const x = buy(PETS, S.pets, b.dataset.buypet); if (x) { S.pet = x.id; afterChange(); flash('Đã có ' + x.n + '!', 'ok'); } });
  bagBody.querySelectorAll('[data-buymount]').forEach(b => b.onclick = () => { const x = buy(MOUNTS, S.mounts, b.dataset.buymount); if (x) { S.mount = x.id; afterChange(); fxBeam(S.pos.x, S.pos.z, '#9fe8ff', 1.2); flash('Đã có ' + x.n + '!', 'ok'); } });
  bagBody.querySelectorAll('[data-pet]').forEach(b => b.onclick = () => { S.pet = S.pet === b.dataset.pet ? null : b.dataset.pet; afterChange(); });
  bagBody.querySelectorAll('[data-mount]').forEach(b => b.onclick = () => { S.mount = S.mount === b.dataset.mount ? null : b.dataset.mount; afterChange(); });
}
function renderSkills() {
  const C = CLS[S.cls];
  bagBody.innerHTML = `<p class="muted" style="margin-top:0"><b style="color:${C.col}">${C.icon} ${C.name}</b> — ${C.desc}</p>
  ${SKILLS[S.cls].map((sk, j) => { const on = S.lv >= sk.lv; return `<div class="skrow${on ? '' : ' lk'}"><div class="ic" style="background:${ELC[sk.el]}22;border:1.5px solid ${ELC[sk.el]}">${ELI[sk.el]}</div><div><b style="color:${ELC[sk.el]};font-size:13.5px">${j + 1}. ${sk.name}</b><span class="el" style="background:${ELC[sk.el]}33;color:${ELC[sk.el]}">${ELN[sk.el]}</span>
    <span style="color:#9a907a"> · hồi ${skCd(sk).toFixed(2)}s · <span style="color:#5ab0ff">${skMp(sk)} Mana</span> · ${on ? '<span style="color:#7dff9a">đã mở</span>' : 'mở ở cấp ' + sk.lv}</span><br>${sk.act}</div></div>`; }).join('')}
  <p class="muted"><b style="color:var(--gold)">Trạng thái:</b> ❄ Đóng băng (đứng yên, +30% ST nhận) · ⚡ Tê liệt (khựng, +20%) · 🔥 Thiêu đốt (cháy dần, +15%) · 💧 Ướt (+35% từ Băng/Sét, +10% khác). Thời gian hồi kỹ năng = hệ số ÷ số đòn mỗi giây (tối thiểu 0.1 giây) — tốc đánh càng cao, ra chiêu càng dày; Mana là giới hạn. Khi bật tự động, nhân vật tự dùng kỹ năng.</p>`;
}

// ---------- map panel ----------
function openMap() { closeBag(); $('mapP').classList.remove('hide');
  $('mapList').innerHTML = [TOWN, ...MAPS.map((_, i) => i).filter(i => i !== TOWN)].map(i => { const M = MAPS[i]; const lo = M.lo, hi = M.hi; const ok = true; const here = i === S.map; if (M.town) return `<button data-m="${i}" class="${here ? 'here' : ''}"${here ? ' disabled' : ''}><span class="dot" style="background:#ffd86a;box-shadow:0 0 10px #ffd86a"></span><span><b>${M.name}</b>Thành chính · NPC, chợ, nghỉ ngơi · ${here ? 'Đang ở đây' : 'Chạm để về thành'}</span></button>`;
    return `<button data-m="${i}" class="${here ? 'here' : ''}"${ok && !here ? '' : ' disabled'}><span class="dot" style="background:#${new THREE.Color(M.pal.rune).getHexString()};box-shadow:0 0 10px #${new THREE.Color(M.pal.rune).getHexString()}"></span><span><b>${M.name}</b>${M.culture ? M.culture + ' · ' : ''}Quái cấp ${lo}–${hi}${S.lv < lo - 20 ? ' <b style="display:inline;font:inherit;color:#ff8a8a">· nguy hiểm</b>' : ''} · Boss ${MT[M.boss.k].name}<br>Rơi đồ <span style="color:${SETS[M.set].col}">${SETS[M.set].n}</span> · ${here ? '<b style="display:inline;font:inherit;color:var(--cyan)">Đang ở đây</b>' : ok ? 'Chạm để dịch chuyển' : 'Cần cấp ' + M.req}</span></button>`; }).join('');
  $('mapList').querySelectorAll('button[data-m]').forEach(b => b.onclick = () => { const i = +b.dataset.m; closeMap(); travel(i); }); $('mapClose').focus(); }
function closeMap() { $('mapP').classList.add('hide'); }
$('mapClose').onclick = closeMap;
function travel(i) { for (const p of projs) scene.remove(p.m); projs.length = 0; for (const s of sks) if (s.type === 'meteor') scene.remove(s.m); sks.length = 0; S.bossT = 60; setMap(i); showZone(); saveGame(); fxBeam(0, 8, '#9fe8ff', 1.4, 1.2); }

// ---------- world: party, bot card, trade, NPCs ----------
let wMode = 'party', wArg = null;
function openWorld(mode, arg) { closeBag(); closeMap(); wMode = mode; wArg = arg; $('wP').classList.remove('hide'); renderWorldPanel(); }
function closeWorld() { $('wP').classList.add('hide'); }
$('wClose').onclick = closeWorld; $('bParty').onclick = () => openWorld('party'); $('bRank').onclick = () => openWorld('rank');
function charAt(cx, cy) { let best = null, bd = 44; const test = (pos, h, o) => { const [sx, sy, ok] = toScreen(tmpV.set(pos.x, h, pos.z)); const d = Math.hypot(sx - cx, sy - cy); if (ok && d < bd) { bd = d; best = o; } };
  for (const e of npcEnts) test(e.pos, HERO_H * 0.55, e); for (const e of ents.values()) if (!e.dead) test(e.pos, 0.55 + HERO_H * 0.55, e); return best; }
function npcAct(id) { if (id === 'smith') openBag('gear'); else if (id === 'pets') openBag('pet'); else if (id === 'guide') openMap(); else openWorld(id); }
const botTag = b => `<b style="color:${CLS[b.cls].col}">${CLS[b.cls].icon} ${b.name}</b> · ${CLS[b.cls].name} · Lv ${b.lv}`;
const itemLine = g => g.slot === 'charm' ? `<b style="color:${CHARMS[g.charm].col}">${g.name}${qty(g) > 1 ? ' ×' + qty(g) : ''}</b> · ${CHARMS[g.charm].d} · giá mỗi lá` : `<b style="color:${g.set ? SETS[g.set].col : RARITY[g.r].css}">${g.name}${g.plus ? ' +' + g.plus : ''}</b> · ${SLOTS[g.slot].n} cấp ${g.lv} · ${Object.entries(gearStats(g)).map(([k, v]) => STAT_N[k] + ' ' + v).join(', ')}`;
const buyPrice = g => Math.round((g.slot === 'charm' ? (3000 + g.lv * 120) * CHARMS[g.charm].pv : sellPrice(g) * 2.6) * (g.pm || (g.pm = rr(0.85, 1.25))));
const offerPrice = (g, b) => Math.round((g.slot === 'charm' ? (1800 + g.lv * 70) * CHARMS[g.charm].pv : sellPrice(g) * 1.6) * (0.85 + (b.hue * 7 % 1) * 0.4));
function renderWorldPanel() { if ($('wP').classList.contains('hide')) return; const B = $('wBody'); const here = [...ents.values()].filter(e => !e.dead).map(e => e.b);
  if (wMode === 'party') { $('wTitle').textContent = 'Nhóm';
    const P = S.party, lead = P && P.leader === 'me';
    B.innerHTML = `<p class="muted" style="margin-top:0">Lập nhóm với người chơi khác cùng map để đánh chung: thành viên ở gần (15m) chia nhau <b style="color:var(--gold)">50% EXP</b> mỗi lần hạ quái, đồ rơi chung, cả nhóm +10% EXP. Bật <b>Theo sát</b> để mọi người luôn ở trong vòng 2m quanh trưởng nhóm.</p>
    ${P ? `<div class="sect" style="margin:8px 0 6px">Thành viên (${P.members.length + 1}/5)</div>
      <div class="row"><div class="t">${P.leader === 'me' ? '♛ ' : ''}<b style="color:var(--gold)">Bạn</b> · ${CLS[S.cls].name} · Lv ${S.lv}</div></div>
      ${partyBots().map(b => `<div class="row"><div class="t">${P.leader === b.id ? '♛ ' : ''}${botTag(b)}</div><button class="pb" data-tr="${b.id}">Giao dịch</button>${lead ? `<button class="pb" data-kick="${b.id}">Mời ra</button>` : ''}</div>`).join('')}
      <div class="acts" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="pb pri" id="wFollow">Theo sát ${lead ? '(cả nhóm theo bạn)' : 'trưởng nhóm'}: ${P.follow ? 'BẬT' : 'TẮT'}</button><button class="pb" id="wLeave">${lead ? 'Giải tán nhóm' : 'Rời nhóm'}</button></div>`
      : `<button class="pb pri" id="wCreate" style="margin-top:6px">Lập nhóm</button>`}
    <div class="sect" style="margin:12px 0 6px">Người chơi ở gần (${here.length})</div>
    ${here.length ? here.map(b => `<div class="row"><div class="t">${botTag(b)}${inParty(b) ? ' · <span style="color:#7dff9a">cùng nhóm</span>' : ''}</div>${!inParty(b) && (!P || lead) ? `<button class="pb pri" data-inv="${b.id}">Mời</button>` : ''}<button class="pb" data-tr="${b.id}">Giao dịch</button></div>`).join('') : '<p class="muted">Chưa có ai ở map này.</p>'}`;
    const c = $('wCreate'); if (c) c.onclick = () => { createParty(); renderWorldPanel(); updateHud(); };
    const f = $('wFollow'); if (f) f.onclick = () => { S.party.follow = !S.party.follow; log('Theo sát: ' + (S.party.follow ? 'BẬT — giữ trong vòng 2m quanh trưởng nhóm.' : 'TẮT.'), '#9fe8ff'); renderWorldPanel(); updateHud(); };
    const l = $('wLeave'); if (l) l.onclick = () => { leaveParty(); renderWorldPanel(); updateHud(); };
    B.querySelectorAll('[data-inv]').forEach(b => b.onclick = () => inviteBot(S.bots.find(q => q.id === b.dataset.inv)));
    B.querySelectorAll('[data-kick]').forEach(b => b.onclick = () => { kickBot(b.dataset.kick); renderWorldPanel(); updateHud(); });
    B.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => openWorld('trade', b.dataset.tr)); }
  else if (wMode === 'bot') { const b = S.bots.find(q => q.id === wArg); $('wTitle').textContent = b.name;
    B.innerHTML = `<p style="margin:0">${botTag(b)}</p><p class="muted">${inParty(b) ? 'Đang cùng nhóm với bạn.' : 'Đã hạ ' + fmt(b.kills) + ' quái.'} Vàng: ${fmt(b.gold)}</p>
      <div style="display:flex;gap:8px;margin-top:10px">${!inParty(b) ? '<button class="pb pri" id="wInv">Mời vào nhóm</button>' : ''}<button class="pb pri" id="wTr">Giao dịch</button></div>`;
    const i = $('wInv'); if (i) i.onclick = () => { inviteBot(b); closeWorld(); }; $('wTr').onclick = () => openWorld('trade', b.id); }
  else if (wMode === 'trade') { const b = S.bots.find(q => q.id === wArg); $('wTitle').textContent = 'Giao dịch';
    const mine = S.inv.filter(g => !g.lockT);
    B.innerHTML = `<p style="margin:0">${botTag(b)} · Vàng của họ: <b style="color:var(--gold)">${fmt(b.gold)}</b> · Vàng của bạn: <b style="color:var(--gold)">${fmt(S.gold)}</b></p>
      <div class="sect" style="margin:10px 0 6px">${b.name} bán</div>${b.inv.length ? b.inv.map((g, i) => `<div class="row">${tileHtml(g, 'tabindex="-1"')}<div class="t">${itemLine(g)}</div><button class="pb pri" data-buy="${i}"${S.gold < buyPrice(g) ? ' disabled' : ''}>Mua ${fmt(buyPrice(g))}</button></div>`).join('') : '<p class="muted">Họ chưa có gì để bán.</p>'}
      <div class="sect" style="margin:12px 0 6px">Bạn bán cho ${b.name}</div>${mine.length ? mine.map(g => `<div class="row">${tileHtml(g, 'tabindex="-1"')}<div class="t">${itemLine(g)}</div><button class="pb" data-sell="${g.id}"${b.gold < offerPrice(g, b) ? ' disabled' : ''}>Bán ${fmt(offerPrice(g, b))}</button></div>`).join('') : '<p class="muted">Túi đồ trống.</p>'}<div class="msg" role="status"></div>`;
    const say = t => { const e = ents.get(b.id); if (e) botSay(e, t); };
    B.querySelectorAll('[data-buy]').forEach(x => x.onclick = () => { const g = b.inv[+x.dataset.buy]; const p = buyPrice(g); if (!g || S.gold < p || (S.inv.length >= BAG_MAX && !S.inv.some(q => stackKey(q) && stackKey(q) === stackKey(g)))) { log(S.inv.length >= BAG_MAX ? 'Túi đầy.' : 'Không đủ vàng.', '#ff9a9a'); return; }
      S.gold -= p; b.gold += p; S.traded = (S.traded || 0) + p; b.traded = (b.traded || 0) + p; const got = takeOne(b.inv, g); delete got.pm; addItem(got); log(`Đã mua [${g.name}] của ${b.name} giá ${fmt(p)} vàng.`, '#7dff9a'); say('Cảm ơn nhé!'); afterChange(); renderWorldPanel(); });
    B.querySelectorAll('[data-sell]').forEach(x => x.onclick = () => { const g = S.inv.find(q => q.id === x.dataset.sell); if (!g) return; const p = offerPrice(g, b); if (b.gold < p) return;
      const sold = takeOne(S.inv, g); S.gold += p; b.gold -= p; S.traded = (S.traded || 0) + p; b.traded = (b.traded || 0) + p; if (!stackInto(b.inv, sold)) { b.inv.push(sold); if (b.inv.length > 12) b.inv.shift(); } log(`Đã bán [${g.name}] cho ${b.name} được ${fmt(p)} vàng.`, '#ffd86a'); say('Món này ngon!'); afterChange(); renderWorldPanel(); }); }
  else if (wMode === 'rank') { $('wTitle').textContent = 'Bảng xếp hạng'; const tabs = [['lv', 'Cấp độ'], ['pow', 'Lực chiến'], ['eco', 'Kinh tế']]; const k = wArg || 'lv';
    const rows = rankRows(k); const me = rows.findIndex(r => r.me); const unit = { lv: 'Cấp', pow: 'Lực chiến', eco: 'Tài sản' }[k];
    B.innerHTML = `<div class="tabs" style="padding:0 0 8px">${tabs.map(([id, n]) => `<button data-rk="${id}" aria-selected="${id === k}">${n}</button>`).join('')}</div>
      <p class="muted" style="margin:0 0 8px">${k === 'lv' ? 'Xếp theo cấp, cùng cấp thì ai nhiều EXP hơn đứng trên.' : k === 'pow' ? 'Lực chiến = sát thương mỗi giây ước tính (tấn công × đòn/giây × siêu đòn × hệ số cánh, bộ, bùa) + độ bền (máu, phòng thủ).' : 'Tài sản = vàng + giá trị đồ trong túi và đang mặc. Cột phải là tổng vàng đã giao dịch.'}
      Bạn đang hạng <b style="color:var(--gold)">#${me + 1}</b> / ${rows.length}.</p>
      ${rows.map((r, i) => `<div class="row" style="${r.me ? 'border-color:var(--gold);background:rgba(242,198,107,.12)' : ''}"><b style="width:30px;color:${i < 3 ? ['#ffd23a', '#d8e0e8', '#e0905a'][i] : '#93c6cf'}">#${i + 1}</b>
        <div class="t"><b style="color:${CLS[r.cls].col}">${CLS[r.cls].icon} ${r.name}</b>${r.party ? ' <span style="color:#7dff9a">◆</span>' : ''} · ${CLS[r.cls].name} · Lv ${r.lv}<br><span class="muted" style="font-size:11px">${r.where}</span></div>
        <div style="text-align:right;font:700 12px var(--ui)"><b style="color:var(--gold)">${fmt(Math.round(r.v))}</b>${k === 'eco' ? `<br><span class="muted" style="font-size:10.5px">vàng ${fmt(r.gold)} · GD ${fmt(r.traded)}</span>` : `<br><span class="muted" style="font-size:10.5px">${unit}</span>`}</div></div>`).join('')}`;
    B.querySelectorAll('[data-rk]').forEach(x => x.onclick = () => { wArg = x.dataset.rk; renderWorldPanel(); }); }
  else if (wMode === 'shop') { $('wTitle').textContent = 'Hermes · Thương Nhân';
    const goods = [['e', 1, 300 + S.lv * 6], ['e', 10, 2800 + S.lv * 55], ['f', 1, 2500 + S.lv * 25], ['c', 1, 6000 + S.lv * 40]];
    B.innerHTML = `<p class="muted" style="margin-top:0">Nguyên liệu bán sẵn. Muốn bán đồ, hãy giao dịch với người chơi khác ở chợ Agora (giá tốt hơn bán thường).</p>${goods.map(([k, n, p], i) => `<div class="row">${mIcon(k)}<div class="t"><b style="color:${MATS[k].col}">${MATS[k].name} ×${n}</b><br>${MATS[k].desc}</div><button class="pb pri" data-g="${i}"${S.gold < p ? ' disabled' : ''}>Mua ${fmt(p)}</button></div>`).join('')}`;
    B.querySelectorAll('[data-g]').forEach(x => x.onclick = () => { const [k, n, p] = goods[+x.dataset.g]; if (S.gold < p) return; S.gold -= p; S.mats[k] += n; log(`Đã mua ${MATS[k].name} ×${n}.`, MATS[k].col); afterChange(); renderWorldPanel(); }); }
  else if (wMode === 'market') { $('wTitle').textContent = 'Chợ Agora'; const list = S.bots.filter(b => b.map === S.map && b.inv.length);
    B.innerHTML = `<p class="muted" style="margin-top:0">Người chơi đang ở thành và đồ họ rao bán. Chạm "Giao dịch" để mua hoặc bán đồ cho họ bằng vàng.</p>${list.length ? list.map(b => `<div class="row"><div class="t">${botTag(b)}<br>${b.inv.slice(0, 3).map(g => g.slot === 'charm' ? `<span style="color:${CHARMS[g.charm].col}">✦ ${g.name}</span>` : `<span style="color:${g.set ? SETS[g.set].col : RARITY[g.r].css}">${g.name}${g.plus ? ' +' + g.plus : ''}</span>`).join(' · ')}${b.inv.length > 3 ? ' …' : ''}</div><button class="pb pri" data-tr="${b.id}">Giao dịch</button></div>`).join('') : '<p class="muted">Chợ đang vắng, quay lại sau nhé.</p>'}`;
    B.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => openWorld('trade', b.dataset.tr)); }
}

// ---------- rankings: everyone in the world, bots and you ----------
const itemsValue = list => list.reduce((s, g) => s + (g ? sellPrice(g) * qty(g) : 0), 0);
function botPower(b) { const st = botStats(b); return st.atk * DMG_SCALE * st.aps * 1.3 * (1 + Math.min(5, Math.floor(b.lv / 120)) * 0.25) + st.hp * 0.05 + st.def * 2; }
function myPower() { return HS.atk * DMG_SCALE * HS.aps * avgMult() * HS.dmgMul + HS.hp * 0.05 + HS.def * 2; }
function rankRows(k) { const where = m => MAPS[m] ? MAPS[m].name : '';
  const rows = S.bots.map(b => ({ name: b.name, cls: b.cls, lv: b.lv, exp: b.exp, gold: b.gold, traded: b.traded || 0, party: inParty(b), where: where(b.map),
    v: k === 'lv' ? b.lv : k === 'pow' ? botPower(b) : b.gold + itemsValue(b.inv) }));
  rows.push({ me: true, name: 'Bạn', cls: S.cls, lv: S.lv, exp: S.exp, gold: S.gold, traded: S.traded || 0, where: where(S.map), v: k === 'lv' ? S.lv : k === 'pow' ? myPower() : S.gold + itemsValue(S.inv) + itemsValue(Object.values(S.eq)) });
  return rows.sort((a, b) => b.v - a.v || (k === 'lv' ? b.exp / expNeed(b.lv) - a.exp / expNeed(a.lv) : 0)); }

// ---------- save (browser + cloud) ----------
const SKEY = 'vuclam-save-v2', OLDKEY = 'vuclam-save-v1';
const Store = { db: null, uid: null, writing: false, pending: null };
let SAVE = null, OLD = null, running = false, best = 0;
function snapshot() { return { v: 2, ts: Date.now(), cls: S.cls, lv: S.lv, exp: Math.floor(S.exp), gold: S.gold, mats: { ...S.mats }, st: { ...S.st }, wing: S.wing, inv: S.inv, eq: Object.fromEntries(SLOT_ORDER.map(s => [s, S.eq[s] || null])), map: S.map, auto: S.auto, autoLoot: S.autoLoot, traded: S.traded || 0, bots: S.bots, party: S.party, pets: S.pets, pet: S.pet, mounts: S.mounts, mount: S.mount, playT: Math.round(S.playT), lvLog: S.lvLog }; }
function applySave(d) { S = newState(d.cls); Object.assign(S, { lv: d.lv || 1, exp: d.exp || 0, gold: d.gold || 0, wing: Math.min(WMAX, d.wing || 0), map: d.map || 0, auto: d.auto !== false });
  S.mats = Object.assign(S.mats, d.mats || {}); S.st = Object.assign(S.st, d.st || {}); S.inv = Array.isArray(d.inv) ? d.inv : []; S.eq = {}; for (const s of SLOT_ORDER) if (d.eq && d.eq[s]) S.eq[s] = d.eq[s];
  S.pets = d.pets || []; S.pet = d.pet || null; S.mounts = d.mounts || []; S.mount = d.mount || null; S.playT = d.playT || 0; S.autoLoot = d.autoLoot !== false; S.traded = d.traded || 0; S.bots = Array.isArray(d.bots) ? d.bots : null; S.party = d.party || null;
  { const inv = []; for (const g of S.inv) if (!stackInto(inv, g)) inv.push(g); S.inv = inv; } // older saves: merge loose charms into stacks S.lvLog = d.lvLog || [];
  for (const g of [...S.inv, ...Object.values(S.eq)]) if (g && AS_SLOTS.includes(g.slot) && g.base.as == null) g.base.as = gearAS(g.lv, g.r); // older weapons get their speed roll
  }
async function initStore() { try { if (window.claude && typeof window.claude.use === 'function') { const db = await window.claude.use('db'); const u = await window.claude.use('user'); if (db && u) { const id = await u.id(); if (id) { Store.db = db; Store.uid = id; } } } } catch (e) { } await refreshSave(); }
async function readSave() { let b = null; try { const l = JSON.parse(localStorage.getItem(SKEY) || 'null'); if (l && l.v === 2) b = l; } catch (e) { }
  if (Store.db) { try { const s = await Promise.race([Store.db.doc(`data/users/${Store.uid}/save`).get(), new Promise((_, r) => setTimeout(() => r('timeout'), 9000))]); if (s && s.exists) { const d = s.data(); if (d && d.v === 2 && (!b || d.ts > b.ts)) b = JSON.parse(JSON.stringify(d)); } } catch (e) { } }
  return b; }
async function refreshSave() { SAVE = await readSave(); if (!SAVE) { try { OLD = JSON.parse(localStorage.getItem(OLDKEY) || 'null'); } catch (e) { } } updateStartUI(); }
let saveCD = 0;
async function saveGame(quiet) { if (!S || !running) return false; const d = snapshot(); SAVE = d; let local = false; try { localStorage.setItem(SKEY, JSON.stringify(d)); local = true; } catch (e) { }
  let cloud = false; if (Store.db) { Store.pending = d; if (!Store.writing) { Store.writing = true; while (Store.pending) { const x = Store.pending; Store.pending = null; try { await Store.db.doc(`data/users/${Store.uid}/save`).set(JSON.parse(JSON.stringify(x))); cloud = true; } catch (e) { cloud = false; } } Store.writing = false; } else cloud = true; }
  return { local, cloud, any: local || cloud }; }
function updateStartUI() { const c = $('contBtn'); if (SAVE) { c.classList.remove('hide'); c.textContent = `TIẾP TỤC · ${CLS[SAVE.cls].name} Lv ${SAVE.lv}`; } else if (OLD) { c.classList.remove('hide'); c.textContent = `TIẾP TỤC BẢN CŨ · Lv ${OLD.lv || 1}`; } else c.classList.add('hide');
  $('cloudTxt').textContent = Store.db ? 'Tiến trình được lưu lên tài khoản của bạn — mở trên máy khác vẫn chơi tiếp được.' : 'Tiến trình được lưu trên trình duyệt này.'; }

// ---------- start / class select / menu ----------
let pickCls = null, migrate = null;
function openClass(note) { $('startOv').classList.add('hide'); $('classOv').classList.remove('hide'); $('classNote').textContent = note || 'Mỗi lớp có giáp, vũ khí, đòn thường và 3 kỹ năng riêng (mở ở cấp 1, 10 và 25).'; pickCls = null; renderClasses(); }
function renderClasses() { $('classList').innerHTML = CORDER.map(k => { const C = CLS[k]; return `<button data-c="${k}" aria-pressed="${pickCls === k}" style="--c:${C.col}"><b style="color:${C.col}">${C.icon} ${C.name}</b>${C.desc}<span style="color:#93c6cf">${C.melee ? 'Cận chiến' : 'Tầm xa'} · Kỹ năng: ${SKILLS[k].map(s => s.name).join(', ')}</span></button>`; }).join('');
  $('classList').querySelectorAll('button').forEach(b => b.onclick = () => { pickCls = b.dataset.c; renderClasses(); }); $('classGo').disabled = !pickCls; }
$('newBtn').onclick = () => { migrate = null; openClass(); };
$('classBack').onclick = () => { $('classOv').classList.add('hide'); $('startOv').classList.remove('hide'); };
$('contBtn').onclick = () => { if (SAVE) { applySave(SAVE); startRun(); } else if (OLD) { migrate = OLD; openClass('Bản lưu cũ chưa có lớp nhân vật. Chọn một lớp — cấp độ, vàng, đá cường hóa và trang bị (trừ cánh cũ) được giữ lại.'); } };
$('classGo').onclick = () => { if (!pickCls) return; S = newState(pickCls);
  if (migrate) { const o = migrate; Object.assign(S, { lv: o.lv || 1, exp: o.exp || 0, gold: o.gold || 0 }); S.mats.e += o.stones || 0; const conv = g => g && g.slot !== 'wings' ? Object.assign({ set: null }, g) : null;
    S.inv = (o.inv || []).map(conv).filter(Boolean); if (o.eq) for (const s of SLOT_ORDER) if (o.eq[s]) S.eq[s] = conv(o.eq[s]); const oldW = [...(o.inv || []), ...Object.values(o.eq || {})].filter(g => g && g.slot === 'wings').length; S.mats.f += oldW * 3; }
  $('classOv').classList.add('hide'); startRun(true); };
function startRun(fresh) {
  $('startOv').classList.add('hide'); $('classOv').classList.add('hide'); $('menuOv').classList.add('hide'); $('hud').classList.remove('hide');
  if (!S.bots) S.bots = newBots(); else if (S.bots.length < BOT_NAMES.length) { const fresh = newBots(); for (const b of fresh) if (!S.bots.some(q => q.id === b.id)) S.bots.push(b); } S.map = TOWN; recalc(true); running = true; buildHero3D(); setMap(S.map); recalc(true); applyPetMount(); showZone(); updateHud(); fitCam = true;
  if (fresh) log('Chào mừng đến Vực Lam! Chạm vào nền để di chuyển, chạm vào quái để đánh. Tự động đánh đang bật. Mở túi đồ để khảm linh thạch và chế cánh.', '#9fe8ff');
  saveGame();
}
function openMenu() { $('menuOv').classList.remove('hide'); paused = true; const h = Math.floor(S.playT / 3600), mi = Math.floor(S.playT / 60) % 60; const L = S.lvLog.filter(e => e[0] >= S.playT - 600); const pace = L.length > 1 ? (L[L.length - 1][1] - L[0][1]) / Math.max(60, L[L.length - 1][0] - L[0][0]) * 3600 : 0;
  $('menuInfo').innerHTML = `${CLS[S.cls].name} · Cấp <b>${S.lv}</b> / ${MAXLV} · ${MAPS[S.map].name}<br>Đã chơi ${h} giờ ${mi} phút${pace ? ` · tốc độ gần đây ≈ <b>${Math.round(pace)}</b> cấp/giờ` : ''}`; $('mMsg').textContent = ''; $('mResume').focus(); }
let paused = false;
$('mResume').onclick = () => { $('menuOv').classList.add('hide'); paused = false; };
$('mSave').onclick = async () => { $('mMsg').textContent = 'Đang lưu...'; const r = await saveGame(); $('mMsg').textContent = r && r.any ? `Đã lưu lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}${Store.db ? (r.cloud ? ' (đám mây + máy này)' : ' (chỉ máy này)') : ''}.` : 'Không lưu được trên trình duyệt này.'; };
$('mHome').onclick = async () => { await saveGame(); running = false; paused = false; $('menuOv').classList.add('hide'); $('hud').classList.add('hide'); closeBag(); closeMap(); $('startOv').classList.remove('hide'); updateStartUI(); };
document.addEventListener('visibilitychange', () => { if (document.hidden && running) saveGame(); });

// ---------- camera, post-processing, loop ----------
function makeComposer() { const w = innerWidth, h = innerHeight; const rt = new THREE.WebGLRenderTarget(w * DPR, h * DPR, { type: THREE.HalfFloatType, samples: 4 }); const c = new EffectComposer(renderer, rt); c.setPixelRatio(DPR); c.setSize(w, h);
  c.addPass(new RenderPass(scene, camera)); c.addPass(new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.55, 0.45, 0.95)); c.addPass(new OutputPass()); return c; }
let composer = makeComposer(), fitCam = true;
function onResize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.fov = innerHeight > innerWidth ? 46 : 36; camera.updateProjectionMatrix(); composer.dispose?.(); composer = makeComposer(); const s = innerHeight * DPR * 0.5; pMat.uniforms.uScale.value = s; moteMats.forEach(m => m.uniforms.uScale.value = s); }
addEventListener('resize', onResize); onResize();
// title screen backdrop
S = newState('fire'); setMap(0); S = null; camera.position.set(0, 12, 14); camera.lookAt(0, 0, 0);
initStore();
const clock = new THREE.Clock(); let hudT = 0, saveT = 0, fpsAcc = 0, fpsN = 0, fpsCheck = 0; const camPos = new THREE.Vector3();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime; U.uTime.value = t;
  if (running && !paused) {
    S.time += dt; updateTouch(dt); updateHero(dt, t); updateMobs(dt, t); updateLoot(dt, t); updateProjs(dt); updSkills(dt);
    hudT -= dt; if (hudT <= 0) { hudT = 0.2; updateHud(); if (!bagEl.classList.contains('hide') && tab !== 'gear') { } }
    saveT += dt; if (saveT > 20) { saveT = 0; saveGame(); }
    if (zoneT > 0) { zoneT -= dt; if (zoneT <= 0) $('zone').style.opacity = 0; }
  }
  if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('banner').classList.remove('show'); }
  if (running && !paused && S) { updateBots(dt, t); updateNpcs(dt, t); if (isTown() && !npcEnts.length && heroGLTF) spawnNpcs(); }
  updateParticles(dt); updateFx(dt); heroLookTick(dt, t); for (const f of scenery) f(t, dt);
  if (S) { const portrait = innerHeight > innerWidth; const dist = portrait ? 1.2 : 1; camPos.set(S.pos.x, 11 * dist, S.pos.z + 9.5 * dist); if (fitCam) { camera.position.copy(camPos); fitCam = false; } camera.position.lerp(camPos, Math.min(1, dt * 4));
    if (S.shake > 0) { S.shake -= dt; camera.position.x += (Math.random() - 0.5) * S.shake * 0.4; camera.position.y += (Math.random() - 0.5) * S.shake * 0.4; }
    camera.lookAt(camera.position.x, 1.0, camera.position.z - 9.5 * dist);
    moteMats.forEach(m => m.uniforms.uCenter.value.copy(S.pos)); shafts.position.set(S.pos.x * 0.6, 0, S.pos.z * 0.6); updateLabels(); }
  else { camera.position.set(Math.sin(t * 0.08) * 14, 10, Math.cos(t * 0.08) * 14); camera.lookAt(0, 0.5, 0); }
  aura.visible = !!S;
  composer.render(dt);
  fpsAcc += dt; fpsN++; fpsCheck += dt; if (fpsCheck > 5 && DPR > 1) { if (fpsN / fpsAcc < 38) { DPR = Math.max(1, DPR - 0.5); renderer.setPixelRatio(DPR); onResize(); } fpsAcc = fpsN = fpsCheck = 0; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
</script>
