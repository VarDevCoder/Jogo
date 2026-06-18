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
    const { player, audio } = this.game;
    for (const w of player.weapons) {
      w.cdT -= dt;
      if (w.cdT <= 0) {
        w.cdT = w.cd / player.atkSpeedMult;
        if (w.type === 'orb')   for (let i = 0; i < (w.count || 1); i++) this._fireOrb(w);
        else if (w.type === 'area')  this._fireArea(w);
        else if (w.type === 'arrow') this._fireArrows(w);
        else if (w.type === 'slash') this._fireSlash(w);
        else if (w.type === 'potion') for (let i = 0; i < (w.count || 1); i++) this._firePotion(w);
        if (audio) audio.shoot(w.type);
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

  // Frasco del alquimista: vuela en arco hasta el objetivo y explota en área.
  _firePotion(w) {
    const { player, enemies, bullets } = this.game;
    let tx, ty;
    const inRange = enemies.filter(e =>
      Math.hypot(e.x - player.x, e.y - player.y) < w.range);
    if (inRange.length) {
      const e = inRange[Math.floor(Math.random() * inRange.length)];
      tx = e.x + (Math.random() - 0.5) * 30;
      ty = e.y + (Math.random() - 0.5) * 30;
    } else {
      const a = Math.random() * Math.PI * 2;
      const d = w.range * (0.4 + Math.random() * 0.5);
      tx = player.x + Math.cos(a) * d;
      ty = player.y + Math.sin(a) * d;
    }
    const dist = Math.hypot(tx - player.x, ty - player.y) || 1;
    const speed = 320;
    bullets.push(new Bullet({
      x: player.x, y: player.y,
      vx: (tx - player.x) / dist * speed,
      vy: (ty - player.y) / dist * speed,
      dmg: w.dmg * player.dmgMult,
      r: 7,
      life: dist / speed,
      type: 'potion',
      maxR: w.splash || 70,
    }));
  }

  _explodePotion(b) {
    const { bullets, particles, audio } = this.game;
    bullets.push(new Bullet({
      x: b.x, y: b.y,
      vx: 0, vy: 0,
      dmg: b.dmg,
      r: 5,
      life: 0.22,
      type: 'area',
      maxR: b.maxR,
    }));
    for (let k = 0; k < 8; k++) {
      particles.push(new Particle(
        b.x, b.y,
        (Math.random() - 0.5) * 260,
        (Math.random() - 0.5) * 260,
        '#5fd38a', 0.45,
      ));
    }
    if (audio) audio.explosion();
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
    const { bullets } = this.game;
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.update(dt);
      if (b.expired) {
        if (b.type === 'potion') this._explodePotion(b);
        bullets.splice(i, 1);
        continue;
      }
      // los frascos no dañan al contacto: vuelan hasta explotar
      if (b.type === 'potion') continue;

      if (b.type === 'laser_column') { this._tickLaser(b, dt); continue; }
      if (b.type === 'whirlwind')    { this._tickWhirlwind(b, dt); continue; }
      if (b.type === 'inferno_pool') { this._tickInfernoPool(b, dt); continue; }
      if (b.type === 'arrow_rain_marker') { this._tickArrowRainMarker(b, dt); continue; }

      // rain_arrow cae verticalmente — no daña hasta cruzar targetY
      if (b.type === 'rain_arrow' && b.targetY != null && b.y < b.targetY) continue;

      this._collideBullet(b, i);
    }
  }

  _collideBullet(b, i) {
    const { bullets, enemies, player } = this.game;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (Math.hypot(e.x - b.x, e.y - b.y) >= e.r + b.r) continue;
      if ((b.type === 'area' || b.type === 'slash' || b.type === 'rain_arrow') && b.hits?.has(e)) continue;

      this._applyHit(b, e, false);

      if (e.dead) this._killEnemyAt(j);

      if (b.type === 'orb' || b.type === 'arrow') {
        bullets.splice(i, 1);
        return true;
      }
      if (b.type === 'area' || b.type === 'slash' || b.type === 'rain_arrow') { b.hits.add(e); }
    }
    return false;
  }

  // silent = sin crit, sin shake, sin audio. Para DoT ticks (inferno_pool) que
  // dispararian cientos de eventos por segundo si fueran "ruidosos".
  _applyHit(b, e, silent) {
    const { particles, damageNumbers, shake, audio } = this.game;
    const crit = !silent && Math.random() < Config.fx.critChance;
    const dmg = b.dmg * (crit ? Config.fx.critMult : 1);
    e.takeDamage(dmg);
    if (!silent) damageNumbers.push(new DamageNumber(e.x, e.y - e.r, dmg, crit));
    if (!silent && crit) shake.add(Config.fx.shakeOnCrit);
    if (!silent && audio) audio.hit(crit);
    if (!silent) {
      for (let k = 0; k < 4; k++) {
        particles.push(new Particle(
          b.x, b.y,
          (Math.random() - 0.5) * 240,
          (Math.random() - 0.5) * 240,
          Palette.gold, 0.35,
        ));
      }
    }
  }

  _killEnemyAt(j) {
    const { enemies, gems, particles, player, hitStop, shake, audio } = this.game;
    const e = enemies[j];

    const burst = e.isBoss ? 30 : 10;
    const burstSpeed = e.isBoss ? 480 : 280;
    for (let k = 0; k < burst; k++) {
      particles.push(new Particle(
        e.x, e.y,
        (Math.random() - 0.5) * burstSpeed,
        (Math.random() - 0.5) * burstSpeed,
        e.isBoss ? Palette.goldHot : Palette.blood, e.isBoss ? 0.9 : 0.6,
      ));
    }

    if (e.isBoss) {
      for (let k = 0; k < e.gemDrops; k++) {
        const a = (k / e.gemDrops) * Math.PI * 2;
        const dist = e.r * 0.5 + Math.random() * 40;
        gems.push(new Gem(e.x + Math.cos(a) * dist, e.y + Math.sin(a) * dist, e.xp));
      }
      this.game.chests.push({ x: e.x, y: e.y, r: 18, t: 0 });
      hitStop.freeze(Config.fx.hitStopOnLevelUp);
      shake.add(Config.fx.shakeOnBossKill);
      this.game.flash = Math.max(this.game.flash, 0.4);
      if (audio) audio.bossDeath();
    } else {
      gems.push(new Gem(e.x, e.y, e.xp));
      if (Math.random() < 0.3) {
        const amount = Math.max(1, Math.round((1 + this.game.time / 90) * (player.greed || 1)));
        gems.push(new Gem(e.x + 10, e.y + 6, 0, amount));
      }
      if (Math.random() < 0.005) {
        this.game.pickups.push({ type: 'magnet', x: e.x, y: e.y, r: 14, t: 0 });
      }
      if (audio) audio.kill();
    }

    enemies.splice(j, 1);
    player.kills++;
    hitStop.freeze(Config.fx.hitStopOnKill);
  }

  // ===== ULTI: laser column (vertical column, damage tick) =====
  _tickLaser(b, dt) {
    b.tickT -= dt;
    if (b.tickT > 0) return;
    b.tickT = b.tickRate;
    const { enemies } = this.game;
    const halfW = b.columnHalfW || b.r;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (Math.abs(e.x - b.x) > halfW + e.r) continue;
      // column is infinite vertically -> always in range
      this._applyHit(b, e, false);
      if (e.dead) this._killEnemyAt(j);
    }
  }

  // ===== ULTI: whirlwind (circle around player, damage tick) =====
  _tickWhirlwind(b, dt) {
    b.tickT -= dt;
    if (b.tickT > 0) return;
    b.tickT = b.tickRate;
    const { enemies } = this.game;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (Math.hypot(e.x - b.x, e.y - b.y) > b.r + e.r) continue;
      this._applyHit(b, e, false);
      if (e.dead) this._killEnemyAt(j);
    }
  }

  // ===== ULTI: inferno pool (static, DoT) =====
  _tickInfernoPool(b, dt) {
    b.tickT -= dt;
    if (b.tickT > 0) return;
    b.tickT = b.tickRate;
    const { enemies, particles } = this.game;
    // bubble particles
    if (Math.random() < 0.6) {
      particles.push(new Particle(
        b.x + (Math.random() - 0.5) * b.r * 0.9,
        b.y + (Math.random() - 0.5) * b.r * 0.9,
        (Math.random() - 0.5) * 60,
        -60 - Math.random() * 80,
        '#5fffaf', 0.5,
      ));
    }
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (Math.hypot(e.x - b.x, e.y - b.y) > b.r + e.r) continue;
      this._applyHit(b, e, true);
      if (e.dead) this._killEnemyAt(j);
    }
  }

  // ===== ULTI: arrow rain marker (spawns falling arrows) =====
  _tickArrowRainMarker(b, dt) {
    b.spawnT -= dt;
    if (b.spawnsLeft <= 0 || b.spawnT > 0) return;
    b.spawnT = b.spawnRate;
    b.spawnsLeft--;
    const { bullets } = this.game;
    // spawn arrow above target inside the radius
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * b.radius;
    const tx = b.x + Math.cos(a) * r;
    const ty = b.y + Math.sin(a) * r;
    const arrow = new Bullet({
      x: tx, y: ty - 320,
      vx: 0, vy: 900,
      dmg: b.dmg,
      r: 28,                  // splash radius
      life: 320 / 900 + 0.05,
      type: 'rain_arrow',
    });
    arrow.targetY = ty;
    arrow.angle = Math.PI / 2;
    bullets.push(arrow);
  }

  _tickGems(dt) {
    const { gems, player, audio } = this.game;
    const magnetActive = this.game.magnetT > 0;
    for (let i = gems.length - 1; i >= 0; i--) {
      const g = gems[i];
      const d = Math.hypot(player.x - g.x, player.y - g.y);
      if (magnetActive || d < player.pickupRange) {
        g.attractTo(player.x, player.y, dt, magnetActive ? 1000 : 400);
      }
      if (d < player.r + g.r) {
        gems.splice(i, 1);
        if (g.gold) {
          player.gold += g.gold;
          if (audio) audio.coin();
        } else {
          if (audio) audio.gem();
          player.addXp(g.xp, () => this.game.onLevelUp());
        }
      }
    }
  }
}
