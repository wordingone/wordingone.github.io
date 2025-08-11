# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Status (Evidence-Based)
- Directory verified: ✅ B:\GIT\wordingone.github.io
- Script loading mode: ✅ LOCAL - modular ES6 system with './models/' paths
- LFS: ✅ DISABLED for GLB deployment (binary files served directly)
- Models: 10 files; pointers: 0; binary: 10

## Structure (from repo)
```
wordingone.github.io/
├── .git/                    # Git repository with LFS objects
├── _ai/                     # AI control files
│   └── wordingone_bootstrap.xml
├── models/                  # 3D model assets (8.9MB total)
│   ├── altars.glb          # 1,180 bytes
│   ├── arch_module_smallest.glb # 2,534,936 bytes (main architectural model)
│   ├── circulation.glb     # 35,628 bytes
│   ├── Distress.glb        # 1,180 bytes
│   ├── embellishments.glb  # 1,172 bytes
│   ├── Index.glb           # 2,088 bytes
│   ├── mirror.glb          # 237,592 bytes
│   ├── misc geometry.glb   # 6,100,336 bytes
│   ├── Moulage.glb         # 1,244 bytes
│   └── robot.glb           # 1,248 bytes
├── src/                     # Modular source architecture
│   ├── config/models.js    # Model path configuration
│   ├── core/viewer.js      # 3D viewer initialization
│   ├── load/loadModels.js  # GLB loading system
│   └── [other modules]
├── videos/                  # Video overlay content
├── index.html              # Main application entry point
├── main.js                 # Module orchestrator (new architecture)
├── script.js               # Legacy rendering engine
├── style.css               # UI styling
├── lidar_00.png            # LiDAR background image
├── README.md               # This file
├── HANDOFF.md              # Project documentation
└── .gitattributes          # LFS configuration (disabled for GLB)
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
- Keep `.glb` as binary; avoid LFS pointers for web deployment.
- Script uses modular ES6 architecture with local `./models/` paths.
- All GLB files start with `glTF` binary header, confirming proper format.

_Last updated: 2025-08-10_