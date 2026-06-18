export class Gem {
  constructor(x, y, xp, gold = 0) {
    this.x = x; this.y = y;
    this.xp = xp;
    this.gold = gold;
    this.r = gold ? 7 : 6;
  }

  attractTo(targetX, targetY, dt, speed = 400) {
    const dx = targetX - this.x, dy = targetY - this.y;
    const d = Math.hypot(dx, dy) || 1;
    this.x += dx / d * speed * dt;
    this.y += dy / d * speed * dt;
  }
}
