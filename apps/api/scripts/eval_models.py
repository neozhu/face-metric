from __future__ import annotations

import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Evaluate DeepFace models on a small validation set.")
    parser.add_argument("--pairs", type=Path, required=True, help="CSV with columns: path_a,path_b,label(1=same,0=diff)")
    parser.add_argument("--out", type=Path, default=Path("eval_results.json"))
    args = parser.parse_args()

    raise SystemExit(
        "Stub script. Implement by loading pairs, computing distances per model, and exporting ROC/AUC + thresholds."
    )


if __name__ == "__main__":
    main()

