# Face Compare API

FastAPI service that compares two face images using DeepFace embeddings.

## Run (from repo root)
```bash
python --version  # recommend Python 3.11.x
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r apps/api/requirements.txt
uvicorn apps.api.main:app --reload --port 8000
```

## Endpoint
- `POST /v1/compare` with `multipart/form-data` fields `image_a`, `image_b`, optional `options`.

## Privacy
- Images are processed in memory and not written to disk by this service.
- Do not enable request body logging in production.

## Windows notes
- If you see an error about `tf_keras` when importing DeepFace, install requirements again; `tf-keras` is included.
