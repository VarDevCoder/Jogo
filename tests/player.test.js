import { describe, it, expect } from './runner.js';
import { Player } from '../src/entities/Player.js';
import { Classes } from '../src/core/Classes.js';

describe('Player', () => {
  it('mage starts with mage stats and orb weapon', () => {
    const p = new Player(0, 0, 'mage');
    expect(p.classId).toBe('mage');
    expect(p.hp).toBe(Classes.mage.stats.hp);
    expect(p.weapons.length).toBe(1);
    expect(p.weapons[0].type).toBe('orb');
  });

  it('ranger starts with arrow weapon and higher speed', () => {
    const p = new Player(0, 0, 'ranger');
    expect(p.weapons[0].type).toBe('arrow');
    expect(p.speed).toBeGreaterThan(180);
  });

  it('melee starts with slash weapon and more HP', () => {
    const p = new Player(0, 0, 'melee');
    expect(p.weapons[0].type).toBe('slash');
    expect(p.hp).toBeGreaterThan(120);
  });

  it('unknown class falls back to mage', () => {
    const p = new Player(0, 0, 'nonexistent');
    expect(p.classId).toBe('mage');
  });

  it('takeDamage reduces hp and squashes sprite', () => {
    const p = new Player(0, 0, 'mage');
    const hp0 = p.hp;
    p.takeDamage(20);
    expect(p.hp).toBe(hp0 - 20);
    expect(p.squashX).toBeLessThan(1);
    expect(p.squashY).toBeGreaterThan(1);
  });

  it('regenerate does not exceed hpMax', () => {
    const p = new Player(0, 0, 'mage');
    p.regen = 100;
    p.regenerate(10);
    expect(p.hp).toBe(p.hpMax);
  });

  it('regenerate restores hp when wounded', () => {
    const p = new Player(0, 0, 'mage');
    p.hp = 50; p.regen = 10;
    p.regenerate(1);
    expect(p.hp).toBeCloseTo(60, 5);
  });

  it('addXp triggers level up when threshold reached', () => {
    const p = new Player(0, 0, 'mage');
    let leveled = 0;
    p.addXp(p.xpNext, () => leveled++);
    expect(leveled).toBe(1);
    expect(p.level).toBe(2);
  });

  it('addXp triggers multiple levels with massive xp', () => {
    const p = new Player(0, 0, 'mage');
    let leveled = 0;
    p.addXp(10000, () => leveled++);
    expect(leveled).toBeGreaterThan(5);
  });

  it('move updates position scaled by speed and dt', () => {
    const p = new Player(0, 0, 'mage');
    p.move(1, 0, 1);
    expect(p.x).toBeCloseTo(p.speed * p.speedMult, 1);
  });

  it('move sets facing based on direction', () => {
    const p = new Player(0, 0, 'mage');
    p.move(1, 0, 0.1);
    expect(p.facing).toBe(1);
    p.move(-1, 0, 0.1);
    expect(p.facing).toBe(-1);
  });
});
