export class Background {
  constructor() {
    this.noise = this._buildNoise(256, 256);
  }

  _buildNoise(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 30 + Math.random() * 40;
      img.data[i] = v;
      img.data[i + 1] = v * 0.7;
      img.data[i + 2] = v * 1.2;
      img.data[i + 3] = 18;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }
}
