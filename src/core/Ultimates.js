// Habilidades ulti por clase. Cada ulti crea balas especiales que el CombatSystem
// procesa de forma normal (las balas usan `hits` para no aplicar damage doble en
// ticks). El cooldown lo lleva el Player.

import { Bullet } from '../entities/Bullet.js';
import { Particle } from '../entities/Particle.js';

const BASE = {
  mage: 120,
  ranger: 22,    // por flecha (30 flechas * 22 ~= 660 daño máximo)
  melee: 28,     // tick por enemigo (15 ticks por segundo, sería muy fuerte) -> escalado por ticks
  alchemist: 14, // tick DoT
};

function nearestEnemy(player, enemies, fallback = 300) {
  let best = null, bd = Infinity;
  for (const e of enemies) {
    const d = Math.hypot(e.x - player.x, e.y - player.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best || { x: player.x + player.facing * fallback, y: player.y };
}

function spawnRingParticles(game, x, y, color, count = 24, speed = 240, life = 0.6) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    game.particles.push(new Particle(
      x, y,
      Math.cos(a) * speed * (0.6 + Math.random() * 0.6),
      Math.sin(a) * speed * (0.6 + Math.random() * 0.6),
      color, life,
    ));
  }
}

// =====================================================================
// MAGE: Rayo vertical
// =====================================================================
function castMageLaser(game, player) {
  const dmg = BASE.mage * player.dmgMult;
  const b = new Bullet({
    x: player.x, y: player.y,
    vx: 0, vy: 0,
    dmg,
    r: 60, // ancho/2 = 60 -> columna de 120px
    life: 1.5,
    type: 'laser_column',
  });
  b.maxLife = 1.5;
  b.tickT = 0;
  b.tickRate = 0.12;       // damage tick cada 120ms
  b.columnHalfW = 60;
  b.follow = player;       // sigue la X del jugador
  game.bullets.push(b);

  // Flash + particles
  game.flash = Math.max(game.flash, 0.4);
  game.shake.add(0.45);
  spawnRingParticles(game, player.x, player.y, '#6ee7ff', 30, 320, 0.7);
  for (let i = 0; i < 16; i++) {
    game.particles.push(new Particle(
      player.x + (Math.random() - 0.5) * 80,
      player.y + (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 160,
      -200 - Math.random() * 200,
      '#ffffff', 0.5,
    ));
  }
}

// =====================================================================
// RANGER: Lluvia de flechas
// =====================================================================
function castRangerArrowRain(game, player) {
  const target = nearestEnemy(player, game.enemies, 280);
  const cx = target.x, cy = target.y;
  const radius = 180;

  // Marker visual del área
  const marker = new Bullet({
    x: cx, y: cy,
    vx: 0, vy: 0,
    dmg: 0,
    r: radius,
    life: 2.0,
    type: 'arrow_rain_marker',
  });
  marker.maxLife = 2.0;
  marker.spawnT = 0;
  marker.spawnRate = 2.0 / 30;        // 30 flechas en 2s
  marker.spawnsLeft = 30;
  marker.dmg = BASE.ranger * player.dmgMult;
  marker.radius = radius;
  game.bullets.push(marker);

  game.shake.add(0.2);
  spawnRingParticles(game, cx, cy, '#5fffaf', 18, 180, 0.5);
}

// =====================================================================
// MELEE: Torbellino
// =====================================================================
function castMeleeWhirlwind(game, player) {
  const radius = 130;
  const dur = 3.0;
  const b = new Bullet({
    x: player.x, y: player.y,
    vx: 0, vy: 0,
    dmg: BASE.melee * player.dmgMult,
    r: radius,
    life: dur,
    type: 'whirlwind',
  });
  b.maxLife = dur;
  b.follow = player;
  b.tickT = 0;
  b.tickRate = 0.18;        // ~5.5 ticks/s
  game.bullets.push(b);

  // Slowdown del jugador mientras gira
  player.whirlwindT = dur;

  game.shake.add(0.4);
  spawnRingParticles(game, player.x, player.y, '#e0e6f0', 24, 280, 0.5);
}

// =====================================================================
// ALCHEMIST: Infierno alquímico
// =====================================================================
function castAlchemistInferno(game, player) {
  const flasks = 8;
  const ring = 110;
  for (let i = 0; i < flasks; i++) {
    const a = (i / flasks) * Math.PI * 2;
    const x = player.x + Math.cos(a) * ring;
    const y = player.y + Math.sin(a) * ring;

    const pool = new Bullet({
      x, y,
      vx: 0, vy: 0,
      dmg: BASE.alchemist * player.dmgMult,
      r: 70,
      life: 4.0,
      type: 'inferno_pool',
    });
    pool.maxLife = 4.0;
    pool.tickT = Math.random() * 0.2;
    pool.tickRate = 0.25;
    pool.bubbleSeed = Math.random() * 100;
    game.bullets.push(pool);

    // Explosión inicial
    for (let k = 0; k < 8; k++) {
      game.particles.push(new Particle(
        x, y,
        (Math.random() - 0.5) * 320,
        (Math.random() - 0.5) * 320,
        '#5fffaf', 0.45,
      ));
    }
  }
  game.shake.add(0.5);
  game.flash = Math.max(game.flash, 0.25);
}

export const Ultimates = {
  mage_laser: {
    id: 'mage_laser',
    name: 'Rayo Arcano',
    desc: 'Un haz vertical cae sobre tu posición durante 1.5s.',
    cooldown: 25,
    icon: 'L',
    cast: castMageLaser,
  },
  ranger_arrowRain: {
    id: 'ranger_arrowRain',
    name: 'Lluvia de Flechas',
    desc: '30 flechas caen en un área durante 2s.',
    cooldown: 25,
    icon: 'A',
    cast: castRangerArrowRain,
  },
  melee_whirlwind: {
    id: 'melee_whirlwind',
    name: 'Torbellino',
    desc: 'Giras 3s dañando todo a tu alrededor.',
    cooldown: 25,
    icon: 'W',
    cast: castMeleeWhirlwind,
  },
  alchemist_inferno: {
    id: 'alchemist_inferno',
    name: 'Infierno Alquímico',
    desc: '8 frascos crean charcos tóxicos durante 4s.',
    cooldown: 25,
    icon: 'I',
    cast: castAlchemistInferno,
  },
};

export function getUlti(id) {
  return Ultimates[id] || null;
}
