import { Config, Palette } from '../core/Config.js';
import { Bullet } from '../entities/Bullet.js';
import { Gem } from '../entities/Gem.js';
import { Particle } from '../entities/Particle.js';
import { DamageNumber } from '../entities/DamageNumber.js';

export class CombatSystem {
  constructor(game) { this.game = game; }

  update(dt) {
    this._tickWeapons(dt);
    this._tickBullets(dt);
    this._tickGems(dt);
  }

  _tickWeapons(dt) {
    const { player } = this.game;
    for (const w of player.weapons) {
      w.cdT -= dt;
      if (w.cdT <= 0) {
        w.cdT = w.cd / player.atkSpeedMult;
        if (w.type === 'orb')   for (let i = 0; i < (w.count || 1); i++) this._fireOrb(w);
        else if (w.type === 'area')  this._fireArea(w);
        else if (w.type === 'arrow') this._fireArrows(w);
        else if (w.type === 'slash') this._fireSlash(w);
      }
    }
  }

  _fireOrb(w) {
    const { player, enemies, bullets } = this.game;
    let best = null, bd = w.range;
    for (const e of enemies) {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < bd) { bd = d; best = e; }
    }
    if (!best) return;
    const dx = best.x - player.x, dy = best.y - player.y;
    const d = Math.hypot(dx, dy) || 1;
    const cfg = Config.weapons.orb;
    bullets.push(new Bullet({
      x: player.x, y: player.y,
      vx: dx / d * cfg.projectileSpeed,
      vy: dy / d * cfg.projectileSpeed,
      dmg: w.dmg * player.dmgMult,
      r: cfg.projectileRadius,
      life: cfg.life,
      type: 'orb',
    }));
  }

  _fireArrows(w) {
    const { player, enemies, bullets } = this.game;
    let aimX, aimY;
    let best = null, bd = w.range;
    for (const e of enemies) {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < bd) { bd = d; best = e; }
    }
    if (best) {
      aimX = best.x - player.x;
      aimY = best.y - player.y;
    } else {
      aimX = player.facing;
      aimY = 0;
    }
    const base = Math.atan2(aimY, aimX);
    const count = w.count || 3;
    const spread = w.spread || 0.3;
    const speed = 480;
    for (let i = 0; i < count; i++) {
      const offset = count === 1 ? 0 : ((i / (count - 1)) - 0.5) * spread;
      const a = base + offset;
      bullets.push(new Bullet({
        x: player.x, y: player.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        dmg: w.dmg * player.dmgMult,
        r: 5,
        life: w.range / speed,
        type: 'arrow',
      }));
    }
  }

  _fireSlash(w) {
    const { player, bullets } = this.game;
    bullets.push(new Bullet({
      x: player.x, y: player.y,
      vx: 0, vy: 0,
      dmg: w.dmg * player.dmgMult,
      r: 0,
      life: 0.25,
      type: 'slash',
      maxR: w.range,
      follow: player,
    }));
    player.swinging = 1;
  }

  _fireArea(w) {
    const { player, bullets } = this.game;
    bullets.push(new Bullet({
      x: player.x, y: player.y,
      vx: 0, vy: 0,
      dmg: w.dmg * player.dmgMult,
      r: w.range * 0.4,
      life: Config.weapons.area.life,
      type: 'area',
      maxR: w.range,
    }));
  }

  _tickBullets(dt) {
    const { bullets, enemies, particles, gems, player, damageNumbers, shake, hitStop } = this.game;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.update(dt);
      if (b.expired) { bullets.splice(i, 1); continue; }

      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (Math.hypot(e.x - b.x, e.y - b.y) >= e.r + b.r) continue;
        if ((b.type === 'area' || b.type === 'slash') && b.hits.has(e)) continue;

        const crit = Math.random() < Config.fx.critChance;
        const dmg = b.dmg * (crit ? Config.fx.critMult : 1);
        e.takeDamage(dmg);
        damageNumbers.push(new DamageNumber(e.x, e.y - e.r, dmg, crit));
        shake.add(Config.fx.shakeOnHit * (crit ? 1.5 : 1));

        for (let k = 0; k < 4; k++) {
          particles.push(new Particle(
            b.x, b.y,
            (Math.random() - 0.5) * 240,
            (Math.random() - 0.5) * 240,
            Palette.gold, 0.35,
          ));
        }

        if (e.dead) {
          for (let k = 0; k < 10; k++) {
            particles.push(new Particle(
              e.x, e.y,
              (Math.random() - 0.5) * 280,
              (Math.random() - 0.5) * 280,
              Palette.blood, 0.6,
            ));
          }
          gems.push(new Gem(e.x, e.y, e.xp));
          enemies.splice(j, 1);
          player.kills++;
          hitStop.freeze(Config.fx.hitStopOnKill);
          shake.add(0.08);
        }
        if (b.type === 'orb' || b.type === 'arrow') { bullets.splice(i, 1); break; }
        if (b.type === 'area' || b.type === 'slash') { b.hits.add(e); }
      }
    }
  }

  _tickGems(dt) {
    const { gems, player } = this.game;
    for (let i = gems.length - 1; i >= 0; i--) {
      const g = gems[i];
      const d = Math.hypot(player.x - g.x, player.y - g.y);
      if (d < player.pickupRange) g.attractTo(player.x, player.y, dt);
      if (d < player.r + g.r) {
        gems.splice(i, 1);
        player.addXp(g.xp, () => this.game.onLevelUp());
      }
    }
  }
}
