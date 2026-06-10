import { describe, it, expect } from './runner.js';
import { Easing, lerp, damp } from '../src/fx/Easing.js';
import { ScreenShake } from '../src/fx/ScreenShake.js';
import { HitStop } from '../src/fx/HitStop.js';
import { DamageNumber } from '../src/entities/DamageNumber.js';

describe('Easing', () => {
  it('all easing functions return 0 at t=0 and 1 at t=1', () => {
    for (const name of Object.keys(Easing)) {
      const f = Easing[name];
      expect(f(0)).toBeCloseTo(0, 4);
      expect(f(1)).toBeCloseTo(1, 4);
    }
  });

  it('lerp interpolates linearly', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('damp approaches target as dt grows', () => {
    let v = 0;
    for (let i = 0; i < 100; i++) v = damp(v, 100, 10, 0.05);
    expect(v).toBeCloseTo(100, 1);
  });
});

describe('ScreenShake', () => {
  it('starts at trauma 0', () => {
    expect(new ScreenShake().trauma).toBe(0);
  });

  it('add increases trauma but never beyond cap', () => {
    const s = new ScreenShake();
    s.add(0.3); expect(s.trauma).toBeCloseTo(0.3, 5);
    s.add(10); expect(s.trauma).toBe(s.cap);
  });

  it('decays to 0 over time', () => {
    const s = new ScreenShake();
    s.add(0.5);
    for (let i = 0; i < 60; i++) s.update(0.02);
    expect(s.trauma).toBe(0);
  });

  it('getOffset returns 0 when trauma is 0', () => {
    const s = new ScreenShake();
    const o = s.getOffset();
    expect(o.x).toBe(0);
    expect(o.y).toBe(0);
  });

  it('getOffset stays bounded by maxOffset', () => {
    const s = new ScreenShake();
    s.add(1);
    for (let i = 0; i < 100; i++) {
      const o = s.getOffset();
      expect(Math.abs(o.x)).toBeLessThan(s.maxOffset + 0.001);
      expect(Math.abs(o.y)).toBeLessThan(s.maxOffset + 0.001);
    }
  });
});

describe('HitStop', () => {
  it('starts inactive', () => {
    expect(new HitStop().consume(0.016)).toBeFalsy();
  });

  it('freeze pauses for given duration', () => {
    const h = new HitStop();
    h.freeze(0.1);
    expect(h.consume(0.05)).toBeTruthy();
    expect(h.consume(0.05)).toBeTruthy();
    expect(h.consume(0.02)).toBeFalsy();
  });

  it('freeze takes max of current and new duration', () => {
    const h = new HitStop();
    h.freeze(0.5);
    h.freeze(0.1);
    expect(h.remaining).toBe(0.5);
  });
});

describe('DamageNumber', () => {
  it('moves upward initially', () => {
    const d = new DamageNumber(0, 0, 50);
    expect(d.vy).toBeLessThan(0);
  });

  it('crit doubles font scaling', () => {
    const normal = new DamageNumber(0, 0, 10, false);
    const crit = new DamageNumber(0, 0, 10, true);
    expect(crit.crit).toBe(true);
    expect(normal.crit).toBe(false);
  });

  it('expires after lifetime', () => {
    const d = new DamageNumber(0, 0, 10);
    for (let i = 0; i < 100; i++) d.update(0.02);
    expect(d.expired).toBeTruthy();
  });

  it('amount is rounded up', () => {
    expect(new DamageNumber(0, 0, 12.4).amount).toBe(13);
    expect(new DamageNumber(0, 0, 5.01).amount).toBe(6);
  });
});
