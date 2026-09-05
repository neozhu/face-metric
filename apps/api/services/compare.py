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


def represent_face(image: np.ndarray, model_name: str, skip_detector: bool = False) -> np.ndarray:
    reps = None
    if skip_detector:
        try:
            reps = DeepFace.represent(
                img_path=image,
                model_name=model_name,
                detector_backend="skip",
                enforce_detection=False,
                align=False,
                normalization="base",
            )
            if reps and len(reps) > 0 and "embedding" in reps[0]:
                return np.array(reps[0]["embedding"], dtype=np.float32)
        except Exception:
            pass  # Fallback to standard detector pipeline below

    try:
        reps = DeepFace.represent(
            img_path=image,
            model_name=model_name,
            detector_backend=settings.detector_backend,
            enforce_detection=True,
            align=True,
            normalization="base",
        )
    except Exception:
        try:
            reps = DeepFace.represent(
                img_path=image,
                model_name=model_name,
                detector_backend="opencv",
                enforce_detection=True,
                align=True,
                normalization="base",
            )
        except Exception as e:
            raise CompareError("no_face_detected", "No face detected") from e

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


def calculate_resemblance_score(raw_distance: float) -> float:
    """
    Calibrates raw cosine distance into human-intuitive facial resemblance percentage.
    Uses monotonic interpolation anchored on empirical face verification data:
    - Same person / twins: <= 0.35 -> 94%~98%
    - Close kinship (parent-child, full siblings): 0.65~0.78 -> 60%~78%
    - Distant resemblance / archetype: 0.82 -> ~48%
    - Random strangers: >= 0.92 -> 8%~22%
    """
    x_dist = [0.20, 0.35, 0.50, 0.65, 0.74, 0.82, 0.92, 1.05, 1.20]
    y_score = [0.98, 0.94, 0.86, 0.76, 0.66, 0.48, 0.22, 0.08, 0.02]
    return float(np.interp(raw_distance, x_dist, y_score))


def get_resemblance_details(score: float, distance: float) -> tuple[str, list[str], str]:
    if score >= 0.88:
        level = "Remarkable Likeness · Near Twin"
        tags = ["Striking Resemblance", "Identical Contours", "Matching Eyes"]
        verdict = "These two faces share an extraordinary degree of resemblance across facial structure, eye geometry, and expression. They look remarkably alike!"
    elif score >= 0.72:
        level = "Strong Family Likeness"
        tags = ["Expressive Eyes", "Harmonious Contours", "Family Traits"]
        verdict = "There is an unmistakable, prominent family likeness between these two faces. The eye shape, brow lines, and facial framework exhibit strong genetic harmony."
    elif score >= 0.55:
        level = "Noticeable Resemblance"
        tags = ["Shared Expression", "Similar Jawline", "Familiar Charm"]
        verdict = "The two faces show noticeable similarities in eye contours, smile expression, or facial structure, conveying an endearing sense of familial familiarity."
    elif score >= 0.38:
        level = "Subtle Likeness · Unique Charm"
        tags = ["Distinct Features", "Partial Symmetry", "Individual Styles"]
        verdict = "Both individuals possess their own distinct facial profiles and personal charm, with subtle resemblance in select areas such as the smile or jawline."
    else:
        level = "Distinct Profiles · Unique Looks"
        tags = ["Independent Features", "Contrasting Contours", "Unique Identity"]
        verdict = "The two faces feature clearly distinct facial frameworks, proportions, and bone structures, each possessing an entirely unique appearance."

    return level, tags, verdict


@dataclass
class CompareResult:
    similarity: float
    confidence: float
    model: str
    distance: float
    threshold: float
    face_detected: dict[str, bool]
    hint: str
    level: str
    tags: list[str]
    verdict: str


def iter_models(options: dict[str, Any]) -> Iterable[str]:
    models = options.get("models")
    if isinstance(models, list) and models:
        return [str(m) for m in models]
    return [settings.default_model, *settings.fallback_models]


def compare_faces(image_a: np.ndarray, image_b: np.ndarray, options: dict[str, Any]) -> CompareResult:
    face_detected = {"a": False, "b": False}
    last_error: Exception | None = None
    distances: list[tuple[str, float]] = []

    skip_det = bool(options.get("cropped", False))

    for model_name in iter_models(options):
        try:
            emb_a = represent_face(image_a, model_name, skip_detector=skip_det)
            face_detected["a"] = True
            emb_b = represent_face(image_b, model_name, skip_detector=skip_det)
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
    fused_distance = float(np.mean([d for _, d in distances]))
    similarity = calculate_resemblance_score(fused_distance)
    confidence = similarity
    model_label = "+".join([m for m, _ in distances])
    level, tags, verdict = get_resemblance_details(similarity, fused_distance)

    return CompareResult(
        similarity=similarity,
        confidence=confidence,
        model=model_label,
        distance=fused_distance,
        threshold=0.0,
        face_detected=face_detected,
        hint=verdict,
        level=level,
        tags=tags,
        verdict=verdict,
    )
