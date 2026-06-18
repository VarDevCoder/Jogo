import { StatDefs, STAT_IDS, recomputeStats } from '../core/Stats.js';

// Modal de asignación manual de stats. Se abre tras elegir cartas
// si el jugador tiene puntos sin gastar.
export class StatsMenu {
  constructor(overlayEl, audio = null) {
    this.overlay = overlayEl;
    this.audio = audio;
    this._onDone = null;
    this._player = null;
  }

  show(player, onDone) {
    this._player = player;
    this._onDone = onDone;
    this._render();
    this.overlay.classList.remove('hidden');
  }

  _render() {
    const p = this._player;
    const remaining = p.statPointsAvailable;

    const rows = STAT_IDS.map(id => {
      const def = StatDefs[id];
      const val = p.stats[id] || 0;
      const canAdd = remaining > 0;
      return `
        <div class="statRow" style="border-color:${def.color}">
          <span class="statIcon" style="color:${def.color}">${def.icon}</span>
          <span class="statName">${def.name}</span>
          <span class="statValue" style="color:${def.color}"><b>${val}</b></span>
          <button class="statPlus" data-stat="${id}" ${canAdd ? '' : 'disabled'}>+</button>
        </div>
      `;
    }).join('');

    const allSpent = remaining === 0;
    this.overlay.innerHTML = `
      <h2>📈 Repartí tus puntos</h2>
      <p>Te quedan <b class="statPoints">${remaining}</b> punto${remaining === 1 ? '' : 's'} por asignar.</p>
      <div class="statsList">${rows}</div>
      <div class="menuButtons">
        <button class="big" id="confirmStatsBtn" ${allSpent ? '' : 'disabled'}>
          ✅ Confirmar
        </button>
        ${!allSpent ? `<button class="menuBtn" id="laterStatsBtn">💾 Guardar para después</button>` : ''}
      </div>
    `;

    this.overlay.querySelectorAll('.statPlus').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.stat;
        if (this._player.statPointsAvailable <= 0) return;
        this._player.stats[id] = (this._player.stats[id] || 0) + 1;
        this._player.statPointsAvailable -= 1;
        recomputeStats(this._player);
        if (this.audio && this.audio.ui) this.audio.ui();
        this._render();
      };
    });

    const confirmBtn = this.overlay.querySelector('#confirmStatsBtn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (this._player.statPointsAvailable > 0) return;
        if (this.audio && this.audio.ui) this.audio.ui();
        this._close();
      };
    }
    const laterBtn = this.overlay.querySelector('#laterStatsBtn');
    if (laterBtn) {
      laterBtn.onclick = () => {
        if (this.audio && this.audio.ui) this.audio.ui();
        this._close();
      };
    }
  }

  _close() {
    this.overlay.classList.add('hidden');
    const cb = this._onDone;
    this._onDone = null;
    this._player = null;
    if (cb) cb();
  }
}
