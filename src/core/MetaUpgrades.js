// Mejoras permanentes del Santuario: se compran con oro entre partidas
// y se aplican al empezar cada run. El pilar rogue-lite del juego.
export const MetaUpgrades = [
  {
    id: 'vitalidad', name: 'Vitalidad', icon: '❤️', max: 5,
    desc: l => `+${l * 20} HP máximo al empezar`,
    apply: (p, l) => { p.hpMax += l * 20; p.hp = p.hpMax; },
  },
  {
    id: 'fuerza', name: 'Fuerza', icon: '💪', max: 5,
    desc: l => `+${l * 8}% daño base`,
    apply: (p, l) => { p.dmgMult *= 1 + l * 0.08; },
  },
  {
    id: 'celeridad', name: 'Celeridad', icon: '⚡', max: 5,
    desc: l => `+${l * 5}% velocidad de ataque`,
    apply: (p, l) => { p.atkSpeedMult *= 1 + l * 0.05; },
  },
  {
    id: 'presteza', name: 'Presteza', icon: '👟', max: 5,
    desc: l => `+${l * 4}% velocidad de movimiento`,
    apply: (p, l) => { p.speedMult *= 1 + l * 0.04; },
  },
  {
    id: 'suerte', name: 'Suerte', icon: '🍀', max: 5,
    desc: l => `Cartas de mayor rareza (nivel ${l})`,
    apply: (p, l) => { p.luck = (p.luck || 0) + l; },
  },
  {
    id: 'codicia', name: 'Codicia', icon: '💰', max: 5,
    desc: l => `+${l * 25}% oro obtenido`,
    apply: (p, l) => { p.greed = (p.greed || 1) + l * 0.25; },
  },
];

export function metaCost(level) {
  return Math.floor(15 * Math.pow(2.1, level));
}

export function applyMeta(player, metaLevels) {
  player.luck = player.luck || 0;
  player.greed = player.greed || 1;
  for (const u of MetaUpgrades) {
    const l = metaLevels[u.id] || 0;
    if (l > 0) u.apply(player, Math.min(l, u.max));
  }
}
