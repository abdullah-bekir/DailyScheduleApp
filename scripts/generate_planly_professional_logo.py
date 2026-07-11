"""
Planly — onaylanan v4 mağaza ikonu (vektör, net kenarlar).
Günlük plan kartı + P monogram + tamamlama rozeti.

Çalıştır: python scripts/generate_planly_professional_logo.py
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024

# v4 onayli palet
BG_TOP = (26, 27, 35)
BG_BOTTOM = (5, 5, 6)
BRAND = (61, 62, 68)
ON_BRAND = (250, 250, 250)
CARD = (255, 255, 255)
CARD_LINE = (228, 228, 231)
CARD_LINE_SOFT = (212, 212, 216)
ACCENT = (34, 197, 94)
ACCENT_RING = (255, 255, 255)
SPLASH_BG = (242, 242, 244)
ADAPTIVE_BG = (30, 31, 35)  # app.json android.adaptiveIcon.backgroundColor
CARD_SCALE = 1.16


def _lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def radial_background(size: int) -> Image.Image:
    """Diagonal premium gradient — Play/App Store vitrininde derinlik."""
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            tx = x / max(1, size - 1)
            ty = y / max(1, size - 1)
            t = min(1.0, (tx * 0.35 + ty * 0.65) ** 0.92)
            r = _lerp(BG_TOP[0], BG_BOTTOM[0], t)
            g = _lerp(BG_TOP[1], BG_BOTTOM[1], t)
            b = _lerp(BG_TOP[2], BG_BOTTOM[2], t)
            cx, cy = (size - 1) / 2.0, (size - 1) / 2.0
            d = math.hypot(x - cx, y - cy) / math.hypot(cx, cy)
            vignette = 1.0 - 0.22 * (d ** 1.35)
            px[x, y] = (
                max(0, min(255, int(r * vignette))),
                max(0, min(255, int(g * vignette))),
                max(0, min(255, int(b * vignette))),
            )
    return img


def add_specular_highlight(base: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = base.size
    draw.ellipse((int(w * 0.06), int(h * -0.28), int(w * 0.94), int(h * 0.38)), fill=(255, 255, 255, 38))
    draw.ellipse((int(w * 0.55), int(h * 0.62), int(w * 1.08), int(h * 1.12)), fill=(0, 0, 0, 28))
    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def draw_stylized_p(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float, fill, hole_fill=BRAND) -> None:
    """Header içinde soyut P — profesyonel monogram hissi."""
    s = scale
    stem_w = int(14 * s)
    stem_h = int(52 * s)
    bowl_r = int(22 * s)
    draw.rounded_rectangle((x, y, x + stem_w, y + stem_h), radius=int(7 * s), fill=fill)
    draw.ellipse(
        (x + stem_w - int(4 * s), y, x + stem_w + bowl_r * 2, y + bowl_r * 2),
        fill=fill,
    )
    inner = int(10 * s)
    draw.ellipse(
        (
            x + stem_w - int(4 * s) + inner,
            y + inner,
            x + stem_w + bowl_r * 2 - inner,
            y + bowl_r * 2 - inner,
        ),
        fill=hole_fill,
    )


def draw_plan_card(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    scale: float,
    *,
    card_fill,
    header_fill,
    line_fill,
    line_soft,
    accent_fill,
    check_fill,
    show_shadow: bool = False,
) -> None:
    s = scale
    cw = int(392 * s)
    ch = int(460 * s)
    r = int(58 * s)
    x0 = cx - cw // 2
    y0 = cy - ch // 2 + int(6 * s)

    if show_shadow:
        sh = int(18 * s)
        draw.rounded_rectangle(
            (x0 + sh, y0 + sh, x0 + cw + sh, y0 + ch + sh),
            radius=r,
            fill=(0, 0, 0, 52) if isinstance(card_fill, tuple) and len(card_fill) == 4 else (12, 12, 14),
        )

    draw.rounded_rectangle((x0, y0, x0 + cw, y0 + ch), radius=r, fill=card_fill)

    header_h = int(96 * s)
    draw.rounded_rectangle((x0, y0, x0 + cw, y0 + header_h + r), radius=r, fill=header_fill)
    draw.rectangle((x0, y0 + header_h, x0 + cw, y0 + header_h + int(10 * s)), fill=header_fill)

    hole = header_fill if isinstance(header_fill, tuple) and len(header_fill) == 3 else BRAND
    draw_stylized_p(draw, x0 + int(36 * s), y0 + int(22 * s), s * 0.95, ON_BRAND, hole)

    dot_y = y0 + int(48 * s)
    dot_r = int(6 * s)
    for dx in (0.68, 0.78, 0.88):
        dxp = x0 + int(cw * dx)
        draw.ellipse((dxp - dot_r, dot_y - dot_r, dxp + dot_r, dot_y + dot_r), fill=ON_BRAND)

    line_x = x0 + int(46 * s)
    line_w = cw - int(92 * s)
    line_h = int(17 * s)
    line_r = int(9 * s)
    gaps = (int(168 * s), int(234 * s), int(300 * s))

    for i, gy in enumerate(gaps):
        ly = y0 + gy
        if i == 2:
            lw = int(line_w * 0.58)
            draw.rounded_rectangle(
                (line_x, ly, line_x + lw, ly + line_h),
                radius=line_r,
                fill=accent_fill,
            )
            chk = int(8 * s)
            draw.line(
                [
                    (line_x + int(10 * s), ly + line_h // 2),
                    (line_x + int(18 * s), ly + line_h // 2 + chk),
                    (line_x + int(32 * s), ly + line_h // 2 - chk),
                ],
                fill=ON_BRAND if len(accent_fill) == 4 else ON_BRAND,
                width=max(3, int(4 * s)),
                joint="curve",
            )
        elif i == 0:
            draw.rounded_rectangle(
                (line_x, ly, line_x + int(line_w * 0.88), ly + line_h),
                radius=line_r,
                fill=line_fill,
            )
        else:
            draw.rounded_rectangle(
                (line_x, ly, line_x + line_w, ly + line_h),
                radius=line_r,
                fill=line_soft,
            )

    badge_r = int(64 * s)
    bx = x0 + cw - int(34 * s)
    by = y0 + ch - int(46 * s)
    draw.ellipse((bx - badge_r - 2, by - badge_r - 2, bx + badge_r + 2, by + badge_r + 2), fill=(0, 0, 0, 40) if show_shadow else (20, 20, 22))
    draw.ellipse((bx - badge_r, by - badge_r, bx + badge_r, by + badge_r), fill=ACCENT_RING)
    draw.ellipse(
        (bx - badge_r + int(7 * s), by - badge_r + int(7 * s), bx + badge_r - int(7 * s), by + badge_r - int(7 * s)),
        fill=accent_fill,
    )
    tick_w = max(6, int(12 * s))
    draw.line(
        [
            (bx - int(24 * s), by + int(2 * s)),
            (bx - int(8 * s), by + int(18 * s)),
            (bx + int(26 * s), by - int(18 * s)),
        ],
        fill=check_fill,
        width=tick_w,
        joint="curve",
    )


def compose_mark_layer(*, transparent: bool, scale: float = CARD_SCALE) -> Image.Image:
    if transparent:
        img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    else:
        img = radial_background(SIZE)
        img = add_specular_highlight(img)

    draw = ImageDraw.Draw(img)
    cx, cy = SIZE // 2, SIZE // 2

    card = CARD + (255,) if transparent else CARD
    header = BRAND + (255,) if transparent else BRAND
    lines = CARD_LINE + (255,) if transparent else CARD_LINE
    lines_soft = CARD_LINE_SOFT + (255,) if transparent else CARD_LINE_SOFT
    accent_line = ACCENT + (255,) if transparent else ACCENT

    draw_plan_card(
        draw,
        cx,
        cy,
        scale,
        card_fill=card,
        header_fill=header,
        line_fill=lines,
        line_soft=lines_soft,
        accent_fill=accent_line,
        check_fill=ON_BRAND + (255,) if transparent else ON_BRAND,
        show_shadow=transparent,
    )
    return img


def compose_full_icon() -> Image.Image:
    return compose_mark_layer(transparent=False).convert("RGB")


def compose_adaptive_foreground() -> Image.Image:
    """Tam ikon — arka plan app.json #1E1F23 ile uyumlu."""
    return compose_full_icon().convert("RGBA")


def compose_splash_icon() -> Image.Image:
    bg = Image.new("RGB", (SIZE, SIZE), SPLASH_BG)
    tile = int(SIZE * 0.46)
    mark = compose_full_icon().resize((tile, tile), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (tile + 48, tile + 48), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((24, 28, tile + 24, tile + 28), radius=36, fill=(15, 23, 42, 32))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    x = (SIZE - tile) // 2
    y = (SIZE - tile) // 2 - int(SIZE * 0.02)
    bg.paste(shadow, (x - 24, y - 20), shadow)
    bg.paste(mark, (x, y))
    return bg


def sync_android_native(root: Path, icon_rgb: Image.Image, icon_rgba: Image.Image) -> None:
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

    splash_rgb = compose_splash_icon()

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
        if d.is_dir():
            splash_rgb.resize((w, h), Image.Resampling.LANCZOS).save(d / "splashscreen_logo.png", "PNG", optimize=True)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    assets = root / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    icon_rgb = compose_full_icon()
    adaptive_rgba = compose_adaptive_foreground()
    splash_rgb = compose_splash_icon()

    icon_rgb.save(assets / "icon.png", "PNG", optimize=True)
    adaptive_rgba.save(assets / "adaptive-icon.png", "PNG", optimize=True)
    splash_rgb.save(assets / "splash-icon.png", "PNG", optimize=True)
    icon_rgb.resize((48, 48), Image.Resampling.LANCZOS).save(assets / "favicon.png", "PNG", optimize=True)
    icon_rgb.save(assets / "brand-logo-source.png", "PNG", optimize=True)

    sync_android_native(root, icon_rgb, adaptive_rgba)

    print("OK — Planly v4 mağaza ikonu entegre edildi:")
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
