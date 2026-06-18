# character-pipeline

Pipeline de personajes 2D vectorizados → spritesheet jugable.

Genera personajes con **animación esquelética cutout** definidos como SVG
modular paramétrico, y produce un **spritesheet PNG + atlas JSON
(TexturePacker Hash)** listo para `this.load.atlas()` de Phaser 3.

```
SVG modular (rig.py) ──→ poses interpoladas (animations.py + easing)
        │                          │
        └──→ svg_builder ──→ cairosvg ──→ packer ──→ PNG + JSON ──→ Phaser
```

## Uso

```bash
pip install cairosvg pillow
python generate.py guerrero --size 256 --fps 12
```

Salida en `output/`:

- `guerrero_256.png` — spritesheet en grilla compacta, fondo transparente,
  padding de 2px entre frames (anti-bleeding)
- `guerrero_256.json` — atlas TexturePacker JSON Hash con frames
  `walk_0…walk_7`, `idle_0…`, etc. La sección `meta.animations` incluye
  frames/fps/loop por animación para registrar las animaciones
  dinámicamente en el motor.
- `preview_<anim>.gif` — inspección visual rápida sin abrir la demo

`--size 128|256|512` **rasteriza siempre desde el vector** (nunca reescala
PNG): regenerar a 512 mantiene la nitidez.

## Demo Phaser 3

```bash
npx serve .        # o python3 -m http.server
# abrir http://localhost:3000/demo/
```

Controles: **←/→** caminar (con `setFlipX` según dirección), **ESPACIO**
saltar, **X** atacar, sin input vuelve a idle. Las 4 animaciones se
registran leyendo `meta.animations` del atlas.

## Cómo se define un personaje

Cada personaje es una carpeta en `characters/` con dos archivos —
**el pipeline no se toca para agregar personajes nuevos**:

### `rig.py` — el esqueleto y el arte

```python
PARTS = [
  {"name": "brazo_sup_der",
   "parent": "torso",          # jerarquía: hijo hereda transformación
   "pivot": (1.0, -15.0),      # la articulación, en espacio del padre
   "z": 16,                    # orden de dibujado, independiente del árbol
   "svg": "<path .../>"},      # geometría en espacio local (pivote = origen)
]
```

- Jerarquía: `torso → {cabeza, brazos sup→inf, piernas sup→inf}` (+ la
  espada como hija del antebrazo).
- Las extremidades son cápsulas con extremos redondeados que se solapan
  en las articulaciones: al rotar no se ven cortes ni huecos.
- Estilo: flat-shaded con gradientes por material, sombreado en dos
  tonos, brillos y outline consistente.

### `animations.py` — los ciclos

```python
ANIMATIONS = {
  "walk": {
    "frames": 8, "loop": True, "fps": 12,
    "keys": [ {"pierna_sup_der": -27, "torso": 4, "_dy": -0.2}, ... ],
  },
  "jump": {
    "frames": 6, "loop": False,
    "times": [0, .18, .38, .6, .82, 1],   # timing no uniforme opcional
    "keys": [...],
  },
}
```

- Keyframes de **ángulos por articulación** + `_dx`/`_dy` del raíz.
- Interpolación **ease-in-out** (nunca lineal pura).
- En ciclos (`loop: True`) el último keyframe interpola de vuelta al
  primero: el loop cierra sin salto visible.

## Estructura

```
character-pipeline/
├── characters/guerrero/   rig.py + animations.py (por personaje)
├── pipeline/              svg_builder, rasterize, packer, easing (genérico)
├── output/                spritesheets, atlas y previews generados
├── demo/index.html        validación en Phaser 3 (CDN, sin build)
└── generate.py            CLI
```
