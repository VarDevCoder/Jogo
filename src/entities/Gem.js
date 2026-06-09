export class Gem {
  constructor(x, y, xp) {
    this.x = x; this.y = y;
    this.xp = xp;
    this.r = 6;
  }

  attractTo(targetX, targetY, dt) {
    const dx = targetX - this.x, dy = targetY - this.y;
    const d = Math.hypot(dx, dy) || 1;
    this.x += dx / d * 400 * dt;
    this.y += dy / d * 400 * dt;
  }
}
