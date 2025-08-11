# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Status (Evidence-Based)
- Directory verified: B:\GIT\wordingone.github.io (13 files, 4 dirs)
- Script loading mode: modular_es6 — `import { createViewer } from './src/core/viewer.js'`
- LFS: commented out (web deployment mode)
- Models: 10 GLB files (binary: 10, pointers: 0)
- **FIXED**: Navigation flow - index.html → main-app.html with video overlay
- **IMPROVED**: Scroll locking when logo is centered on screen
- **OPTIMIZED**: Video plays as overlay on main app, not inline

## Structure (from repo)
```
B:\GIT\wordingone.github.io/
├── .git/                   # Git repository data
├── .gitattributes          # LFS configuration (disabled for web)
├── old-cover.html.backup   # Archived old cover page
├── HANDOFF.md             # Project handoff documentation
├── README.md              # This file
├── index.html             # Cover page with scroll-to-logo
├── main-app.html          # Main application with video overlay
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

## Navigation Flow
1. **Landing (index.html)**: User sees header, scrolls down to reveal logo
2. **Scroll Lock**: When logo centers in viewport, scroll locks preventing overshooting
3. **Click to Enter**: Clicking logo navigates to main-app.html
4. **Video Overlay**: Complete animation plays as overlay on main app
5. **Skip Control**: Skip button appears after resources load
6. **Main Experience**: After video, full LiDAR and 3D model interface

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
| complete animation.mp4 | ~50MB |
| Various room videos | ~10-20MB each |

## Maintenance Notes
- Keep `.glb` as binary; avoid LFS pointers
- **NAVIGATION**: index.html → main-app.html (not circular)
- **VIDEO TIMING**: Skip button only after resources load
- **SCROLL LOCK**: Prevents scrolling past centered logo
- **SESSION STORAGE**: Used to trigger video on main-app.html
- **MOBILE SUPPORT**: Touch events handled for scroll lock

_Last updated: 2025-01-28_
