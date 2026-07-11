"""
Eski basit P ikonu. Güncel marka için:
  python scripts/generate_planly_professional_logo.py
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SIZE = 1024
WHITE = (255, 255, 255)
TRANSPARENT = (255, 255, 255, 0)
# Orta-gri P (okunaklı, beyaz üzerinde net)
GRAY_P = (90, 90, 92)


def pick_font() -> str:
    windir = os.environ.get("WINDIR", "C:/Windows")
    candidates = [
        os.path.join(windir, "Fonts", "segoeuib.ttf"),
        os.path.join(windir, "Fonts", "arialbd.ttf"),
        os.path.join(windir, "Fonts", "calibrib.ttf"),
    ]
    for p in candidates:
        if os.path.isfile(p):
            return p
    return ""


def measure(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int, int, int]:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox


def make_font(draw: ImageDraw.ImageDraw, font_path: str, letter: str, max_frac: float = 0.62) -> ImageFont.FreeTypeFont:
    max_side = int(SIZE * max_frac)
    if not font_path:
        return ImageFont.load_default()
    lo, hi = 80, 900
    best = None
    while lo <= hi:
        mid = (lo + hi) // 2
        try:
            font = ImageFont.truetype(font_path, mid)
        except OSError:
            return ImageFont.load_default()
        bbox = measure(draw, letter, font)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        if w <= max_side and h <= max_side:
            best = font
            lo = mid + 1
        else:
            hi = mid - 1
    return best or ImageFont.truetype(font_path, 400)


def draw_letter_centered(
    draw: ImageDraw.ImageDraw,
    letter: str,
    font_path: str,
    fill,
    y_offset: int = -12,
) -> None:
    font = make_font(draw, font_path, letter)
    bbox = measure(draw, letter, font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (SIZE - w) // 2 - bbox[0]
    y = (SIZE - h) // 2 - bbox[1] + y_offset
    draw.text((x, y), letter, font=font, fill=fill)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    assets = root / "assets"
    assets.mkdir(parents=True, exist_ok=True)
    font_path = pick_font()

    # Ana ikon + splash: beyaz zemin, gri P
    icon_rgb = Image.new("RGB", (SIZE, SIZE), WHITE)
    d = ImageDraw.Draw(icon_rgb)
    draw_letter_centered(d, "P", font_path, GRAY_P)
    icon_rgb.save(assets / "icon.png", "PNG", optimize=True)
    icon_rgb.save(assets / "splash-icon.png", "PNG", optimize=True)

    # Adaptive ön plan: şeffaf zemin, sadece P (arka plan app.json'da beyaz)
    icon_rgba = Image.new("RGBA", (SIZE, SIZE), TRANSPARENT)
    d2 = ImageDraw.Draw(icon_rgba)
    draw_letter_centered(d2, "P", font_path, GRAY_P + (255,))
    icon_rgba.save(assets / "adaptive-icon.png", "PNG", optimize=True)

    # Favicon
    small = icon_rgb.resize((48, 48), Image.Resampling.LANCZOS)
    small.save(assets / "favicon.png", "PNG", optimize=True)

    sync_android_native(root, icon_rgb, icon_rgba)

    print("OK:", assets / "icon.png", assets / "adaptive-icon.png", assets / "splash-icon.png", assets / "favicon.png")


def sync_android_native(root: Path, icon_rgb: Image.Image, icon_rgba: Image.Image) -> None:
    """EAS / yerel android/ klasörü Expo asset'lerini her build'de otomatik kopyalamaz; mipmaps güncellenir."""
    res = root / "android" / "app" / "src" / "main" / "res"
    if not res.is_dir():
        return

    # adaptive foreground boyutları (Expo önizleme ile uyumlu)
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

    icon_full = icon_rgb.convert("RGBA")

    for folder, side in fg_sizes.items():
        d = res / folder
        if not d.is_dir():
            continue
        out = icon_rgba.resize((side, side), Image.Resampling.LANCZOS)
        out.save(d / "ic_launcher_foreground.webp", "WEBP", quality=90, method=4)

    for folder, side in full_sizes.items():
        d = res / folder
        if not d.is_dir():
            continue
        out = icon_full.resize((side, side), Image.Resampling.LANCZOS)
        out.save(d / "ic_launcher.webp", "WEBP", quality=90, method=4)
        out.save(d / "ic_launcher_round.webp", "WEBP", quality=90, method=4)

    for folder, (w, h) in splash_by_folder.items():
        d = res / folder
        if not d.is_dir():
            continue
        out = icon_rgb.resize((w, h), Image.Resampling.LANCZOS)
        out.save(d / "splashscreen_logo.png", "PNG", optimize=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)
