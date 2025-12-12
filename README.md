# Face Metric

Face Metric is a dark‑first web app that compares two face images and returns a single similarity score.

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
