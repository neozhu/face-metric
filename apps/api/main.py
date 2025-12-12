from __future__ import annotations

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .services.compare import (
    CompareError,
    compare_faces,
    decode_image,
    parse_options,
    validate_content_type,
    validate_size,
)


app = FastAPI(title="Face Compare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.post("/v1/compare")
async def compare(
    image_a: UploadFile = File(...),
    image_b: UploadFile = File(...),
    options: str | None = Form(None),
):
    try:
        validate_content_type(image_a.content_type)
        validate_content_type(image_b.content_type)

        data_a = await image_a.read()
        data_b = await image_b.read()
        validate_size(len(data_a))
        validate_size(len(data_b))

        img_a = decode_image(data_a)
        img_b = decode_image(data_b)

        result = compare_faces(img_a, img_b, parse_options(options))

        return {
            "similarity": round(result.similarity, 4),
            # Keep extra fields for UI, but no thresholding is applied.
            "confidence": round(result.confidence, 4),
            "model": result.model,
            "distance": round(result.distance, 4),
            "faceDetected": result.face_detected,
            "hint": result.hint,
        }
    except CompareError as e:
        status = {
            "unsupported_file_type": 400,
            "file_too_large": 413,
            "no_face_detected": 422,
            "inference_error": 500,
        }.get(e.code, 400)
        raise HTTPException(status_code=status, detail={"error": e.code, "message": e.message, "faceDetected": e.face_detected})


@app.get("/health")
def health():
    return {"ok": True}
