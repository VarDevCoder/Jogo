// Motor de audio 100% procedural via WebAudio: sin archivos de sonido.
// SFX sintetizados + música chiptune oscura generada por secuenciador.
export class AudioSystem {
  constructor(save) {
    this.save = save;
    this.ctx = null;
    this.enabled = typeof window !== 'undefined' &&
      !!(window.AudioContext || window.webkitAudioContext);
    this._timer = null;
    this._step = 0;
    this._nextTime = 0;
    this._gemStreak = 0;
    this._gemLast = 0;
    this._throttle = {};
    this._noiseBuf = null;
  }

  get settings() { return this.save.data.settings; }

  _ensure() {
    if (!this.enabled) return false;
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.master);
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.master);
    this.applyVolumes();
    return true;
  }

  // Los navegadores bloquean el audio hasta el primer gesto del usuario.
  unlock() {
    if (!this.enabled) return;
    const kick = () => {
      this._ensure();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.startMusic();
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
    };
    window.addEventListener('pointerdown', kick);
    window.addEventListener('keydown', kick);
  }

  applyVolumes() {
    if (!this.ctx) return;
    this.sfxGain.gain.value = this.settings.sfx;
    this.musicGain.gain.value = this.settings.music * 0.5;
  }

  setSfx(v) {
    this.settings.sfx = v;
    this.save.save();
    this.applyVolumes();
    this.ui();
  }

  setMusic(v) {
    this.settings.music = v;
    this.save.save();
    this.applyVolumes();
    if (v > 0) this.startMusic();
    else this.stopMusic();
  }

  _ok(name, minMs) {
    const now = performance.now();
    if (this._throttle[name] && now - this._throttle[name] < minMs) return false;
    this._throttle[name] = now;
    return true;
  }

  _tone({ f0, f1, dur, type = 'square', vol = 0.15, when = 0, at = null, dest }) {
    if (!this._ensure()) return;
    const t0 = at !== null ? at : this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, f0), t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g);
    g.connect(dest || this.sfxGain);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  _noise({ dur, vol = 0.15, freq = 2000, q = 1, type = 'highpass', when = 0, at = null, dest }) {
    if (!this._ensure()) return;
    if (!this._noiseBuf) {
      const len = this.ctx.sampleRate;
      this._noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this._noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = at !== null ? at : this.ctx.currentTime + when;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuf;
    src.loop = true;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest || this.sfxGain);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.02);
  }

  // ---------- SFX del juego ----------

  shoot(type) {
    if (!this._ok('shoot', 70)) return;
    if (type === 'orb') {
      this._tone({ f0: 740, f1: 320, dur: 0.09, type: 'square', vol: 0.06 });
    } else if (type === 'arrow') {
      this._noise({ dur: 0.06, vol: 0.07, freq: 3500 });
      this._tone({ f0: 1300, f1: 700, dur: 0.05, type: 'sawtooth', vol: 0.04 });
    } else if (type === 'slash') {
      this._noise({ dur: 0.14, vol: 0.1, freq: 900, type: 'bandpass', q: 1.5 });
      this._tone({ f0: 300, f1: 150, dur: 0.12, type: 'sawtooth', vol: 0.05 });
    } else if (type === 'area') {
      this._tone({ f0: 180, f1: 520, dur: 0.25, type: 'sine', vol: 0.12 });
    }
  }

  hit(crit) {
    if (!this._ok('hit', 45)) return;
    if (crit) {
      this._tone({ f0: 1500, f1: 280, dur: 0.12, type: 'sawtooth', vol: 0.16 });
      this._noise({ dur: 0.08, vol: 0.1, freq: 4000 });
    } else {
      this._tone({ f0: 260, f1: 180, dur: 0.05, type: 'square', vol: 0.08 });
      this._noise({ dur: 0.04, vol: 0.06, freq: 2500 });
    }
  }

  kill() {
    if (!this._ok('kill', 60)) return;
    this._tone({ f0: 320, f1: 70, dur: 0.16, type: 'square', vol: 0.13 });
    this._noise({ dur: 0.12, vol: 0.09, freq: 1200, type: 'bandpass' });
  }

  bossDeath() {
    this._tone({ f0: 200, f1: 30, dur: 0.7, type: 'sawtooth', vol: 0.3 });
    this._noise({ dur: 0.6, vol: 0.25, freq: 700, type: 'lowpass' });
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this._tone({ f0: f, dur: 0.18, type: 'triangle', vol: 0.16, when: 0.25 + i * 0.09 });
    });
  }

  // Las gemas suben de tono con cada recogida consecutiva (combo dopamínico).
  gem() {
    const now = performance.now();
    if (now - this._gemLast > 800) this._gemStreak = 0;
    this._gemLast = now;
    if (!this._ok('gem', 35)) return;
    const f = 660 * Math.pow(2, Math.min(this._gemStreak, 24) / 12);
    this._gemStreak++;
    this._tone({ f0: f, f1: f * 1.5, dur: 0.09, type: 'sine', vol: 0.1 });
  }

  coin() {
    if (!this._ok('coin', 50)) return;
    this._tone({ f0: 987.77, dur: 0.06, type: 'square', vol: 0.08 });
    this._tone({ f0: 1318.5, dur: 0.18, type: 'square', vol: 0.08, when: 0.06 });
  }

  hurt() {
    if (!this._ok('hurt', 150)) return;
    this._tone({ f0: 130, f1: 50, dur: 0.22, type: 'sawtooth', vol: 0.3 });
    this._noise({ dur: 0.15, vol: 0.18, freq: 600, type: 'lowpass' });
  }

  levelup() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this._tone({ f0: f, dur: 0.12, type: 'triangle', vol: 0.18, when: i * 0.07 });
    });
  }

  cardsDeal() {
    [0, 1, 2].forEach(i => {
      this._noise({ dur: 0.05, vol: 0.1, freq: 3000, when: i * 0.12 });
    });
  }

  cardPick(jackpot) {
    if (jackpot) {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => {
        this._tone({ f0: f, dur: 0.22, type: 'square', vol: 0.14, when: i * 0.09 });
      });
      this._noise({ dur: 0.9, vol: 0.07, freq: 8000, when: 0.2 });
    } else {
      this._tone({ f0: 660, f1: 990, dur: 0.12, type: 'triangle', vol: 0.15 });
    }
  }

  bossSpawn() {
    this._tone({ f0: 73.4, f1: 65, dur: 0.5, type: 'sawtooth', vol: 0.3 });
    this._tone({ f0: 73.4, f1: 65, dur: 0.5, type: 'sawtooth', vol: 0.3, when: 0.55 });
  }

  horde() {
    [440, 554, 440, 554].forEach((f, i) => {
      this._tone({ f0: f, dur: 0.14, type: 'square', vol: 0.12, when: i * 0.15 });
    });
  }

  magnet() {
    this._tone({ f0: 220, f1: 1400, dur: 0.45, type: 'sine', vol: 0.18 });
    this._noise({ dur: 0.4, vol: 0.06, freq: 5000, when: 0.1 });
  }

  chestOpen() {
    [392, 493.88, 587.33, 783.99].forEach((f, i) => {
      this._tone({ f0: f, dur: 0.14, type: 'triangle', vol: 0.15, when: i * 0.1 });
    });
    this._noise({ dur: 0.5, vol: 0.06, freq: 7000, when: 0.3 });
  }

  chestTick() {
    this._tone({ f0: 800, dur: 0.04, type: 'sine', vol: 0.08 });
  }

  gameover() {
    [440, 392, 329.63, 261.63].forEach((f, i) => {
      this._tone({ f0: f, dur: 0.4, type: 'sawtooth', vol: 0.16, when: i * 0.3 });
    });
  }

  ui() {
    this._tone({ f0: 600, dur: 0.05, type: 'sine', vol: 0.1 });
  }

  buy() {
    this._tone({ f0: 783.99, dur: 0.08, type: 'square', vol: 0.12 });
    this._tone({ f0: 1046.5, dur: 0.15, type: 'square', vol: 0.12, when: 0.08 });
  }

  deny() {
    this._tone({ f0: 220, f1: 180, dur: 0.15, type: 'square', vol: 0.12 });
  }

  // ---------- Música: secuenciador chiptune oscuro ----------
  // 4 compases en La menor (Am - F - C - G), 112 BPM, 16avos.

  startMusic() {
    if (!this._ensure() || this._timer || this.settings.music <= 0) return;
    this._step = 0;
    this._nextTime = this.ctx.currentTime + 0.05;
    this._timer = setInterval(() => this._schedule(), 25);
  }

  stopMusic() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _schedule() {
    const spb = 60 / 112 / 4;
    while (this._nextTime < this.ctx.currentTime + 0.12) {
      this._playStep(this._step, this._nextTime);
      this._nextTime += spb;
      this._step = (this._step + 1) % 64;
    }
  }

  _playStep(step, t) {
    const CHORDS = [
      [110.0, 220.0, 261.63, 329.63],  // Am
      [87.31, 174.61, 220.0, 261.63],  // F
      [130.81, 261.63, 329.63, 392.0], // C
      [98.0, 196.0, 246.94, 293.66],   // G
    ];
    const bar = (step / 16) | 0;
    const s = step % 16;
    const ch = CHORDS[bar];
    const m = this.musicGain;

    // bombo
    if (s % 4 === 0) this._tone({ f0: 140, f1: 45, dur: 0.13, type: 'sine', vol: 0.5, at: t, dest: m });
    // caja
    if (s === 4 || s === 12) this._noise({ dur: 0.1, vol: 0.14, freq: 1800, type: 'bandpass', q: 0.8, at: t, dest: m });
    // hi-hat
    if (s % 2 === 1) this._noise({ dur: 0.03, vol: 0.05, freq: 7500, at: t, dest: m });
    // bajo sincopado
    if (s === 0 || s === 3 || s === 6 || s === 8 || s === 11 || s === 14) {
      const f = s === 8 ? ch[0] * 2 : ch[0];
      this._tone({ f0: f, dur: 0.17, type: 'triangle', vol: 0.32, at: t, dest: m });
    }
    // arpegio (suave, una octava arriba)
    if (s % 2 === 0) {
      const pat = [1, 2, 3, 2, 1, 3, 2, 3];
      const f = ch[pat[(s / 2) | 0]] * 2;
      this._tone({ f0: f, dur: 0.11, type: 'square', vol: 0.05, at: t, dest: m });
    }
  }
}
