# PRADA: (RE)MAKING — Architectural Web Experience

## Overview

An immersive, cinematic web platform showcasing an architectural proposal for Prada's upcycling-focused extension at their Montevarchi Logistics Center. The project, developed at SCI-Arc under Peter Testa's vertical studio, reimagines fashion production through visible, interconnected processes housed in a contemporary insula typology.

**Live Site**: [wordingone.github.io](https://wordingone.github.io)  
**Credits**: Hyun Jun Han × Oskar Maly • SCI-Arc 2025

## Experience Architecture

### Entry Sequence
1. **Landing Page** (`index.html`): Cinematic scroll-to-reveal with Prada logo
2. **Intro Animation**: 50MB architectural flythrough video with smart autoplay
3. **Main Application** (`main-app.html`): Dual-panel interface combining 3D navigation and LiDAR exploration

### Interface Design

#### Left Panel: 3D Model Viewer (33% width)
- **Real-time WebGL visualization** of 5-floor architectural system
- **GPU-instanced rendering**: 2,673 architectural components
- **Interactive controls**: Orbit (mouse drag) + Zoom (scroll wheel)
- **Model focus system**: Synchronized highlighting with LiDAR hotspots
- **Glass morphism UI**: Premium frosted glass aesthetic throughout

#### Right Panel: LiDAR Board (67% width)
- **High-resolution mood board**: 1920×1080 LiDAR-scanned collage
- **9 Interactive hotspots**: Trigger video series on click
- **Magnifying lens cursor**: 3× magnification (225px on desktop, 60-80px mobile)
- **Highlighting mode**: Reveals interactive regions with mask overlay
- **Zoom animation**: 3.5× scale focusing on selected areas

## Technical Implementation

### Core Technologies
- **Three.js r160**: WebGL rendering and 3D scene management
- **ES6 Modules**: Modular architecture for maintainability
- **GPU Instancing**: Optimized rendering for thousands of components
- **Intersection Observer**: Lazy loading for performance
- **Container Queries**: Responsive without media query dependencies

### Architecture
```
src/
├── core/viewer.js         # Three.js scene initialization
├── load/loadModels.js     # GLTF/GLB loader with progress tracking
├── instancing/            # GPU instancing for arch_module_smallest.glb
├── focus/modelFocus.js    # Model highlighting and region mapping
├── overlay/videoOverlay.js # Video player with series navigation
├── ui/lidarBoard.js       # Hotspot positioning and mask system
└── sync/controller.js     # 2D/3D view synchronization
```

### Performance Optimizations
- **Pixel ratio capping**: 1.25× on mobile, 2× on desktop
- **Binary GLB delivery**: No LFS pointers for reliable web serving
- **Video preloading**: Intro animation loads during scroll sequence
- **CLS prevention**: Aspect-ratio boxes prevent layout shift
- **Reduced motion support**: Respects accessibility preferences

## Content Structure

### 3D Models (10 GLB files)
- `arch_module_smallest.glb` (2.5MB): Instanced architectural framework
- `misc geometry.glb` (6.1MB): Environmental details
- `altars.glb`: Designer-visitor interaction platforms
- `circulation.glb`: Vertical/horizontal movement systems
- `Index.glb`, `mirror.glb`: Scanning and reflection spaces
- Additional: `Distress.glb`, `embellishments.glb`, `Moulage.glb`, `robot.glb`

### Video Content (30 files)
- **Intro**: `complete animation.mp4` (~50MB flythrough)
- **Series Collections**:
  - Altar Series (4 videos): Work platforms and customization
  - Archive Series (7 videos): Storage and retrieval systems
  - Circulation Series (2 videos): Movement through building
  - Index Series (2 videos): Garment documentation
  - Model Series (4 videos): Physical model presentations
  - Single Features: Insula, Mirror, Red Dye stations

### Interactive Regions
Each hotspot maps to specific architectural program:
1. **INDEX**: Garment scanning and digital documentation
2. **MIRROR**: First-floor corridor with visual continuity
3. **MODEL SERIES**: Physical model and projection displays
4. **ARCHIVE INSIDE**: Climate-controlled storage views
5. **ARCHIVE 2**: Exterior glass block facade
6. **RED DYE**: Material treatment and coloring station
7. **CIRCULATION**: Main vertical/horizontal routes
8. **INSULA**: Central courtyard organization
9. **ALTAR**: Primary designer-visitor workspaces

## Visual Design System

### Liquid Glass UI
- **Glass morphism**: Backdrop blur (18px) with transparency
- **Color palette**: 
  - Ink (#0B0B0F): Dark backgrounds
  - Paper (#F7F7F8): Light text
  - Accent (#8EA9FF): Interactive elements
- **Typography**: Inter font family with optical sizing
- **Animations**: Cubic-bezier easing for smooth transitions
- **Shadow system**: 4-tier z-depth for layered interface

### Responsive Behavior
- **Desktop**: Full dual-panel layout with hover interactions
- **Tablet**: Stacked panels with touch-optimized controls
- **Mobile**: Dramatically scaled magnifier, 44×44px tap targets
- **Landscape**: Hides 3D panel to maximize LiDAR view

## Installation & Development

### Prerequisites
- Modern browser with WebGL 2.0 support
- JavaScript modules (ES6) capability
- 100MB+ for optimal video streaming

### Local Development
```bash
# Clone repository
git clone https://github.com/wordingone/wordingone.github.io.git

# Serve locally (requires CORS headers for modules)
python -m http.server 8000
# or
npx serve -s .

# Access at http://localhost:8000
```

### Mobile Enhancements
To enable mobile optimizations, add to HTML:
```html
<!-- Viewport meta -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- Responsive additions -->
<link rel="stylesheet" href="mobile/responsive.additions.css">
<script type="module" src="mobile/responsive.additions.js"></script>
```

## Browser Support

### Optimal Experience
- Chrome 90+ / Edge 90+
- Safari 15+ (macOS/iOS)
- Firefox 88+

### Required Features
- WebGL 2.0
- ES6 Modules
- CSS Grid/Flexbox
- Backdrop Filter

### Performance Targets
- FCP: < 2.5s
- TTI: < 4.0s
- CLS: < 0.1
- Mobile Lighthouse: 85+

## Project Context

### Academic Framework
This project emerged from SCI-Arc's vertical studio investigating fashion's circular economy through architectural intervention. The brief challenged students to design spaces that make garment transformation visible, positioning upcycling as performance rather than hidden industrial process.

### Design Philosophy
The insula typology—traditionally a Roman apartment block around a courtyard—is reimagined as a vertical factory where production, exhibition, and customization coexist. Glass blocks, mirrored corridors, and open "altars" ensure all processes remain visible, transforming Prada's logistics into public theater.

### Technical Innovation
- **LiDAR mapping**: Physical models scanned to create navigable collages
- **GPU instancing**: Thousands of components rendered efficiently
- **Hybrid media**: Videos, 3D models, and 2D mapping in unified interface
- **Cinema-first web**: Cinematic transitions prioritized over traditional UX

## Maintenance Notes

### Critical Paths
- Models must remain binary (no LFS) for GitHub Pages
- Video files served directly (no CDN/streaming required)
- Magnifier cursor requires pointer-events: none on hotspots
- Frame (rounded corners) must persist during zoom

### Known Issues
- Safari may require user interaction for video autoplay
- Mobile magnifier requires aggressive scaling (60-80px)
- Intro video uses contain (not cover) to prevent cropping

### Future Enhancements
- Progressive video quality based on connection speed
- WebXR support for immersive 3D navigation
- Multiplayer synchronized exploration
- Real-time raymarching for dynamic lighting

---

**Repository**: [github.com/wordingone/wordingone.github.io](https://github.com/wordingone/wordingone.github.io)  
**License**: Copyright 2025 Hyun Jun Han & Oskar Maly. All rights reserved.  
**Last Updated**: August 12, 2025
