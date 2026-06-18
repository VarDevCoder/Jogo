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

    // moneda de oro giratoria
    if (g.gold) {
      const spin = Math.abs(Math.cos(this.time * 5 + g.x * 0.1));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(x, y, 0, x, y, g.r * 2.4);
      glow.addColorStop(0, 'rgba(255, 216, 107, 0.5)');
      glow.addColorStop(1, 'rgba(255, 216, 107, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - g.r * 2.4, y - g.r * 2.4, g.r * 4.8, g.r * 4.8);
      ctx.restore();
      ctx.fillStyle = '#d4a73a';
      ctx.beginPath();
      ctx.ellipse(x, y, g.r * Math.max(0.25, spin), g.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe9a0';
      ctx.beginPath();
      ctx.ellipse(x, y, g.r * Math.max(0.15, spin) * 0.6, g.r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

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

  drawChest(c, cam) {
    const ctx = this.ctx;
    const x = c.x - cam.x;
    const bounce = Math.abs(Math.sin(c.t * 3)) * 5;
    const y = c.y - cam.y - bounce;
    const r = c.r;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.4 + 0.25 * Math.sin(this.time * 4);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    glow.addColorStop(0, `rgba(255, 216, 107, ${pulse})`);
    glow.addColorStop(1, 'rgba(255, 216, 107, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, c.y - cam.y + r * 0.8, r * 1.1, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // cuerpo
    ctx.fillStyle = '#6e4a24';
    ctx.fillRect(x - r, y - r * 0.3, r * 2, r * 1.1);
    // tapa
    ctx.fillStyle = '#8a5e30';
    ctx.beginPath();
    ctx.moveTo(x - r, y - r * 0.3);
    ctx.quadraticCurveTo(x, y - r * 1.1, x + r, y - r * 0.3);
    ctx.closePath();
    ctx.fill();
    // bandas doradas
    ctx.fillStyle = '#ffd86b';
    ctx.fillRect(x - r, y - r * 0.35, r * 2, r * 0.14);
    ctx.fillRect(x - r * 0.12, y - r * 0.3, r * 0.24, r * 1.1);
    // cerradura
    ctx.fillStyle = '#ffe9a0';
    ctx.beginPath();
    ctx.arc(x, y + r * 0.15, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    // contorno
    ctx.strokeStyle = 'rgba(10,4,24,0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - r, y - r * 0.3, r * 2, r * 1.1);
  }

  drawPickup(it, cam) {
    const ctx = this.ctx;
    const x = it.x - cam.x;
    const y = it.y - cam.y + Math.sin(it.t * 3) * 4;
    const r = it.r;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
    glow.addColorStop(0, 'rgba(110, 231, 255, 0.5)');
    glow.addColorStop(1, 'rgba(110, 231, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - r * 2.6, y - r * 2.6, r * 5.2, r * 5.2);
    ctx.restore();

    if (it.type === 'magnet') {
      ctx.save();
      ctx.translate(x, y);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#d84444';
      ctx.lineWidth = r * 0.45;
      ctx.beginPath();
      ctx.arc(0, -r * 0.1, r * 0.6, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#eef0f4';
      ctx.lineWidth = r * 0.45;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.1);
      ctx.lineTo(-r * 0.6, r * 0.45);
      ctx.moveTo(r * 0.6, -r * 0.1);
      ctx.lineTo(r * 0.6, r * 0.45);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawEnemy(e, cam) {
    const ctx = this.ctx;
    const x = e.x - cam.x, y = e.y - cam.y;
    const scale = 1 + (e.scalePunch || 0);
    const fn = Sprites[e.sprite] || Sprites.slime;

    if (e.isBoss) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pulse = 0.22 + 0.1 * Math.sin(this.time * 4);
      const aura = ctx.createRadialGradient(x, y, 0, x, y, e.r * 2);
      aura.addColorStop(0, `rgba(255, 60, 60, ${pulse})`);
      aura.addColorStop(1, 'rgba(255, 60, 60, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(x - e.r * 2, y - e.r * 2, e.r * 4, e.r * 4);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    fn(ctx, 0, 0, e.r, {
      time: this.time + e.seed,
      facing: e.facing,
      color: e.color,
      flash: e.hitFlash > 0 ? '#fff' : null,
    });
    if (e.isBoss) Sprites.crown(ctx, 0, -e.r * 1.15, e.r * 0.65);
    ctx.restore();

    if (e.isBoss) {
      const bw = e.r * 2.2, bh = 7;
      const by = y - e.r * 1.7;
      ctx.font = `900 ${Math.max(13, e.r * 0.32)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.strokeText(e.name, x, by - 5);
      ctx.fillStyle = Palette.goldHot;
      ctx.fillText(e.name, x, by - 5);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(x - bw / 2, by, bw, bh);
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(x - bw / 2, by, bw * (e.hp / e.hpMax), bh);
    } else if (e.hp < e.hpMax) {
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

    if (b.type === 'laser_column') {
      this._drawLaserColumn(b, x, y);
    } else if (b.type === 'whirlwind') {
      this._drawWhirlwind(b, x, y);
    } else if (b.type === 'inferno_pool') {
      this._drawInfernoPool(b, x, y);
    } else if (b.type === 'arrow_rain_marker') {
      this._drawArrowRainMarker(b, x, y);
    } else if (b.type === 'rain_arrow') {
      this._drawRainArrow(b, x, y);
    } else if (b.type === 'area') {
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
    } else if (b.type === 'potion') {
      ctx.translate(x, y);
      ctx.rotate(b.angle + (1 - b.life / b.maxLife) * 9);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
      pg.addColorStop(0, 'rgba(95, 211, 138, 0.55)');
      pg.addColorStop(1, 'rgba(95, 211, 138, 0)');
      ctx.fillStyle = pg;
      ctx.fillRect(-16, -16, 32, 32);
      ctx.restore();
      // frasco
      ctx.fillStyle = 'rgba(220, 245, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(-2.5, -7);
      ctx.lineTo(2.5, -7);
      ctx.lineTo(5.5, 3);
      ctx.quadraticCurveTo(0, 8, -5.5, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5fd38a';
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(4, 0);
      ctx.lineTo(5.5, 3);
      ctx.quadraticCurveTo(0, 8, -5.5, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5a3a1c';
      ctx.fillRect(-2, -10, 4, 4);
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

  // aro expansivo mientras el imán está activo
  drawMagnetAura(player, cam, magnetT) {
    const ctx = this.ctx;
    const x = player.x - cam.x, y = player.y - cam.y;
    const t = (this.time * 2) % 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 2; i++) {
      const p = (t + i * 0.5) % 1;
      const r = 40 + (1 - p) * 320;
      ctx.strokeStyle = `rgba(110, 231, 255, ${p * 0.45 * Math.min(1, magnetT)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // viñeta roja pulsante cuando la vida está crítica
  drawLowHp(intensity) {
    const ctx = this.ctx;
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 6);
    const a = intensity * (0.25 + 0.2 * pulse);
    const g = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.height * 0.35,
      this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.7
    );
    g.addColorStop(0, 'rgba(200, 30, 30, 0)');
    g.addColorStop(1, `rgba(200, 30, 30, ${a})`);
    ctx.fillStyle = g;
    ctx.fillRect(-30, -30, this.width + 60, this.height + 60);
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

  // ===================== ULTI VISUALS =====================
  _drawLaserColumn(b, x, y) {
    const ctx = this.ctx;
    const halfW = b.columnHalfW || b.r;
    const t = b.life / b.maxLife;
    const flicker = 0.85 + 0.15 * Math.sin(this.time * 60);
    const alpha = Math.min(1, t * 1.6) * flicker;
    const top = -60, bot = this.height + 60;

    // Outer wide glow
    ctx.globalCompositeOperation = 'lighter';
    const gW = halfW * 3.2;
    const grad = ctx.createLinearGradient(x - gW, 0, x + gW, 0);
    grad.addColorStop(0, 'rgba(110, 231, 255, 0)');
    grad.addColorStop(0.5, `rgba(110, 231, 255, ${0.35 * alpha})`);
    grad.addColorStop(1, 'rgba(110, 231, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - gW, top, gW * 2, bot - top);

    // Core column
    const core = ctx.createLinearGradient(x - halfW, 0, x + halfW, 0);
    core.addColorStop(0, `rgba(110, 231, 255, ${0.25 * alpha})`);
    core.addColorStop(0.4, `rgba(180, 240, 255, ${0.75 * alpha})`);
    core.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * alpha})`);
    core.addColorStop(0.6, `rgba(180, 240, 255, ${0.75 * alpha})`);
    core.addColorStop(1, `rgba(110, 231, 255, ${0.25 * alpha})`);
    ctx.fillStyle = core;
    ctx.fillRect(x - halfW, top, halfW * 2, bot - top);

    // Bright center line
    ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * alpha})`;
    ctx.fillRect(x - 3, top, 6, bot - top);

    // Horizontal shockwave rings at player base
    const t2 = 1 - t;
    for (let k = 0; k < 3; k++) {
      const phase = (t2 * 1.2 + k * 0.33) % 1;
      const rr = phase * halfW * 4;
      const a = (1 - phase) * 0.45 * alpha;
      ctx.strokeStyle = `rgba(180, 240, 255, ${a})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y, rr, rr * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sparks falling
    if (Math.random() < 0.3) {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      for (let k = 0; k < 5; k++) {
        const sx = x + (Math.random() - 0.5) * halfW * 1.6;
        const sy = Math.random() * this.height;
        ctx.fillRect(sx, sy, 2, 6 + Math.random() * 10);
      }
    }
  }

  _drawWhirlwind(b, x, y) {
    const ctx = this.ctx;
    const t = b.life / b.maxLife;
    const alpha = Math.min(1, t * 1.4);
    const rot = this.time * 12;

    // Trail ring
    ctx.globalCompositeOperation = 'lighter';
    const ringGrad = ctx.createRadialGradient(x, y, b.r * 0.25, x, y, b.r * 1.15);
    ringGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    ringGrad.addColorStop(0.65, `rgba(255, 255, 255, ${0.18 * alpha})`);
    ringGrad.addColorStop(0.9, `rgba(180, 220, 255, ${0.55 * alpha})`);
    ringGrad.addColorStop(1, 'rgba(180, 220, 255, 0)');
    ctx.fillStyle = ringGrad;
    ctx.fillRect(x - b.r * 1.2, y - b.r * 1.2, b.r * 2.4, b.r * 2.4);

    // Motion blur arcs
    for (let k = 0; k < 5; k++) {
      const a1 = rot + k * 0.5;
      const a2 = a1 + 0.6;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 * alpha * (1 - k / 5)})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(x, y, b.r * (0.7 + k * 0.06), a1, a2);
      ctx.stroke();
    }

    // 6 spinning swords
    const swords = 6;
    for (let i = 0; i < swords; i++) {
      const a = rot + (i / swords) * Math.PI * 2;
      const sx = x + Math.cos(a) * b.r * 0.85;
      const sy = y + Math.sin(a) * b.r * 0.85;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(a + Math.PI / 2);
      // blade
      const bladeGrad = ctx.createLinearGradient(0, -22, 0, 22);
      bladeGrad.addColorStop(0, '#ffffff');
      bladeGrad.addColorStop(0.5, '#d8e0e8');
      bladeGrad.addColorStop(1, '#8a98a8');
      ctx.fillStyle = bladeGrad;
      ctx.fillRect(-3, -22, 6, 30);
      // tip
      ctx.beginPath();
      ctx.moveTo(-3, -22);
      ctx.lineTo(3, -22);
      ctx.lineTo(0, -30);
      ctx.closePath();
      ctx.fill();
      // guard
      ctx.fillStyle = '#f6c453';
      ctx.fillRect(-7, 6, 14, 3);
      // hilt
      ctx.fillStyle = '#5a3a1c';
      ctx.fillRect(-2, 9, 4, 9);
      ctx.restore();
    }

    // Center burst
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 8 + Math.sin(this.time * 20) * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawInfernoPool(b, x, y) {
    const ctx = this.ctx;
    const t = b.life / b.maxLife;
    const alpha = Math.min(1, t * 1.5);

    // Base pool
    ctx.globalCompositeOperation = 'lighter';
    const pool = ctx.createRadialGradient(x, y, 0, x, y, b.r);
    pool.addColorStop(0, `rgba(140, 255, 140, ${0.45 * alpha})`);
    pool.addColorStop(0.55, `rgba(95, 255, 175, ${0.35 * alpha})`);
    pool.addColorStop(1, 'rgba(95, 255, 175, 0)');
    ctx.fillStyle = pool;
    ctx.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);

    // Outline ring
    ctx.strokeStyle = `rgba(95, 255, 175, ${0.6 * alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, b.r * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    // Toxic bubbles (deterministic via bubbleSeed)
    const seed = b.bubbleSeed || 0;
    for (let i = 0; i < 5; i++) {
      const ph = (this.time * 1.5 + seed + i * 0.7) % 1;
      const ang = (seed + i * 1.7) * Math.PI * 2;
      const dist = b.r * 0.55 * (0.4 + ph * 0.5);
      const bx = x + Math.cos(ang) * dist;
      const by = y + Math.sin(ang) * dist - ph * 14;
      const br = (1 - ph) * 6;
      const ba = (1 - ph) * 0.7 * alpha;
      ctx.fillStyle = `rgba(180, 255, 200, ${ba})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Toxic gas wisp
    const wisp = ctx.createRadialGradient(x, y - 6, 0, x, y - 6, b.r * 0.7);
    wisp.addColorStop(0, `rgba(120, 255, 160, ${0.18 * alpha})`);
    wisp.addColorStop(1, 'rgba(120, 255, 160, 0)');
    ctx.fillStyle = wisp;
    ctx.fillRect(x - b.r, y - b.r - 6, b.r * 2, b.r * 2);
  }

  _drawArrowRainMarker(b, x, y) {
    const ctx = this.ctx;
    const t = b.life / b.maxLife;
    const pulse = 0.7 + 0.3 * Math.sin(this.time * 8);
    const alpha = Math.min(1, t * 1.5);

    ctx.globalCompositeOperation = 'lighter';
    // ground circle
    const g = ctx.createRadialGradient(x, y, b.r * 0.2, x, y, b.r);
    g.addColorStop(0, `rgba(255, 80, 80, 0)`);
    g.addColorStop(0.7, `rgba(255, 60, 80, ${0.15 * alpha})`);
    g.addColorStop(1, `rgba(255, 100, 100, ${0.45 * alpha * pulse})`);
    ctx.fillStyle = g;
    ctx.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);

    // Pulsing ring
    ctx.strokeStyle = `rgba(255, 90, 110, ${0.75 * alpha * pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, b.r * pulse, b.r * 0.35 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair
    ctx.strokeStyle = `rgba(255, 180, 180, ${0.5 * alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
    ctx.stroke();
  }

  _drawRainArrow(b, x, y) {
    const ctx = this.ctx;
    const ty = (b.targetY != null) ? (b.targetY - (b.y - y)) : y; // target in screen space
    // Trail
    ctx.globalCompositeOperation = 'lighter';
    const trailLen = 36;
    const grad = ctx.createLinearGradient(x, y - trailLen, x, y);
    grad.addColorStop(0, 'rgba(95, 255, 175, 0)');
    grad.addColorStop(1, 'rgba(95, 255, 175, 0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - 2, y - trailLen, 4, trailLen);

    // Arrow shaft
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(x - 1, y - 14, 2, 14);
    // Arrow head
    ctx.fillStyle = '#d8e0e8';
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x + 4, y);
    ctx.lineTo(x, y + 7);
    ctx.closePath();
    ctx.fill();
    // Fletching
    ctx.fillStyle = '#5fffaf';
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x - 4, y - 18);
    ctx.lineTo(x + 4, y - 18);
    ctx.closePath();
    ctx.fill();

    // Landing target ring
    const ringR = Math.max(0, ty - y);
    if (ringR > 0 && ringR < 80) {
      ctx.strokeStyle = `rgba(255, 100, 120, ${0.35})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, ty, 10, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
