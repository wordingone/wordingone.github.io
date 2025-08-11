# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Status (Evidence-Based)
- Directory verified: B:\GIT\wordingone.github.io (12 files, 4 dirs)
- Script loading mode: modular_es6 — `import { createViewer } from './src/core/viewer.js'`
- LFS: commented out (web deployment mode)
- Models: 10 GLB files (binary: 10, pointers: 0)
- **UPDATED**: Scrollable cover page with 200vh height and scroll-triggered reveals
- **UPDATED**: Color scheme - removed gold, using white/black/blue (#3498db)
- **FIXED**: Video path corrected to "complete animation.mp4"

## Structure (from repo)
```
B:\GIT\wordingone.github.io/
├── .git/                   # Git repository data
├── .gitattributes          # LFS configuration (disabled for web)
├── cover.html             # UPDATED: Scrollable cover with proper logo scaling
├── HANDOFF.md             # Project handoff documentation
├── README.md              # This file
├── index.html             # Main application entry
├── lidar_00.png           # LiDAR background image
├── main.js                # Central coordination system
├── script.js              # Legacy/backup script
├── script_broken_backup.js # Backup file
├── style.css              # Updated color scheme (no gold)
├── logo/                  # Logo assets directory
│   └── remaking logo 1.png # Prada logo image
├── models/                # 3D architectural assets (10 GLB files)
├── src/                   # Modular ES6 source code
├── videos/                # Video series content (26 MP4 files)
│   └── complete animation.mp4 # Intro loading video
└── _ai/                   # AI assistant artifacts
```

## Cover Page Features
- **Scrollable Interface**: 200vh height for actual scrolling interaction
- **Scroll-triggered Reveals**: Header fades at 100px, logo appears at 200px scroll
- **Large Logo**: 600px width to match text length (responsive scaling on mobile)
- **Smart Loading**: Skip button only appears after models AND lidar fully loaded
- **Correct Video**: Plays "complete animation.mp4" during loading
- **Color Scheme**: White text, black background, blue (#3498db) accents

## Assets (from repo)
| file | bytes |
|------|------:|
| misc geometry.glb | 6,100,336 |
| arch_module_smallest.glb | 2,534,936 |
| mirror.glb | 237,592 |
| circulation.glb | 35,628 |
| Index.glb | 2,088 |
| Moulage.glb | 1,244 |
| robot.glb | 1,248 |
| altars.glb | 1,180 |
| Distress.glb | 1,180 |
| embellishments.glb | 1,172 |

## Maintenance Notes
- Keep `.glb` as binary; avoid LFS pointers
- Prefer local `./models/...` unless a release URL is intentional and exists
- **COVER PAGE**: Requires actual scrolling to reveal logo (200px scroll distance)
- **VIDEO PATH**: Must have "complete animation.mp4" in videos/ directory
- **SKIP BUTTON**: Only appears when modelsLoaded && lidarLoaded are both true
- **COLOR PALETTE**: White (#fff), Black (#000), Blue (#3498db) only - no gold
- **LOGO SIZE**: 600px width on desktop, scales responsively on mobile

_Last updated: 2025-08-11_
