# wordingone.github.io

Source of the personal site at **https://wordingone.github.io/**: research on how intelligence develops, and architecture design work.

> **At a glance (read this first)**
>
> **What it is.** A static GitHub Pages site with no build step. Since 2026-11-05 ([#12](https://github.com/wordingone/wordingone.github.io/pull/12)) the root page is the research site, and the earlier PRADA (RE)MAKING studio project lives at [`/prada/`](https://wordingone.github.io/prada/).
>
> **Status.** Active. Built 2026-11-04 to 2026-11-05 (pull requests #9 to #16); the Prada project dates from 2025.
>
> **Who wrote it.** I designed and directed this work and reviewed it; most of the code was written by AI coding agents. The site carries the same note in its Authorship section.
>
> **How the claims are sourced.** Project pages link to files in the project repositories at pinned commits, so a quoted line stays checkable after the repositories change. [`LINKS.md`](LINKS.md) records the last external link check (28 of 28 unique URLs returned HTTP 200 on 2026-11-05).

## What is where

| Path | What it is |
|---|---|
| `index.html` | Root page: the research question, the selected work (Ember, The Search, WEB-CAD), how the work is checked, and background. If the 3D view cannot start, it falls back to a plain reading order. |
| `world/` | The interactive 3D view used by the root page (`world.js`, `world.css`), its data exported from the project repositories (`world/data/`), and a vendored copy of three.js (`world/vendor/`, with its licence). |
| `projects/` | One full page per project: `ember.html`, `the-search.html`, `web-cad.html`. |
| `text.html` | Text-only version of the root page. |
| `cv.html` | CV. |
| `prada/` | PRADA (RE)MAKING, the SCI-Arc 2025 studio project (see below). |
| `research/` | Redirect only: the old `/research/` address now forwards to the root. |
| `LINKS.md` | Result of the last external link check. |
| `HANDOFF.md` | 2025 maintenance notes for the Prada project (mobile fixes). |
| `_ai/` | Agent-facing notes; not linked from the site. |

Code for the projects themselves lives in their own repositories: [ember](https://github.com/wordingone/ember), [the-search](https://github.com/wordingone/the-search), [WEB-CAD](https://github.com/wordingone/WEB-CAD), [gemma-architect](https://github.com/wordingone/gemma-architect) and [genesis-forge](https://github.com/wordingone/genesis-forge).

## Run locally

Any static file server works; ES modules need it to be served over HTTP rather than opened as a file.

```bash
git clone https://github.com/wordingone/wordingone.github.io.git
cd wordingone.github.io
python -m http.server 8000
# open http://localhost:8000/ (research site) or http://localhost:8000/prada/
```

The repository is large (GitHub reports about 0.6 GB, mostly the Prada videos and 3D models).

## PRADA (RE)MAKING (`/prada/`)

An architectural proposal for an upcycling-focused extension to Prada's Montevarchi logistics centre, presented as an interactive web experience. Credits: Hyun Jun Han × Oskar Maly, SCI-Arc, Spring 2025.

- **Entry** (`prada/index.html`): scroll-to-reveal landing with the Prada logo, then an intro flythrough video.
- **Main view** (`prada/main-app.html`): a 3D model viewer (three.js r160, GPU-instanced architectural modules) beside a LiDAR-scanned collage board with nine hotspots that open video series about each part of the programme (index, mirror, model series, archive, red dye, circulation, insula, altar).
- **Design idea**: the insula, traditionally a Roman apartment block around a courtyard, reworked as a vertical factory where garment production, exhibition and customisation stay visible.
- **Code layout** (paths relative to `prada/`): `src/core/viewer.js` (scene setup), `src/load/loadModels.js` (GLB loading), `src/instancing/`, `src/focus/modelFocus.js`, `src/overlay/videoOverlay.js`, `src/ui/lidarBoard.js`, `src/sync/controller.js`, and `mobile/` for the mobile styles and handlers.
- **Known limits**: heavy assets (about 320 MB according to the 2025 notes), best on desktop with a mouse; the mobile fixes from 2025-08-13 are described in [`HANDOFF.md`](HANDOFF.md) and were marked "testing required" at the time.

The longer 2025 description of the Prada project is in the history of this file (for example at commit `16b16af`).
