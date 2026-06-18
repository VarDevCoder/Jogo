import { describe, it, expect } from './runner.js';
import {
  initialStats,
  recomputeStats,
  statScaling,
  STAT_POINTS_PER_LEVEL,
  STAT_IDS,
} from '../src/core/Stats.js';
import { Player } from '../src/entities/Player.js';

describe('Stats — initialStats', () => {
  it('devuelve los 4 stats en 0', () => {
    const s = initialStats();
    expect(s.str).toBe(0);
    expect(s.dex).toBe(0);
    expect(s.int).toBe(0);
    expect(s.vit).toBe(0);
  });

  it('expone los 4 ids esperados', () => {
    expect(STAT_IDS.length).toBe(4);
    expect(STAT_IDS).toContain('str');
    expect(STAT_IDS).toContain('dex');
    expect(STAT_IDS).toContain('int');
    expect(STAT_IDS).toContain('vit');
  });
});

describe('Stats — curva de escalado', () => {
  it('en 0 puntos da 0', () => {
    expect(statScaling(0)).toBe(0);
  });

  it('en el soft cap (20) devuelve 1', () => {
    expect(statScaling(20)).toBeCloseTo(1, 4);
  });

  it('es estrictamente monotónicamente creciente', () => {
    let prev = -1;
    for (let p = 0; p <= 80; p++) {
      const v = statScaling(p);
      expect(v).toBeGreaterThan(prev - 1e-9);
      prev = v;
    }
  });

  it('tiene rendimientos decrecientes (derivada decreciente)', () => {
    // la diferencia entre cada par de puntos es cada vez menor
    const d1 = statScaling(5) - statScaling(4);
    const d2 = statScaling(40) - statScaling(39);
    expect(d2).toBeLessThan(d1);
  });
});

describe('Stats — recomputeStats efectos por stat', () => {
  function freshPlayer(classId = 'mage') {
    return new Player(0, 0, classId);
  }

  it('sin puntos no cambia el baseline', () => {
    const p = freshPlayer('mage');
    const dmg0 = p.dmgMult;
    const atk0 = p.atkSpeedMult;
    const hp0 = p.hpMax;
    recomputeStats(p);
    expect(p.dmgMult).toBeCloseTo(dmg0, 6);
    expect(p.atkSpeedMult).toBeCloseTo(atk0, 6);
    expect(p.hpMax).toBe(hp0);
  });

  it('STR sube HP plano (+5/punto) y daño melee con bonus', () => {
    const p = freshPlayer('melee');
    const hp0 = p.hpMax;
    const dmg0 = p.dmgMult;
    p.stats.str = 10;
    recomputeStats(p);
    expect(p.hpMax).toBe(hp0 + 50);
    // melee con STR: x(1 + 0.6 * sqrt(10/20)) ≈ x1.4243
    const s = Math.sqrt(10 / 20);
    expect(p.dmgMult).toBeCloseTo(dmg0 * (1 + 0.6 * s), 5);
  });

  it('STR fuera de melee da un bonus de daño más chico', () => {
    const m = freshPlayer('melee');
    const r = freshPlayer('ranger');
    const dmgM0 = m.dmgMult;
    const dmgR0 = r.dmgMult;
    m.stats.str = 20;
    r.stats.str = 20;
    recomputeStats(m);
    recomputeStats(r);
    // melee gana 0.6, ranger 0.25 — la subida relativa de melee es mayor
    const liftM = p => p.dmgMult / dmgM0;
    const liftR = p => p.dmgMult / dmgR0;
    expect(liftM(m)).toBeGreaterThan(liftR(r));
  });

  it('DEX da crit y atkSpeed, con daño full a ranger', () => {
    const p = freshPlayer('ranger');
    const dmg0 = p.dmgMult;
    const atk0 = p.atkSpeedMult;
    p.stats.dex = 20;
    recomputeStats(p);
    expect(p.critBonus).toBeCloseTo(20 * 0.005, 6);
    expect(p.dmgMult).toBeCloseTo(dmg0 * (1 + 0.55 * 1), 5);
    expect(p.atkSpeedMult).toBeCloseTo(atk0 * (1 + 0.1 * 1), 5);
  });

  it('INT da bonus pleno a mago y alquimista, parcial al resto', () => {
    const mage = freshPlayer('mage');
    const alch = freshPlayer('alchemist');
    const melee = freshPlayer('melee');
    const dmgs0 = [mage.dmgMult, alch.dmgMult, melee.dmgMult];
    mage.stats.int = 20; alch.stats.int = 20; melee.stats.int = 20;
    recomputeStats(mage); recomputeStats(alch); recomputeStats(melee);
    // mage y alch: x1.6; melee: x1.2
    expect(mage.dmgMult).toBeCloseTo(dmgs0[0] * 1.6, 4);
    expect(alch.dmgMult).toBeCloseTo(dmgs0[1] * 1.6, 4);
    expect(melee.dmgMult).toBeCloseTo(dmgs0[2] * 1.2, 4);
  });

  it('VIT da +10 HP/punto y +0.05 regen/punto', () => {
    const p = freshPlayer('mage');
    const hp0 = p.hpMax;
    p.stats.vit = 7;
    recomputeStats(p);
    expect(p.hpMax).toBe(hp0 + 70);
    expect(p.regen).toBeCloseTo(7 * 0.05, 5);
  });

  it('con varios stats activos los multiplicadores se componen', () => {
    const p = freshPlayer('mage');
    const dmg0 = p.dmgMult;
    const atk0 = p.atkSpeedMult;
    p.stats.int = 20; // x1.6 dmg, x1.15 atkSpeed
    p.stats.dex = 20; // x1.2 dmg, x1.1 atkSpeed
    recomputeStats(p);
    expect(p.dmgMult).toBeCloseTo(dmg0 * 1.6 * 1.2, 4);
    expect(p.atkSpeedMult).toBeCloseTo(atk0 * 1.15 * 1.1, 4);
  });
});

describe('Stats — recomputeStats no acumula', () => {
  it('llamarla N veces con los mismos stats da el mismo resultado', () => {
    const p = new Player(0, 0, 'mage');
    p.stats.int = 15;
    recomputeStats(p);
    const dmgA = p.dmgMult;
    const atkA = p.atkSpeedMult;
    const hpA = p.hpMax;
    for (let i = 0; i < 5; i++) recomputeStats(p);
    expect(p.dmgMult).toBeCloseTo(dmgA, 6);
    expect(p.atkSpeedMult).toBeCloseTo(atkA, 6);
    expect(p.hpMax).toBe(hpA);
  });

  it('reasignar stats deshace los efectos previos', () => {
    const p = new Player(0, 0, 'mage');
    const dmg0 = p.dmgMult;
    const hp0 = p.hpMax;
    p.stats.str = 20;
    recomputeStats(p);
    p.stats.str = 0;
    recomputeStats(p);
    expect(p.dmgMult).toBeCloseTo(dmg0, 6);
    expect(p.hpMax).toBe(hp0);
  });

  it('preserva mutaciones externas (cartas) entre recomputes', () => {
    const p = new Player(0, 0, 'mage');
    // simulamos una carta que duplica el daño
    p.dmgMult *= 2;
    p.stats.int = 20;
    recomputeStats(p);
    // ahora bajamos los stats: la "x2" de la carta debe seguir
    p.stats.int = 0;
    recomputeStats(p);
    expect(p.dmgMult).toBeCloseTo(2, 5);
  });
});

describe('Stats — puntos por nivel', () => {
  it('Player parte con 0 stats y 0 puntos disponibles', () => {
    const p = new Player(0, 0, 'mage');
    expect(p.statPointsAvailable).toBe(0);
    expect(p.stats.str).toBe(0);
    expect(p.stats.dex).toBe(0);
    expect(p.stats.int).toBe(0);
    expect(p.stats.vit).toBe(0);
  });

  it('cada nivel acumula +STAT_POINTS_PER_LEVEL puntos', () => {
    const p = new Player(0, 0, 'mage');
    let leveled = 0;
    p.addXp(p.xpNext, () => leveled++);
    expect(leveled).toBe(1);
    expect(p.statPointsAvailable).toBe(STAT_POINTS_PER_LEVEL);
  });

  it('varios niveles seguidos acumulan correctamente', () => {
    const p = new Player(0, 0, 'mage');
    let leveled = 0;
    p.addXp(100000, () => leveled++);
    expect(leveled).toBeGreaterThan(3);
    expect(p.statPointsAvailable).toBe(leveled * STAT_POINTS_PER_LEVEL);
  });

  it('NO sube stats automáticamente al nivelar', () => {
    const p = new Player(0, 0, 'mage');
    p.addXp(100000, () => {});
    // todos los stats siguen en 0 — el jugador debe gastar puntos manualmente
    expect(p.stats.str).toBe(0);
    expect(p.stats.dex).toBe(0);
    expect(p.stats.int).toBe(0);
    expect(p.stats.vit).toBe(0);
  });
});
