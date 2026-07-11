"""
Planly v7 — onayli P monogram logosu (beyaz + koyu gri, sade).
Alt cizgi yok. Arka plan biraz daha acik gri ton.

Calistir: python scripts/generate_planly_p_monogram_logo.py
"""
from __future__ import annotations

import math
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

SIZE = 1024
# Biraz daha gri (onceki neredeyse siyah yerine belirgin koyu gri)
BG_TOP = (82, 83, 88)
BG_BOTTOM = (62, 63, 68)
WHITE = (255, 255, 255)
SPLASH_BG = (242, 242, 244)
ADAPTIVE_BG_HEX = "#3E3F44"


def _lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def gray_background(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = min(1.0, (x / max(1, size - 1) * 0.3 + y / max(1, size - 1) * 0.7) ** 0.85)
            px[x, y] = (
                _lerp(BG_TOP[0], BG_BOTTOM[0], t),
                _lerp(BG_TOP[1], BG_BOTTOM[1], t),
                _lerp(BG_TOP[2], BG_BOTTOM[2], t),
            )
    return img


def pick_font_path() -> str:
    windir = os.environ.get("WINDIR", "C:/Windows")
    for name in ("segoeuib.ttf", "arialbd.ttf", "calibrib.ttf"):
        path = os.path.join(windir, "Fonts", name)
        if os.path.isfile(path):
            return path
    return ""


def fit_font(draw: ImageDraw.ImageDraw, letter: str, font_path: str, target_frac: float = 0.52) -> ImageFont.FreeTypeFont:
    max_side = int(SIZE * target_frac)
    if not font_path:
        return ImageFont.load_default()
    lo, hi = 100, 900
    best = None
    while lo <= hi:
        mid = (lo + hi) // 2
        try:
            font = ImageFont.truetype(font_path, mid)
        except OSError:
            return ImageFont.load_default()
        bbox = draw.textbbox((0, 0), letter, font=font)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        if w <= max_side and h <= max_side:
            best = font
            lo = mid + 1
        else:
            hi = mid - 1
    return best or ImageFont.truetype(font_path, 420)


def compose_icon() -> Image.Image:
    img = gray_background(SIZE)
    draw = ImageDraw.Draw(img)
    font_path = pick_font_path()
    font = fit_font(draw, "P", font_path)
    bbox = draw.textbbox((0, 0), "P", font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (SIZE - w) // 2 - bbox[0]
    y = (SIZE - h) // 2 - bbox[1] - int(SIZE * 0.015)
    draw.text((x, y), "P", font=font, fill=WHITE)
    return img


def compose_splash(icon: Image.Image) -> Image.Image:
    bg = Image.new("RGB", (SIZE, SIZE), SPLASH_BG)
    tile = int(SIZE * 0.38)
    mark = icon.resize((tile, tile), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (tile + 40, tile + 40), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((20, 24, tile + 20, tile + 24), radius=28, fill=(15, 23, 42, 22))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    x = (SIZE - tile) // 2
    y = (SIZE - tile) // 2
    bg.paste(shadow, (x - 20, y - 16), shadow)
    bg.paste(mark, (x, y))
    return bg


def sync_android_native(root: Path, icon_rgb: Image.Image, splash_rgb: Image.Image) -> None:
    res = root / "android" / "app" / "src" / "main" / "res"
    if not res.is_dir():
        return

    icon_rgba = icon_rgb.convert("RGBA")
    fg_sizes = {
        "mipmap-mdpi": 108,
        "mipmap-hdpi": 162,
        "mipmap-xhdpi": 216,
        "mipmap-xxhdpi": 324,
        "mipmap-xxxhdpi": 432,
    }
    full_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    splash_by_folder = {
        "drawable-mdpi": (288, 288),
        "drawable-hdpi": (432, 432),
        "drawable-xhdpi": (576, 576),
        "drawable-xxhdpi": (864, 864),
        "drawable-xxxhdpi": (1152, 1152),
    }

    for folder, side in fg_sizes.items():
        d = res / folder
        if d.is_dir():
            icon_rgba.resize((side, side), Image.Resampling.LANCZOS).save(
                d / "ic_launcher_foreground.webp", "WEBP", quality=92, method=4
            )

    for folder, side in full_sizes.items():
        d = res / folder
        if d.is_dir():
            out = icon_rgb.resize((side, side), Image.Resampling.LANCZOS)
            out.save(d / "ic_launcher.webp", "WEBP", quality=92, method=4)
            out.save(d / "ic_launcher_round.webp", "WEBP", quality=92, method=4)

    for folder, (w, h) in splash_by_folder.items():
        d = res / folder
        if not d.is_dir():
            continue
        out_path = d / "splashscreen_logo.png"
        try:
            splash_rgb.resize((w, h), Image.Resampling.LANCZOS).save(out_path, "PNG", optimize=True)
        except OSError as err:
            print(f"Uyari: {out_path} yazilamadi ({err})", file=sys.stderr)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    assets = root / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    icon_rgb = compose_icon()
    splash_rgb = compose_splash(icon_rgb)
    icon_rgba = icon_rgb.convert("RGBA")

    icon_rgb.save(assets / "icon.png", "PNG", optimize=True)
    icon_rgba.save(assets / "adaptive-icon.png", "PNG", optimize=True)
    splash_rgb.save(assets / "splash-icon.png", "PNG", optimize=True)
    icon_rgb.resize((48, 48), Image.Resampling.LANCZOS).save(assets / "favicon.png", "PNG", optimize=True)
    icon_rgb.save(assets / "brand-logo-source.png", "PNG", optimize=True)

    sync_android_native(root, icon_rgb, splash_rgb)

    print("OK — Planly v7 P monogram (gri zemin, cizgi yok):")
    print(" ", assets / "icon.png")
    print(" ", assets / "adaptive-icon.png")
    print(" ", assets / "splash-icon.png")
    if (root / "android").is_dir():
        print(" ", "android mipmap + splash guncellendi")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)
