import { Palette } from '../core/Config.js';
import { Sprites } from '../art/Sprites.js';

export class Renderer {
  constructor(canvas, background) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.background = background;
    this.width = 0; this.height = 0; this.dpr = 1;
    this.shakeX = 0; this.shakeY = 0;
    this.time = 0;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  getSize() { return { width: this.width, height: this.height }; }

  setShake(x, y) { this.shakeX = x; this.shakeY = y; }
  tick(dt) { this.time += dt; }

  beginFrame() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.translate(this.shakeX, this.shakeY);
  }

  clear() {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
    );
    g.addColorStop(0, '#241040');
    g.addColorStop(1, Palette.bgDeep);
    ctx.fillStyle = g;
    ctx.fillRect(-30, -30, this.width + 60, this.height + 60);

    if (this.background?.noise) {
      const pattern = ctx.createPattern(this.background.noise, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(-30, -30, this.width + 60, this.height + 60);
    }
  }

  drawGrid(cam, grid) {
    const ctx = this.ctx;
    const breathe = 0.08 + 0.06 * Math.sin(this.time * 1.5);
    ctx.strokeStyle = `rgba(110, 231, 255, ${breathe})`;
    ctx.lineWidth = 1;
    const size = grid.size;
    const ox = -cam.x % size, oy = -cam.y % size;
    ctx.beginPath();
    for (let x = ox; x < this.width; x += size) { ctx.moveTo(x, 0); ctx.lineTo(x, this.height); }
    for (let y = oy; y < this.height; y += size) { ctx.moveTo(0, y); ctx.lineTo(this.width, y); }
    ctx.stroke();
  }

  drawAmbientDust(dust) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of dust.particles) {
      const x = p.x * this.width;
      const y = p.y * this.height;
      const flicker = 0.5 + 0.5 * Math.sin(this.time * 5 + p.phase);
      if (p.ember) {
        ctx.fillStyle = `rgba(255, 186, 8, ${p.alpha * flicker})`;
      } else {
        ctx.fillStyle = `rgba(199, 125, 255, ${p.alpha * 0.6})`;
      }
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawParticle(p, cam) {
    const ctx = this.ctx;
    const a = Math.max(0, p.life * 2);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const x = p.x - cam.x, y = p.y - cam.y;
    const r = 3 * a + 1;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, p.color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a;
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawGem(g, cam) {
    const ctx = this.ctx;
    const x = g.x - cam.x, y = g.y - cam.y;
    const pulse = 1 + 0.15 * Math.sin(this.time * 6);
    const r = g.r * pulse;
    const color = g.xp >= 4 ? Palette.gold : g.xp >= 2 ? Palette.teal : Palette.tealSoft;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    ctx.restore();

    const sx = Math.cos(this.time * 4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * Math.abs(sx), y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * Math.abs(sx), y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  drawEnemy(e, cam) {
    const ctx = this.ctx;
    const x = e.x - cam.x, y = e.y - cam.y;
    const scale = 1 + (e.scalePunch || 0);
    const fn = Sprites[e.sprite] || Sprites.zombie;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    fn(ctx, 0, 0, e.r, {
      time: this.time + e.seed,
      facing: e.facing,
      color: e.color,
      flash: e.hitFlash > 0 ? '#fff' : null,
    });
    ctx.restore();

    if (e.hp < e.hpMax) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(x - e.r, y - e.r - 12, e.r * 2, 4);
      ctx.fillStyle = Palette.amber;
      ctx.fillRect(x - e.r, y - e.r - 12, e.r * 2 * (e.hp / e.hpMax), 4);
    }
  }

  drawBullet(b, cam) {
    const ctx = this.ctx;
    const x = b.x - cam.x, y = b.y - cam.y;
    ctx.save();

    if (b.type === 'area') {
      ctx.globalCompositeOperation = 'lighter';
      const a = b.life / b.maxLife;
      const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
      g.addColorStop(0, `rgba(0, 245, 255, ${a * 0.5})`);
      g.addColorStop(1, 'rgba(0, 245, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);
      ctx.strokeStyle = `rgba(110, 231, 255, ${a})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, b.r, 0, Math.PI * 2); ctx.stroke();
    } else if (b.type === 'arrow') {
      ctx.translate(x, y);
      ctx.rotate(b.angle);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(-20, 0, 10, 0);
      g.addColorStop(0, 'rgba(95, 255, 175, 0)');
      g.addColorStop(1, 'rgba(95, 255, 175, 0.8)');
      ctx.fillStyle = g;
      ctx.fillRect(-20, -3, 30, 6);
      ctx.restore();
      ctx.fillStyle = '#5a3a1c';
      ctx.fillRect(-12, -1.5, 18, 3);
      ctx.fillStyle = '#d8e0e8';
      ctx.beginPath();
      ctx.moveTo(6, -5);
      ctx.lineTo(14, 0);
      ctx.lineTo(6, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5fffaf';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-16, -4);
      ctx.lineTo(-16, 4);
      ctx.closePath();
      ctx.fill();
    } else if (b.type === 'slash') {
      const a = Math.sin((1 - b.life / b.maxLife) * Math.PI);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, b.r * 0.4, x, y, b.r);
      g.addColorStop(0, 'rgba(0, 0, 0, 0)');
      g.addColorStop(0.7, `rgba(255, 255, 255, ${a * 0.5})`);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, b.r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, b.r * 4);
      g.addColorStop(0, Palette.goldHot);
      g.addColorStop(0.4, 'rgba(255, 186, 8, 0.5)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - b.r * 4, y - b.r * 4, b.r * 8, b.r * 8);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, b.r * 0.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawPlayer(p, cam) {
    const ctx = this.ctx;
    const x = p.x - cam.x, y = p.y - cam.y;
    const sx = p.squashX || 1;
    const sy = p.squashY || 1;
    const tilt = p.tilt || 0;
    const r = p.r * 1.6;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
    halo.addColorStop(0, 'rgba(246, 196, 83, 0.45)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5);
    ctx.restore();

    if (p.trail && p.trail.length) {
      for (let i = 0; i < p.trail.length; i++) {
        const t = p.trail[i];
        const a = (i + 1) / p.trail.length * 0.25;
        ctx.fillStyle = `rgba(246, 196, 83, ${a})`;
        ctx.beginPath();
        ctx.arc(t.x - cam.x, t.y - cam.y + r * 0.3, r * (0.3 + i / p.trail.length * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(sx, sy);
    const fn = Sprites[p.sprite] || Sprites.wizard;
    fn(ctx, 0, 0, r, {
      time: this.time,
      moving: p.moving,
      facing: p.facing || 1,
      swinging: p.swinging || 0,
    });
    ctx.restore();
  }

  drawDamageNumber(d, cam) {
    const ctx = this.ctx;
    const x = d.x - cam.x, y = d.y - cam.y;
    const size = (d.crit ? 28 : 18) * d.scale;
    if (size <= 0) return;
    ctx.save();
    ctx.globalAlpha = d.alpha;
    ctx.translate(x, y);
    ctx.rotate(d.rot);
    ctx.font = `900 ${size}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.strokeText(d.amount, 0, 0);
    ctx.fillStyle = d.crit ? Palette.goldHot : '#fff';
    ctx.fillText(d.amount, 0, 0);
    ctx.restore();
  }

  drawLighting(cam, player) {
    const ctx = this.ctx;
    const px = player.x - cam.x;
    const py = player.y - cam.y;

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const g = ctx.createRadialGradient(px, py, 40, px, py, 380);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(120, 90, 180, 0.95)');
    g.addColorStop(1, 'rgba(20, 8, 40, 1)');
    ctx.fillStyle = g;
    ctx.fillRect(-30, -30, this.width + 60, this.height + 60);
    ctx.restore();
  }

  drawVignette() {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.height * 0.3,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.75
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = g;
    ctx.fillRect(-30, -30, this.width + 60, this.height + 60);
  }

  drawFlash(alpha) {
    if (alpha <= 0) return;
    this.ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    this.ctx.fillRect(-30, -30, this.width + 60, this.height + 60);
  }
}
