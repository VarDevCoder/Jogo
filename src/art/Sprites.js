import { Palette } from '../core/Config.js';

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

function shadow(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y + r, r * 1.1, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function outline(ctx, fn) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 2;
  fn();
  ctx.stroke();
  ctx.restore();
}

export const Sprites = {
  wizard(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const moving = opts.moving || false;
    const facing = opts.facing || 1;
    const walk = moving ? Math.sin(t * 12) : 0;
    const bob = moving ? Math.abs(Math.sin(t * 12)) * 2 : Math.sin(t * 2) * 1;

    shadow(ctx, x, y + r * 0.6, r * 0.9);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    const legSwing = walk * r * 0.3;
    ctx.fillStyle = '#3a1f5e';
    ellipse(ctx, -r * 0.25 + legSwing, r * 0.55, r * 0.18, r * 0.28);
    ellipse(ctx, r * 0.25 - legSwing, r * 0.55, r * 0.18, r * 0.28);

    ctx.fillStyle = Palette.gold;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, r * 0.4);
    ctx.quadraticCurveTo(-r * 0.55, -r * 0.1, 0, -r * 0.2);
    ctx.quadraticCurveTo(r * 0.55, -r * 0.1, r * 0.7, r * 0.4);
    ctx.quadraticCurveTo(0, r * 0.7, -r * 0.7, r * 0.4);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, r * 0.4);
      ctx.quadraticCurveTo(-r * 0.55, -r * 0.1, 0, -r * 0.2);
      ctx.quadraticCurveTo(r * 0.55, -r * 0.1, r * 0.7, r * 0.4);
      ctx.quadraticCurveTo(0, r * 0.7, -r * 0.7, r * 0.4);
      ctx.closePath();
    });

    ctx.fillStyle = '#2a1846';
    ellipse(ctx, 0, -r * 0.05, r * 0.45, r * 0.4);

    ctx.fillStyle = Palette.tealSoft;
    ellipse(ctx, -r * 0.15, -r * 0.08, r * 0.07, r * 0.09);
    ellipse(ctx, r * 0.15, -r * 0.08, r * 0.07, r * 0.09);
    ctx.fillStyle = '#fff';
    ellipse(ctx, -r * 0.13, -r * 0.1, r * 0.025, r * 0.03);
    ellipse(ctx, r * 0.17, -r * 0.1, r * 0.025, r * 0.03);

    ctx.fillStyle = Palette.goldHot;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(-r * 0.25, -r * 0.15);
    ctx.lineTo(r * 0.25, -r * 0.15);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.55);
      ctx.lineTo(-r * 0.25, -r * 0.15);
      ctx.lineTo(r * 0.25, -r * 0.15);
      ctx.closePath();
    });

    const staffSway = walk * 0.1;
    ctx.save();
    ctx.translate(r * 0.55, r * 0.1);
    ctx.rotate(-0.2 + staffSway);
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(-r * 0.06, -r * 0.9, r * 0.12, r * 1.5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, -r * 0.95, 0, 0, -r * 0.95, r * 0.8);
    glow.addColorStop(0, Palette.teal);
    glow.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-r * 0.8, -r * 1.75, r * 1.6, r * 1.6);
    ctx.restore();
    ctx.fillStyle = Palette.teal;
    ellipse(ctx, 0, -r * 0.95, r * 0.18, r * 0.18);
    ctx.fillStyle = '#fff';
    ellipse(ctx, -r * 0.05, -r * 1, r * 0.06, r * 0.06);
    ctx.restore();

    ctx.restore();
  },

  ranger(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const moving = opts.moving || false;
    const facing = opts.facing || 1;
    const walk = moving ? Math.sin(t * 14) : 0;
    const bob = moving ? Math.abs(Math.sin(t * 14)) * 2 : Math.sin(t * 2) * 1;

    shadow(ctx, x, y + r * 0.6, r * 0.85);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    ctx.fillStyle = '#2d4a3e';
    ellipse(ctx, -r * 0.25 + walk * r * 0.3, r * 0.55, r * 0.16, r * 0.28);
    ellipse(ctx, r * 0.25 - walk * r * 0.3, r * 0.55, r * 0.16, r * 0.28);

    ctx.fillStyle = '#3a6b54';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.45);
    ctx.quadraticCurveTo(-r * 0.5, -r * 0.05, 0, -r * 0.15);
    ctx.quadraticCurveTo(r * 0.5, -r * 0.05, r * 0.55, r * 0.45);
    ctx.quadraticCurveTo(0, r * 0.65, -r * 0.55, r * 0.45);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, r * 0.45);
      ctx.quadraticCurveTo(-r * 0.5, -r * 0.05, 0, -r * 0.15);
      ctx.quadraticCurveTo(r * 0.5, -r * 0.05, r * 0.55, r * 0.45);
      ctx.quadraticCurveTo(0, r * 0.65, -r * 0.55, r * 0.45);
      ctx.closePath();
    });

    ctx.fillStyle = '#c9a574';
    ellipse(ctx, 0, -r * 0.3, r * 0.32, r * 0.36);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.3, r * 0.32, r * 0.36, 0, 0, Math.PI * 2); });

    ctx.fillStyle = '#2d4a3e';
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.45);
    ctx.quadraticCurveTo(0, -r * 0.85, r * 0.4, -r * 0.45);
    ctx.quadraticCurveTo(r * 0.45, -r * 0.4, r * 0.35, -r * 0.3);
    ctx.lineTo(-r * 0.35, -r * 0.3);
    ctx.quadraticCurveTo(-r * 0.45, -r * 0.4, -r * 0.4, -r * 0.45);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.45);
      ctx.quadraticCurveTo(0, -r * 0.85, r * 0.4, -r * 0.45);
      ctx.quadraticCurveTo(r * 0.45, -r * 0.4, r * 0.35, -r * 0.3);
      ctx.lineTo(-r * 0.35, -r * 0.3);
      ctx.quadraticCurveTo(-r * 0.45, -r * 0.4, -r * 0.4, -r * 0.45);
      ctx.closePath();
    });

    ctx.fillStyle = '#1a0828';
    ellipse(ctx, -r * 0.12, -r * 0.28, r * 0.06, r * 0.08);
    ellipse(ctx, r * 0.12, -r * 0.28, r * 0.06, r * 0.08);
    ctx.fillStyle = '#fff';
    ellipse(ctx, -r * 0.11, -r * 0.29, r * 0.02, r * 0.025);
    ellipse(ctx, r * 0.13, -r * 0.29, r * 0.02, r * 0.025);

    ctx.save();
    ctx.translate(r * 0.45, r * 0.05);
    ctx.rotate(0.2 + walk * 0.1);
    ctx.strokeStyle = '#5a3a1c';
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r * 0.4, -r * 0.45);
    ctx.lineTo(r * 0.4, r * 0.45);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  },

  knight(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const moving = opts.moving || false;
    const facing = opts.facing || 1;
    const swinging = opts.swinging || 0;
    const walk = moving ? Math.sin(t * 9) : 0;
    const bob = moving ? Math.abs(Math.sin(t * 9)) * 1.5 : Math.sin(t * 2) * 0.8;

    shadow(ctx, x, y + r * 0.65, r * 1.0);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    ctx.fillStyle = '#4a5060';
    ellipse(ctx, -r * 0.28 + walk * r * 0.18, r * 0.6, r * 0.2, r * 0.3);
    ellipse(ctx, r * 0.28 - walk * r * 0.18, r * 0.6, r * 0.2, r * 0.3);
    ctx.fillStyle = '#2a3040';
    ellipse(ctx, -r * 0.28 + walk * r * 0.18, r * 0.82, r * 0.22, r * 0.1);
    ellipse(ctx, r * 0.28 - walk * r * 0.18, r * 0.82, r * 0.22, r * 0.1);

    ctx.fillStyle = '#7a8090';
    ellipse(ctx, 0, r * 0.2, r * 0.55, r * 0.5);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, r * 0.2, r * 0.55, r * 0.5, 0, 0, Math.PI * 2); });

    ctx.fillStyle = '#c44';
    ctx.beginPath();
    ctx.moveTo(-r * 0.08, -r * 0.05);
    ctx.lineTo(r * 0.08, -r * 0.05);
    ctx.lineTo(r * 0.08, r * 0.55);
    ctx.lineTo(0, r * 0.45);
    ctx.lineTo(-r * 0.08, r * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(-r * 0.55, r * 0.1);
    ctx.rotate(-0.2);
    ctx.fillStyle = '#6a7080';
    ellipse(ctx, 0, 0, r * 0.5, r * 0.35);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 0, r * 0.5, r * 0.35, 0, 0, Math.PI * 2); });
    ctx.fillStyle = '#c44';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.25);
    ctx.lineTo(0, r * 0.25);
    ctx.moveTo(-r * 0.25, 0);
    ctx.lineTo(r * 0.25, 0);
    ctx.lineWidth = r * 0.08;
    ctx.strokeStyle = '#ffd86b';
    ctx.stroke();
    ctx.restore();

    const swing = swinging > 0 ? -Math.PI * 0.5 + (1 - swinging) * Math.PI : 0;
    ctx.save();
    ctx.translate(r * 0.5, r * 0.05);
    ctx.rotate(0.3 + swing + walk * 0.1);
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(-r * 0.05, -r * 0.05, r * 0.1, r * 0.25);
    ctx.fillStyle = '#ffd86b';
    ctx.fillRect(-r * 0.2, -r * 0.1, r * 0.4, r * 0.08);
    ctx.fillStyle = '#d8e0e8';
    ctx.beginPath();
    ctx.moveTo(-r * 0.08, -r * 0.12);
    ctx.lineTo(r * 0.08, -r * 0.12);
    ctx.lineTo(r * 0.05, -r * 1.0);
    ctx.lineTo(0, -r * 1.12);
    ctx.lineTo(-r * 0.05, -r * 1.0);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.08, -r * 0.12);
      ctx.lineTo(r * 0.08, -r * 0.12);
      ctx.lineTo(r * 0.05, -r * 1.0);
      ctx.lineTo(0, -r * 1.12);
      ctx.lineTo(-r * 0.05, -r * 1.0);
      ctx.closePath();
    });
    ctx.restore();

    ctx.fillStyle = '#a0a8c0';
    ellipse(ctx, 0, -r * 0.35, r * 0.4, r * 0.42);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.4, r * 0.42, 0, 0, Math.PI * 2); });

    ctx.fillStyle = '#1a0828';
    ctx.fillRect(-r * 0.3, -r * 0.42, r * 0.6, r * 0.12);
    ctx.fillStyle = '#00f5ff';
    ctx.fillRect(-r * 0.22, -r * 0.4, r * 0.12, r * 0.08);
    ctx.fillRect(r * 0.1, -r * 0.4, r * 0.12, r * 0.08);

    ctx.fillStyle = '#c44';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.78);
    ctx.lineTo(-r * 0.12, -r * 0.95);
    ctx.lineTo(r * 0.12, -r * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d8e0e8';
    ctx.fillRect(-r * 0.03, -r * 0.78, r * 0.06, r * 0.1);

    ctx.restore();
  },

  zombie(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 8);
    const bob = Math.abs(walk) * 2;
    const tilt = walk * 0.08;

    shadow(ctx, x, y + r * 0.5, r * 0.8);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);
    ctx.rotate(tilt);

    ctx.fillStyle = flash || '#3a1f5e';
    ellipse(ctx, -r * 0.3 + walk * r * 0.2, r * 0.55, r * 0.18, r * 0.25);
    ellipse(ctx, r * 0.3 - walk * r * 0.2, r * 0.55, r * 0.18, r * 0.25);

    ctx.fillStyle = flash || '#4a2570';
    ellipse(ctx, 0, r * 0.15, r * 0.55, r * 0.45);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, r * 0.15, r * 0.55, r * 0.45, 0, 0, Math.PI * 2); });

    ctx.save();
    ctx.rotate(-0.3 + walk * 0.2);
    ctx.fillStyle = flash || '#4a2570';
    ellipse(ctx, -r * 0.7, r * 0.1, r * 0.13, r * 0.35);
    ctx.restore();
    ctx.save();
    ctx.rotate(0.3 - walk * 0.2);
    ctx.fillStyle = flash || '#4a2570';
    ellipse(ctx, r * 0.7, r * 0.1, r * 0.13, r * 0.35);
    ctx.restore();

    ctx.fillStyle = flash || opts.color || Palette.enemy1;
    ellipse(ctx, 0, -r * 0.35, r * 0.45, r * 0.42);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.45, r * 0.42, 0, 0, Math.PI * 2); });

    if (!flash) {
      ctx.fillStyle = '#fff';
      ellipse(ctx, -r * 0.15, -r * 0.35, r * 0.09, r * 0.1);
      ellipse(ctx, r * 0.18, -r * 0.35, r * 0.09, r * 0.1);
      ctx.fillStyle = '#f00';
      ellipse(ctx, -r * 0.15, -r * 0.33, r * 0.04, r * 0.05);
      ellipse(ctx, r * 0.18, -r * 0.33, r * 0.04, r * 0.05);
      ctx.fillStyle = '#1a0828';
      ctx.fillRect(-r * 0.18, -r * 0.12, r * 0.36, r * 0.05);
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-r * 0.05 + i * r * 0.12, -r * 0.12, r * 0.04, r * 0.06);
      }
    }

    ctx.restore();
  },

  skeleton(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 10);
    const bob = Math.abs(walk) * 2.5;

    shadow(ctx, x, y + r * 0.55, r * 0.75);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    ctx.fillStyle = flash || '#e8d8c0';
    ctx.fillRect(-r * 0.06 + walk * r * 0.25, r * 0.3, r * 0.1, r * 0.5);
    ctx.fillRect(-r * 0.06 - walk * r * 0.25, r * 0.3, r * 0.1, r * 0.5);

    ctx.fillStyle = flash || opts.color || '#d4c4a8';
    ellipse(ctx, 0, r * 0.1, r * 0.4, r * 0.42);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, r * 0.1, r * 0.4, r * 0.42, 0, 0, Math.PI * 2); });

    ctx.save();
    ctx.translate(-r * 0.45, r * 0.05);
    ctx.rotate(-0.4 - walk * 0.3);
    ctx.fillStyle = flash || '#e8d8c0';
    ctx.fillRect(-r * 0.05, 0, r * 0.1, r * 0.4);
    ctx.restore();
    ctx.save();
    ctx.translate(r * 0.45, r * 0.05);
    ctx.rotate(0.4 + walk * 0.3);
    ctx.fillStyle = flash || '#e8d8c0';
    ctx.fillRect(-r * 0.05, 0, r * 0.1, r * 0.4);
    ctx.fillStyle = '#888';
    ctx.fillRect(-r * 0.02, r * 0.35, r * 0.04, r * 0.5);
    ctx.fillStyle = '#bbb';
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, r * 0.8);
    ctx.lineTo(r * 0.18, r * 0.8);
    ctx.lineTo(0, r * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = flash || '#f0e4cc';
    ellipse(ctx, 0, -r * 0.35, r * 0.38, r * 0.4);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.38, r * 0.4, 0, 0, Math.PI * 2); });

    if (!flash) {
      ctx.fillStyle = '#1a0828';
      ellipse(ctx, -r * 0.13, -r * 0.38, r * 0.09, r * 0.11);
      ellipse(ctx, r * 0.13, -r * 0.38, r * 0.09, r * 0.11);
      ctx.fillStyle = Palette.teal;
      ellipse(ctx, -r * 0.13, -r * 0.36, r * 0.04, r * 0.05);
      ellipse(ctx, r * 0.13, -r * 0.36, r * 0.04, r * 0.05);
      for (let i = -2; i <= 2; i++) {
        ctx.fillStyle = '#1a0828';
        ctx.fillRect(-r * 0.02 + i * r * 0.08, -r * 0.18, r * 0.04, r * 0.08);
      }
    }

    ctx.restore();
  },

  ghost(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const bob = Math.sin(t * 3) * 4;
    const wave = Math.sin(t * 4);

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ellipse(ctx, x, y + r * 0.7, r * 0.7, r * 0.2);
    ctx.restore();

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(facing, 1);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.8);
    glow.addColorStop(0, 'rgba(199, 125, 255, 0.5)');
    glow.addColorStop(1, 'rgba(199, 125, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-r * 1.8, -r * 1.8, r * 3.6, r * 3.6);
    ctx.restore();

    ctx.fillStyle = flash || opts.color || Palette.enemy3;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, r * 0.5);
    ctx.quadraticCurveTo(-r * 0.85, -r * 0.3, -r * 0.4, -r * 0.7);
    ctx.quadraticCurveTo(0, -r * 0.95, r * 0.4, -r * 0.7);
    ctx.quadraticCurveTo(r * 0.85, -r * 0.3, r * 0.7, r * 0.5);
    for (let i = 0; i < 4; i++) {
      const px = r * 0.7 - i * r * 0.4;
      const py = r * 0.5 + (i % 2 === 0 ? wave * r * 0.1 : -wave * r * 0.1);
      ctx.quadraticCurveTo(px - r * 0.1, py + r * 0.2, px - r * 0.2, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.85, -r * 0.3, -r * 0.4, -r * 0.7);
      ctx.quadraticCurveTo(0, -r * 0.95, r * 0.4, -r * 0.7);
      ctx.quadraticCurveTo(r * 0.85, -r * 0.3, r * 0.7, r * 0.5);
      ctx.closePath();
    });

    if (!flash) {
      ctx.fillStyle = '#1a0828';
      ellipse(ctx, -r * 0.2, -r * 0.35, r * 0.12, r * 0.16);
      ellipse(ctx, r * 0.2, -r * 0.35, r * 0.12, r * 0.16);
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.05, r * 0.12, r * 0.15, 0, 0, Math.PI);
      ctx.fill();
    }

    ctx.restore();
  },

  demon(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 7);
    const bob = Math.abs(walk) * 3;

    shadow(ctx, x, y + r * 0.6, r * 1.0);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    ctx.fillStyle = flash || '#4a0e0e';
    ellipse(ctx, -r * 0.3 + walk * r * 0.15, r * 0.55, r * 0.2, r * 0.3);
    ellipse(ctx, r * 0.3 - walk * r * 0.15, r * 0.55, r * 0.2, r * 0.3);

    ctx.fillStyle = flash || opts.color || Palette.enemy4;
    ellipse(ctx, 0, r * 0.15, r * 0.6, r * 0.5);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, r * 0.15, r * 0.6, r * 0.5, 0, 0, Math.PI * 2); });

    ctx.save();
    ctx.rotate(-0.4 + walk * 0.3);
    ctx.fillStyle = flash || opts.color || Palette.enemy4;
    ellipse(ctx, -r * 0.75, r * 0.1, r * 0.16, r * 0.4);
    ctx.fillStyle = flash || '#8b0000';
    ellipse(ctx, -r * 0.75, r * 0.5, r * 0.18, r * 0.12);
    ctx.restore();
    ctx.save();
    ctx.rotate(0.4 - walk * 0.3);
    ctx.fillStyle = flash || opts.color || Palette.enemy4;
    ellipse(ctx, r * 0.75, r * 0.1, r * 0.16, r * 0.4);
    ctx.fillStyle = flash || '#8b0000';
    ellipse(ctx, r * 0.75, r * 0.5, r * 0.18, r * 0.12);
    ctx.restore();

    ctx.fillStyle = flash || opts.color || Palette.enemy4;
    ellipse(ctx, 0, -r * 0.4, r * 0.5, r * 0.48);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.4, r * 0.5, r * 0.48, 0, 0, Math.PI * 2); });

    ctx.fillStyle = flash || '#2a0000';
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.7);
    ctx.lineTo(-r * 0.55, -r * 1.15);
    ctx.lineTo(-r * 0.25, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.4, -r * 0.7);
    ctx.lineTo(r * 0.55, -r * 1.15);
    ctx.lineTo(r * 0.25, -r * 0.7);
    ctx.closePath();
    ctx.fill();

    if (!flash) {
      ctx.fillStyle = Palette.goldHot;
      ellipse(ctx, -r * 0.18, -r * 0.42, r * 0.1, r * 0.12);
      ellipse(ctx, r * 0.18, -r * 0.42, r * 0.1, r * 0.12);
      ctx.fillStyle = '#000';
      ctx.fillRect(-r * 0.2, -r * 0.43, r * 0.04, r * 0.1);
      ctx.fillRect(r * 0.16, -r * 0.43, r * 0.04, r * 0.1);
      ctx.fillStyle = '#fff';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * r * 0.12 - r * 0.05, -r * 0.18);
        ctx.lineTo(i * r * 0.12, -r * 0.05);
        ctx.lineTo(i * r * 0.12 + r * 0.05, -r * 0.18);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  },
};

export const ENEMY_SPRITES = ['zombie', 'skeleton', 'ghost', 'demon'];
