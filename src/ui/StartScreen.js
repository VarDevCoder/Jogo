import { Classes, CLASS_ORDER } from '../core/Classes.js';

export class StartScreen {
  constructor(overlayEl) {
    this.overlay = overlayEl;
  }

  showIntro(onStart) {
    const cards = CLASS_ORDER.map(id => {
      const c = Classes[id];
      const s = c.stats;
      return `
        <button class="classCard" data-id="${id}" style="border-color:${c.color}">
          <div class="classHead" style="color:${c.color}">${c.name}</div>
          <div class="classDesc">${c.desc}</div>
          <div class="classStats">
            <span>HP <b>${s.hp}</b></span>
            <span>SPD <b>${s.speed}</b></span>
            <span>DMG <b>x${s.dmgMult.toFixed(2)}</b></span>
          </div>
        </button>
      `;
    }).join('');

    this.overlay.innerHTML = `
      <h1>Survivors Mini</h1>
      <p>Elige tu clase. Sobrevive todo lo que puedas.<br>
      <b style="color:#fff">PC:</b> WASD/flechas. <b style="color:#fff">Móvil:</b> joystick.</p>
      <div class="classes">${cards}</div>
    `;
    this.overlay.classList.remove('hidden');

    this.overlay.querySelectorAll('.classCard').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        this.overlay.classList.add('hidden');
        onStart(id);
      };
    });
  }

  showGameOver({ time, level, kills }) {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    this.overlay.innerHTML = `
      <h1>Has caído</h1>
      <p>Sobreviviste ${m}:${s} · Nivel ${level} · ${kills} kills</p>
      <button class="big" id="restartBtn">Reintentar</button>
    `;
    this.overlay.classList.remove('hidden');
    document.getElementById('restartBtn').onclick = () => location.reload();
  }
}
