
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
const SLOTS = { weapon: { n: 'Vũ khí', base: { atk: 12 } }, helm: { n: 'Mũ', base: { def: 4, hp: 30 } }, armor: { n: 'Giáp', base: { def: 8, hp: 60 } }, ring: { n: 'Nhẫn', base: { hp: 40, crit: 2 } }, pendant: { n: 'Dây chuyền', base: { hp: 25 } }, shield: { n: 'Khiên', base: { def: 10, hp: 45 } } };
const SLOT_ORDER = ['weapon', 'shield', 'helm', 'armor', 'ring', 'pendant'];
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
Object.assign(SETS, {
  sa: { n: 'Bộ Thần Ưng Sa Mạc', col: '#ffd27a', names: { weapon: 'Liềm Thần Ưng', helm: 'Mão Thần Ưng', armor: 'Giáp Thần Ưng', ring: 'Nhẫn Bọ Hung Thánh' }, b2: { atkP: 0.15 }, b4: { dmgP: 0.3, crit: 5 }, d2: '+15% tấn công', d4: '+30% sát thương, +5% chí mạng' },
  olym: { n: 'Bộ Lôi Thần Olympus', col: '#c8d8ff', names: { weapon: 'Lôi Trượng Olympus', helm: 'Mũ Lông Vũ Olympus', armor: 'Giáp Cẩm Thạch', ring: 'Nhẫn Nguyệt Quế' }, b2: { hpP: 0.2 }, b4: { atkP: 0.25, dmgP: 0.3 }, d2: '+20% máu', d4: '+25% tấn công, +30% sát thương' },
  ho: { n: 'Bộ Cửu Vĩ Hồ', col: '#ff9ad8', names: { weapon: 'Kiếm Cửu Vĩ', helm: 'Mặt Nạ Hồ Ly', armor: 'Áo Lụa Hồ Ly', ring: 'Nhẫn Hồ Hỏa' }, b2: { crit: 8 }, b4: { dmgP: 0.4, atkP: 0.2 }, d2: '+8% chí mạng', d4: '+40% sát thương, +20% tấn công' },
  dam: { n: 'Bộ Phù Thủy Đầm Lầy', col: '#9affb0', names: { weapon: 'Trượng Rễ Cổ', helm: 'Mũ Gạc Hươu', armor: 'Áo Rêu Phép', ring: 'Nhẫn Ma Trơi' }, b2: { defP: 0.3 }, b4: { hpP: 0.3, dmgP: 0.4 }, d2: '+30% phòng thủ', d4: '+30% máu, +40% sát thương' },
  bac: { n: 'Bộ Chiến Binh Phương Bắc', col: '#9fe8ff', names: { weapon: 'Rìu Sương Giá', helm: 'Mũ Sừng Bắc Âu', armor: 'Giáp Lông Sói', ring: 'Nhẫn Rune' }, b2: { atkP: 0.25 }, b4: { dmgP: 0.5, hpP: 0.2 }, d2: '+25% tấn công', d4: '+50% sát thương, +20% máu' },
  cuc: { n: 'Bộ Cực Quang', col: '#c0a8ff', names: { weapon: 'Thương Cực Quang', helm: 'Vương Miện Băng', armor: 'Giáp Pha Lê', ring: 'Nhẫn Cực Quang' }, b2: { crit: 10 }, b4: { atkP: 0.35, dmgP: 0.55 }, d2: '+10% chí mạng', d4: '+35% tấn công, +55% sát thương' },
  thien: { n: 'Bộ Thiên Đế', col: '#ffe08a', names: { weapon: 'Thiên Đế Kiếm', helm: 'Kim Quan Thiên Đế', armor: 'Long Bào Kim Giáp', ring: 'Nhẫn Nhật Nguyệt' }, b2: { atkP: 0.3, hpP: 0.2 }, b4: { dmgP: 0.8, crit: 10 }, d2: '+30% tấn công, +20% máu', d4: '+80% sát thương, +10% chí mạng' }
});
const PLAIN = { weapon: ['Kiếm Hải Lam', 'Kích San Hô', 'Thương Triều Dâng'], helm: ['Mũ Ngọc Trai', 'Mũ Vỏ Ốc Bạc'], armor: ['Giáp Lân Quang', 'Giáp Vỏ Sò'], ring: ['Nhẫn Bọt Biển', 'Nhẫn Lân Quang'], pendant: ['Dây Chuyền Ngọc Trai', 'Mặt Dây Lân Quang', 'Bùa Triều Cường'], shield: ['Khiên Vỏ Rùa Cổ', 'Khiên Hải Lam', 'Khiên Thánh Quang', 'Khiên Vảy Rồng'] };

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
for (const k in MT) { const T = MT[k]; T.hh = T.model === 'jelly' ? 0.3 : 0.1; T.lh = T.model === 'jelly' ? 1.0 : 0.85; }
// mythic monsters (built in e2_myth.js); y = hover height, hh = hit height, lh = label height (× scale)
const MY = (model, name, color, size, p, extra = {}) => Object.assign({ name, model, color, size, p, speed: 1.2,
  y: { serpent: 0.2, wraith: 0.15, golem: 0, bird: 1.3, scarab: 0, spirit: 1.1 }[model], hh: { serpent: 0.15, wraith: 1.0, golem: 1.0, bird: 0, scarab: 0.25, spirit: 0 }[model], lh: { serpent: 0.9, wraith: 1.75, golem: 2.1, bird: 0.7, scarab: 0.8, spirit: 0.65 }[model] }, extra);
Object.assign(MT, {
  // sea realms: a sea serpent and a fire spirit join the template creatures
  seaSerpent: MY('serpent', 'Hải Xà Rêu Biếc', '#9fffc0', 1, { body: 0x1f5a4a, belly: 0xb8e8a0, glow: 0x7dffb0, horn: 0xd8ffd0, segs: 11 }),
  fireSpirit: MY('spirit', 'Hỏa Linh Dung Nham', '#ffa060', 0.9, { glow: 0xff6a1a, core: 0xffd08a, flame: '#ff7a1a' }),
  // Egypt
  scarab: MY('scarab', 'Bọ Hung Thánh Giáp', '#ffd27a', 1, { shell: 0xb08a20, glow: 0x6fe7ff, gem: true }),
  mummy: MY('wraith', 'Xác Ướp Lang Thang', '#e8d8b0', 0.95, { robe: 0xd8c8a0, robe2: 0x8a7a5a, bands: true, glow: 0x6fe7ff, eye: 0x6fe7ff }),
  apep: MY('serpent', 'Rắn Cát Apep', '#ffb05a', 1, { body: 0x8a5a2a, belly: 0xf0d090, glow: 0xffa040, hood: 0xc87a2a, rear: true, segs: 10 }),
  sandGolem: MY('golem', 'Hộ Vệ Sa Thạch', '#ffd8a0', 0.9, { stone: 0xc8a06a, glow: 0x6fe7ff }),
  sphinx: MY('golem', 'Tượng Nhân Sư Thức Tỉnh', '#ffd27a', 1, { stone: 0xd8b070, glow: 0xffd23a, crown: true, halo: true }),
  bossApep: MY('serpent', 'Apophis Xà Thần Hỗn Mang', '#ff9a5a', 1, { body: 0x4a1a3a, belly: 0xffa060, glow: 0xff5a2a, hood: 0x8a2a4a, rear: true, crown: true, horn: 0xffd23a, segs: 12 }, { boss: true }),
  // Greece
  harpy: MY('bird', 'Harpy Cuồng Phong', '#d8a8ff', 1, { body: 0x5a3a7a, glow: 0xd8a8ff, w1: 0xfff0ff, w2: 0x8a3dff, w3: 0xd8a8ff }),
  cyclops: MY('golem', 'Khổng Lồ Một Mắt', '#f0e8d8', 0.95, { stone: 0xb8b0a0, glow: 0xffb04a, cyclops: true }),
  gorgon: MY('serpent', 'Rắn Tóc Gorgon', '#b0ff9a', 1, { body: 0x3a6a2a, belly: 0xd8c890, glow: 0xb0ff6a, mane: 0x6a8a3a, rear: true }),
  shade: MY('wraith', 'Vong Hồn Hades', '#9ab8ff', 1, { robe: 0x1a2a4a, robe2: 0x0a0a1a, glow: 0x6a9aff, eye: 0x9fd0ff }),
  griffin: MY('bird', 'Điểu Sư Hoàng Kim', '#ffe08a', 1, { body: 0xb08a3a, glow: 0xffe08a, w1: 0xfff8e0, w2: 0xd89a2a, w3: 0xffe08a, crown: true }),
  bossTitan: MY('golem', 'Titan Cẩm Thạch', '#fff0d0', 1, { stone: 0xc8c0b0, glow: 0xffd23a, crown: true, halo: true }, { boss: true }),
  // East Asia
  kitsune: MY('spirit', 'Hồ Hỏa Cửu Vĩ', '#8ad8ff', 0.9, { glow: 0x4ab0ff, core: 0xe8f8ff, flame: '#6ac8ff', orbs: 9 }),
  oni: MY('spirit', 'Mặt Quỷ Oni', '#ff8a6a', 1, { glow: 0xff4a1a, core: 0xffd08a, flame: '#ff5a1a', mask: 0xc8281a, orbs: 0 }),
  yurei: MY('wraith', 'Oán Linh Yūrei', '#e8f4ff', 1, { robe: 0xf0f4f8, robe2: 0x9ab0c8, glow: 0x9fe8ff, eye: 0x6fd8ff, hair: true }),
  jadeDragon: MY('serpent', 'Long Xà Ngọc Bích', '#7dffc8', 1, { body: 0x1a8a6a, belly: 0xf0e090, glow: 0x7dffc8, horn: 0xf0e0b0, whisk: true, mane: 0xffd23a, fly: true, segs: 12 }, { y: 1.0 }),
  tengu: MY('bird', 'Thiên Cẩu Tengu', '#ff8a8a', 1, { body: 0x1a1a1a, beak: 0xc8281a, glow: 0xff6a5a, w1: 0xffe0d8, w2: 0x2a0a0a, w3: 0xff6a5a, crown: true }),
  bossLong: MY('serpent', 'Thanh Long Thần Quân', '#7dd8ff', 1, { body: 0x1a5aa8, belly: 0xf0e8b0, glow: 0x7de8ff, horn: 0xffe08a, whisk: true, mane: 0xffffff, fly: true, crown: true, segs: 14 }, { boss: true, y: 1.1 }),
  // Slavic swamp
  wisp: MY('spirit', 'Ma Trơi Đầm Sâu', '#9affb0', 0.8, { glow: 0x5aff8a, core: 0xe0ffe8, flame: '#5aff8a', orbs: 2 }),
  leshy: MY('golem', 'Cây Ma Leshy', '#b0ff8a', 0.9, { stone: 0x4a3a28, glow: 0x9aff5a, wood: true, leaf: 0x3a6a2a }),
  bogBeetle: MY('scarab', 'Bọ Độc Đầm Lầy', '#b0ff6a', 1, { shell: 0x2a4a1a, glow: 0xb0ff4a }),
  rusalka: MY('wraith', 'Hồn Ma Rusalka', '#9affd8', 1, { robe: 0x2a5a4a, robe2: 0x0a1a14, glow: 0x6affb0, eye: 0x9affd8, hair: true }),
  zmey: MY('serpent', 'Rắn Thần Zmey', '#c8ff6a', 1, { body: 0x2a3a1a, belly: 0x8a9a5a, glow: 0xc8ff4a, horn: 0x8a8a6a, mane: 0x4a6a2a, crown: true }),
  bossLeshy: MY('golem', 'Leshy Cổ Thụ Vương', '#c8ff8a', 1, { stone: 0x3a2a1a, glow: 0xc8ff5a, wood: true, leaf: 0x4a8a2a, crown: true, horn: 0x6a5a3a }, { boss: true }),
  // Norse
  draugr: MY('wraith', 'Draugr Băng Giá', '#9fe8ff', 1, { robe: 0x3a4a5a, robe2: 0x1a2a3a, glow: 0x9fe8ff, eye: 0x6fd8ff, horn: 0xe8e0d0 }),
  jotunn: MY('golem', 'Jötunn Tuyết', '#dff4ff', 0.95, { stone: 0xb8c8d8, glow: 0x6fd8ff, crystal: 0xbff4ff }),
  raven: MY('bird', 'Quạ Thần Odin', '#b0b8ff', 1, { body: 0x101018, beak: 0x2a2a3a, glow: 0x8a9aff, w1: 0xd8e0ff, w2: 0x1a1a3a, w3: 0x8a9aff }),
  jorm: MY('serpent', 'Xà Con Jörmungandr', '#6affe8', 1, { body: 0x1a4a5a, belly: 0x9ad8c8, glow: 0x6affe8, horn: 0xd8f0f0, segs: 12 }),
  huginn: MY('bird', 'Huginn Tư Tưởng', '#d8e0ff', 1, { body: 0x18182a, beak: 0x3a3a5a, glow: 0xb0c0ff, w1: 0xffffff, w2: 0x3a3aaa, w3: 0xb0c0ff, crown: true }),
  bossYmir: MY('golem', 'Ymir Cự Nhân Băng', '#bff4ff', 1, { stone: 0xa8c0d8, glow: 0x6fe7ff, crystal: 0xbff4ff, crown: true, horn: 0xe8f0f8 }, { boss: true }),
  // Arctic
  auroraSp: MY('spirit', 'Tinh Linh Cực Quang', '#c0a8ff', 0.9, { glow: 0x9a6aff, core: 0xe8e0ff, flame: '#6affd8', orbs: 4 }),
  crystalBug: MY('scarab', 'Bọ Pha Lê', '#bff4ff', 1, { shell: 0x6ab8d8, glow: 0xbff4ff, gem: true }),
  iceDragon: MY('serpent', 'Băng Long', '#dff8ff', 1, { body: 0x8ab8d8, belly: 0xffffff, glow: 0xbff4ff, horn: 0xffffff, whisk: true, mane: 0xdff8ff, fly: true, segs: 12 }, { y: 1.0 }),
  snowBird: MY('bird', 'Tuyết Điểu', '#e8f8ff', 1, { body: 0xe8f0f8, beak: 0x9ab0c8, glow: 0xbff4ff, w1: 0xffffff, w2: 0x6ab8ff, w3: 0xbff4ff, trail: '#bff4ff' }),
  sedna: MY('wraith', 'Hồn Biển Băng Sedna', '#9fe8ff', 1, { robe: 0x2a5a7a, robe2: 0x0a1a2a, glow: 0x9fe8ff, eye: 0xbff4ff, hair: true, crown: true }),
  bossPhoenixIce: MY('bird', 'Băng Phượng Cực Bắc', '#dff8ff', 1, { body: 0xbfe0f8, beak: 0x6ab8ff, glow: 0x9fe8ff, w1: 0xffffff, w2: 0x3a8aff, w3: 0xbff4ff, trail: '#bff4ff', crown: true }, { boss: true, y: 1.6 }),
  // Heaven
  phoenix: MY('bird', 'Phượng Hoàng Lửa', '#ffb05a', 1, { body: 0xd8401a, beak: 0xffd23a, glow: 0xffa040, w1: 0xfff0b0, w2: 0xff4a0a, w3: 0xffc84a, trail: '#ff9a3a', tail: 0xff4a0a }),
  goldGuard: MY('golem', 'Thiên Binh Kim Giáp', '#ffe08a', 0.95, { stone: 0xd8a83a, glow: 0xfff0b0, metal: true, halo: true }),
  seraph: MY('spirit', 'Thiên Nhãn Seraph', '#ffe08a', 1, { glow: 0xffd86a, core: 0xffffff, flame: '#ffe08a', eye: 0x4ab0ff, orbs: 0 }),
  goldDragon: MY('serpent', 'Kim Long', '#ffd86a', 1, { body: 0xc8901a, belly: 0xfff0b0, glow: 0xffe08a, horn: 0xffffff, whisk: true, mane: 0xff6a3a, fly: true, segs: 13 }, { y: 1.0 }),
  fallen: MY('wraith', 'Thiên Sứ Sa Ngã', '#ffd8ff', 1, { robe: 0xf0e8f8, robe2: 0x5a3a6a, glow: 0xffd86a, eye: 0xff6aff, crown: true }),
  bossDe: MY('bird', 'Phượng Hoàng Thiên Đế', '#ffe08a', 1, { body: 0xffc83a, beak: 0xffffff, glow: 0xffe08a, w1: 0xffffff, w2: 0xff9a1a, w3: 0xffe08a, trail: '#ffd86a', tail: 0xff6a1a, crown: true }, { boss: true, y: 1.6 })
});
// each sea uses the template's seabed, coral, rocks, kelp and gate, with its own palette
const MAPS = [
  { name: 'Bãi San Hô Lân Quang', req: 1, lo: 1, hi: 90, set: 'song', env: 'sea', culture: 'Biển Sâu', mini: 'jellyBlue',
    pal: { sa: [0.045, 0.13, 0.15], sb: [0.17, 0.30, 0.29], pt: [0.03, 0.10, 0.13], ca: [0.25, 0.75, 0.85], fog: 0x06262e, bg: 0x072c35, rock: [0x4fae94, 0x1f5d63, 0x0b2a33, 0x9ff2d8], weed: [0x2f9e6e, 0x4fc48a, 0x1f7a6a, 0x7ad19a, 0x3fb3a0], weedH: 1, weedE: 0x0c3d2a, stone: 0x5f8f99, rune: 0x6fe7ff, portal: [0x0d5a99, 0x66f2ff],
      coral: [[0xff4f9a, 0xffb0e0], [0x9a5bff, 0xd8b8ff], [0xff7a3d, 0xffd08a], [0x3fd1c8, 0xb8fff4]], sponge: [0xffb43d, 0xff6a5a, 0xc8ff6a], fan: [0xff5fa8, 0xb07bff, 0xffa34d], mote: [0x7fdcef, 0xbff4ff] },
    zones: [{ k: 'jelly', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'fish', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'jellyBlue', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'fishNight', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossJelly', x: 0, z: -12.5, off: 8, respawn: 180 } },
  { name: 'Rừng Tảo U Linh', req: 1, lo: 70, hi: 170, set: 'vay', env: 'sea', culture: 'Biển Sâu', mini: 'seaSerpent',
    pal: { sa: [0.035, 0.12, 0.08], sb: [0.13, 0.27, 0.17], pt: [0.02, 0.08, 0.05], ca: [0.35, 0.85, 0.5], fog: 0x062418, bg: 0x072c1e, rock: [0x6fbf7c, 0x24603a, 0x0a2a16, 0xc8ffc0], weed: [0x2fae5a, 0x4fd47a, 0x1f8a4a, 0x8ae07a, 0x3fc38a], weedH: 1.5, weedE: 0x0c4a1a, stone: 0x6a9a7a, rune: 0x7dff9a, portal: [0x0d7a3a, 0x9affb0],
      coral: [[0x3fd1c8, 0xb8fff4], [0xb0ff5a, 0xf4ffc0], [0x6aff8a, 0xd8ffb0], [0xffd23a, 0xfff0a0]], sponge: [0xc8ff6a, 0xffd23a, 0x6affc8], fan: [0x6aff8a, 0x3fd1c8, 0xd8ff6a], mote: [0x9fffb8, 0xd8ffe0] },
    zones: [{ k: 'jellyGreen', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'fishMoss', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'seaSerpent', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'fishGold', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossFish', x: 0, z: -12.5, off: 8, respawn: 210 } },
  { name: 'Hố Thẳm Dung Nham', req: 1, lo: 150, hi: 250, set: 'dung', env: 'sea', culture: 'Biển Lửa', mini: 'fireSpirit',
    pal: { sa: [0.09, 0.04, 0.04], sb: [0.24, 0.12, 0.09], pt: [0.05, 0.02, 0.02], ca: [0.9, 0.42, 0.18], fog: 0x1e0c0a, bg: 0x241010, rock: [0xa0604a, 0x4a2a24, 0x160a08, 0xffb07a], weed: [0x8a2a1a, 0xc8401a, 0x5a1a10, 0xe0603a], weedH: 0.8, weedE: 0x4a0a00, stone: 0x6a4a44, rune: 0xff8a3a, portal: [0x8a1a04, 0xffb05a],
      coral: [[0xff4a1a, 0xffd08a], [0xff7a3d, 0xfff0a0], [0xd02a4a, 0xffa0b0], [0xffb43d, 0xfff4c0]], sponge: [0xff6a3a, 0xffb43d, 0xd02a4a], fan: [0xff5a2a, 0xffa34d, 0xff3a6a], mote: [0xffa070, 0xffd8b0] },
    zones: [{ k: 'jellyRed', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'fishLava', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'fireSpirit', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'fishBlack', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossLava', x: 0, z: -12.5, off: 8, respawn: 240 } },
  { name: 'Sa Mạc Hoàng Kim', culture: 'Ai Cập', req: 1, lo: 230, hi: 330, set: 'sa', env: 'desert', exposure: 0.78, mini: 'sphinx',
    pal: { sa: [0.154, 0.105, 0.055], sb: [0.242, 0.176, 0.094], pt: [0.187, 0.127, 0.066], ca: [0.06, 0.05, 0.03], fog: 0x8a6a4a, bg: 0xa08060, fogD: 0.011, rock: [0xd8b07a, 0x8a6a3a, 0x4a3420, 0xffe0a0], weed: [0x8a9a3a, 0xa0a848, 0x6a7a2a], weedH: 0.5, weedE: 0x2a2a0a, stone: 0xc8a46a, rune: 0x6fe7ff, portal: [0x0d5a99, 0x66f2ff], coral: [[0x8a9a3a, 0xc8d070]], sponge: [0xc8a050], fan: [0xa0a040], mote: [0xffe0a0, 0xfff0d0], moteRise: [0.15, 0.4], hemi: [0xfff0d8, 0x6a4a2a, 1.1], sun: [0xfff0c8, 2.2], light: 0xffc87a, shaft: [0.3, 0.24, 0.12], spk: 0.6 },
    zones: [{ k: 'scarab', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'mummy', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'apep', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'sandGolem', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossApep', x: 0, z: -12.5, off: 8, respawn: 210 } },
  { name: 'Thánh Địa Olympus', culture: 'Hy Lạp', req: 1, lo: 310, hi: 410, set: 'olym', env: 'olympus', exposure: 0.68, mini: 'griffin',
    pal: { sa: [0.121, 0.132, 0.094], sb: [0.198, 0.209, 0.160], pt: [0.099, 0.143, 0.066], ca: [0.05, 0.06, 0.05], fog: 0x6a8098, bg: 0x7a90a8, fogD: 0.012, rock: [0xd8d4c8, 0x8a8a80, 0x4a4a44, 0xffffff], weed: [0x6a8a3a, 0x8aa050], weedH: 0.5, weedE: 0x1a2a0a, stone: 0xe8e4d8, rune: 0xffd86a, portal: [0x8a6a10, 0xffe8a0], coral: [[0x6a8a3a, 0xb0c880]], sponge: [0x8a9a5a], fan: [0x8aa050], mote: [0xfff0c8, 0xffffff], moteRise: [0.2, 0.6], hemi: [0xe8f4ff, 0x4a5a3a, 1.15], sun: [0xfff4e0, 2.3], light: 0xffe0a0, shaft: [0.3, 0.28, 0.2], spk: 0.2 },
    zones: [{ k: 'harpy', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'cyclops', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'gorgon', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'shade', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossTitan', x: 0, z: -12.5, off: 8, respawn: 210 } },
  { name: 'Rừng Trúc Linh Hồ', culture: 'Đông Á', req: 1, lo: 390, hi: 490, set: 'ho', env: 'bamboo', exposure: 0.9, mini: 'tengu',
    pal: { sa: [0.088, 0.132, 0.066], sb: [0.165, 0.209, 0.110], pt: [0.231, 0.165, 0.176], ca: [0.04, 0.06, 0.03], fog: 0x5a7a6a, bg: 0x6a8a7a, fogD: 0.03, rock: [0x8a9a8a, 0x4a5a4a, 0x2a3a2a, 0xd8f0d8], weed: [0x4a8a3a, 0x6aaa4a], weedH: 0.6, weedE: 0x0a2a0a, stone: 0x7a8a7a, rune: 0xff8ab0, portal: [0x8a1a4a, 0xffa8d8], coral: [[0x4a8a3a, 0xa0d070]], sponge: [0x6a9a4a], fan: [0x6aaa4a], mote: [0xffb8d8, 0xffffff], moteRise: [-0.25, 0.5], hemi: [0xd8fff0, 0x2a4a2a, 1.5], sun: [0xfff0e0, 2.4], light: 0xffb8d8, shaft: [0.2, 0.26, 0.2], spk: 0.0 },
    zones: [{ k: 'kitsune', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'oni', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'yurei', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'jadeDragon', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossLong', x: 0, z: -12.5, off: 8, respawn: 210 } },
  { name: 'Đầm Lầy U Minh', culture: 'Đông Âu', req: 1, lo: 470, hi: 570, set: 'dam', env: 'swamp', exposure: 1.0, mini: 'zmey',
    pal: { sa: [0.044, 0.055, 0.039], sb: [0.088, 0.105, 0.066], pt: [0.028, 0.066, 0.055], ca: [0.08, 0.16, 0.08], fog: 0x1a2a22, bg: 0x1a2a24, fogD: 0.04, rock: [0x5a6a50, 0x2a3424, 0x10140c, 0x9ab080], weed: [0x4a5a2a, 0x6a7a3a, 0x3a4a1a], weedH: 0.7, weedE: 0x0a1a00, stone: 0x4a5a48, rune: 0x7dff9a, portal: [0x0d5a2a, 0x9affb0], coral: [[0x4a5a2a, 0x8a9a5a]], sponge: [0x5a6a3a], fan: [0x4a5a2a], mote: [0x9affb0, 0xd8ffe0], moteRise: [0.1, 0.3], hemi: [0x9ab8a0, 0x10180c, 1.2], sun: [0xb0d0b8, 1.6], light: 0x7dff9a, shaft: [0.1, 0.16, 0.1], spk: 0.0 },
    zones: [{ k: 'wisp', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'leshy', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'bogBeetle', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'rusalka', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossLeshy', x: 0, z: -12.5, off: 8, respawn: 210 } },
  { name: 'Băng Nguyên Bắc Âu', culture: 'Bắc Âu', req: 1, lo: 550, hi: 650, set: 'bac', env: 'snow', exposure: 0.78, mini: 'huginn',
    pal: { sa: [0.198, 0.226, 0.259], sb: [0.286, 0.319, 0.352], pt: [0.165, 0.198, 0.242], ca: [0.03, 0.04, 0.05], fog: 0x4a5a78, bg: 0x1a2a44, fogD: 0.016, rock: [0xe8f0f8, 0x8a98a8, 0x4a5464, 0xffffff], weed: [0x9ab0a0], weedH: 0.4, weedE: 0x1a2a2a, stone: 0x6a7888, rune: 0x6fe7ff, portal: [0x0d4a99, 0x9ff2ff], coral: [[0x9ab0c0, 0xffffff]], sponge: [0xc8d8e8], fan: [0xb0c0d0], mote: [0xffffff, 0xe8f4ff], moteRise: [-0.7, -1.1], hemi: [0xdff0ff, 0x3a4a5a, 1.15], sun: [0xe8f4ff, 2.0], light: 0x9fe8ff, shaft: [0.12, 0.18, 0.3], spk: 1.0 },
    zones: [{ k: 'draugr', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'jotunn', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'raven', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'jorm', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossYmir', x: 0, z: -12.5, off: 8, respawn: 210 } },
  { name: 'Cực Băng Vĩnh Hằng', culture: 'Bắc Cực', req: 1, lo: 630, hi: 730, set: 'cuc', env: 'ice', exposure: 0.82, mini: 'sedna',
    pal: { sa: [0.132, 0.187, 0.242], sb: [0.231, 0.297, 0.352], pt: [0.088, 0.143, 0.209], ca: [0.1, 0.16, 0.22], fog: 0x2a4a6a, bg: 0x0a1430, fogD: 0.02, rock: [0xbff4ff, 0x6a9ab8, 0x2a4a68, 0xffffff], weed: [0x9ad8f0], weedH: 0.4, weedE: 0x1a3a5a, stone: 0x6a8aa8, rune: 0xc0a8ff, portal: [0x4a2a99, 0xd0b8ff], coral: [[0x9ad8f0, 0xffffff]], sponge: [0xbff4ff], fan: [0x9ad8f0], mote: [0xdff8ff, 0xc0a8ff], moteRise: [-0.4, 0.5], hemi: [0xc8e8ff, 0x1a2a4a, 1.5], sun: [0xd8f0ff, 2.2], light: 0xc0a8ff, shaft: [0.14, 0.2, 0.34], spk: 1.4 },
    zones: [{ k: 'auroraSp', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'crystalBug', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'iceDragon', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'snowBird', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossPhoenixIce', x: 0, z: -12.5, off: 8, respawn: 210 } },
  { name: 'Thiên Giới Kim Quang', culture: 'Thiên Giới', req: 1, lo: 710, hi: 800, set: 'thien', env: 'heaven', exposure: 0.66, mini: 'fallen',
    pal: { sa: [0.231, 0.209, 0.171], sb: [0.308, 0.286, 0.237], pt: [0.275, 0.226, 0.132], ca: [0.16, 0.12, 0.05], fog: 0xb89a70, bg: 0xc8aa80, fogD: 0.012, rock: [0xf0e8d8, 0xb8a888, 0x6a5a48, 0xffffff], weed: [0xd8c070], weedH: 0.4, weedE: 0x3a2a0a, stone: 0xf0e8d8, rune: 0xffd86a, portal: [0x8a5a10, 0xfff0a0], coral: [[0xffd86a, 0xffffff]], sponge: [0xffe8a0], fan: [0xffd86a], mote: [0xffe08a, 0xffffff], moteRise: [0.3, 0.8], hemi: [0xfff8e8, 0x8a6a40, 1.05], sun: [0xfff4d8, 2.1], light: 0xffd86a, shaft: [0.36, 0.3, 0.16], spk: 0.5 },
    zones: [{ k: 'phoenix', x: -5, z: 5, r: 4.5, n: 10, off: -3, hk: 0.85 }, { k: 'goldGuard', x: 9, z: -1, r: 4.5, n: 10, off: 0, hk: 1 }, { k: 'seraph', x: 7, z: -8.5, r: 5, n: 10, off: 3, hk: 1.15 }, { k: 'goldDragon', x: -8, z: -8, r: 5, n: 10, off: 6, hk: 1.3 }],
    boss: { k: 'bossDe', x: 0, z: -12.5, off: 8, respawn: 210 } }
];

// the hub: an ancient Greek city with no monsters, NPCs, and resting bots
MAPS.push({ name: 'Thành Cổ Hy Lạp', culture: 'Thành chính', town: true, req: 1, lo: 1, hi: 1, env: 'town', exposure: 0.8, zones: [], boss: null, mini: null, set: 'song',
  pal: { sa: [0.2, 0.18, 0.14], sb: [0.3, 0.27, 0.21], pt: [0.24, 0.2, 0.15], ca: [0.03, 0.03, 0.02], fog: 0x6a7888, bg: 0x7a8aa0, fogD: 0.012, rock: [0xd8d0c0, 0x8a8478, 0x4a4640, 0xffffff], weed: [0x6a8a3a, 0x8aa050], weedH: 0.5, weedE: 0x1a2a0a, stone: 0xd8d0c0, rune: 0xffd86a, portal: [0x8a6a10, 0xffe8a0], coral: [[0x6a8a3a, 0xb0c880]], sponge: [0x8a9a5a], fan: [0x8aa050], mote: [0xfff0c8, 0xffffff], moteRise: [0.15, 0.5], hemi: [0xe8f4ff, 0x5a5a4a, 1.15], sun: [0xfff4e0, 2.3], light: 0xffe0a0, shaft: [0.26, 0.24, 0.18], spk: 0.1 } });
const TOWN = MAPS.length - 1;
// charms: carried in the bag, each gives +1% of one stat; super rare (1% per kill)
const CHARMS = { dmg: { n: 'Bùa Chiến Thần', d: '+1% sát thương', col: '#ff7a5a', pv: 1 }, hp: { n: 'Bùa Sinh Mệnh', d: '+1% máu tối đa', col: '#7dff9a', pv: 1 }, mp: { n: 'Bùa Linh Lực', d: '+1% mana tối đa', col: '#5ab0ff', pv: 1 },
  soul: { n: 'Soul of Ancient', d: '+1% sát thương và giảm 0,3% sát thương quái gây ra (tối đa 100 viên: +100% / −30%) · chỉ rơi từ boss', col: '#e0b0ff', pv: 15 } };
const SOUL_RATE = 0.12; // per main-boss kill
const CHARM_RATE = 0.01;
function makeCharm(kind, lv) { return { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), slot: 'charm', charm: kind, r: 3, lv, name: CHARMS[kind].n, base: {}, plus: 0, set: null }; }

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
// late-game difficulty doubles from Lv100 to Lv400 and stays ×2 above
const hardK = lv => 1 + clamp((lv - 100) / 300, 0, 1);
const mobHp = lv => Math.round(60 * (1 + 0.3 * (lv - 1)) * (1 + lv / 180) * hardK(lv));
const mobAtk = lv => Math.round((16 + 2.4 * lv + lv * lv / 400) * hardK(lv));
// level suppression: fighting monsters above your level hurts both ways
const lvDealK = gap => gap > 0 ? 1 / (1 + gap * 0.012) : 1;   // your damage to a higher-level monster
const lvTakeK = gap => 1 + Math.max(0, gap) * 0.012;           // its damage to you
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
  { id: 'dragon', n: 'Ó Hoàng Kim', price: 1500000, lv: 280, model: 'ray', c1: 0x3a2404, c2: 0xe8b030, spd: 0.7, defP: 0.12, hpP: 0.1, as: 10, d: '+70% tốc chạy · +12% phòng thủ · +10% máu · +10 tốc đánh' },
  { id: 'kylan', n: 'Thần Thú Kỳ Lân', price: 6000000, lv: 380, model: 'unicorn', spd: 0.9, defP: 0.18, hpP: 0.15, as: 25, d: '+90% tốc chạy · +18% phòng thủ · +15% máu · +25 tốc đánh · sừng thần và bờm cầu vồng' }
];
const plusMult = p => 1 + p * 0.1 + p * p * 0.006;
const upRate = p => p < 6 ? 1 : [0.9, 0.8, 0.7, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3][p - 6];
const upCost = p => ({ stones: 1 + Math.floor(p / 3), gold: Math.round(80 * Math.pow(p + 1, 1.6)) });
const tier = p => p >= 13 ? 3 : p >= 10 ? 2 : p >= 7 ? 1 : 0;
const TIER_COL = [0x7fe9ff, 0x6fb8ff, 0xffc75a, 0xd28bff];
