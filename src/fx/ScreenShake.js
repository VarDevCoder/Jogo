export class ScreenShake {
  constructor() {
    this.trauma = 0;
    this.maxOffset = 7;
    this.decay = 5;
    this.cap = 0.4;
  }

  add(amount) {
    this.trauma = Math.min(this.cap, this.trauma + amount);
  }

  update(dt) {
    this.trauma = Math.max(0, this.trauma - this.decay * dt);
  }

  getOffset() {
    const t = this.trauma * this.trauma;
    return {
      x: (Math.random() * 2 - 1) * t * this.maxOffset,
      y: (Math.random() * 2 - 1) * t * this.maxOffset,
    };
  }
}
