// Mobile-first ulti button. Always visible (touch & mouse). Shows the ulti
// icon, a radial cooldown overlay (conic-gradient), and a golden pulse when
// ready. Calls `input.triggerUlti()` on tap/click.

export class UltiButton {
  constructor(rootEl, input) {
    this.root = rootEl;
    this.input = input;
    this.game = null;
    this._raf = null;
    this._lastT = -1;
    this._lastReady = null;

    this._buildDom();
    this._bind();
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
  }

  attachGame(game) {
    this.game = game;
    this._sync(true);
  }

  detach() {
    this.game = null;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    if (this.root.isConnected) this.root.style.display = 'none';
  }

  _buildDom() {
    this.root.classList.add('ultiBtn');
    this.root.innerHTML = `
      <div class="ultiBtn__ring"></div>
      <div class="ultiBtn__pulse"></div>
      <div class="ultiBtn__icon"></div>
      <div class="ultiBtn__cd"></div>
    `;
    this.iconEl = this.root.querySelector('.ultiBtn__icon');
    this.cdEl = this.root.querySelector('.ultiBtn__cd');
    this.ringEl = this.root.querySelector('.ultiBtn__ring');
    this.pulseEl = this.root.querySelector('.ultiBtn__pulse');
    this.root.style.display = 'flex';
  }

  _bind() {
    const fire = e => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      // Press feedback
      this.root.classList.add('ultiBtn--press');
      setTimeout(() => this.root.classList.remove('ultiBtn--press'), 120);
      this.input.triggerUlti();
    };
    this.root.addEventListener('touchstart', fire, { passive: false });
    this.root.addEventListener('mousedown', fire);
    this.root.addEventListener('click', e => e.preventDefault());
  }

  _sync(force) {
    const game = this.game;
    if (!game || !game.player) return;
    const p = game.player;
    const ulti = p.ulti;
    if (!ulti) {
      this.root.style.display = 'none';
      return;
    }
    if (this.root.style.display !== 'flex') this.root.style.display = 'flex';
    if (force || this.iconEl.textContent !== ulti.icon) this.iconEl.textContent = ulti.icon;

    const cd = ulti.cooldown || 1;
    const t = p.ultiCdT;
    const ready = t <= 0;

    if (ready) {
      this.cdEl.style.background = 'transparent';
      this.cdEl.textContent = '';
    } else {
      // Conic from top, clockwise; filled portion = remaining cooldown
      const frac = Math.max(0, Math.min(1, t / cd));
      const deg = frac * 360;
      this.cdEl.style.background =
        `conic-gradient(rgba(0,0,0,.7) 0deg ${deg}deg, rgba(0,0,0,0) ${deg}deg 360deg)`;
      this.cdEl.textContent = t >= 1 ? Math.ceil(t) : t.toFixed(1);
    }

    if (ready !== this._lastReady) {
      this.root.classList.toggle('ultiBtn--ready', ready);
      this._lastReady = ready;
    }
  }

  _loop() {
    this._sync(false);
    this._raf = requestAnimationFrame(this._loop);
  }
}
