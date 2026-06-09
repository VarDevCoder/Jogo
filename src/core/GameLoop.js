export class GameLoop {
  constructor(onUpdate, onRender) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
    this.last = 0;
    this.running = false;
    this._tick = this._tick.bind(this);
  }

  start() {
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this._tick);
  }

  _tick(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.running) this.onUpdate(dt);
    this.onRender(dt);
    requestAnimationFrame(this._tick);
  }

  pause() { this.running = false; }
  resume() { this.running = true; this.last = performance.now(); }
}
