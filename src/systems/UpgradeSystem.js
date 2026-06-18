import { Config } from '../core/Config.js';
import { Rarities, rollRarity } from '../core/Rarity.js';

// Mejoras numéricas por clase. El valor base escala con el
// multiplicador de la rareza de la carta.
const POOLS = {
  mage: [
    { id: 'mage_dmg', name: 'Orbe Denso', icon: '🔮', base: 14,
      desc: v => `+${v}% daño de los orbes`,
      apply: (p, v) => { p.dmgMult *= 1 + v / 100; } },
    { id: 'mage_atkspd', name: 'Canalización Rápida', icon: '✨', base: 10,
      desc: v => `+${v}% velocidad de lanzamiento`,
      apply: (p, v) => { p.atkSpeedMult *= 1 + v / 100; } },
    { id: 'mage_speed', name: 'Paso Etéreo', icon: '🌀', base: 8,
      desc: v => `+${v}% velocidad de movimiento`,
      apply: (p, v) => { p.speedMult *= 1 + v / 100; } },
    { id: 'mage_hp', name: 'Escudo de Maná', icon: '🛡️', base: 15,
      desc: v => `+${v} HP máximo (y cura ${v})`,
      apply: (p, v) => { p.hpMax += v; p.hp = Math.min(p.hpMax, p.hp + v); } },
    { id: 'mage_regen', name: 'Sifón Vital', icon: '💜', base: 0.5, decimals: 1,
      desc: v => `+${v} HP por segundo`,
      apply: (p, v) => { p.regen += v; } },
    { id: 'mage_magnet', name: 'Aura Magnética', icon: '🧲', base: 25,
      desc: v => `+${v} rango de recogida de gemas`,
      apply: (p, v) => { p.pickupRange += v; } },
  ],
  ranger: [
    { id: 'ranger_dmg', name: 'Puntas Afiladas', icon: '🏹', base: 12,
      desc: v => `+${v}% daño de las flechas`,
      apply: (p, v) => { p.dmgMult *= 1 + v / 100; } },
    { id: 'ranger_atkspd', name: 'Dedos Veloces', icon: '⚡', base: 12,
      desc: v => `+${v}% velocidad de disparo`,
      apply: (p, v) => { p.atkSpeedMult *= 1 + v / 100; } },
    { id: 'ranger_speed', name: 'Botas Ligeras', icon: '👢', base: 10,
      desc: v => `+${v}% velocidad de movimiento`,
      apply: (p, v) => { p.speedMult *= 1 + v / 100; } },
    { id: 'ranger_hp', name: 'Chaleco de Cuero', icon: '🦺', base: 12,
      desc: v => `+${v} HP máximo (y cura ${v})`,
      apply: (p, v) => { p.hpMax += v; p.hp = Math.min(p.hpMax, p.hp + v); } },
    { id: 'ranger_regen', name: 'Vendajes', icon: '🩹', base: 0.4, decimals: 1,
      desc: v => `+${v} HP por segundo`,
      apply: (p, v) => { p.regen += v; } },
    { id: 'ranger_magnet', name: 'Silbido del Bosque', icon: '🍃', base: 30,
      desc: v => `+${v} rango de recogida de gemas`,
      apply: (p, v) => { p.pickupRange += v; } },
  ],
  alchemist: [
    { id: 'alch_dmg', name: 'Catalizador', icon: '🧪', base: 13,
      desc: v => `+${v}% daño de las explosiones`,
      apply: (p, v) => { p.dmgMult *= 1 + v / 100; } },
    { id: 'alch_atkspd', name: 'Destilación Veloz', icon: '⚗️', base: 11,
      desc: v => `+${v}% velocidad de lanzamiento`,
      apply: (p, v) => { p.atkSpeedMult *= 1 + v / 100; } },
    { id: 'alch_splash', name: 'Reacción Expansiva', icon: '💨', base: 9,
      desc: v => `+${v}% radio de explosión`,
      apply: (p, v) => { const w = p.weapons[0]; if (w.splash) w.splash *= 1 + v / 100; } },
    { id: 'alch_hp', name: 'Tónico Robusto', icon: '🍶', base: 14,
      desc: v => `+${v} HP máximo (y cura ${v})`,
      apply: (p, v) => { p.hpMax += v; p.hp = Math.min(p.hpMax, p.hp + v); } },
    { id: 'alch_regen', name: 'Poción Lenta', icon: '💚', base: 0.5, decimals: 1,
      desc: v => `+${v} HP por segundo`,
      apply: (p, v) => { p.regen += v; } },
    { id: 'alch_magnet', name: 'Vapores Atrayentes', icon: '🧲', base: 28,
      desc: v => `+${v} rango de recogida de gemas`,
      apply: (p, v) => { p.pickupRange += v; } },
  ],
  melee: [
    { id: 'melee_dmg', name: 'Filo Brutal', icon: '⚔️', base: 16,
      desc: v => `+${v}% daño del tajo`,
      apply: (p, v) => { p.dmgMult *= 1 + v / 100; } },
    { id: 'melee_atkspd', name: 'Frenesí', icon: '🔥', base: 8,
      desc: v => `+${v}% velocidad de ataque`,
      apply: (p, v) => { p.atkSpeedMult *= 1 + v / 100; } },
    { id: 'melee_speed', name: 'Armadura Aligerada', icon: '🪶', base: 7,
      desc: v => `+${v}% velocidad de movimiento`,
      apply: (p, v) => { p.speedMult *= 1 + v / 100; } },
    { id: 'melee_hp', name: 'Baluarte', icon: '🏰', base: 20,
      desc: v => `+${v} HP máximo (y cura ${v})`,
      apply: (p, v) => { p.hpMax += v; p.hp = Math.min(p.hpMax, p.hp + v); } },
    { id: 'melee_regen', name: 'Sangre Templada', icon: '❤️', base: 0.6, decimals: 1,
      desc: v => `+${v} HP por segundo`,
      apply: (p, v) => { p.regen += v; } },
    { id: 'melee_magnet', name: 'Voluntad Imantada', icon: '🧲', base: 22,
      desc: v => `+${v} rango de recogida de gemas`,
      apply: (p, v) => { p.pickupRange += v; } },
  ],
};

// Mejoras legendarias (Jackpot): únicas, solo pueden salir una vez por partida.
const UNIQUES = {
  mage: [
    { id: 'mage_jp_mirror', name: 'Espejo Arcano', icon: '🪞',
      desc: 'Tus orbes se duplican: +2 orbes por lanzamiento',
      apply: (p) => { const w = p.weapons[0]; w.count = (w.count || 1) + 2; } },
    { id: 'mage_jp_nova', name: 'Nova Arcana', icon: '💥',
      desc: 'Nueva arma: una onda expansiva daña todo a tu alrededor',
      apply: (p) => {
        p.weapons.push({
          type: 'area',
          dmg: Config.weapons.area.dmg * 1.6,
          cd: Config.weapons.area.cd,
          range: Config.weapons.area.range * 1.2,
          cdT: 0,
        });
      } },
  ],
  ranger: [
    { id: 'ranger_jp_rain', name: 'Lluvia Mortal', icon: '🌧️',
      desc: '+3 flechas por disparo en un arco más amplio',
      apply: (p) => {
        const w = p.weapons[0];
        w.count = (w.count || 3) + 3;
        w.spread = (w.spread || 0.35) * 1.6;
      } },
    { id: 'ranger_jp_hawk', name: 'Ojo del Halcón', icon: '🦅',
      desc: 'Alcance de flechas x2 y +40% de daño',
      apply: (p) => {
        const w = p.weapons[0];
        w.range *= 2;
        p.dmgMult *= 1.4;
      } },
  ],
  melee: [
    { id: 'melee_jp_titan', name: 'Juicio del Titán', icon: '🌪️',
      desc: 'Tu tajo abarca casi el doble de área y golpea +50% más fuerte',
      apply: (p) => {
        const w = p.weapons[0];
        w.range *= 1.8;
        w.dmg *= 1.5;
      } },
    { id: 'melee_jp_iron', name: 'Corazón de Hierro', icon: '💛',
      desc: '+150 HP máximo, +3 HP/s y curación completa',
      apply: (p) => {
        p.hpMax += 150;
        p.regen += 3;
        p.hp = p.hpMax;
      } },
  ],
  alchemist: [
    { id: 'alch_jp_bomb', name: 'Bomba Inestable', icon: '💣',
      desc: '+1 frasco por lanzamiento y explosiones +40% más grandes',
      apply: (p) => {
        const w = p.weapons[0];
        w.count = (w.count || 1) + 1;
        if (w.splash) w.splash *= 1.4;
      } },
    { id: 'alch_jp_elixir', name: 'Elixir Filosofal', icon: '🏺',
      desc: '+80 HP máximo, +2 HP/s y curación completa',
      apply: (p) => {
        p.hpMax += 80;
        p.regen += 2;
        p.hp = p.hpMax;
      } },
  ],
};

// Evolución del arma: el jackpot definitivo de cada clase.
// Solo puede aparecer cuando ya obtuviste las otras 2 legendarias.
const EVOLUTIONS = {
  mage: {
    id: 'mage_evo', name: 'ASCENSIÓN: Archimago', icon: '🌟', evolution: true,
    desc: 'Tu arma evoluciona: +1 orbe, +60% daño y lanzas mucho más rápido',
    apply: (p) => {
      const w = p.weapons[0];
      w.count = (w.count || 1) + 1;
      w.dmg *= 1.6;
      w.cd *= 0.75;
      p.evolved = true;
    },
  },
  ranger: {
    id: 'ranger_evo', name: 'ASCENSIÓN: Tempestad', icon: '🌟', evolution: true,
    desc: 'Tu arma evoluciona: +2 flechas y disparas +40% más rápido',
    apply: (p) => {
      const w = p.weapons[0];
      w.count = (w.count || 3) + 2;
      p.atkSpeedMult *= 1.4;
      p.evolved = true;
    },
  },
  melee: {
    id: 'melee_evo', name: 'ASCENSIÓN: Avatar de Guerra', icon: '🌟', evolution: true,
    desc: 'Tu arma evoluciona: tajo +40% de área, +50% daño y +25% velocidad',
    apply: (p) => {
      const w = p.weapons[0];
      w.range *= 1.4;
      w.dmg *= 1.5;
      p.atkSpeedMult *= 1.25;
      p.evolved = true;
    },
  },
  alchemist: {
    id: 'alch_evo', name: 'ASCENSIÓN: Gran Alquimista', icon: '🌟', evolution: true,
    desc: 'Tu arma evoluciona: +1 frasco, explosiones +50% y +40% daño',
    apply: (p) => {
      const w = p.weapons[0];
      w.count = (w.count || 1) + 1;
      if (w.splash) w.splash *= 1.5;
      w.dmg *= 1.4;
      p.evolved = true;
    },
  },
};

function roundValue(upgrade, mult) {
  const raw = upgrade.base * mult;
  if (upgrade.decimals) {
    const f = 10 ** upgrade.decimals;
    return Math.round(raw * f) / f;
  }
  return Math.round(raw);
}

export class UpgradeSystem {
  constructor(game) {
    this.game = game;
    this.takenUniques = new Set();
  }

  roll(count = 3, luckBonus = 0) {
    const classId = this.game.player.classId;
    const luck = (this.game.player.luck || 0) + luckBonus;
    const pool = [...(POOLS[classId] || POOLS.mage)].sort(() => Math.random() - 0.5);
    const baseUniques = (UNIQUES[classId] || []);
    const uniques = baseUniques
      .filter(u => !this.takenUniques.has(u.id))
      .sort(() => Math.random() - 0.5);
    // la evolución se habilita al reclamar las otras legendarias de la clase
    const evo = EVOLUTIONS[classId];
    if (evo && !this.takenUniques.has(evo.id) &&
        baseUniques.every(u => this.takenUniques.has(u.id))) {
      uniques.push(evo);
    }

    const cards = [];
    for (let i = 0; i < count; i++) {
      let rarity = rollRarity(luck);

      if (rarity.id === 'jackpot' && uniques.length > 0) {
        const u = uniques.pop();
        cards.push({
          rarity,
          unique: true,
          upgrade: u,
          name: u.name,
          icon: u.icon,
          desc: u.desc,
        });
        continue;
      }

      // sin únicas disponibles, el jackpot baja a Ultra Raro
      if (rarity.id === 'jackpot') rarity = Rarities.ultraRaro;

      const u = pool.length ? pool.pop() : (POOLS[classId] || POOLS.mage)[0];
      const value = roundValue(u, rarity.mult);
      cards.push({
        rarity,
        unique: false,
        upgrade: u,
        value,
        name: u.name,
        icon: u.icon,
        desc: u.desc(value),
      });
    }
    return cards;
  }

  // Carta de cofre: una sola, con suerte muy aumentada y nunca gris.
  rollChest() {
    const card = this.roll(1, 6)[0];
    if (card.rarity.id === 'comun') {
      const better = this.roll(1, 6)[0];
      return better.rarity.id === 'comun' ? card : better;
    }
    return card;
  }

  apply(card) {
    if (card.unique) {
      this.takenUniques.add(card.upgrade.id);
      card.upgrade.apply(this.game.player);
    } else {
      card.upgrade.apply(this.game.player, card.value);
    }
  }
}
