# WordingOne — Cinematic Web Environment

A responsive, cinematic web experience bridging campaign narratives with a deeper representational layer. A 3D navigation model and a LiDAR-scanned mood board interlink to trigger videos, physical-model documentation, and scenes.

## Status (Evidence-Based)
- Directory verified: ✅ B:\GIT\wordingone.github.io
- Script loading mode: GitHub Release URLs (bypassing LFS)
- LFS: Active for *.glb in .gitattributes but models are binary (2.5MB+)
- Models: 10 GLB files (all binary, no LFS pointers)

## Structure (from repo)
```
wordingone.github.io/
├── .git/                    # Git repository
├── _ai/                     # AI control files
│   └── wordingone_bootstrap.xml
├── models/                  # 3D model assets
│   ├── altars.glb          # 334KB
│   ├── arch_module_smallest.glb # 2.5MB (main)
│   ├── circulation.glb     # 155KB
│   ├── Distress.glb        # 336KB
│   ├── embellishments.glb  # 182KB
│   ├── Index.glb           # 189KB
│   ├── mirror.glb          # 223KB
│   ├── misc geometry.glb   # 3KB
│   ├── Moulage.glb         # 168KB
│   └── robot.glb           # 130KB
├── index.html              # Main application
├── script.js               # 3D engine (27KB)
├── style.css               # Styling
├── HANDOFF.md              # Project handoff doc
└── .gitattributes          # LFS config (active)
```

## Assets (from repo)
| file | bytes |
|------|------:|
| arch_module_smallest.glb | 2,534,936 |
| altars.glb | 334,472 |
| circulation.glb | 155,484 |
| Distress.glb | 336,616 |
| embellishments.glb | 182,576 |
| Index.glb | 189,160 |
| mirror.glb | 223,228 |
| misc geometry.glb | 3,416 |
| Moulage.glb | 168,860 |
| robot.glb | 130,612 |

## Maintenance Notes
- Keep `.glb` as binary; avoid LFS pointers.
- Script uses GitHub release URLs to bypass LFS issues
- Models total: ~4.3MB across 10 files

_Last updated: 2025-01-27_