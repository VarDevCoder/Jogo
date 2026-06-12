// Overlay de debug con profiling. Atajo F3.
//
// Muestra: FPS rolling, frame ms con histograma chico, contadores con HWM
// (high-water mark), breakdown por sistema (de Profiler), metricas de leak
// (DOM nodes, heap size cuando disponible).
//
// F3 alterna visibilidad. La ventana ?debug=1 lo abre automatico.

const HIST_SIZE = 60;

export class DebugOverlay {
  constructor() {
    this.visible = false;
    this.fps = 0;
    this.frames = 0;
    this.fpsT = 0;
    this.frameHist = new Array(HIST_SIZE).fill(0);
    this.histIdx = 0;
    this.frameMs = 0;
    this.lastFrameStart = performance.now();

    // high water marks
    this.hwm = { enemies: 0, bullets: 0, particles: 0, gems: 0, dmgs: 0 };

    // medicion de tamano DOM y heap cada N frames (caro)
    this._slowT = 0;
    this._domNodes = 0;
    this._heapMb = 0;

    this.el = document.createElement('div');
    this.el.id = 'debugOverlay';
    this.el.style.cssText = `
      position: fixed; top: 8px; right: 8px; z-index: 9999;
      background: rgba(0,0,0,.82); color: #5fffaf;
      font-family: ui-monospace, monospace; font-size: 11px;
      padding: 8px 12px; border-radius: 6px;
      border: 1px solid #5fffaf; pointer-events: none;
      white-space: pre; line-height: 1.45;
      display: none; max-width: 320px;
    `;
    document.body.appendChild(this.el);

    window.addEventListener('keydown', e => {
      if (e.key === 'F3') {
        e.preventDefault();
        this.toggle();
      }
    });

    // auto-open con ?debug=1
    if (new URLSearchParams(location.search).has('debug')) this.toggle();
  }

  toggle() {
    this.visible = !this.visible;
    this.el.style.display = this.visible ? 'block' : 'none';
  }

  // Llamado al inicio de cada frame en Game.update
  beginFrame() { this.lastFrameStart = performance.now(); }

  // Llamado al final de cada frame (despues de render)
  endFrame() {
    this.frameMs = performance.now() - this.lastFrameStart;
    this.frameHist[this.histIdx] = this.frameMs;
    this.histIdx = (this.histIdx + 1) % HIST_SIZE;
  }

  update(dt, game) {
    // FPS rolling
    this.frames++;
    this.fpsT += dt;
    if (this.fpsT >= 0.5) {
      this.fps = Math.round(this.frames / this.fpsT);
      this.frames = 0;
      this.fpsT = 0;
    }

    if (!this.visible) return;

    // HWM
    this.hwm.enemies   = Math.max(this.hwm.enemies,   game.enemies.length);
    this.hwm.bullets   = Math.max(this.hwm.bullets,   game.bullets.length);
    this.hwm.particles = Math.max(this.hwm.particles, game.particles.length);
    this.hwm.gems      = Math.max(this.hwm.gems,      game.gems.length);
    this.hwm.dmgs      = Math.max(this.hwm.dmgs,      game.damageNumbers.length);

    // mediciones caras (cada 0.5s)
    this._slowT -= dt;
    if (this._slowT <= 0) {
      this._slowT = 0.5;
      this._domNodes = document.getElementsByTagName('*').length;
      if (performance.memory) {
        this._heapMb = performance.memory.usedJSHeapSize / 1048576;
      }
    }

    // Resumen del Profiler
    const prof = game.profiler;
    let profLines = '';
    if (prof) {
      const top = prof.report().slice(0, 6);
      profLines = '\n' + top
        .map(r => `  ${r.name.padEnd(10)} ${r.ms.toFixed(2).padStart(5)}ms`)
        .join('\n');
    }

    // mini histograma del frame time (ASCII)
    const max = Math.max(16.6, ...this.frameHist);
    const bars = '▁▂▃▄▅▆▇█';
    let hist = '';
    for (let i = 0; i < HIST_SIZE; i++) {
      const idx = (this.histIdx + i) % HIST_SIZE;
      const norm = Math.min(1, this.frameHist[idx] / max);
      hist += bars[Math.floor(norm * (bars.length - 1))];
    }

    const p = game.player;
    const txt = [
      `FPS ${this.fps.toString().padStart(3)}   frame ${this.frameMs.toFixed(1)}ms`,
      hist,
      ``,
      `time ${game.time.toFixed(1)}s   kills ${p.kills}   lv ${p.level}`,
      `pos ${p.x.toFixed(0)}, ${p.y.toFixed(0)}   hp ${p.hp.toFixed(0)}/${p.hpMax}`,
      ``,
      `count        now    hwm`,
      `enemies   ${game.enemies.length.toString().padStart(4)}   ${this.hwm.enemies.toString().padStart(4)}`,
      `bullets   ${game.bullets.length.toString().padStart(4)}   ${this.hwm.bullets.toString().padStart(4)}`,
      `particles ${game.particles.length.toString().padStart(4)}   ${this.hwm.particles.toString().padStart(4)}`,
      `gems      ${game.gems.length.toString().padStart(4)}   ${this.hwm.gems.toString().padStart(4)}`,
      `dmg#s     ${game.damageNumbers.length.toString().padStart(4)}   ${this.hwm.dmgs.toString().padStart(4)}`,
      ``,
      `class ${p.classId}   weapons ${p.weapons.length}`,
      `DOM nodes ${this._domNodes}   heap ${this._heapMb.toFixed(1)} MB`,
      `=== top systems (ms) ===${profLines}`,
      ``,
      `[F1] cheats  [F3] toggle  ?debug=1`,
    ].join('\n');
    this.el.textContent = txt;
  }

  // resetear HWM cuando se inicia una run nueva (para detectar leaks)
  resetHwm() {
    this.hwm = { enemies: 0, bullets: 0, particles: 0, gems: 0, dmgs: 0 };
  }
}
