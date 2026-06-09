export class Particle {
  constructor(x, y, vx, vy, color, life = 0.5) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.life = life;
  }
}
