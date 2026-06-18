// Separación de enemigos con rejilla espacial: cada enemigo solo se
// compara con sus celdas vecinas, lo que permite hordas de cientos
// de enemigos sin caer a O(n²).
const CELL = 64;

export class PhysicsSystem {
  constructor(game) { this.game = game; }

  update(dt) {
    const { enemies, player } = this.game;

    const grid = new Map();
    for (const e of enemies) {
      e.moveToward(player.x, player.y, dt);
      e.tickFx(dt);
      const key = Math.floor(e.x / CELL) * 100000 + Math.floor(e.y / CELL);
      let arr = grid.get(key);
      if (!arr) { arr = []; grid.set(key, arr); }
      arr.push(e);
    }

    for (const e of enemies) {
      const kx = Math.floor(e.x / CELL);
      const ky = Math.floor(e.y / CELL);
      for (let gx = kx - 1; gx <= kx + 1; gx++) {
        for (let gy = ky - 1; gy <= ky + 1; gy++) {
          const arr = grid.get(gx * 100000 + gy);
          if (!arr) continue;
          for (const o of arr) {
            if (o === e) continue;
            const ex = o.x - e.x, ey = o.y - e.y;
            const ed = Math.hypot(ex, ey);
            const min = e.r + o.r;
            if (ed < min && ed > 0) {
              // cada par se visita dos veces: empujar solo a 'e' la mitad
              const push = (min - ed) / 2;
              e.x -= ex / ed * push;
              e.y -= ey / ed * push;
            }
          }
        }
      }

      const dx = player.x - e.x, dy = player.y - e.y;
      if (Math.hypot(dx, dy) < e.r + player.r) {
        player.takeDamage(e.dmg * dt);
      }
    }
  }
}
