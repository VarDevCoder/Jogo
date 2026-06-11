"""Animaciones del guerrero: keyframes de ángulos por articulación.

Convención de signos (personaje mirando a +x, SVG y-hacia-abajo):
  - extremidades (cuelgan hacia abajo): ángulo NEGATIVO = balanceo hacia
    adelante (+x), POSITIVO = hacia atrás.
  - torso: POSITIVO = inclinarse hacia adelante.
  - "_dy": desplazamiento vertical del raíz (negativo = sube).

Cada animación: keyframes + frames a hornear. La interpolación es
ease-in-out (pipeline/easing.py). Los ciclos (idle, walk) cierran el
loop interpolando el último keyframe hacia el primero.
"""

ANIMATIONS = {
    # respiración sutil + balanceo mínimo de brazos
    "idle": {
        "frames": 6,
        "loop": True,
        "fps": 8,
        "keys": [
            {"torso": 1.0, "cabeza": -1.0, "_dy": 0.0,
             "brazo_sup_der": 4, "brazo_inf_der": 6, "espada": 30,
             "brazo_sup_izq": -3, "brazo_inf_izq": 8,
             "pierna_sup_der": -2, "pierna_inf_der": 3,
             "pierna_sup_izq": 2, "pierna_inf_izq": 2},
            {"torso": 2.2, "cabeza": -2.2, "_dy": 0.7,
             "brazo_sup_der": 6.5, "brazo_inf_der": 9, "espada": 26,
             "brazo_sup_izq": -5, "brazo_inf_izq": 10,
             "pierna_sup_der": -2, "pierna_inf_der": 3,
             "pierna_sup_izq": 2, "pierna_inf_izq": 2},
            {"torso": 1.2, "cabeza": -1.2, "_dy": 0.2,
             "brazo_sup_der": 4.5, "brazo_inf_der": 7, "espada": 29,
             "brazo_sup_izq": -3.5, "brazo_inf_izq": 8.5,
             "pierna_sup_der": -2, "pierna_inf_der": 3,
             "pierna_sup_izq": 2, "pierna_inf_izq": 2},
        ],
    },

    # ciclo de caminata: contraposición brazo/pierna + bobbing del torso
    "walk": {
        "frames": 8,
        "loop": True,
        "fps": 12,
        "keys": [
            # contacto: pierna derecha adelante
            {"torso": 4, "cabeza": -3, "_dy": -0.2,
             "pierna_sup_der": -27, "pierna_inf_der": 8,
             "pierna_sup_izq": 24, "pierna_inf_izq": 28,
             "brazo_sup_der": 26, "brazo_inf_der": 16, "espada": 24,
             "brazo_sup_izq": -22, "brazo_inf_izq": 14},
            # paso: pierna derecha bajo el cuerpo, izquierda recogida
            {"torso": 3, "cabeza": -2, "_dy": -1.6,
             "pierna_sup_der": 2, "pierna_inf_der": 4,
             "pierna_sup_izq": -4, "pierna_inf_izq": 42,
             "brazo_sup_der": 6, "brazo_inf_der": 12, "espada": 28,
             "brazo_sup_izq": -4, "brazo_inf_izq": 12},
            # contacto: pierna izquierda adelante
            {"torso": 4, "cabeza": -3, "_dy": -0.2,
             "pierna_sup_der": 24, "pierna_inf_der": 30,
             "pierna_sup_izq": -27, "pierna_inf_izq": 6,
             "brazo_sup_der": -24, "brazo_inf_der": 10, "espada": 22,
             "brazo_sup_izq": 24, "brazo_inf_izq": 18},
            # paso opuesto
            {"torso": 3, "cabeza": -2, "_dy": -1.6,
             "pierna_sup_der": -4, "pierna_inf_der": 44,
             "pierna_sup_izq": 2, "pierna_inf_izq": 4,
             "brazo_sup_der": 4, "brazo_inf_der": 12, "espada": 26,
             "brazo_sup_izq": -2, "brazo_inf_izq": 12},
        ],
    },

    # anticipación → despegue → vuelo → aterrizaje
    "jump": {
        "frames": 6,
        "loop": False,
        "fps": 12,
        "times": [0.0, 0.18, 0.38, 0.6, 0.82, 1.0],
        "keys": [
            # anticipación: agacharse
            {"torso": 14, "cabeza": -8, "_dy": 3.6,
             "pierna_sup_der": -34, "pierna_inf_der": 52,
             "pierna_sup_izq": -28, "pierna_inf_izq": 50,
             "brazo_sup_der": 30, "brazo_inf_der": 14, "espada": 18,
             "brazo_sup_izq": 26, "brazo_inf_izq": 12},
            # despegue: extensión total
            {"torso": -4, "cabeza": 2, "_dy": -6.0,
             "pierna_sup_der": 14, "pierna_inf_der": 6,
             "pierna_sup_izq": 10, "pierna_inf_izq": 8,
             "brazo_sup_der": -38, "brazo_inf_der": -10, "espada": 34,
             "brazo_sup_izq": -30, "brazo_inf_izq": -6},
            # vuelo: tuck
            {"torso": 4, "cabeza": -2, "_dy": -10.0,
             "pierna_sup_der": -26, "pierna_inf_der": 46,
             "pierna_sup_izq": 18, "pierna_inf_izq": 38,
             "brazo_sup_der": -16, "brazo_inf_der": 8, "espada": 24,
             "brazo_sup_izq": -10, "brazo_inf_izq": 10},
            # caída
            {"torso": -2, "cabeza": 0, "_dy": -5.0,
             "pierna_sup_der": -10, "pierna_inf_der": 18,
             "pierna_sup_izq": 16, "pierna_inf_izq": 12,
             "brazo_sup_der": 22, "brazo_inf_der": 6, "espada": 20,
             "brazo_sup_izq": 18, "brazo_inf_izq": 6},
            # aterrizaje: amortiguar
            {"torso": 12, "cabeza": -7, "_dy": 2.8,
             "pierna_sup_der": -30, "pierna_inf_der": 46,
             "pierna_sup_izq": -22, "pierna_inf_izq": 42,
             "brazo_sup_der": 24, "brazo_inf_der": 12, "espada": 16,
             "brazo_sup_izq": 20, "brazo_inf_izq": 10},
            # recuperación
            {"torso": 2, "cabeza": -1.5, "_dy": 0.3,
             "pierna_sup_der": -3, "pierna_inf_der": 4,
             "pierna_sup_izq": 3, "pierna_inf_izq": 3,
             "brazo_sup_der": 5, "brazo_inf_der": 7, "espada": 28,
             "brazo_sup_izq": -4, "brazo_inf_izq": 8},
        ],
    },

    # golpe con anticipación y follow-through
    "attack": {
        "frames": 6,
        "loop": False,
        "fps": 14,
        "times": [0.0, 0.3, 0.46, 0.62, 0.82, 1.0],
        "keys": [
            # guardia
            {"torso": 2, "cabeza": -2, "_dy": 0,
             "brazo_sup_der": 8, "brazo_inf_der": 10, "espada": 30,
             "brazo_sup_izq": -6, "brazo_inf_izq": 10,
             "pierna_sup_der": -8, "pierna_inf_der": 6,
             "pierna_sup_izq": 8, "pierna_inf_izq": 8},
            # anticipación: espada atrás y arriba
            {"torso": -8, "cabeza": 4, "_dy": 0.6,
             "brazo_sup_der": 96, "brazo_inf_der": 58, "espada": -28,
             "brazo_sup_izq": -28, "brazo_inf_izq": 16,
             "pierna_sup_der": -14, "pierna_inf_der": 10,
             "pierna_sup_izq": 14, "pierna_inf_izq": 10},
            # carga (pequeño hold antes del golpe)
            {"torso": -10, "cabeza": 5, "_dy": 0.8,
             "brazo_sup_der": 104, "brazo_inf_der": 62, "espada": -30,
             "brazo_sup_izq": -30, "brazo_inf_izq": 16,
             "pierna_sup_der": -14, "pierna_inf_der": 10,
             "pierna_sup_izq": 14, "pierna_inf_izq": 10},
            # impacto: tajo hacia adelante-abajo
            {"torso": 16, "cabeza": -8, "_dy": 1.2,
             "brazo_sup_der": -96, "brazo_inf_der": -24, "espada": 38,
             "brazo_sup_izq": 22, "brazo_inf_izq": 8,
             "pierna_sup_der": -26, "pierna_inf_der": 14,
             "pierna_sup_izq": 26, "pierna_inf_izq": 24},
            # follow-through
            {"torso": 12, "cabeza": -6, "_dy": 0.8,
             "brazo_sup_der": -72, "brazo_inf_der": -12, "espada": 24,
             "brazo_sup_izq": 16, "brazo_inf_izq": 8,
             "pierna_sup_der": -20, "pierna_inf_der": 12,
             "pierna_sup_izq": 20, "pierna_inf_izq": 18},
            # recuperación a guardia
            {"torso": 2, "cabeza": -2, "_dy": 0,
             "brazo_sup_der": 8, "brazo_inf_der": 10, "espada": 30,
             "brazo_sup_izq": -6, "brazo_inf_izq": 10,
             "pierna_sup_der": -8, "pierna_inf_der": 6,
             "pierna_sup_izq": 8, "pierna_inf_izq": 8},
        ],
    },
}
