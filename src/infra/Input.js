export class Input {
  constructor(joystick) {
    this.joystick = joystick;
    this.keys = {};
    window.addEventListener('keydown', e => this.keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
  }

  getDirection() {
    let x = 0, y = 0;
    if (this.keys['w'] || this.keys['arrowup']) y -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) y += 1;
    if (this.keys['a'] || this.keys['arrowleft']) x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) x += 1;

    if (Math.abs(this.joystick.dx) > 0.1 || Math.abs(this.joystick.dy) > 0.1) {
      x = this.joystick.dx; y = this.joystick.dy;
    }

    const d = Math.hypot(x, y);
    if (d > 0) { x /= d; y /= d; }
    return { x, y };
  }
}
