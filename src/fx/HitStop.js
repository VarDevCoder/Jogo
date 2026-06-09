export class HitStop {
  constructor() { this.remaining = 0; }
  freeze(seconds) { this.remaining = Math.max(this.remaining, seconds); }
  consume(dt) {
    if (this.remaining > 0) {
      this.remaining -= dt;
      return true;
    }
    return false;
  }
}
