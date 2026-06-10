import { Config, Palette } from './Config.js';
import { GameLoop } from './GameLoop.js';
import { Player } from '../entities/Player.js';
import { applyMeta } from './MetaUpgrades.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { ScreenShake } from '../fx/ScreenShake.js';
import { HitStop } from '../fx/HitStop.js';
import { AmbientDust } from '../fx/AmbientDust.js';
import { Background } from '../fx/Background.js';
import { Particle } from '../entities/Particle.js';

export class Game {
  constructor({ renderer, input, hud, upgradeMenu, menus, statsMenu, audio, save, onGameOver, classId, debug }) {
    this.renderer = renderer;
    this.input = input;
    this.hud = hud;
    this.upgradeMenu = upgradeMenu;
    this.menus = menus;
    this.statsMenu = statsMenu || null;
    this.audio = audio;
    this.save = save;
    this.onGameOver = onGameOver;
    this.debug = debug || null;
    this.cheats = null;

    this.background = new Background();
    this.renderer.background = this.background;

    this.player = new Player(0, 0, classId);
    this.player.gold = 0;
    if (save) applyMeta(this.player, save.data.meta);

    this.enemies = [];
    this.bullets = [];
    this.gems = [];
    this.chests = [];
    this.pickups = [];
    this.particles = [];
    this.damageNumbers = [];
    this.time = 0;
    this.cam = { x: 0, y: 0 };
    this.over = false;
    this.paused = false;
    this.flash = 0;
    this.magnetT = 0;
    this._pendingLevels = 0;
    this._levelMenuOpen = false;

    this.shake = new ScreenShake();
    this.hitStop = new HitStop();
    this.dust = new AmbientDust(100);

    this.spawnSystem = new SpawnSystem(this);
    this.combatSystem = new CombatSystem(this);
    this.physicsSystem = new PhysicsSystem(this);
    this.upgradeSystem = new UpgradeSystem(this);

    this.loop = new GameLoop(dt => this.update(dt), () => this.render());
  }

  start() { this.loop.start(); }
  pause() { this.loop.pause(); }
  resume() { this.loop.resume(); }

  togglePause() {
    if (this.over) return;
    if (this.paused) {
      this.paused = false;
      this.menus.hide();
      this.loop.resume();
    } else if (this.loop.running) {
      this.paused = true;
      this.loop.pause();
      this.menus.showPause({
        onResume: () => this.togglePause(),
        onQuit: () => {
          this.paused = false;
          this._endRun();
        },
      }, this.player);
    }
  }

  update(dtRaw) {
    const dt = dtRaw * (this.cheats?.timeScale ?? 1);
    this.debug?.update(dtRaw, this);
    this.dust.update(dt);
    this.renderer.tick(dt);
    this.shake.update(dt);
    this.flash = Math.max(0, this.flash - dt * 3);
    this.magnetT = Math.max(0, this.magnetT - dt);

    if (this.hitStop.consume(dt)) {
      this._updateDamageNumbers(dt);
      this.hud.update(this.player, this.time);
      return;
    }

    this.time += dt;

    const dir = this.input.getDirection();
    this.player.move(dir.x, dir.y, dt);
    this.player.regenerate(dt);
    this.player.tickUlti(dt);

    if (this.input.consumeUlti && this.input.consumeUlti()) {
      this.player.castUlti(this);
    }

    const wasHp = this.player.hp;
    const { width, height } = this.renderer.getSize();
    this.cam.x = this.player.x - width / 2;
    this.cam.y = this.player.y - height / 2;

    this.spawnSystem.update(dt);
    this.physicsSystem.update(dt);
    this.combatSystem.update(dt);
    this._tickLoot(dt);

    if (this.player.hp < wasHp) {
      this.shake.add(Config.fx.shakeOnPlayerHit);
      this.flash = 0.35;
      if (this.audio) this.audio.hurt();
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.92; p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this._updateDamageNumbers(dt);
    this.hud.update(this.player, this.time);

    // latido de corazón con vida crítica
    if (this.player.hp > 0 && this.player.hp / this.player.hpMax < 0.3) {
      if (this.audio) this.audio.heartbeat();
    }

    if (this.player.hp <= 0 && !this.over) {
      this._endRun();
    }
  }

  _endRun() {
    this.over = true;
    this.loop.pause();
    if (this.audio) this.audio.gameover();
    this.onGameOver({
      time: this.time,
      level: this.player.level,
      kills: this.player.kills,
      gold: this.player.gold,
      classId: this.player.classId,
    });
  }

  _tickLoot(dt) {
    const p = this.player;

    for (let i = this.chests.length - 1; i >= 0; i--) {
      const c = this.chests[i];
      c.t += dt;
      if (Math.hypot(p.x - c.x, p.y - c.y) < p.r + c.r + 8) {
        this.chests.splice(i, 1);
        this._openChest();
      }
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const it = this.pickups[i];
      it.t += dt;
      if (Math.hypot(p.x - it.x, p.y - it.y) < p.r + it.r + 6) {
        this.pickups.splice(i, 1);
        if (it.type === 'magnet') {
          this.magnetT = 3;
          if (this.audio) this.audio.magnet();
        }
      }
    }
  }

  // Cofre del jefe: revelación tipo tragamonedas con carta + oro.
  _openChest() {
    this.loop.pause();
    if (this.audio) this.audio.chestOpen();
    const card = this.upgradeSystem.rollChest();
    const gold = Math.round((25 + this.player.level * 3 + Math.random() * 50) * (this.player.greed || 1));
    this.menus.showChest(card, gold, () => {
      this.upgradeSystem.apply(card);
      this.player.gold += gold;
      if (this.audio) this.audio.cardPick(card.rarity.id === 'jackpot');
      this.loop.resume();
    }, this.audio);
  }

  _updateDamageNumbers(dt) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.update(dt);
      if (d.expired) this.damageNumbers.splice(i, 1);
    }
  }

  render() {
    const r = this.renderer;
    const offset = this.shake.getOffset();
    r.setShake(offset.x, offset.y);
    r.beginFrame();

    r.clear();
    r.drawGrid(this.cam, Config.world.grid);

    for (const p of this.particles) r.drawParticle(p, this.cam);
    for (const g of this.gems) r.drawGem(g, this.cam);
    for (const c of this.chests) r.drawChest(c, this.cam);
    for (const it of this.pickups) r.drawPickup(it, this.cam);
    for (const e of this.enemies) r.drawEnemy(e, this.cam);
    for (const b of this.bullets) r.drawBullet(b, this.cam);
    r.drawPlayer(this.player, this.cam);
    if (this.magnetT > 0) r.drawMagnetAura(this.player, this.cam, this.magnetT);

    r.drawLighting(this.cam, this.player);

    for (const d of this.damageNumbers) r.drawDamageNumber(d, this.cam);

    r.drawAmbientDust(this.dust);
    r.drawVignette();
    const hpRatio = this.player.hp / this.player.hpMax;
    if (hpRatio < 0.3 && hpRatio > 0) r.drawLowHp(1 - hpRatio / 0.3);
    r.drawFlash(this.flash);
  }

  // Los niveles ganados de golpe (p. ej. con el imán) se encolan para
  // que cada uno reparta sus cartas sin pisar el menú anterior.
  onLevelUp() {
    this._pendingLevels++;
    if (this._levelMenuOpen) return;
    this._showLevelMenu();
  }

  _showLevelMenu() {
    this._levelMenuOpen = true;
    this.loop.pause();
    if (this.audio) {
      this.audio.levelup();
      this.audio.cardsDeal();
    }
    for (let k = 0; k < 30; k++) {
      this.particles.push(new Particle(
        this.player.x, this.player.y,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        Palette.goldHot, 0.9,
      ));
    }
    this.flash = 0.5;

    const choices = this.upgradeSystem.roll(3);
    this.upgradeMenu.show(this.player.level, choices, (card) => {
      this.upgradeSystem.apply(card);
      if (this.audio) this.audio.cardPick(card.rarity.id === 'jackpot');
      this._pendingLevels--;
      if (this._pendingLevels > 0) {
        this._showLevelMenu();
      } else {
        // todas las cartas elegidas: si quedan puntos de stat, abrir menú
        this._afterAllLevelMenus();
      }
    });
  }

  // Tras procesar todos los niveles pendientes y sus cartas, si el jugador
  // tiene puntos de stat sin gastar, mostrar el menú de stats antes de
  // reanudar la partida. Si no hay menú de stats o no hay puntos, sigue normal.
  _afterAllLevelMenus() {
    if (this.statsMenu && this.player.statPointsAvailable > 0) {
      this.statsMenu.show(this.player, () => {
        this._levelMenuOpen = false;
        this.loop.resume();
      });
    } else {
      this._levelMenuOpen = false;
      this.loop.resume();
    }
  }
}
