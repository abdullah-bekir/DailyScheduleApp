"""
Onaylanan Planly v4 mağaza logosunu assets/ + android/ içine yazar.
Kaynak: scripts/generate_planly_professional_logo.py (vektör — net, tekrarlanabilir).

Çalıştır: python scripts/integrate_approved_logo.py
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    gen = root / "scripts" / "generate_planly_p_monogram_logo.py"
    if not gen.is_file():
        print("generate_planly_professional_logo.py bulunamadi", file=sys.stderr)
        sys.exit(1)
    result = subprocess.run([sys.executable, str(gen)], cwd=str(root))
    if result.returncode != 0:
        sys.exit(result.returncode)
    print("OK — Onayli Planly v4 logosu entegre edildi.")


if __name__ == "__main__":
    main()
