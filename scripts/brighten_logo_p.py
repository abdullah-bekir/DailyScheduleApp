"""v1 ikonda P gövdesini daha açık beyaza çeker; koyu arka plan ve iç işaretleri korur."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/logo-proposals/planly-logo-proposal-v1-icon.jpg"
OUT = ROOT / "assets/logo-proposals/planly-logo-v1-bright-p.jpg"


def lum(r: int, g: int, b: int) -> float:
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def brighten_p(im: Image.Image) -> Image.Image:
    rgb = im.convert("RGB")
    out = rgb.copy()
    px = rgb.load()
    opx = out.load()
    w, h = rgb.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            L = lum(r, g, b)
            if L < 55:
                continue
            if L >= 115:
                # P gövdesi (açık gri) → parlak beyaz; iç check (85–115) dokunulmaz
                t = min(1.0, (L - 115) / 75)
                target = 255
                boost = 0.75 + 0.25 * t
                nr = int(r + (target - r) * boost)
                ng = int(g + (target - g) * boost)
                nb = int(b + (target - b) * boost)
                opx[x, y] = (min(255, nr), min(255, ng), min(255, nb))
            elif L >= 85:
                # İç check / gölge — hafif dokunuş, koyu kalsın
                opx[x, y] = (r, g, b)
    return out


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else SRC
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else OUT
    if not src.is_file():
        raise SystemExit(f"Kaynak yok: {src}")
    img = brighten_p(Image.open(src))
    img.save(out, "JPEG", quality=95)
    print(out)


if __name__ == "__main__":
    main()
