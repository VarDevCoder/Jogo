#!/usr/bin/env python3
"""CLI del pipeline: personaje vectorial → spritesheet + atlas Phaser.

Uso:
    python generate.py guerrero --size 256 --fps 12

Genera:
    output/<personaje>_<size>.png    spritesheet (grilla, padding 2px)
    output/<personaje>_<size>.json   atlas TexturePacker JSON Hash
    output/preview_<anim>.gif        previews de inspección visual
"""
import argparse
import importlib
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pipeline.easing import bake_animation
from pipeline.packer import pack, save
from pipeline.rasterize import svg_to_image
from pipeline.svg_builder import build_frame_svg

PREVIEW_BG = (26, 11, 46, 255)


def generate(character, size, fps, out_dir="output", previews=True):
    rig = importlib.import_module(f"characters.{character}.rig")
    anims = importlib.import_module(f"characters.{character}.animations").ANIMATIONS

    frames = []
    by_anim = {}
    anim_meta = {}
    for name, anim in anims.items():
        poses = bake_animation(anim)
        imgs = []
        for i, pose in enumerate(poses):
            svg = build_frame_svg(rig, pose, size)
            img = svg_to_image(svg, size)
            frames.append((f"{name}_{i}", img))
            imgs.append(img)
        by_anim[name] = (imgs, anim)
        anim_meta[name] = {
            "frames": len(poses),
            "loop": anim.get("loop", True),
            "fps": anim.get("fps", fps),
        }

    os.makedirs(out_dir, exist_ok=True)
    sheet, atlas = pack(frames, padding=2,
                        meta_extra={"character": character, "animations": anim_meta})
    png_path = os.path.join(out_dir, f"{character}_{size}.png")
    json_path = os.path.join(out_dir, f"{character}_{size}.json")
    save(sheet, atlas, png_path, json_path)
    print(f"✔ {png_path}  ({sheet.size[0]}x{sheet.size[1]}, {len(frames)} frames)")
    print(f"✔ {json_path}")

    if previews:
        from PIL import Image
        for name, (imgs, anim) in by_anim.items():
            anim_fps = anim.get("fps", fps)
            comped = []
            for img in imgs:
                bg = Image.new("RGBA", img.size, PREVIEW_BG)
                bg.alpha_composite(img)
                comped.append(bg.convert("P", palette=Image.ADAPTIVE))
            gif_path = os.path.join(out_dir, f"preview_{name}.gif")
            comped[0].save(
                gif_path, save_all=True, append_images=comped[1:],
                duration=int(1000 / anim_fps), loop=0, disposal=2,
            )
            print(f"✔ {gif_path}")
    return png_path, json_path


def main():
    p = argparse.ArgumentParser(description="Genera spritesheet + atlas de un personaje")
    p.add_argument("character", help="nombre del personaje (carpeta en characters/)")
    p.add_argument("--size", type=int, default=256, choices=[64, 128, 256, 512],
                   help="resolución de cada frame (rasteriza desde vector)")
    p.add_argument("--fps", type=int, default=12, help="fps por defecto de las animaciones")
    p.add_argument("--no-previews", action="store_true", help="omite los GIF de preview")
    args = p.parse_args()
    generate(args.character, args.size, args.fps, previews=not args.no_previews)


if __name__ == "__main__":
    main()
