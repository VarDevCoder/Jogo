import { describe, it, expect } from './runner.js';
import { UpgradeSystem } from '../src/systems/UpgradeSystem.js';
import { Player } from '../src/entities/Player.js';

function mockGame(classId) {
  return { player: new Player(0, 0, classId) };
}

describe('UpgradeSystem', () => {
  it('rolls exactly N cards', () => {
    const u = new UpgradeSystem(mockGame('mage'));
    expect(u.roll(3).length).toBe(3);
    expect(u.roll(5).length).toBe(5);
  });

  it('every card has a rarity and a name', () => {
    const u = new UpgradeSystem(mockGame('mage'));
    for (const card of u.roll(20)) {
      expect(card.rarity).toBeTruthy();
      expect(card.name).toBeTruthy();
      expect(card.desc).toBeTruthy();
    }
  });

  it('mage pool gives mage-themed upgrades', () => {
    const u = new UpgradeSystem(mockGame('mage'));
    const cards = u.roll(50);
    const ids = cards.map(c => c.upgrade.id);
    expect(ids.every(id => id.startsWith('mage_'))).toBeTruthy();
  });

  it('ranger pool gives ranger-themed upgrades', () => {
    const u = new UpgradeSystem(mockGame('ranger'));
    const cards = u.roll(50);
    const ids = cards.map(c => c.upgrade.id);
    expect(ids.every(id => id.startsWith('ranger_'))).toBeTruthy();
  });

  it('applying a damage upgrade increases dmgMult', () => {
    const game = mockGame('mage');
    const u = new UpgradeSystem(game);
    const dmg0 = game.player.dmgMult;
    let attempts = 0;
    while (attempts++ < 200) {
      const cards = u.roll(3);
      const dmgCard = cards.find(c => c.upgrade.id === 'mage_dmg');
      if (dmgCard) {
        u.apply(dmgCard);
        expect(game.player.dmgMult).toBeGreaterThan(dmg0);
        return;
      }
    }
    throw new Error('mage_dmg card never rolled in 200 attempts');
  });

  it('unique upgrades cannot repeat once taken', () => {
    const game = mockGame('mage');
    const u = new UpgradeSystem(game);
    u.takenUniques.add('mage_jp_mirror');
    u.takenUniques.add('mage_jp_nova');
    for (const card of u.roll(50)) {
      expect(card.unique).toBeFalsy();
    }
  });
});
