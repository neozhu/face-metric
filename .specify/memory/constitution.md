# Face Metric Constitution

## Core Principles

### 1) Privacy-First, In-Memory Only
- The API must not persist user images to disk, database, or object storage.
- Avoid request/response body logging in production.
- Prefer ephemeral outputs (e.g., cropped preview returned as bytes) and let the client decide whether to store.

### 2) Stable Contract Over Cleverness
- `POST /v1/compare` response shape is treated as a contract with the UI.
- Backwards-incompatible changes require either a new versioned route or an explicit migration plan.
- Error contracts are explicit and user-facing (`unsupported_file_type`, `file_too_large`, `no_face_detected`, `inference_error`).

### 3) Fast on Mobile, Especially on Large Photos
- Mobile camera uploads can be huge; do preprocessing early and keep models off the hot path when possible.
- Use `POST /v1/preprocess` to detect + crop faces (expand detection region by 20%), then cap output `maxSide` at `1280`.
- Prefer “crop first for fidelity, then downscale if needed”; detection may run on a scaled copy for speed.

### 4) Clean, Minimal UI That Feels Premium
- Dark-first, high-contrast, and motion used only to explain waiting states (e.g., cropping, comparing).
- Keep the main flow obvious: pick → preview → compare → score.
- Mobile layout is first-class (two previews can sit side-by-side on small screens).

### 5) Reproducible ML Runtime
- On Windows, target Python `3.11` for DeepFace/TensorFlow stability.
- Keep dependency constraints explicit (e.g., `numpy<2.0`, pinned TF ranges).
- Changes to detector/model defaults must be justified with measurable impact (speed/quality).

## Constraints & Non-Goals
- Not a biometric identity system; no user accounts, no enrollment, no persistence.
- No multi-face/group comparisons by default; when multiple faces exist, choose a deterministic primary face (e.g., largest).
- No EXIF rotation correction unless explicitly requested (client supplies the intended orientation).
- Do not “silently succeed” when detection fails; return actionable errors.

## Development Workflow & Quality Gates
- Small, focused PRs; UI/contract changes must update `specs/` when relevant.
- Before shipping:
  - API smoke: `GET /health`, `POST /v1/preprocess`, `POST /v1/compare`
  - UI smoke on mobile viewport (two previews aligned; cropping animation shown)
- Prefer deterministic, unit-testable helpers for geometry/cropping logic; avoid unreviewed “magic constants”.

## Governance
- This constitution supersedes local conventions when they conflict.
- Any change that weakens privacy (persistence/logging) requires explicit review and a documented rationale.
- Any change to `/v1/compare` response must include (1) contract note, (2) UI verification, (3) migration plan if needed.

**Version**: 1.0.0 | **Ratified**: 2025-12-12 | **Last Amended**: 2025-12-12
