"""Rig paramétrico del guerrero medieval (vista lateral, mira hacia +x).

Cada parte: geometría SVG en su espacio local (el pivote/articulación es
el origen), pivote definido en el espacio del padre, y z-order explícito
e independiente de la jerarquía (extremidades lejanas detrás del torso,
cercanas delante).

Las extremidades son cápsulas verticales en su espacio local (cuelgan
hacia +y) con extremos redondeados que se solapan en las articulaciones:
al rotar nunca se ven cortes.
"""

CANVAS = 100
ROOT = (50.0, 57.0)  # cadera del personaje en el lienzo

# paleta — flat-shaded con outline consistente
OUT = "#2b2330"      # contorno
SW = 1.1             # grosor del contorno (unidades vectoriales)

DEFS = """
<linearGradient id="g_steel" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#6e7787"/>
  <stop offset="0.55" stop-color="#9aa3b5"/>
  <stop offset="1" stop-color="#b8c1d2"/>
</linearGradient>
<linearGradient id="g_steel_v" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#aab3c4"/>
  <stop offset="1" stop-color="#717a8a"/>
</linearGradient>
<linearGradient id="g_cloth" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#7e2727"/>
  <stop offset="1" stop-color="#b13a3a"/>
</linearGradient>
<linearGradient id="g_leather" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#5a3c22"/>
  <stop offset="1" stop-color="#82592f"/>
</linearGradient>
<linearGradient id="g_skin" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#d29c6e"/>
  <stop offset="1" stop-color="#edbf92"/>
</linearGradient>
<linearGradient id="g_blade" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#9fb0bd"/>
  <stop offset="0.5" stop-color="#e8f0f6"/>
  <stop offset="1" stop-color="#c3d2dd"/>
</linearGradient>
<linearGradient id="g_dark" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#3f4654"/>
  <stop offset="1" stop-color="#5c6575"/>
</linearGradient>
"""


def vcap(length, r, fill, shade=True, hi=True):
    """Cápsula vertical local: articulación en (0,0), cuelga hasta (0, length).

    Extremos redondeados (rx=r) → solape limpio en las articulaciones.
    Dos tonos: gradiente horizontal + sombra trasera + brillo frontal.
    """
    parts = [
        f'<rect x="{-r:.2f}" y="{-r:.2f}" width="{2 * r:.2f}" '
        f'height="{length + 2 * r:.2f}" rx="{r:.2f}" fill="{fill}" '
        f'stroke="{OUT}" stroke-width="{SW}"/>'
    ]
    if shade:
        parts.append(
            f'<rect x="{-r + 0.4:.2f}" y="{-r + 0.4:.2f}" width="{r * 0.7:.2f}" '
            f'height="{length + 2 * r - 0.8:.2f}" rx="{r * 0.6:.2f}" '
            f'fill="#000" opacity="0.16"/>'
        )
    if hi:
        parts.append(
            f'<rect x="{r * 0.25:.2f}" y="{-r * 0.5:.2f}" width="{r * 0.45:.2f}" '
            f'height="{length * 0.7:.2f}" rx="{r * 0.22:.2f}" '
            f'fill="#fff" opacity="0.22"/>'
        )
    return "".join(parts)


def _torso():
    return (
        # peto: trapecio redondeado del pecho a la cadera
        f'<path d="M -5.2 1.5 '
        f'C -6.4 -4 -6.8 -10 -5.6 -15.5 '
        f'Q -5 -19.2 0.6 -19.4 '
        f'Q 6.4 -19.2 7 -15 '
        f'C 7.8 -9.5 7 -3.5 6 1.5 '
        f'Q 0.4 4.4 -5.2 1.5 Z" '
        f'fill="url(#g_steel_v)" stroke="{OUT}" stroke-width="{SW}"/>'
        # sombra lateral trasera del peto
        f'<path d="M -5.2 1.5 C -6.4 -4 -6.8 -10 -5.6 -15.5 '
        f'Q -5.2 -18 -2.6 -18.9 C -3.4 -12 -3.4 -4 -2.4 2.6 '
        f'Q -4 2.4 -5.2 1.5 Z" fill="#000" opacity="0.14"/>'
        # línea pectoral
        f'<path d="M -3 -13.5 Q 1 -15.4 5.6 -13.2" fill="none" '
        f'stroke="{OUT}" stroke-width="0.8" opacity="0.5"/>'
        # faldón de cuero
        f'<path d="M -5 0.2 Q 0.6 3.4 6 0.2 L 5.2 4.6 Q 0.4 7 -4.4 4.6 Z" '
        f'fill="url(#g_leather)" stroke="{OUT}" stroke-width="{SW}"/>'
        # cinturón + hebilla
        f'<rect x="-5.4" y="-1.4" width="11.8" height="3" rx="1.4" '
        f'fill="url(#g_dark)" stroke="{OUT}" stroke-width="0.9"/>'
        f'<rect x="0" y="-1.7" width="3.4" height="3.6" rx="0.8" '
        f'fill="#d9a441" stroke="{OUT}" stroke-width="0.8"/>'
        # brillo del peto
        f'<path d="M 2.8 -17.5 Q 5.6 -16.4 5.9 -12.5" fill="none" '
        f'stroke="#fff" stroke-width="1.1" opacity="0.35" stroke-linecap="round"/>'
    )


def _head():
    return (
        # cuello
        f'<rect x="-2.2" y="-3.4" width="5" height="4.6" rx="2" '
        f'fill="url(#g_skin)" stroke="{OUT}" stroke-width="0.9"/>'
        # cráneo / cara (perfil mirando a +x)
        f'<path d="M -6.2 -7.5 '
        f'C -6.6 -13.5 -2.4 -16.6 1.4 -16.4 '
        f'C 5.8 -16.2 8.2 -12.6 7.9 -8.8 '
        f'Q 7.8 -6.6 8.6 -5.6 Q 7 -4.2 5.2 -4.8 '
        f'Q 3.4 -2.6 0.4 -3.1 C -3.8 -3.6 -6 -4.6 -6.2 -7.5 Z" '
        f'fill="url(#g_skin)" stroke="{OUT}" stroke-width="{SW}"/>'
        # oreja
        f'<circle cx="-0.6" cy="-8" r="1.7" fill="#c89066" '
        f'stroke="{OUT}" stroke-width="0.7"/>'
        # ojo
        f'<circle cx="4.9" cy="-9.4" r="1.05" fill="{OUT}"/>'
        # ceja
        f'<path d="M 3.6 -11.4 L 6.4 -11" stroke="{OUT}" '
        f'stroke-width="1" stroke-linecap="round"/>'
        # boca
        f'<path d="M 5 -6.2 L 7 -6" stroke="{OUT}" stroke-width="0.8" '
        f'stroke-linecap="round"/>'
        # casco: cúpula + protector nasal + carrillera
        f'<path d="M -7 -9.5 C -7.6 -15.8 -2.8 -19.3 1.6 -19.2 '
        f'C 6.4 -19.1 9.4 -15.2 8.8 -10.6 '
        f'L 6.6 -10.9 C 7 -14 5 -16.8 1.4 -16.9 '
        f'C -2.4 -17 -5.2 -14.2 -4.9 -9.8 Z" '
        f'fill="url(#g_steel)" stroke="{OUT}" stroke-width="{SW}"/>'
        f'<path d="M -7 -9.5 C -7.6 -15.8 -2.8 -19.3 1.6 -19.2 '
        f'C 6.4 -19.1 9.4 -15.2 8.8 -10.6 '
        f'Q 8 -10.2 6.6 -10.9 L 7.2 -12 Q 1 -16 -5.6 -12.2 L -4.9 -9.8 Z" '
        f'fill="#fff" opacity="0.12"/>'
        # nasal
        f'<path d="M 7.5 -11.5 L 7.9 -7.6" stroke="url(#g_steel)" '
        f'stroke-width="2" stroke-linecap="round"/>'
        f'<path d="M 7.5 -11.5 L 7.9 -7.6" stroke="{OUT}" '
        f'stroke-width="0.7" opacity="0.5" fill="none"/>'
        # penacho rojo
        f'<path d="M -1 -19 Q -2 -23.4 -6.4 -23.6 Q -4.6 -20.4 -5.4 -18 '
        f'Q -3 -19.6 -1 -19 Z" fill="url(#g_cloth)" '
        f'stroke="{OUT}" stroke-width="0.9"/>'
    )


def _pauldron():
    return (
        f'<circle cx="0" cy="0.6" r="4.4" fill="url(#g_steel)" '
        f'stroke="{OUT}" stroke-width="{SW}"/>'
        f'<path d="M -4 1.8 A 4.4 4.4 0 0 1 -3.4 -2.6" fill="none" '
        f'stroke="#000" opacity="0.2" stroke-width="1.6"/>'
        f'<circle cx="1.4" cy="-0.8" r="1.1" fill="#fff" opacity="0.3"/>'
    )


def _fist(y):
    return (
        f'<circle cx="0" cy="{y}" r="2.6" fill="url(#g_leather)" '
        f'stroke="{OUT}" stroke-width="0.95"/>'
    )


def _boot():
    # bota apuntando hacia +x (adelante)
    return (
        f'<path d="M -2.6 6.2 L -2.6 10.4 Q -2.6 12 -0.8 12.1 '
        f'L 6.6 12.1 Q 7.8 12 7.4 10.8 Q 6.8 9.2 4 8.6 '
        f'Q 2.8 8.4 2.6 6.6 Z" '
        f'fill="url(#g_leather)" stroke="{OUT}" stroke-width="{SW}"/>'
        f'<path d="M -2.6 10.6 L 7.5 10.9" stroke="{OUT}" '
        f'stroke-width="0.7" opacity="0.4"/>'
    )


def _sword():
    return (
        # empuñadura
        f'<rect x="-1" y="-0.6" width="2" height="4.6" rx="0.9" '
        f'fill="url(#g_leather)" stroke="{OUT}" stroke-width="0.85"/>'
        f'<circle cx="0" cy="4.4" r="1.5" fill="#d9a441" '
        f'stroke="{OUT}" stroke-width="0.85"/>'
        # guarda
        f'<rect x="-4.1" y="-2.6" width="8.2" height="2.1" rx="1" '
        f'fill="#d9a441" stroke="{OUT}" stroke-width="0.9"/>'
        # hoja con filo y canal central
        f'<path d="M -1.6 -2.6 L -1.6 -21 Q -1.6 -23.6 0 -25.2 '
        f'Q 1.6 -23.6 1.6 -21 L 1.6 -2.6 Z" '
        f'fill="url(#g_blade)" stroke="{OUT}" stroke-width="{SW}"/>'
        f'<path d="M 0 -3.4 L 0 -22.5" stroke="#8da0ad" '
        f'stroke-width="0.7" opacity="0.8"/>'
        f'<path d="M 1 -4 L 1 -20.5" stroke="#fff" '
        f'stroke-width="0.5" opacity="0.6"/>'
    )


PARTS = [
    # ----- lado lejano (detrás de todo) -----
    {"name": "brazo_sup_izq", "parent": "torso", "pivot": (-1.0, -15.0), "z": 1,
     "svg": vcap(9.5, 2.9, "url(#g_dark)") },
    {"name": "brazo_inf_izq", "parent": "brazo_sup_izq", "pivot": (0, 9.5), "z": 2,
     "svg": vcap(8.0, 2.5, "url(#g_dark)", hi=False) + _fist(8.6)},
    {"name": "pierna_sup_izq", "parent": "torso", "pivot": (-1.2, 0.6), "z": 3,
     "svg": vcap(10.5, 3.2, "url(#g_dark)")},
    {"name": "pierna_inf_izq", "parent": "pierna_sup_izq", "pivot": (0, 10.5), "z": 4,
     "svg": vcap(6.0, 2.7, "url(#g_dark)", hi=False) + _boot()},

    # ----- núcleo -----
    {"name": "torso", "parent": None, "pivot": (0, 0), "z": 10, "svg": _torso()},
    {"name": "cabeza", "parent": "torso", "pivot": (0.6, -18.2), "z": 12, "svg": _head()},

    # ----- lado cercano (delante) -----
    {"name": "pierna_sup_der", "parent": "torso", "pivot": (1.2, 0.6), "z": 14,
     "svg": vcap(10.5, 3.2, "url(#g_cloth)")},
    {"name": "pierna_inf_der", "parent": "pierna_sup_der", "pivot": (0, 10.5), "z": 15,
     "svg": vcap(6.0, 2.7, "url(#g_steel)") + _boot()},
    {"name": "brazo_sup_der", "parent": "torso", "pivot": (1.0, -15.0), "z": 16,
     "svg": vcap(9.5, 2.9, "url(#g_cloth)") + _pauldron()},
    {"name": "brazo_inf_der", "parent": "brazo_sup_der", "pivot": (0, 9.5), "z": 17,
     "svg": vcap(8.0, 2.5, "url(#g_skin)") + _fist(8.6)},
    {"name": "espada", "parent": "brazo_inf_der", "pivot": (0, 8.6), "z": 18,
     "svg": _sword()},
]
