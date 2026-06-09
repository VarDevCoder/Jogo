import { Config } from '../core/Config.js';

const UPGRADES = [
  {
    id: 'dmg', name: 'Más daño', desc: '+25% daño global',
    apply: (p) => { p.dmgMult *= 1.25; },
  },
  {
    id: 'atkspd', name: 'Velocidad de ataque', desc: '+20% velocidad de ataque',
    apply: (p) => { p.atkSpeedMult *= 1.20; },
  },
  {
    id: 'movspd', name: 'Velocidad de movimiento', desc: '+15% velocidad',
    apply: (p) => { p.speedMult *= 1.15; },
  },
  {
    id: 'hp', name: 'Vida máxima', desc: '+25 HP máximo y cura completa',
    apply: (p) => { p.hpMax += 25; p.hp = p.hpMax; },
  },
  {
    id: 'regen', name: 'Regeneración', desc: '+1 HP/s',
    apply: (p) => { p.regen += 1; },
  },
  {
    id: 'magnet', name: 'Imán de gemas', desc: '+40 rango de recogida',
    apply: (p) => { p.pickupRange += 40; },
  },
  {
    id: 'proj+', name: 'Proyectil extra', desc: '+1 proyectil del arma principal',
    apply: (p) => {
      const w = p.weapons[0];
      if (w && (w.type === 'orb' || w.type === 'arrow')) {
        w.count = (w.count || 1) + 1;
      } else if (w) {
        w.dmg *= 1.2;
      }
    },
  },
  {
    id: 'range+', name: 'Alcance', desc: '+25% rango del arma principal',
    apply: (p) => { const w = p.weapons[0]; if (w) w.range *= 1.25; },
  },
  {
    id: 'area', name: 'Arma: Onda expansiva', desc: 'Daña a enemigos cercanos',
    apply: (p) => {
      const existing = p.weapons.find(x => x.type === 'area');
      if (existing) {
        existing.dmg *= 1.3;
        existing.range *= 1.15;
      } else {
        p.weapons.push({
          type: 'area',
          dmg: Config.weapons.area.dmg,
          cd: Config.weapons.area.cd,
          range: Config.weapons.area.range,
          cdT: 0,
        });
      }
    },
  },
];

export class UpgradeSystem {
  constructor(game) { this.game = game; }

  roll(count = 3) {
    return [...UPGRADES].sort(() => Math.random() - 0.5).slice(0, count);
  }

  apply(upgrade) {
    upgrade.apply(this.game.player);
  }
}
