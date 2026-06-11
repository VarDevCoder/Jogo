"""Construye el SVG de un frame a partir del rig y una pose.

El rig es animación esquelética cutout estándar:
  - cada parte tiene un pivote (la articulación) definido en el espacio
    local de su padre,
  - la transformación mundial del hijo es padre × translate(pivote) ×
    rotate(ángulo),
  - el orden de dibujado (z) es independiente de la jerarquía.

La pose es {nombre_articulación: grados} más claves especiales del raíz:
  "_dx", "_dy" (desplazamiento del personaje, p. ej. bobbing) y los
  ángulos usan el nombre de la parte.
"""


def _build_index(parts):
    return {p["name"]: p for p in parts}


def _transform_chain(part, index, pose, root, scale=1.0):
    """Cadena de transforms SVG desde el raíz hasta la parte (exterior→interior)."""
    chain = []
    node = part
    while node is not None:
        px, py = node["pivot"]
        angle = pose.get(node["name"], 0.0)
        chain.append(f"translate({px:.3f},{py:.3f}) rotate({angle:.3f})")
        node = index.get(node["parent"]) if node["parent"] else None
    rx = root[0] + pose.get("_dx", 0.0)
    ry = root[1] + pose.get("_dy", 0.0)
    chain.append(f"translate({rx:.3f},{ry:.3f}) scale({scale:.4f})")
    return " ".join(reversed(chain))


def build_frame_svg(rig, pose, size):
    """SVG completo (string) de un frame en la resolución pedida.

    rig: módulo/objeto con CANVAS (unidades del viewBox), ROOT (x, y),
         PARTS (lista de partes) y DEFS (gradientes, etc.).
    """
    canvas = rig.CANVAS
    index = _build_index(rig.PARTS)
    body = []
    for part in sorted(rig.PARTS, key=lambda p: p["z"]):
        tf = _transform_chain(part, index, pose, rig.ROOT)
        geometry = part["svg"]() if callable(part["svg"]) else part["svg"]
        body.append(f'<g transform="{tf}">{geometry}</g>')

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{size}" height="{size}" '
        f'viewBox="0 0 {canvas} {canvas}">'
        f"<defs>{rig.DEFS}</defs>"
        f'{"".join(body)}'
        f"</svg>"
    )
