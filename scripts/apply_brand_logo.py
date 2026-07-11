"""
Planly marka logosunu assets/ ve android mipmap'lere uygular.
Kaynak görseldeki boş gri alan kırpılır; logo ikonu tam doldurur (küçük ortada kalmaz).

Çalıştır: python scripts/apply_brand_logo.py
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

SIZE = 1024
ADAPTIVE_BG_RGB = (242, 242, 244)
ICON_BG_RGB = (242, 242, 244)
TRIM_THRESHOLD = 28


def _color_dist(a: tuple, b: tuple) -> float:
    return sum(abs(int(a[i]) - int(b[i])) for i in range(3))


def _median_corner_rgb(im: Image.Image) -> tuple[int, int, int]:
    w, h = im.size
    pts = [
        im.getpixel((2, 2)),
        im.getpixel((w - 3, 2)),
        im.getpixel((2, h - 3)),
        im.getpixel((w - 3, h - 3)),
    ]
    rs = sorted(p[0] for p in pts)
    gs = sorted(p[1] for p in pts)
    bs = sorted(p[2] for p in pts)
    return rs[1], gs[1], bs[1]


def trim_outer_margins(im: Image.Image, threshold: int = TRIM_THRESHOLD) -> Image.Image:
    """Gri/boş çerçeveyi at; ortadaki ikon karesine yakın kırp."""
    rgb = im.convert("RGB")
    w, h = rgb.size
    bg = _median_corner_rgb(rgb)
    px = rgb.load()
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    step = max(1, min(w, h) // 800)
    for y in range(0, h, step):
        for x in range(0, w, step):
            if _color_dist(px[x, y], bg) > threshold:
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        return im
    pad = int(max(w, h) * 0.02)
    min_x = max(0, min_x - pad)
    min_y = max(0, min_y - pad)
    max_x = min(w - 1, max_x + pad)
    max_y = min(h - 1, max_y + pad)
    return im.crop((min_x, min_y, max_x + 1, max_y + 1))


def cover_square_square(im: Image.Image, side: int, bg_rgb: tuple[int, int, int]) -> Image.Image:
    """Logo alanı kareyi tam doldurur (Duolingo gibi — küçük ortada kalmaz)."""
    im = trim_outer_margins(im).convert("RGBA")
    w, h = im.size
    scale = max(side / w, side / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - side) // 2
    top = (nh - side) // 2
    cropped = resized.crop((left, top, left + side, top + side))
    canvas = Image.new("RGBA", (side, side), bg_rgb + (255,))
    canvas.paste(cropped, (0, 0), cropped)
    return canvas


def sync_android_native(root: Path, icon_rgba: Image.Image) -> None:
    res = root / "android" / "app" / "src" / "main" / "res"
    if not res.is_dir():
        return

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

    icon_rgb = icon_rgba.convert("RGB")

    for folder, side in fg_sizes.items():
        d = res / folder
        if not d.is_dir():
            continue
        icon_rgba.resize((side, side), Image.Resampling.LANCZOS).save(
            d / "ic_launcher_foreground.webp", "WEBP", quality=92, method=4
        )

    for folder, side in full_sizes.items():
        d = res / folder
        if not d.is_dir():
            continue
        out = icon_rgb.resize((side, side), Image.Resampling.LANCZOS)
        out.save(d / "ic_launcher.webp", "WEBP", quality=92, method=4)
        out.save(d / "ic_launcher_round.webp", "WEBP", quality=92, method=4)

    for folder, (w, h) in splash_by_folder.items():
        d = res / folder
        if not d.is_dir():
            continue
        icon_rgb.resize((w, h), Image.Resampling.LANCZOS).save(d / "splashscreen_logo.png", "PNG", optimize=True)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    assets = root / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    default_src = assets / "brand-logo-source.png"
    src_path = Path(sys.argv[1]) if len(sys.argv) > 1 else default_src
    if not src_path.is_file():
        print(f"Kaynak bulunamadı: {src_path}", file=sys.stderr)
        sys.exit(1)

    src = Image.open(src_path)

    # Tek tam dolu kare — Expo icon + adaptive foreground aynı (küçültme yok)
    icon_rgba = cover_square(src, SIZE, ADAPTIVE_BG_RGB)
    icon_rgb = icon_rgba.convert("RGB")

    icon_rgb.save(assets / "icon.png", "PNG", optimize=True)
    icon_rgb.save(assets / "splash-icon.png", "PNG", optimize=True)
    icon_rgba.save(assets / "adaptive-icon.png", "PNG", optimize=True)
    icon_rgb.resize((48, 48), Image.Resampling.LANCZOS).save(assets / "favicon.png", "PNG", optimize=True)

    sync_android_native(root, icon_rgba)

    print("OK — logo tam boy uygulandı (kırp + doldur):")
    print(" ", assets / "icon.png")
    print(" ", assets / "adaptive-icon.png")
    if (root / "android").is_dir():
        print(" ", "android mipmap güncellendi")


if __name__ == "__main__":
    main()
