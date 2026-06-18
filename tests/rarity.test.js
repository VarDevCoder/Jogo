import { describe, it, expect, seededRng } from './runner.js';
import { Rarities, rollRarity } from '../src/core/Rarity.js';

describe('Rarity', () => {
  it('exposes 5 rarities with multipliers and weights', () => {
    expect(Object.keys(Rarities).length).toBe(5);
    for (const r of Object.values(Rarities)) {
      expect(typeof r.mult).toBe('number');
      expect(r.weight).toBeGreaterThan(0);
      expect(r.id).toBeTruthy();
    }
  });

  it('weights sum to 100', () => {
    const sum = Object.values(Rarities).reduce((a, r) => a + r.weight, 0);
    expect(sum).toBe(100);
  });

  it('multipliers are monotonically increasing (except jackpot)', () => {
    expect(Rarities.comun.mult).toBeLessThan(Rarities.pocoComun.mult);
    expect(Rarities.pocoComun.mult).toBeLessThan(Rarities.raro.mult);
    expect(Rarities.raro.mult).toBeLessThan(Rarities.ultraRaro.mult);
  });

  it('rollRarity always returns a valid rarity', () => {
    const rng = seededRng(42);
    for (let i = 0; i < 100; i++) {
      const r = rollRarity(rng);
      expect(Object.values(Rarities).includes(r)).toBeTruthy();
    }
  });

  it('rollRarity distribution roughly matches weights (10k samples)', () => {
    const counts = {};
    for (const id of Object.keys(Rarities)) counts[id] = 0;
    const N = 10000;
    for (let i = 0; i < N; i++) counts[rollRarity().id]++;

    for (const r of Object.values(Rarities)) {
      const observed = counts[r.id] / N;
      const expected = r.weight / 100;
      expect(Math.abs(observed - expected)).toBeLessThan(0.04);
    }
  });

  it('seeded RNG is deterministic', () => {
    const a = seededRng(123);
    const b = seededRng(123);
    expect(rollRarity(a).id).toBe(rollRarity(b).id);
    expect(rollRarity(a).id).toBe(rollRarity(b).id);
  });
});
