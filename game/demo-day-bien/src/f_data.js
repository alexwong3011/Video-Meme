
// =====================================================================
// GAME DATA — classes, skills, maps, monsters, items, sets, stones, wings
// =====================================================================
const CLS = {
  thunder: { name: 'Lôi Thánh Kỵ', icon: '⚡', col: '#b98cff', glow: '#c8b0ff', el: 'thunder', melee: true, range: 1.9, rate: 0.6, atk: 1.0, hp: 1.15, desc: 'Giáo sét, giáp dày. Đòn thường có 20% phóng sét lan sang 2 quái gần.' },
  fire: { name: 'Hỏa Kiếm Sĩ', icon: '🔥', col: '#ff7a1a', glow: '#7fe9ff', el: 'fire', melee: true, range: 1.8, rate: 0.62, atk: 1.15, hp: 1.05, desc: 'Đại kiếm lửa, sát thương cao. Đòn thường thiêu đốt mục tiêu.' },
  ice: { name: 'Băng Pháp Sư', icon: '❄', col: '#6fe8ff', glow: '#9ff4ff', el: 'ice', melee: false, range: 6.5, rate: 0.72, atk: 1.1, hp: 0.9, proj: 'shard', ps: 9, desc: 'Phép băng tầm xa, làm chậm và đóng băng quái.' },
  elf: { name: 'Lục Cung Thủ', icon: '🏹', col: '#7dff9a', glow: '#9fffc0', el: 'water', melee: false, range: 7.5, rate: 0.36, atk: 0.82, hp: 0.9, proj: 'arrow', ps: 14, crit: 0.2, desc: 'Bắn cực nhanh, chí mạng gốc 20%. Tên nước làm Ướt.' },
  holy: { name: 'Thánh Quang Tư Tế', icon: '✦', col: '#ffd85a', glow: '#fff0a0', el: 'holy', melee: false, range: 6.5, rate: 0.78, atk: 1.0, hp: 1.0, proj: 'holy', ps: 8, splash: 1.3, desc: 'Cầu thánh quang nổ lan, có kỹ năng hồi máu.' }
};
for (const k in CLS) CLS[k].aps = 2 / CLS[k].rate; // attacks per second = 2× the old swing rate
const CORDER = ['thunder', 'fire', 'ice', 'elf', 'holy'];
const ELC = { ice: '#7fe8ff', thunder: '#c8a8ff', fire: '#ff7a2a', water: '#3ab0ff', holy: '#ffd85a' };
const ELN = { ice: 'Băng', thunder: 'Sét', fire: 'Lửa', water: 'Nước', holy: 'Thánh' };
const ELI = { ice: '❄', thunder: '⚡', fire: '🔥', water: '💧', holy: '✦' };
// three skills per class: unlock at Lv 1 / 10 / 25
const SKILLS = {
  thunder: [{ id: 'bolts', name: 'Lôi Phạt Thiên Giáng', el: 'thunder', lv: 1, cdk: 2, mpP: 0.03, mult: 0.75, act: '5 tia sét giáng xuống cụm quái, mỗi tia 75% ST, gây Tê liệt.' },
    { id: 'storm', name: 'Bão Sấm Tụ Thủy', el: 'thunder', lv: 10, cdk: 5, mpP: 0.06, mult: 0.5, act: 'Mây bão 2 giây: làm Ướt quái trong vùng, giáng sét 50% ST mỗi nhịp.' },
    { id: 'spinbolt', name: 'Lôi Long Xoáy', el: 'thunder', lv: 25, cdk: 2.5, mpP: 0.05, mult: 1.3, act: 'Xoáy sét quanh thân: 130% ST mọi quái gần, gây Tê liệt.' }],
  fire: [{ id: 'flamewave', name: 'Hỏa Long Trảm', el: 'fire', lv: 1, cdk: 1.5, mpP: 0.03, mult: 1.2, act: 'Sóng lửa xuyên thẳng hàng, 120% ST, Thiêu đốt.' },
    { id: 'meteor', name: 'Thiên Hỏa Lưu Tinh', el: 'fire', lv: 10, cdk: 4, mpP: 0.08, mult: 2.4, act: 'Thiên thạch rơi nổ 240% ST diện rộng, để lại biển lửa 2 giây.' },
    { id: 'firespin', name: 'Lốc Hỏa Kiếm', el: 'fire', lv: 25, cdk: 2.5, mpP: 0.05, mult: 1.4, act: 'Xoay đại kiếm lửa: 140% ST mọi quái gần, Thiêu đốt.' }],
  ice: [{ id: 'blizzard', name: 'Băng Phong Bạo', el: 'ice', lv: 1, cdk: 4, mpP: 0.06, mult: 0.4, act: 'Bão tuyết 2 giây: 40% ST mỗi nhịp, làm chậm, có thể Đóng băng.' },
    { id: 'icepillars', name: 'Vạn Băng Trụ', el: 'ice', lv: 10, cdk: 3, mpP: 0.06, mult: 1.3, act: 'Trụ băng trồi lên dưới tối đa 8 quái: 130% ST, Đóng băng 1.6 giây.' },
    { id: 'icefan', name: 'Băng Tiễn Liên Hoàn', el: 'ice', lv: 25, cdk: 2, mpP: 0.04, mult: 0.6, act: 'Bắn quạt 7 băng tiễn, mỗi mũi 60% ST, làm chậm.' }],
  elf: [{ id: 'arrowrain', name: 'Thủy Tiễn Vũ', el: 'water', lv: 1, cdk: 3, mpP: 0.05, mult: 0.4, act: 'Mưa 14 mũi tên nước, mỗi mũi 40% ST, làm Ướt.' },
    { id: 'pierce', name: 'Phá Lãng Tiễn', el: 'water', lv: 10, cdk: 2, mpP: 0.04, mult: 1.6, act: 'Mũi tên sóng xuyên thẳng hàng: 160% ST, đẩy lùi, làm Ướt.' },
    { id: 'arrowfan', name: 'Tiễn Bạo', el: 'water', lv: 25, cdk: 1.5, mpP: 0.03, mult: 0.7, act: 'Bắn quạt 5 mũi tên, mỗi mũi 70% ST.' }],
  holy: [{ id: 'tide', name: 'Thánh Thủy Triều', el: 'water', lv: 1, cdk: 2, mpP: 0.04, mult: 0.8, act: 'Vòng thủy triều lan rộng: 80% ST, đẩy lùi mạnh, làm Ướt.' },
    { id: 'judg', name: 'Thánh Hỏa Phán Xét', el: 'fire', lv: 10, cdk: 4, mpP: 0.06, mult: 0.5, act: 'Cột thánh hỏa giáng lên quái máu cao nhất: 6 nhịp × 50% ST, Thiêu đốt.' },
    { id: 'blessing', name: 'Thánh Quang Hộ Thể', el: 'holy', lv: 25, cdk: 8, mpP: 0.08, mult: 1.2, act: 'Hồi 10% máu tối đa và phát nổ 120% ST quanh thân.' }]
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
const DROP = { e: 0.06, c: 0.025, p: 0.016, d: 0.008, t: 0.0015, x: 0.0002, f: 0.012 };
const FORGE = [['c', 'p'], ['p', 'd'], ['d', 't'], ['t', 'x']];
// wings crafted from feathers
const WINGM = [1, 1.3, 1.5, 1.8, 2.2, 2.5], WCOST = [5, 10, 18, 30, 50], WNAME = ['Chưa có', 'Cánh Thần I', 'Cánh Thần II', 'Cánh Thần III', 'Cánh Thần IV', 'Cánh Thần V'], WMAX = 5;
const WDEF = [0, 6, 14, 26, 42, 64], WHP = [0, 60, 150, 300, 520, 800];

// gear
const SLOTS = { weapon: { n: 'Vũ khí', base: { atk: 12 } }, helm: { n: 'Mũ', base: { def: 4, hp: 30 } }, armor: { n: 'Giáp', base: { def: 8, hp: 60 } }, ring: { n: 'Nhẫn', base: { hp: 40, crit: 2 } }, pendant: { n: 'Dây chuyền', base: { hp: 25 } } };
const SLOT_ORDER = ['weapon', 'helm', 'armor', 'ring', 'pendant'];
const AS_SLOTS = ['weapon', 'pendant']; // attack speed rolls only on the key items
const ASR = [1, 1.15, 1.3, 1.45]; // attack-speed multiplier by rarity
const STAT_N = { atk: 'Tấn công', def: 'Phòng thủ', hp: 'Máu', crit: 'Chí mạng %', as: 'Tốc đánh' };
const RARITY = [{ n: 'Thường', c: 0xe9f1f2, css: '#e9f1f2' }, { n: 'Hiếm', c: 0x5fb4ff, css: '#5fb4ff' }, { n: 'Sử thi', c: 0xc58bff, css: '#c58bff' }, { n: 'Huyền thoại', c: 0xffb347, css: '#ffb347' }];
const RMULT = [1, 1.45, 2.1, 3];
const SETS = {
  song: { n: 'Bộ Sóng Bạc', col: '#9fe8ff', names: { weapon: 'Kích Sóng Bạc', helm: 'Mũ Sóng Bạc', armor: 'Giáp Sóng Bạc', ring: 'Nhẫn Sóng Bạc' }, b2: { atkP: 0.08 }, b4: { hpP: 0.15, dmgP: 0.1 }, d2: '+8% tấn công', d4: '+15% máu, +10% sát thương' },
  vay: { n: 'Bộ Vảy Rồng Biển', col: '#7dffb0', names: { weapon: 'Kiếm Vảy Rồng', helm: 'Mũ Vảy Rồng', armor: 'Giáp Vảy Rồng', ring: 'Nhẫn Vảy Rồng' }, b2: { crit: 5 }, b4: { atkP: 0.15, dmgP: 0.15 }, d2: '+5% chí mạng', d4: '+15% tấn công, +15% sát thương' },
  dung: { n: 'Bộ Dung Nham', col: '#ffa060', names: { weapon: 'Đại Kiếm Dung Nham', helm: 'Mũ Dung Nham', armor: 'Giáp Dung Nham', ring: 'Nhẫn Dung Nham' }, b2: { defP: 0.2 }, b4: { atkP: 0.2, dmgP: 0.25, hpP: 0.1 }, d2: '+20% phòng thủ', d4: '+20% tấn công, +25% sát thương, +10% máu' }
};
const PLAIN = { weapon: ['Kiếm Hải Lam', 'Kích San Hô', 'Thương Triều Dâng'], helm: ['Mũ Ngọc Trai', 'Mũ Vỏ Ốc Bạc'], armor: ['Giáp Lân Quang', 'Giáp Vỏ Sò'], ring: ['Nhẫn Bọt Biển', 'Nhẫn Lân Quang'], pendant: ['Dây Chuyền Ngọc Trai', 'Mặt Dây Lân Quang', 'Bùa Triều Cường'] };

// monsters: only the template's luminous jelly and spiked fish, recoloured per sea
const MT = {
  jelly: { name: 'Sứa Lân Quang', model: 'jelly', hp: 60, atk: 1.0, exp: 14, speed: 0.9, size: 0.5, y: 0.95, color: '#d7b6ff', pal: {} },
  jellyBlue: { name: 'Sứa Lam Băng', model: 'jelly', hp: 80, atk: 1.1, exp: 18, speed: 1.0, size: 0.55, y: 1.0, color: '#9fe8ff', pal: { h1: 0.55, h2: 0.48 } },
  fish: { name: 'Cá Gai Hỏa', model: 'fish', hp: 95, atk: 1.15, exp: 20, speed: 1.4, size: 0.65, y: 0.45, color: '#ffc89a', pal: {} },
  fishNight: { name: 'Cá Gai Đêm', model: 'fish', hp: 120, atk: 1.2, exp: 24, speed: 1.5, size: 0.7, y: 0.45, color: '#a8c8ff', pal: { back: 0x0e1a3a, belly: 0x3a6aff, stripe: 0x9fe8ff, fin: 0x5a8aff, finE: 0x1a3aff, rim: 0x9fe8ff, eye: 0x9ff4ff } },
  jellyGreen: { name: 'Sứa Tảo Lục', model: 'jelly', hp: 90, atk: 1.3, exp: 22, speed: 1.0, size: 0.55, y: 1.0, color: '#b0ffb0', pal: { h1: 0.33, h2: 0.45 } },
  fishMoss: { name: 'Cá Gai Rêu', model: 'fish', hp: 120, atk: 1.25, exp: 24, speed: 1.5, size: 0.7, y: 0.45, color: '#c8ff9a', pal: { back: 0x14301a, belly: 0x6ad84a, stripe: 0xd8ff8a, fin: 0x8ae05a, finE: 0x2a8a1a, rim: 0xd8ffb0, eye: 0xd8ff6a } },
  jellyAmber: { name: 'Sứa Hổ Phách', model: 'jelly', hp: 140, atk: 1.4, exp: 34, speed: 1.0, size: 0.62, y: 1.05, color: '#ffd28a', pal: { h1: 0.1, h2: 0.14 } },
  fishGold: { name: 'Cá Gai Hoàng Kim', model: 'fish', hp: 180, atk: 1.4, exp: 36, speed: 1.4, size: 0.78, y: 0.5, color: '#ffe08a', pal: { back: 0x3a2a08, belly: 0xffc83a, stripe: 0xfff0a0, fin: 0xffd84a, finE: 0xc88a0a, rim: 0xfff4c0 } },
  jellyRed: { name: 'Sứa Hỏa Ngục', model: 'jelly', hp: 200, atk: 1.6, exp: 44, speed: 1.0, size: 0.6, y: 1.0, color: '#ffa08a', pal: { h1: 0.0, h2: 0.08 } },
  fishLava: { name: 'Cá Gai Dung Nham', model: 'fish', hp: 240, atk: 1.7, exp: 48, speed: 1.6, size: 0.75, y: 0.45, color: '#ffa060', pal: { back: 0x1a0606, belly: 0xff4a0a, stripe: 0xffb03a, fin: 0xff5a1a, finE: 0xff2a00, rim: 0xffc080, eye: 0xffe04a } },
  jellyAsh: { name: 'Sứa Tro Tàn', model: 'jelly', hp: 300, atk: 1.8, exp: 58, speed: 1.1, size: 0.66, y: 1.05, color: '#e0a8ff', pal: { h1: 0.92, h2: 0.06, l2: 0.55 } },
  fishBlack: { name: 'Cá Gai Hắc Diệm', model: 'fish', hp: 360, atk: 1.9, exp: 64, speed: 1.6, size: 0.82, y: 0.5, color: '#ff8aa0', pal: { back: 0x0a0408, belly: 0x5a0a2a, stripe: 0xff3a6a, fin: 0x8a1a3a, finE: 0xff1a4a, rim: 0xff8ab0, eye: 0xff3a6a } },
  bossJelly: { name: 'Sứa Mẫu Hậu', model: 'jelly', hp: 60, atk: 1.0, exp: 14, speed: 0.9, size: 1.5, y: 1.6, color: '#ffb0f0', boss: true, pal: { h1: 0.86, h2: 0.55, crown: true } },
  bossFish: { name: 'Cá Gai Lục Vương', model: 'fish', hp: 90, atk: 1.3, exp: 22, speed: 1.1, size: 2.0, y: 0.9, color: '#c8ff9a', boss: true, pal: { back: 0x0e2a14, belly: 0x5ad84a, stripe: 0xffe08a, fin: 0xffc84a, finE: 0xc88a0a, rim: 0xfff0b0, eye: 0xff3a3a, crown: true } },
  bossLava: { name: 'Sứa Hỏa Vương', model: 'jelly', hp: 320, atk: 1.6, exp: 48, speed: 0.9, size: 1.7, y: 1.7, color: '#ffb080', boss: true, pal: { h1: 0.02, h2: 0.12, crown: true, gem: 0xffd23a } }
};
// each sea uses the template's seabed, coral, rocks, kelp and gate, with its own palette
const MAPS = [
  { name: 'Bãi San Hô Lân Quang', req: 1, lo: 1, hi: 220, set: 'song',
    pal: { sa: [0.045, 0.13, 0.15], sb: [0.17, 0.30, 0.29], pt: [0.03, 0.10, 0.13], ca: [0.25, 0.75, 0.85], fog: 0x06262e, bg: 0x072c35, rock: [0x4fae94, 0x1f5d63, 0x0b2a33, 0x9ff2d8], weed: [0x2f9e6e, 0x4fc48a, 0x1f7a6a, 0x7ad19a, 0x3fb3a0], weedH: 1, weedE: 0x0c3d2a, stone: 0x5f8f99, rune: 0x6fe7ff, portal: [0x0d5a99, 0x66f2ff],
      coral: [[0xff4f9a, 0xffb0e0], [0x9a5bff, 0xd8b8ff], [0xff7a3d, 0xffd08a], [0x3fd1c8, 0xb8fff4]], sponge: [0xffb43d, 0xff6a5a, 0xc8ff6a], fan: [0xff5fa8, 0xb07bff, 0xffa34d], mote: [0x7fdcef, 0xbff4ff] },
    zones: [{ k: 'jelly', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'fish', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'jellyBlue', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'fishNight', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossJelly', x: 0, z: -12.5, off: 8, respawn: 180 } },
  { name: 'Rừng Tảo U Linh', req: 120, lo: 110, hi: 520, set: 'vay',
    pal: { sa: [0.035, 0.12, 0.08], sb: [0.13, 0.27, 0.17], pt: [0.02, 0.08, 0.05], ca: [0.35, 0.85, 0.5], fog: 0x062418, bg: 0x072c1e, rock: [0x6fbf7c, 0x24603a, 0x0a2a16, 0xc8ffc0], weed: [0x2fae5a, 0x4fd47a, 0x1f8a4a, 0x8ae07a, 0x3fc38a], weedH: 1.5, weedE: 0x0c4a1a, stone: 0x6a9a7a, rune: 0x7dff9a, portal: [0x0d7a3a, 0x9affb0],
      coral: [[0x3fd1c8, 0xb8fff4], [0xb0ff5a, 0xf4ffc0], [0x6aff8a, 0xd8ffb0], [0xffd23a, 0xfff0a0]], sponge: [0xc8ff6a, 0xffd23a, 0x6affc8], fan: [0x6aff8a, 0x3fd1c8, 0xd8ff6a], mote: [0x9fffb8, 0xd8ffe0] },
    zones: [{ k: 'jellyGreen', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'fishMoss', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'jellyAmber', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'fishGold', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossFish', x: 0, z: -12.5, off: 8, respawn: 210 } },
  { name: 'Hố Thẳm Dung Nham', req: 350, lo: 330, hi: 800, set: 'dung',
    pal: { sa: [0.09, 0.04, 0.04], sb: [0.24, 0.12, 0.09], pt: [0.05, 0.02, 0.02], ca: [0.9, 0.42, 0.18], fog: 0x1e0c0a, bg: 0x241010, rock: [0xa0604a, 0x4a2a24, 0x160a08, 0xffb07a], weed: [0x8a2a1a, 0xc8401a, 0x5a1a10, 0xe0603a], weedH: 0.8, weedE: 0x4a0a00, stone: 0x6a4a44, rune: 0xff8a3a, portal: [0x8a1a04, 0xffb05a],
      coral: [[0xff4a1a, 0xffd08a], [0xff7a3d, 0xfff0a0], [0xd02a4a, 0xffa0b0], [0xffb43d, 0xfff4c0]], sponge: [0xff6a3a, 0xffb43d, 0xd02a4a], fan: [0xff5a2a, 0xffa34d, 0xff3a6a], mote: [0xffa070, 0xffd8b0] },
    zones: [{ k: 'jellyRed', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'fishLava', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'jellyAsh', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'fishBlack', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossLava', x: 0, z: -12.5, off: 8, respawn: 240 } }
];

// formulas ---------------------------------------------------------------
// Levels: cap 800. Time per level grows exponentially so that, at the reference
// kill rate, level 400 takes ~1 hour and level 800 ~12 hours of play.
const MAXLV = 800;
const LVT_A = 2.158, LVT_B = Math.log(11) / 400;             // seconds per level = A·e^(B·L)
const lvSeconds = L => LVT_A * Math.exp(LVT_B * L);
const lvHours = L => LVT_A * (Math.exp(LVT_B * L) - 1) / LVT_B / 3600; // cumulative play time to reach L
// Attack speed: points (AS) raise attacks/second from the class base towards the 15/s cap.
const APS_MAX = 15, AS_MAX = 400;
const apsOf = (base, as) => Math.min(APS_MAX, base + (APS_MAX - base) * Math.min(1, Math.max(0, as) / AS_MAX));
const asRef = L => Math.min(AS_MAX, 60 + 0.85 * L);           // roadmap: ~145 AS at Lv100 (half speed), 400 at Lv400 (max)
const apsRef = L => apsOf(3.2, asRef(L));
const killRef = L => 0.25 * apsRef(L);                        // reference kills per second used to size EXP
const mobExp = lv => 10 + 3 * lv;
const expNeed = lv => Math.round(lvSeconds(lv) * killRef(lv) * mobExp(lv));
const mobHp = lv => Math.round(60 * (1 + 0.3 * (lv - 1)) * (1 + lv / 250));
const mobAtk = lv => Math.round(16 + 2.4 * lv);
const DMG_SCALE = 0.3;                                         // every hero hit deals 30% of the old damage
const REC = { hpHit: 0.0025, mpHit: 0.005, hpKill: 0.01, mpKill: 0.015, hpCap: 0.05, mpCap: 0.12 }; // on-hit recovery, capped per second
// pets: follow the hero, pull loot in, give bonuses; the strongest ones also attack
const PETS = [
  { id: 'fish', n: 'Cá Lân Tinh', price: 1000, lv: 1, model: 'fish', size: 0.32, pal: { back: 0x0a3a4a, belly: 0x6fe7ff, stripe: 0xbff8ff, fin: 0x5fd8ff, finE: 0x1a8aff, rim: 0xbff8ff, eye: 0x9ff4ff }, loot: 4, exp: 0.05, gold: 0, as: 0, rec: 0, atk: 0, d: 'Hút đồ rơi trong 4m · +5% EXP' },
  { id: 'jelly', n: 'Sứa Ngọc Bích', price: 30000, lv: 60, model: 'jelly', size: 0.26, pal: { h1: 0.45, h2: 0.5 }, loot: 5, exp: 0.1, gold: 0.05, as: 15, rec: 0.01, atk: 0, d: 'Hút đồ 5m · +10% EXP · +5% vàng · +15 tốc đánh · +1%/giây giới hạn hồi máu' },
  { id: 'gold', n: 'Cá Gai Hoàng Kim', price: 250000, lv: 150, model: 'fish', size: 0.36, pal: { back: 0x3a2a08, belly: 0xffc83a, stripe: 0xfff0a0, fin: 0xffd84a, finE: 0xc88a0a, rim: 0xfff4c0, crown: true }, loot: 6, exp: 0.15, gold: 0.1, as: 25, rec: 0.01, atk: 0.15, d: 'Hút đồ 6m · +15% EXP · +10% vàng · +25 tốc đánh · tự bắn quái' },
  { id: 'flame', n: 'Sứa Thần Hỏa', price: 2000000, lv: 300, model: 'jelly', size: 0.3, pal: { h1: 0.02, h2: 0.12, crown: true, gem: 0xffd23a }, loot: 7, exp: 0.25, gold: 0.2, as: 40, rec: 0.02, atk: 0.3, d: 'Hút đồ 7m · +25% EXP · +20% vàng · +40 tốc đánh · +2%/giây hồi máu · bắn quái mạnh' }
];
// mounts: the hero rides them; faster movement and some defence
const MOUNTS = [
  { id: 'ray', n: 'Ó Biển Lam', price: 5000, lv: 20, model: 'ray', c1: 0x0b2a40, c2: 0x3fc8f0, spd: 0.35, defP: 0.05, hpP: 0, as: 0, d: '+35% tốc chạy · +5% phòng thủ' },
  { id: 'kinh', n: 'Cá Kình Bạc', price: 80000, lv: 120, model: 'fish', size: 1.25, pal: { back: 0x1a2a3a, belly: 0xd8e8f0, stripe: 0x9fe8ff, fin: 0x8ab8d8, finE: 0x3a6a9a, rim: 0xd8f4ff, eye: 0x9ff4ff }, spd: 0.5, defP: 0.08, hpP: 0.05, as: 0, d: '+50% tốc chạy · +8% phòng thủ · +5% máu' },
  { id: 'dragon', n: 'Ó Hoàng Kim', price: 1500000, lv: 280, model: 'ray', c1: 0x3a2404, c2: 0xe8b030, spd: 0.7, defP: 0.12, hpP: 0.1, as: 10, d: '+70% tốc chạy · +12% phòng thủ · +10% máu · +10 tốc đánh' }
];
const plusMult = p => 1 + p * 0.1 + p * p * 0.006;
const upRate = p => p < 6 ? 1 : [0.9, 0.8, 0.7, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3][p - 6];
const upCost = p => ({ stones: 1 + Math.floor(p / 3), gold: Math.round(80 * Math.pow(p + 1, 1.6)) });
const tier = p => p >= 13 ? 3 : p >= 10 ? 2 : p >= 7 ? 1 : 0;
const TIER_COL = [0x7fe9ff, 0x6fb8ff, 0xffc75a, 0xd28bff];
