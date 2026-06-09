import { Palette } from '../core/Config.js';

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) ctx.fillStyle = fill;
  ctx.fill();
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

  slime(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const squish = Math.sin(t * 6);
    const sx = 1 + squish * 0.12;
    const sy = 1 - squish * 0.12;
    const hop = Math.max(0, squish) * r * 0.25;

    shadow(ctx, x, y + r * 0.45, r * 0.9 * sx);

    ctx.save();
    ctx.translate(x, y - hop);
    ctx.scale(facing * sx, sy);

    ctx.fillStyle = flash || opts.color || '#3ddc84';
    ctx.beginPath();
    ctx.moveTo(-r * 0.85, r * 0.5);
    ctx.quadraticCurveTo(-r * 0.95, -r * 0.35, -r * 0.35, -r * 0.65);
    ctx.quadraticCurveTo(0, -r * 0.85, r * 0.35, -r * 0.65);
    ctx.quadraticCurveTo(r * 0.95, -r * 0.35, r * 0.85, r * 0.5);
    ctx.quadraticCurveTo(0, r * 0.72, -r * 0.85, r * 0.5);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.95, -r * 0.35, -r * 0.35, -r * 0.65);
      ctx.quadraticCurveTo(0, -r * 0.85, r * 0.35, -r * 0.65);
      ctx.quadraticCurveTo(r * 0.95, -r * 0.35, r * 0.85, r * 0.5);
      ctx.quadraticCurveTo(0, r * 0.72, -r * 0.85, r * 0.5);
      ctx.closePath();
    });

    if (!flash) {
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ellipse(ctx, 0, r * 0.18, r * 0.55, r * 0.32);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ellipse(ctx, -r * 0.35, -r * 0.4, r * 0.18, r * 0.1);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ellipse(ctx, r * 0.32, r * 0.2, r * 0.06, r * 0.06);
      ellipse(ctx, -r * 0.38, r * 0.25, r * 0.045, r * 0.045);

      ctx.fillStyle = '#0c2818';
      ellipse(ctx, -r * 0.18, -r * 0.15, r * 0.08, r * 0.12);
      ellipse(ctx, r * 0.18, -r * 0.15, r * 0.08, r * 0.12);
      ctx.fillStyle = '#fff';
      ellipse(ctx, -r * 0.16, -r * 0.19, r * 0.03, r * 0.04);
      ellipse(ctx, r * 0.2, -r * 0.19, r * 0.03, r * 0.04);

      ctx.strokeStyle = '#0c2818';
      ctx.lineWidth = r * 0.05;
      ctx.beginPath();
      ctx.arc(0, r * 0.02, r * 0.15, 0.3, Math.PI - 0.3);
      ctx.stroke();
    }

    ctx.restore();
  },

  goblin(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 13);
    const bob = Math.abs(walk) * 2.5;

    shadow(ctx, x, y + r * 0.55, r * 0.7);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    const skin = flash || opts.color || '#7cb342';

    ctx.fillStyle = skin;
    ellipse(ctx, -r * 0.2 + walk * r * 0.25, r * 0.6, r * 0.12, r * 0.22);
    ellipse(ctx, r * 0.2 - walk * r * 0.25, r * 0.6, r * 0.12, r * 0.22);

    ctx.fillStyle = flash || '#5d4030';
    ellipse(ctx, 0, r * 0.32, r * 0.32, r * 0.26);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, r * 0.32, r * 0.32, r * 0.26, 0, 0, Math.PI * 2); });

    ctx.fillStyle = skin;
    ellipse(ctx, 0, r * 0.05, r * 0.34, r * 0.28);

    ctx.save();
    ctx.translate(-r * 0.3, r * 0.05);
    ctx.rotate(-0.4 - walk * 0.3);
    ctx.fillStyle = skin;
    ellipse(ctx, 0, r * 0.15, r * 0.09, r * 0.22);
    ctx.restore();

    ctx.save();
    ctx.translate(r * 0.3, r * 0.05);
    ctx.rotate(0.5 + walk * 0.3);
    ctx.fillStyle = skin;
    ellipse(ctx, 0, r * 0.15, r * 0.09, r * 0.22);
    ctx.fillStyle = flash || '#cdd5dc';
    ctx.beginPath();
    ctx.moveTo(-r * 0.06, r * 0.34);
    ctx.lineTo(r * 0.06, r * 0.34);
    ctx.lineTo(0, r * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = flash || '#5a3a1c';
    ctx.fillRect(-r * 0.08, r * 0.28, r * 0.16, r * 0.07);
    ctx.restore();

    ctx.fillStyle = skin;
    ellipse(ctx, 0, -r * 0.35, r * 0.44, r * 0.4);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.35, r * 0.44, r * 0.4, 0, 0, Math.PI * 2); });

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(-r * 0.38, -r * 0.42);
    ctx.lineTo(-r * 0.9, -r * 0.62);
    ctx.lineTo(-r * 0.36, -r * 0.22);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.38, -r * 0.42);
      ctx.lineTo(-r * 0.9, -r * 0.62);
      ctx.lineTo(-r * 0.36, -r * 0.22);
      ctx.closePath();
    });
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(r * 0.38, -r * 0.42);
    ctx.lineTo(r * 0.9, -r * 0.62);
    ctx.lineTo(r * 0.36, -r * 0.22);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(r * 0.38, -r * 0.42);
      ctx.lineTo(r * 0.9, -r * 0.62);
      ctx.lineTo(r * 0.36, -r * 0.22);
      ctx.closePath();
    });

    if (!flash) {
      ctx.fillStyle = '#ffd23f';
      ellipse(ctx, -r * 0.16, -r * 0.4, r * 0.09, r * 0.1);
      ellipse(ctx, r * 0.16, -r * 0.4, r * 0.09, r * 0.1);
      ctx.fillStyle = '#1a0828';
      ellipse(ctx, -r * 0.16, -r * 0.4, r * 0.035, r * 0.06);
      ellipse(ctx, r * 0.16, -r * 0.4, r * 0.035, r * 0.06);

      ctx.fillStyle = '#689f38';
      ctx.beginPath();
      ctx.moveTo(-r * 0.05, -r * 0.32);
      ctx.lineTo(r * 0.14, -r * 0.26);
      ctx.lineTo(-r * 0.05, -r * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#1a0828';
      ctx.lineWidth = r * 0.045;
      ctx.beginPath();
      ctx.arc(0, -r * 0.24, r * 0.2, 0.4, Math.PI - 0.6);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(-r * 0.14, -r * 0.1);
      ctx.lineTo(-r * 0.09, -r * 0.0);
      ctx.lineTo(-r * 0.04, -r * 0.09);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  orc(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 7);
    const bob = Math.abs(walk) * 2.5;

    shadow(ctx, x, y + r * 0.6, r * 0.95);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    const skin = flash || opts.color || '#6b8f3d';

    ctx.fillStyle = flash || '#3a2e22';
    ellipse(ctx, -r * 0.28 + walk * r * 0.18, r * 0.58, r * 0.19, r * 0.28);
    ellipse(ctx, r * 0.28 - walk * r * 0.18, r * 0.58, r * 0.19, r * 0.28);

    ctx.fillStyle = skin;
    ellipse(ctx, 0, r * 0.12, r * 0.58, r * 0.48);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, r * 0.12, r * 0.58, r * 0.48, 0, 0, Math.PI * 2); });

    ctx.strokeStyle = flash || '#4a3826';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.15);
    ctx.lineTo(r * 0.35, r * 0.45);
    ctx.stroke();

    ctx.save();
    ctx.rotate(-0.3 + walk * 0.25);
    ctx.fillStyle = skin;
    ellipse(ctx, -r * 0.68, r * 0.08, r * 0.17, r * 0.4);
    ctx.restore();

    ctx.fillStyle = flash || '#4a3826';
    ellipse(ctx, -r * 0.5, -r * 0.22, r * 0.26, r * 0.18);
    ctx.fillStyle = flash || '#b0b8c0';
    for (let i = 0; i < 3; i++) {
      const px = -r * 0.62 + i * r * 0.13;
      ctx.beginPath();
      ctx.moveTo(px - r * 0.04, -r * 0.3);
      ctx.lineTo(px, -r * 0.48);
      ctx.lineTo(px + r * 0.04, -r * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.save();
    ctx.translate(r * 0.55, r * 0.05);
    ctx.rotate(0.4 + walk * 0.15);
    ctx.fillStyle = skin;
    ellipse(ctx, 0, r * 0.12, r * 0.17, r * 0.36);
    ctx.fillStyle = flash || '#5a3a1c';
    ctx.fillRect(-r * 0.06, -r * 0.75, r * 0.12, r * 1.0);
    ctx.fillStyle = flash || '#6e4a24';
    ellipse(ctx, 0, -r * 0.8, r * 0.22, r * 0.3);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.8, r * 0.22, r * 0.3, 0, 0, Math.PI * 2); });
    if (!flash) {
      ctx.fillStyle = '#cdd5dc';
      ellipse(ctx, -r * 0.14, -r * 0.88, r * 0.045, r * 0.045);
      ellipse(ctx, r * 0.14, -r * 0.78, r * 0.045, r * 0.045);
      ellipse(ctx, 0, -r * 1.02, r * 0.045, r * 0.045);
    }
    ctx.restore();

    ctx.fillStyle = skin;
    ellipse(ctx, 0, -r * 0.42, r * 0.4, r * 0.38);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.42, r * 0.4, r * 0.38, 0, 0, Math.PI * 2); });

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.moveTo(-r * 0.36, -r * 0.5);
    ctx.lineTo(-r * 0.62, -r * 0.55);
    ctx.lineTo(-r * 0.36, -r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.36, -r * 0.5);
    ctx.lineTo(r * 0.62, -r * 0.55);
    ctx.lineTo(r * 0.36, -r * 0.35);
    ctx.closePath();
    ctx.fill();

    if (!flash) {
      ctx.fillStyle = '#4a6628';
      ctx.fillRect(-r * 0.3, -r * 0.56, r * 0.6, r * 0.07);
      ctx.fillStyle = '#ff5544';
      ellipse(ctx, -r * 0.15, -r * 0.46, r * 0.06, r * 0.06);
      ellipse(ctx, r * 0.15, -r * 0.46, r * 0.06, r * 0.06);

      ctx.fillStyle = '#577a31';
      ellipse(ctx, 0, -r * 0.24, r * 0.28, r * 0.14);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(-r * 0.18, -r * 0.22);
      ctx.lineTo(-r * 0.13, -r * 0.4);
      ctx.lineTo(-r * 0.08, -r * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.08, -r * 0.22);
      ctx.lineTo(r * 0.13, -r * 0.4);
      ctx.lineTo(r * 0.18, -r * 0.22);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  minotaur(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 6);
    const bob = Math.abs(walk) * 2.5;

    shadow(ctx, x, y + r * 0.62, r * 1.05);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    const fur = flash || opts.color || '#a05c2c';
    const dark = flash || '#5e3a1e';

    ctx.fillStyle = dark;
    ellipse(ctx, -r * 0.3 + walk * r * 0.15, r * 0.55, r * 0.2, r * 0.32);
    ellipse(ctx, r * 0.3 - walk * r * 0.15, r * 0.55, r * 0.2, r * 0.32);
    ctx.fillStyle = flash || '#2a1a0e';
    ellipse(ctx, -r * 0.3 + walk * r * 0.15, r * 0.82, r * 0.18, r * 0.1);
    ellipse(ctx, r * 0.3 - walk * r * 0.15, r * 0.82, r * 0.18, r * 0.1);

    ctx.fillStyle = fur;
    ellipse(ctx, 0, r * 0.1, r * 0.62, r * 0.52);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, r * 0.1, r * 0.62, r * 0.52, 0, 0, Math.PI * 2); });

    ctx.fillStyle = flash || '#c98e54';
    ellipse(ctx, 0, r * 0.18, r * 0.35, r * 0.3);

    ctx.fillStyle = flash || '#3a2412';
    ctx.fillRect(-r * 0.5, r * 0.42, r * 1.0, r * 0.14);
    ctx.fillStyle = flash || '#ffd86b';
    ctx.fillRect(-r * 0.08, r * 0.42, r * 0.16, r * 0.14);

    ctx.save();
    ctx.rotate(-0.35 + walk * 0.2);
    ctx.fillStyle = fur;
    ellipse(ctx, -r * 0.72, r * 0.05, r * 0.18, r * 0.42);
    ctx.restore();

    ctx.save();
    ctx.translate(r * 0.6, 0);
    ctx.rotate(0.3 - walk * 0.15);
    ctx.fillStyle = fur;
    ellipse(ctx, 0, r * 0.15, r * 0.18, r * 0.4);
    ctx.fillStyle = flash || '#5a3a1c';
    ctx.fillRect(-r * 0.05, -r * 0.85, r * 0.1, r * 1.2);
    ctx.fillStyle = flash || '#b8c4cc';
    ctx.beginPath();
    ctx.moveTo(-r * 0.05, -r * 0.85);
    ctx.quadraticCurveTo(-r * 0.5, -r * 0.7, -r * 0.42, -r * 0.3);
    ctx.quadraticCurveTo(-r * 0.18, -r * 0.5, -r * 0.05, -r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.05, -r * 0.85);
    ctx.quadraticCurveTo(r * 0.5, -r * 0.7, r * 0.42, -r * 0.3);
    ctx.quadraticCurveTo(r * 0.18, -r * 0.5, r * 0.05, -r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = fur;
    ellipse(ctx, 0, -r * 0.45, r * 0.42, r * 0.4);
    outline(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -r * 0.45, r * 0.42, r * 0.4, 0, 0, Math.PI * 2); });

    ctx.fillStyle = flash || '#c98e54';
    ellipse(ctx, 0, -r * 0.28, r * 0.26, r * 0.18);

    ctx.fillStyle = flash || '#e8dcc8';
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.62);
    ctx.quadraticCurveTo(-r * 0.75, -r * 0.72, -r * 0.62, -r * 1.05);
    ctx.quadraticCurveTo(-r * 0.5, -r * 0.72, -r * 0.18, -r * 0.72);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 0.62);
      ctx.quadraticCurveTo(-r * 0.75, -r * 0.72, -r * 0.62, -r * 1.05);
      ctx.quadraticCurveTo(-r * 0.5, -r * 0.72, -r * 0.18, -r * 0.72);
      ctx.closePath();
    });
    ctx.fillStyle = flash || '#e8dcc8';
    ctx.beginPath();
    ctx.moveTo(r * 0.3, -r * 0.62);
    ctx.quadraticCurveTo(r * 0.75, -r * 0.72, r * 0.62, -r * 1.05);
    ctx.quadraticCurveTo(r * 0.5, -r * 0.72, r * 0.18, -r * 0.72);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(r * 0.3, -r * 0.62);
      ctx.quadraticCurveTo(r * 0.75, -r * 0.72, r * 0.62, -r * 1.05);
      ctx.quadraticCurveTo(r * 0.5, -r * 0.72, r * 0.18, -r * 0.72);
      ctx.closePath();
    });

    if (!flash) {
      ctx.fillStyle = '#ff3b30';
      ellipse(ctx, -r * 0.16, -r * 0.5, r * 0.07, r * 0.08);
      ellipse(ctx, r * 0.16, -r * 0.5, r * 0.07, r * 0.08);
      ctx.fillStyle = '#000';
      ellipse(ctx, -r * 0.16, -r * 0.5, r * 0.025, r * 0.04);
      ellipse(ctx, r * 0.16, -r * 0.5, r * 0.025, r * 0.04);

      ctx.fillStyle = '#3a2412';
      ellipse(ctx, -r * 0.1, -r * 0.26, r * 0.04, r * 0.05);
      ellipse(ctx, r * 0.1, -r * 0.26, r * 0.04, r * 0.05);

      ctx.strokeStyle = '#ffd86b';
      ctx.lineWidth = r * 0.045;
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, r * 0.08, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    ctx.restore();
  },

  crown(ctx, x, y, w) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#ffd86b';
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, 0);
    ctx.lineTo(-w * 0.5, -w * 0.35);
    ctx.lineTo(-w * 0.25, -w * 0.12);
    ctx.lineTo(0, -w * 0.45);
    ctx.lineTo(w * 0.25, -w * 0.12);
    ctx.lineTo(w * 0.5, -w * 0.35);
    ctx.lineTo(w * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    outline(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-w * 0.5, 0);
      ctx.lineTo(-w * 0.5, -w * 0.35);
      ctx.lineTo(-w * 0.25, -w * 0.12);
      ctx.lineTo(0, -w * 0.45);
      ctx.lineTo(w * 0.25, -w * 0.12);
      ctx.lineTo(w * 0.5, -w * 0.35);
      ctx.lineTo(w * 0.5, 0);
      ctx.closePath();
    });
    ctx.fillStyle = '#ff3b30';
    ellipse(ctx, 0, -w * 0.08, w * 0.07, w * 0.07);
    ctx.restore();
  },
};

export const ENEMY_SPRITES = ['slime', 'goblin', 'orc', 'minotaur'];
