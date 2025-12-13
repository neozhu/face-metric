[![CI](https://github.com/neozhu/face-metric/actions/workflows/ci.yml/badge.svg)](https://github.com/neozhu/face-metric/actions/workflows/ci.yml)

# Face Metric

Face Metric is a dark‑first web app that compares two face images and returns a single similarity score.

## Built with Codex (GPT-5.2)
This project was developed with the help of Codex CLI using the GPT‑5.2 model: scaffolding, implementation, and iteration were done through agent-assisted coding. Please review the code and run the app in your own environment before relying on it in production.

![](/test/result.png)

## Structure
```
apps/
  web/   Next.js UI
  api/   FastAPI service
specs/   Product + engineering specs
```

## What it does
- Upload (or capture) two face photos
- Click **Compare**
- See an animated score ring + similarity % (no “same/different” thresholding)

## How the comparison score works (backend algorithm)
The API returns a continuous similarity score computed from face embeddings (not a hard identity decision):

1. **Decode & validate**: images are validated for type/size and decoded in memory.
2. **Detect & align faces**: DeepFace runs face detection (default backend: RetinaFace) and alignment (`enforce_detection=True`, `align=True`).
3. **Embed**: each face is converted into a fixed-length embedding vector using one or more DeepFace models (default: `ArcFace`, fallback: `Facenet512`).
4. **Distance**: the service computes **cosine distance** between the two embeddings for each successful model.
5. **Fusion (multi-model)**: if multiple models succeed, it averages their cosine distances for a more stable score.
6. **Similarity mapping**: `similarity = clamp(1 - fused_distance, 0..1)` and the UI renders it as a percentage.

Notes:
- No verification threshold is applied by default; the output is meant to stay continuous.
- If a face is not detected in either image, the API returns an error instead of guessing.

## Privacy
- Images are processed in memory for the current request only.
- The API does not persist uploads to disk.

## Run locally (recommended)

### Prereqs
- Node.js 20+
- Python 3.11 (DeepFace/TensorFlow is most stable on 3.11)

### API
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r apps/api/requirements.txt
uvicorn apps.api.main:app --reload --port 8000
```

### Web
```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Docker (single image, single port)
No env vars required. Only the web port is exposed; the API is accessed internally.

```bash
docker compose up --build
```

Open `http://localhost:3000`.

## Quick backend test
If you have local test images:

```bash
python apps/api/scripts/quick_compare.py test/Tom.png test/Suri.png
```
