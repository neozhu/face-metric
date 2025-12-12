from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow running as a script from repo root without installing a package.
ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from apps.api.services.compare import compare_faces, decode_image  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="Quick compare two images and print similarity.")
    parser.add_argument("image_a", type=Path)
    parser.add_argument("image_b", type=Path)
    args = parser.parse_args()

    img_a = decode_image(args.image_a.read_bytes())
    img_b = decode_image(args.image_b.read_bytes())

    result = compare_faces(img_a, img_b, options={})
    print(f"similarity={result.similarity:.4f} model={result.model} fused_distance={result.distance:.4f}")


if __name__ == "__main__":
    main()
