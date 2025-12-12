from __future__ import annotations

from pydantic import BaseModel


class Settings(BaseModel):
    max_file_mb: int = 6
    allowed_types: set[str] = {"image/jpeg", "image/png", "image/webp"}

    default_model: str = "ArcFace"
    fallback_models: list[str] = ["Facenet512"]
    metric: str = "cosine"

    thresholds: dict[str, float] = {
        "ArcFace": 0.68,
        "Facenet512": 0.30,
    }

    detector_backend: str = "retinaface"


settings = Settings()
