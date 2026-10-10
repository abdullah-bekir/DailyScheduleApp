"""
Onaylanan logo taslağını (JPG/PNG) Expo assets + Android native içine yazar.

Varsayılan kaynak: assets/logo-proposals/planly-logo-proposal-v1-icon.jpg

  python scripts/integrate_approved_logo_proposal.py
  python scripts/integrate_approved_logo_proposal.py path/to/source.jpg
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024
SPLASH_BG = (242, 242, 244)
DEFAULT_SRC = "assets/logo-proposals/planly-logo-proposal-v1-icon.jpg"


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
        splash_rgb.resize((w, h), Image.Resampling.LANCZOS).save(d / "splashscreen_logo.png", "PNG", optimize=True)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    assets = root / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    rel = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    src_path = Path(rel) if Path(rel).is_absolute() else root / rel
    if not src_path.is_file():
        print(f"Kaynak bulunamadi: {src_path}", file=sys.stderr)
        sys.exit(1)

    raw = Image.open(src_path).convert("RGB")
    icon_rgb = raw.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    icon_rgba = icon_rgb.convert("RGBA")
    splash_rgb = compose_splash(icon_rgb)

    icon_rgb.save(assets / "icon.png", "PNG", optimize=True)
    icon_rgba.save(assets / "adaptive-icon.png", "PNG", optimize=True)
    splash_rgb.save(assets / "splash-icon.png", "PNG", optimize=True)
    icon_rgb.resize((48, 48), Image.Resampling.LANCZOS).save(assets / "favicon.png", "PNG", optimize=True)
    icon_rgb.save(assets / "brand-logo-source.png", "PNG", optimize=True)
    icon_rgb.resize((512, 512), Image.Resampling.LANCZOS).save(assets / "play-icon-512.png", "PNG", optimize=True)

    sync_android_native(root, icon_rgb, splash_rgb)

    print("OK — onayli logo entegre edildi:")
    print(" ", assets / "icon.png")
    print(" ", assets / "adaptive-icon.png")
    print(" ", assets / "splash-icon.png")
    print(" ", assets / "brand-logo-source.png")
    print(" ", assets / "play-icon-512.png")
    if (root / "android").is_dir():
        print(" ", "android mipmap + splash guncellendi")


if __name__ == "__main__":
    main()
