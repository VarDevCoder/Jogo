export class Input {
  constructor(joystick) {
    this.joystick = joystick;
    this.keys = {};
    this.ultiPressed = false;

    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;
      if (k === 'r' && !e.repeat) this.ultiPressed = true;
    });
    window.addEventListener('keyup', e => {
      this.keys[e.key.toLowerCase()] = false;
    });
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

  // Consume the ulti-press flag (returns true once per press, then resets).
  consumeUlti() {
    if (this.ultiPressed) { this.ultiPressed = false; return true; }
    return false;
  }

  // Triggered by UI (UltiButton)
  triggerUlti() { this.ultiPressed = true; }
}
