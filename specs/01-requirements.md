# Requirements

## MVP user stories
- As a user, I can upload two images (or take photos) to compare faces.
- As a user, I can see previews and whether a face was detected per image.
- As a user, I can press **Compare** and receive similarity and confidence.
- As a user, I can understand failures quickly (no face detected, unsupported file, too large).

## Functional requirements
- Two input panels: Image A and Image B.
- Input methods: upload (MVP); camera capture (optional enhancement).
- Client previews with clear detection status: `Not checked`, `Face found`, `No face found`, `Error`.
- Compare action disabled until both images are present.
- Results area shows:
  - large percentage similarity
  - animated circular progress ring
  - confidence value (0–1 or %)
  - one‑sentence hint (<= 60 chars)

## Non‑functional requirements
- Dark‑first UI; teal/cyan used sparingly for emphasis.
- Desktop split view; mobile stacks vertically.
- Fast feedback (< 3s typical).
- Privacy explicit and accurate.
- Graceful errors; no long blocks of text.

## Out of scope
- Accounts/login.
- Saving images or comparisons.
- History, sharing, analytics dashboards.
- Multi‑face group comparisons.

