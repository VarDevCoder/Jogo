# Sistema QA — Survivors Mini

Tres herramientas independientes para testear el juego.

## 1. Debug Overlay — `F3` en el juego

Muestra arriba a la derecha:
- FPS y ms por frame
- Posición del jugador, facing, HP, XP
- Contadores en vivo: enemigos, balas, partículas, gemas, damage numbers
- Clase activa y nº de armas

Útil para detectar leaks (partículas que no se limpian, contadores que crecen sin parar) y problemas de rendimiento.

## 2. Cheat Menu — `F1` en el juego (Esc para cerrar)

Pausa el juego y muestra accesos rápidos con tecla:

| Tecla | Cheat |
|---|---|
| `g` | Toggle godmode |
| `h` | Full heal |
| `x` | +50 XP |
| `X` | +500 XP |
| `l` | Subir 5 niveles de golpe |
| `b` | Invocar boss ya |
| `s` | Spawn 50 enemigos |
| `k` | Matar todo lo visible |
| `m` | Toggle slow-mo (0.3x) |
| `t` | Toggle turbo (2.5x) |
| `c` | Limpiar pantalla |
| `d` | Suicidio (probar Game Over) |

Pensado para testear escenarios sin jugar 5 minutos hasta llegar a la situación.

## 3. Unit tests — `tests.html` en el browser

Tests unitarios de la lógica pura. Cero dependencias.

```
# levantá el server estático
python -m http.server 8000

# abrí en el navegador
http://127.0.0.1:8000/tests.html
```

Cubre:
- **Rarity**: pesos, distribución probabilística, determinismo con seed
- **Player**: stats por clase, takeDamage, regen, addXp, level-up, move/facing
- **Easing / lerp / damp**: invariantes en t=0 y t=1
- **ScreenShake**: cap, decay, offset bounded
- **HitStop**: freeze/consume
- **DamageNumber**: lifetime, crit flag
- **UpgradeSystem**: pool por clase, únicas no repiten, aplicación de cartas

Mini librería `tests/runner.js` con `describe`, `it`, `expect(...).toBe()`, `.toEqual()`, `.toBeCloseTo()`, `.toBeGreaterThan()`, `.toBeTruthy()`, `.toThrow()`, y `seededRng(seed)` para tests determinísticos.

## 4. End-to-end (Playwright) — `npm run test:e2e`

Bot que abre el juego en un browser real y verifica flujos completos:
- La intro muestra 3 cartas de clase
- Cada clase arranca sin errores en consola
- Subir nivel abre el menú de upgrades
- Spawn boss vía cheat crea un boss
- El juego sobrevive 3 segundos sin errores

Setup (una sola vez):
```
npm init -y
npm install -D @playwright/test
npx playwright install chromium
```

Correr:
```
npx playwright test
```

Levanta el server Python automáticamente (lo configura `playwright.config.js`).

## Tip — debugging desde la consola

Mientras el juego corre, `window.__game` te da acceso completo al estado:

```js
__game.player.hp = 9999
__game.player.dmgMult = 100
__game.enemies.length      // cuántos hay
__game.spawnSystem.spawnBoss()
__game.cheats.godmode = true
```
