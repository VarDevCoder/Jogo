export const Palette = {
  bgDeep: '#0e0418',
  bgMid: '#1a0b2e',
  grid: '#2a1a55',
  teal: '#00f5ff',
  tealSoft: '#6ee7ff',
  gold: '#f6c453',
  goldHot: '#ffba08',
  amber: '#ff9e3b',
  player: '#f6c453',
  playerInner: '#fff3c4',
  enemy1: '#7b2cbf',
  enemy2: '#5a189a',
  enemy3: '#9d4edd',
  enemy4: '#c77dff',
  blood: '#a663cc',
  white: '#ffffff',
};

export const Config = {
  player: {
    radius: 14,
    hp: 100,
    speed: 180,
    pickupRange: 60,
    color: Palette.player,
    innerColor: Palette.playerInner,
  },
  xp: { initialNext: 5, growth: 1.5, add: 2 },
  spawn: { minRate: 0.15, maxRate: 1.2, rampSeconds: 60 },
  enemies: [
    { hp: 15,  dmg: 8,  speed: 60, radius: 16, color: Palette.enemy1, xp: 1, sprite: 'zombie' },
    { hp: 35,  dmg: 12, speed: 70, radius: 18, color: Palette.enemy2, xp: 2, sprite: 'skeleton' },
    { hp: 80,  dmg: 18, speed: 55, radius: 20, color: Palette.enemy3, xp: 4, sprite: 'ghost' },
    { hp: 200, dmg: 25, speed: 50, radius: 26, color: Palette.enemy4, xp: 8, sprite: 'demon' },
  ],
  weapons: {
    orb: { dmg: 12, cd: 0.6, range: 160, projectileSpeed: 360, projectileRadius: 6, life: 1.5 },
    area: { dmg: 18, cd: 1.8, range: 140, life: 0.25 },
  },
  world: {
    background: Palette.bgMid,
    grid: { size: 60, color: Palette.grid },
  },
  fx: {
    shakeOnHit: 0.18,
    shakeOnPlayerHit: 0.35,
    hitStopOnKill: 0.05,
    hitStopOnLevelUp: 0.18,
    critChance: 0.15,
    critMult: 2,
  },
};
