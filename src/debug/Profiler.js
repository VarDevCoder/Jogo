// Profiler simple para medir secciones de codigo cada frame.
// Cada region acumula tiempo total y conteo en una ventana corta (60 frames),
// y reporta el promedio. Asi vemos cual sistema es el cuello de botella sin
// ruido frame-a-frame.
//
// Uso:
//   profiler.begin('physics');
//   physicsSystem.update(dt);
//   profiler.end('physics');
//   ...
//   profiler.frameDone();  // al final de cada frame
//   profiler.report();     // { physics: 3.2, combat: 1.1, ... } ms promedio

const WINDOW = 60;

export class Profiler {
  constructor() {
    this.regions = new Map(); // name -> { start, sumMs, count, lastFrameMs }
    this.startedRegions = [];
    this.enabled = true;
  }

  begin(name) {
    if (!this.enabled) return;
    if (!this.regions.has(name)) {
      this.regions.set(name, { start: 0, sumMs: 0, count: 0, lastFrameMs: 0 });
    }
    const r = this.regions.get(name);
    r.start = performance.now();
    this.startedRegions.push(name);
  }

  end(name) {
    if (!this.enabled) return;
    const r = this.regions.get(name);
    if (!r) return;
    const dt = performance.now() - r.start;
    r.lastFrameMs += dt;
  }

  frameDone() {
    if (!this.enabled) return;
    for (const r of this.regions.values()) {
      r.sumMs += r.lastFrameMs;
      r.count += 1;
      r.lastFrameMs = 0;
      // ventana rodante: cuando llega al limite, reduce a la mitad
      if (r.count >= WINDOW) {
        r.sumMs *= 0.5;
        r.count *= 0.5;
      }
    }
    this.startedRegions.length = 0;
  }

  // Devuelve { name: msAvg } ordenado por costo descendente
  report() {
    const out = [];
    for (const [name, r] of this.regions) {
      out.push({ name, ms: r.count > 0 ? r.sumMs / r.count : 0 });
    }
    out.sort((a, b) => b.ms - a.ms);
    return out;
  }

  reset() {
    this.regions.clear();
    this.startedRegions.length = 0;
  }
}
