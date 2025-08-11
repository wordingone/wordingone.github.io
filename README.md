# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Status (Evidence-Based)
- Directory verified: B:\GIT\wordingone.github.io (12 files, 4 dirs)
- Script loading mode: modular_es6 — `import { createViewer } from './src/core/viewer.js'`
- LFS: commented out (web deployment mode)
- Models: 10 GLB files (binary: 10, pointers: 0)
- **NEW**: Cover page with scroll-reveal Prada branding
- **FIXED**: LiDAR container scaling with proper aspect ratio calculations
- **ENHANCED**: Background-size 'cover' for better image scaling

## Structure (from repo)
```
B:\GIT\wordingone.github.io/
├── .git/                   # Git repository data
├── .gitattributes          # LFS configuration (disabled for web)
├── cover.html             # NEW: Cover page with logo reveal
├── HANDOFF.md             # Project handoff documentation
├── README.md              # This file
├── index.html             # Main application entry
├── lidar_00.png           # LiDAR background image
├── main.js                # Central coordination system
├── script.js              # Legacy/backup script
├── script_broken_backup.js # Backup file
├── style.css              # Enhanced UI styling
├── logo/                  # Logo assets directory
│   └── remaking logo 1.png # Prada logo image
├── models/                # 3D architectural assets (10 GLB files)
├── src/                   # Modular ES6 source code
├── videos/                # Video series content (26 MP4 files)
└── _ai/                   # AI assistant artifacts
```

## Cover Page Features
- **Scroll-reveal Design**: Initial text at top, logo appears on scroll
- **Typography System**: Roboto for headers, GFS Didot for Prada branding
- **Interactive Logo**: Glows and scales 5% on hover
- **Video Integration**: Plays intro.mp4 as loading mechanism
- **Smart Loading**: Preloads main page while video plays
- **Skip Controls**: Icon-only skip button (no text per requirements)

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
- Keep `.glb` as binary; avoid LFS pointers.
- Prefer local `./models/...` unless a release URL is intentional and exists.
- **LIDAR SCALING**: Container uses `max-width: calc((100vh - 120px) * 1.77778)` for proper aspect ratio
- **COVER PAGE**: Access via cover.html, automatically redirects to index.html after interaction
- **VIDEO LOADING**: Add intro.mp4 to videos/ directory for full functionality
- **FONT LOADING**: Uses Google Fonts CDN for Roboto and GFS Didot
- **RESPONSIVE**: Cover page adapts to mobile with smaller typography

_Last updated: 2025-08-11_
