from __future__ import annotations

import cv2
import numpy as np

from .compare import CompareError, DeepFace
from ..config import settings


def _resize_max_side(image: np.ndarray, max_side: int) -> tuple[np.ndarray, float]:
    h, w = image.shape[:2]
    longest = max(h, w)
    if longest <= max_side:
        return image, 1.0
    scale = max_side / float(longest)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized, scale


def _expand_xywh(x: int, y: int, w: int, h: int, expand_ratio: float, img_w: int, img_h: int) -> tuple[int, int, int, int]:
    cx = x + w / 2.0
    cy = y + h / 2.0
    new_w = w * (1.0 + expand_ratio)
    new_h = h * (1.0 + expand_ratio)
    x0 = int(np.floor(cx - new_w / 2.0))
    y0 = int(np.floor(cy - new_h / 2.0))
    x1 = int(np.ceil(cx + new_w / 2.0))
    y1 = int(np.ceil(cy + new_h / 2.0))
    x0 = max(0, min(x0, img_w))
    y0 = max(0, min(y0, img_h))
    x1 = max(0, min(x1, img_w))
    y1 = max(0, min(y1, img_h))
    if x1 <= x0 or y1 <= y0:
        raise CompareError("no_face_detected", "Invalid face crop region")
    return x0, y0, x1, y1


def _adjust_box_to_aspect(
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    *,
    aspect_w: int,
    aspect_h: int,
    img_w: int,
    img_h: int,
) -> tuple[int, int, int, int]:
    w = x1 - x0
    h = y1 - y0
    if w <= 0 or h <= 0:
        raise CompareError("no_face_detected", "Invalid face crop region")

    target_aspect = float(aspect_w) / float(aspect_h)
    cur_aspect = float(w) / float(h)

    if cur_aspect >= target_aspect:
        desired_w = w
        desired_h = int(np.ceil(desired_w / target_aspect))
    else:
        desired_h = h
        desired_w = int(np.ceil(desired_h * target_aspect))

    desired_w = min(desired_w, img_w)
    desired_h = min(desired_h, img_h)

    cx = (x0 + x1) / 2.0
    cy = (y0 + y1) / 2.0
    nx0 = int(np.floor(cx - desired_w / 2.0))
    ny0 = int(np.floor(cy - desired_h / 2.0))
    nx1 = nx0 + desired_w
    ny1 = ny0 + desired_h

    if nx0 < 0:
        nx1 -= nx0
        nx0 = 0
    if ny0 < 0:
        ny1 -= ny0
        ny0 = 0
    if nx1 > img_w:
        dx = nx1 - img_w
        nx0 -= dx
        nx1 = img_w
    if ny1 > img_h:
        dy = ny1 - img_h
        ny0 -= dy
        ny1 = img_h

    nx0 = max(0, min(nx0, img_w))
    ny0 = max(0, min(ny0, img_h))
    nx1 = max(0, min(nx1, img_w))
    ny1 = max(0, min(ny1, img_h))
    if nx1 <= nx0 or ny1 <= ny0:
        raise CompareError("no_face_detected", "Invalid face crop region")
    return nx0, ny0, nx1, ny1


def preprocess_face_crop_jpeg(
    image: np.ndarray,
    *,
    det_max_side: int = 1280,
    crop_max_side: int = 1280,
    expand_ratio: float = 0.20,
    jpeg_quality: int = 92,
) -> bytes:
    img_det, det_scale = _resize_max_side(image, det_max_side)

    faces = DeepFace.extract_faces(
        img_path=img_det,
        detector_backend=settings.detector_backend,
        enforce_detection=True,
        align=True,
    )
    if not faces:
        raise CompareError("no_face_detected", "No face detected")

    best = None
    best_area = -1
    for f in faces:
        fa = f.get("facial_area") or {}
        x, y, w, h = int(fa.get("x", 0)), int(fa.get("y", 0)), int(fa.get("w", 0)), int(fa.get("h", 0))
        area = w * h
        if area > best_area:
            best_area = area
            best = (x, y, w, h)

    if not best or best_area <= 0:
        raise CompareError("no_face_detected", "No face detected")

    det_h, det_w = img_det.shape[:2]
    x0, y0, x1, y1 = _expand_xywh(best[0], best[1], best[2], best[3], expand_ratio, det_w, det_h)

    inv = 1.0 / det_scale if det_scale > 0 else 1.0
    src_h, src_w = image.shape[:2]
    sx0 = int(np.floor(x0 * inv))
    sy0 = int(np.floor(y0 * inv))
    sx1 = int(np.ceil(x1 * inv))
    sy1 = int(np.ceil(y1 * inv))
    sx0 = max(0, min(sx0, src_w))
    sy0 = max(0, min(sy0, src_h))
    sx1 = max(0, min(sx1, src_w))
    sy1 = max(0, min(sy1, src_h))
    if sx1 <= sx0 or sy1 <= sy0:
        raise CompareError("no_face_detected", "Invalid face crop region")

    sx0, sy0, sx1, sy1 = _adjust_box_to_aspect(
        sx0,
        sy0,
        sx1,
        sy1,
        aspect_w=1,
        aspect_h=1,
        img_w=src_w,
        img_h=src_h,
    )

    crop = image[sy0:sy1, sx0:sx1]
    crop, _ = _resize_max_side(crop, crop_max_side)

    ok, buf = cv2.imencode(".jpg", crop, [int(cv2.IMWRITE_JPEG_QUALITY), int(jpeg_quality)])
    if not ok:
        raise CompareError("inference_error", "Failed to encode crop")
    return buf.tobytes()
