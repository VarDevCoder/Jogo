export class PhysicsSystem {
  constructor(game) { this.game = game; }

  update(dt) {
    const { enemies, player } = this.game;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      e.moveToward(player.x, player.y, dt);
      e.tickFx(dt);

      for (let j = i + 1; j < enemies.length; j++) {
        const o = enemies[j];
        const ex = o.x - e.x, ey = o.y - e.y;
        const ed = Math.hypot(ex, ey);
        const min = e.r + o.r;
        if (ed < min && ed > 0) {
          const push = (min - ed) / 2;
          const nx = ex / ed, ny = ey / ed;
          e.x -= nx * push; e.y -= ny * push;
          o.x += nx * push; o.y += ny * push;
        }
      }

      const dx = player.x - e.x, dy = player.y - e.y;
      const d = Math.hypot(dx, dy);
      if (d < e.r + player.r) {
        player.takeDamage(e.dmg * dt);
      }
    }
  }
}
