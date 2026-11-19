
// =====================================================================
// ALLIANCE MODE (3 teams vs the horde, 2 AI allies) — ported from the 2D original
// =====================================================================
const MSGC = {
  start: { aggr: ['HắcLong có mặt! Liên minh tam hải, quái tới bao nhiêu chém bấy nhiêu 💪', 'Quái nào mình hạ thì đồ thuộc về mình nhé, công bằng mà 😎'], coop: ['TuyếtVân đây! Cùng nhau giữ Thánh Vật liên minh nào 🤝', 'Mình sẽ đỡ làn nào đông quái nhất, cứ gọi nhé!'] },
  plan: { aggr: ['Đợt {w}: Hồng Liên chặn quái ngay đầu đường!', 'Đợt {w}: ai rảnh thì bắn quái đã vào sâu nhất!'], coop: ['Đợt {w}: giữ đội hình, ưu tiên quái sắp chạm Thánh Vật.', 'Đợt {w}: Băng Pháp Sư nhớ làm chậm cụm đông nhé ❄'] },
  boss: { aggr: ['Boss {boss} tới rồi! Dồn hết hỏa lực — ai hạ thì người đó nhặt đồ 😏'], coop: ['Boss {boss} xuất hiện! Mọi người cùng dồn sát thương nhé!'] },
  bossAll: { aggr: ['Hai boss liền một lúc?! Chiến thôi! 🔥'], coop: ['Hai boss nối đuôi nhau! Giữ đội hình, dồn hỏa lực!'] },
  pressure: { aggr: ['{n} con sắp chạm Thánh Vật! Hồng Liên dọn ngay!'], coop: ['{n} con đang áp sát Thánh Vật, ưu tiên bắn con đi đầu!'] },
  hp75: { aggr: ['Thánh Vật liên minh còn {hp}%, chú ý đó!'], coop: ['Thánh Vật liên minh còn {hp}%, cẩn thận nhé mọi người!'] },
  hp50: { aggr: ['Còn {hp}% thôi! Đừng mải nhặt đồ nữa, giữ làn đi!'], coop: ['Thánh Vật còn {hp}%... tất cả tập trung phòng thủ!'] },
  hp25: { aggr: ['NGUY CẤP! Còn {hp}%!! Không con nào được lọt!'], coop: ['Cố lên, chỉ còn {hp}%... đừng để lọt con nào!'] },
  loot: { aggr: ['Hạ boss rồi! Đồ boss là của Hồng Liên nhé 😎'], coop: ['Boss rơi đồ cho Thanh Phong rồi, cảm ơn mọi người đã hỗ trợ! 🙏'] },
  lootPlayer: { aggr: ['Bạn cướp được boss rồi, chúc mừng... lần sau tới lượt mình 😤'], coop: ['Bạn hạ boss đẹp quá! Đồ là của bạn 🎉'] },
  rare: { aggr: ['Vừa nổ {item}! Số hưởng là đây 😎'], coop: ['Yay, rơi {item} rồi! ✨'] },
  lv: { aggr: ['{hero} bên mình lên cấp {lv}, run sợ đi!'], coop: ['{hero} của Thanh Phong vừa lên cấp {lv} 🎉'] },
  evo: { aggr: ['{hero} của Hồng Liên vừa TIẾN HÓA! Ai cản nổi giờ? 🔥'], coop: ['{hero} của Thanh Phong đã tiến hóa ✨ Sức mạnh tăng vọt!'] },
  banter: { aggr: ['Hồng Liên đã hạ {me} quái, ai đóng góp nhiều hơn nào? 😏', 'Đồ rơi đầy đất, mê quá!', 'Combo vừa rồi đẹp chưa? 💥'], coop: ['Mọi người nhớ khảm đá giữa các đợt nha!', 'Liên minh mình phối hợp tốt ghê 👍', 'Mana ổn, sẵn sàng hỗ trợ ✨'] },
  thanks: { aggr: ['Không có gì, liên minh mà! Nhưng đồ mình hạ thì mình nhặt nhé 😎'], coop: ['Không có chi! Cùng cố gắng nhé 💪'] },
  helpYes: { aggr: ['Ok, Hồng Liên dồn hỏa lực về gần Thánh Vật!'], coop: ['Thanh Phong bảo vệ Thánh Vật đây! Giữ vững nhé!'] },
  helpNo: { aggr: ['Đang kẹt quái, chờ chút!'], coop: ['Đang dọn quái đầu đường, xong là hỗ trợ liền!'] },
  bossYes: { aggr: ['Chuẩn! Dồn hết vào boss!'], coop: ['Ok, tập trung boss nào!'] },
  split: { aggr: ['Ok, Hồng Liên chặn quái đi đầu!'], coop: ['Rõ! Thanh Phong ưu tiên quái đi đầu.'] },
  coop: { aggr: ['Liên minh bất bại! 💪'], coop: ['Cùng nhau trụ vững tới cùng! 🤝'] },
  modeHunt: { aggr: ['Hồng Liên đi săn boss!'], coop: ['Thanh Phong sang dồn boss!'] }, modeLane: { aggr: ['Về giữ làn.'], coop: ['Thanh Phong về giữ làn.'] }
};
const QUICKC = [['help', '🆘 Bảo vệ Thánh Vật!'], ['boss', '🎯 Tập trung đánh boss!'], ['thanks', '🙏 Cảm ơn đã giúp!'], ['split', '🛡 Ưu tiên quái đi đầu!'], ['coop', '💪 Cùng nhau trụ vững!']];
function fillT(s, v) { return s.replace(/\{(\w+)\}/g, (m, k) => v[k] !== undefined ? v[k] : m); }
function pushChat(team, text, col) { S.chat.push({ team, text, col, life: 11 }); if (S.chat.length > 6) S.chat.shift(); renderChat(); }
function sysChat(text, col) { pushChat(-1, text, col || '#bfb49a'); }
function botSay(t, key, v, force, delay) { if (!S.alive[t]) return; const B = S.bot[t]; if (!B) return; if (!force && S.time - B.last < 4) return; const arr = (MSGC[key] || {})[TEAMS[t].pers]; if (!arr) return; B.last = S.time;
  S.chatQ.push({ team: t, text: fillT(arr[(Math.random() * arr.length) | 0], Object.assign({ w: S.wave }, v || {})), delay: delay !== undefined ? delay : 0.5 + Math.random() * 1.2 }); }
function chatTick(dt) { for (const q of S.chatQ) { q.delay -= dt; if (q.delay <= 0) { q.done = true; pushChat(q.team, q.text); } } S.chatQ = S.chatQ.filter(q => !q.done); let ch = false; for (const m of S.chat) { m.life -= dt; if (m.life <= 0) ch = true; } if (ch) { S.chat = S.chat.filter(m => m.life > 0); renderChat(); } }
function setOv(t, mode, sec) { const B = S.bot[t]; B.ov = mode; B.ovT = sec; }
function playerSay(k) { const q = QUICKC.find(x => x[0] === k); if (!q) return; pushChat(0, q[1].slice(2).trim());
  for (const t of [1, 2]) { const aggr = TEAMS[t].pers === 'aggr';
    if (k === 'split') { botSay(t, 'split', {}, true); setOv(t, 'lane', 20); }
    else if (k === 'help') { if (aggr ? Math.random() < 0.8 : true) { botSay(t, 'helpYes', {}, true); setOv(t, 'support', aggr ? 12 : 20); } else botSay(t, 'helpNo', {}, true); }
    else if (k === 'boss') { botSay(t, 'bossYes', {}, true); setOv(t, 'hunt', 15); }
    else if (k === 'thanks') { if (Math.random() < 0.7) botSay(t, 'thanks', {}, true); }
    else if (k === 'coop') botSay(t, 'coop', {}, true); } }
function botLoot(t, keys) { const hs = S.heroes.filter((h, i) => teamOf(i) === t); if (!hs.length) return; const B = S.binv[t];
  for (const k of keys) {
    if (SK.includes(k)) { let b = null, bv = 9; for (const h of hs) { if (!canStone(h, k)) continue; const v = rates(h)[STONES[k].stat]; if (v < bv) { bv = v; b = h; } } if (b) b.st[k]++; if (k === 't' || k === 'x') botSay(t, 'rare', { item: ITEMS[k].name }, k === 'x'); }
    else if (k === 'jb' || k === 'js') hs[(Math.random() * hs.length) | 0][k]++;
    else if (k === 'sc') { const b = hs[(Math.random() * hs.length) | 0]; b.sc = (b.sc || 0) + 1; botSay(t, 'rare', { item: ITEMS.sc.name }, true); }
    else if (k === 'pd' || k === 'rg') { const f = k === 'pd' ? 'pend' : 'ring'; let b = null; for (const h of hs) if (h[f] < ACCMAX && (!b || h[f] < b[f])) b = h; if (b) b[f]++; }
    else if (k === 'f') { B.f++; let b = null; for (const h of hs) if (h.wing < WMAX && (!b || h.wing < b.wing)) b = h; if (b && B.f >= WCOST[b.wing]) { B.f -= WCOST[b.wing]; b.wing++; } } } }
function botAI(dt) { S.aiT -= dt; if (S.aiT > 0) return; S.aiT = 1;
  const boss = S.en.find(e => ET[e.t].boss && !e.dead); const L = LANES[0].len; let near = 0; for (const e of S.en) if (!e.dead && e.d > L * 0.78) near++;
  for (const t of [1, 2]) { const B = S.bot[t], aggr = TEAMS[t].pers === 'aggr'; if (B.ovT > 0) B.ovT -= 1; let mode = 'lane';
    if (B.ovT > 0) mode = B.ov; else if (boss && (aggr ? near < 5 : near < 2)) mode = 'hunt';
    if (mode !== S.tmode[t] && B.ovT <= 0 && mode === 'hunt' && Math.random() < 0.5) botSay(t, 'modeHunt', {});
    S.tmode[t] = mode; }
  if (near >= 4 && S.time - (S.pressT || -99) > 14) { S.pressT = S.time; botSay(1 + ((Math.random() * 2) | 0), 'pressure', { n: near }); }
  for (const th of [75, 50, 25]) if (S.hp < th && !S.hpw[th]) { S.hpw[th] = true; botSay(1 + ((Math.random() * 2) | 0), 'hp' + th, { hp: Math.round(S.hp) }, true); }
  S.banterT = (S.banterT === undefined ? 14 : S.banterT) - 1; if (S.banterT <= 0) { S.banterT = 18 + Math.random() * 14; const t = 1 + ((Math.random() * 2) | 0); botSay(t, 'banter', { me: S.score[t] }); }
  S.heroes.forEach((h, i) => { if (teamOf(i) !== 0) autoPts(h); }); }
function mpWaveStart() { const per = Math.ceil((7 + 2 * S.wave) * COOPN); const q = []; let pool = []; while (pool.length < per) pool = pool.concat(buildWave(S.wave).filter(x => !ET[x].boss));
  for (let n = 0; n < per; n++) q.push({ t: pool[n], lane: n % 2 });
  if (S.wave % 10 === 0) { const k = Math.floor(S.wave / 5); q.push({ t: BOSSES[(k - 1) % 5], lane: 0 }, { t: BOSSES[k % 5], lane: 1 }); botSay(1, 'bossAll', {}, true, 0.4); botSay(2, 'bossAll', {}, true, 1.5); }
  else if (S.wave % 5 === 0) { const bt = bossFor(S.wave); q.push({ t: bt, lane: (S.wave / 5) % 2 }); botSay(1 + ((S.wave / 5) % 2), 'boss', { boss: ET[bt].name }, true, 0.5); }
  else if (S.wave % 3 === 0) botSay(1 + (S.wave % 2), 'plan', {});
  return q; }
function avgRef(hs) { const n = hs.length || 1, o = { lv: 0, wing: 0, st: { c: 0, p: 0, d: 0, t: 0, x: 0 }, jb: 0, js: 0, pend: 0, ring: 0, evo: 0, sc: 0 }; for (const h of hs) { o.lv += h.lv / n; o.wing += h.wing / n; for (const k of SK) o.st[k] += (h.st[k] || 0) / n; o.jb += (h.jb || 0) / n; o.js += (h.js || 0) / n; o.pend += (h.pend || 0) / n; o.ring += (h.ring || 0) / n; o.evo += (h.evo || 0) / n; o.sc += (h.sc || 0) / n; } return o; }
function makeBot(type, ref) { const h = newHero(type); const f = 0.88 + Math.random() * 0.17; h.evo = (ref.evo >= 0.5 || ref.lv * f > MAXLV) ? 1 : 0; h.lv = Math.max(1, Math.min(lvCap(h), Math.round(ref.lv * f))); h.sc = Math.round(ref.sc * f); h.pts = (h.lv - 1) * 3; autoPts(h); h.wing = Math.max(0, Math.min(WMAX, Math.round(ref.wing * f))); for (const k of SK) h.st[k] = Math.round(ref.st[k] * (0.8 + Math.random() * 0.3)); h.jb = Math.round(ref.jb * f); h.js = Math.round(ref.js * f); h.pend = Math.min(ACCMAX, Math.round(ref.pend * f)); h.ring = Math.min(ACCMAX, Math.round(ref.ring * f)); h.mp = maxMP(h); return h; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
let MPOFF = 0, MPPICK = [];
function startCoop(picks) {
  SPPROG = { wave: S.wave, hp: Math.max(1, Math.round(S.hp)) }; const prof = S.profile, inv = S.inv, auto = S.auto, speed = S.speed, relic = S.relic || { lv: 1, exp: 0 };
  clearBoard(); S = newState(); S.profile = prof; S.inv = inv; S.auto = auto; S.speed = speed; S.relic = relic;
  const chosen = picks.map(t => prof.find(h => h.type === t)); const ref = avgRef(chosen);
  const heroes = [...chosen], team = chosen.map(() => 0), hpos = COOPPOS(0, chosen.length);
  for (const t of [1, 2]) { for (const ty of shuffle(HORDER).slice(0, 3)) { heroes.push(makeBot(ty, ref)); team.push(t); } hpos.push(...COOPPOS(t, 3)); }
  heroes.forEach(h => { h.cd = 0.6; h.sk = [1.5, 3]; h.mp = maxMP(h); h.anim = 0; h.healT = 0; });
  Object.assign(S, { heroes, team, hpos, wave: Math.max(1, SPPROG.wave + MPOFF), hp: 100, alive: [true, true, true], score: [0, 0, 0], tmode: ['lane', 'lane', 'lane'], supT: [0, 0, 0],
    bot: { 1: { ov: null, ovT: 0, last: -9 }, 2: { ov: null, ovT: 0, last: -9 } }, binv: { 1: { f: 0 }, 2: { f: 0 } }, chat: [], chatQ: [], aiT: 1, phase: 'break', breakT: 5,
    mpStart: { lv: chosen.map(h => h.lv), inv: { ...inv }, wave: 0 }, loot: [0, 0, 0], hpw: {} });
  S.mpStart.wave = S.wave; MODE = 'coop'; setMap(3);
  sysChat('Liên minh 3 đội! Tầm bắn liên minh được mở rộng, EXP chia đều cho mọi anh hùng — đội nào hạ quái thì nhặt đồ. Thánh Vật bắn Hỏa pháo, hấp thu linh hồn quái để lên cấp và hồi 10% mỗi đợt.', '#ffe08a');
  botSay(1, 'start', {}, true, 1.2); botSay(2, 'start', {}, true, 2.6);
  beginRun(true);
}
function coopEnd() { S.over = true; S.running = false; closePanel(); closeForge(); closeMp(); saveGame(true);
  const order = [0, 1, 2].sort((a, b) => S.score[b] - S.score[a]);
  const rows = order.map((t, k) => `<div class="mprow" style="--c:${TEAMS[t].col}"><span><b style="color:${TEAMS[t].col}">${k === 0 ? '👑 MVP · ' : '#' + (k + 1) + ' '}${TEAMS[t].name}</b>${t === 0 ? ' (bạn)' : ''}</span><span>${S.score[t]} quái · ${S.loot[t]} đồ</span></div>`).join('');
  const chosen = S.heroes.filter((h, i) => teamOf(i) === 0); const lv = chosen.map((h, j) => `${hname(h)}: Lv ${S.mpStart.lv[j]} → <b>${h.lv}</b>`).join('<br>');
  const gain = IKEYS.map(k => [k, S.inv[k] - (S.mpStart.inv[k] || 0)]).filter(x => x[1] > 0).map(([k, n]) => `<span style="color:${ITEMS[k].col}">${ITEMS[k].name} +${n}</span>`).join(' · ') || '—';
  $('mpEndTxt').innerHTML = `Liên minh trụ được <b>${S.wave - S.mpStart.wave + 1} đợt</b> (đợt ${S.mpStart.wave}→${S.wave})<div class="sec">Bảng đóng góp</div>${rows}<div class="sec">Thu hoạch của bạn (đã lưu)</div><p style="font-size:12px;margin:2px 0">${lv}</p><p style="font-size:11.5px;margin:4px 0">${gain}</p>`;
  setTimeout(() => $('mpEndOv').classList.remove('hide'), 900); }

// ---------- alliance relic: fire cannon, soul absorption, levels ----------
const RLMAX = 99;
function rneed(lv) { return Math.round(300 * Math.pow(lv, 1.6)); }
function teamPower() { let p = 0; S.heroes.forEach(h => { const st = hstats(h); p += st.dmg * avgMult(h) / st.rate; }); return p; }
function relicDmg() { const RL = S.relic || { lv: 1 }; return 0.02 * teamPower() * (1 + 0.1 * (RL.lv - 1)); }
const relicTip3 = () => V(SH.x, SH.y, 2.6);
function relicAbsorb(e, xp) { const RL = S.relic; if (!RL) return;
  if (Math.random() < 0.6) { const p = V(e.x, e.y, eh(e)), tp = relicTip3(); const v = tp.clone().sub(p).multiplyScalar(1 / 0.8); emit(p.x, p.y, p.z, v.x, v.y + 1.2, v.z, Math.random() < 0.5 ? '#9ff4ff' : '#ffd27a', 0.12, 0.8, -3, 1); }
  if (RL.lv >= RLMAX) return; RL.exp += xp * 0.25; let up = false; while (RL.lv < RLMAX && RL.exp >= rneed(RL.lv)) { RL.exp -= rneed(RL.lv); RL.lv++; up = true; }
  if (up) { addText(SH.x, SH.y, 'THÁNH VẬT LÊN CẤP ' + RL.lv + '!', '#ffb040', 15, { life: 2, glow: true }, 3.2); burst(SH.x, SH.y, '#ffc060', 24, 160, 5, 2.6); if (RL.lv % 5 === 0) sysChat('🔥 Thánh Vật Liên Minh đạt cấp ' + RL.lv + ' — Hỏa pháo mạnh hơn!', '#ffb070'); } }
function relicPick() { let best = null, bs = -1; const al = S.en.filter(e => !e.dead && e.x > 0); if (!al.length) return null; const smp = al.length > 30 ? al.filter((e, i) => i % Math.ceil(al.length / 30) === 0) : al;
  for (const e of smp) { let n = 0; for (const o of al) if (Math.abs(o.x - e.x) < 70 && Math.abs(o.y - e.y) < 70) n++; const sc = n + (ET[e.t].boss ? 3 : 0) + e.d / LANES[e.lane].len; if (sc > bs) { bs = sc; best = e; } } return best; }
const fireballGeo = new THREE.SphereGeometry(0.16, 12, 8);
function relicUpdate(dt) { S.rfb = S.rfb || []; S.rlQ = S.rlQ || [];
  S.rlT = (S.rlT === undefined ? 1 : S.rlT) - dt; if (S.rlT <= 0 && S.en.some(e => !e.dead && e.x > 0)) { S.rlT = 1.0; const dm = relicDmg(); for (let k = 0; k < 3; k++) S.rlQ.push({ t: k * 0.16, dm }); }
  for (const q of S.rlQ) { q.t -= dt; if (q.t <= 0 && !q.done) { q.done = true; const tg = relicPick(); if (tg) { const tx = tg.x + (Math.random() - 0.5) * 24, ty = tg.y + (Math.random() - 0.5) * 18; const m = new THREE.Mesh(fireballGeo, glowMat(0xffa040, 3)); scene.add(m);
        S.rfb.push({ tx, ty, tg, t: 0, d: Math.max(0.35, Math.min(0.85, Math.hypot(tx - SH.x, ty - SH.y) / 520)), dm: q.dm, m }); burst(SH.x, SH.y, '#ffb040', 6, 90, 4, 2.6); } } }
  S.rlQ = S.rlQ.filter(q => !q.done);
  const from = relicTip3();
  for (const f of S.rfb) { f.t += dt; if (f.tg && !f.tg.dead) { f.tx += (f.tg.x - f.tx) * 0.08; f.ty += (f.tg.y - f.ty) * 0.08; } const k = Math.min(1, f.t / f.d);
    const to = V(f.tx, f.ty, 0.3); f.m.position.copy(from).lerp(to, k); f.m.position.y += Math.sin(k * Math.PI) * 1.6;
    if (Math.random() < 0.8) emit(f.m.position.x, f.m.position.y, f.m.position.z, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, Math.random() < 0.5 ? '#ff7a1a' : '#ffd060', 0.2, 0.35, 0, 0.95);
    if (k >= 1 && !f.done) { f.done = true; scene.remove(f.m); const rr_ = 62 + Math.min(30, (S.relic.lv - 1) * 0.6);
      for (const o of S.en) if (!o.dead && Math.hypot(o.x - f.tx, o.y - f.ty) < rr_) { let hi = o.lh; if (hi === undefined) { const tm = (S.rlRot = ((S.rlRot || 0) + 1) % 3); hi = S.heroes.findIndex((h, q) => teamOf(q) === tm); } damage(o, f.dm, hi, 'r', true, 0, 1); }
      burst(f.tx, f.ty, '#ff8a2a', 18, 170, 6, 0.3); burst(f.tx, f.ty, '#ffe08a', 8, 110, 4, 0.3); ring(f.tx, f.ty, 6, rr_, '#ff9a3a', 0.45); S.shake = Math.max(S.shake, 0.08); } }
  S.rfb = S.rfb.filter(f => !f.done); }
