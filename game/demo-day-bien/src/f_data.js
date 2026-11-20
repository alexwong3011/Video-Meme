
// =====================================================================
// GAME DATA — classes, skills, maps, monsters, items, sets, stones, wings
// =====================================================================
const CLS = {
  thunder: { name: 'Lôi Thánh Kỵ', icon: '⚡', col: '#b98cff', el: 'thunder', melee: true, range: 1.9, rate: 0.6, atk: 1.0, hp: 1.15, desc: 'Giáo sét, giáp dày. Đòn thường có 20% phóng sét lan sang 2 quái gần.' },
  fire: { name: 'Hỏa Kiếm Sĩ', icon: '🔥', col: '#ff7a1a', el: 'fire', melee: true, range: 1.8, rate: 0.62, atk: 1.15, hp: 1.05, desc: 'Đại kiếm lửa, sát thương cao. Đòn thường thiêu đốt mục tiêu.' },
  ice: { name: 'Băng Pháp Sư', icon: '❄', col: '#6fe8ff', el: 'ice', melee: false, range: 6.5, rate: 0.72, atk: 1.1, hp: 0.9, proj: 'shard', ps: 9, desc: 'Phép băng tầm xa, làm chậm và đóng băng quái.' },
  elf: { name: 'Lục Cung Thủ', icon: '🏹', col: '#7dff9a', el: 'water', melee: false, range: 7.5, rate: 0.36, atk: 0.82, hp: 0.9, proj: 'arrow', ps: 14, crit: 0.2, desc: 'Bắn cực nhanh, chí mạng gốc 20%. Tên nước làm Ướt.' },
  holy: { name: 'Thánh Quang Tư Tế', icon: '✦', col: '#ffd85a', el: 'holy', melee: false, range: 6.5, rate: 0.78, atk: 1.0, hp: 1.0, proj: 'holy', ps: 8, splash: 1.3, desc: 'Cầu thánh quang nổ lan, có kỹ năng hồi máu.' }
};
const CORDER = ['thunder', 'fire', 'ice', 'elf', 'holy'];
const ELC = { ice: '#7fe8ff', thunder: '#c8a8ff', fire: '#ff7a2a', water: '#3ab0ff', holy: '#ffd85a' };
const ELN = { ice: 'Băng', thunder: 'Sét', fire: 'Lửa', water: 'Nước', holy: 'Thánh' };
const ELI = { ice: '❄', thunder: '⚡', fire: '🔥', water: '💧', holy: '✦' };
// three skills per class: unlock at Lv 1 / 10 / 25
const SKILLS = {
  thunder: [{ id: 'bolts', name: 'Lôi Phạt Thiên Giáng', el: 'thunder', lv: 1, cd: 6, mp: 20, mult: 1.8, act: '5 tia sét giáng xuống cụm quái, mỗi tia 180% ST, gây Tê liệt.' },
    { id: 'storm', name: 'Bão Sấm Tụ Thủy', el: 'thunder', lv: 10, cd: 14, mp: 40, mult: 1.2, act: 'Mây bão 4 giây: làm Ướt quái trong vùng, liên tục giáng sét 120% ST.' },
    { id: 'spinbolt', name: 'Lôi Long Xoáy', el: 'thunder', lv: 25, cd: 10, mp: 35, mult: 2.6, act: 'Xoáy sét quanh thân: 260% ST mọi quái gần, gây Tê liệt.' }],
  fire: [{ id: 'flamewave', name: 'Hỏa Long Trảm', el: 'fire', lv: 1, cd: 5, mp: 18, mult: 2.5, act: 'Sóng lửa xuyên thẳng hàng, 250% ST, Thiêu đốt.' },
    { id: 'meteor', name: 'Thiên Hỏa Lưu Tinh', el: 'fire', lv: 10, cd: 13, mp: 45, mult: 5, act: 'Thiên thạch rơi nổ 500% ST diện rộng, để lại biển lửa 3 giây.' },
    { id: 'firespin', name: 'Lốc Hỏa Kiếm', el: 'fire', lv: 25, cd: 9, mp: 32, mult: 3, act: 'Xoay đại kiếm lửa: 300% ST mọi quái gần, Thiêu đốt.' }],
  ice: [{ id: 'blizzard', name: 'Băng Phong Bạo', el: 'ice', lv: 1, cd: 9, mp: 28, mult: 0.5, act: 'Bão tuyết 3 giây: 50% ST mỗi nhịp, làm chậm, có thể Đóng băng.' },
    { id: 'icepillars', name: 'Vạn Băng Trụ', el: 'ice', lv: 10, cd: 12, mp: 42, mult: 3, act: 'Trụ băng trồi lên dưới tối đa 8 quái: 300% ST, Đóng băng 1.6 giây.' },
    { id: 'icefan', name: 'Băng Tiễn Liên Hoàn', el: 'ice', lv: 25, cd: 7, mp: 30, mult: 1.4, act: 'Bắn quạt 7 băng tiễn, mỗi mũi 140% ST, làm chậm.' }],
  elf: [{ id: 'arrowrain', name: 'Thủy Tiễn Vũ', el: 'water', lv: 1, cd: 7, mp: 22, mult: 0.9, act: 'Mưa 14 mũi tên nước, mỗi mũi 90% ST, làm Ướt.' },
    { id: 'pierce', name: 'Phá Lãng Tiễn', el: 'water', lv: 10, cd: 10, mp: 36, mult: 3.5, act: 'Mũi tên sóng xuyên thẳng hàng: 350% ST, đẩy lùi, làm Ướt.' },
    { id: 'arrowfan', name: 'Tiễn Bạo', el: 'water', lv: 25, cd: 6, mp: 26, mult: 1.6, act: 'Bắn quạt 5 mũi tên, mỗi mũi 160% ST.' }],
  holy: [{ id: 'tide', name: 'Thánh Thủy Triều', el: 'water', lv: 1, cd: 10, mp: 30, mult: 1.6, act: 'Vòng thủy triều lan rộng: 160% ST, đẩy lùi mạnh, làm Ướt.' },
    { id: 'judg', name: 'Thánh Hỏa Phán Xét', el: 'fire', lv: 10, cd: 13, mp: 40, mult: 1.2, act: 'Cột thánh hỏa giáng lên quái máu cao nhất: 6 nhịp × 120% ST, Thiêu đốt.' },
    { id: 'blessing', name: 'Thánh Quang Hộ Thể', el: 'holy', lv: 25, cd: 18, mp: 45, mult: 2, act: 'Hồi 35% máu tối đa và phát nổ 200% ST quanh thân.' }]
};
// damage tiers rolled on every hit (same stones as the 2D original)
const STONES = { c: { inc: 0.05, cap: 0.6, stat: 'crit', mult: 1.5, n: 'Chí mạng' }, p: { inc: 0.05, cap: 0.4, stat: 'perf', mult: 2, n: 'Hoàn hảo' }, d: { inc: 0.02, cap: 0.25, stat: 'dbl', mult: 2, n: 'Nhân đôi' }, t: { inc: 0.01, cap: 0.15, stat: 'tri', mult: 3, n: 'Nhân ba' }, x: { inc: 0.005, cap: 0.08, stat: 'ult', mult: 10, n: 'Thần phạt' } };
const SK = ['c', 'p', 'd', 't', 'x'];
const BASE_RATE = { crit: 0.05, perf: 0.03, dbl: 0.01, tri: 0, ult: 0 };
const DMGC = { r: '#ff9a3a', n: '#f0d8b0', c: '#3aa0ff', p: '#3cff6a', d: '#c060ff', t: '#ff3a3a', x: '#ffd23a' };
const MATS = {
  e: { name: 'Đá Cường Hóa', col: '#6fe7ff', desc: 'Dùng để cường hóa trang bị' },
  c: { name: 'Linh Thạch Sơ Cấp', col: '#4aa8ff', desc: '+5% chí mạng ×1.5' },
  p: { name: 'Linh Thạch Cao Cấp', col: '#4cff6a', desc: '+5% hoàn hảo ×2' },
  d: { name: 'Linh Thạch Huyền Bí', col: '#c06aff', desc: '+2% nhân đôi ×2' },
  t: { name: 'Linh Thạch Tối Thượng', col: '#ff4a4a', desc: '+1% nhân ba ×3' },
  x: { name: 'Linh Thạch Thần Thánh', col: '#ffd23a', desc: '+0.5% thần phạt ×10' },
  f: { name: 'Lông Vũ Thần', col: '#ffd85a', desc: 'Nguyên liệu chế cánh' }
};
const MKEYS = ['e', 'c', 'p', 'd', 't', 'x', 'f'];
const DROP = { e: 0.16, c: 0.07, p: 0.045, d: 0.025, t: 0.004, x: 0.0006, f: 0.035 };
const FORGE = [['c', 'p'], ['p', 'd'], ['d', 't'], ['t', 'x']];
// wings crafted from feathers
const WINGM = [1, 1.3, 1.5, 1.8, 2.2, 2.5], WCOST = [5, 10, 18, 30, 50], WNAME = ['Chưa có', 'Cánh Thần I', 'Cánh Thần II', 'Cánh Thần III', 'Cánh Thần IV', 'Cánh Thần V'], WMAX = 5;
const WDEF = [0, 6, 14, 26, 42, 64], WHP = [0, 60, 150, 300, 520, 800];

// gear
const SLOTS = { weapon: { n: 'Vũ khí', base: { atk: 12 } }, helm: { n: 'Mũ', base: { def: 4, hp: 30 } }, armor: { n: 'Giáp', base: { def: 8, hp: 60 } }, ring: { n: 'Nhẫn', base: { hp: 40, crit: 2 } } };
const SLOT_ORDER = ['weapon', 'helm', 'armor', 'ring'];
const STAT_N = { atk: 'Tấn công', def: 'Phòng thủ', hp: 'Máu', crit: 'Chí mạng %' };
const RARITY = [{ n: 'Thường', c: 0xe9f1f2, css: '#e9f1f2' }, { n: 'Hiếm', c: 0x5fb4ff, css: '#5fb4ff' }, { n: 'Sử thi', c: 0xc58bff, css: '#c58bff' }, { n: 'Huyền thoại', c: 0xffb347, css: '#ffb347' }];
const RMULT = [1, 1.45, 2.1, 3];
const SETS = {
  song: { n: 'Bộ Sóng Bạc', col: '#9fe8ff', names: { weapon: 'Kích Sóng Bạc', helm: 'Mũ Sóng Bạc', armor: 'Giáp Sóng Bạc', ring: 'Nhẫn Sóng Bạc' }, b2: { atkP: 0.08 }, b4: { hpP: 0.15, dmgP: 0.1 }, d2: '+8% tấn công', d4: '+15% máu, +10% sát thương' },
  vay: { n: 'Bộ Vảy Rồng Biển', col: '#7dffb0', names: { weapon: 'Kiếm Vảy Rồng', helm: 'Mũ Vảy Rồng', armor: 'Giáp Vảy Rồng', ring: 'Nhẫn Vảy Rồng' }, b2: { crit: 5 }, b4: { atkP: 0.15, dmgP: 0.15 }, d2: '+5% chí mạng', d4: '+15% tấn công, +15% sát thương' },
  dung: { n: 'Bộ Dung Nham', col: '#ffa060', names: { weapon: 'Đại Kiếm Dung Nham', helm: 'Mũ Dung Nham', armor: 'Giáp Dung Nham', ring: 'Nhẫn Dung Nham' }, b2: { defP: 0.2 }, b4: { atkP: 0.2, dmgP: 0.25, hpP: 0.1 }, d2: '+20% phòng thủ', d4: '+20% tấn công, +25% sát thương, +10% máu' }
};
const PLAIN = { weapon: ['Kiếm Hải Lam', 'Kích San Hô', 'Thương Triều Dâng'], helm: ['Mũ Ngọc Trai', 'Mũ Vỏ Ốc Bạc'], armor: ['Giáp Lân Quang', 'Giáp Vỏ Sò'], ring: ['Nhẫn Bọt Biển', 'Nhẫn Lân Quang'] };

// monsters (sizes match a 1.15-unit hero)
const MT = {
  jelly: { name: 'Sứa Lân Quang', hp: 60, atk: 1.0, exp: 14, speed: 0.9, model: 'jelly', y: 0.95 },
  spikefish: { name: 'Cá Gai Hỏa', hp: 95, atk: 1.15, exp: 20, speed: 1.4, model: 'spikefish', y: 0.45 },
  angler: { name: 'Cá Lồng Đèn', hp: 120, atk: 1.2, exp: 24, speed: 1.1, model: 'angler', y: 0.42 },
  eel: { name: 'Lươn Lôi', hp: 90, atk: 1.3, exp: 22, speed: 1.9, model: 'eel', y: 0.3 },
  crab: { name: 'Cua Giáp Đá', hp: 260, atk: 1.4, exp: 40, speed: 0.8, model: 'crab', y: 0 },
  lavacrab: { name: 'Cua Dung Nham', hp: 320, atk: 1.6, exp: 48, speed: 0.85, model: 'crab', y: 0, tint: 0xff4a0a },
  lavafish: { name: 'Cá Gai Dung Nham', hp: 220, atk: 1.7, exp: 44, speed: 1.6, model: 'spikefish', y: 0.45, tint: 0xff3a00 },
  shadeshark: { name: 'Cá Mập Bóng Đêm', hp: 420, atk: 1.9, exp: 60, speed: 1.4, model: 'shark', y: 0.5, scale: 0.42 },
  jqueen: { name: 'Sứa Mẫu Hậu', hp: 60, atk: 1.0, exp: 14, model: 'jqueen', boss: true, y: 1.1 },
  serpent: { name: 'Hải Long Xà', hp: 90, atk: 1.3, exp: 22, model: 'serpent', boss: true, y: 0.6 },
  turtle: { name: 'Cự Quy Dung Nham', hp: 320, atk: 1.6, exp: 48, model: 'turtle', boss: true, y: 0 }
};
const MAPS = [
  { name: 'Bãi San Hô Lân Quang', req: 1, theme: 'sea', ground: [0x0d3a3e, 0x2b5551, 0x061a1e, 0x3fc0d0], rock: [0x4fae94, 0x1f5d63, 0x0b2a33, 0x9ff2d8], fog: 0x06262e, rune: 0x5af0ff, weed: [0x2f9e6e, 0x4fc48a, 0x1f7a6a, 0x7ad19a], set: 'song',
    zones: [{ k: 'jelly', x: -5, z: 5, r: 4.5, n: 9, lv: [1, 4] }, { k: 'spikefish', x: 9, z: -1, r: 4.5, n: 8, lv: [4, 8] }, { k: 'jelly', x: 7, z: -8.5, r: 5, n: 7, lv: [7, 11] }, { k: 'angler', x: -8, z: -8, r: 5, n: 8, lv: [10, 14] }],
    boss: { k: 'jqueen', x: 0, z: -15.5, lv: 15, respawn: 180 } },
  { name: 'Rừng Tảo U Linh', req: 15, theme: 'kelp', ground: [0x0c2a1a, 0x2a4a30, 0x041208, 0x6fe08a], rock: [0x6a9a5c, 0x2f5a3a, 0x0e2416, 0xb8ffb0], fog: 0x07241a, rune: 0x7dff9a, weed: [0x3a9a3a, 0x5ac45a, 0x2a7a3a, 0x8ad16a, 0x6ab84a], set: 'vay',
    zones: [{ k: 'eel', x: -5, z: 5, r: 4.5, n: 9, lv: [15, 19] }, { k: 'angler', x: 9, z: -1, r: 4.5, n: 8, lv: [18, 23] }, { k: 'crab', x: 7, z: -8.5, r: 5, n: 6, lv: [22, 27] }, { k: 'eel', x: -8, z: -8, r: 5, n: 8, lv: [26, 31] }],
    boss: { k: 'serpent', x: 0, z: -15.5, lv: 33, respawn: 210 } },
  { name: 'Hố Thẳm Dung Nham', req: 30, theme: 'lava', ground: [0x1a1012, 0x2e2224, 0x0a0606, 0xff8a50], rock: [0x5a4a46, 0x3a2c2a, 0x160e0c, 0xff7a3a], fog: 0x1a0c0a, rune: 0xff7a3a, weed: [], set: 'dung',
    zones: [{ k: 'lavacrab', x: -5, z: 5, r: 4.5, n: 8, lv: [30, 35] }, { k: 'lavafish', x: 9, z: -1, r: 4.5, n: 8, lv: [34, 40] }, { k: 'shadeshark', x: 7, z: -8.5, r: 5, n: 5, lv: [38, 44] }, { k: 'lavacrab', x: -8, z: -8, r: 5, n: 8, lv: [42, 50] }],
    boss: { k: 'turtle', x: 0, z: -15.5, lv: 52, respawn: 240 } }
];

// formulas
const MAXLV = 200;
const expNeed = lv => Math.round(60 * Math.pow(lv, 1.5));
const mobHp = (base, lv) => Math.round(base * (1 + 0.3 * (lv - 1) + 0.012 * (lv - 1) * (lv - 1)));
const mobAtk = (mult, lv) => Math.round((6 + lv * 3.2) * mult);
const mobExp = (base, lv) => Math.round(base * (1 + 0.2 * (lv - 1)));
const plusMult = p => 1 + p * 0.1 + p * p * 0.006;
const upRate = p => p < 6 ? 1 : [0.9, 0.8, 0.7, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3][p - 6];
const upCost = p => ({ stones: 1 + Math.floor(p / 3), gold: Math.round(80 * Math.pow(p + 1, 1.6)) });
const tier = p => p >= 13 ? 3 : p >= 10 ? 2 : p >= 7 ? 1 : 0;
const TIER_COL = [0x7fe9ff, 0x6fb8ff, 0xffc75a, 0xd28bff];
