# 🌙 Arcana: Hordas de Medianoche

Un *survivors-like* (estilo Vampire Survivors) hecho 100% con JavaScript vanilla,
Canvas 2D y WebAudio. **Sin dependencias, sin assets externos**: todo el arte es
procedural dibujado con código y todo el sonido se sintetiza en tiempo real.

## 🎮 Cómo jugar

Abre `index.html` con cualquier servidor estático:

```bash
npx serve .
# o
python3 -m http.server
```

- **PC**: WASD / flechas para moverte, ESC para pausar.
- **Móvil**: joystick táctil, botón ⏸ para pausar.
- Tus armas disparan solas: tu único trabajo es **sobrevivir y posicionarte**.

## ⚔️ Héroes

| Héroe | Arma | Estilo |
|---|---|---|
| 🧙 Mago | Orbes arcanos que buscan al enemigo más cercano | Equilibrado |
| 🏹 Arquero | 3 flechas en abanico | Rápido y frágil |
| 🛡️ Caballero | Tajo circular en área | Tanque |
| 🧪 Alquimista | Frascos explosivos en área | Desbloqueable con 🪙 250 |

## 🃏 Sistema de cartas

Al subir de nivel eliges 1 de 3 cartas. La potencia escala con la rareza:

| Rareza | Color | Probabilidad base |
|---|---|---|
| Muy Común | Gris | 45% |
| Poco Común | Verde | 30% |
| Raro | Azul | 15% |
| Ultra Raro | Lila | 8% |
| **JACKPOT** | Dorado | 2% |

- Cada héroe tiene su **propio pool de cartas temáticas**.
- Los **Jackpot son legendarias únicas** (2 por héroe, una vez por partida).
- Al reclamar ambas legendarias se desbloquea la **ASCENSIÓN**: la evolución
  definitiva de tu arma.

## 🏛️ Meta-progresión

- Los enemigos sueltan **monedas de oro** que se acumulan entre partidas.
- En el **Santuario** compras mejoras permanentes: Vitalidad, Fuerza,
  Celeridad, Presteza, **Suerte** (mejora las rarezas) y **Codicia** (más oro).
- Los **jefes** (cada 60s) siempre sueltan un **cofre del tesoro** con una
  carta gratis de rareza aumentada + oro, con revelación tipo tragamonedas.
- Cada 45s llega una **horda** que rodea al jugador.
- El **imán** (drop raro) aspira todas las gemas del mapa.

## 🏗️ Arquitectura

```
src/
├── core/      Game, GameLoop, Config, Classes, Rarity, SaveData, MetaUpgrades
├── systems/   Spawn, Combat, Physics (rejilla espacial), Upgrades
├── entities/  Player, Enemy, Bullet, Gem, Particle, DamageNumber
├── infra/     Renderer (Canvas 2D), Input, Audio (WebAudio procedural)
├── ui/        HUD, Menus, UpgradeMenu, Joystick
├── fx/        ScreenShake, HitStop, Background, AmbientDust, Easing
└── art/       Sprites procedurales (vectorial cartoon)
```

El guardado (oro, mejoras, récords, ajustes) vive en `localStorage`.
