# Architectural Navigation System

**Advanced 3D architectural visualization with interactive video series playback**

[![Performance](https://img.shields.io/badge/Performance-GPU%20Optimized-green)]()
[![Browser](https://img.shields.io/badge/Browser-WebGL%20Required-blue)]()
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()

## 🏗️ Project Overview

A sophisticated architectural navigation system combining real-time 3D visualization with interactive LiDAR interface and advanced video series playback. Features GPU-instanced rendering of 2,673 architectural components with seamless video content integration.

### 🎯 Core Features

- **📹 Video Series System**: Sequential playback with smart navigation controls
- **🏛️ 3D Architecture Viewer**: GPU-optimized instanced rendering with dual-tone aesthetics
- **🗺️ Interactive LiDAR Interface**: Responsive hotspots with smooth animations
- **⚡ Performance Optimized**: WebGL2 with static draw usage for maximum efficiency
- **📱 Responsive Design**: Cross-platform compatibility with touch support

## 🚀 Quick Start

### Prerequisites
- Modern browser with WebGL support
- HTTP server (for local development)
- Video codec support (MP4/H.264)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd wordingone.github.io

# Serve locally (Python example)
python -m http.server 8000

# Or use any HTTP server
npx serve .
```

### Usage

1. **Navigate**: Use mouse to rotate, wheel to zoom the 3D model
2. **Explore**: Click hotspots on the LiDAR interface to view video content
3. **Video Series**: Use navigation controls to browse through related videos
4. **Highlight**: Toggle the highlight button for enhanced region visibility

## 📁 Project Structure

```
├── index.html              # Main application entry
├── main.js                  # Central coordination system
├── style.css                # Enhanced UI styling
├── src/
│   ├── core/
│   │   └── viewer.js        # 3D viewer with optimized zoom
│   ├── overlay/
│   │   └── videoOverlay.js  # Video series player
│   ├── ui/
│   │   └── lidarBoard.js    # Interactive LiDAR interface
│   ├── instancing/
│   │   └── towerInstancer.js # GPU optimization system
│   ├── config/
│   │   ├── hotspots.js      # Region definitions
│   │   └── models.js        # 3D model configuration
│   ├── load/
│   │   └── loadModels.js    # Asset loading system
│   └── sync/
│       └── controller.js    # Cross-system coordination
├── models/                  # 3D architectural assets (GLB)
├── videos/                  # Video series content (MP4)
└── _ai/                     # AI assistant artifacts
```

## 🎬 Video Series Configuration

| Region | Content | Type | Features |
|--------|---------|------|----------|
| **Altar** | 4-part series | Sequential | Auto-advance, navigation dots |
| **Archive** | 6-part collection | Sequential | Previous/next, counter |
| **Index** | 2-part sequence | Sequential | Manual controls |
| **Red Dye** | Single showcase | Loop | Continuous playback |
| **Circulation** | 2-part flow | Sequential | Seamless transitions |
| **Insula** | Standalone | Loop | Focused content |
| **Mirror** | Single piece | Loop | Artistic showcase |

## 🛠️ Technical Architecture

### 3D Rendering System
- **GPU Instancing**: 2,673 components rendered efficiently
- **Dual-tone Aesthetics**: Dark gray structures, original model colors
- **Optimized Zoom**: 50% increased detail view (frustumSize: 20→10)
- **Performance**: Event-driven rendering with static draw usage

### Video Integration
- **Series Management**: Automatic progression with manual override
- **Navigation UI**: Previous/next buttons, dot indicators, counters
- **Positioning**: Fixed 600×450px overlay, 800px right offset
- **State Coordination**: Synchronized with 3D viewer and LiDAR interface

### Interactive Features
- **Smooth Animations**: 0.8s dissolving highlight effects
- **Precise Targeting**: Percentage-based zoom centering
- **Responsive Hotspots**: Dynamic positioning with state management
- **Cross-system Sync**: Coordinated state between all components

## 🎨 Visual Enhancements

### Color Scheme
- **Instanced Components**: Sophisticated dark gray concrete aesthetic
- **Unique Models**: Original colors and materials preserved
- **UI Elements**: Modern glassmorphism with subtle animations
- **Highlight System**: Smooth dissolving overlay with feathered edges

### Animations
- **Video Transitions**: 500ms smooth progression between clips
- **Highlight Overlay**: 0.8s elegant dissolving effect
- **Zoom Operations**: Coordinated centering with percentage precision
- **UI Feedback**: Question mark indicators and hover states

## 🔧 Configuration

### Hotspot Regions
```javascript
// src/config/hotspots.js
const hotspots = [
    {
        area: 'altar',
        coords: [1426, 455, 62, 42],
        rotation: -2.1,
        videos: ['altar_1.mp4', 'altar_2.mp4', 'altar_3.mp4', 'altar_4.mp4']
    }
    // ... additional regions
];
```

### 3D Model Settings
```javascript
// src/core/viewer.js
const frustumSize = 10; // Optimized zoom level
const instanceCount = 2673; // GPU-instanced components
```

## 📊 Performance Metrics

- **GPU Instancing**: ~2,673 architectural components
- **Memory Usage**: Optimized with static draw buffers
- **Render Performance**: Event-driven system, 60fps target
- **Asset Loading**: Progressive enhancement with error handling
- **Video Playback**: Hardware-accelerated when available

## 🌐 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebGL2 | ✅ | ✅ | ✅ | ✅ |
| GPU Instancing | ✅ | ✅ | ⚠️ | ✅ |
| Video Playback | ✅ | ✅ | ✅ | ✅ |
| Touch Events | ✅ | ✅ | ✅ | ✅ |

## 🔍 Development

### Local Development
```bash
# Start local server
npx serve . --port 8000

# Open browser
open http://localhost:8000
```

### Adding Video Content
1. Place MP4 files in `/videos/` directory
2. Update `src/overlay/videoOverlay.js` configuration
3. Add corresponding hotspot in `src/config/hotspots.js`
4. Update HTML hotspot elements in `index.html`

### Debugging
- Open browser developer tools
- Check console for performance metrics
- Monitor GPU usage in rendering tab
- Verify video loading in network panel

## 📚 API Reference

### Video Overlay System
```javascript
const videoOverlay = createVideoOverlay(lidarBoard, {
    onOverlayOpen: (region, hotspot) => { /* callback */ },
    onOverlayClose: () => { /* callback */ }
});
```

### 3D Viewer Controls
```javascript
const viewer = createViewer(canvas);
viewer.render(); // Manual render request
viewer.dispose(); // Cleanup resources
```

## 🚀 Deployment

### Static Hosting
Project is designed for static hosting on platforms like:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### Asset Optimization
- Videos: H.264 encoded MP4 for broad compatibility
- 3D Models: GLB format with embedded textures
- Images: Optimized PNG for LiDAR background

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

[Specify license information]

## 📞 Support

For technical support or questions:
- Check browser console for error messages
- Verify WebGL support: `about:gpu` (Chrome)
- Ensure video codecs are supported
- Test with latest browser versions

---

**Built with modern web technologies for optimal performance and user experience**

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

*Last updated: 2025-08-11*