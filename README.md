# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Status (Evidence-Based)
- Directory verified: B:\GIT\wordingone.github.io (10 files, 3 dirs)
- Script loading mode: modular_es6 — `import { createViewer } from './src/core/viewer.js'`
- LFS: commented out (web deployment mode)
- Models: 10 GLB files (binary: 10, pointers: 0)
- **CRITICAL FLEXBOX FIX**: Proper aspect ratio container with flexbox centering and smart scaling calculations
- **BRAND UPDATE**: Changed to "Prada: Remaking" with improved design system
- **ENHANCED**: Professional typography and button design for better UX
- **ENHANCED**: Cross-device responsive design with vertical centering when space available

## Structure (from repo)
```
B:\GIT\wordingone.github.io/
├── .git/                   # Git repository data
├── .gitattributes          # LFS configuration (disabled for web)
├── HANDOFF.md             # Project handoff documentation
├── README.md              # This file
├── index.html             # Main application entry
├── lidar_00.png           # LiDAR background image
├── main.js                # Central coordination system
├── script.js              # Legacy/backup script
├── script_broken_backup.js # Backup file
├── style.css              # Enhanced UI styling
├── models/                # 3D architectural assets (10 GLB files)
├── src/                   # Modular ES6 source code
├── videos/                # Video series content (26 MP4 files)
└── _ai/                   # AI assistant artifacts
```

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
- **FLEXBOX ARCHITECTURE**: LiDAR interface uses flexbox centering with smart `min()` calculations for width/height
- **RESPONSIVE SCALING**: Container scales proportionally using `aspect-ratio: 16/9` with vertical centering
- **BRAND**: Interface branded as "Prada: Remaking" with professional design system
- **DEVICE SUPPORT**: Touch-friendly design with responsive calculations for all screen sizes
- **TECHNICAL**: Background uses `background-size: cover` with hotspots positioned relative to flexbox container

_Last updated: 2025-08-11_
