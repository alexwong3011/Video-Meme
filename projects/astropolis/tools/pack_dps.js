const levels = (process.env.LV || '25,120,260').split(',').map(Number), out = [];
for (const L of levels) {
  await pg.evaluate(L => { const T = __T, S = T.S; S.lv = L; const r = L < 100 ? 1 : L < 250 ? 2 : 3, plus = L < 50 ? 1 : L < 100 ? 4 : L < 170 ? 7 : L < 250 ? 10 : L < 300 ? 12 : 14;
    for (const sl of ['helm','armor','pants','gloves','boots','weapon','shield','ring','pendant']) { const g = T.makeGear(sl, r, L); g.plus = plus; S.eq[sl] = g; }
    const wt = L >= 250 ? 3 : L >= 120 ? 2 : L >= 40 ? 1 : 0; S.eq.wings = wt ? T.makeWing(wt, L) : null;
    for (const k of ['c','p','d','t','x']) S.st[k] = Math.round({ c: 11, p: 7, d: 12, t: 15, x: 30 }[k] * L / 400);
    S.auto = true; S.autoLoot = false; S.bossHunt = false; T.recalc(true); const M = T.MAPS; let mi = 0; for (let i = 0; i < M.length; i++) if (!M[i].town && M[i].lo <= L) mi = i; T.travel(mi); }, L);
  await pg.waitForTimeout(2500);
  const res = { L };
  for (const phase of ['sk', 'atk']) {
    await pg.evaluate(() => { const T = __T, S = T.S; S.bossT = 9999; S.pos.set(0, 0, 0); S.hp = T.HS.hp; S.mp = T.HS.mp; S.skCd = [0, 0, 0]; S.skG = 0; S.atkCd = 0;
      const L5 = T.mobs.filter(m => !m.boss).slice(0, 5); let k = 0;
      for (const m of T.mobs) { if (L5.includes(m)) { const a = k++ / 5 * 6.283; m.x = Math.cos(a) * 1.0; m.z = -3.0 + Math.sin(a) * 1.0; m.aggro = false; m.dead = 0; m.hp = 1e12; m.stunT = 1e9; m.frzT = m.shockT = m.burnT = m.wetT = 0; }
        else { m.x += 80; m.z += 80; m.aggro = false; m.state = 'idle'; m.wait = 999; } }
      window.__pack = L5; window.__t0 = S.time; });
    const ph = phase;
    await pg.evaluate(ph => { const T = __T, S = T.S; for (let k = 0; k < 120; k++) { S.hp = T.HS.hp; S.dead = 0; if (ph === 'sk') S.atkCd = 99; else S.skG = 99; for (const m of window.__pack) m.stunT = 1e9; window.__sim(0.1); } }, ph);
    await pg.waitForTimeout(6000);
    const r = await pg.evaluate(() => { const T = __T, S = T.S; const dt = S.time - window.__t0; const dmg = window.__pack.reduce((a, m) => a + (1e12 - m.hp), 0); const hp = window.__pack.reduce((a, m) => a + m.maxHp, 0);
      S.atkCd = 0; S.skG = 0; return { dps: dmg / dt, hp, skK: 0, mp: Math.round(S.mp / T.HS.mp * 100) }; });
    res[phase] = Math.round(r.dps); res.hp = Math.round(r.hp); res['mp_' + phase] = r.mp;
  }
  res.tSk = +(res.hp / res.sk).toFixed(1); res.tAtk = +(res.hp / res.atk).toFixed(1); res.tBoth = +(res.hp / (res.sk + res.atk)).toFixed(1);
  out.push(res); console.log(JSON.stringify(res)); }
