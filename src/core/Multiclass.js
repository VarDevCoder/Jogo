// Multiclass — lógica de multiclase desbloqueada al nivel 30 de la run.
//
// Permite al jugador mezclar dos clases: hereda arma secundaria (nerfeada),
// pool de cartas y mezcla la curva de crecimiento de stats.
//
// Ver docs/DESIGN_DUNGEONS.md §6 y §8.4.

export const MULTICLASS_UNLOCK_LEVEL = 30;

// Cuánto se nerfea el arma secundaria respecto al original.
export const SECONDARY_WEAPON_NERF = {
  dmgMult: 0.7,    // 70% del daño base
  cdMult: 1.5,     // cooldown 1.5× (más lenta)
};

// Cómo se mezcla la curva de crecimiento de stats al multiclasear.
// Stat principal de la clase A sigue al 100% (1.5/nivel).
// Stat principal de la clase B entra al 33% (≈0.5/nivel).
// Vit y demás se promedian entre ambas clases.
export const MULTICLASS_GROWTH_MIX = {
  primaryMainStat: 1.0,   // multiplicador sobre growth primario
  secondaryMainStat: 0.33,
  secondaryOthers: 0.5,
};

// Sinergias específicas: pares de clases que desbloquean cartas únicas.
// (Lista vacía — pendiente diseño de boons sinérgicos.)
export const SYNERGY_CARDS = {
  // 'mage+melee':   ['arcane_templar'],
  // 'mage+ranger':  ['ether_arrow'],
  // 'melee+ranger': ['warden_volley'],
  // 'mage+alchemist': ['unstable_arcana'],
  // 'ranger+alchemist': ['toxic_shot'],
  // 'melee+alchemist': ['battle_brew'],
};

export class Multiclass {
  // constructor({ primary, secondary, pickedAtLevel, pickedAtDungeon })

  // === Estado ===
  // primary: classId
  // secondary: classId
  // pickedAtLevel, pickedAtDungeon

  // === API ===
  // mixedGrowth()                 devuelve {str,dex,int,vit} mezclando ClassGrowth
  //                               de primary y secondary según MULTICLASS_GROWTH_MIX.
  // buildSecondaryWeapon()        devuelve weapon de classSecondary con nerf aplicado.
  // mergedCardPools()             devuelve cartas de ambos pools.
  // getSynergyCards()             cartas extra disponibles si hay sinergia.

  // === Validación ===
  // static canPickAt(player)      true si player.level >= MULTICLASS_UNLOCK_LEVEL
  //                               y player.multiclass === null.
}

// Helper UI: lista las clases válidas como segunda elección (todas menos la primaria).
export function eligibleSecondaryClasses(primaryClassId, unlockedClasses) {
  return unlockedClasses.filter(id => id !== primaryClassId);
}
