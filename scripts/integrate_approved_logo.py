"""
Onaylanan Planly logosunu assets/ + android/ içine yazar.
Kaynak: assets/logo-proposals/planly-logo-proposal-v1-icon.jpg (veya argüman).

Çalıştır: python scripts/integrate_approved_logo.py
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    integrator = root / "scripts" / "integrate_approved_logo_proposal.py"
    if not integrator.is_file():
        print("integrate_approved_logo_proposal.py bulunamadi", file=sys.stderr)
        sys.exit(1)
    result = subprocess.run([sys.executable, str(integrator), *sys.argv[1:]], cwd=str(root))
    if result.returncode != 0:
        sys.exit(result.returncode)


if __name__ == "__main__":
    main()
