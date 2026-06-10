import { Config } from '../core/Config.js';
import { Classes } from '../core/Classes.js';
import { initialStats, STAT_POINTS_PER_LEVEL } from '../core/Stats.js';
import { getUlti } from '../core/Ultimates.js';

export class Player {
  constructor(x, y, classId = 'mage') {
    const cls = Classes[classId] || Classes.mage;
    const s = cls.stats;

    this.classId = cls.id;
    this.sprite = cls.sprite;
    this.x = x; this.y = y;
    this.r = Config.player.radius;
    this.hp = s.hp;
    this.hpMax = s.hp;
    this.speed = s.speed;
    this.pickupRange = s.pickupRange;
    this.color = cls.color;
    this.innerColor = cls.innerColor;

    this.xp = 0;
    this.level = 1;
    this.xpNext = Config.xp.initialNext;
    this.kills = 0;

    this.dmgMult = s.dmgMult;
    this.speedMult = 1;
    this.atkSpeedMult = s.atkSpeedMult;
    this.regen = 0;
    this.critBonus = 0;

    // Sistema de stats RPG: puntos sin gastar + capa reversible.
    // classBase guarda los valores base de la clase para que el menú
    // de stats pueda mostrar la diferencia limpia respecto a esa base.
    this.stats = initialStats();
    this.statPointsAvailable = 0;
    this.classBase = { hp: s.hp, dmgMult: s.dmgMult, atkSpeedMult: s.atkSpeedMult };
    this._statLayer = null;

    this.weapons = [{ ...cls.weapon }];

    this.squashX = 1;
    this.squashY = 1;
    this.tilt = 0;
    this.moving = false;
    this.facing = 1;
    this.swinging = 0;
    this.trail = [];
    this._trailT = 0;

    // Ultimate system
    this.ulti = cls.ulti ? getUlti(cls.ulti) : null;
    this.ultiCdT = 0;             // remaining cooldown (s)
    this.ultiReadySince = 0;      // time accumulator while ready (for pulse)
    this.whirlwindT = 0;          // active whirlwind timer (slows player)
  }

  move(dx, dy, dt) {
    const slow = this.whirlwindT > 0 ? 0.5 : 1;
    this.x += dx * this.speed * this.speedMult * slow * dt;
    this.y += dy * this.speed * this.speedMult * slow * dt;
    this.moving = (dx !== 0 || dy !== 0);
    if (dx > 0.1) this.facing = 1;
    else if (dx < -0.1) this.facing = -1;
    const targetTilt = dx * 0.12;
    this.tilt += (targetTilt - this.tilt) * 0.18;
    this.squashX += (1 - this.squashX) * 0.2;
    this.squashY += (1 - this.squashY) * 0.2;
    this.swinging = Math.max(0, this.swinging - dt * 3);

    this._trailT -= dt;
    if (this.moving && this._trailT <= 0) {
      this._trailT = 0.04;
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 6) this.trail.shift();
    } else if (!this.moving && this.trail.length) {
      this.trail.shift();
    }
  }

  regenerate(dt) {
    this.hp = Math.min(this.hpMax, this.hp + this.regen * dt);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.squashX = 0.85;
    this.squashY = 1.15;
  }

  tickUlti(dt) {
    if (this.ultiCdT > 0) {
      this.ultiCdT = Math.max(0, this.ultiCdT - dt);
      this.ultiReadySince = 0;
    } else {
      this.ultiReadySince += dt;
    }
    if (this.whirlwindT > 0) this.whirlwindT = Math.max(0, this.whirlwindT - dt);
  }

  ultiReady() {
    return !!this.ulti && this.ultiCdT <= 0;
  }

  castUlti(game) {
    if (!this.ultiReady()) return false;
    this.ulti.cast(game, this);
    this.ultiCdT = this.ulti.cooldown;
    this.ultiReadySince = 0;
    return true;
  }

  addXp(amount, onLevelUp) {
    this.xp += amount;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = Math.floor(this.xpNext * Config.xp.growth + Config.xp.add);
      // los puntos se acumulan acá; el menú de stats se abre desde Game
      this.statPointsAvailable += STAT_POINTS_PER_LEVEL;
      onLevelUp && onLevelUp();
    }
  }
}
