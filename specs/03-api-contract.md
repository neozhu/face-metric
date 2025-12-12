# API Contract

Base path: `/v1`

## `POST /compare`

**Request**
- Content type: `multipart/form-data`
- Fields:
  - `image_a`: file (required)
  - `image_b`: file (required)
  - `options`: JSON string (optional)

Example `options`:
```json
{
  "metric": "cosine",
  "models": ["ArcFace", "Facenet512"]
}
```

**Success response (200)**
```json
{
  "similarity": 0.87,
  "confidence": 0.72,
  "model": "ArcFace",
  "distance": 0.43,
  "faceDetected": { "a": true, "b": true },
  "hint": "High match. Frontal faces, good lighting."
}
```

**Failure responses**
- 400 `unsupported_file_type`
- 413 `file_too_large`
- 422 `no_face_detected` (includes which side failed)
- 500 `inference_error`

Example 422:
```json
{
  "error": "no_face_detected",
  "message": "No face detected in image_b",
  "faceDetected": { "a": true, "b": false }
}
```
