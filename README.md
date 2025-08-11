# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Status (Evidence-Based)
- Directory verified: ✅ B:\GIT\wordingone.github.io
- Script loading mode: ✅ LOCAL - uses ./models/ paths
- LFS: ✅ DISABLED for GLB files (binary deployment)
- Models: 10 files; pointers: 0; binary: 10

## Structure (from repo)
```
wordingone.github.io/
├── .git/                    # Git repository with LFS objects
├── _ai/                     # AI control files
│   └── wordingone_bootstrap.xml
├── models/                  # 3D model assets (4.3MB total)
│   ├── altars.glb          # 334KB
│   ├── arch_module_smallest.glb # 2.5MB (main architectural model)
│   ├── circulation.glb     # 155KB
│   ├── Distress.glb        # 336KB
│   ├── embellishments.glb  # 182KB
│   ├── Index.glb           # 189KB
│   ├── mirror.glb          # 223KB
│   ├── misc geometry.glb   # 3KB
│   ├── Moulage.glb         # 168KB
│   └── robot.glb           # 130KB
├── index.html              # Main application entry point
├── script.js               # 3D rendering engine (27KB)
├── style.css               # UI styling
├── README.md               # This file
├── HANDOFF.md              # Project documentation
└── .gitattributes          # LFS configuration
```

## Assets (from repo)
| file | bytes |
|------|------:|
| arch_module_smallest.glb | 2,534,936 |
| altars.glb | 334,472 |
| Distress.glb | 336,616 |
| embellishments.glb | 182,576 |
| Index.glb | 189,160 |
| mirror.glb | 223,228 |
| circulation.glb | 155,484 |
| Moulage.glb | 168,860 |
| robot.glb | 130,612 |
| misc geometry.glb | 3,416 |

## Maintenance Notes
- Keep `.glb` as binary; avoid LFS pointers.
- Prefer local `./models/...` unless a release URL is intentional and exists.

_Last updated: 2025-08-10_