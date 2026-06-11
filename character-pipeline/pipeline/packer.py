"""Empaqueta frames PNG en un spritesheet + atlas JSON (TexturePacker Hash).

Grilla compacta (≈cuadrada) con padding configurable entre frames para
evitar bleeding al samplear en el motor. El JSON es compatible con
`this.load.atlas(key, png, json)` de Phaser 3.
"""
import json
import math

from PIL import Image


def pack(frames, padding=2, meta_extra=None):
    """frames: lista de (nombre, PIL.Image) — todas del mismo tamaño.

    Devuelve (spritesheet: PIL.Image, atlas: dict).
    """
    if not frames:
        raise ValueError("no hay frames que empaquetar")

    fw, fh = frames[0][1].size
    n = len(frames)
    cols = math.ceil(math.sqrt(n))
    rows = math.ceil(n / cols)

    sheet_w = cols * fw + (cols + 1) * padding
    sheet_h = rows * fh + (rows + 1) * padding
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))

    atlas_frames = {}
    for i, (name, img) in enumerate(frames):
        col, row = i % cols, i // cols
        x = padding + col * (fw + padding)
        y = padding + row * (fh + padding)
        sheet.paste(img, (x, y))
        atlas_frames[name] = {
            "frame": {"x": x, "y": y, "w": fw, "h": fh},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": fw, "h": fh},
            "sourceSize": {"w": fw, "h": fh},
        }

    atlas = {
        "frames": atlas_frames,
        "meta": {
            "app": "character-pipeline",
            "version": "1.0",
            "format": "RGBA8888",
            "size": {"w": sheet_w, "h": sheet_h},
            "scale": "1",
            **(meta_extra or {}),
        },
    }
    return sheet, atlas


def save(sheet, atlas, png_path, json_path):
    sheet.save(png_path)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(atlas, f, indent=2, ensure_ascii=False)
