# UI Spec

## Layout
- Desktop: two symmetric upload cards side‑by‑side.
- Mobile: cards stack vertically.
- Results section below cards (or sticky on wide screens).

## Color tokens
- Background: `#0B0F17`
- Surface/card: `#0F172A`
- Border: `#1E293B`
- Text primary: `#E2E8F0`
- Text muted: `#94A3B8`
- Accent (teal/cyan): `#22D3EE` / `#14B8A6`

## Typography
- Page title: `text-xl font-semibold`
- Primary value (similarity): `text-4xl font-bold tracking-tight`
- Secondary labels: `text-sm text-muted`

## Components
- `UploadCard`
  - Tabs: Upload / Camera (camera optional)
  - Dropzone or file input
  - Preview with face status pill
- `ResultRing`
  - SVG ring, animated 0 → score
  - Accent stroke, subtle glow
- `ConfidenceRow`
  - Confidence value + model name
- `PrivacyBadge`
  - “Processed locally / no storage” or “No persistence”

## Copy style
- Short, neutral, professional.
- Avoid paragraphs; use single‑line hints.

