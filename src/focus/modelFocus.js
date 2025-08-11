import * as THREE from 'three';
import { createColorSystem, COLOR_STATES, REGION_COLORS } from '../visual/colorSystem.js';

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
            models: ['Architectural System'], // Top 4 floors only
            description: 'Insula components - top 4 floors only',
            instanceMode: 'top-floors-only'
        }
    };
    
    // Store original materials for restoration
    const originalMaterials = new Map();
    const modelObjects = new Map(); // Store references to model objects by name
    const instancedMeshes = new Map(); // Store references to instanced meshes
    const backupInstancedMeshes = new Map(); // Store backup of original instanced meshes
    
    // Initialize color system for regional highlighting
    const colorSystem = createColorSystem();
    
    let currentFocusRegion = null;
    let isFocusActive = false;
    let isHovering = false;
    
    /**
     * Apply hover color tint to region models
     * @param {string} regionName - Region name to highlight
     */
    function applyHoverHighlight(regionName) {
        if (!modelRegionMapping[regionName]) {
            console.warn(`No model mapping found for region: ${regionName}`);
            return;
        }
        
        if (isHovering) {
            console.log(`Already hovering, skipping for: ${regionName}`);
            return;
        }
        
        console.log(`Applying hover highlight for region: ${regionName}`);
        
        const focusConfig = modelRegionMapping[regionName];
        const focusedModels = new Set(focusConfig.models);
        
        console.log(`Focused models for ${regionName}:`, Array.from(focusedModels));
        console.log(`Available model objects:`, Array.from(modelObjects.keys()));
        
        isHovering = true;
        colorSystem.setRegionState(regionName, COLOR_STATES.HOVER);
        
        let objectsProcessed = 0;
        
        // Apply color tint to focused models only
        modelObjects.forEach((objects, modelName) => {
            if (focusedModels.has(modelName)) {
                console.log(`Processing model: ${modelName} with ${objects.length} objects`);
                objects.forEach(object => {
                    console.log(`Applying color to object:`, object.uuid, object.type);
                    colorSystem.applyRegionalTint(object, regionName, COLOR_STATES.HOVER);
                    objectsProcessed++;
                });
            }
        });
        
        // Handle instanced meshes for regions that use Architectural System
        if (focusedModels.has('Architectural System')) {
            console.log(`Processing instanced meshes for region: ${regionName}`);
            instancedMeshes.forEach((instancedMesh) => {
                console.log(`Applying color to instanced mesh:`, instancedMesh.uuid);
                colorSystem.applyRegionalTint(instancedMesh, regionName, COLOR_STATES.HOVER);
                objectsProcessed++;
            });
        }
        
        console.log(`Hover highlight applied to ${objectsProcessed} objects for region: ${regionName}`);
    }
    
    /**
     * Remove hover color tint from all models
     */
    function removeHoverHighlight() {
        if (!isHovering) return;
        
        console.log('Removing hover highlight');
        
        isHovering = false;
        colorSystem.clearState();
        
        // Restore original colors for all objects
        modelObjects.forEach((objects) => {
            objects.forEach(object => {
                colorSystem.restoreOriginalColors(object);
            });
        });
        
        // Restore instanced meshes
        instancedMeshes.forEach((instancedMesh) => {
            colorSystem.restoreOriginalColors(instancedMesh);
        });
    }
    
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
                    
                    // Catalog materials for color system
                    colorSystem.catalogMaterial(object);
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
            } else if (focusConfig.instanceMode === 'top-floors-only') {
                console.log(`Applying top-floors-only focus for insula region: ${regionName}`);
                
                // Show top 4 floors only (floors 2-5, instances 1089-2672)
                const firstFloorCount = 33 * 33; // 1,089 instances (floor 1 - to be hidden)
                const totalCount = 2673; // Total instances
                const topFloorsCount = totalCount - firstFloorCount; // 1,584 instances (floors 2-5)
                const original = backupInstancedMeshes.get(uuid);
                
                if (original) {
                    // Create new instance matrix buffer with only top floors
                    const topFloorsMatrix = new THREE.InstancedBufferAttribute(
                        new Float32Array(topFloorsCount * 16), 16
                    );
                    
                    // Copy top floors matrices (instances 1089-2672)
                    const originalArray = original.originalMatrix.array;
                    for (let i = 0; i < topFloorsCount; i++) {
                        const sourceIndex = firstFloorCount + i; // Start from instance 1089
                        for (let j = 0; j < 16; j++) {
                            topFloorsMatrix.array[i * 16 + j] = originalArray[sourceIndex * 16 + j];
                        }
                    }
                    
                    // Update the instanced mesh
                    instancedMesh.count = topFloorsCount;
                    instancedMesh.instanceMatrix = topFloorsMatrix;
                    instancedMesh.instanceMatrix.needsUpdate = true;
                    
                    // Apply focused material (original appearance)
                    restoreOriginalMaterial(instancedMesh);
                    
                    console.log(`Insula focus: Architectural system limited to top 4 floors (${topFloorsCount} instances)`);
                    console.log('Ground floor (instances 0-1088) is hidden');
                } else {
                    console.warn('No backup found for instanced mesh, using fallback approach');
                    // Fallback: just restore original material
                    restoreOriginalMaterial(instancedMesh);
                }
            } else {
                // For non-special regions, show all floors normally
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
        if (!isFocusActive && !isHovering) return;
        
        console.log('Clearing focus - restoring all models to normal state');
        
        // Clear color system state
        colorSystem.clearState();
        isHovering = false;
        
        // Restore all objects to their original materials and colors
        modelObjects.forEach((objects) => {
            objects.forEach(object => {
                restoreOriginalMaterial(object);
                colorSystem.restoreOriginalColors(object);
            });
        });
        
        // Restore instanced meshes to full tower (all floors) and original colors
        instancedMeshes.forEach((instancedMesh, uuid) => {
            const backup = backupInstancedMeshes.get(uuid);
            if (backup) {
                instancedMesh.count = backup.originalCount;
                instancedMesh.instanceMatrix = backup.originalMatrix.clone();
                instancedMesh.instanceMatrix.needsUpdate = true;
                console.log(`Restored full architectural system: ${backup.originalCount} instances`);
            }
            colorSystem.restoreOriginalColors(instancedMesh);
        });
        
        currentFocusRegion = null;
        isFocusActive = false;
        
        console.log('Focus cleared - all models, instances, and colors restored');
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
        applyHoverHighlight,
        removeHoverHighlight,
        getAvailableRegions,
        isFocused,
        getCurrentFocus,
        // Color system access
        getRegionalColor: (regionName, state) => colorSystem.getCSSColor(regionName, state),
        getColorDescription: (regionName) => colorSystem.getColorDescription(regionName),
        // Expose mapping for debugging
        getModelMapping: () => modelRegionMapping,
        getModelCatalog: () => modelObjects
    };
}
