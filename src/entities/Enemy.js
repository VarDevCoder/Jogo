export class Enemy {
  constructor({ x, y, hp, dmg, speed, radius, color, xp, sprite, name, isBoss, gemDrops }) {
    this.x = x; this.y = y;
    this.hp = hp; this.hpMax = hp;
    this.dmg = dmg;
    this.speed = speed;
    this.r = radius;
    this.color = color;
    this.xp = xp;
    this.sprite = sprite || 'slime';
    this.name = name || null;
    this.isBoss = !!isBoss;
    this.gemDrops = gemDrops || 1;
    this.facing = 1;
    this.hitFlash = 0;
    this.scalePunch = 0;
    this.seed = Math.random() * 1000;
  }

  moveToward(targetX, targetY, dt) {
    const dx = targetX - this.x, dy = targetY - this.y;
    const d = Math.hypot(dx, dy) || 1;
    this.x += dx / d * this.speed * dt;
    this.y += dy / d * this.speed * dt;
    if (dx > 0.1) this.facing = 1;
    else if (dx < -0.1) this.facing = -1;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.hitFlash = 0.08;
    this.scalePunch = 0.25;
  }

  tickFx(dt) {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.scalePunch += (0 - this.scalePunch) * 0.25;
  }

  get dead() { return this.hp <= 0; }
}
