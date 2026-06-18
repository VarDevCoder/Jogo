import { STAT_IDS, StatDefs } from '../core/Stats.js';

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

    // Stats RPG: contenedor con iconos y badge dorado de puntos sin gastar.
    // Se montan dentro de #topbar si existen los elementos esperados.
    this.statEls = {};
    this.statBadge = null;
    this._mountStats();
  }

  _mountStats() {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;
    if (document.getElementById('statsRpg')) return; // ya montado
    const wrap = document.createElement('div');
    wrap.id = 'statsRpg';
    let html = '';
    for (const id of STAT_IDS) {
      const def = StatDefs[id];
      html += `<span class="statChip" data-stat="${id}" style="color:${def.color}">${def.icon} <b id="stat_${id}">0</b></span>`;
    }
    html += `<span id="statBadge" class="statBadge hidden">+0</span>`;
    wrap.innerHTML = html;
    topbar.appendChild(wrap);
    for (const id of STAT_IDS) {
      this.statEls[id] = document.getElementById(`stat_${id}`);
    }
    this.statBadge = document.getElementById('statBadge');
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

    if (player.stats) {
      for (const id of STAT_IDS) {
        const el = this.statEls[id];
        if (el) el.textContent = player.stats[id] || 0;
      }
    }
    if (this.statBadge) {
      const pts = player.statPointsAvailable || 0;
      if (pts > 0) {
        this.statBadge.textContent = `+${pts}`;
        this.statBadge.classList.remove('hidden');
      } else {
        this.statBadge.classList.add('hidden');
      }
    }
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
