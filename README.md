# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Recent Updates (2025-08-11)

### Visual Enhancements
- **Liquid Glass UI System**: Premium glass morphism design throughout
- **Magnifying Lens**: 2x magnification cursor for LiDAR board exploration
- **Enhanced Progress Bar**: Shimmer animation with accurate percentage tracking
- **Video Descriptions**: Contextual text for all 9 interactive regions
- **Onboarding Overlay**: Project brief and control instructions on first visit

### Technical Features
- 10 GLB models with GPU instancing for architecture
- 26 MP4 videos organized in thematic series
- Model focus system with hover/click highlighting
- Responsive design for all screen sizes
- Motion preference support for accessibility

## Status (Evidence-Based)
- Directory verified: ✅ (2025-08-11)
- Script loading mode: modular_es6 — `import { createViewer } from './src/core/viewer.js'`
- LFS: disabled (web deployment mode)
- Models: 10 GLB files (binary: 10, pointers: 0)
- Videos: 26 MP4 files

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
│   ├── altars.glb
│   ├── arch_module_smallest.glb (2.5MB - instanced)
│   ├── circulation.glb
│   ├── Distress.glb
│   ├── embellishments.glb
│   ├── Index.glb
│   ├── mirror.glb
│   ├── misc geometry.glb (6.1MB)
│   ├── Moulage.glb
│   └── robot.glb
├── src/                   # Modular ES6 source code
│   ├── config/
│   │   └── models.js      # Model configuration
│   ├── core/
│   │   └── viewer.js      # 3D viewer initialization
│   ├── focus/
│   │   └── modelFocus.js  # Model highlight/focus system
│   ├── instancing/
│   │   └── towerInstancer.js # GPU instancing for architecture
│   ├── load/
│   │   └── loadModels.js  # GLB loader
│   ├── overlay/
│   │   └── videoOverlay.js # Video overlay system
│   ├── sync/
│   │   └── controller.js  # Sync between 2D/3D views
│   └── ui/
│       └── lidarBoard.js  # Percentage-based positioning
├── videos/                # Video series content (26 files)
│   ├── complete animation.mp4 # Intro loading video (~50MB)
│   ├── altar_*.mp4        # Altar series (4 files)
│   ├── archive_*.mp4      # Archive series (7 files)
│   ├── circulation_*.mp4  # Circulation series (2 files)
│   ├── index_*.mp4        # Index series (2 files)
│   └── [various scene files]
└── _ai/                   # AI assistant artifacts
    └── wordingone_bootstrap.xml # Controller configuration
```

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
- Keep `.glb` as binary; avoid LFS pointers for web deployment
- Prefer local `./models/...` paths (ES6 module imports)
- GPU instancing active for architectural system
- Model focus system provides hover/click highlighting
- All videos served directly (no streaming/CDN)

_Last updated: 2025-08-11_
<!-- Force GitHub Pages rebuild to clear custom domain cache -->
