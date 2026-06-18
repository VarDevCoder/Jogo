// Stats RPG escalables al estilo Elden Ring.
// 4 atributos: STR (Fuerza), DEX (Destreza), INT (Inteligencia), VIT (Vitalidad).
// Curva sin cap absoluto pero con rendimientos decrecientes: sqrt(p / SOFT_CAP).
// El jugador gana puntos al subir de nivel y los reparte manualmente.
// Los efectos se aplican como una capa reversible encima de la base de la
// clase, las cartas y la meta-progresión, para poder reasignar sin acumular.

export const StatDefs = {
  str: { id: 'str', name: 'Fuerza',       icon: '💪', color: '#ff8c5a' },
  dex: { id: 'dex', name: 'Destreza',     icon: '🎯', color: '#5fffaf' },
  int: { id: 'int', name: 'Inteligencia', icon: '🔮', color: '#a663cc' },
  vit: { id: 'vit', name: 'Vitalidad',    icon: '❤️', color: '#ff4d4d' },
};

export const STAT_IDS = ['str', 'dex', 'int', 'vit'];

// Puntos otorgados al jugador en cada subida de nivel, para repartir manualmente.
export const STAT_POINTS_PER_LEVEL = 2;

// Curva Elden Ring: en p = SOFT_CAP devuelve 1. Antes crece rápido,
// después sigue creciendo pero más lento (sin tope absoluto).
const SOFT_CAP = 20;
export function statScaling(points) {
  if (points <= 0) return 0;
  return Math.sqrt(points / SOFT_CAP);
}

// Pura: devuelve la "capa" de bonuses producida por un bloque de stats
// para una clase concreta. No muta nada.
function computeLayer(classId, stats) {
  const layer = {
    dmgMult: 1,
    atkSpeedMult: 1,
    hpBonus: 0,
    regenBonus: 0,
    critBonus: 0,
  };

  const str = stats.str || 0;
  const dex = stats.dex || 0;
  const intel = stats.int || 0;
  const vit = stats.vit || 0;

  if (str > 0) {
    const s = statScaling(str);
    const dmg = classId === 'melee' ? 0.6 : 0.25;
    layer.dmgMult *= 1 + dmg * s;
    layer.hpBonus += Math.floor(str * 5);
  }

  if (dex > 0) {
    const s = statScaling(dex);
    const dmg = classId === 'ranger' ? 0.55 : 0.2;
    layer.dmgMult *= 1 + dmg * s;
    layer.critBonus += dex * 0.005;
    layer.atkSpeedMult *= 1 + 0.1 * s;
  }

  if (intel > 0) {
    const s = statScaling(intel);
    const dmg = (classId === 'mage' || classId === 'alchemist') ? 0.6 : 0.2;
    layer.dmgMult *= 1 + dmg * s;
    layer.atkSpeedMult *= 1 + 0.15 * s;
  }

  if (vit > 0) {
    layer.hpBonus += Math.floor(vit * 10);
    layer.regenBonus += vit * 0.05;
  }

  return layer;
}

const EMPTY_LAYER = { dmgMult: 1, atkSpeedMult: 1, hpBonus: 0, regenBonus: 0, critBonus: 0 };

// Reaplica la capa de stats sobre el jugador sin acumular: deshace la
// capa anterior y aplica la nueva. Conserva todo lo demás (clase, cartas,
// meta) intacto, así que se puede llamar libremente al asignar puntos.
export function recomputeStats(player) {
  if (!player.stats) player.stats = initialStats();

  const prev = player._statLayer || EMPTY_LAYER;
  if (prev.dmgMult !== 1)      player.dmgMult /= prev.dmgMult;
  if (prev.atkSpeedMult !== 1) player.atkSpeedMult /= prev.atkSpeedMult;
  player.hpMax -= prev.hpBonus;
  player.regen -= prev.regenBonus;
  player.critBonus = Math.max(0, (player.critBonus || 0) - prev.critBonus);

  const next = computeLayer(player.classId, player.stats);
  player.dmgMult *= next.dmgMult;
  player.atkSpeedMult *= next.atkSpeedMult;
  player.hpMax += next.hpBonus;
  player.regen += next.regenBonus;
  player.critBonus = (player.critBonus || 0) + next.critBonus;

  if (player.hp > player.hpMax) player.hp = player.hpMax;

  player._statLayer = next;
}

// Bloque inicial de stats: todo en 0.
export function initialStats() {
  return { str: 0, dex: 0, int: 0, vit: 0 };
}
