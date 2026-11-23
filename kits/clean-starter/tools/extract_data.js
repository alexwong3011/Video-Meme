// Pull the game's data tables out of engine/index.html into data/*.json, so a new project (or another engine) can reuse them.
// usage: node tools/extract_data.js            (run from the kit folder)
// Each table is the literal after "const NAME =" in the engine, evaluated in a sandbox; tables that call engine functions are skipped and listed.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..'), src = fs.readFileSync(path.join(ROOT, 'engine/index.html'), 'utf8');
const GROUPS = {
  balance: ['SKD', 'SKP', 'BAK', 'BAP', 'MOB_HP_K', 'MOB_FURY', 'BOSS_K', 'EXP_K', 'PCT', 'POT', 'MAT_MAX', 'MAXLV', 'TIER_COL', 'RARITY'],
  classes: ['CLS', 'SKILLS', 'SK_ROT'],
  items: ['SLOT_ORDER', 'SETS', 'PLAIN', 'MATS', 'CHARMS', 'PETS', 'MOUNTS'],
  world: ['MAPS', 'BOSS_LORE', 'BOT_NAMES', 'NPCS'] };
function literal(name) {           // the source text of "const NAME = <expr>" up to the ";" or "," that ends it at depth 0
  const m = new RegExp('(?:\\b(?:const|let)\\s+|,\\s*)' + name + '\\s*=\\s*').exec(src); if (!m) return null;
  let i = m.index + m[0].length, d = 0, q = null, start = i;
  for (; i < src.length; i++) { const c = src[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if ('([{'.includes(c)) d++; else if (')]}'.includes(c)) d--;
    else if (d === 0 && (c === ';' || c === ',' || c === '\n')) break; }
  return src.slice(start, i).trim(); }
const out = {}, skipped = [];
for (const [g, names] of Object.entries(GROUPS)) { out[g] = {};
  for (const n of names) { const t = literal(n); if (!t) { skipped.push(n + ' (not found)'); continue; }
    try { const v = vm.runInNewContext('(' + t + ')', { Math }, { timeout: 500 }); JSON.stringify(v); out[g][n] = v; }
    catch (e) { skipped.push(n + ' (' + e.message.split('\n')[0] + ')'); } } }
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
for (const [g, v] of Object.entries(out)) fs.writeFileSync(path.join(ROOT, 'data', g + '.json'), JSON.stringify(v, null, 1));
console.log('written:', Object.entries(out).map(([g, v]) => g + ' [' + Object.keys(v).join(', ') + ']').join('; '));
console.log('skipped:', skipped.join('; ') || 'none');
