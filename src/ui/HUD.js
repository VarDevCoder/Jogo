export class HUD {
  constructor() {
    this.hpEl = document.getElementById('hp');
    this.lvlEl = document.getElementById('lvl');
    this.killsEl = document.getElementById('kills');
    this.timeEl = document.getElementById('time');
    this.xpfill = document.getElementById('xpfill');
  }

  update(player, time) {
    this.hpEl.textContent = Math.ceil(player.hp);
    this.lvlEl.textContent = player.level;
    this.killsEl.textContent = player.kills;
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    this.timeEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    this.xpfill.style.width = (player.xp / player.xpNext * 100) + '%';
  }
}
