import * as THREE from 'three';
import { createColorSystem, COLOR_STATES, REGION_COLORS } from '../visual/colorSystem.js';

/**
 * Advanced Model Focus System with Enhanced Color Tinting and Ghosting
 * Features: Strong color tinting, ghosting effects for non-focused models
 * Back to the working ghosting approach with enhanced colors
 */
export function createModelFocus(scene) {
    console.log('Initializing enhanced ghosting model focus system...');
    
    // Model grouping configuration - maps regions to their related 3D models
    const modelRegionMapping = {
        'altar': {
            models: ['Altars', 'Distress', 'Embellishments', 'Moulage', 'Robot'],
            description: 'Altar series components (5 models)'
        },
        'mirror': {
            models: ['Mirror'],
            description: 'Mirror components (1 model)'
        },
        'index': {
            models: ['Index'],
            description: 'Index components (1 model)'
        },
        'circulation_1': {
            models: ['Circulation'],
            description: 'Circulation components (1 model)'
        },
        'archive_inside': {
            models: ['Architectural System'], // First floor only
            description: 'Archive series - first floor architectural components',
            instanceMode: 'first-floor-only'
        },
        'archive_2': {
            models: ['Architectural System'], // First floor only
            description: 'Archive series - first floor architectural components',
            instanceMode: 'first-floor-only'
        },
        'red_dye': {
            models: ['Misc Geometry'], // Red dye visualization
            description: 'Red dye related components'
        },
        'insula': {
            models: ['Architectural System'], // Top 4 floors only
            description: 'Insula components - top 4 floors only',
            instanceMode: 'top-floors-only'
        }
    };
    
    // Store original states for restoration
    const originalMaterials = new Map();
    const modelObjects = new Map();
    const instancedMeshes = new Map();
    const backupInstancedMeshes = new Map();
    
    // Initialize color system
    const colorSystem = createColorSystem();
    
    let currentFocusRegion = null;
    let isFocusActive = false;

    /**
     * Initialize the focus system by cataloging all scene objects
     */
    function initializeFocusSystem() {
        console.log('Cataloging scene objects for enhanced ghosting focus system...');
        
        scene.traverse((object) => {
            if (object.isMesh || object.isInstancedMesh) {
                // Store original materials
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        originalMaterials.set(object.uuid, object.material.map(mat => mat.clone()));
                    } else {
                        originalMaterials.set(object.uuid, object.material.clone());
                    }
                    colorSystem.catalogMaterial(object);
                }
                
                // Catalog objects by their parent scene name
                let modelName = 'Unknown';
                if (object.parent && object.parent.userData.modelName) {
                    modelName = object.parent.userData.modelName;
                } else if (object.userData.modelName) {
                    modelName = object.userData.modelName;
                }
                
                if (!modelObjects.has(modelName)) {
                    modelObjects.set(modelName, []);
                }
                modelObjects.get(modelName).push(object);
                
                if (object.isInstancedMesh) {
                    instancedMeshes.set(object.uuid, object);
                    backupInstancedMeshes.set(object.uuid, {
                        mesh: object,
                        originalCount: object.count,
                        originalMatrix: object.instanceMatrix.clone()
                    });
                }
            }
        });
        
        console.log(`Cataloged ${originalMaterials.size} objects for enhanced ghosting focus system`);
    }

    /**
     * Apply hover color tinting (no ghosting on hover)
     */
    function applyHoverHighlight(regionName) {
        if (!modelRegionMapping[regionName] || isFocusActive) return;
        
        console.log(`Applying enhanced hover color for region: ${regionName}`);
        
        const focusConfig = modelRegionMapping[regionName];
        const focusedModels = new Set(focusConfig.models);
        
        // Apply stronger colors to focused models only during hover
        modelObjects.forEach((objects, modelName) => {
            if (focusedModels.has(modelName)) {
                objects.forEach(object => {
                    colorSystem.applyRegionalTint(object, regionName, COLOR_STATES.HOVER);
                });
            }
        });
        
        // Handle architectural system
        if (focusedModels.has('Architectural System')) {
            instancedMeshes.forEach((instancedMesh) => {
                colorSystem.applyRegionalTint(instancedMesh, regionName, COLOR_STATES.HOVER);
            });
        }
    }

    /**
     * Remove hover highlighting
     */
    function removeHoverHighlight() {
        if (isFocusActive) return;
        
        console.log('Removing hover colors');
        
        modelObjects.forEach((objects) => {
            objects.forEach(object => {
                colorSystem.restoreOriginalColors(object);
            });
        });
        
        instancedMeshes.forEach((instancedMesh) => {
            colorSystem.restoreOriginalColors(instancedMesh);
        });
    }

    /**
     * Apply focus with light gray/white focused models and ghosting
     */
    function focusOnRegion(regionName) {
        if (!modelRegionMapping[regionName]) return;
        
        console.log(`Applying focus to region: ${regionName}`);
        
        const focusConfig = modelRegionMapping[regionName];
        const focusedModels = new Set(focusConfig.models);
        
        currentFocusRegion = regionName;
        isFocusActive = true;
        
        // Process all models
        modelObjects.forEach((objects, modelName) => {
            const shouldStay = focusedModels.has(modelName);
            
            objects.forEach(object => {
                if (shouldStay) {
                    // Apply light gray/white color to focused models (like original scheme)
                    applyFocusColor(object);
                } else {
                    // Apply ghosting to non-focused models
                    applyGhosting(object);
                }
            });
        });
        
        // Handle architectural system with instance modifications
        if (focusedModels.has('Architectural System')) {
            handleArchitecturalSystemFocus(regionName, focusConfig);
            instancedMeshes.forEach((instancedMesh) => {
                applyFocusColor(instancedMesh);
            });
        } else {
            // If architectural system is not focused, ghost it
            instancedMeshes.forEach((instancedMesh) => {
                applyGhosting(instancedMesh);
            });
        }
        
        console.log(`Focus complete for region: ${regionName}`);
    }

    /**
     * Apply light gray/white color to focused models
     */
    function applyFocusColor(object) {
        if (object.material) {
            const lightGrayColor = new THREE.Color(0xcccccc); // Light gray/white-ish
            
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    material.color.copy(lightGrayColor);
                    material.transparent = false;
                    material.opacity = 1.0;
                    material.needsUpdate = true;
                });
            } else {
                object.material.color.copy(lightGrayColor);
                object.material.transparent = false;
                object.material.opacity = 1.0;
                object.material.needsUpdate = true;
            }
        }
    }

    /**
     * Apply ghosting effect to object
     */
    function applyGhosting(object) {
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    material.transparent = true;
                    material.opacity = 0.15; // 15% opacity for ghosting
                    material.needsUpdate = true;
                });
            } else {
                object.material.transparent = true;
                object.material.opacity = 0.15; // 15% opacity for ghosting
                object.material.needsUpdate = true;
            }
        }
    }

    /**
     * Handle architectural system focus (instance-level control)
     */
    function handleArchitecturalSystemFocus(regionName, focusConfig) {
        instancedMeshes.forEach((instancedMesh, uuid) => {
            if (focusConfig.instanceMode === 'first-floor-only') {
                // Archive regions: Show only first floor
                const firstFloorCount = 33 * 33;
                const original = backupInstancedMeshes.get(uuid);
                
                if (original) {
                    const firstFloorMatrix = new THREE.InstancedBufferAttribute(
                        new Float32Array(firstFloorCount * 16), 16
                    );
                    
                    const originalArray = original.originalMatrix.array;
                    for (let i = 0; i < firstFloorCount; i++) {
                        for (let j = 0; j < 16; j++) {
                            firstFloorMatrix.array[i * 16 + j] = originalArray[i * 16 + j];
                        }
                    }
                    
                    instancedMesh.count = firstFloorCount;
                    instancedMesh.instanceMatrix = firstFloorMatrix;
                    instancedMesh.instanceMatrix.needsUpdate = true;
                    
                    console.log(`Archive focus: First floor only (${firstFloorCount} instances)`);
                }
            } else if (focusConfig.instanceMode === 'top-floors-only') {
                // Insula region: Show only top 4 floors
                const firstFloorCount = 33 * 33;
                const totalCount = 2673;
                const topFloorsCount = totalCount - firstFloorCount;
                const original = backupInstancedMeshes.get(uuid);
                
                if (original) {
                    const topFloorsMatrix = new THREE.InstancedBufferAttribute(
                        new Float32Array(topFloorsCount * 16), 16
                    );
                    
                    const originalArray = original.originalMatrix.array;
                    for (let i = 0; i < topFloorsCount; i++) {
                        const sourceIndex = firstFloorCount + i;
                        for (let j = 0; j < 16; j++) {
                            topFloorsMatrix.array[i * 16 + j] = originalArray[sourceIndex * 16 + j];
                        }
                    }
                    
                    instancedMesh.count = topFloorsCount;
                    instancedMesh.instanceMatrix = topFloorsMatrix;
                    instancedMesh.instanceMatrix.needsUpdate = true;
                    
                    console.log(`Insula focus: Top 4 floors only (${topFloorsCount} instances)`);
                }
            }
        });
    }

    /**
     * Clear all focus effects
     */
    function clearFocus() {
        if (!isFocusActive) return;
        
        console.log('Clearing focus and restoring original materials');
        
        // Restore original materials for all objects
        modelObjects.forEach((objects) => {
            objects.forEach(object => {
                const original = originalMaterials.get(object.uuid);
                if (original && object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material, index) => {
                            if (original[index]) {
                                material.color.copy(original[index].color);
                                material.transparent = false;
                                material.opacity = 1.0;
                                material.needsUpdate = true;
                            }
                        });
                    } else {
                        object.material.color.copy(original.color);
                        object.material.transparent = false;
                        object.material.opacity = 1.0;
                        object.material.needsUpdate = true;
                    }
                }
            });
        });
        
        instancedMeshes.forEach((instancedMesh) => {
            const original = originalMaterials.get(instancedMesh.uuid);
            if (original && instancedMesh.material) {
                if (Array.isArray(instancedMesh.material)) {
                    instancedMesh.material.forEach((material, index) => {
                        if (original[index]) {
                            material.color.copy(original[index].color);
                            material.transparent = false;
                            material.opacity = 1.0;
                            material.needsUpdate = true;
                        }
                    });
                } else {
                    instancedMesh.material.color.copy(original.color);
                    instancedMesh.material.transparent = false;
                    instancedMesh.material.opacity = 1.0;
                    instancedMesh.material.needsUpdate = true;
                }
            }
        });
        
        // Restore architectural system instances
        instancedMeshes.forEach((instancedMesh, uuid) => {
            const backup = backupInstancedMeshes.get(uuid);
            if (backup) {
                instancedMesh.count = backup.originalCount;
                instancedMesh.instanceMatrix = backup.originalMatrix.clone();
                instancedMesh.instanceMatrix.needsUpdate = true;
            }
        });
        
        isFocusActive = false;
        currentFocusRegion = null;
        console.log('All models restored to original colors');
    }

    /**
     * Catalog new model for the system
     */
    function catalogNewModel(modelScene, modelName) {
        console.log(`Cataloging new model for enhanced ghosting system: ${modelName}`);
        
        modelScene.userData.modelName = modelName;
        
        modelScene.traverse((object) => {
            if (object.isMesh || object.isInstancedMesh) {
                // Store materials
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        originalMaterials.set(object.uuid, object.material.map(mat => mat.clone()));
                    } else {
                        originalMaterials.set(object.uuid, object.material.clone());
                    }
                    colorSystem.catalogMaterial(object);
                }
                
                // Catalog
                if (!modelObjects.has(modelName)) {
                    modelObjects.set(modelName, []);
                }
                modelObjects.get(modelName).push(object);
                
                if (object.isInstancedMesh) {
                    instancedMeshes.set(object.uuid, object);
                    backupInstancedMeshes.set(object.uuid, {
                        mesh: object,
                        originalCount: object.count,
                        originalMatrix: object.instanceMatrix.clone()
                    });
                }
            }
        });
        
        console.log(`✓ Model '${modelName}' cataloged for enhanced ghosting system`);
    }

    // Initialize the system
    initializeFocusSystem();
    
    console.log('Enhanced ghosting model focus system initialized');
    
    // Public API
    return {
        focusOnRegion,
        clearFocus,
        catalogNewModel,
        applyHoverHighlight,
        removeHoverHighlight,
        getAvailableRegions: () => Object.keys(modelRegionMapping),
        isFocused: () => isFocusActive,
        getCurrentFocus: () => currentFocusRegion,
        isAnimating: () => false, // No animations in ghosting system
        // Color system access
        getRegionalColor: (regionName, state) => colorSystem.getCSSColor(regionName, state),
        getColorDescription: (regionName) => colorSystem.getColorDescription(regionName),
        // Debug access
        getModelMapping: () => modelRegionMapping,
        getModelCatalog: () => modelObjects
    };
}
