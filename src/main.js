import { Game } from './core/Game.js';
import { Renderer } from './infra/Renderer.js';
import { Input } from './infra/Input.js';
import { AudioSystem } from './infra/Audio.js';
import { SaveData } from './core/SaveData.js';
import { Joystick } from './ui/Joystick.js';
import { HUD } from './ui/HUD.js';
import { UpgradeMenu } from './ui/UpgradeMenu.js';
import { Menus } from './ui/Menus.js';
import { DebugOverlay } from './debug/DebugOverlay.js';
import { CheatMenu } from './debug/CheatMenu.js';

function bootstrap() {
  const canvas = document.getElementById('game');
  const overlay = document.getElementById('overlay');

  const save = new SaveData();
  const audio = new AudioSystem(save);
  const renderer = new Renderer(canvas);
  const joystick = new Joystick(
    document.getElementById('joystick'),
    document.getElementById('stick'),
  );
  const input = new Input(joystick);
  const hud = new HUD();
  const upgradeMenu = new UpgradeMenu(overlay);
  const menus = new Menus(overlay, { save, audio });

  let game = null;

  function startRun(classId) {
    const debug = new DebugOverlay();
    game = new Game({
      renderer, input, hud, upgradeMenu, menus, audio, save, classId, debug,
      onGameOver: (stats) => {
        const records = save.recordRun(stats);
        menus.showGameOver(stats, records, {
          onRetry: () => { menus.hide(); startRun(classId); },
          onMenu: showTitle,
        });
      },
    });
    game.cheats = new CheatMenu(game);
    window.__game = game;
    game.start();
  }

  function showTitle() {
    game = null;
    menus.showTitle({
      onPlay: () => menus.showClassSelect(startRun, showTitle),
      onShop: () => menus.showShop(showTitle),
      onOptions: () => menus.showOptions(showTitle),
    });
  }

  // pausa con ESC o botón táctil
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && game && !game.over) game.togglePause();
  });
  // auto-pausa al cambiar de pestaña
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && !game.over && !game.paused) game.togglePause();
  });
  const pauseBtn = document.getElementById('pauseBtn');
  pauseBtn.onclick = () => {
    if (game && !game.over) game.togglePause();
  };

  audio.unlock();
  showTitle();
}

bootstrap();
