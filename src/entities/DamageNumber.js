export class DamageNumber {
  constructor(x, y, amount, crit = false) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y;
    this.vy = -60 - Math.random() * 30;
    this.vx = (Math.random() - 0.5) * 40;
    this.amount = Math.ceil(amount);
    this.crit = crit;
    this.life = 0.9;
    this.maxLife = 0.9;
    this.scale = 0;
    this.rot = (Math.random() - 0.5) * 0.2;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 80 * dt;
    this.vx *= 0.94;
    this.life -= dt;
    const t = 1 - this.life / this.maxLife;
    const c1 = 1.70158, c3 = c1 + 1;
    this.scale = t < 0.3
      ? 1 + c3 * (t / 0.3 - 1) ** 3 + c1 * (t / 0.3 - 1) ** 2 + 1
      : 1;
  }

  get expired() { return this.life <= 0; }
  get alpha() { return Math.min(1, this.life / this.maxLife * 2); }
}
