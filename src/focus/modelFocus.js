import * as THREE from 'three';
import { createColorSystem, COLOR_STATES, REGION_COLORS } from '../visual/colorSystem.js';

/**
 * Advanced Model Focus System with Cinematic Animations
 * Features: Color tinting, dramatic falling animations, smooth transitions
 */
export function createModelFocus(scene) {
    console.log('Initializing cinematic model focus system...');
    
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
    const originalPositions = new Map(); // Store original positions for animations
    const modelObjects = new Map();
    const instancedMeshes = new Map();
    const backupInstancedMeshes = new Map();
    
    // Animation system
    const animations = new Map(); // Active animations
    const animationDuration = 800; // ms for falling/rising animations
    
    // Initialize color system
    const colorSystem = createColorSystem();
    
    let currentFocusRegion = null;
    let isFocusActive = false;
    let isAnimating = false;

    /**
     * Initialize the focus system by cataloging all scene objects
     */
    function initializeFocusSystem() {
        console.log('Cataloging scene objects for cinematic focus system...');
        
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
                
                // Store original positions for animations
                if (object.parent) {
                    originalPositions.set(object.uuid, {
                        position: object.parent.position.clone(),
                        rotation: object.parent.rotation.clone(),
                        scale: object.parent.scale.clone()
                    });
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
        
        console.log(`Cataloged ${originalMaterials.size} objects for cinematic focus system`);
    }

    /**
     * Apply hover color tinting (no animations on hover)
     */
    function applyHoverHighlight(regionName) {
        if (!modelRegionMapping[regionName] || isAnimating) return;
        
        console.log(`Applying hover color for region: ${regionName}`);
        
        const focusConfig = modelRegionMapping[regionName];
        const focusedModels = new Set(focusConfig.models);
        
        // Apply colors only to focused models
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
        if (isAnimating || isFocusActive) return;
        
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
     * Apply dramatic focus with falling animations and color enhancement
     */
    function focusOnRegion(regionName) {
        if (!modelRegionMapping[regionName] || isAnimating) return;
        
        console.log(`Applying cinematic focus to region: ${regionName}`);
        
        const focusConfig = modelRegionMapping[regionName];
        const focusedModels = new Set(focusConfig.models);
        
        currentFocusRegion = regionName;
        isFocusActive = true;
        isAnimating = true;
        
        const animationPromises = [];
        
        // Process all models
        modelObjects.forEach((objects, modelName) => {
            const shouldStay = focusedModels.has(modelName);
            
            objects.forEach(object => {
                if (shouldStay) {
                    // Apply stronger color tinting to focused models
                    colorSystem.applyRegionalTint(object, regionName, COLOR_STATES.FOCUS);
                } else {
                    // Animate non-focused models falling down and out of frame
                    if (object.parent && modelName !== 'Architectural System') {
                        const promise = animateModelFalling(object.parent);
                        animationPromises.push(promise);
                    }
                }
            });
        });
        
        // Handle architectural system with instance modifications
        if (focusedModels.has('Architectural System')) {
            handleArchitecturalSystemFocus(regionName, focusConfig);
            instancedMeshes.forEach((instancedMesh) => {
                colorSystem.applyRegionalTint(instancedMesh, regionName, COLOR_STATES.FOCUS);
            });
        } else {
            // If architectural system is not focused, animate it falling
            instancedMeshes.forEach((instancedMesh) => {
                if (instancedMesh.parent) {
                    const promise = animateModelFalling(instancedMesh.parent);
                    animationPromises.push(promise);
                }
            });
        }
        
        // Wait for all animations to complete
        Promise.all(animationPromises).then(() => {
            isAnimating = false;
            console.log(`Cinematic focus complete for region: ${regionName}`);
        });
    }

    /**
     * Animate model falling down and out of frame
     */
    function animateModelFalling(modelParent) {
        return new Promise((resolve) => {
            const startPosition = modelParent.position.clone();
            const targetY = startPosition.y - 15; // Fall 15 units down
            const startTime = performance.now();
            
            function animateFall() {
                const currentTime = performance.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                // Smooth easing out for realistic fall
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                
                // Update position
                modelParent.position.y = THREE.MathUtils.lerp(startPosition.y, targetY, easedProgress);
                
                // Add slight rotation for dramatic effect
                modelParent.rotation.x = easedProgress * 0.3;
                modelParent.rotation.z = easedProgress * 0.2;
                
                if (progress < 1) {
                    requestAnimationFrame(animateFall);
                } else {
                    // Make model invisible when it's fallen completely
                    modelParent.visible = false;
                    resolve();
                }
            }
            
            animateFall();
        });
    }

    /**
     * Animate model rising back to original position
     */
    function animateModelRising(modelParent, originalState) {
        return new Promise((resolve) => {
            // Make visible again before animating
            modelParent.visible = true;
            
            const startPosition = modelParent.position.clone();
            const startRotation = modelParent.rotation.clone();
            const startTime = performance.now();
            
            function animateRise() {
                const currentTime = performance.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / (animationDuration * 0.8), 1); // Slightly faster rise
                
                // Smooth easing in for upward motion
                const easedProgress = Math.pow(progress, 2);
                
                // Update position
                modelParent.position.lerpVectors(startPosition, originalState.position, easedProgress);
                modelParent.rotation.x = THREE.MathUtils.lerp(startRotation.x, originalState.rotation.x, easedProgress);
                modelParent.rotation.z = THREE.MathUtils.lerp(startRotation.z, originalState.rotation.z, easedProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateRise);
                } else {
                    // Ensure exact restoration
                    modelParent.position.copy(originalState.position);
                    modelParent.rotation.copy(originalState.rotation);
                    modelParent.scale.copy(originalState.scale);
                    resolve();
                }
            }
            
            animateRise();
        });
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
     * Clear all focus effects with rising animations
     */
    function clearFocus() {
        if (!isFocusActive && !isAnimating) return;
        
        console.log('Clearing focus with rising animations');
        
        isAnimating = true;
        const animationPromises = [];
        
        // Restore colors for all objects
        modelObjects.forEach((objects) => {
            objects.forEach(object => {
                colorSystem.restoreOriginalColors(object);
            });
        });
        
        instancedMeshes.forEach((instancedMesh) => {
            colorSystem.restoreOriginalColors(instancedMesh);
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
        
        // Animate fallen models rising back up
        originalPositions.forEach((originalState, objectId) => {
            // Find the object by traversing scene
            scene.traverse((object) => {
                if (object.uuid === objectId && object.parent && !object.parent.visible) {
                    const promise = animateModelRising(object.parent, originalState);
                    animationPromises.push(promise);
                }
            });
        });
        
        // Wait for all rising animations
        Promise.all(animationPromises).then(() => {
            isAnimating = false;
            isFocusActive = false;
            currentFocusRegion = null;
            console.log('All models restored with rising animations');
        });
    }

    /**
     * Catalog new model for the system
     */
    function catalogNewModel(modelScene, modelName) {
        console.log(`Cataloging new model for cinematic system: ${modelName}`);
        
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
                
                // Store positions
                if (object.parent) {
                    originalPositions.set(object.uuid, {
                        position: object.parent.position.clone(),
                        rotation: object.parent.rotation.clone(),
                        scale: object.parent.scale.clone()
                    });
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
        
        console.log(`✓ Model '${modelName}' cataloged for cinematic system`);
    }

    // Initialize the system
    initializeFocusSystem();
    
    console.log('Cinematic model focus system initialized');
    
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
        isAnimating: () => isAnimating,
        // Color system access
        getRegionalColor: (regionName, state) => colorSystem.getCSSColor(regionName, state),
        getColorDescription: (regionName) => colorSystem.getColorDescription(regionName),
        // Debug access
        getModelMapping: () => modelRegionMapping,
        getModelCatalog: () => modelObjects
    };
}
