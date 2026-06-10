import { Classes, CLASS_ORDER } from '../core/Classes.js';
import { MetaUpgrades, metaCost } from '../core/MetaUpgrades.js';
import { Rarities } from '../core/Rarity.js';
import { Sprites } from '../art/Sprites.js';

function fmtTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export class Menus {
  constructor(overlayEl, { save, audio }) {
    this.overlay = overlayEl;
    this.save = save;
    this.audio = audio;
    this._anim = null;
    this._chestTimer = null;
  }

  hide() {
    this._stopAnims();
    this.overlay.classList.add('hidden');
  }

  _show(html) {
    this._stopAnims();
    this.overlay.innerHTML = html;
    this.overlay.classList.remove('hidden');
  }

  _stopAnims() {
    if (this._anim) { cancelAnimationFrame(this._anim); this._anim = null; }
    if (this._chestTimer) { clearInterval(this._chestTimer); this._chestTimer = null; }
  }

  _btn(id, fn) {
    const el = this.overlay.querySelector(id);
    if (el) el.onclick = () => { this.audio.ui(); fn(); };
    return el;
  }

  // ---------- Título ----------
  showTitle({ onPlay, onShop, onOptions }) {
    const b = this.save.data.best;
    const records = b.time > 0
      ? `<div class="records">
           <span>⏱ Récord <b>${fmtTime(b.time)}</b></span>
           <span>⭐ Nivel <b>${b.level}</b></span>
           <span>💀 Kills <b>${b.kills}</b></span>
         </div>`
      : '';
    this._show(`
      <div class="titleWrap">
        <div class="gameLogo">
          <span class="logoTop">ARCANA</span>
          <span class="logoBottom">HORDAS DE MEDIANOCHE</span>
        </div>
        <p class="tagline">Sobrevive a la horda. Roba cartas. Conviértete en leyenda.</p>
        <canvas id="titleParade" width="640" height="110"></canvas>
        ${records}
        <div class="menuButtons">
          <button class="big" id="playBtn">⚔️ Jugar</button>
          <button class="menuBtn" id="shopBtn">🏛️ Santuario <span class="goldTag">🪙 ${this.save.data.gold}</span></button>
          <button class="menuBtn" id="optBtn">⚙️ Opciones</button>
        </div>
      </div>
    `);
    this._btn('#playBtn', onPlay);
    this._btn('#shopBtn', onShop);
    this._btn('#optBtn', onOptions);

    // desfile de bichos cruzando bajo el logo
    const cv = this.overlay.querySelector('#titleParade');
    if (cv) {
      const ctx = cv.getContext('2d');
      const parade = [
        { sprite: 'slime', r: 18, speed: 55, off: 0 },
        { sprite: 'goblin', r: 17, speed: 75, off: 160 },
        { sprite: 'orc', r: 22, speed: 48, off: 320 },
        { sprite: 'minotaur', r: 26, speed: 42, off: 480 },
        { sprite: 'slime', r: 13, speed: 90, off: 600 },
      ];
      const start = performance.now();
      const tick = () => {
        const t = (performance.now() - start) / 1000;
        ctx.clearRect(0, 0, cv.width, cv.height);
        for (const p of parade) {
          const x = ((p.off + t * p.speed) % (cv.width + 120)) - 60;
          const fn = Sprites[p.sprite];
          if (fn) fn(ctx, x, 62, p.r, { time: t + p.off, facing: 1 });
        }
        this._anim = requestAnimationFrame(tick);
      };
      tick();
    }
  }

  // ---------- Selección de clase con sprites animados ----------
  showClassSelect(onStart, onBack) {
    const cards = CLASS_ORDER.map(id => {
      const c = Classes[id];
      const s = c.stats;
      const locked = c.unlock && !this.save.data.unlocks[id];
      return `
        <button class="classCard ${locked ? 'locked' : ''}" data-id="${id}" style="border-color:${locked ? '#555' : c.color}">
          <canvas class="classPreview" data-sprite="${c.sprite}" width="120" height="120"></canvas>
          <div class="classHead" style="color:${locked ? '#888' : c.color}">${locked ? '🔒 ' : ''}${c.name}</div>
          <div class="classDesc">${c.desc}</div>
          <div class="classStats">
            <span>HP <b>${s.hp}</b></span>
            <span>SPD <b>${s.speed}</b></span>
            <span>DMG <b>x${s.dmgMult.toFixed(2)}</b></span>
          </div>
          ${locked ? `<div class="unlockTag">Desbloquear: 🪙 ${c.unlock.cost}</div>` : ''}
        </button>
      `;
    }).join('');

    this._show(`
      <h2>Elige tu héroe</h2>
      <p><b style="color:#fff">PC:</b> WASD/flechas, ESC pausa. <b style="color:#fff">Móvil:</b> joystick.
      <br>🪙 <b style="color:#ffd86b">${this.save.data.gold}</b> de oro</p>
      <div class="classes">${cards}</div>
      <button class="menuBtn backBtn" id="backBtn">← Volver</button>
    `);

    this.overlay.querySelectorAll('.classCard').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const c = Classes[id];
        const locked = c.unlock && !this.save.data.unlocks[id];
        if (locked) {
          if (this.save.spendGold(c.unlock.cost)) {
            this.save.data.unlocks[id] = true;
            this.save.save();
            this.audio.buy();
            this.showClassSelect(onStart, onBack);
          } else {
            this.audio.deny();
            btn.classList.add('shake');
            setTimeout(() => btn.classList.remove('shake'), 300);
          }
          return;
        }
        this.audio.ui();
        this.hide();
        onStart(id);
      };
    });
    this._btn('#backBtn', onBack);

    // sprites animados en vivo dentro de las tarjetas
    const canvases = [...this.overlay.querySelectorAll('.classPreview')];
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      for (const cv of canvases) {
        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, cv.width, cv.height);
        const fn = Sprites[cv.dataset.sprite];
        if (fn) fn(ctx, 60, 68, 30, { time: t, moving: true, facing: 1 });
      }
      this._anim = requestAnimationFrame(tick);
    };
    tick();
  }

  // ---------- Santuario (mejoras permanentes) ----------
  showShop(onBack) {
    const rows = MetaUpgrades.map(u => {
      const lvl = this.save.metaLevel(u.id);
      const maxed = lvl >= u.max;
      const cost = metaCost(lvl);
      const pips = Array.from({ length: u.max }, (_, i) =>
        `<span class="pip ${i < lvl ? 'on' : ''}"></span>`).join('');
      return `
        <div class="shopRow">
          <div class="shopIcon">${u.icon}</div>
          <div class="shopInfo">
            <div class="shopName">${u.name} <span class="pips">${pips}</span></div>
            <div class="shopDesc">${u.desc(Math.max(1, lvl + (maxed ? 0 : 1)))}</div>
          </div>
          <button class="buyBtn ${maxed ? 'maxed' : ''}" data-id="${u.id}" ${maxed ? 'disabled' : ''}>
            ${maxed ? 'MÁX' : `🪙 ${cost}`}
          </button>
        </div>
      `;
    }).join('');

    this._show(`
      <h2>🏛️ Santuario</h2>
      <p>Mejoras permanentes para todas tus partidas.</p>
      <div class="goldBar">🪙 <b>${this.save.data.gold}</b> de oro</div>
      <div class="shop">${rows}</div>
      <button class="menuBtn backBtn" id="backBtn">← Volver</button>
    `);

    this.overlay.querySelectorAll('.buyBtn:not(.maxed)').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const cost = metaCost(this.save.metaLevel(id));
        if (this.save.buyMeta(id, cost)) {
          this.audio.buy();
          this.showShop(onBack);
        } else {
          this.audio.deny();
          btn.classList.add('shake');
          setTimeout(() => btn.classList.remove('shake'), 300);
        }
      };
    });
    this._btn('#backBtn', onBack);
  }

  // ---------- Opciones ----------
  showOptions(onBack) {
    const s = this.save.data.settings;
    this._show(`
      <h2>⚙️ Opciones</h2>
      <div class="options">
        <label class="optRow">
          <span>🎵 Música</span>
          <input type="range" id="musicVol" min="0" max="1" step="0.1" value="${s.music}">
        </label>
        <label class="optRow">
          <span>🔊 Efectos</span>
          <input type="range" id="sfxVol" min="0" max="1" step="0.1" value="${s.sfx}">
        </label>
        <button class="menuBtn danger" id="wipeBtn">🗑️ Borrar progreso</button>
      </div>
      <button class="menuBtn backBtn" id="backBtn">← Volver</button>
    `);

    this.overlay.querySelector('#musicVol').oninput = (e) => this.audio.setMusic(parseFloat(e.target.value));
    this.overlay.querySelector('#sfxVol').oninput = (e) => this.audio.setSfx(parseFloat(e.target.value));
    this._btn('#wipeBtn', () => {
      if (confirm('¿Seguro? Perderás el oro, las mejoras del Santuario y los récords.')) {
        this.save.reset();
        this.showOptions(onBack);
      }
    });
    this._btn('#backBtn', onBack);
  }

  // ---------- Pausa ----------
  showPause({ onResume, onQuit }, player = null) {
    const s = this.save.data.settings;
    const stats = player ? `
      <div class="pauseStats">
        <span>⚔️ Daño <b>x${player.dmgMult.toFixed(2)}</b></span>
        <span>⚡ Vel. ataque <b>x${player.atkSpeedMult.toFixed(2)}</b></span>
        <span>👟 Velocidad <b>x${(player.speedMult || 1).toFixed(2)}</b></span>
        <span>💚 Regen <b>${player.regen.toFixed(1)}/s</b></span>
        <span>🍀 Suerte <b>${player.luck || 0}</b></span>
        <span>💰 Codicia <b>x${(player.greed || 1).toFixed(2)}</b></span>
        ${player.evolved ? '<span class="evolved">🌟 ARMA EVOLUCIONADA</span>' : ''}
      </div>` : '';
    this._show(`
      <h2>⏸️ Pausa</h2>
      ${stats}
      <div class="menuButtons">
        <button class="big" id="resumeBtn">▶️ Continuar</button>
        <label class="optRow">
          <span>🎵 Música</span>
          <input type="range" id="musicVol" min="0" max="1" step="0.1" value="${s.music}">
        </label>
        <label class="optRow">
          <span>🔊 Efectos</span>
          <input type="range" id="sfxVol" min="0" max="1" step="0.1" value="${s.sfx}">
        </label>
        <button class="menuBtn danger" id="quitBtn">🏳️ Abandonar partida</button>
      </div>
    `);
    this._btn('#resumeBtn', onResume);
    this._btn('#quitBtn', onQuit);
    this.overlay.querySelector('#musicVol').oninput = (e) => this.audio.setMusic(parseFloat(e.target.value));
    this.overlay.querySelector('#sfxVol').oninput = (e) => this.audio.setSfx(parseFloat(e.target.value));
  }

  // ---------- Cofre del jefe: revelación tragamonedas ----------
  showChest(card, gold, onClaim, audio) {
    this._show(`
      <h2>🎁 ¡Cofre del Jefe!</h2>
      <div class="chestReveal">
        <button class="card r-comun" id="chestCard" disabled>
          <span class="cardRarity">???</span>
          <span class="cardIcon">❔</span>
          <span class="cardName">...</span>
          <span class="cardDesc">girando...</span>
        </button>
        <div class="chestGold hidden" id="chestGold">+🪙 ${gold}</div>
      </div>
      <button class="big hidden" id="claimBtn">✨ Reclamar</button>
    `);

    const el = this.overlay.querySelector('#chestCard');
    const order = ['comun', 'pocoComun', 'raro', 'ultraRaro', 'jackpot'];
    let i = 0;
    let delay = 70;
    const spin = () => {
      const rid = order[i % order.length];
      el.className = `card r-${rid}`;
      el.querySelector('.cardRarity').textContent = Rarities[rid].name;
      if (audio) audio.chestTick();
      i++;
      delay *= 1.13;
      if (delay < 320) {
        this._chestTimer = setTimeout(spin, delay);
      } else {
        // aterriza en la rareza real
        el.className = `card r-${card.rarity.id}`;
        el.querySelector('.cardRarity').textContent =
          card.unique ? `✦ ${card.rarity.name} ✦` : card.rarity.name;
        el.querySelector('.cardIcon').textContent = card.icon;
        el.querySelector('.cardName').textContent = card.name;
        el.querySelector('.cardDesc').textContent = card.desc;
        if (audio) audio.cardPick(card.rarity.id === 'jackpot');
        this.overlay.querySelector('#chestGold').classList.remove('hidden');
        const claim = this.overlay.querySelector('#claimBtn');
        claim.classList.remove('hidden');
        claim.onclick = () => {
          this.audio.ui();
          this.hide();
          onClaim();
        };
      }
    };
    this._chestTimer = setTimeout(spin, delay);
  }

  // ---------- Game Over ----------
  showGameOver(stats, records, { onRetry, onMenu }) {
    const rec = (k, label) => records[k] ? `<span class="newRecord">¡NUEVO RÉCORD ${label}!</span>` : '';
    this._show(`
      <h1>Has caído</h1>
      <div class="goStats">
        <div class="goStat">⏱ <b>${fmtTime(stats.time)}</b> ${rec('time', 'DE TIEMPO')}</div>
        <div class="goStat">⭐ Nivel <b>${stats.level}</b> ${rec('level', 'DE NIVEL')}</div>
        <div class="goStat">💀 <b>${stats.kills}</b> kills ${rec('kills', 'DE KILLS')}</div>
        <div class="goStat gold">🪙 <b>+${stats.gold}</b> de oro para el Santuario</div>
      </div>
      <div class="menuButtons">
        <button class="big" id="retryBtn">🔄 Reintentar</button>
        <button class="menuBtn" id="menuBtn">🏠 Menú principal</button>
      </div>
    `);
    this._btn('#retryBtn', onRetry);
    this._btn('#menuBtn', onMenu);
  }
}
