"""Funciones de interpolación y muestreo de keyframes.

Las animaciones nunca usan interpolación lineal pura: cada segmento
entre keyframes se suaviza con ease-in-out (smoothstep) por defecto.
"""


def linear(t):
    return t


def ease_in(t):
    return t * t


def ease_out(t):
    return 1 - (1 - t) * (1 - t)


def ease_in_out(t):
    """Smoothstep: aceleración y frenado suaves."""
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def sample_pose(keys, t, loop=True, ease=ease_in_out, times=None):
    """Muestrea una pose interpolada en t ∈ [0, 1].

    keys:  lista de poses (dict articulación → valor). Todas las claves
           presentes en cualquier key se interpolan (ausentes = 0).
    loop:  si True, el último keyframe interpola de vuelta al primero
           (cierre de ciclo sin salto). Si False, t=1 es el último key.
    times: posiciones opcionales de cada key en [0, 1]. Por defecto se
           distribuyen uniformemente.
    """
    n = len(keys)
    if n == 0:
        return {}
    if n == 1:
        return dict(keys[0])

    segs = n if loop else n - 1
    if times is None:
        times = [i / segs for i in range(n)]

    t = t % 1.0 if loop else min(max(t, 0.0), 1.0)

    # localizar el segmento [times[i], end_i)
    for i in range(n):
        a_t = times[i]
        if i + 1 < n:
            b_t = times[i + 1]
            b_key = keys[i + 1]
        elif loop:
            b_t = 1.0
            b_key = keys[0]
        else:
            return dict(keys[-1])
        if a_t <= t <= b_t or i == n - 1:
            span = (b_t - a_t) or 1.0
            u = ease((t - a_t) / span)
            joints = set(keys[i]) | set(b_key)
            return {j: lerp(keys[i].get(j, 0.0), b_key.get(j, 0.0), u)
                    for j in joints}
    return dict(keys[-1])


def bake_animation(anim):
    """Convierte una definición de animación en la lista de poses por frame.

    anim: {"frames": int, "loop": bool, "keys": [pose, ...],
           "times": opcional, "ease": opcional}
    """
    frames = anim["frames"]
    loop = anim.get("loop", True)
    ease = anim.get("ease", ease_in_out)
    times = anim.get("times")
    poses = []
    for f in range(frames):
        # en ciclos el frame N interpola hacia el 0 (no se duplica el inicio);
        # en no-loop el último frame aterriza exactamente en el último key
        t = f / frames if loop else (f / (frames - 1) if frames > 1 else 0.0)
        poses.append(sample_pose(anim["keys"], t, loop=loop, ease=ease, times=times))
    return poses
