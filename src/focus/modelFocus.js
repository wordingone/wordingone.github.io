import * as THREE from 'three';

/**
 * Advanced Model Focus System with Instance-Level Control
 * @param {THREE.Scene} scene - Three.js scene containing all models
 * @returns {Object} Focus system API
 */
export function createModelFocus(scene) {
    console.log('Initializing advanced 3D model focus system...');
    
    // Model grouping configuration - maps regions to their related 3D models
    // Names must match exactly with models.js configuration
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
            models: ['Misc Geometry'], // Insula visualization
            description: 'Insula components'
        }
    };
    
    // Store original materials for restoration
    const originalMaterials = new Map();
    const modelObjects = new Map(); // Store references to model objects by name
    const instancedMeshes = new Map(); // Store references to instanced meshes
    const backupInstancedMeshes = new Map(); // Store backup of original instanced meshes
    
    let currentFocusRegion = null;
    let isFocusActive = false;
    
    /**
     * Initialize the focus system by cataloging all scene objects
     */
    function initializeFocusSystem() {
        console.log('Cataloging scene objects for focus system...');
        
        scene.traverse((object) => {
            if (object.isMesh || object.isInstancedMesh) {
                // Store original materials
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        originalMaterials.set(object.uuid, object.material.map(mat => mat.clone()));
                    } else {
                        originalMaterials.set(object.uuid, object.material.clone());
                    }
                }
                
                // Catalog objects by their parent scene name if available
                let modelName = 'Unknown';
                if (object.parent && object.parent.userData.modelName) {
                    modelName = object.parent.userData.modelName;
                } else if (object.userData.modelName) {
                    modelName = object.userData.modelName;
                }
                
                // Store references by model name
                if (!modelObjects.has(modelName)) {
                    modelObjects.set(modelName, []);
                }
                modelObjects.get(modelName).push(object);
                
                // Special handling for instanced meshes
                if (object.isInstancedMesh) {
                    instancedMeshes.set(object.uuid, object);
                    // Store a backup reference for restoration
                    backupInstancedMeshes.set(object.uuid, {
                        mesh: object,
                        originalCount: object.count,
                        originalMatrix: object.instanceMatrix.clone()
                    });
                }
            }
        });
        
        console.log(`Cataloged ${originalMaterials.size} objects across ${modelObjects.size} model groups`);
        console.log('Model groups found:', Array.from(modelObjects.keys()));
    }
    
    /**
     * Create ghosted material for unfocused objects
     * @param {THREE.Material} originalMaterial - Original material to ghost
     * @returns {THREE.Material} Ghosted material
     */
    function createGhostedMaterial(originalMaterial) {
        const ghosted = originalMaterial.clone();
        
        // Apply ghosting effects
        ghosted.transparent = true;
        ghosted.opacity = 0.15; // Very transparent
        ghosted.depthWrite = false; // Don't write to depth buffer for proper transparency
        
        // Desaturate colors
        if (ghosted.color) {
            const gray = ghosted.color.r * 0.299 + ghosted.color.g * 0.587 + ghosted.color.b * 0.114;
            ghosted.color.setRGB(gray * 0.5, gray * 0.5, gray * 0.5);
        }
        
        // Handle vertex colors for instanced meshes
        if (ghosted.vertexColors) {
            ghosted.vertexColors = false; // Disable vertex colors for ghosted state
            ghosted.color.setRGB(0.3, 0.3, 0.3); // Set to light gray
        }
        
        return ghosted;
    }
    
    /**
     * Apply focus to specific region - highlight related models, ghost others
     * @param {string} regionName - Name of the region to focus on
     */
    function focusOnRegion(regionName) {
        if (!modelRegionMapping[regionName]) {
            console.warn(`No model mapping found for region: ${regionName}`);
            return;
        }
        
        console.log(`Applying focus to region: ${regionName}`);
        
        const focusConfig = modelRegionMapping[regionName];
        const focusedModels = new Set(focusConfig.models);
        
        currentFocusRegion = regionName;
        isFocusActive = true;
        
        // Process all cataloged objects
        modelObjects.forEach((objects, modelName) => {
            const shouldBeFocused = focusedModels.has(modelName);
            
            objects.forEach(object => {
                if (shouldBeFocused) {
                    // Keep original materials for focused objects
                    restoreOriginalMaterial(object);
                    console.log(`Focusing model: ${modelName}`);
                } else {
                    // Apply ghosted materials to unfocused objects
                    applyGhostedMaterial(object);
                }
            });
        });
        
        // Special handling for instanced meshes (architectural components)
        if (focusedModels.has('Architectural System')) {
            console.log('Focusing on architectural system...');
            handleArchitecturalSystemFocus(regionName, focusConfig);
        }
        
        console.log(`Focus applied: ${focusConfig.description}`);
    }
    
    /**
     * Handle special focus behavior for architectural system with instance-level control
     * @param {string} regionName - Region name for context
     * @param {Object} focusConfig - Focus configuration object
     */
    function handleArchitecturalSystemFocus(regionName, focusConfig) {
        instancedMeshes.forEach((instancedMesh, uuid) => {
            if (focusConfig.instanceMode === 'first-floor-only') {
                console.log(`Applying first-floor-only focus for archive region: ${regionName}`);
                
                // Create a new instanced mesh with only first floor instances (0-1088)
                const firstFloorCount = 33 * 33; // 1,089 instances for first floor
                const original = backupInstancedMeshes.get(uuid);
                
                if (original) {
                    // Create new instance matrix buffer with only first floor
                    const firstFloorMatrix = new THREE.InstancedBufferAttribute(
                        new Float32Array(firstFloorCount * 16), 16
                    );
                    
                    // Copy first floor matrices (instances 0-1088)
                    const originalArray = original.originalMatrix.array;
                    for (let i = 0; i < firstFloorCount; i++) {
                        for (let j = 0; j < 16; j++) {
                            firstFloorMatrix.array[i * 16 + j] = originalArray[i * 16 + j];
                        }
                    }
                    
                    // Update the instanced mesh
                    instancedMesh.count = firstFloorCount;
                    instancedMesh.instanceMatrix = firstFloorMatrix;
                    instancedMesh.instanceMatrix.needsUpdate = true;
                    
                    // Apply focused material (original appearance)
                    restoreOriginalMaterial(instancedMesh);
                    
                    console.log(`Archive focus: Architectural system limited to first floor (${firstFloorCount} instances)`);
                    console.log('Upper floors (instances 1089-2672) are hidden');
                } else {
                    console.warn('No backup found for instanced mesh, using fallback approach');
                    // Fallback: just restore original material
                    restoreOriginalMaterial(instancedMesh);
                }
            } else {
                // For non-archive regions, show all floors normally
                restoreOriginalMaterial(instancedMesh);
            }
        });
    }
    
    /**
     * Apply ghosted material to an object
     * @param {THREE.Object3D} object - Object to apply ghosted material to
     */
    function applyGhostedMaterial(object) {
        if (!object.material) return;
        
        const original = originalMaterials.get(object.uuid);
        if (!original) return;
        
        if (Array.isArray(original)) {
            object.material = original.map(mat => createGhostedMaterial(mat));
        } else {
            object.material = createGhostedMaterial(original);
        }
    }
    
    /**
     * Restore original material to an object
     * @param {THREE.Object3D} object - Object to restore
     */
    function restoreOriginalMaterial(object) {
        if (!object.material) return;
        
        const original = originalMaterials.get(object.uuid);
        if (!original) return;
        
        if (Array.isArray(original)) {
            object.material = original.map(mat => mat.clone());
        } else {
            object.material = original.clone();
        }
    }
    
    /**
     * Clear all focus effects and restore normal appearance
     */
    function clearFocus() {
        if (!isFocusActive) return;
        
        console.log('Clearing focus - restoring all models to normal state');
        
        // Restore all objects to their original materials
        modelObjects.forEach((objects) => {
            objects.forEach(object => {
                restoreOriginalMaterial(object);
            });
        });
        
        // Restore instanced meshes to full tower (all floors)
        instancedMeshes.forEach((instancedMesh, uuid) => {
            const backup = backupInstancedMeshes.get(uuid);
            if (backup) {
                instancedMesh.count = backup.originalCount;
                instancedMesh.instanceMatrix = backup.originalMatrix.clone();
                instancedMesh.instanceMatrix.needsUpdate = true;
                console.log(`Restored full architectural system: ${backup.originalCount} instances`);
            }
        });
        
        currentFocusRegion = null;
        isFocusActive = false;
        
        console.log('Focus cleared - all models and instances restored');
    }
    
    /**
     * Update model catalog after new models are added
     * @param {THREE.Object3D} modelScene - Newly added model scene
     * @param {string} modelName - Name of the model
     */
    function catalogNewModel(modelScene, modelName) {
        console.log(`Cataloging new model: ${modelName}`);
        
        // Add model name to scene userData for identification
        modelScene.userData.modelName = modelName;
        
        modelScene.traverse((object) => {
            if (object.isMesh || object.isInstancedMesh) {
                // Store original materials
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        originalMaterials.set(object.uuid, object.material.map(mat => mat.clone()));
                    } else {
                        originalMaterials.set(object.uuid, object.material.clone());
                    }
                }
                
                // Add to model catalog
                if (!modelObjects.has(modelName)) {
                    modelObjects.set(modelName, []);
                }
                modelObjects.get(modelName).push(object);
                
                // Store instanced mesh references with backup
                if (object.isInstancedMesh) {
                    instancedMeshes.set(object.uuid, object);
                    backupInstancedMeshes.set(object.uuid, {
                        mesh: object,
                        originalCount: object.count,
                        originalMatrix: object.instanceMatrix.clone()
                    });
                    console.log(`Instanced mesh backup created: ${object.count} instances`);
                }
            }
        });
        
        console.log(`Model '${modelName}' cataloged with ${modelObjects.get(modelName).length} objects`);
        
        // Log which regions this model affects
        const affectedRegions = [];
        Object.entries(modelRegionMapping).forEach(([region, config]) => {
            if (config.models.includes(modelName)) {
                affectedRegions.push(region);
            }
        });
        if (affectedRegions.length > 0) {
            console.log(`Affects regions: ${affectedRegions.join(', ')}`);
        }
    }
    
    /**
     * Get available regions for focus
     * @returns {Array} Array of available region names
     */
    function getAvailableRegions() {
        return Object.keys(modelRegionMapping);
    }
    
    /**
     * Check if focus is currently active
     * @returns {boolean} True if focus is active
     */
    function isFocused() {
        return isFocusActive;
    }
    
    /**
     * Get current focused region
     * @returns {string|null} Current focused region or null
     */
    function getCurrentFocus() {
        return currentFocusRegion;
    }
    
    // Initialize the system
    initializeFocusSystem();
    
    console.log('Advanced 3D model focus system initialized with instance-level control');
    
    // Public API
    return {
        focusOnRegion,
        clearFocus,
        catalogNewModel,
        getAvailableRegions,
        isFocused,
        getCurrentFocus,
        // Expose mapping for debugging
        getModelMapping: () => modelRegionMapping,
        getModelCatalog: () => modelObjects
    };
}
