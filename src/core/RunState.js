// RunState — máquina de estados de la run completa.
//
// Reemplaza el "loop infinito" actual por un flujo finito:
//   TITLE → CLASS_SELECT → IN_DUNGEON → RESTING → ... → VICTORY | GAMEOVER
//
// Ver docs/DESIGN_DUNGEONS.md (secciones 2, 3, 8.3) para el flow completo
// y la estructura de datos.

export const RunPhase = {
  TITLE: 'TITLE',
  CLASS_SELECT: 'CLASS_SELECT',
  DUNGEON_INTRO: 'DUNGEON_INTRO',     // fade in + nombre de mazmorra
  IN_DUNGEON: 'IN_DUNGEON',           // combate activo
  RESTING: 'RESTING',                 // descanso entre mazmorras
  MULTICLASS_PICK: 'MULTICLASS_PICK', // pantalla de elegir 2da clase (nv 30)
  BOSS_INTRO: 'BOSS_INTRO',           // cinemática corta antes del jefe final
  VICTORY: 'VICTORY',                 // mazmorra 7 superada
  GAMEOVER: 'GAMEOVER',               // muerte en cualquier mazmorra
};

export class RunState {
  // constructor({ classPrimary, save, onPhaseChange })
  // Inicializa la run, expone API para transicionar entre fases.

  // === Lifecycle ===
  // start()                       Pasa de TITLE a CLASS_SELECT
  // pickClass(classId)            Pasa a DUNGEON_INTRO de la mazmorra 1
  // enterDungeon()                Pasa a IN_DUNGEON
  // completeDungeon()             Pasa a RESTING (o BOSS_INTRO si toca jefe)
  // exitRest()                    Pasa a DUNGEON_INTRO de la siguiente
  // killPlayer()                  Pasa a GAMEOVER
  // claimVictory()                Pasa a VICTORY

  // === Multiclase ===
  // canPickMulticlass()           true si nivel >= 30 y no se eligió aún
  // pickSecondaryClass(classId)   Aplica multiclase, vuelve a RESTING

  // === Getters ===
  // get phase()                   Fase actual (RunPhase)
  // get dungeonIndex()            0..6
  // get currentDungeon()          Dungeon | null
  // get currentRest()             Rest | null
  // get isPreBossRest()           true si el descanso actual es el de antes del jefe
}

// Helper: cuántas mazmorras tiene una run (default 7, ver doc §2).
export const DUNGEONS_PER_RUN = 7;
