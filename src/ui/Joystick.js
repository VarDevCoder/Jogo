export class Joystick {
  constructor(rootEl, stickEl, radius = 50) {
    this.root = rootEl;
    this.stick = stickEl;
    this.radius = radius;
    this.active = false;
    this.dx = 0;
    this.dy = 0;
    this.center = { x: 0, y: 0 };

    const start = e => this._start(e);
    const move = e => this._move(e);
    const end = e => this._end(e);

    this.root.addEventListener('touchstart', start, { passive: false });
    this.root.addEventListener('touchmove', move, { passive: false });
    this.root.addEventListener('touchend', end, { passive: false });
    this.root.addEventListener('touchcancel', end, { passive: false });
    this.root.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  }

  _start(e) {
    e.preventDefault();
    const r = this.root.getBoundingClientRect();
    this.center.x = r.left + r.width / 2;
    this.center.y = r.top + r.height / 2;
    this.active = true;
    this._move(e);
  }

  _move(e) {
    if (!this.active) return;
    e.preventDefault();
    const t = e.touches ? e.touches[0] : e;
    let dx = t.clientX - this.center.x;
    let dy = t.clientY - this.center.y;
    const d = Math.hypot(dx, dy);
    if (d > this.radius) { dx = dx / d * this.radius; dy = dy / d * this.radius; }
    this.stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    this.dx = dx / this.radius;
    this.dy = dy / this.radius;
  }

  _end(e) {
    if (e) e.preventDefault();
    this.active = false;
    this.dx = this.dy = 0;
    this.stick.style.transform = 'translate(-50%, -50%)';
  }
}
