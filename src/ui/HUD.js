export class HUD {
  constructor() {
    this.hpEl = document.getElementById('hp');
    this.lvlEl = document.getElementById('lvl');
    this.killsEl = document.getElementById('kills');
    this.timeEl = document.getElementById('time');
    this.goldEl = document.getElementById('gold');
    this.xpfill = document.getElementById('xpfill');
    this.xpbar = document.getElementById('xpbar');
    this.announceEl = document.getElementById('announce');
  }

  update(player, time) {
    this.hpEl.textContent = Math.ceil(player.hp);
    this.lvlEl.textContent = player.level;
    this.killsEl.textContent = player.kills;
    this.goldEl.textContent = player.gold || 0;
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    this.timeEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    const ratio = player.xp / player.xpNext;
    this.xpfill.style.width = (ratio * 100) + '%';
    this.xpbar.classList.toggle('almost', ratio > 0.85);
  }

  // anuncio dramático centrado (jefes, hordas)
  announce(text, color = '#ff4d4d') {
    const el = this.announceEl;
    if (!el) return;
    el.textContent = text;
    el.style.color = color;
    el.classList.remove('show');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('show');
  }
}
