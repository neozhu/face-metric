# Architecture

## High level
- `apps/web` (Next.js) provides UI and calls backend.
- `apps/api` (FastAPI) receives two images and runs DeepFace.

## Data flow
1. Browser sends `multipart/form-data` with `image_a`, `image_b`.
2. API loads bytes into memory, decodes to numpy arrays.
3. API detects faces, computes embeddings, chooses best model.
4. API returns similarity, confidence, and hint.

## Privacy & storage
- Images processed in memory only; no persistence to disk.
- No request images stored in logs.
- If temporary files ever become necessary, they must be deleted before response and the UI copy updated.

## Constraints & limits
- Max image size: 6MB each.
- Allowed types: `jpg`, `jpeg`, `png`, `webp`.
- Request timeout target: 10s; use a worker/thread pool if needed.
- CORS restricted to web app origin in production.

## Security notes
- Enforce content type + size checks.
- Set standard security headers on web.
- Optional: rate limiting on `/v1/compare`.

