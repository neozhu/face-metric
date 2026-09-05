[![CI](https://github.com/neozhu/face-metric/actions/workflows/ci.yml/badge.svg)](https://github.com/neozhu/face-metric/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?logo=next.js)](https://nextjs.org/)
[![DeepFace](https://img.shields.io/badge/DeepFace-0.0.100-blue)](https://github.com/serengil/deepface)
[![Python](https://img.shields.io/badge/Python-3.11-yellow?logo=python)](https://www.python.org/)

# Face Metric

**Face Metric** is a modern, dark-first web application designed to evaluate facial resemblance and kinship likeness between two different people (such as parent-child, relatives, siblings, or couples).

Instead of treating comparison like a binary security access gate (same person vs. stranger), Face Metric calculates a **continuous, human-calibrated resemblance score** accompanied by qualitative trait highlights and natural AI summaries.

---

![](/test/result.png)

---

## ✨ Key Features

- **📱 Dual-Screen Responsive Design**:
  - **Desktop (>=640px)**: Side-by-side comparison cards with a central glowing `VS` badge.
  - **Mobile (<640px)**: Thumb-friendly stacked flow with an inline divider for seamless mobile operation.
- **🧬 Kinship Resemblance Calibration**:
  - Standard facial recognition models (e.g. ArcFace) use harsh angular margin penalties that push different identities toward orthogonality, which causes biological relatives (e.g. father & daughter) to score an unintuitive 20%~25%.
  - Face Metric employs an empirical **kinship calibration curve** that maps natural facial harmony to intuitive percentage scores (e.g., 60%~75% for close relatives, <30% for strangers).
- **💬 Human-Centric & Non-Technical Presentation**:
  - **Vivid Resemblance Ratings**: Clear verdicts such as `Strong Family Likeness`, `Noticeable Resemblance`, or `Subtle Likeness`.
  - **Facial Trait Tags**: Highlighting shared traits like `["Expressive Eyes", "Similar Jawline", "Familiar Charm"]`.
  - **AI Narrative Summary**: Natural descriptions explaining shared facial structures.
  - **Qualitative Dimension Cards**: Independent ratings for `Eyes & Expression` and `Contour & Bone Harmony`.
  - **Collapsible Technical Drawer**: Engineering parameters (`Cosine Distance`, `Fusion Models`, `Raw Confidence`) are neatly tucked away for developers.
- **⚡ Fast Multi-Model Fusion**:
  - High-precision facial landmark alignment via **RetinaFace** (with automatic Haar-cascade fallback).
  - Dual-model embedding fusion combining **ArcFace** and **Facenet512**.
  - Optimized inference with detection skipping on pre-aligned crops (<1s response time).
- **📷 Flexible Photo Input**:
  - Drag-and-drop file upload directly onto the circular preview zone.
  - Integrated mobile camera capture with front/back camera flipping.
- **🔒 Privacy First**:
  - Images are processed in-memory for the active request only.
  - Zero on-disk persistence.

---

## 🏗️ Architecture

```
face-metric/
├── apps/
│   ├── web/        # Next.js 16 (React 19, Tailwind CSS, Turbopack)
│   └── api/        # FastAPI service (DeepFace 0.0.100, TensorFlow, OpenCV)
├── specs/          # Technical specifications & architecture notes
├── test/           # Sample test images (Tom.png, Suri.png, etc.)
└── test_browser_e2e.py  # Playwright end-to-end browser test script
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `20.x` or later
- **Python**: `3.11.x` (Recommended for TensorFlow and NumPy 1.x stability on Windows/Linux)

---

### 1. Backend Service (FastAPI)

```bash
# Create and activate virtual environment
python -m venv .venv
# Linux / macOS:
source .venv/bin/activate
# Windows:
.venv\Scripts\activate

# Install backend dependencies (DeepFace 0.0.100)
pip install -r apps/api/requirements.txt

# Start the API server on port 8000
uvicorn apps.api.main:app --host 127.0.0.1 --port 8000
```

> **Tip**: DeepFace model weights will automatically cache to `~/.deepface/weights` on first run (`retinaface.h5`, `arcface_weights.h5`, `facenet512_weights.h5`).

Health check:
```bash
curl http://127.0.0.1:8000/health
# {"ok": true}
```

---

### 2. Frontend Application (Next.js)

```bash
cd apps/web

# Install dependencies
npm install

# Start Turbopack dev server on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

Run both the FastAPI backend and Next.js frontend in a unified container:

```bash
docker compose up --build
```

Access the application at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

### Automated Browser E2E Test (Playwright)
Run the full browser automation script simulating real user interactions across both Desktop and Mobile viewports:

```bash
python test_browser_e2e.py
```

### CLI Quick Compare
Test the backend inference directly via command-line:

```bash
python apps/api/scripts/quick_compare.py test/Tom.png test/Suri.png
```

---

## 📄 License

MIT License © 2026 Neo Zhu.
