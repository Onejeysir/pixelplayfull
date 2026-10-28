"""Prépare les déclinaisons raster du logo PIXEL PLAY à partir du fichier source.

Le symbole d'origine n'est jamais redessiné : on le recadre, on en extrait un
masque (noir -> opaque, blanc -> transparent) puis on le recolore.

Usage : python3 scripts/build-logo.py <logo-source.jpeg>
Sorties : scripts/.build/logo-mask.png (1 bit, utilisé par le tracé SVG)
          public/logo-mark.png, public/favicon-32.png, public/apple-touch-icon.png,
          public/icon-192.png, public/icon-512.png
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "scripts" / ".build"
PUBLIC = ROOT / "public"
BUILD.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

VIOLET = (108, 59, 234)  # #6C3BEA
INK = (23, 21, 33)  # #171521
WHITE = (255, 255, 255)

src = Image.open(sys.argv[1]).convert("L")

# Masque : les pixels sombres du logo deviennent l'encre.
mask = src.point(lambda p: 255 if p < 128 else 0)
bbox = mask.getbbox()
pad = 16
box = (bbox[0] - pad, bbox[1] - pad, bbox[2] + pad, bbox[3] + pad)
mask = mask.crop(box)

# Version 1 bit pour le tracé vectoriel (noir sur blanc).
trace_src = Image.eval(mask, lambda p: 255 - p)
trace_src.save(BUILD / "logo-mask.png")


def tinted(color, size=None):
    """Symbole recoloré sur fond transparent."""
    m = mask if size is None else mask.resize(size, Image.LANCZOS)
    layer = Image.new("RGBA", m.size, color + (0,))
    layer.putalpha(m)
    return layer


def tile(side, bg, fg, ratio=0.64):
    """Pastille carrée avec le symbole centré (favicon, icônes d'application)."""
    canvas = Image.new("RGBA", (side, side), bg + (255,))
    target_h = int(side * ratio)
    scale = target_h / mask.height
    size = (max(1, int(mask.width * scale)), target_h)
    mark = tinted(fg, size)
    canvas.alpha_composite(mark, ((side - size[0]) // 2, (side - size[1]) // 2))
    return canvas


# Symbole seul, encre sombre, fond transparent (utile pour réutilisation).
tinted(INK).save(PUBLIC / "logo-mark.png", optimize=True)

# Icônes : symbole blanc sur violet de la charte.
tile(32, VIOLET, WHITE, 0.70).save(PUBLIC / "favicon-32.png", optimize=True)
tile(180, VIOLET, WHITE).save(PUBLIC / "apple-touch-icon.png", optimize=True)
tile(192, VIOLET, WHITE).save(PUBLIC / "icon-192.png", optimize=True)
tile(512, VIOLET, WHITE).save(PUBLIC / "icon-512.png", optimize=True)

print("recadrage", box, "-> masque", mask.size)
