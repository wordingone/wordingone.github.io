// Main entry point - wires together all modules
import { createViewer } from './src/core/viewer.js';
import { loadModels, hideLoading, showError } from './src/load/loadModels.js';
import { buildTowerInstancedMeshes, processRegularModel } from './src/instancing/towerInstancer.js';
import { initLidarBoard } from './src/ui/lidarBoard.js';
import { createVideoOverlay } from './src/overlay/videoOverlay.js';
import { createSync } from './src/sync/controller.js';
import { createModelFocus } from './src/focus/modelFocus.js';
import models from './src/config/models.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Starting modular architectural system...');
    console.log('Modules: viewer, loader, instancer, lidarBoard, sync');
    
    // Get DOM elements
    const canvas = document.getElementById('canvas');
    const loadingElement = document.getElementById('loading');
    const lidarBoardElement = document.getElementById('lidar-board');
    const highlightBtn = document.getElementById('btnHighlight');
    const zoomExtentsBtn = document.getElementById('btnZoomExtents');
    
    // Initialize 3D viewer
    const viewer = createViewer(canvas);
    const { scene, render, dispose } = viewer;
    
    // Initialize sync controller (placeholder callbacks for now)
    const sync = createSync({ viewer, lidar: null }); // Will connect lidar after init
    
    // Initialize video overlay system
    const videoOverlay = createVideoOverlay(lidarBoardElement, {
        onOverlayOpen: (region, hotspot) => {
            console.log(`Video overlay opened for: ${region}`);
            // Disable highlighting when overlay opens
            if (lidar.getHighlighting()) {
                lidar.setHighlighting(false);
            }
            // Hide the Highlight button while zoomed/overlayed
            highlightBtn.style.display = 'none';
        },
        onOverlayClose: () => {
            console.log('Video overlay closed');
            // Overlay closed (via × or ESC) → show Highlight button again
            highlightBtn.style.display = 'block';
            // Force lidar board to reset state after overlay closes
            setTimeout(() => {
                if (lidar.resetState) {
                    lidar.resetState();
                }
            }, 100);
        }
    });
    
    // Initialize LiDAR board with video overlay integration
    const lidar = initLidarBoard(lidarBoardElement, {
        onSelect: (area, hotspot) => {
            // Show video overlay instead of just syncing
            videoOverlay.showOverlay(area, hotspot);
            // Still sync for any 3D interactions
            sync.handleAreaSelect(area, hotspot);
        },
        onZoomExtents: () => {
            // Use video overlay's zoom toggle for proper state management
            videoOverlay.toggleZoom();
            // Only after zoom reset, re-enable the Highlight button
            highlightBtn.style.display = 'block';
            // Force clean state reset after zoom extents
            setTimeout(() => {
                if (lidar.resetState) {
                    lidar.resetState();
                }
            }, 900); // After zoom animation completes
            // Still sync for any 3D interactions
            sync.handleZoomExtents();
        }
    });
    
    // Add question mark hover effects to hotspots
    const hotspots = lidarBoardElement.querySelectorAll('.hotspot');
    videoOverlay.addHoverEffects(hotspots);
    
    try {
        // Load all models
        const loadedScenes = await loadModels(models, {
            onProgress: (loaded, total, modelResult) => {
                console.log(`Model loading progress: ${loaded}/${total} - ${modelResult.name}`);
            },
            onLoaded: (scenes) => {
                console.log('All models loaded, building scene...');
            },
            onError: (error, modelInfo) => {
                showError(loadingElement, `Failed to load ${modelInfo.name}: ${error.message}`);
            }
        });
        
        // Process loaded models
        loadedScenes.forEach(modelResult => {
            const { name, scene: modelScene, isInstanced } = modelResult;
            
            if (isInstanced) {
                // Build instanced tower system
                console.log(`Building instanced system for: ${name}`);
                buildTowerInstancedMeshes(scene, modelScene);
            } else {
                // Process and add regular models
                console.log(`Adding regular model: ${name}`);
                processRegularModel(modelScene, name);
                scene.add(modelScene);
            }
        });
        
        // Hide loading screen
        hideLoading(loadingElement);
        
        // Initial render
        render();
        
        console.log('Modular system initialization complete!');
        
    } catch (error) {
        console.error('Failed to initialize system:', error);
        showError(loadingElement, 'System initialization failed: ' + error.message);
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        console.log('Cleaning up modular system...');
        dispose();
    });
});
