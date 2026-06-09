import { Config } from '../core/Config.js';
import { Enemy } from '../entities/Enemy.js';

export class SpawnSystem {
  constructor(game) {
    this.game = game;
    this.timer = 0;
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
}
