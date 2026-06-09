export class Bullet {
  constructor({ x, y, vx, vy, dmg, r, life, type, maxR, follow }) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.dmg = dmg;
    this.r = r;
    this.life = life;
    this.maxLife = life;
    this.type = type;
    this.maxR = maxR;
    this.angle = Math.atan2(vy, vx);
    this.follow = follow || null;
    this.hits = new Set();
  }

  update(dt) {
    if (this.follow) {
      this.x = this.follow.x;
      this.y = this.follow.y;
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
    this.life -= dt;
    if (this.type === 'area') {
      this.r = this.maxR * (1 - this.life / this.maxLife);
    } else if (this.type === 'slash') {
      const t = 1 - this.life / this.maxLife;
      this.r = this.maxR * Math.sin(t * Math.PI);
    }
  }

  get expired() { return this.life <= 0; }
}
