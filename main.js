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
    console.log('Modules: viewer, loader, instancer, lidarBoard, sync, modelFocus');
    
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
    
    // Initialize model focus system - MUST be after scene is created
    let modelFocus = null; // Will be initialized after models are loaded
    
    // Initialize video overlay system with model focus integration
    const videoOverlay = createVideoOverlay(lidarBoardElement, {
        onOverlayOpen: (region, hotspot) => {
            console.log(`Video overlay opened for: ${region}`);
            // Model focus is already applied when hotspot was clicked
            // Disable highlighting when overlay opens
            if (lidar.getHighlighting()) {
                lidar.setHighlighting(false);
            }
            // Hide the Highlight button while zoomed/overlayed
            highlightBtn.style.display = 'none';
        },
        onOverlayClose: () => {
            console.log('Video overlay closed');
            // Clear model focus when overlay closes
            if (modelFocus) {
                modelFocus.clearFocus();
                console.log('Cleared 3D model focus - all models restored');
                // Force immediate render to show focus clear
                render();
            }
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
    
    // Initialize LiDAR board with video overlay integration and color hover effects
    const lidar = initLidarBoard(lidarBoardElement, {
        onSelect: (area, hotspot) => {
            // Apply model focus IMMEDIATELY when hotspot is clicked (before zoom/overlay)
            if (modelFocus) {
                modelFocus.focusOnRegion(area);
                console.log(`Applied 3D model focus immediately for region: ${area}`);
                // Force immediate render to show focus effect
                render();
            }
            
            // Show video overlay (this will trigger zoom animation)
            videoOverlay.showOverlay(area, hotspot);
            // Still sync for any 3D interactions
            sync.handleAreaSelect(area, hotspot);
        },
        onHover: (area, hotspot) => {
            // Apply subtle color tinting on hover
            console.log(`HOVER DEBUG: Attempting to apply color for region: ${area}`);
            if (modelFocus) {
                try {
                    modelFocus.applyHoverHighlight(area);
                    console.log(`✓ Applied hover color highlight for region: ${area}`);
                    // Force immediate render to show color changes
                    render();
                } catch (error) {
                    console.error('Error applying hover highlight:', error);
                }
            } else {
                console.warn('modelFocus not available for hover highlighting');
            }
        },
        onHoverEnd: (area, hotspot) => {
            // Remove color tinting when hover ends (but only if not in focus mode)
            if (modelFocus && !modelFocus.isFocused()) {
                modelFocus.removeHoverHighlight();
                console.log(`Removed hover color highlight for region: ${area}`);
                // Force immediate render to show color changes
                render();
            }
        },
        onZoomExtents: () => {
            // Clear model focus FIRST when zoom extents is clicked
            if (modelFocus) {
                modelFocus.clearFocus();
                console.log('Cleared 3D model focus via Zoom Extents');
                // Force immediate render to show focus clear
                render();
            }
            
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
        
        // Initialize model focus system AFTER all models are loaded and added to scene
        modelFocus = createModelFocus(scene);
        console.log('Model focus system initialized with all models cataloged');
        
        // Catalog all models for the focus system with proper name mapping
        loadedScenes.forEach(modelResult => {
            const { name, scene: modelScene } = modelResult;
            // Map file names to display names for focus system
            const displayName = mapModelName(name);
            if (modelFocus && modelFocus.catalogNewModel) {
                modelFocus.catalogNewModel(modelScene, displayName);
            }
        });
        
        // Hide loading screen
        hideLoading(loadingElement);
        
        // Show onboarding overlay after loading
        setTimeout(() => {
            const onboarding = document.getElementById('onboarding-overlay');
            if (onboarding && !sessionStorage.getItem('onboardingShown')) {
                onboarding.classList.add('active');
                setTimeout(() => {
                    onboarding.classList.add('visible');
                }, 50);
                
                // Set up close handlers
                const closeBtn = onboarding.querySelector('.onboarding-close');
                const startBtn = onboarding.querySelector('.onboarding-start');
                
                const closeOnboarding = () => {
                    onboarding.classList.remove('visible');
                    setTimeout(() => {
                        onboarding.classList.remove('active');
                        sessionStorage.setItem('onboardingShown', 'true');
                    }, 400);
                };
                
                closeBtn.addEventListener('click', closeOnboarding);
                startBtn.addEventListener('click', closeOnboarding);
                
                // Close on Escape key
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && onboarding.classList.contains('visible')) {
                        closeOnboarding();
                    }
                });
            }
        }, 500);
        
        // Initial render
        render();
        
        console.log('Modular system initialization complete with model focus integration!');
        console.log('Available focus regions:', modelFocus ? modelFocus.getAvailableRegions() : 'None');
        
        // Expose modelFocus for debugging (development only)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.modelFocus = modelFocus;
            console.log('Model focus system exposed to window.modelFocus for debugging');
        }
        
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

/**
 * Map model file names to display names used by focus system
 * @param {string} fileName - Original file name from models config
 * @returns {string} Display name for focus system
 */
function mapModelName(fileName) {
    const nameMapping = {
        'Architectural System': 'Architectural System',
        'Misc Geometry': 'Misc Geometry',
        'Altars': 'Altars',
        'Circulation': 'Circulation',
        'Distress': 'Distress',
        'Embellishments': 'Embellishments',
        'Index': 'Index',
        'Mirror': 'Mirror',
        'Moulage': 'Moulage',
        'Robot': 'Robot'
    };
    
    return nameMapping[fileName] || fileName;
}
