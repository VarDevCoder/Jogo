export class AmbientDust {
  constructor(count = 100) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        vy: -0.005 - Math.random() * 0.01,
        vx: (Math.random() - 0.5) * 0.005,
        size: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        ember: Math.random() < 0.15,
      });
    }
    this.t = 0;
  }

  update(dt) {
    this.t += dt;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
    }
  }
}
