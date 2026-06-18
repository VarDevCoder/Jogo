// Dungeon — definición y generación de una mazmorra individual.
//
// Cada run tiene 7 mazmorras. Tipos: 'regular', 'elite', 'event', 'boss'.
// Ver docs/DESIGN_DUNGEONS.md §4 y §8.1.

export const DungeonType = {
  REGULAR: 'regular',
  ELITE: 'elite',
  EVENT: 'event',
  BOSS: 'boss',
};

export const EventSubtype = {
  SHOP: 'shop',
  ORACLE: 'oracle',
  HORDE_ARENA: 'horde_arena',
  CURSED_CHEST: 'cursed_chest',
};

// Plantilla de la run estándar — 7 mazmorras de 1 bioma.
export const RUN_TEMPLATE = [
  // index: 0..6, type, duration (s)
  { index: 0, type: 'regular', duration: 180 },
  { index: 1, type: 'regular', duration: 180 },
  { index: 2, type: 'elite',   duration: 150 },
  { index: 3, type: 'event',   duration: 180 },
  { index: 4, type: 'regular', duration: 180 },
  { index: 5, type: 'elite',   duration: 150 },
  { index: 6, type: 'boss',    duration: 180 },
];

export class Dungeon {
  // constructor({ index, type, biome, eventSubtype?, seed? })
  // Genera la mazmorra: enemyPool, spawnCurve, miniBoss, finalWave, rewards.

  // === Factory ===
  // static fromTemplate(index, biome, rng)
  //   Construye una Dungeon a partir de RUN_TEMPLATE[index] aplicando
  //   escalado de dificultad (HP × (1 + index × 0.35), dmg × 1.20).

  // === API de runtime ===
  // tick(dt, game)                 Avanza spawn curve, miniBoss timing.
  // isComplete(game)               true cuando se cumplió el objetivo
  //                                (timer expirado y enemigos < umbral).
  // rollEventSubtype(rng)          Solo para type==='event'.

  // === Datos generados ===
  // id, index, type, biome, duration
  // enemyPool: string[]            ids de Config.enemies usables
  // spawnCurve: { start, end, ramp }
  // miniBoss: null | { atSecond, defId, hpMult, dmgMult }
  // finalWave: { atSecond, count, defId }
  // rewards: { gold: {min,max}, chest: 'none'|'normal'|'forced_rare'|'jackpot' }
  // music: string
}

// Curva de escalado entre mazmorras (ver doc §7).
export function difficultyMultiplier(dungeonIndex) {
  return {
    hp: 1 + dungeonIndex * 0.35,
    dmg: 1 + dungeonIndex * 0.20,
  };
}
