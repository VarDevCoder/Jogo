"""SVG string → PIL.Image RGBA, rasterizado desde el vector con cairosvg.

La nitidez a cualquier resolución está garantizada porque cada tamaño
se rasteriza desde el SVG original: nunca se reescala un PNG.
"""
import io

import cairosvg
from PIL import Image


def svg_to_image(svg_string, size):
    png_bytes = cairosvg.svg2png(
        bytestring=svg_string.encode("utf-8"),
        output_width=size,
        output_height=size,
    )
    return Image.open(io.BytesIO(png_bytes)).convert("RGBA")
