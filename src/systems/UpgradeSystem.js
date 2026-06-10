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

  roll(count = 3) {
    const classId = this.game.player.classId;
    const pool = [...(POOLS[classId] || POOLS.mage)].sort(() => Math.random() - 0.5);
    const uniques = (UNIQUES[classId] || [])
      .filter(u => !this.takenUniques.has(u.id))
      .sort(() => Math.random() - 0.5);

    const cards = [];
    for (let i = 0; i < count; i++) {
      let rarity = rollRarity();

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

  apply(card) {
    if (card.unique) {
      this.takenUniques.add(card.upgrade.id);
      card.upgrade.apply(this.game.player);
    } else {
      card.upgrade.apply(this.game.player, card.value);
    }
  }
}
