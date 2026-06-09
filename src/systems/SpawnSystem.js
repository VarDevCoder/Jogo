import { Config } from '../core/Config.js';
import { Enemy } from '../entities/Enemy.js';

export class SpawnSystem {
  constructor(game) {
    this.game = game;
    this.timer = 0;
    this.bossTimer = Config.bosses.interval;
    this.bossIndex = 0;
  }

  update(dt) {
    this.timer -= dt;
    const rate = Math.max(
      Config.spawn.minRate,
      Config.spawn.maxRate - this.game.time / Config.spawn.rampSeconds
    );
    if (this.timer <= 0) {
      this.spawn();
      this.timer = rate;
    }

    this.bossTimer -= dt;
    if (this.bossTimer <= 0) {
      this.spawnBoss();
      this.bossTimer = Config.bosses.interval;
    }
  }

  spawn() {
    const { width, height } = this.game.renderer.getSize();
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(width, height) * 0.7;
    const x = this.game.player.x + Math.cos(angle) * dist;
    const y = this.game.player.y + Math.sin(angle) * dist;

    const tier = Math.min(3, Math.floor(this.game.time / 60));
    const bonus = Math.random() < 0.2 ? 1 : 0;
    const idx = Math.min(tier + bonus, Config.enemies.length - 1);
    const def = Config.enemies[idx];
    const hpScale = 1 + this.game.time / 90;

    this.game.enemies.push(new Enemy({
      x, y,
      hp: def.hp * hpScale,
      dmg: def.dmg,
      speed: def.speed,
      radius: def.radius,
      color: def.color,
      xp: def.xp,
      sprite: def.sprite,
    }));
  }

  spawnBoss() {
    const defs = Config.bosses.defs;
    const def = defs[this.bossIndex % defs.length];
    this.bossIndex++;

    const { width, height } = this.game.renderer.getSize();
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(width, height) * 0.75;
    const hpScale = 1 + this.game.time / 120;

    this.game.enemies.push(new Enemy({
      x: this.game.player.x + Math.cos(angle) * dist,
      y: this.game.player.y + Math.sin(angle) * dist,
      hp: def.hp * hpScale,
      dmg: def.dmg,
      speed: def.speed,
      radius: def.radius,
      color: def.color,
      xp: def.xp,
      sprite: def.sprite,
      name: def.name,
      isBoss: true,
      gemDrops: def.gems,
    }));

    this.game.shake.add(0.4);
    this.game.flash = Math.max(this.game.flash, 0.25);
  }
}
