
// =====================================================================
// GAME RULES — ported from "Huyền Thoại Vực Biển II" (single-player), same formulas
// =====================================================================
function mapFor(w) { return Math.floor((w - 1) / 10) % 3; }
const BOSSES = ['kraken', 'shark', 'serpent', 'jqueen', 'turtle'];
function bossFor(w) { return BOSSES[(Math.floor(w / 5) - 1) % 5]; }
const UT = {
  thunder: { name: 'Lôi Thánh Kỵ', skill: 'Sét lan sang quái gần', dmg: 10, rate: 1.2, range: 200, chain: 2, col: '#b98cff', icon: '⚡' },
  fire: { name: 'Hỏa Kiếm Sĩ', skill: 'Sóng lửa gây bỏng', dmg: 14, rate: 0.95, range: 195, proj: 'flame', ps: 460, burn: 0.35, col: '#ff7a1a', icon: '🔥' },
  ice: { name: 'Băng Pháp Sư', skill: 'Băng tiễn làm chậm', dmg: 8, rate: 1.0, range: 205, proj: 'shard', ps: 430, slow: 0.45, slowT: 1.6, col: '#6fe8ff', icon: '❄' },
  elf: { name: 'Lục Cung Thủ', skill: 'Chí mạng gốc 20%', dmg: 5, rate: 0.34, range: 215, proj: 'arrow', ps: 640, crit: 0.2, col: '#7dff9a', icon: '🏹' },
  holy: { name: 'Thánh Quang Tư Tế', skill: 'Thánh quang nổ lan', dmg: 11, rate: 1.35, range: 205, proj: 'holy', ps: 380, splash: 58, col: '#ffd85a', icon: '✦' }
};
const HORDER = ['thunder', 'fire', 'ice', 'elf', 'holy'];
const HPOS = [{ x: 270, y: 452 }, { x: 204, y: 500 }, { x: 336, y: 500 }, { x: 230, y: 570 }, { x: 310, y: 570 }];
const WINGM = [1, 1.3, 1.5, 1.8, 2.2, 2.5], WCOST = [3, 5, 8, 12, 18], WNAME = ['Chưa có', 'Cánh Thần I', 'Cánh Thần II', 'Cánh Thần III', 'Cánh Thần IV', 'Cánh Thần V'], WMAX = 5;
const BASE = { crit: 0.05, perf: 0.03, dbl: 0.01, tri: 0, ult: 0 }, MAXLV = 99, MAXLV2 = 200;
const TITLE2 = { thunder: 'Lôi Đế Thiên Kỵ', fire: 'Hỏa Kiếm Thánh', ice: 'Băng Hoàng Pháp Tôn', elf: 'Tinh Linh Thần Tiễn', holy: 'Thánh Quang Giáo Hoàng' };
function lvCap(h) { return h.evo ? MAXLV2 : MAXLV; }
function hname(h) { return h.evo ? TITLE2[h.type] : UT[h.type].name; }
function canEvolve(h) { return !h.evo && h.lv >= MAXLV; }
const STONES = { c: { inc: 0.05, cap: 0.6, stat: 'crit', mult: 1.5 }, p: { inc: 0.05, cap: 0.4, stat: 'perf', mult: 2 }, d: { inc: 0.02, cap: 0.25, stat: 'dbl', mult: 2 }, t: { inc: 0.01, cap: 0.15, stat: 'tri', mult: 3 }, x: { inc: 0.005, cap: 0.08, stat: 'ult', mult: 10 } };
const SK = ['c', 'p', 'd', 't', 'x'], TIERS = ['c', 'p', 'd', 't', 'x'];
const DMGC = { r: '#ff9a3a', n: '#e0b07a', c: '#3aa0ff', p: '#3cff6a', d: '#c060ff', t: '#ff3a3a', x: '#ffd23a' };
const ITEMS = {
  c: { name: 'Linh Thạch Sơ Cấp', col: '#4aa8ff', rate: 0.30, desc: '+5% chí mạng' },
  p: { name: 'Linh Thạch Cao Cấp', col: '#4cff6a', rate: 0.20, desc: '+5% hoàn hảo' },
  d: { name: 'Linh Thạch Huyền Bí', col: '#c06aff', rate: 0.20, desc: '+2% nhân đôi' },
  t: { name: 'Linh Thạch Tối Thượng', col: '#ff4a4a', rate: 0.01, desc: '+1% nhân ba' },
  x: { name: 'Linh Thạch Thần Thánh', col: '#ffd23a', rate: 0.001, desc: '+0.5% thần phạt ×10' },
  jb: { name: 'Ngọc Ban Phước', col: '#fff1b8', rate: 0.20, desc: '+0.1% sát thương mỗi viên' },
  js: { name: 'Ngọc Linh Hồn', col: '#ff8ad8', rate: 0.20, desc: '+0.2% sát thương mỗi viên' },
  pd: { name: 'Dây Chuyền Thần Linh', col: '#ffb347', rate: 0.05, desc: '+1 cấp: +1% tấn công, hồi Mana khi hạ quái' },
  rg: { name: 'Nhẫn Uy Danh', col: '#7fffd4', rate: 0.05, desc: '+1 cấp: +1% tầm đánh' },
  f: { name: 'Lông Vũ Thần', col: '#ffd85a', rate: 0.20, desc: 'Nguyên liệu chế cánh' },
  sc: { name: 'Pha Lê Tĩnh Lặng', col: '#e6dcff', rate: 0.001, desc: '+10% sức mạnh, +20 tấn công, +5% tốc đánh, +2% phép' }
};
const IKEYS = ['c', 'p', 'd', 't', 'x', 'f', 'jb', 'js', 'pd', 'rg', 'sc'];
const ACCMAX = 30, SKC = [30, 55];
function maxMP(h) { return 100 + 2 * h.lv; }
function pendRec(L) { return L > 0 ? 0.01 + 0.005 * (L - 1) / 29 : 0; }
const ET = {
  angler: { name: 'Cá Lồng Đèn', hp: 34, sp: 36, dmg: 5, exp: 10, hov: 16, cy: 0, sc: 0.78, gib: '#ffb070' },
  eel: { name: 'Lươn Lôi', hp: 20, sp: 70, dmg: 4, exp: 8, hov: 12, cy: 0, sc: 0.8, gib: '#ffe14a' },
  jelly: { name: 'Sứa U Linh', hp: 26, sp: 46, dmg: 4, exp: 10, hov: 28, cy: -4, sc: 0.75, gib: '#d8a8ff' },
  crab: { name: 'Cua Giáp Đá', hp: 140, sp: 24, dmg: 15, exp: 40, hov: 6, cy: -6, sc: 0.78, gib: '#ff8a50', label: true },
  kraken: { name: 'Thủy Quái Kraken', hp: 1100, sp: 18, dmg: 34, exp: 300, hov: 10, cy: -26, sc: 0.8, gib: '#ff6ab0', boss: true },
  shark: { name: 'Cá Mập U Linh', hp: 1300, sp: 22, dmg: 34, exp: 350, hov: 16, cy: -2, sc: 0.82, gib: '#bff4ff', boss: true },
  serpent: { name: 'Hải Long Xà', hp: 1500, sp: 20, dmg: 34, exp: 420, hov: 14, cy: 0, sc: 0.82, gib: '#5ad0a0', boss: true },
  jqueen: { name: 'Sứa Mẫu Hậu', hp: 1700, sp: 20, dmg: 34, exp: 500, hov: 34, cy: -14, sc: 0.85, gib: '#e0a8ff', boss: true },
  turtle: { name: 'Cự Quy Dung Nham', hp: 2000, sp: 15, dmg: 34, exp: 600, hov: 6, cy: -6, sc: 0.82, gib: '#ff8a3a', boss: true }
};
function hpMult(w) { return (1 + 0.4 * (w - 1) + 0.02 * (w - 1) * (w - 1)) * Math.pow(1.06, w - 1); }
function buildWave(w) { const list = []; const n = 7 + w * 2; for (let i = 0; i < n; i++) { let t = 'angler'; const r = Math.random(); if (w >= 2 && r < 0.26) t = 'eel'; else if (w >= 3 && r < 0.44) t = 'jelly'; else if (w >= 4 && r > 0.84) t = 'crab'; list.push(t); } if (w % 5 === 0) list.push(bossFor(w)); return list; }
function need(lv) { return Math.round(20 * Math.pow(lv, 1.45)); }
function hstats(h) { const T = UT[h.type], n = h.sc || 0, ev = h.evo ? 1 : 0; return { dmg: (T.dmg * (1 + 0.08 * (h.lv - 1)) * (1 + 0.06 * h.str) * WINGM[h.wing] * (1 + 0.001 * (h.jb || 0) + 0.002 * (h.js || 0)) * (1 + 0.01 * (h.pend || 0))) * (1 + 0.1 * n) * (ev ? 1.3 : 1) + 20 * n, rate: Math.max(T.rate * 0.3, T.rate / (1 + 0.03 * h.agi)) / ((1 + 0.05 * n) * (ev ? 1.1 : 1)), range: Math.round((T.range + Math.min(40, Math.floor(h.lv * 0.8)) + (ev ? 10 : 0)) * (1 + 0.01 * (h.ring || 0))), sk: (1 + 0.02 * n) * (ev ? 1.2 : 1) }; }
function skStats(h) { const s = hstats(h); s.dmg *= s.sk; return s; }
function rates(h) { const T = UT[h.type], o = {}; for (const k of SK) { const st = STONES[k]; const base = st.stat === 'crit' ? (T.crit || BASE.crit) : BASE[st.stat]; o[st.stat] = Math.min(st.cap, base + st.inc * (h.st[k] || 0)); } return o; }
function canStone(h, k) { const st = STONES[k]; return rates(h)[st.stat] < st.cap - 1e-9; }
function avgMult(h) { const r = rates(h); let m = 1; for (const k of SK) { const st = STONES[k]; m *= 1 + r[st.stat] * (st.mult - 1); } return m; }

let S, best = 0; try { best = +localStorage.getItem('htvb3d_best') || 0; } catch (e) { }
function newHero(t) { return { type: t, evo: 0, sc: 0, lv: 1, exp: 0, pts: 0, str: 0, agi: 0, st: { c: 0, p: 0, d: 0, t: 0, x: 0 }, wing: 0, cd: 0.6, anim: 0, emit: 0, sk: [1.5, 3], healT: 0, jb: 0, js: 0, pend: 0, ring: 0, mp: 100 }; }
function newState() { return { running: false, paused: false, over: false, auto: false, wave: 1, phase: 'break', breakT: 15, queue: [], spawnT: 0, waveTotal: 1, waveDone: 0, hp: 100, speed: 1, hpos: HPOS,
  heroes: HORDER.map(newHero), inv: { c: 0, p: 0, d: 0, t: 0, x: 0, f: 0, jb: 0, js: 0, pd: 0, rg: 0, sc: 0 }, en: [], pr: [], sk: [], drops: [], sel: -1, shake: 0, time: 0, autoT: 0, shrineHit: 0 }; }
S = newState();

function log(t, col) { const d = document.createElement('div'); d.textContent = t; d.style.color = col || '#e9dfc6'; const L = $('log'); L.appendChild(d); while (L.children.length > 4) L.firstChild.remove(); setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 600); }, 4500); }
let bannerT = 0; function banner(txt, col) { const b = $('banner'); b.textContent = txt; b.style.color = col === 'red' ? '#ff6a6a' : '#ffd86a'; b.classList.add('show'); bannerT = 2.4; }
function heroAt(i) { return S.hpos[i]; }
function aimY(e) { const b = ET[e.t]; return e.y - b.hov + b.cy * b.sc; }
function heroText(i, s, col, size, o, h = 1.9) { const P = S.hpos[i]; addText(P.x, P.y, s, col, size, o, h); }

function spawnEnemy(t) { const b = ET[t], hp = b.hp * hpMult(S.wave); const e = { t, hp, max: hp, d: 0, sp: b.sp * (1 + 0.012 * Math.min(S.wave, 30)), slowT: 0, slow: 0, burnT: 0, burnD: 0, burnSrc: 1, seed: Math.random() * 10, ox: (Math.random() - 0.5) * 14, oy: (Math.random() - 0.5) * 10, hitT: 0, dead: false, x: 0, y: 0 };
  const p = posAt(0); e.x = p.x + e.ox; e.y = p.y + e.oy; S.en.push(e); spawnMob3(e); }
function startWave() { S.queue = buildWave(S.wave); S.waveTotal = S.queue.length; S.waveDone = 0; S.spawnT = 0.2; S.phase = 'fight'; const bs = S.queue.find(q => ET[q].boss); banner(bs ? 'BOSS: ' + ET[bs].name.toUpperCase() : 'ĐỢT ' + S.wave, bs ? 'red' : 'gold'); }
function addExp(i, amt) { const h = S.heroes[i]; if (h.lv >= lvCap(h)) { if (canEvolve(h) && S.auto) evolve(i); return; } h.exp += amt; let up = false; while (h.lv < lvCap(h) && h.exp >= need(h.lv)) { h.exp -= need(h.lv); h.lv++; h.pts += 3; up = true; }
  if (up) { const P = S.hpos[i]; pillar(P.x, P.y, '#ffe08a', 0.9, 0.7); ring(P.x, P.y, 6, 44, '#ffe08a', 0.6); burst(P.x, P.y, '#ffe9a0', 14, 110, 4, 0.9); heroText(i, 'LÊN CẤP ' + h.lv + '!', '#ffe066', 16, { life: 1.4 });
    if (canEvolve(h)) { if (S.auto) evolve(i); else { heroText(i, 'Có thể TIẾN HÓA!', '#ffe08a', 14, { life: 2.2, glow: true }, 2.4); log(UT[h.type].name + ' đạt cấp 99 — chạm vào để Tiến hóa!', '#ffe08a'); } } } }
function evolve(i) { const h = S.heroes[i]; if (!canEvolve(h)) return false; h.evo = 1; h.pts += 10; h.exp = 0; const P = S.hpos[i], T = UT[h.type];
  pillar(P.x, P.y, '#ffe08a', 1.8, 1.2); pillar(P.x, P.y, T.col, 1.3, 0.8); ring(P.x, P.y, 6, 96, '#ffe08a', 0.9); ring(P.x, P.y, 6, 64, T.col, 0.7); burst(P.x, P.y, '#fff0b0', 42, 210, 6, 1); burst(P.x, P.y, T.col, 26, 170, 5, 1); S.shake = Math.max(S.shake, 0.3);
  heroText(i, 'TIẾN HÓA!', '#ffe066', 20, { life: 2.2, glow: true, big: true }, 2.4); banner('TIẾN HÓA: ' + TITLE2[h.type].toUpperCase(), 'gold'); log(T.name + ' tiến hóa thành ' + TITLE2[h.type] + ' — giới hạn cấp 200!', '#ffe08a'); return true; }
function useSilence(i, all) { const h = S.heroes[i]; let n = 0; while (S.inv.sc > 0 && (all || n < 1)) { S.inv.sc--; h.sc = (h.sc || 0) + 1; n++; } if (n) { const P = S.hpos[i]; pillar(P.x, P.y, '#e6dcff', 1.2); ring(P.x, P.y, 6, 60, '#e6dcff', 0.7); burst(P.x, P.y, '#f4f0ff', 22, 150, 5, 0.9); heroText(i, 'Tĩnh Lặng ×' + h.sc + '!', '#e6dcff', 15, { life: 1.6, glow: true }); log(UT[h.type].name + ' hấp thụ Pha Lê Tĩnh Lặng (tổng ' + h.sc + ')', '#e6dcff'); } return n; }
function roll(hi) { const r = rates(S.heroes[hi]); let m = 1, ty = 'n', L = 0; for (const k of TIERS) { const st = STONES[k]; if (Math.random() < r[st.stat]) { m *= st.mult; ty = k; L++; } } return { m, ty, L }; }
function strike(e, base, hi, el) { if (e.dead) return; const h = S.heroes[hi]; let b = base * vuln(e, el || BASEL[h.type]); if (e.wetT > 0 && hasSk(h, 1)) { if (h.type === 'thunder') b *= 1.3; else if (h.type === 'elf') b *= 1.25; } const r = roll(hi); damage(e, b * r.m, hi, r.ty, true, r.L, r.m); }
function fmtN(n) { n = Math.max(1, Math.round(n)); return n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1) + 'K' : String(n); }
function damage(e, amt, hi, ty, show, L, m) {
  if (e.dead) return; e.hp -= amt; L = L || 0;
  if (show !== false) { e.hitT = 0.1; const sz = { n: 13, c: 16, p: 17, d: 18, t: 20, x: 23, r: 14 }[ty] + Math.max(0, L - 1) * 3; const glow = ty === 'x' || L >= 3; const x = e.x + (Math.random() - 0.5) * 16;
    addText(x, e.y, fmtN(amt), DMGC[ty], sz, ty !== 'n' ? { life: 1.05 + L * 0.15, glow } : null, eh(e) + 0.5);
    if (L >= 2) { const mm = Math.round(m * 10) / 10; addText(x, e.y, (L >= 3 ? 'SIÊU ĐÒN ' : '') + '×' + mm + (L >= 3 ? ' · ' + L + ' TẦNG' : ''), DMGC[ty], L >= 3 ? 12 : 11, { life: 1.2 + L * 0.15, glow }, eh(e) + 0.85); }
    if (L >= 4) { S.shake = Math.max(S.shake, 0.15); burst(e.x, e.y, DMGC[ty], 16, 150, 5, eh(e)); ring(e.x, e.y, 4, 50, DMGC[ty], 0.4); } }
  if (e.hp <= 0) kill(e, hi);
}
function kill(e, hi) { e.dead = true; S.waveDone++; const b = ET[e.t], big = !!b.boss;
  if (e.frzT > 0) { const ii = S.heroes.findIndex(h => h.type === 'ice'), ih = S.heroes[ii]; if (ih && hasSk(ih, 1)) { const dm = hstats(ih).dmg * 1.5; burst(e.x, e.y, '#e8fcff', 16, 150, 4, eh(e)); ring(e.x, e.y, 4, 55, '#9ff0ff', 0.4); for (const o of S.en) if (!o.dead && Math.hypot(o.x - e.x, o.y - e.y) < 56) strike(o, dm, ii, 'ice'); } }
  burst(e.x, e.y, b.gib, big ? 40 : 12, big ? 170 : 90, big ? 7 : 4, eh(e)); ring(e.x, e.y, 4, big ? 90 : 30, b.gib, 0.4); if (big) S.shake = 0.4;
  removeMob3(e, true);
  const xp = b.exp * (1 + 0.15 * (S.wave - 1)); S.heroes.forEach((h, i) => addExp(i, i === hi ? xp : xp * 0.4));
  for (const h of S.heroes) if (h.pend > 0) h.mp = Math.min(maxMP(h), h.mp + maxMP(h) * pendRec(h.pend));
  if (e.t === 'crab' || big) addText(e.x, e.y, '+' + Math.round(xp) + ' EXP', '#9fe8ff', 13, null, eh(e) + 1.2);
  const mult = e.t === 'crab' ? 1.5 : 1; const drops = [];
  for (const k of IKEYS) if (Math.random() < Math.min(0.95, ITEMS[k].rate * mult)) drops.push(k);
  if (big) { drops.push('f', 'f', 'f', 'c', 'c', 'c', 'p', 'p', 'd', 'd', 'jb', 'jb', 'js', 'pd', 'rg'); if (Math.random() < 0.35) drops.push('t'); if (Math.random() < 0.08) drops.push('x'); }
  drops.forEach((k, j) => dropItem(k, e.x + (j - (drops.length - 1) / 2) * 16, e.y));
}
function dropItem(k, x, y) { if (k === 'sc') { pillar(x, y, '#e6dcff', 2, 1.2); ring(x, y, 6, 70, '#e6dcff', 0.9); addText(x, y, '✦ PHA LÊ TĨNH LẶNG ✦', '#f0eaff', 15, { life: 2.6, glow: true }, 2); S.shake = Math.max(S.shake, 0.2); log('✦ Pha Lê Tĩnh Lặng rơi ra — cực hiếm!', '#e6dcff'); }
  const d = { k, x: clamp(x + (Math.random() - 0.5) * 10, 14, W - 14), y, z: 0.05, vz: 2.2 + Math.random() * 0.8, state: 'ground', t: 0 }; S.drops.push(d); spawnDrop3(d); }
function collect(d) { if (d.state !== 'ground') return; d.state = 'fly'; d.t = 0; }
const BASEL = { thunder: 'thunder', fire: 'fire', ice: 'ice', elf: 'water', holy: 'holy' };
function hitProj(p) {
  const e = p.tgt;
  if (p.type === 'holy') { const hh = S.heroes[p.hi]; for (const o of S.en) { if (!o.dead && Math.hypot(o.x - p.x, aimY(o) - p.y) <= p.splash) { if (hasSk(hh, 1) && Math.random() < 0.1) burnE(o, p.dmg * 0.3, p.hi); strike(o, p.dmg, p.hi); } } burst(p.tx0, p.ty0, '#ffe680', 14, 120, 5, p.h); ring(p.tx0, p.ty0, 4, p.splash, '#ffd85a', 0.35); return; }
  if (!e || e.dead) { burst(p.x, p.y, p.col, 4, 50, 3, p.h); return; }
  const hh = S.heroes[p.hi];
  if (p.type === 'flame') { burnE(e, p.dmg * UT.fire.burn, p.hi); strike(e, p.dmg, p.hi); burst(e.x, e.y, '#ff7a1a', 9, 110, 5, eh(e)); ring(e.x, e.y, 3, 22, '#ff9a3a', 0.25, 0, eh(e) * 0.3);
    if (hasSk(hh, 1) && Math.random() < 0.12) { burst(e.x, e.y, '#ffd060', 16, 160, 5, eh(e)); ring(e.x, e.y, 4, 46, '#ff9a3a', 0.35); for (const o of S.en) if (!o.dead && o !== e && Math.hypot(o.x - p.x, aimY(o) - p.y) < 46) strike(o, p.dmg * 0.6, p.hi, 'fire'); } }
  else if (p.type === 'shard') { e.slowT = UT.ice.slowT; e.slow = ET[e.t].boss ? UT.ice.slow * 0.5 : UT.ice.slow; if (hasSk(hh, 0)) freeze(e, 1.2, 0.10); strike(e, p.dmg, p.hi); burst(e.x, e.y, '#bff6ff', 8, 90, 3.5, eh(e)); }
  else { if (hasSk(hh, 0) && Math.random() < 0.25) setWet(e, 3); strike(e, p.dmg, p.hi); burst(e.x, e.y, '#9dd8ff', 5, 70, 3, eh(e)); }
}
function chainHit(i, tg, st) {
  const h = S.heroes[i], T = UT.thunder; const list = [tg]; const n = T.chain + Math.floor(h.lv / 15);
  for (let j = 0; j < n; j++) { const l = list[list.length - 1]; let bst = null, bd = 110; for (const e of S.en) { if (e.dead || list.includes(e)) continue; const d = Math.hypot(e.x - l.x, e.y - l.y); if (d < bd) { bd = d; bst = e; } } if (!bst) break; list.push(bst); }
  const pts = [heroTip3(i)]; list.forEach((e, j) => { pts.push(V(e.x, e.y, eh(e))); if (hasSk(h, 0) && Math.random() < 0.15) shock(e, 2); strike(e, st.dmg * Math.pow(0.72, j), i); burst(e.x, e.y, '#d8bcff', 5, 80, 3.5, eh(e)); });
  bolt(pts, '#b98cff', 0.2);
}
function spendPt(h, which) { if (h.pts <= 0) return false; h.pts--; if (which === 'str') h.str++; else h.agi++; return true; }
function autoPts(h) { while (h.pts > 0) spendPt(h, (h.str + h.agi) % 3 === 2 ? 'agi' : 'str'); }
function useStone(i, k) { const h = S.heroes[i]; if (S.inv[k] <= 0 || !canStone(h, k)) return false; S.inv[k]--; h.st[k]++; const P = S.hpos[i]; ring(P.x, P.y, 6, 36, ITEMS[k].col, 0.5); burst(P.x, P.y, ITEMS[k].col, 10, 90, 4, 0.9); heroText(i, ITEMS[k].desc, ITEMS[k].col, 13, { life: 1.2 }); return true; }
function craftWing(i) { const h = S.heroes[i]; if (h.wing >= WMAX || S.inv.f < WCOST[h.wing]) return false; S.inv.f -= WCOST[h.wing]; h.wing++; const P = S.hpos[i];
  pillar(P.x, P.y, '#ffd85a', 1.1); ring(P.x, P.y, 6, 56, '#ffd85a', 0.7); burst(P.x, P.y, '#fff0b0', 22, 150, 5, 1); heroText(i, WNAME[h.wing] + '!', '#ffd85a', 16, { life: 1.6 }); log(UT[h.type].name + ' nhận ' + WNAME[h.wing] + ' (+' + Math.round((WINGM[h.wing] - 1) * 100) + '% ST)', '#ffd85a'); return true; }
function autoManage() { S.heroes.forEach(h => autoPts(h)); }
function itemsUsable(h) { return canEvolve(h) || S.inv.sc > 0 || (h.wing < WMAX && S.inv.f >= WCOST[h.wing]) || SK.some(k => S.inv[k] > 0 && canStone(h, k)) || (S.inv.pd > 0 && h.pend < ACCMAX) || (S.inv.rg > 0 && h.ring < ACCMAX); }
function upgradable(h) { return h.pts > 0 || itemsUsable(h); }
function useJewel(i, k, all) { const h = S.heroes[i]; let n = 0; while (S.inv[k] > 0 && (all || n < 1)) { S.inv[k]--; h[k] = (h[k] || 0) + 1; n++; } if (n) { const P = S.hpos[i]; ring(P.x, P.y, 6, 36, ITEMS[k].col, 0.5); burst(P.x, P.y, ITEMS[k].col, 8 + Math.min(20, n), 90, 4, 0.9); heroText(i, '+' + (Math.round(n * (k === 'jb' ? 0.1 : 0.2) * 10) / 10) + '% ST', ITEMS[k].col, 13, { life: 1.2 }); } return n; }
function upgradeAcc(i, k, all) { const h = S.heroes[i], f = k === 'pd' ? 'pend' : 'ring'; let n = 0; while (S.inv[k] > 0 && h[f] < ACCMAX && (all || n < 1)) { S.inv[k]--; h[f]++; n++; } if (n) { const P = S.hpos[i]; pillar(P.x, P.y, ITEMS[k].col, 0.7); ring(P.x, P.y, 6, 44, ITEMS[k].col, 0.5); heroText(i, ITEMS[k].name + ' +' + h[f], ITEMS[k].col, 13, { life: 1.4 }); } return n; }
const FORGE = [['c', 'p'], ['p', 'd'], ['d', 't'], ['t', 'x']];
function forgeOne(from, to, quiet) { if (S.inv[from] < 3) return false; S.inv[from] -= 3; S.inv[to]++; pulseInv(to); if (!quiet) log('Cường hóa: 3 ' + ITEMS[from].name.replace('Linh Thạch ', '') + ' → 1 ' + ITEMS[to].name, ITEMS[to].col); return true; }
function forgeAll(from, to) { let n = 0; while (forgeOne(from, to, true)) n++; if (n) log('Cường hóa: ' + n + ' ' + ITEMS[to].name, ITEMS[to].col); return n; }
function featherUsed(h) { let n = 0; for (let i = 0; i < h.wing; i++) n += WCOST[i]; return n; }
function pickTarget(i, P, range) { let best = null, bs = -1e9; for (const e of S.en) { if (e.dead) continue; if (Math.hypot(e.x - P.x, e.y - (P.y - 20)) > range) continue; const sc = e.d / PATH_LEN; if (sc > bs) { bs = sc; best = e; } } return best; }
function gameOver() { S.over = true; S.running = false; if (S.wave > best) { best = S.wave; try { localStorage.setItem('htvb3d_best', best); } catch (e) { } } closePanel(); closeForge();
  setTimeout(() => { $('overTxt').innerHTML = `Bạn đã trụ tới <b>đợt ${S.wave}</b>.<br>Kỷ lục: đợt ${best}` + (SAVE ? `<br>Bản lưu gần nhất: đợt ${SAVE.wave}` : ''); $('loadBtn').classList.toggle('hide', !SAVE); $('overOv').classList.remove('hide'); }, 800); }

// ---------- skills & elements ----------
const ELC = { ice: '#7fe8ff', thunder: '#c8a8ff', fire: '#ff7a2a', water: '#3ab0ff', holy: '#ffd85a' };
const ELN = { ice: 'Băng', thunder: 'Sét', fire: 'Lửa', water: 'Nước' };
const ELI = { ice: '❄', thunder: '⚡', fire: '🔥', water: '💧' };
const SKILLS = {
  thunder: [{ name: 'Lôi Phạt Thiên Giáng', el: ['thunder'], lv: 3, cd: 8, act: '5 tia sét giáng xuống vùng quái đông nhất, mỗi tia 180% ST, gây Tê liệt.', pas: 'Đòn thường 15% gây Tê liệt.' },
    { name: 'Bão Sấm Tụ Thủy', el: ['thunder', 'water'], lv: 10, cd: 14, act: 'Mây bão 4 giây: làm Ướt mọi quái trong vùng, liên tục giáng sét 120% ST.', pas: '+30% sát thương lên mục tiêu Ướt.' }],
  fire: [{ name: 'Hỏa Long Trảm', el: ['fire'], lv: 3, cd: 7, act: 'Sóng lửa khổng lồ xuyên thẳng hàng, 250% ST, Thiêu đốt.', pas: 'Mọi đòn đánh đều Thiêu đốt mục tiêu.' },
    { name: 'Thiên Hỏa Lưu Tinh', el: ['fire'], lv: 10, cd: 13, act: 'Thiên thạch rơi nổ 500% ST diện rộng, để lại biển lửa 3 giây.', pas: '12% đòn thường phát nổ lan 60% ST.' }],
  ice: [{ name: 'Băng Phong Bạo', el: ['ice'], lv: 3, cd: 10, act: 'Bão tuyết 3 giây: 50% ST mỗi nhịp, làm chậm, 12% Đóng băng mỗi nhịp.', pas: 'Đòn thường 10% Đóng băng 1.2 giây.' },
    { name: 'Vạn Băng Trụ', el: ['ice'], lv: 10, cd: 12, act: 'Trụ băng trồi lên dưới tối đa 8 quái: 300% ST, Đóng băng 1.6 giây.', pas: 'Quái đang bị đóng băng khi chết sẽ vỡ vụn, gây 150% ST lan xung quanh.' }],
  elf: [{ name: 'Thủy Tiễn Vũ', el: ['water'], lv: 3, cd: 8, act: 'Mưa 14 mũi tên nước, mỗi mũi 90% ST, làm Ướt.', pas: 'Đòn thường 25% làm Ướt.' },
    { name: 'Phá Lãng Tiễn', el: ['water'], lv: 10, cd: 11, act: 'Mũi tên sóng xuyên thẳng hàng: 350% ST, đẩy lùi, làm Ướt.', pas: '+25% sát thương lên mục tiêu Ướt.' }],
  holy: [{ name: 'Thánh Thủy Triều', el: ['water'], lv: 3, cd: 12, act: 'Vòng thủy triều lan rộng: 160% ST, đẩy lùi mạnh, làm Ướt.', pas: 'Hồi 1 máu Thánh Thạch mỗi 12 giây.' },
    { name: 'Thánh Hỏa Phán Xét', el: ['fire'], lv: 10, cd: 14, act: 'Cột thánh hỏa giáng lên quái máu cao nhất: 6 nhịp × 120% ST, Thiêu đốt.', pas: '10% đòn thường gây Thiêu đốt.' }]
};
function hasSk(h, j) { return h.lv >= SKILLS[h.type][j].lv; }
function setWet(e, t) { e.wetT = Math.max(e.wetT || 0, t); }
function shock(e, t) { e.shockT = Math.max(e.shockT || 0, t); e.stunT = Math.max(e.stunT || 0, ET[e.t].boss ? 0.1 : 0.35); }
function freeze(e, t, ch) { if (ch !== undefined && Math.random() >= ch * (e.wetT > 0 ? 2 : 1)) return; const d = ET[e.t].boss ? t * 0.4 : t; if (d > (e.frzT || 0)) { if (!(e.frzT > 0)) burst(e.x, e.y, '#cff8ff', 6, 60, 3, eh(e)); e.frzT = d; } }
function burnE(e, dps, src) { e.burnT = Math.max(e.burnT, 2.5); e.burnD = Math.max(e.burnD, dps); e.burnSrc = src; }
function knock(e, k) { e.d = Math.max(0, e.d - (ET[e.t].boss ? k * 0.25 : k)); }
function vuln(e, el) { let m = 1; if (e.frzT > 0) m *= 1.3; if (e.shockT > 0) m *= 1.2; if (e.burnT > 0) m *= 1.15; if (e.wetT > 0) m *= (el === 'ice' || el === 'thunder') ? 1.35 : 1.1; return m; }
function announce(i, name, col) { heroText(i, name + '!', col, 14, { life: 1.5, glow: true }, 2.3); const P = S.hpos[i]; ring(P.x, P.y, 6, 44, col, 0.5); burst(P.x, P.y, col, 12, 100, 4, 1); }
function lineProj(i, to, kind, D) { const P = S.hpos[i]; const fx = P.x, fy = P.y - 40; const dx = to.x - fx, dy = aimY(to) - fy, l = Math.hypot(dx, dy) || 1; S.sk.push({ type: 'line', hi: i, kind, x: fx, y: fy, dx: dx / l, dy: dy / l, sp: 540, trav: 0, max: 540, W: kind === 'fire' ? 42 : 34, hit: new Set(), D, t: 0 }); }
function castSkill(i, j) {
  const h = S.heroes[i], P = S.hpos[i], st = skStats(h), rng = st.range + 30, SKD = SKILLS[h.type][j];
  const inR = S.en.filter(e => !e.dead && Math.hypot(e.x - P.x, e.y - (P.y - 20)) <= rng); if (!inR.length) return false;
  const best = Rr => { let b = null, bc = -1; for (const e of inR) { let c = 0; for (const o of S.en) if (Math.hypot(o.x - e.x, o.y - e.y) <= Rr) c++; if (c > bc || (c === bc && e.d > b.d)) { bc = c; b = e; } } return b; };
  const D = st.dmg; announce(i, SKD.name, ELC[SKD.el[0]]);
  switch (h.type + j) {
    case 'thunder0': { const c = best(80); const tg = []; for (let n = 0; n < 5; n++) { const pool = S.en.filter(o => !o.dead && Math.hypot(o.x - c.x, o.y - c.y) <= 85); tg.push(pool.length ? pool[(Math.random() * pool.length) | 0] : c); } S.sk.push({ type: 'boltseq', hi: i, list: tg.map(e => ({ x: e.x, y: e.y, h: eh(e) })), t: 0, n: 0, D: D * 1.8 }); h.aimX = c.x; h.aimY = c.y; break; }
    case 'thunder1': { const c = best(85); S.sk.push({ type: 'storm', hi: i, x: c.x, y: c.y, R: 85, t: 0, dur: 4, tick: 0.2, D: D * 1.2 }); break; }
    case 'fire0': { const c = best(60); lineProj(i, c, 'fire', D * 2.5); h.aimX = c.x; h.aimY = c.y; break; }
    case 'fire1': { const c = best(70); S.sk.push({ type: 'meteor', hi: i, x: c.x, y: c.y, t: 0, dur: 0.55, D: D * 5 }); break; }
    case 'ice0': { const c = best(80); S.sk.push({ type: 'blizzard', hi: i, x: c.x, y: c.y, R: 80, t: 0, dur: 3.2, tick: 0.1, D: D * 0.5 }); break; }
    case 'ice1': { const c = best(110); const tg = S.en.filter(o => !o.dead && Math.hypot(o.x - c.x, o.y - c.y) <= 110).sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y)).slice(0, 8); tg.forEach((e, n) => S.sk.push({ type: 'pillar', hi: i, e, x: e.x, y: e.y, t: -n * 0.07, dur: 1.1, D: D * 3 })); break; }
    case 'elf0': { const c = best(75); const arr = []; for (let n = 0; n < 14; n++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 75; arr.push({ x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r * 0.8, t: Math.random() * 0.75, hit: false }); } S.sk.push({ type: 'arrowrain', hi: i, x: c.x, y: c.y, arr, t: 0, dur: 1.1, D: D * 0.9 }); break; }
    case 'elf1': { const c = best(50); lineProj(i, c, 'water', D * 3.5); h.aimX = c.x; h.aimY = c.y; break; }
    case 'holy0': { const c = best(110); S.sk.push({ type: 'tide', hi: i, x: c.x, y: c.y, R: 110, t: 0, dur: 0.75, hit: new Set(), D: D * 1.6 }); break; }
    case 'holy1': { let c = inR[0]; for (const e of inR) if (e.hp > c.hp) c = e; S.sk.push({ type: 'judg', hi: i, e: c, x: c.x, y: c.y, t: 0, dur: 1.2, tick: 0, D: D * 1.2 }); break; }
  }
  h.anim = 0.3; return true;
}
function quiet(o, amt, hi) { damage(o, amt, hi, 'n', false); }
function easeOut(k) { return 1 - Math.pow(1 - k, 3); }
function updSk(dt) {
  for (const s of S.sk) { s.t += dt;
    switch (s.type) {
      case 'boltseq': { while (s.n < s.list.length && s.t >= s.n * 0.1) { const q = s.list[s.n++]; bolt([V(q.x, q.y, 4.5), V(q.x, q.y, q.h)], '#c8a8ff', 0.3); burst(q.x, q.y, '#e0d0ff', 8, 120, 4, q.h); ring(q.x, q.y, 4, 40, '#c8a8ff', 0.35);
          for (const o of S.en) if (!o.dead && Math.hypot(o.x - q.x, o.y - q.y) < 30) { shock(o, 2); strike(o, s.D, s.hi, 'thunder'); } }
        if (s.n >= s.list.length && s.t > 0.6) s.done = true; break; }
      case 'storm': { s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.5; const pool = []; for (const o of S.en) if (!o.dead && Math.hypot(o.x - s.x, o.y - s.y) <= s.R) { setWet(o, 3); pool.push(o); }
          for (let n = 0; n < 2 && pool.length; n++) { const o = pool[(Math.random() * pool.length) | 0]; bolt([V(s.x, s.y, 2.6), V(o.x, o.y, eh(o))], '#c8a8ff', 0.22); shock(o, 1.5); strike(o, s.D, s.hi, 'thunder'); burst(o.x, o.y, '#e0d0ff', 6, 100, 3.5, eh(o)); } }
        if (s.t >= s.dur + 0.3) s.done = true; break; }
      case 'line': { const step = s.sp * dt; s.x += s.dx * step; s.y += s.dy * step; s.trav += step;
        for (const o of S.en) { if (o.dead || s.hit.has(o)) continue; if (Math.hypot(o.x - s.x, aimY(o) - s.y) <= s.W) { s.hit.add(o); if (s.kind === 'fire') burnE(o, s.D * 0.15, s.hi); else { setWet(o, 3); knock(o, 45); } strike(o, s.D, s.hi, s.kind); burst(o.x, o.y, s.kind === 'fire' ? '#ff9a3a' : '#7fd0ff', 8, 110, 4, eh(o)); } }
        if (s.trav >= s.max || s.x < -60 || s.x > W + 60 || s.y < -60 || s.y > H) s.done = true; break; }
      case 'meteor': { if (!s.boom && s.t >= s.dur) { s.boom = true; S.shake = Math.max(S.shake, 0.35); burst(s.x, s.y, '#ff7a1a', 30, 220, 7, 0.3); burst(s.x, s.y, '#ffe08a', 14, 150, 5, 0.3); ring(s.x, s.y, 6, 84, '#ff9a3a', 0.55); ring(s.x, s.y, 6, 56, '#fff0b0', 0.35);
          for (const o of S.en) if (!o.dead && Math.hypot(o.x - s.x, o.y - s.y) <= 72) { burnE(o, s.D * 0.06, s.hi); strike(o, s.D, s.hi, 'fire'); }
          S.sk.push({ type: 'firezone', hi: s.hi, x: s.x, y: s.y, R: 60, t: 0, dur: 3, tick: 0, D: s.D * 0.04 }); s.done = true; } break; }
      case 'firezone': { s.tick -= dt; if (s.tick <= 0) { s.tick = 0.3; for (const o of S.en) if (!o.dead && Math.hypot(o.x - s.x, o.y - s.y) <= s.R) { burnE(o, s.D * 3, s.hi); quiet(o, s.D * vuln(o, 'fire'), s.hi); } }
        if (s.t >= s.dur) s.done = true; break; }
      case 'blizzard': { s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.4; for (const o of S.en) if (!o.dead && Math.hypot(o.x - s.x, o.y - s.y) <= s.R) { o.slowT = Math.max(o.slowT, 1); o.slow = Math.max(o.slow || 0, ET[o.t].boss ? 0.25 : 0.5); freeze(o, 1.2, 0.12); strike(o, s.D, s.hi, 'ice'); } }
        if (s.t >= s.dur + 0.3) s.done = true; break; }
      case 'pillar': { if (s.t >= 0 && !s.fired) { s.fired = true; if (!s.e.dead) { s.x = s.e.x; s.y = s.e.y; } for (const o of S.en) if (!o.dead && Math.hypot(o.x - s.x, o.y - s.y) < 24) { freeze(o, 1.6); strike(o, s.D, s.hi, 'ice'); } burst(s.x, s.y, '#dffaff', 10, 130, 4, 0.4); ring(s.x, s.y, 4, 30, '#7fe8ff', 0.35); }
        if (s.t >= s.dur) s.done = true; break; }
      case 'arrowrain': { for (const a of s.arr) { if (!a.hit && s.t >= a.t + 0.25) { a.hit = true; burst(a.x, a.y, '#9fe0ff', 6, 80, 3, 0.2); ring(a.x, a.y, 2, 20, '#4ab8ff', 0.3); for (const o of S.en) if (!o.dead && Math.hypot(o.x - a.x, o.y - a.y) < 24) { setWet(o, 3); strike(o, s.D, s.hi, 'water'); } } }
        if (s.t >= s.dur) s.done = true; break; }
      case 'tide': { const r = s.R * easeOut(Math.min(1, s.t / s.dur)); for (const o of S.en) { if (o.dead || s.hit.has(o)) continue; if (Math.hypot(o.x - s.x, (o.y - s.y) / 0.6) <= r) { s.hit.add(o); setWet(o, 3); knock(o, 55); strike(o, s.D, s.hi, 'water'); } }
        if (s.t >= s.dur + 0.25) s.done = true; break; }
      case 'judg': { if (s.e && !s.e.dead) { s.x = s.e.x; s.y = s.e.y; } s.tick -= dt; if (s.tick <= 0 && s.t < s.dur) { s.tick = 0.2; for (const o of S.en) if (!o.dead && Math.hypot(o.x - s.x, o.y - s.y) <= 44) { burnE(o, s.D * 0.12, s.hi); strike(o, s.D, s.hi, 'fire'); } burst(s.x, s.y, '#ffe08a', 6, 120, 4, 0.4); }
        if (s.t >= s.dur + 0.3) s.done = true; break; }
    } }
  for (const s of S.sk) if (s.done && s.v) { scene.remove(s.v); s.v = null; }
  S.sk = S.sk.filter(s => !s.done);
}

// ---------- main simulation step ----------
function update(dt) {
  S.time += dt;
  if (S.phase === 'break') { S.breakT -= dt; if (S.auto && S.breakT > 1.5) S.breakT = 1.5; if (S.breakT <= 0) startWave(); }
  else { S.spawnT -= dt;
    if (S.queue.length && S.spawnT <= 0) { const t = S.queue.shift(); spawnEnemy(t); S.spawnT = ET[t].boss ? 2 : Math.max(0.12, 1.0 - 0.03 * S.wave); if (S.queue.length && ET[S.queue[0]].boss) S.spawnT = 2.5; }
    if (!S.queue.length && !S.en.length) { const bx = 20 * S.wave; S.heroes.forEach((h, i) => addExp(i, bx)); addText(270, 330, 'Hoàn thành đợt ' + S.wave + '! +' + bx + ' EXP', '#9fe8ff', 17, { life: 1.8 }, 1.5);
      S.wave++; S.phase = 'break'; S.breakT = S.auto ? 1.5 : 15;
      const nm = mapFor(S.wave); if (nm !== CUR_MAP) { S.drops.forEach(d => { S.inv[d.k]++; removeDrop3(d); }); S.drops = []; setMap(nm); banner('BẢN ĐỒ: ' + MAPS[nm].name.toUpperCase(), 'gold'); S.breakT = Math.max(S.breakT, 3.5); log('Tiến vào bản đồ mới: ' + MAPS[nm].name, '#ffe08a'); }
      if (S.wave > best) { best = S.wave; try { localStorage.setItem('htvb3d_best', best); } catch (e) { } } saveGame(true); } }
  if (S.auto) { S.autoT -= dt; if (S.autoT <= 0) { S.autoT = 0.5; autoManage(); } }
  for (const e of S.en) { if (e.dead) continue;
    if (e.slowT > 0) e.slowT -= dt; if (e.hitT > 0) e.hitT -= dt; if (e.frzT > 0) e.frzT -= dt; if (e.stunT > 0) e.stunT -= dt;
    if (e.shockT > 0) { e.shockT -= dt; if (Math.random() < dt * 6) burst(e.x, e.y, '#d8c0ff', 1, 40, 3, eh(e)); }
    if (e.wetT > 0) { e.wetT -= dt; if (Math.random() < dt * 3) { const p = V(e.x + (Math.random() - 0.5) * 20, e.y, eh(e)); emit(p.x, p.y, p.z, 0, -1.2, 0, '#7fd0ff', 0.06, 0.5, -2, 1); } }
    if (e.burnT > 0) { e.burnT -= dt; damage(e, e.burnD * dt, e.burnSrc, 'n', false); if (Math.random() < dt * 12) { const p = V(e.x + (Math.random() - 0.5) * 16, e.y, eh(e)); emit(p.x, p.y, p.z, 0, 0.7, 0, '#ff7a1a', 0.08, 0.5, 0.4, 0.98); } if (e.dead) continue; }
    if (!(e.frzT > 0) && !(e.stunT > 0)) e.d += e.sp * (e.slowT > 0 ? 1 - e.slow : 1) * dt;
    if (e.d >= PATH_LEN) { e.dead = true; S.waveDone++; removeMob3(e, false); const dm = ET[e.t].dmg; S.hp = Math.max(0, S.hp - dm); S.shake = 0.3; S.shrineHit = 0.4; burst(SH.x, SH.y, '#ff5a5a', 12, 110, 5, 1.2); addText(SH.x, SH.y, '-' + dm, '#ff5a4a', 20, null, 2); if (S.hp <= 0 && !S.over) gameOver(); continue; }
    const p = posAt(e.d); e.x = p.x + e.ox; e.y = p.y + e.oy; }
  S.en = S.en.filter(e => !e.dead);
  S.heroes.forEach((h, i) => { const P = S.hpos[i], T = UT[h.type];
    if (h.anim > 0) h.anim -= dt;
    h.emit -= dt; if (h.emit <= 0) { h.emit = 0.7 / (1 + h.wing); const p = V(P.x + (Math.random() - 0.5) * 26, P.y, Math.random() * 1.1); emit(p.x, p.y, p.z, (Math.random() - 0.5) * 0.15, 0.25 + Math.random() * 0.25, (Math.random() - 0.5) * 0.15, T.col, 0.07, 1.1, 0, 0.99);
      if (h.wing >= 5) { const q = V(P.x + (Math.random() - 0.5) * 80, P.y, 0.8 + Math.random() * 0.8); emit(q.x, q.y, q.z, 0, 0.3, 0, '#ffe9a0', 0.07, 1, 0, 0.99); } }
    h.mp = Math.min(maxMP(h), h.mp + 3.5 * dt);
    for (let j = 0; j < 2; j++) { if (!hasSk(h, j)) continue; h.sk[j] -= dt; if (h.sk[j] <= 0) { if (h.mp >= SKC[j] && castSkill(i, j)) { h.mp -= SKC[j]; h.sk[j] = SKILLS[h.type][j].cd; } else h.sk[j] = 0; } }
    if (h.type === 'holy' && hasSk(h, 0)) { h.healT += dt; if (h.healT >= 12) { h.healT = 0; if (S.hp < 100) { S.hp = Math.min(100, S.hp + 1); addText(SH.x, SH.y, '+1', '#7dff9a', 17, null, 2); burst(SH.x, SH.y, '#9dffb4', 8, 70, 4, 1.2); } } }
    h.cd -= dt; if (h.cd > 0) return;
    const st = hstats(h); const tg = pickTarget(i, P, st.range);
    if (!tg) { h.cd = 0.05; return; }
    h.cd = st.rate; h.anim = 0.18; h.aimX = tg.x; h.aimY = tg.y;
    if (h.type === 'thunder') { chainHit(i, tg, st); return; }
    const from = heroTip3(i);
    const pr = { x: P.x, y: P.y - 40, tgt: tg, tx: tg.x, ty: aimY(tg), type: T.proj, dmg: st.dmg, hi: i, sp: T.ps, col: T.col, splash: T.splash ? T.splash + Math.min(30, h.lv * 0.4) : 0, from, d0: 0 };
    pr.d0 = Math.hypot(pr.tx - pr.x, pr.ty - pr.y) || 1; S.pr.push(pr); spawnProj3(pr); });
  for (const p of S.pr) { if (p.tgt && !p.tgt.dead) { p.tx = p.tgt.x; p.ty = aimY(p.tgt); p.tx0 = p.tgt.x; p.ty0 = p.tgt.y; p.h = eh(p.tgt); }
    const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy), step = p.sp * dt;
    if (d <= step + 5) { p.x = p.tx; p.y = p.ty; if (p.tx0 === undefined) { p.tx0 = p.tx; p.ty0 = p.ty; p.h = 0.4; } hitProj(p); p.done = true; } else { p.x += dx / d * step; p.y += dy / d * step; } }
  for (const p of S.pr) if (p.done) removeProj3(p);
  S.pr = S.pr.filter(p => !p.done);
  updSk(dt);
  for (const d of S.drops) { d.t += dt;
    if (d.state === 'ground') { if (d.z > 0.05 || d.vz > 0) { d.vz -= 9 * dt; d.z += d.vz * dt; if (d.z <= 0.05) { d.z = 0.05; d.vz = d.vz < -1 ? -d.vz * 0.3 : 0; } } if (d.t > 1.8) collect(d); }
    else if (d.t > 0.5) { d.done = true; S.inv[d.k]++; pulseInv(d.k); log('Nhặt được: ' + ITEMS[d.k].name, ITEMS[d.k].col); } }
  for (const d of S.drops) if (d.done) removeDrop3(d);
  S.drops = S.drops.filter(d => !d.done);
  if (S.shake > 0) S.shake -= dt; if (S.shrineHit > 0) S.shrineHit -= dt;
}
