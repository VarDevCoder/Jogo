// Rest — sistema de descansos entre mazmorras.
//
// Tras cada mazmorra (salvo la última) hay un descanso ~30 s donde el
// jugador toma 3 decisiones: heal, asignar stats, elegir boon.
//
// Ver docs/DESIGN_DUNGEONS.md §5 y §8.2.

export const RestStep = {
  HEARTH: 'hearth',     // hoguera: heal completo o parcial+carta extra
  STATS: 'stats',       // asignar puntos libres (str/dex/int/vit)
  BOON: 'boon',         // elegir 1 de 3 cartas
  DONE: 'done',         // cerrar y seguir
};

// Configuración por defecto de un descanso.
export const DEFAULT_REST = {
  freeStatPoints: 3,    // se suman al pool libre del jugador
  boonChoices: 3,       // cuántas cartas se ofrecen
  healFull: 1.0,        // % HP restaurado si elige opción A
  healPartial: 0.5,     // si elige B
  partialGivesBonusCard: true,
};

// Configuración del descanso especial pre-jefe (tras mazmorra 6).
export const PRE_BOSS_REST = {
  freeStatPoints: 5,
  boonChoices: 3,
  healFull: 1.0,
  healPartial: 0.5,
  partialGivesBonusCard: true,
  forcedMinRarity: 'rare',  // al menos 1 carta Rara garantizada
};

export class Rest {
  // constructor({ afterDungeonIndex, isPreBoss, classPrimary, classSecondary?, save })
  // Construye la oferta del descanso (cartas roleadas, puntos disponibles).

  // === Estado interno ===
  // step: RestStep                fase actual (HEARTH → STATS → BOON → DONE)
  // healChoice: null | 'full' | 'partial'
  // statsAssigned: { str, dex, int, vit }   delta asignado por jugador
  // boonPicked: cardId | null
  // bonusCard: cardId | null      si eligió healPartial

  // === API ===
  // chooseHeal(option)            'full' | 'partial' → avanza a STATS
  // assignStat(statId, delta)     Mueve puntos del pool libre a un stat
  // confirmStats()                avanza a BOON
  // pickBoon(cardId)              aplica la carta, avanza a DONE
  // isComplete()                  true cuando step === DONE
  // applyTo(player)               aplica heal+stats+boon al jugador real

  // === Helpers ===
  // getBoonChoices()              cartas roleadas (mezcla pool primario + secundario)
}
