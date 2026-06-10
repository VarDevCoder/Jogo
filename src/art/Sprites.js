import { Palette } from '../core/Config.js';

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (f >= 0) {
    r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f;
  } else {
    r *= 1 + f; g *= 1 + f; b *= 1 + f;
  }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function vGrad(ctx, color, y0, y1, lite = 0.32, dark = -0.28) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, shade(color, lite));
  g.addColorStop(1, shade(color, dark));
  return g;
}

function ellipse(ctx, x, y, rx, ry, fill) {
  if (fill) ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function strokePath(ctx, builder, lw = 2.5) {
  ctx.save();
  ctx.strokeStyle = 'rgba(10, 4, 24, 0.55)';
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  builder();
  ctx.stroke();
  ctx.restore();
}

function fillO(ctx, fill, builder, lw = 2.5) {
  ctx.fillStyle = fill;
  builder();
  ctx.fill();
  strokePath(ctx, builder, lw);
}

function ellipseO(ctx, x, y, rx, ry, fill, lw = 2.5) {
  fillO(ctx, fill, () => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  }, lw);
}

function rim(ctx, x, y, rx, ry, a = 0.3, lw) {
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${a})`;
  ctx.lineWidth = lw || Math.max(2, rx * 0.12);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 0.8, ry * 0.8, 0, -Math.PI * 0.8, -Math.PI * 0.3);
  ctx.stroke();
  ctx.restore();
}

function shadow(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y + r);
  ctx.scale(1, 0.32);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.15);
  g.addColorStop(0, 'rgba(0,0,0,0.38)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function blinkScale(t) {
  return (t % 3.7) > 3.45 ? 0.12 : 1;
}

function sparkle(ctx, x, y, s, a = 1, color = '#fff') {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const SKIN = '#f0c8a0';

export const Sprites = {
  wizard(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const moving = opts.moving || false;
    const facing = opts.facing || 1;
    const walk = moving ? Math.sin(t * 12) : 0;
    const bob = moving ? Math.abs(Math.sin(t * 12)) * 2 : Math.sin(t * 2) * 1.2;
    const blink = blinkScale(t);
    const hem = Math.sin(t * 3) * r * 0.04;

    shadow(ctx, x, y + r * 0.55, r * 0.85);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    // botas
    const legSwing = walk * r * 0.28;
    ellipse(ctx, -r * 0.22 + legSwing, r * 0.6, r * 0.15, r * 0.2, '#2a1846');
    ellipse(ctx, r * 0.22 - legSwing, r * 0.6, r * 0.15, r * 0.2, '#2a1846');

    // túnica dorada con borde ondulado
    fillO(ctx, vGrad(ctx, '#f6c453', -r * 0.3, r * 0.7), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.72, r * 0.45);
      ctx.quadraticCurveTo(-r * 0.6, -r * 0.15, 0, -r * 0.25);
      ctx.quadraticCurveTo(r * 0.6, -r * 0.15, r * 0.72, r * 0.45);
      ctx.quadraticCurveTo(r * 0.42, r * 0.62 + hem, r * 0.2, r * 0.5);
      ctx.quadraticCurveTo(0, r * 0.68 - hem, -r * 0.2, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.42, r * 0.62 + hem, -r * 0.72, r * 0.45);
      ctx.closePath();
    });
    rim(ctx, 0, r * 0.15, r * 0.6, r * 0.42, 0.25);

    // cinturón de cuerda
    ctx.strokeStyle = '#8a5a2a';
    ctx.lineWidth = r * 0.07;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.48, r * 0.16);
    ctx.quadraticCurveTo(0, r * 0.3, r * 0.48, r * 0.16);
    ctx.stroke();

    // brazo trasero
    ctx.save();
    ctx.translate(-r * 0.45, r * 0.0);
    ctx.rotate(-0.3 - walk * 0.2);
    ellipse(ctx, 0, r * 0.14, r * 0.12, r * 0.22, shade('#f6c453', -0.15));
    ellipse(ctx, 0, r * 0.34, r * 0.09, r * 0.09, SKIN);
    ctx.restore();

    // cara
    ellipseO(ctx, 0, -r * 0.22, r * 0.36, r * 0.32, SKIN);

    // barba blanca
    fillO(ctx, vGrad(ctx, '#e8eaf2', -r * 0.2, r * 0.4, 0.15, -0.12), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.33, -r * 0.22);
      ctx.quadraticCurveTo(-r * 0.34, r * 0.18, 0, r * 0.34);
      ctx.quadraticCurveTo(r * 0.34, r * 0.18, r * 0.33, -r * 0.22);
      ctx.quadraticCurveTo(r * 0.15, -r * 0.06, 0, -r * 0.08);
      ctx.quadraticCurveTo(-r * 0.15, -r * 0.06, -r * 0.33, -r * 0.22);
      ctx.closePath();
    }, 2);

    // bigote
    ctx.fillStyle = '#f4f6fa';
    ellipse(ctx, -r * 0.1, -r * 0.08, r * 0.12, r * 0.05);
    ellipse(ctx, r * 0.1, -r * 0.08, r * 0.12, r * 0.05);

    // nariz
    ellipse(ctx, 0, -r * 0.14, r * 0.07, r * 0.06, shade(SKIN, -0.15));

    // ojos con parpadeo
    ctx.fillStyle = '#241040';
    ellipse(ctx, -r * 0.14, -r * 0.26, r * 0.05, r * 0.07 * blink);
    ellipse(ctx, r * 0.14, -r * 0.26, r * 0.05, r * 0.07 * blink);
    if (blink > 0.5) {
      ctx.fillStyle = '#fff';
      ellipse(ctx, -r * 0.125, -r * 0.285, r * 0.018, r * 0.025);
      ellipse(ctx, r * 0.155, -r * 0.285, r * 0.018, r * 0.025);
    }
    // cejas pobladas
    ctx.fillStyle = '#f4f6fa';
    ellipse(ctx, -r * 0.14, -r * 0.34, r * 0.09, r * 0.035);
    ellipse(ctx, r * 0.14, -r * 0.34, r * 0.09, r * 0.035);

    // sombrero morado con punta doblada
    const tip = Math.sin(t * 2.5) * r * 0.05;
    fillO(ctx, vGrad(ctx, '#5a2d8c', -r * 1.15, -r * 0.35), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.42);
      ctx.quadraticCurveTo(-r * 0.15, -r * 0.95, r * 0.05, -r * 1.0);
      ctx.quadraticCurveTo(r * 0.35 + tip, -r * 1.18, r * 0.42 + tip, -r * 1.02);
      ctx.quadraticCurveTo(r * 0.28 + tip, -r * 1.02, r * 0.18, -r * 0.88);
      ctx.quadraticCurveTo(r * 0.32, -r * 0.6, r * 0.4, -r * 0.42);
      ctx.closePath();
    });
    // ala del sombrero
    ellipseO(ctx, 0, -r * 0.42, r * 0.56, r * 0.14, vGrad(ctx, '#6a3aa0', -r * 0.56, -r * 0.28));
    // banda y hebilla
    ctx.fillStyle = '#3a1f5e';
    ctx.fillRect(-r * 0.3, -r * 0.62, r * 0.6, r * 0.1);
    ctx.fillStyle = Palette.goldHot;
    ctx.fillRect(-r * 0.07, -r * 0.64, r * 0.14, r * 0.14);
    ctx.fillStyle = '#3a1f5e';
    ctx.fillRect(-r * 0.035, -r * 0.605, r * 0.07, r * 0.07);
    // estrellitas en el sombrero
    sparkle(ctx, -r * 0.18, -r * 0.78, r * 0.05, 0.8, '#ffd86b');
    sparkle(ctx, r * 0.1, -r * 0.72, r * 0.035, 0.6, '#ffd86b');

    // bastón con cristal
    const staffSway = walk * 0.1;
    ctx.save();
    ctx.translate(r * 0.55, r * 0.1);
    ctx.rotate(-0.2 + staffSway);
    ctx.fillStyle = vGrad(ctx, '#6e4a24', -r * 0.9, r * 0.6, 0.2, -0.3);
    ctx.fillRect(-r * 0.06, -r * 0.9, r * 0.12, r * 1.5);
    ellipse(ctx, 0, r * 0.05, r * 0.12, r * 0.12, SKIN);

    const pulse = 0.75 + 0.25 * Math.sin(t * 5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, -r * 0.98, 0, 0, -r * 0.98, r * 0.7 * pulse);
    glow.addColorStop(0, 'rgba(0,245,255,0.9)');
    glow.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-r * 0.8, -r * 1.7, r * 1.6, r * 1.5);
    ctx.restore();

    fillO(ctx, vGrad(ctx, '#00d5e8', -r * 1.2, -r * 0.78, 0.45, -0.15), () => {
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.2);
      ctx.lineTo(r * 0.14, -r * 0.98);
      ctx.lineTo(0, -r * 0.76);
      ctx.lineTo(-r * 0.14, -r * 0.98);
      ctx.closePath();
    }, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ellipse(ctx, -r * 0.04, -r * 1.05, r * 0.035, r * 0.06);
    for (let i = 0; i < 2; i++) {
      const a = t * 3 + i * Math.PI;
      sparkle(ctx, Math.cos(a) * r * 0.3, -r * 0.98 + Math.sin(a) * r * 0.18, r * 0.06,
        0.5 + 0.5 * Math.sin(t * 7 + i * 2), '#aef6ff');
    }
    ctx.restore();

    ctx.restore();
  },

  ranger(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const moving = opts.moving || false;
    const facing = opts.facing || 1;
    const walk = moving ? Math.sin(t * 14) : 0;
    const bob = moving ? Math.abs(Math.sin(t * 14)) * 2 : Math.sin(t * 2) * 1;
    const blink = blinkScale(t + 1.3);
    const flow = Math.sin(t * 5) * r * 0.06;

    shadow(ctx, x, y + r * 0.55, r * 0.8);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    // bufanda ondeando detrás
    fillO(ctx, vGrad(ctx, '#8a5a2a', -r * 0.4, r * 0.2, 0.2, -0.2), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.15, -r * 0.35);
      ctx.quadraticCurveTo(-r * 0.6, -r * 0.3 + flow, -r * 0.95, -r * 0.05 + flow * 2);
      ctx.quadraticCurveTo(-r * 0.85, r * 0.08 + flow, -r * 0.55, r * 0.0);
      ctx.quadraticCurveTo(-r * 0.3, -r * 0.05, -r * 0.12, -r * 0.15);
      ctx.closePath();
    }, 2);

    // carcaj a la espalda
    ctx.save();
    ctx.translate(-r * 0.3, -r * 0.1);
    ctx.rotate(0.5);
    ctx.fillStyle = vGrad(ctx, '#6e4a24', -r * 0.5, r * 0.3, 0.15, -0.25);
    ctx.fillRect(-r * 0.11, -r * 0.42, r * 0.22, r * 0.62);
    strokePath(ctx, () => {
      ctx.beginPath();
      ctx.rect(-r * 0.11, -r * 0.42, r * 0.22, r * 0.62);
    }, 2);
    // flechas asomando
    for (let i = -1; i <= 1; i++) {
      ctx.fillStyle = '#5a3a1c';
      ctx.fillRect(i * r * 0.06 - r * 0.012, -r * 0.62, r * 0.024, r * 0.22);
      ctx.fillStyle = i === 0 ? '#d84444' : '#eef0f4';
      ctx.beginPath();
      ctx.moveTo(i * r * 0.06 - r * 0.045, -r * 0.56);
      ctx.lineTo(i * r * 0.06, -r * 0.72);
      ctx.lineTo(i * r * 0.06 + r * 0.045, -r * 0.56);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // botas
    ellipse(ctx, -r * 0.22 + walk * r * 0.28, r * 0.6, r * 0.14, r * 0.18, '#5a3a1c');
    ellipse(ctx, r * 0.22 - walk * r * 0.28, r * 0.6, r * 0.14, r * 0.18, '#5a3a1c');

    // túnica verde
    fillO(ctx, vGrad(ctx, '#3a6b54', -r * 0.2, r * 0.6), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, r * 0.45);
      ctx.quadraticCurveTo(-r * 0.5, -r * 0.05, 0, -r * 0.15);
      ctx.quadraticCurveTo(r * 0.5, -r * 0.05, r * 0.55, r * 0.45);
      ctx.quadraticCurveTo(0, r * 0.65, -r * 0.55, r * 0.45);
      ctx.closePath();
    });
    rim(ctx, 0, r * 0.18, r * 0.48, r * 0.35, 0.22);

    // cinturón con hebilla
    ctx.fillStyle = '#4a2f1d';
    ctx.fillRect(-r * 0.48, r * 0.22, r * 0.96, r * 0.12);
    ctx.fillStyle = Palette.goldHot;
    ctx.fillRect(-r * 0.07, r * 0.21, r * 0.14, r * 0.14);
    ctx.fillStyle = '#4a2f1d';
    ctx.fillRect(-r * 0.035, r * 0.245, r * 0.07, r * 0.07);

    // cara
    ellipseO(ctx, 0, -r * 0.32, r * 0.3, r * 0.32, SKIN);
    // mechón de pelo
    ctx.fillStyle = '#7a4a22';
    ctx.beginPath();
    ctx.moveTo(-r * 0.26, -r * 0.42);
    ctx.quadraticCurveTo(-r * 0.05, -r * 0.6, r * 0.22, -r * 0.46);
    ctx.quadraticCurveTo(r * 0.1, -r * 0.42, r * 0.02, -r * 0.45);
    ctx.quadraticCurveTo(-r * 0.1, -r * 0.36, -r * 0.26, -r * 0.42);
    ctx.closePath();
    ctx.fill();

    // ojos
    ctx.fillStyle = '#1a0828';
    ellipse(ctx, -r * 0.11, -r * 0.32, r * 0.05, r * 0.065 * blink);
    ellipse(ctx, r * 0.11, -r * 0.32, r * 0.05, r * 0.065 * blink);
    if (blink > 0.5) {
      ctx.fillStyle = '#fff';
      ellipse(ctx, -r * 0.095, -r * 0.345, r * 0.017, r * 0.022);
      ellipse(ctx, r * 0.125, -r * 0.345, r * 0.017, r * 0.022);
    }
    // sonrisa
    ctx.strokeStyle = '#1a0828';
    ctx.lineWidth = Math.max(1.2, r * 0.03);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(r * 0.02, -r * 0.22, r * 0.08, 0.3, Math.PI - 0.6);
    ctx.stroke();

    // capucha
    fillO(ctx, vGrad(ctx, '#2d4a3e', -r * 0.85, -r * 0.3, 0.25, -0.2), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.42, -r * 0.46);
      ctx.quadraticCurveTo(0, -r * 0.9, r * 0.42, -r * 0.46);
      ctx.quadraticCurveTo(r * 0.48, -r * 0.4, r * 0.36, -r * 0.32);
      ctx.lineTo(-r * 0.36, -r * 0.32);
      ctx.quadraticCurveTo(-r * 0.48, -r * 0.4, -r * 0.42, -r * 0.46);
      ctx.closePath();
    });
    // pluma roja
    ctx.save();
    ctx.translate(-r * 0.22, -r * 0.66);
    ctx.rotate(-0.5 + flow * 0.04);
    fillO(ctx, vGrad(ctx, '#d84444', -r * 0.4, 0, 0.25, -0.15), () => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-r * 0.16, -r * 0.2, -r * 0.06, -r * 0.42);
      ctx.quadraticCurveTo(r * 0.08, -r * 0.24, 0, 0);
      ctx.closePath();
    }, 1.5);
    ctx.restore();

    // arco con cuerda
    ctx.save();
    ctx.translate(r * 0.48, r * 0.0);
    ctx.rotate(0.15 + walk * 0.08);
    ctx.strokeStyle = '#6e4a24';
    ctx.lineWidth = r * 0.09;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();
    ctx.strokeStyle = shade('#6e4a24', 0.35);
    ctx.lineWidth = r * 0.035;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.57, -Math.PI * 0.4, -Math.PI * 0.1);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(r * 0.55 * Math.cos(Math.PI * 0.42), -r * 0.55 * Math.sin(Math.PI * 0.42));
    ctx.lineTo(r * 0.55 * Math.cos(Math.PI * 0.42), r * 0.55 * Math.sin(Math.PI * 0.42));
    ctx.stroke();
    // mano
    ellipse(ctx, r * 0.42, 0, r * 0.1, r * 0.1, SKIN);
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
    const flow = Math.sin(t * 4) * r * 0.06;

    shadow(ctx, x, y + r * 0.6, r * 0.95);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    // capa roja ondeando detrás
    fillO(ctx, vGrad(ctx, '#a02030', -r * 0.5, r * 0.6, 0.15, -0.35), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.05, -r * 0.45);
      ctx.quadraticCurveTo(-r * 0.7, -r * 0.15, -r * 0.82 + flow * 2, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.5, r * 0.38 - flow, -r * 0.2, r * 0.52);
      ctx.lineTo(-r * 0.1, 0);
      ctx.closePath();
    });

    // piernas con grebas
    ellipse(ctx, -r * 0.26 + walk * r * 0.18, r * 0.58, r * 0.18, r * 0.26, vGrad(ctx, '#4a5060', r * 0.3, r * 0.85, 0.25, -0.2));
    ellipse(ctx, r * 0.26 - walk * r * 0.18, r * 0.58, r * 0.18, r * 0.26, vGrad(ctx, '#4a5060', r * 0.3, r * 0.85, 0.25, -0.2));
    ellipse(ctx, -r * 0.26 + walk * r * 0.18, r * 0.8, r * 0.2, r * 0.1, '#2a3040');
    ellipse(ctx, r * 0.26 - walk * r * 0.18, r * 0.8, r * 0.2, r * 0.1, '#2a3040');

    // torso con armadura
    ellipseO(ctx, 0, r * 0.18, r * 0.54, r * 0.48, vGrad(ctx, '#8a92a8', -r * 0.3, r * 0.66));
    rim(ctx, 0, r * 0.16, r * 0.54, r * 0.46, 0.4);
    // placa central
    ellipse(ctx, 0, r * 0.24, r * 0.3, r * 0.32, shade('#8a92a8', -0.18));
    // tabardo rojo
    fillO(ctx, vGrad(ctx, '#c43838', -r * 0.05, r * 0.55, 0.15, -0.25), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.09, -r * 0.02);
      ctx.lineTo(r * 0.09, -r * 0.02);
      ctx.lineTo(r * 0.09, r * 0.52);
      ctx.lineTo(0, r * 0.42);
      ctx.lineTo(-r * 0.09, r * 0.52);
      ctx.closePath();
    }, 1.8);
    // remaches
    ctx.fillStyle = Palette.goldHot;
    ellipse(ctx, -r * 0.38, r * 0.02, r * 0.035, r * 0.035);
    ellipse(ctx, r * 0.38, r * 0.02, r * 0.035, r * 0.035);
    // cinturón
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(-r * 0.44, r * 0.46, r * 0.88, r * 0.12);
    ctx.fillStyle = Palette.goldHot;
    ctx.fillRect(-r * 0.07, r * 0.45, r * 0.14, r * 0.14);

    // escudo
    ctx.save();
    ctx.translate(-r * 0.56, r * 0.08);
    ctx.rotate(-0.12);
    fillO(ctx, vGrad(ctx, '#5a6478', -r * 0.42, r * 0.5, 0.3, -0.25), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.38, -r * 0.28);
      ctx.quadraticCurveTo(0, -r * 0.4, r * 0.38, -r * 0.28);
      ctx.quadraticCurveTo(r * 0.4, r * 0.12, 0, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.4, r * 0.12, -r * 0.38, -r * 0.28);
      ctx.closePath();
    });
    // borde dorado
    ctx.strokeStyle = '#d4a73a';
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(-r * 0.31, -r * 0.23);
    ctx.quadraticCurveTo(0, -r * 0.33, r * 0.31, -r * 0.23);
    ctx.quadraticCurveTo(r * 0.33, r * 0.09, 0, r * 0.41);
    ctx.quadraticCurveTo(-r * 0.33, r * 0.09, -r * 0.31, -r * 0.23);
    ctx.closePath();
    ctx.stroke();
    // emblema
    ctx.strokeStyle = '#ffd86b';
    ctx.lineWidth = r * 0.07;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.16);
    ctx.lineTo(0, r * 0.22);
    ctx.moveTo(-r * 0.14, 0);
    ctx.lineTo(r * 0.14, 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ellipse(ctx, -r * 0.14, -r * 0.16, r * 0.1, r * 0.05);
    ctx.restore();

    // espada
    const swing = swinging > 0 ? -Math.PI * 0.5 + (1 - swinging) * Math.PI : 0;
    ctx.save();
    ctx.translate(r * 0.5, r * 0.05);
    ctx.rotate(0.3 + swing + walk * 0.1);
    // empuñadura
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(-r * 0.05, -r * 0.05, r * 0.1, r * 0.26);
    // pomo con joya
    ellipse(ctx, 0, r * 0.24, r * 0.07, r * 0.07, '#d4a73a');
    ellipse(ctx, 0, r * 0.24, r * 0.035, r * 0.035, '#d84444');
    // guarda
    ctx.fillStyle = vGrad(ctx, '#d4a73a', -r * 0.12, -r * 0.02, 0.3, -0.2);
    ctx.fillRect(-r * 0.2, -r * 0.12, r * 0.4, r * 0.09);
    // hoja con degradado y filo
    const blade = ctx.createLinearGradient(-r * 0.08, 0, r * 0.08, 0);
    blade.addColorStop(0, '#f4f8fc');
    blade.addColorStop(0.5, '#c8d2dc');
    blade.addColorStop(1, '#98a4b2');
    fillO(ctx, blade, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.08, -r * 0.12);
      ctx.lineTo(r * 0.08, -r * 0.12);
      ctx.lineTo(r * 0.055, -r * 1.02);
      ctx.lineTo(0, -r * 1.16);
      ctx.lineTo(-r * 0.055, -r * 1.02);
      ctx.closePath();
    }, 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.18);
    ctx.lineTo(0, -r * 1.05);
    ctx.stroke();
    if (swinging > 0.5) sparkle(ctx, 0, -r * 1.1, r * 0.14, (swinging - 0.5) * 2);
    ctx.restore();

    // yelmo
    ellipseO(ctx, 0, -r * 0.35, r * 0.4, r * 0.42, vGrad(ctx, '#aab2c8', -r * 0.77, r * 0.07));
    rim(ctx, 0, -r * 0.37, r * 0.4, r * 0.4, 0.45);
    // visor
    ctx.fillStyle = '#141826';
    ctx.fillRect(-r * 0.3, -r * 0.44, r * 0.6, r * 0.14);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const eg = ctx.createRadialGradient(-r * 0.15, -r * 0.37, 0, -r * 0.15, -r * 0.37, r * 0.14);
    eg.addColorStop(0, 'rgba(0,245,255,0.8)');
    eg.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = eg;
    ctx.fillRect(-r * 0.3, -r * 0.5, r * 0.3, r * 0.28);
    const eg2 = ctx.createRadialGradient(r * 0.15, -r * 0.37, 0, r * 0.15, -r * 0.37, r * 0.14);
    eg2.addColorStop(0, 'rgba(0,245,255,0.8)');
    eg2.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = eg2;
    ctx.fillRect(0, -r * 0.5, r * 0.3, r * 0.28);
    ctx.restore();
    ctx.fillStyle = '#00f5ff';
    ctx.fillRect(-r * 0.21, -r * 0.41, r * 0.12, r * 0.07);
    ctx.fillRect(r * 0.09, -r * 0.41, r * 0.12, r * 0.07);
    // rejilla del visor
    ctx.fillStyle = '#3a4254';
    for (let i = -1; i <= 1; i++) {
      ctx.fillRect(i * r * 0.1 - r * 0.015, -r * 0.26, r * 0.03, r * 0.09);
    }
    // remaches del yelmo
    ctx.fillStyle = '#d8dee8';
    ellipse(ctx, -r * 0.33, -r * 0.5, r * 0.03, r * 0.03);
    ellipse(ctx, r * 0.33, -r * 0.5, r * 0.03, r * 0.03);

    // penacho ondulante
    fillO(ctx, vGrad(ctx, '#d84444', -r * 1.2, -r * 0.7, 0.2, -0.25), () => {
      ctx.beginPath();
      ctx.moveTo(r * 0.08, -r * 0.72);
      ctx.quadraticCurveTo(r * 0.12, -r * 1.1, -r * 0.1 + flow, -r * 1.16);
      ctx.quadraticCurveTo(-r * 0.42 + flow * 2, -r * 1.18, -r * 0.52 + flow * 2, -r * 0.95);
      ctx.quadraticCurveTo(-r * 0.32 + flow, -r * 1.0, -r * 0.26 + flow, -r * 0.85);
      ctx.quadraticCurveTo(-r * 0.16, -r * 0.92, -r * 0.08, -r * 0.72);
      ctx.closePath();
    }, 2);

    ctx.restore();
  },

  alchemist(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const moving = opts.moving || false;
    const facing = opts.facing || 1;
    const walk = moving ? Math.sin(t * 12) : 0;
    const bob = moving ? Math.abs(Math.sin(t * 12)) * 2 : Math.sin(t * 2) * 1;
    const blink = blinkScale(t + 0.9);

    shadow(ctx, x, y + r * 0.55, r * 0.85);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    // botas
    ellipse(ctx, -r * 0.22 + walk * r * 0.28, r * 0.6, r * 0.14, r * 0.18, '#23402e');
    ellipse(ctx, r * 0.22 - walk * r * 0.28, r * 0.6, r * 0.14, r * 0.18, '#23402e');

    // túnica verde con degradado
    fillO(ctx, vGrad(ctx, '#2f6b46', -r * 0.25, r * 0.65), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.58, r * 0.45);
      ctx.quadraticCurveTo(-r * 0.52, -r * 0.08, 0, -r * 0.18);
      ctx.quadraticCurveTo(r * 0.52, -r * 0.08, r * 0.58, r * 0.45);
      ctx.quadraticCurveTo(0, r * 0.66, -r * 0.58, r * 0.45);
      ctx.closePath();
    });
    rim(ctx, 0, r * 0.16, r * 0.5, r * 0.36, 0.22);

    // cinturón con un frasquito
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(-r * 0.48, r * 0.26, r * 0.96, r * 0.11);
    ctx.fillStyle = '#d4a73a';
    ctx.fillRect(-r * 0.06, r * 0.25, r * 0.12, r * 0.13);
    ctx.fillStyle = '#d84444';
    ctx.fillRect(-r * 0.3, r * 0.3, r * 0.08, r * 0.16);
    ctx.fillStyle = '#4da6ff';
    ctx.fillRect(r * 0.22, r * 0.3, r * 0.08, r * 0.16);

    // cara
    ellipseO(ctx, 0, -r * 0.32, r * 0.34, r * 0.32, SKIN);

    // sonrisa pícara
    ctx.strokeStyle = '#1a0828';
    ctx.lineWidth = Math.max(1.2, r * 0.03);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(r * 0.02, -r * 0.14, r * 0.09, 0.3, Math.PI - 0.7);
    ctx.stroke();

    // capucha verde oscuro
    fillO(ctx, vGrad(ctx, '#1e4a30', -r * 0.85, -r * 0.28, 0.25, -0.2), () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.5);
      ctx.quadraticCurveTo(0, -r * 0.92, r * 0.4, -r * 0.5);
      ctx.quadraticCurveTo(r * 0.46, -r * 0.44, r * 0.34, -r * 0.38);
      ctx.lineTo(-r * 0.34, -r * 0.38);
      ctx.quadraticCurveTo(-r * 0.46, -r * 0.44, -r * 0.4, -r * 0.5);
      ctx.closePath();
    });

    // gafas de alquimista (encima de la capucha, sobre los ojos)
    [[-1], [1]].forEach(([s]) => {
      ellipse(ctx, s * r * 0.15, -r * 0.3, r * 0.13, r * 0.13, '#d4a73a');
      ellipse(ctx, s * r * 0.15, -r * 0.3, r * 0.095, r * 0.095, '#0c2030');
      if (blink > 0.5) {
        ctx.fillStyle = '#6ee7ff';
        ellipse(ctx, s * r * 0.15, -r * 0.29, r * 0.05, r * 0.055);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ellipse(ctx, s * r * 0.11, -r * 0.34, r * 0.028, r * 0.032);
      }
    });
    // puente de las gafas
    ctx.strokeStyle = '#d4a73a';
    ctx.lineWidth = r * 0.05;
    ctx.beginPath();
    ctx.moveTo(-r * 0.04, -r * 0.3);
    ctx.lineTo(r * 0.04, -r * 0.3);
    ctx.stroke();

    // brazo con frasco burbujeante
    ctx.save();
    ctx.translate(r * 0.42, r * 0.0);
    ctx.rotate(0.25 + walk * 0.15);
    ctx.fillStyle = shade('#2f6b46', -0.1);
    ellipse(ctx, 0, r * 0.12, r * 0.1, r * 0.2);
    ellipse(ctx, 0, r * 0.3, r * 0.09, r * 0.09, SKIN);
    // frasco
    ctx.save();
    ctx.translate(r * 0.05, r * 0.42);
    ctx.globalCompositeOperation = 'source-over';
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.45);
    glow.addColorStop(0, 'rgba(95, 211, 138, 0.55)');
    glow.addColorStop(1, 'rgba(95, 211, 138, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-r * 0.45, -r * 0.45, r * 0.9, r * 0.9);
    fillO(ctx, 'rgba(220, 245, 255, 0.5)', () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.06, -r * 0.22);
      ctx.lineTo(r * 0.06, -r * 0.22);
      ctx.lineTo(r * 0.16, r * 0.1);
      ctx.quadraticCurveTo(0, r * 0.24, -r * 0.16, r * 0.1);
      ctx.closePath();
    }, 1.5);
    ctx.fillStyle = '#5fd38a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.11, 0);
    ctx.lineTo(r * 0.11, 0);
    ctx.lineTo(r * 0.16, r * 0.1);
    ctx.quadraticCurveTo(0, r * 0.24, -r * 0.16, r * 0.1);
    ctx.closePath();
    ctx.fill();
    // burbujas
    const bp = (t * 1.4) % 1;
    ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - bp)})`;
    ellipse(ctx, -r * 0.04, r * 0.06 - bp * r * 0.2, r * 0.025, r * 0.025);
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(-r * 0.045, -r * 0.3, r * 0.09, r * 0.09);
    ctx.restore();
    ctx.restore();

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
    const blink = blinkScale(t);
    const color = opts.color || '#3ddc84';

    shadow(ctx, x, y + r * 0.4, r * 0.85 * sx);

    ctx.save();
    ctx.translate(x, y - hop);
    ctx.scale(facing * sx, sy);

    const body = () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.85, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.95, -r * 0.35, -r * 0.35, -r * 0.65);
      ctx.quadraticCurveTo(0, -r * 0.85, r * 0.35, -r * 0.65);
      ctx.quadraticCurveTo(r * 0.95, -r * 0.35, r * 0.85, r * 0.5);
      ctx.quadraticCurveTo(0, r * 0.72, -r * 0.85, r * 0.5);
      ctx.closePath();
    };
    fillO(ctx, flash || vGrad(ctx, color, -r * 0.85, r * 0.7, 0.4, -0.22), body);

    if (!flash) {
      // núcleo interno latiendo
      const beat = 1 + Math.sin(t * 4) * 0.08;
      ctx.fillStyle = `rgba(0,0,0,0.18)`;
      ellipse(ctx, 0, r * 0.22, r * 0.42 * beat, r * 0.3 * beat);
      ctx.fillStyle = shade(color, -0.35);
      ellipse(ctx, 0, r * 0.22, r * 0.3 * beat, r * 0.22 * beat);

      // burbujas subiendo
      for (let i = 0; i < 3; i++) {
        const p = (t * 0.35 + i * 0.33) % 1;
        const bx = (i - 1) * r * 0.35;
        const by = r * 0.4 - p * r * 0.8;
        ctx.fillStyle = `rgba(255,255,255,${0.3 * (1 - p)})`;
        ellipse(ctx, bx, by, r * 0.05, r * 0.05);
      }

      // brillo gelatinoso
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ellipse(ctx, -r * 0.35, -r * 0.42, r * 0.2, r * 0.1);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ellipse(ctx, -r * 0.1, -r * 0.56, r * 0.07, r * 0.045);

      // ojos grandes y brillantes
      ctx.fillStyle = '#0c2818';
      ellipse(ctx, -r * 0.2, -r * 0.12, r * 0.1, r * 0.14 * blink);
      ellipse(ctx, r * 0.2, -r * 0.12, r * 0.1, r * 0.14 * blink);
      if (blink > 0.5) {
        ctx.fillStyle = '#fff';
        ellipse(ctx, -r * 0.165, -r * 0.17, r * 0.035, r * 0.05);
        ellipse(ctx, r * 0.235, -r * 0.17, r * 0.035, r * 0.05);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ellipse(ctx, -r * 0.23, -r * 0.07, r * 0.018, r * 0.022);
        ellipse(ctx, r * 0.17, -r * 0.07, r * 0.018, r * 0.022);
      }

      // mejillas
      ctx.fillStyle = 'rgba(255,120,140,0.35)';
      ellipse(ctx, -r * 0.38, r * 0.02, r * 0.08, r * 0.05);
      ellipse(ctx, r * 0.38, r * 0.02, r * 0.08, r * 0.05);

      // boca feliz
      ctx.fillStyle = '#0c2818';
      ctx.beginPath();
      ctx.arc(0, r * 0.02, r * 0.12, 0.15, Math.PI - 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff8a9a';
      ctx.beginPath();
      ctx.arc(0, r * 0.09, r * 0.06, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  goblin(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 13);
    const bob = Math.abs(walk) * 2.5;
    const blink = blinkScale(t + 0.7);
    const color = opts.color || '#7cb342';

    shadow(ctx, x, y + r * 0.5, r * 0.65);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    const skin = flash || color;

    // piernas
    ellipse(ctx, -r * 0.2 + walk * r * 0.25, r * 0.6, r * 0.12, r * 0.22, flash || shade(color, -0.12));
    ellipse(ctx, r * 0.2 - walk * r * 0.25, r * 0.6, r * 0.12, r * 0.22, flash || shade(color, -0.12));

    // taparrabos
    ellipseO(ctx, 0, r * 0.34, r * 0.3, r * 0.24, flash || vGrad(ctx, '#5d4030', r * 0.1, r * 0.58, 0.18, -0.22), 2);
    if (!flash) {
      // costuras
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-r * 0.14, r * 0.22);
      ctx.lineTo(-r * 0.08, r * 0.3);
      ctx.moveTo(r * 0.06, r * 0.24);
      ctx.lineTo(r * 0.12, r * 0.32);
      ctx.stroke();
    }

    // torso
    ellipse(ctx, 0, r * 0.06, r * 0.32, r * 0.27, flash || vGrad(ctx, color, -r * 0.2, r * 0.33, 0.3, -0.18));

    // chaleco de cuero
    if (!flash) {
      ctx.strokeStyle = '#4a3826';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(-r * 0.24, -r * 0.12);
      ctx.lineTo(r * 0.18, r * 0.26);
      ctx.stroke();
    }

    // brazo trasero
    ctx.save();
    ctx.translate(-r * 0.28, r * 0.05);
    ctx.rotate(-0.4 - walk * 0.3);
    ellipse(ctx, 0, r * 0.15, r * 0.09, r * 0.2, skin);
    ctx.restore();

    // brazo con daga
    ctx.save();
    ctx.translate(r * 0.28, r * 0.05);
    ctx.rotate(0.5 + walk * 0.3);
    ellipse(ctx, 0, r * 0.15, r * 0.09, r * 0.2, skin);
    const blade = flash || (() => {
      const g = ctx.createLinearGradient(-r * 0.06, 0, r * 0.06, 0);
      g.addColorStop(0, '#f0f4f8');
      g.addColorStop(1, '#a8b4c0');
      return g;
    })();
    fillO(ctx, blade, () => {
      ctx.beginPath();
      ctx.moveTo(-r * 0.06, r * 0.36);
      ctx.lineTo(r * 0.06, r * 0.36);
      ctx.lineTo(0, r * 0.72);
      ctx.closePath();
    }, 1.5);
    ctx.fillStyle = flash || '#5a3a1c';
    ctx.fillRect(-r * 0.09, r * 0.3, r * 0.18, r * 0.07);
    if (!flash) sparkle(ctx, r * 0.02, r * 0.45, r * 0.04, 0.5 + 0.5 * Math.sin(t * 6));
    ctx.restore();

    // cabeza grande
    ellipseO(ctx, 0, -r * 0.35, r * 0.44, r * 0.4, flash || vGrad(ctx, color, -r * 0.75, r * 0.05, 0.32, -0.2));
    if (!flash) rim(ctx, 0, -r * 0.37, r * 0.42, r * 0.38, 0.25);

    // orejas largas con interior
    const earWiggle = Math.sin(t * 8) * 0.06;
    [[-1, earWiggle], [1, -earWiggle]].forEach(([s, w]) => {
      fillO(ctx, skin, () => {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.38, -r * 0.42);
        ctx.quadraticCurveTo(s * r * 0.7, -r * (0.62 + w), s * r * 0.92, -r * (0.6 + w));
        ctx.quadraticCurveTo(s * r * 0.66, -r * 0.42, s * r * 0.36, -r * 0.22);
        ctx.closePath();
      }, 2);
      if (!flash) {
        ctx.fillStyle = shade(color, -0.3);
        ctx.beginPath();
        ctx.moveTo(s * r * 0.48, -r * 0.44);
        ctx.quadraticCurveTo(s * r * 0.7, -r * (0.56 + w), s * r * 0.82, -r * (0.56 + w));
        ctx.quadraticCurveTo(s * r * 0.62, -r * 0.44, s * r * 0.46, -r * 0.32);
        ctx.closePath();
        ctx.fill();
      }
    });

    if (!flash) {
      // arete dorado
      ctx.strokeStyle = Palette.goldHot;
      ctx.lineWidth = r * 0.035;
      ctx.beginPath();
      ctx.arc(r * 0.62, -r * 0.5, r * 0.06, 0.3, Math.PI * 1.4);
      ctx.stroke();

      // mechón de pelo
      ctx.fillStyle = '#2a3018';
      ctx.beginPath();
      ctx.moveTo(-r * 0.14, -r * 0.7);
      ctx.quadraticCurveTo(0, -r * 0.92, r * 0.1, -r * 0.7);
      ctx.quadraticCurveTo(0, -r * 0.76, -r * 0.14, -r * 0.7);
      ctx.closePath();
      ctx.fill();

      // cejas enojadas
      ctx.strokeStyle = '#3a4a1e';
      ctx.lineWidth = r * 0.05;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.26, -r * 0.56);
      ctx.lineTo(-r * 0.08, -r * 0.48);
      ctx.moveTo(r * 0.26, -r * 0.56);
      ctx.lineTo(r * 0.08, -r * 0.48);
      ctx.stroke();

      // ojos amarillos con pupila rasgada
      ctx.fillStyle = '#ffd23f';
      ellipse(ctx, -r * 0.16, -r * 0.4, r * 0.1, r * 0.11 * blink);
      ellipse(ctx, r * 0.16, -r * 0.4, r * 0.1, r * 0.11 * blink);
      if (blink > 0.5) {
        ctx.fillStyle = '#1a0828';
        ellipse(ctx, -r * 0.15, -r * 0.4, r * 0.03, r * 0.08);
        ellipse(ctx, r * 0.17, -r * 0.4, r * 0.03, r * 0.08);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ellipse(ctx, -r * 0.19, -r * 0.44, r * 0.02, r * 0.025);
        ellipse(ctx, r * 0.13, -r * 0.44, r * 0.02, r * 0.025);
      }

      // nariz puntiaguda
      ctx.fillStyle = shade(color, -0.12);
      ctx.beginPath();
      ctx.moveTo(-r * 0.04, -r * 0.34);
      ctx.quadraticCurveTo(r * 0.12, -r * 0.32, r * 0.16, -r * 0.26);
      ctx.quadraticCurveTo(r * 0.06, -r * 0.22, -r * 0.04, -r * 0.24);
      ctx.closePath();
      ctx.fill();

      // sonrisa maliciosa con dientes
      ctx.fillStyle = '#2a1418';
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, -r * 0.16);
      ctx.quadraticCurveTo(0, -r * 0.02, r * 0.2, -r * 0.16);
      ctx.quadraticCurveTo(0, -r * 0.12, -r * 0.2, -r * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      [[-0.14, -0.155], [-0.02, -0.115], [0.1, -0.14]].forEach(([tx, ty]) => {
        ctx.beginPath();
        ctx.moveTo(r * (tx - 0.035), r * ty);
        ctx.lineTo(r * tx, r * (ty + 0.07));
        ctx.lineTo(r * (tx + 0.035), r * ty);
        ctx.closePath();
        ctx.fill();
      });
    }

    ctx.restore();
  },

  orc(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 7);
    const bob = Math.abs(walk) * 2.5;
    const blink = blinkScale(t + 1.9);
    const color = opts.color || '#6b8f3d';

    shadow(ctx, x, y + r * 0.55, r * 0.9);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    const skin = flash || color;

    // piernas
    ellipse(ctx, -r * 0.28 + walk * r * 0.18, r * 0.58, r * 0.19, r * 0.28, flash || vGrad(ctx, '#3a2e22', r * 0.3, r * 0.86, 0.2, -0.2));
    ellipse(ctx, r * 0.28 - walk * r * 0.18, r * 0.58, r * 0.19, r * 0.28, flash || vGrad(ctx, '#3a2e22', r * 0.3, r * 0.86, 0.2, -0.2));

    // torso musculoso
    ellipseO(ctx, 0, r * 0.12, r * 0.58, r * 0.48, flash || vGrad(ctx, color, -r * 0.36, r * 0.6, 0.28, -0.22));
    if (!flash) {
      rim(ctx, 0, r * 0.1, r * 0.56, r * 0.46, 0.22);
      // pectorales y abdomen
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = Math.max(1.2, r * 0.035);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-r * 0.18, r * 0.02, r * 0.16, 0.3, Math.PI * 0.75);
      ctx.moveTo(r * 0.32, r * 0.13);
      ctx.arc(r * 0.16, r * 0.02, r * 0.16, Math.PI * 0.25, Math.PI * 0.7);
      ctx.moveTo(0, r * 0.2);
      ctx.lineTo(0, r * 0.42);
      ctx.stroke();
    }

    // correa de cuero cruzada
    ctx.strokeStyle = flash || '#4a3826';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.15);
    ctx.lineTo(r * 0.35, r * 0.45);
    ctx.stroke();
    if (!flash) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const px = -r * 0.35 + i * r * 0.2;
        const py = -r * 0.07 + i * r * 0.15;
        ctx.beginPath();
        ctx.moveTo(px - r * 0.03, py + r * 0.03);
        ctx.lineTo(px + r * 0.03, py - r * 0.03);
        ctx.stroke();
      }
    }

    // brazo trasero
    ctx.save();
    ctx.rotate(-0.3 + walk * 0.25);
    ellipse(ctx, -r * 0.68, r * 0.08, r * 0.17, r * 0.4, skin);
    ctx.restore();

    // hombrera con pinchos
    ellipseO(ctx, -r * 0.5, -r * 0.22, r * 0.26, r * 0.18, flash || vGrad(ctx, '#4a3826', -r * 0.4, -r * 0.04, 0.25, -0.25), 2);
    ctx.fillStyle = flash || '#c0c8d2';
    for (let i = 0; i < 3; i++) {
      const px = -r * 0.64 + i * r * 0.14;
      ctx.beginPath();
      ctx.moveTo(px - r * 0.04, -r * 0.3);
      ctx.lineTo(px + r * 0.01, -r * 0.5);
      ctx.lineTo(px + r * 0.06, -r * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    // brazo con garrote
    ctx.save();
    ctx.translate(r * 0.55, r * 0.05);
    ctx.rotate(0.4 + walk * 0.15);
    ellipse(ctx, 0, r * 0.12, r * 0.17, r * 0.36, skin);
    // mango con vetas
    ctx.fillStyle = flash || vGrad(ctx, '#5a3a1c', -r * 0.75, r * 0.25, 0.18, -0.25);
    ctx.fillRect(-r * 0.06, -r * 0.75, r * 0.12, r * 1.0);
    // cabeza del garrote
    ellipseO(ctx, 0, -r * 0.8, r * 0.22, r * 0.3, flash || vGrad(ctx, '#6e4a24', -r * 1.1, -r * 0.5, 0.25, -0.25));
    if (!flash) {
      // bandas oscuras
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = r * 0.035;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.88, r * 0.18, r * 0.06, 0, 0, Math.PI * 2);
      ctx.stroke();
      // pinchos metálicos con brillo
      ctx.fillStyle = '#cdd5dc';
      ellipse(ctx, -r * 0.16, -r * 0.9, r * 0.045, r * 0.045);
      ellipse(ctx, r * 0.16, -r * 0.76, r * 0.045, r * 0.045);
      ellipse(ctx, 0, -r * 1.04, r * 0.045, r * 0.045);
      sparkle(ctx, 0, -r * 1.04, r * 0.05, 0.4 + 0.4 * Math.sin(t * 5));
    }
    ctx.restore();

    // cabeza
    ellipseO(ctx, 0, -r * 0.42, r * 0.4, r * 0.38, flash || vGrad(ctx, color, -r * 0.8, -r * 0.04, 0.3, -0.18));
    if (!flash) rim(ctx, 0, -r * 0.44, r * 0.38, r * 0.36, 0.25);

    // orejas
    [[-1], [1]].forEach(([s]) => {
      fillO(ctx, skin, () => {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.36, -r * 0.5);
        ctx.lineTo(s * r * 0.62, -r * 0.56);
        ctx.lineTo(s * r * 0.36, -r * 0.35);
        ctx.closePath();
      }, 1.5);
    });

    if (!flash) {
      // moño samurái
      ellipse(ctx, 0, -r * 0.78, r * 0.09, r * 0.07, '#2a3018');
      ellipse(ctx, 0, -r * 0.86, r * 0.05, r * 0.05, '#2a3018');

      // ceño fruncido
      ctx.fillStyle = shade(color, -0.3);
      ctx.fillRect(-r * 0.3, -r * 0.58, r * 0.6, r * 0.07);
      ctx.strokeStyle = shade(color, -0.35);
      ctx.lineWidth = r * 0.04;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.24, -r * 0.6);
      ctx.lineTo(-r * 0.06, -r * 0.53);
      ctx.moveTo(r * 0.24, -r * 0.6);
      ctx.lineTo(r * 0.06, -r * 0.53);
      ctx.stroke();

      // pintura de guerra roja
      ctx.fillStyle = 'rgba(216,68,68,0.55)';
      ctx.fillRect(-r * 0.34, -r * 0.46, r * 0.13, r * 0.035);
      ctx.fillRect(-r * 0.32, -r * 0.4, r * 0.11, r * 0.035);

      // ojos rojos con brillo
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const og = ctx.createRadialGradient(r * 0.15, -r * 0.46, 0, r * 0.15, -r * 0.46, r * 0.12);
      og.addColorStop(0, 'rgba(255,80,60,0.5)');
      og.addColorStop(1, 'rgba(255,80,60,0)');
      ctx.fillStyle = og;
      ctx.fillRect(r * 0.03, -r * 0.58, r * 0.24, r * 0.24);
      ctx.restore();
      ctx.fillStyle = '#ff5544';
      ellipse(ctx, -r * 0.15, -r * 0.46, r * 0.06, r * 0.06 * blink);
      ellipse(ctx, r * 0.15, -r * 0.46, r * 0.06, r * 0.06 * blink);
      if (blink > 0.5) {
        ctx.fillStyle = '#fff';
        ellipse(ctx, -r * 0.13, -r * 0.48, r * 0.018, r * 0.018);
        ellipse(ctx, r * 0.17, -r * 0.48, r * 0.018, r * 0.018);
      }

      // mandíbula con colmillos
      ctx.fillStyle = shade(color, -0.18);
      ellipse(ctx, 0, -r * 0.24, r * 0.28, r * 0.14);
      ctx.fillStyle = '#fff';
      [[-0.15], [0.15]].forEach(([s]) => {
        ctx.beginPath();
        ctx.moveTo(r * s - r * 0.05, -r * 0.24);
        ctx.quadraticCurveTo(r * s, -r * 0.46, r * s + r * 0.02, -r * 0.42);
        ctx.quadraticCurveTo(r * s + 0.05 * r, -r * 0.3, r * s + r * 0.05, -r * 0.24);
        ctx.closePath();
        ctx.fill();
      });
      // fosas nasales
      ctx.fillStyle = shade(color, -0.4);
      ellipse(ctx, -r * 0.05, -r * 0.3, r * 0.025, r * 0.035);
      ellipse(ctx, r * 0.05, -r * 0.3, r * 0.025, r * 0.035);
    }

    ctx.restore();
  },

  minotaur(ctx, x, y, r, opts = {}) {
    const t = opts.time || 0;
    const facing = opts.facing || 1;
    const flash = opts.flash;
    const walk = Math.sin(t * 6);
    const bob = Math.abs(walk) * 2.5;
    const blink = blinkScale(t + 2.6);
    const color = opts.color || '#a05c2c';

    shadow(ctx, x, y + r * 0.58, r * 1.0);

    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(facing, 1);

    const fur = flash || color;

    // cola moviéndose
    if (!flash) {
      const tailSway = Math.sin(t * 3) * r * 0.12;
      ctx.strokeStyle = shade(color, -0.2);
      ctx.lineWidth = r * 0.07;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, r * 0.25);
      ctx.quadraticCurveTo(-r * 0.85, r * 0.3 + tailSway, -r * 0.95, r * 0.05 + tailSway * 2);
      ctx.stroke();
      ellipse(ctx, -r * 0.95, r * 0.05 + tailSway * 2, r * 0.08, r * 0.1, '#3a2412');
    }

    // patas con pezuñas
    ellipse(ctx, -r * 0.3 + walk * r * 0.15, r * 0.55, r * 0.2, r * 0.32, flash || vGrad(ctx, '#5e3a1e', r * 0.23, r * 0.87, 0.2, -0.2));
    ellipse(ctx, r * 0.3 - walk * r * 0.15, r * 0.55, r * 0.2, r * 0.32, flash || vGrad(ctx, '#5e3a1e', r * 0.23, r * 0.87, 0.2, -0.2));
    ellipse(ctx, -r * 0.3 + walk * r * 0.15, r * 0.82, r * 0.18, r * 0.1, flash || '#2a1a0e');
    ellipse(ctx, r * 0.3 - walk * r * 0.15, r * 0.82, r * 0.18, r * 0.1, flash || '#2a1a0e');
    if (!flash) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ellipse(ctx, -r * 0.36 + walk * r * 0.15, r * 0.79, r * 0.05, r * 0.025);
      ellipse(ctx, r * 0.24 - walk * r * 0.15, r * 0.79, r * 0.05, r * 0.025);
    }

    // torso enorme
    ellipseO(ctx, 0, r * 0.1, r * 0.62, r * 0.52, flash || vGrad(ctx, color, -r * 0.42, r * 0.62, 0.25, -0.22));
    if (!flash) rim(ctx, 0, r * 0.08, r * 0.6, r * 0.5, 0.22);

    // pelaje del pecho
    if (!flash) {
      ctx.fillStyle = shade('#c98e54', 0.1);
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 0.1);
      ctx.quadraticCurveTo(-r * 0.34, r * 0.28, 0, r * 0.4);
      ctx.quadraticCurveTo(r * 0.34, r * 0.28, r * 0.3, -r * 0.1);
      ctx.quadraticCurveTo(0, r * 0.05, -r * 0.3, -r * 0.1);
      ctx.closePath();
      ctx.fill();
      // trazos de pelo
      ctx.strokeStyle = 'rgba(160,92,44,0.5)';
      ctx.lineWidth = 1.2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * r * 0.14, r * 0.1);
        ctx.quadraticCurveTo(i * r * 0.14 + r * 0.03, r * 0.2, i * r * 0.14, r * 0.3);
        ctx.stroke();
      }
    }

    // cinturón con calavera
    ctx.fillStyle = flash || '#3a2412';
    ctx.fillRect(-r * 0.5, r * 0.42, r * 1.0, r * 0.14);
    if (!flash) {
      ellipse(ctx, 0, r * 0.49, r * 0.1, r * 0.09, '#e8dcc8');
      ctx.fillStyle = '#3a2412';
      ellipse(ctx, -r * 0.035, r * 0.47, r * 0.022, r * 0.028);
      ellipse(ctx, r * 0.035, r * 0.47, r * 0.022, r * 0.028);
      ctx.fillRect(-r * 0.03, r * 0.53, r * 0.06, r * 0.02);
    }

    // brazo trasero
    ctx.save();
    ctx.rotate(-0.35 + walk * 0.2);
    ellipse(ctx, -r * 0.72, r * 0.05, r * 0.18, r * 0.42, fur);
    ctx.restore();

    // brazo con hacha doble
    ctx.save();
    ctx.translate(r * 0.6, 0);
    ctx.rotate(0.3 - walk * 0.15);
    ellipse(ctx, 0, r * 0.15, r * 0.18, r * 0.4, fur);
    // mango con vendas
    ctx.fillStyle = flash || vGrad(ctx, '#5a3a1c', -r * 0.85, r * 0.35, 0.18, -0.25);
    ctx.fillRect(-r * 0.05, -r * 0.85, r * 0.1, r * 1.2);
    if (!flash) {
      ctx.strokeStyle = '#8a5a2a';
      ctx.lineWidth = r * 0.035;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.05, -r * 0.15 + i * r * 0.12);
        ctx.lineTo(r * 0.05, -r * 0.1 + i * r * 0.12);
        ctx.stroke();
      }
    }
    // hojas dobles metálicas
    const axeBlade = flash || (() => {
      const g = ctx.createLinearGradient(0, -r * 0.9, 0, -r * 0.3);
      g.addColorStop(0, '#e8eef4');
      g.addColorStop(1, '#94a2b0');
      return g;
    })();
    [[-1], [1]].forEach(([s]) => {
      fillO(ctx, axeBlade, () => {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.05, -r * 0.85);
        ctx.quadraticCurveTo(s * r * 0.52, -r * 0.72, s * r * 0.44, -r * 0.28);
        ctx.quadraticCurveTo(s * r * 0.2, -r * 0.5, s * r * 0.05, -r * 0.5);
        ctx.closePath();
      }, 2);
    });
    if (!flash) {
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(r * 0.4, -r * 0.66);
      ctx.quadraticCurveTo(r * 0.46, -r * 0.5, r * 0.4, -r * 0.34);
      ctx.stroke();
      sparkle(ctx, r * 0.42, -r * 0.62, r * 0.06, 0.4 + 0.4 * Math.sin(t * 4 + 1));
    }
    ctx.restore();

    // melena detrás de la cabeza
    if (!flash) {
      ellipse(ctx, 0, -r * 0.5, r * 0.5, r * 0.46, shade(color, -0.32));
    }

    // cabeza de toro
    ellipseO(ctx, 0, -r * 0.45, r * 0.42, r * 0.4, flash || vGrad(ctx, color, -r * 0.85, -r * 0.05, 0.28, -0.18));
    if (!flash) rim(ctx, 0, -r * 0.47, r * 0.4, r * 0.38, 0.22);

    // hocico
    ellipseO(ctx, 0, -r * 0.26, r * 0.27, r * 0.19, flash || vGrad(ctx, '#c98e54', -r * 0.45, -r * 0.07, 0.25, -0.15), 2);

    // cuernos con puntas oscuras
    [[-1], [1]].forEach(([s]) => {
      fillO(ctx, flash || vGrad(ctx, '#e8dcc8', -r * 1.1, -r * 0.6, 0.15, -0.18), () => {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.3, -r * 0.62);
        ctx.quadraticCurveTo(s * r * 0.75, -r * 0.72, s * r * 0.62, -r * 1.05);
        ctx.quadraticCurveTo(s * r * 0.5, -r * 0.72, s * r * 0.18, -r * 0.72);
        ctx.closePath();
      }, 2);
      if (!flash) {
        ctx.fillStyle = '#8a7a62';
        ctx.beginPath();
        ctx.moveTo(s * r * 0.66, -r * 0.92);
        ctx.quadraticCurveTo(s * r * 0.68, -r * 1.0, s * r * 0.62, -r * 1.05);
        ctx.quadraticCurveTo(s * r * 0.58, -r * 0.98, s * r * 0.59, -r * 0.9);
        ctx.closePath();
        ctx.fill();
      }
    });

    if (!flash) {
      // vapor de las fosas nasales
      const sp = (t % 1.6) / 1.6;
      if (sp < 0.6) {
        const sa = (1 - sp / 0.6) * 0.35;
        const so = sp * r * 0.25;
        ctx.fillStyle = `rgba(255,255,255,${sa})`;
        ellipse(ctx, -r * 0.12 - so * 0.4, -r * 0.18 + so, r * 0.05 + so * 0.3, r * 0.04 + so * 0.2);
        ellipse(ctx, r * 0.12 + so * 0.4, -r * 0.18 + so, r * 0.05 + so * 0.3, r * 0.04 + so * 0.2);
      }

      // fosas nasales
      ctx.fillStyle = '#3a2412';
      ellipse(ctx, -r * 0.11, -r * 0.26, r * 0.04, r * 0.05);
      ellipse(ctx, r * 0.11, -r * 0.26, r * 0.04, r * 0.05);

      // aro dorado
      ctx.strokeStyle = Palette.goldHot;
      ctx.lineWidth = r * 0.045;
      ctx.beginPath();
      ctx.arc(0, -r * 0.18, r * 0.08, 0.2, Math.PI - 0.2);
      ctx.stroke();
      sparkle(ctx, r * 0.06, -r * 0.12, r * 0.035, 0.7);

      // ceño
      ctx.strokeStyle = shade(color, -0.4);
      ctx.lineWidth = r * 0.045;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-r * 0.26, -r * 0.62);
      ctx.lineTo(-r * 0.08, -r * 0.56);
      ctx.moveTo(r * 0.26, -r * 0.62);
      ctx.lineTo(r * 0.08, -r * 0.56);
      ctx.stroke();

      // ojos rojos brillantes
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      [[-1], [1]].forEach(([s]) => {
        const mg = ctx.createRadialGradient(s * r * 0.16, -r * 0.5, 0, s * r * 0.16, -r * 0.5, r * 0.12);
        mg.addColorStop(0, 'rgba(255,60,40,0.6)');
        mg.addColorStop(1, 'rgba(255,60,40,0)');
        ctx.fillStyle = mg;
        ctx.fillRect(s * r * 0.16 - r * 0.12, -r * 0.62, r * 0.24, r * 0.24);
      });
      ctx.restore();
      ctx.fillStyle = '#ff3b30';
      ellipse(ctx, -r * 0.16, -r * 0.5, r * 0.07, r * 0.08 * blink);
      ellipse(ctx, r * 0.16, -r * 0.5, r * 0.07, r * 0.08 * blink);
      if (blink > 0.5) {
        ctx.fillStyle = '#000';
        ellipse(ctx, -r * 0.16, -r * 0.5, r * 0.025, r * 0.04);
        ellipse(ctx, r * 0.16, -r * 0.5, r * 0.025, r * 0.04);
        ctx.fillStyle = '#fff';
        ellipse(ctx, -r * 0.185, -r * 0.53, r * 0.015, r * 0.018);
        ellipse(ctx, r * 0.135, -r * 0.53, r * 0.015, r * 0.018);
      }
    }

    ctx.restore();
  },

  crown(ctx, x, y, w) {
    ctx.save();
    ctx.translate(x, y);
    const g = ctx.createLinearGradient(0, -w * 0.45, 0, 0);
    g.addColorStop(0, '#ffe9a0');
    g.addColorStop(1, '#d4a73a');
    fillO(ctx, g, () => {
      ctx.beginPath();
      ctx.moveTo(-w * 0.5, 0);
      ctx.lineTo(-w * 0.5, -w * 0.35);
      ctx.lineTo(-w * 0.25, -w * 0.12);
      ctx.lineTo(0, -w * 0.45);
      ctx.lineTo(w * 0.25, -w * 0.12);
      ctx.lineTo(w * 0.5, -w * 0.35);
      ctx.lineTo(w * 0.5, 0);
      ctx.closePath();
    }, 2);
    ctx.fillStyle = '#ff3b30';
    ellipse(ctx, 0, -w * 0.08, w * 0.07, w * 0.07);
    ctx.fillStyle = '#00d5e8';
    ellipse(ctx, -w * 0.32, -w * 0.1, w * 0.045, w * 0.045);
    ellipse(ctx, w * 0.32, -w * 0.1, w * 0.045, w * 0.045);
    sparkle(ctx, w * 0.38, -w * 0.32, w * 0.09, 0.9);
    ctx.restore();
  },
};

export const ENEMY_SPRITES = ['slime', 'goblin', 'orc', 'minotaur'];
