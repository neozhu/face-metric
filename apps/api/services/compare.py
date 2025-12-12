from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Iterable

import cv2
import numpy as np

try:
    from deepface import DeepFace
except Exception as e:  # pragma: no cover
    raise ImportError(
        "DeepFace dependencies failed to import. "
        "On Windows, use Python 3.11 with `tensorflow-cpu` and `numpy<2`. "
        "Recreate your venv and reinstall apps/api/requirements.txt."
    ) from e

from ..config import settings


class CompareError(Exception):
    def __init__(self, code: str, message: str, face_detected: dict[str, bool] | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.face_detected = face_detected or {"a": False, "b": False}


def validate_content_type(content_type: str | None) -> None:
    if content_type is None or content_type.lower() not in settings.allowed_types:
        raise CompareError("unsupported_file_type", "Unsupported image type")


def validate_size(byte_len: int) -> None:
    if byte_len > settings.max_file_mb * 1024 * 1024:
        raise CompareError("file_too_large", f"Image exceeds {settings.max_file_mb}MB limit")


def decode_image(data: bytes) -> np.ndarray:
    arr = np.frombuffer(data, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise CompareError("unsupported_file_type", "Failed to decode image")
    return img


def cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    a = a.astype(np.float32)
    b = b.astype(np.float32)
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-8
    return float(1.0 - np.dot(a, b) / denom)


def represent_face(image: np.ndarray, model_name: str) -> np.ndarray:
    reps = DeepFace.represent(
        img_path=image,
        model_name=model_name,
        detector_backend=settings.detector_backend,
        enforce_detection=True,
        align=True,
        normalization="base",
    )
    if not reps:
        raise CompareError("no_face_detected", "No face detected")
    return np.array(reps[0]["embedding"], dtype=np.float32)


def parse_options(options: str | None) -> dict[str, Any]:
    if not options:
        return {}
    try:
        return json.loads(options)
    except Exception:
        return {}


@dataclass
class CompareResult:
    similarity: float
    confidence: float
    model: str
    distance: float
    threshold: float
    face_detected: dict[str, bool]
    hint: str


def hint_for(similarity: float) -> str:
    if similarity >= 0.9:
        return "Very high match. Great alignment and lighting."
    if similarity >= 0.75:
        return "High match. Frontal faces help confidence."
    if similarity >= 0.55:
        return "Possible match. Try clearer, frontal shots."
    return "Low match. Different identities likely."


def iter_models(options: dict[str, Any]) -> Iterable[str]:
    models = options.get("models")
    if isinstance(models, list) and models:
        return [str(m) for m in models]
    return [settings.default_model, *settings.fallback_models]


def compare_faces(image_a: np.ndarray, image_b: np.ndarray, options: dict[str, Any]) -> CompareResult:
    face_detected = {"a": False, "b": False}
    last_error: Exception | None = None
    distances: list[tuple[str, float]] = []

    for model_name in iter_models(options):
        try:
            emb_a = represent_face(image_a, model_name)
            face_detected["a"] = True
            emb_b = represent_face(image_b, model_name)
            face_detected["b"] = True

            distance = cosine_distance(emb_a, emb_b)
            distances.append((model_name, distance))
        except CompareError as e:
            last_error = e
            if e.code == "no_face_detected":
                raise CompareError(
                    "no_face_detected",
                    f"No face detected in {'image_a' if not face_detected['a'] else 'image_b'}",
                    face_detected=face_detected,
                )
        except Exception as e:
            last_error = e
            continue

    if not distances:
        raise CompareError("inference_error", "Failed to compare faces", face_detected=face_detected) from last_error

    # Multi-model fusion: average cosine distances from all successful models.
    # This keeps output continuous and more stable for age gaps / kinship cases.
    fused_distance = float(np.mean([d for _, d in distances]))
    similarity = max(0.0, min(1.0, 1.0 - fused_distance))
    confidence = similarity
    model_label = "+".join([m for m, _ in distances])

    return CompareResult(
        similarity=similarity,
        confidence=confidence,
        model=model_label,
        distance=fused_distance,
        threshold=0.0,
        face_detected=face_detected,
        hint=hint_for(similarity),
    )
