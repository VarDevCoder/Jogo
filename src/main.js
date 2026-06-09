import { Game } from './core/Game.js';
import { Renderer } from './infra/Renderer.js';
import { Input } from './infra/Input.js';
import { Joystick } from './ui/Joystick.js';
import { HUD } from './ui/HUD.js';
import { UpgradeMenu } from './ui/UpgradeMenu.js';
import { StartScreen } from './ui/StartScreen.js';

function bootstrap() {
  const canvas = document.getElementById('game');
  const overlay = document.getElementById('overlay');

  const renderer = new Renderer(canvas);
  const joystick = new Joystick(
    document.getElementById('joystick'),
    document.getElementById('stick'),
  );
  const input = new Input(joystick);
  const hud = new HUD();
  const upgradeMenu = new UpgradeMenu(overlay);
  const startScreen = new StartScreen(overlay);

  startScreen.showIntro((classId) => {
    const game = new Game({
      renderer,
      input,
      hud,
      upgradeMenu,
      classId,
      onGameOver: (stats) => startScreen.showGameOver(stats),
    });
    game.start();
  });
}

bootstrap();
