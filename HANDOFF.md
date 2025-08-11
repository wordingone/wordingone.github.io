# HANDOFF — Verification-First

## Meta
Date: 2025-08-10 · Repo: B:\GIT\wordingone.github.io
Status: BLOCKED - Video overlay positioning failure

## Problem
Implement frame-based video overlay system where overlays position within clicked hotspot regions during zoom animations.

## Acceptance Criteria
- Video overlays position within clicked hotspot frames during zoom
- Zoom extents button toggles between zoomed and normal view states
- Overlay visibility maintained during zoom transitions

## Evidence — Before
Console: Video overlays positioned at fixed top-right corner
Network: Overlays outside zoom view during transitions
Files:
| path | bytes | behavior |
|------|------:|----------|
| src/overlay/videoOverlay.js | 4.2KB | Fixed positioning system |
| style.css | 15.8KB | Top-right overlay styles |
| main.js | 3.1KB | Basic zoom extents callback |

## Changes
Diffs/commits: Frame-based overlay system implemented
Commands:
```javascript
// Created invisible region frames tracking hotspot coordinates
createRegionFrame(hotspot) -> frame with scaled positioning

// Added frame-positioned overlay CSS classes
.video-overlay.frame-positioned -> absolute positioning within lidar board

// Updated zoom extents to toggle zoom state
videoOverlay.toggleZoom() -> manages zoom in/out transitions
```

## Evidence — After
Console: Overlay positioning logs show creation but CSS visibility failure
Network: Video overlay elements created in DOM but not visible
Files:
| path | bytes | issue |
|------|------:|-------|
| src/overlay/videoOverlay.js | 7.8KB | Positioning logic based on wrong viewport |
| style.css | 18.2KB | CSS transitions not triggering properly |
| main.js | 3.3KB | Integration working but overlay invisible |

## Results vs Criteria
1) ❌ FAIL — Video overlays invisible except when DevTools open
2) ✅ PASS — Zoom extents button toggles between zoomed and normal view states  
3) ❌ FAIL — Overlay visibility broken during zoom transitions

## Resolution
BLOCKED — Video overlay positioning system fundamentally broken

## Current Issues
- **Overlay only visible when DevTools open**: Suggests viewport calculation error
- **Tiny scale when visible**: Indicates coordinate system mismatch 
- **Wrong viewport reference**: Using main-panel dimensions instead of actual visible area
- **CSS transition conflicts**: Forced reflow not resolving visibility issues

## Changes Since Last Handoff
- **BROKEN**: Multiple failed attempts to fix overlay positioning
- Viewport calculation logic using wrong coordinate system 
- CSS positioning conflicts between inline styles and class transitions
- Forced reflow attempts did not resolve visibility timing issues
- Overlay coordinates calculated but not displayed in correct viewport space

## Risks & Rollback
High risk — Fundamental positioning system broken · Rollback: Need to completely redesign viewport calculation approach

Open items:
- [ ] CRITICAL: Fix overlay visibility — overlays only appear when DevTools open (owner: dev)
- [ ] CRITICAL: Correct viewport coordinate system — current logic uses wrong reference frame (owner: dev)
- [ ] Investigate CSS transition conflicts preventing proper overlay display (owner: CSS)