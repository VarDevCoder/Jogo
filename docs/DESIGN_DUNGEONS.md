# Arcana: Hordas de Medianoche — Diseño de Mazmorras

> Replanteo del juego de "survivor infinito" a una estructura **micro / meso / macro** estilo Hades + D&D.
> Documento de diseño — **no es spec de implementación**. Pseudocódigo y números defendibles para discutir.

---

## 1. Capas del juego

| Capa | Duración | Loop |
|---|---|---|
| **MICRO** (segundo a segundo) | 1-3 s | Mover, esquivar, recoger gemas, lanzar ulti. **Ya implementado.** |
| **MESO** (dentro de una run) | 3 min | Una mazmorra → un descanso → siguiente mazmorra. |
| **MACRO** (entre runs) | persistente | Oro, Santuario, desbloqueo de héroes, **multiclase nivel 30**. |

El cambio clave: **la run ya no es supervivencia infinita**. Es una secuencia finita de 7 mazmorras con descansos. Llegar al final es la victoria.

---

## 2. Estructura de una run

Una run completa son **7 mazmorras** + **6 descansos** = **~25 min** de juego activo.

| # | Tipo | Duración | Notas |
|---|---|---|---|
| 1 | Regular | 3:00 | Tutorial implícito. Spawn rate suave. |
| 2 | Regular | 3:00 | Sube ramp. Aparece el primer enemigo rango medio. |
| 3 | Élite | 2:30 | Mini-jefe a los 2:00, oleada final 0:30. |
| 4 | Evento (ruleta) | 3:00 | Aleatorio: tienda / oráculo / arena de horda / cofre maldito. |
| 5 | Regular | 3:00 | Densidad alta, dos mini-jefes simultáneos al final. |
| 6 | Élite | 2:30 | Dos mini-jefes desde el inicio. |
| 7 | **Jefe final** | 3:00 fijo | Boss de bioma + transición a fase 2 al 50% HP. |

Tiempo total: **20 min de combate** + **6 descansos × ~30 s** = **~25 min run completa**.

### Bioma y temática

Una run = un **bioma** (al inicio solo hay 1; con meta-progresión se desbloquean más). Cada bioma tiene su jefe final, su paleta de enemigos y su set de boons cosméticos. MVP arranca con un único bioma: **"Catacumbas de Medianoche"**.

---

## 3. Mapa visual del flow

```
                    ┌─────────────────────────────────────────┐
                    │            PANTALLA DE TÍTULO           │
                    │   [JUGAR]  [SANTUARIO]  [OPCIONES]      │
                    └────────────────┬────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────────────┐
                    │       SELECCIÓN DE CLASE (4 héroes)     │
                    │   Mago · Arquero · Caballero · Alquim.  │
                    └────────────────┬────────────────────────┘
                                     │
                                     ▼
                    ┌─────────────────────────────────────────┐
                    │  PROEMIO  (5 s — solo en run #1 nueva)  │
                    │  "Las catacumbas se abren..."  [Skip]   │
                    └────────────────┬────────────────────────┘
                                     │
        ┌────────────────────────────┴──────────────────────────┐
        ▼                                                       │
  ┌──────────────┐   ┌──────────┐   ┌──────────────┐   ┌──────────────┐
  │  MAZMORRA 1  │──▶│ DESCANSO │──▶│  MAZMORRA 2  │──▶│ DESCANSO     │──▶ ...
  │  (regular)   │   │  (~30 s) │   │  (regular)   │   │              │
  │   3:00       │   │ heal+pick│   │   3:00       │   │              │
  └──────────────┘   └──────────┘   └──────────────┘   └──────────────┘
        │
        │ (si muere en cualquier mazmorra)
        ▼
  ┌──────────────────────────────────────────┐
  │           GAME OVER                      │
  │   Stats · Oro ganado · Récord            │
  │   [REINTENTAR] [VOLVER AL TÍTULO]        │
  └──────────────────────────────────────────┘

  ... continuación normal:

  MAZMORRA 3 (élite) ─▶ DESCANSO ─▶ MAZMORRA 4 (evento) ─▶ DESCANSO
            │
            ▼
  MAZMORRA 5 (regular) ─▶ DESCANSO ─▶ MAZMORRA 6 (élite) ─▶ DESCANSO
            │
            ▼
  ┌──────────────────────────────────────────┐
  │       MAZMORRA 7 — JEFE FINAL            │
  │   Fase 1 → 50% HP → Fase 2 (rabia)       │
  └────────────────┬─────────────────────────┘
                   │
              ┌────┴────┐
              ▼         ▼
       ┌──────────┐  ┌──────────┐
       │ VICTORIA │  │ GAMEOVER │
       │ +500 oro │  │ stats... │
       │ relic    │  │          │
       └──────────┘  └──────────┘
```

---

## 4. Tipos de mazmorra

### 4.1 Regular (3 min)
- Spawn continuo escalando linealmente.
- **Densidad objetivo**: 40-80 enemigos en pantalla al final.
- Cierre: una oleada de 30 enemigos a los 2:50, gema grande al 3:00.
- **Recompensa**: 3 niveles esperados (XP suficiente), 25-40 oro.

### 4.2 Élite (2:30)
- Más corta pero más densa.
- A los 2:00 spawnea un **mini-jefe** (HP ~ 1.5× boss actual, drops cofre).
- 0:30 finales son cleanup tras matar al mini-jefe.
- **Recompensa**: cofre con carta de rareza forzada (mínimo "Poco Común"), 40-60 oro.

### 4.3 Evento (3 min, aleatorio)
Al entrar, ruleta tira **uno** de 4:

| Sub-tipo | Descripción | Recompensa |
|---|---|---|
| **Tienda errante** | Sin combate. NPC vende 3 boons por oro (50/100/200). | El boon comprado. |
| **Oráculo** | Sin combate. Mini-puzzle: 3 cartas boca abajo, elegir 1. | Carta gratis rareza Rara garantizada. |
| **Arena de Horda** | Combate puro: 4 oleadas crecientes. Sin loot intermedio. | 80 oro + 1 stat point gratis. |
| **Cofre maldito** | Cofre rodeado de élites. Romper élites para abrirlo. | Carta Jackpot + maldición (-15% HP máx esta run). |

### 4.4 Jefe (3 min fija)
- Sala cerrada, sin spawns normales.
- Jefe del bioma con **2 fases**: cambia patrón al 50% HP.
- Patrones telegrafiados (proyectiles AoE evitables).
- **Recompensa**: 500 oro, 1 reliquia persistente (slot meta), victoria.

---

## 5. Sistema de descanso (~30 s)

Entre mazmorras, el jugador entra a un **claro seguro**. Música cambia, todo enemigo desaparece, aparece un menú con **4 opciones obligatorias en orden** (no se pueden saltar):

```
┌──────────────────────────────────────────────────┐
│                  ─── DESCANSO ───                │
│                                                  │
│  1. ❤️ Hoguera                                   │
│     [Curar 100% HP]   [Curar 50% + carta extra]  │
│                                                  │
│  2. 💪 Asignar puntos de stats                   │
│     Tienes 3 puntos libres (str/dex/int/vit)     │
│                                                  │
│  3. 🃏 Elegir boon                               │
│     1 de 3 cartas (pool de clase + multiclase)   │
│                                                  │
│  4. ⏭️ Continuar                                 │
└──────────────────────────────────────────────────┘
```

### 5.1 Hoguera
- Opción A: heal completo, sin más.
- Opción B: heal 50% + carta extra al final del descanso. **Risk/reward.**

### 5.2 Asignar stats
- Cada descanso da **3 puntos libres** al jugador (extra a los que da el level-up).
- Distribuibles entre str/dex/int/vit. La curva sqrt ya existente penaliza la sobreinversión.

### 5.3 Elegir boon (carta)
- El sistema actual de UpgradeMenu pero **fuera de combate**, sin presión.
- 3 cartas: 1 de la clase principal, 1 de la secundaria (si hay multiclase), 1 random universal.

### 5.4 Continuar
- Cierra el descanso, inicia siguiente mazmorra (fade out → fade in).

**Excepción**: tras la mazmorra 6 (antes del jefe), el descanso es especial:
- Heal completo automático.
- 5 puntos de stats en lugar de 3.
- 1 carta garantizada de rareza Rara o mejor.
- "Última oportunidad de preparación" — texto en pantalla.

---

## 6. Sistema de multiclase (nivel 30)

### 6.1 Trigger
Cuando el jugador llega a **nivel 30 dentro de una run**, en el siguiente descanso aparece una pantalla especial:

```
┌────────────────────────────────────────────────────────┐
│            ⚜  DESPERTAR DUAL  ⚜                        │
│                                                        │
│  Has dominado tu arte. Es hora de tocar otra senda.    │
│                                                        │
│  Elige tu segunda clase:                               │
│                                                        │
│   [🏹 Arquero]   [🛡 Caballero]   [🧪 Alquimista]      │
│                                                        │
│  (tu clase principal sigue siendo: 🧙 Mago)            │
└────────────────────────────────────────────────────────┘
```

### 6.2 Qué hereda
Al elegir segunda clase X, el jugador gana:
1. **Arma secundaria** de X, con cooldown 1.5× el original (más lenta, no rompe el balance).
2. **Pool de cartas** de X disponible en futuros upgrades y descansos.
3. **Crecimiento secundario**: las stats por nivel ahora se suman parcialmente:
   - Stat principal de clase A: 1.5/nivel (igual).
   - Stat principal de clase B: **0.5/nivel** (un tercio).
   - Vit y demás: promedio entre las dos clases.
4. **Sinergias específicas**: ciertas cartas evolucionan si el jugador tiene combos (ej. Mago + Caballero → "Arcanos Templarios" desbloquea evolución "Espada Astral").

### 6.3 Restricciones
- No se puede elegir multiclase si no se llegó al nivel 30 (pensado para runs largas).
- La elección es **permanente para esa run**.
- Empieza con multiclase **deshabilitada**: se desbloquea en macro con 1500 oro en el Santuario.

---

## 7. Curva de progresión

### Niveles por mazmorra
| Mazmorra | Nivel esperado al entrar | Nivel esperado al salir |
|---|---|---|
| 1 | 1 | 5 |
| 2 | 5 | 10 |
| 3 (élite) | 10 | 14 |
| 4 (evento) | 14 | 18 |
| 5 | 18 | 23 |
| 6 (élite) | 23 | 27 |
| 7 (jefe) | 27 | 30-32 |

**Multiclase se desbloquea en mazmorra 7** en una run normal — pensado para que sea una decisión de "última hora" con peso. Con buen oro persistente y suerte, se puede llegar antes.

### Escalado de dificultad
- HP enemigos: `base × (1 + dungeonIndex × 0.35)`
- Daño enemigos: `base × (1 + dungeonIndex × 0.20)`
- Spawn rate: dentro de cada mazmorra rampa de 0.8 → 0.15 lineal. Reset entre mazmorras.

Esto significa: la mazmorra 5 tiene **2.4× HP** y **1.8× daño** vs la 1.

---

## 8. Pseudocódigo de estructuras de datos

### 8.1 `Dungeon`
```js
{
  id: 'cat_01_regular',
  index: 1,                       // 1..7
  type: 'regular' | 'elite' | 'event' | 'boss',
  biome: 'catacombs',
  duration: 180,                  // segundos
  enemyPool: ['slime', 'goblin'], // ids de Config.enemies
  spawnCurve: { start: 0.8, end: 0.15, ramp: 'linear' },
  miniBoss: null | { atSecond: 120, defId: 'orc_warlord' },
  finalWave: { atSecond: 170, count: 30, defId: 'slime' },
  rewards: {
    gold: { min: 25, max: 40 },
    chest: 'none' | 'normal' | 'forced_rare' | 'jackpot',
  },
  music: 'catacombs_combat',
}
```

### 8.2 `Rest`
```js
{
  id: 'rest_01',
  afterDungeonIndex: 1,
  isPreBoss: false,
  offers: {
    heal: { full: true, alt: { partial: 0.5, bonusCard: true } },
    stats: { points: 3 },
    boon: { count: 3, sourcePools: ['mage', 'universal'] },
  },
  duration: null,                 // no timer, jugador decide
  music: 'catacombs_calm',
}
```

### 8.3 `RunState`
```js
{
  state: 'TITLE' | 'CLASS_SELECT' | 'IN_DUNGEON' | 'RESTING'
       | 'MULTICLASS_PICK' | 'BOSS_INTRO' | 'VICTORY' | 'GAMEOVER',
  classPrimary: 'mage',
  classSecondary: null | 'ranger', // null hasta nivel 30
  dungeonIndex: 0,                // 0..6 (7 mazmorras)
  currentDungeon: Dungeon | null,
  currentRest: Rest | null,
  playerSnapshot: {               // se actualiza entre mazmorras
    level, hp, hpMax, stats, deck: [cardIds],
  },
  goldThisRun: 0,
  freeStatPoints: 0,              // los que da el descanso, no asignados
  multiclassUnlockedInRun: false,
}
```

### 8.4 `Multiclass`
```js
{
  primary: 'mage',
  secondary: 'ranger',
  pickedAtLevel: 30,
  pickedAtDungeon: 6,
  growth: {                        // mezcla de ClassGrowth
    int: 1.5, dex: 0.5, vit: 0.55, str: 0.2,
  },
  secondaryWeapon: {
    type: 'arrow', dmgMult: 0.7,   // arma secundaria nerfeada
    cdMult: 1.5,
  },
  synergyCards: ['arcane_templar', 'wild_alchemy'], // unlocks condicionales
}
```

---

## 9. Cambios necesarios al código existente

| Archivo | Cambio | Esfuerzo |
|---|---|---|
| `src/core/Game.js` | Game pasa de "loop infinito" a "loop de mazmorra". Necesita aceptar `Dungeon` como input y emitir `onDungeonComplete` / `onPlayerDeath`. Quitar lógica de bossTimer fijo. | 1 día |
| `src/main.js` | Reemplaza `startRun(classId)` por `startRun(classId) → orquesta RunState`. Maneja transiciones título → clase → mazmorra → descanso. | 0.5 día |
| `src/systems/SpawnSystem.js` | Acepta `spawnCurve` y `enemyPool` por mazmorra en lugar de leer `Config` global. bossTimer pasa a ser `miniBossAtSecond`. | 0.5 día |
| `src/systems/UpgradeSystem.js` | Pool de cartas filtrable por clases primaria + secundaria. | 0.5 día |
| `src/ui/Menus.js` | Nuevas pantallas: `showRest`, `showMulticlassPick`, `showVictory`, `showDungeonIntro`. | 1 día |
| `src/core/Stats.js` | `growStatsOnLevel` debe mezclar growth de dos clases si hay multiclase. Añadir `freeStatPoints` asignables manualmente. | 0.5 día |
| `src/core/Classes.js` | Añadir metadata `secondaryWeaponMods` por clase (para multiclase). | 0.25 día |
| `src/core/Config.js` | Mover boss timing y horde timing fuera (ahora son por-mazmorra). | 0.25 día |
| **NUEVOS** archivos | `RunState.js`, `Dungeon.js`, `Rest.js`, `Multiclass.js` (esqueletos creados). | 2 días llenarlos |

**Estimación total: ~7 días** para tener el MVP del nuevo loop funcionando con 1 bioma y el flow completo.

### Reparto sugerido por sprints

| Sprint | Foco | Días |
|---|---|---|
| **S1 — Esqueleto del loop meso** | RunState + Dungeon mínima + transiciones | 2 d |
| **S2 — Descanso jugable** | Rest UI + heal + stat assign + boon | 1.5 d |
| **S3 — Tipos de mazmorra** | Élite, evento (ruleta), jefe final | 2 d |
| **S4 — Multiclase** | Pick UI + heredar arma + mezcla de growth | 1.5 d |

---

## 10. Decisiones pendientes para el usuario

1. **¿Una sola run lineal o ramas?** El doc asume lineal (mazmorra 1 → 2 → 3...). Hades permite elegir entre 2 puertas. Es 2× trabajo de diseño pero 4× rejugabilidad. **Pendiente decidir.**

2. **¿La muerte mantiene parte del progreso de la run?** Opciones:
   - (a) Estricto roguelike: muerte → 0, solo conservas oro ganado.
   - (b) Hades-light: muerte conserva 1 boon "talismán" elegido al morir.
   - (c) Casual: muerte permite retry desde la mazmorra actual con -50% recursos.

3. **¿Multiclase fija o variable entre runs?** Si el jugador elige "Mago+Arquero" en una run, ¿la próxima debe re-elegir o queda fija como "build" persistente?

4. **¿Cuánto control sobre la build a nivel macro?** El Santuario actual da stats genéricos. ¿Se añaden talentos pre-run que modifiquen la curva (ej. "+1 punto inicial en str") o se mantiene minimalista?

5. **¿Qué pasa con el record actual de "tiempo sobrevivido"?** Ya no hay supervivencia infinita. ¿Se reemplaza por "tiempo a victoria" / "runs completadas"?

6. **Bioma único o varios desde el inicio?** Doc asume 1 bioma MVP. Si se quieren 3 desde día 1, multiplica trabajo de arte/audio ~×3.

7. **Eventos dentro de mazmorra regular** (cofre random, mercader que pasa): ¿se mezclan con el tipo "evento" o son ortogonales? Decidir si el tipo de mazmorra basta o necesitamos micro-eventos.

---

## 11. Resumen ejecutivo

- **De survivor infinito a "run estructurada"**: 7 mazmorras de ~3 min, separadas por descansos de ~30 s.
- **Descansos son donde vive la decisión**: heal, stats, boons, fuera de presión.
- **Multiclase nivel 30**: mezcla pools y arma, decisión de medio-tardío juego.
- **MVP factible en ~7 días** con un solo bioma y multiclase básica.
- **3 decisiones críticas** quedan al usuario: lineal vs ramas, qué se conserva al morir, fijeza de multiclase.
