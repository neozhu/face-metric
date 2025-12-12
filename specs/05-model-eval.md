# Model Evaluation & Selection

## Goal
Select a strong default face recognition model and thresholds for similarity mapping.

## MVP strategy
- Default: `ArcFace`
- Fallback: `Facenet512`
- Metric: cosine distance
- Thresholds stored in config.

## Optional evaluation script
- Location: `apps/api/scripts/eval_models.py`
- Input: small validation set with same‑person and different‑person pairs.
- Output:
  - ROC/AUC
  - TAR@FAR
  - Recommended thresholds per model.

## Notes
- If using public datasets (e.g., LFW), keep them out of repo and document download steps.
- Re‑evaluate thresholds after changing detector/backbone.

