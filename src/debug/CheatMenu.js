import { Config } from '../core/Config.js';

export class CheatMenu {
  constructor(game) {
    this.game = game;
    this.visible = false;
    this.godmode = false;
    this.timeScale = 1;

    this.el = document.createElement('div');
    this.el.id = 'cheatMenu';
    this.el.style.cssText = `
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 9998;
      background: #1a0b2e; color: #fff;
      border: 2px solid #ffd86b;
      border-radius: 12px; padding: 18px 22px;
      font-family: ui-monospace, monospace; font-size: 13px;
      min-width: 280px;
      box-shadow: 0 0 40px rgba(255,216,107,.4);
      display: none;
    `;
    document.body.appendChild(this.el);

    this._buildMenu();

    window.addEventListener('keydown', e => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.visible) {
        this.toggle();
      }
    });

    this._origTakeDamage = game.player.takeDamage.bind(game.player);
    this._patchPlayer();
  }

  _patchPlayer() {
    const cheat = this;
    this.game.player.takeDamage = function (amount) {
      if (cheat.godmode) return;
      cheat._origTakeDamage(amount);
    };
  }

  _buildMenu() {
    const cheats = [
      { label: '🛡️  Toggle Godmode', key: 'g', fn: () => { this.godmode = !this.godmode; this._render(); } },
      { label: '💛  Full heal', key: 'h', fn: () => { this.game.player.hp = this.game.player.hpMax; } },
      { label: '⭐  +50 XP', key: 'x', fn: () => this._giveXp(50) },
      { label: '⭐  +500 XP', key: 'X', fn: () => this._giveXp(500) },
      { label: '⚡  Subir 5 niveles', key: 'l', fn: () => { for (let i = 0; i < 5; i++) this._giveXp(this.game.player.xpNext); } },
      { label: '👹  Invocar boss ya', key: 'b', fn: () => this.game.spawnSystem?.spawnBoss?.() },
      { label: '👾  Spawn 50 enemigos', key: 's', fn: () => { for (let i = 0; i < 50; i++) this.game.spawnSystem?.spawn?.(); } },
      { label: '💀  Matar todo en pantalla', key: 'k', fn: () => this._killAll() },
      { label: '🐢  Toggle slow-mo (0.3x)', key: 'm', fn: () => { this.timeScale = this.timeScale === 1 ? 0.3 : 1; this._render(); } },
      { label: '🚀  Toggle turbo (2.5x)', key: 't', fn: () => { this.timeScale = this.timeScale === 1 ? 2.5 : 1; this._render(); } },
      { label: '🧹  Limpiar pantalla', key: 'c', fn: () => { this.game.enemies.length = 0; this.game.bullets.length = 0; this.game.particles.length = 0; } },
      { label: '💀  Suicidio (probar game over)', key: 'd', fn: () => { this.godmode = false; this.game.player.hp = 0; } },
    ];

    this.cheats = cheats;

    window.addEventListener('keydown', e => {
      if (!this.visible) return;
      const c = cheats.find(c => c.key === e.key);
      if (c) { e.preventDefault(); c.fn(); }
    });

    this._render();
  }

  _render() {
    const rows = this.cheats.map(c =>
      `<div style="display:flex;justify-content:space-between;gap:14px;padding:3px 0">
        <span>${c.label}</span>
        <kbd style="background:#3d2750;color:#ffd86b;padding:1px 8px;border-radius:4px;font-size:11px">${c.key}</kbd>
      </div>`
    ).join('');

    this.el.innerHTML = `
      <div style="color:#ffd86b;font-weight:800;font-size:14px;margin-bottom:10px;letter-spacing:2px">🎮 CHEATS</div>
      <div style="color:#5fffaf;margin-bottom:8px">
        Godmode: ${this.godmode ? 'ON ✓' : 'OFF'}<br>
        Time scale: ${this.timeScale}x
      </div>
      <div style="border-top:1px solid #3d2750;padding-top:8px">${rows}</div>
      <div style="margin-top:10px;color:#888;font-size:11px;text-align:center">[F1] cerrar  ·  [Esc] cerrar</div>
    `;
  }

  _giveXp(amount) {
    this.game.player.addXp(amount, () => this.game.onLevelUp());
  }

  _killAll() {
    for (let i = this.game.enemies.length - 1; i >= 0; i--) {
      this.game.enemies[i].hp = 0;
      this.game.enemies[i].takeDamage(99999);
    }
  }

  toggle() {
    this.visible = !this.visible;
    this.el.style.display = this.visible ? 'block' : 'none';
    this._render();
    if (this.visible) this.game.pause();
    else this.game.resume();
  }
}
