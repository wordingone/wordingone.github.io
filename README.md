# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Status (Evidence-Based)
- Directory verified: B:\GIT\wordingone.github.io (12 files, 4 dirs)
- Script loading mode: modular_es6 — `import { createViewer } from './src/core/viewer.js'`
- LFS: commented out (web deployment mode)
- Models: 10 GLB files (binary: 10, pointers: 0)
- **FIXED**: LiDAR container with unified scaling (aspect-ratio: 1920/1080)
- **IMPROVED**: Question marks grow 1.5x on hover without circular backgrounds
- **OPTIMIZED**: Percentage-based hotspot positioning for consistent scaling

## Structure (from repo)
```
B:\GIT\wordingone.github.io/
├── .git/                   # Git repository data
├── .gitattributes          # LFS configuration (disabled for web)
├── cover.html             # Scrollable cover with logo reveal
├── HANDOFF.md             # Project handoff documentation
├── README.md              # This file
├── index.html             # Main application entry
├── lidar_00.png           # LiDAR background image (1920x1080)
├── main.js                # Central coordination system
├── script.js              # Legacy/backup script
├── script_broken_backup.js # Backup file
├── style.css              # Unified container scaling system
├── logo/                  # Logo assets directory
│   └── remaking logo 1.png # Prada logo image
├── models/                # 3D architectural assets (10 GLB files)
├── src/                   # Modular ES6 source code
│   └── ui/lidarBoard.js  # Percentage-based positioning
├── videos/                # Video series content (26 MP4 files)
│   └── complete animation.mp4 # Intro loading video
└── _ai/                   # AI assistant artifacts
```

## LiDAR Interface Features
- **Unified Container**: Single scaling unit with aspect-ratio: 1920/1080
- **Percentage Positioning**: Hotspots use % values (x/1920*100, y/1080*100)
- **Clean Question Marks**: No circular backgrounds, just scaling text
- **Hover Growth**: 1.5x scale on desktop, 1.4x tablet, 1.3x mobile
- **Consistent Scaling**: Image and hotspots scale together as one unit
- **Background Size**: 100% 100% for exact container fit

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
- **CONTAINER SCALING**: Uses `max-width: min(100%, calc((100vh - 100px) * 1.77778))`
- **HOTSPOT POSITIONING**: All coordinates converted to percentages for scaling
- **QUESTION MARKS**: Base sizes: 24px desktop, 20px tablet, 18px mobile
- **HOVER EFFECT**: transform: scale(1.5) with 0.3s ease transition
- **NO CIRCLES**: Clean aesthetic with just question marks, no button backgrounds
- **REFERENCE DIMENSIONS**: Based on 1920x1080 for percentage calculations

_Last updated: 2025-08-11_
