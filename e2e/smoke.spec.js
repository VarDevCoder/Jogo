import { test, expect } from '@playwright/test';

const URL = 'http://127.0.0.1:8000';

test.describe('Survivors Mini smoke tests', () => {
  test('intro screen shows 3 class cards', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(URL);
    await page.waitForSelector('.classCard', { timeout: 5000 });
    const cards = await page.$$('.classCard');
    expect(cards.length).toBe(3);
    expect(errors).toEqual([]);
  });

  test('picking mage starts game and creates window.__game', async ({ page }) => {
    await page.goto(URL);
    await page.waitForSelector('.classCard[data-id="mage"]');
    await page.click('.classCard[data-id="mage"]');
    await page.waitForFunction(() => window.__game && window.__game.player);

    const state = await page.evaluate(() => ({
      classId: window.__game.player.classId,
      hp: window.__game.player.hp,
      level: window.__game.player.level,
    }));
    expect(state.classId).toBe('mage');
    expect(state.hp).toBeGreaterThan(0);
    expect(state.level).toBe(1);
  });

  test('player survives 3 seconds without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(URL);
    await page.click('.classCard[data-id="mage"]');
    await page.waitForFunction(() => window.__game?.player);
    await page.waitForTimeout(3000);

    const time = await page.evaluate(() => window.__game.time);
    expect(time).toBeGreaterThan(2);
    expect(errors).toEqual([]);
  });

  test('giving xp through cheats levels up and opens upgrade menu', async ({ page }) => {
    await page.goto(URL);
    await page.click('.classCard[data-id="mage"]');
    await page.waitForFunction(() => window.__game?.player);

    await page.evaluate(() => {
      const g = window.__game;
      g.player.addXp(g.player.xpNext, () => g.onLevelUp());
    });
    await page.waitForSelector('.card', { timeout: 2000 });
    const cards = await page.$$('.card');
    expect(cards.length).toBe(3);
  });

  test('boss spawn cheat creates a boss', async ({ page }) => {
    await page.goto(URL);
    await page.click('.classCard[data-id="mage"]');
    await page.waitForFunction(() => window.__game?.player);

    await page.evaluate(() => window.__game.spawnSystem.spawnBoss());
    await page.waitForTimeout(100);

    const bossCount = await page.evaluate(
      () => window.__game.enemies.filter(e => e.isBoss).length
    );
    expect(bossCount).toBeGreaterThan(0);
  });

  test('each class boots correctly', async ({ page }) => {
    for (const cls of ['mage', 'ranger', 'melee']) {
      await page.goto(URL);
      await page.click(`.classCard[data-id="${cls}"]`);
      await page.waitForFunction(() => window.__game?.player);
      const id = await page.evaluate(() => window.__game.player.classId);
      expect(id).toBe(cls);
    }
  });
});
