export class DebugOverlay {
  constructor() {
    this.visible = false;
    this.frames = 0;
    this.fps = 0;
    this.fpsT = 0;
    this.frameMs = 0;
    this.lastFrameStart = performance.now();
    this.el = document.createElement('div');
    this.el.id = 'debugOverlay';
    this.el.style.cssText = `
      position: fixed; top: 8px; right: 8px; z-index: 9999;
      background: rgba(0,0,0,.75); color: #5fffaf;
      font-family: ui-monospace, monospace; font-size: 11px;
      padding: 8px 12px; border-radius: 6px;
      border: 1px solid #5fffaf; pointer-events: none;
      white-space: pre; line-height: 1.5;
      display: none;
    `;
    document.body.appendChild(this.el);

    window.addEventListener('keydown', e => {
      if (e.key === 'F3') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.visible = !this.visible;
    this.el.style.display = this.visible ? 'block' : 'none';
  }

  beginFrame() { this.lastFrameStart = performance.now(); }
  endFrame() { this.frameMs = performance.now() - this.lastFrameStart; }

  update(dt, game) {
    if (!this.visible) return;
    this.frames++;
    this.fpsT += dt;
    if (this.fpsT >= 0.5) {
      this.fps = Math.round(this.frames / this.fpsT);
      this.frames = 0;
      this.fpsT = 0;
    }

    const p = game.player;
    const txt = [
      `FPS ${this.fps.toString().padStart(3)}   frame ${this.frameMs.toFixed(1)}ms`,
      `time ${game.time.toFixed(1)}s   kills ${p.kills}   lv ${p.level}`,
      `pos ${p.x.toFixed(0)}, ${p.y.toFixed(0)}   facing ${p.facing}`,
      `hp ${p.hp.toFixed(1)}/${p.hpMax}   xp ${p.xp}/${p.xpNext}`,
      `enemies  ${game.enemies.length.toString().padStart(4)}`,
      `bullets  ${game.bullets.length.toString().padStart(4)}`,
      `particles ${game.particles.length.toString().padStart(4)}`,
      `gems     ${game.gems.length.toString().padStart(4)}`,
      `dmg#s    ${game.damageNumbers.length.toString().padStart(4)}`,
      `class ${p.classId}   weapons ${p.weapons.length}`,
      ``,
      `[F1] cheats   [F3] toggle`,
    ].join('\n');
    this.el.textContent = txt;
  }
}
