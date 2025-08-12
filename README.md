# PRADA: (RE)MAKING — Architectural Web Experience

## 🚨 CRITICAL: Mobile Completely Broken (2025-08-13)

### DO NOT DEPLOY TO PRODUCTION
The site is currently **non-functional on ALL mobile devices**. After ~10 failed fix attempts, root causes have been identified but NOT resolved.

### Three Critical Failures:
1. **Loading screen never dismisses** - Users cannot access the site
2. **Logo positioning broken** - Misaligned/off-screen on mobile
3. **Video overlay inaccessible** - Z-index conflicts prevent interaction

### Root Cause:
- **Missing files**: Referenced mobile scripts don't exist (`mobile/mobile-navigation.js`, etc.)
- **Z-index chaos**: Values range from 100 to 999999 with conflicting !important declarations
- **CSS conflicts**: Multiple centering methods fighting each other
- **No proper mobile testing**: Fixes were applied without actual device testing

**See [HANDOFF.md](./HANDOFF.md) for complete technical analysis and required fixes.**

---

## Overview

An immersive, cinematic web platform showcasing an architectural proposal for Prada's upcycling-focused extension at their Montevarchi Logistics Center. The project, developed at SCI-Arc under Peter Testa's vertical studio, reimagines fashion production through visible, interconnected processes housed in a contemporary insula typology.

**⚠️ Live Site**: [wordingone.github.io](https://wordingone.github.io) - **DESKTOP ONLY**  
**Credits**: Hyun Jun Han × Oskar Maly • SCI-Arc 2025

## 🖥️ Desktop Experience (Working)

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
- **Magnifying lens cursor**: 3× magnification (225px)
- **Highlighting mode**: Reveals interactive regions with mask overlay
- **Zoom animation**: 3.5× scale focusing on selected areas

## 📱 Mobile Experience (BROKEN)

### Current State: Non-Functional
- **Cannot load site**: Loading screen stuck indefinitely
- **Cannot see content**: Logo positioning failures
- **Cannot interact**: Z-index conflicts block all interactions

### Failed Fix Attempts:
1. Added `responsive.additions.css/js` - Partial fixes, new conflicts
2. Z-index adjustments - Made problems worse
3. Transform corrections - Conflicting methods remain
4. Touch event handlers - Never properly implemented
5. Viewport height fixes - Incomplete browser support

### Required for Mobile Support:
- Create missing JavaScript files
- Complete CSS architecture rewrite
- Proper touch event system
- Real device testing (not DevTools)
- Promise-based resource loading

## Technical Implementation

### File Structure Issues
```
mobile/
├── responsive.additions.css  ✓ EXISTS (but insufficient)
├── responsive.additions.js   ✓ EXISTS (but incomplete)
├── mobile-navigation.js      ✗ MISSING (referenced but not created)
├── mobile-video.js          ✗ MISSING (referenced but not created)
└── mobile-hotspots.js       ✗ MISSING (referenced but not created)
```

### Z-Index Chaos
Current z-index values in codebase:
- Base content: 1-100
- Model panel: 10
- LiDAR controls: 100
- Hotspots: 10
- Magnifier: 1000
- Onboarding: 3000
- Loading screen: 200000
- Video overlay: 99999 (desktop) / 999999 (mobile)

This creates an unmaintainable cascade of overrides.

### CSS Conflicts
Multiple centering methods for same element:
```css
/* All trying to center the logo */
top: 50%;
top: 50vh;
top: 50dvh;
transform: translate(-50%, -50%);
display: flex;
align-items: center;
justify-content: center;
```

## Performance (Desktop Only)

### Current Metrics
- **Desktop Lighthouse**: 89/100
- **Mobile Lighthouse**: N/A (site doesn't load)
- **FCP**: 2.3s (desktop)
- **TTI**: 3.8s (desktop)
- **CLS**: 0.08 (desktop)

### Resource Sizes
- **3D Models**: ~20MB total (10 GLB files)
- **Videos**: ~300MB total (30 MP4 files)
- **LiDAR Image**: 2.8MB (1920×1080)
- **Initial Bundle**: ~500KB

## Development Warning

### Prerequisites
- Modern browser with WebGL 2.0 support
- **Desktop viewport required** (mobile broken)
- 100MB+ bandwidth for video streaming

### Local Development
```bash
# Clone repository
git clone https://github.com/wordingone/wordingone.github.io.git

# Serve locally
python -m http.server 8000

# Desktop testing ONLY
# Mobile testing will show all critical failures
```

### ⚠️ Do NOT Deploy Current Code
The mobile experience is completely broken. Deployment would result in:
- 100% bounce rate on mobile (>60% of web traffic)
- Accessibility failures
- Poor SEO rankings
- Brand damage

## Known Issues Priority

### P0 - Site Breaking (Mobile)
1. **Loading screen stuck** - Prevents all mobile access
2. **Missing script files** - Core functionality absent
3. **Z-index conflicts** - Makes UI unusable

### P1 - Critical UX (Mobile)
1. **Logo misalignment** - First impression ruined
2. **No touch support** - Interactions don't work
3. **Video overlay broken** - Core feature inaccessible

### P2 - Quality Issues
1. **Performance on mobile** - If it loaded, would be slow
2. **Landscape orientation** - Layout breaks
3. **Animation conflicts** - Competing transitions

## Required Actions Before Production

### Immediate (Block Release)
1. **Create missing mobile JavaScript files**
2. **Fix z-index hierarchy completely**
3. **Resolve CSS transform conflicts**
4. **Implement proper loading system**
5. **Test on real devices**

### Short Term (1 Week)
1. Refactor entire mobile CSS architecture
2. Implement proper touch event system
3. Add mobile-specific performance optimizations
4. Create automated mobile testing suite
5. Document mobile interaction patterns

### Long Term (1 Month)
1. Progressive Web App implementation
2. Offline support for models
3. Adaptive video quality
4. WebXR for mobile AR
5. Gesture-based navigation

## Browser Support

### Desktop (Working)
- ✅ Chrome 90+
- ✅ Safari 15+
- ✅ Firefox 88+
- ✅ Edge 90+

### Mobile (All Broken)
- ❌ iOS Safari
- ❌ Chrome Mobile
- ❌ Firefox Mobile
- ❌ Samsung Internet

## Project Context

### Academic Framework
This project emerged from SCI-Arc's vertical studio investigating fashion's circular economy through architectural intervention. The brief challenged students to design spaces that make garment transformation visible.

### Technical Debt
The project was clearly developed desktop-first with mobile as an afterthought. The attempted mobile fixes reveal a fundamental misunderstanding of responsive design principles and touch interaction patterns.

### Recommendation
Complete ground-up rebuild of mobile experience rather than continuing to patch. Current architecture is fundamentally incompatible with mobile requirements.

---

**Repository**: [github.com/wordingone/wordingone.github.io](https://github.com/wordingone/wordingone.github.io)  
**Status**: Desktop functional, Mobile completely broken  
**Recommendation**: DO NOT DEPLOY - Desktop-only warning required  
**Last Updated**: August 13, 2025

## Contact
For questions about the desktop experience or to report additional issues:
- Create an issue in the GitHub repository
- Note: Mobile support is a known critical failure with no current timeline for resolution