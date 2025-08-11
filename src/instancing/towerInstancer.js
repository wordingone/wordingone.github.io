import * as THREE from 'three';

/**
 * Build tower instanced meshes from the architectural model
 * @param {THREE.Scene} scene - Scene to add instanced meshes to
 * @param {THREE.Object3D} modelScene - Loaded architectural model scene
 * @returns {Array} Array of created instanced meshes
 */
export function buildTowerInstancedMeshes(scene, modelScene) {
    console.log('Creating advanced instanced system with GPU optimizations...');
    
    const instancedMeshes = [];
    
    // Get model size for instance positioning
    const box = new THREE.Box3().setFromObject(modelScene);
    const size = box.getSize(new THREE.Vector3());
    
    console.log('Architectural model size:', size.x.toFixed(2), '×', size.y.toFixed(2), '×', size.z.toFixed(2));
    
    // Collect all unique geometries and materials
    const geometryMaterialPairs = [];
    
    modelScene.traverse(function(child) {
        if (child.isMesh) {
            geometryMaterialPairs.push({
                geometry: child.geometry,
                material: child.material
            });
        }
    });
    
    console.log(`Found ${geometryMaterialPairs.length} geometry-material pairs`);
    
    // Create instanced meshes for each unique geometry
    geometryMaterialPairs.forEach((pair, index) => {
        const { geometry, material } = pair;
        
        // Create optimized material
        const optimizedMaterial = createOptimizedMaterial(material);
        
        // Create instanced mesh with advanced optimizations
        const instancedMesh = createAdvancedInstancedMesh(geometry, optimizedMaterial);
        
        // Set up transformation matrices using efficient method
        setupInstanceMatrices(instancedMesh, size);
        
        // Apply GPU-level optimizations
        applyGPUOptimizations(instancedMesh);
        
        scene.add(instancedMesh);
        instancedMeshes.push(instancedMesh);
        
        console.log(`Created advanced instanced mesh ${index + 1} with ${instancedMesh.count} instances`);
    });
    
    console.log('Advanced instanced system complete!');
    return instancedMeshes;
}

/**
 * Create optimized material for instancing
 * @param {THREE.Material} originalMaterial - Original material to optimize
 * @returns {THREE.MeshBasicMaterial} Optimized material
 */
function createOptimizedMaterial(originalMaterial) {
    const optimizedMaterial = new THREE.MeshBasicMaterial({
        transparent: false,
        alphaTest: 0,
        side: THREE.FrontSide,
        vertexColors: true, // Enable vertex colors for baked lighting
        fog: false
    });
    
    // Copy and optimize texture if exists
    if (originalMaterial.map) {
        const texture = originalMaterial.map.clone();
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        optimizedMaterial.map = texture;
    }
    
    return optimizedMaterial;
}

/**
 * Create advanced instanced mesh with optimized geometry
 * @param {THREE.BufferGeometry} geometry - Original geometry
 * @param {THREE.Material} material - Optimized material
 * @returns {THREE.InstancedMesh} Instanced mesh
 */
function createAdvancedInstancedMesh(geometry, material) {
    // Optimize geometry first
    const optimizedGeometry = optimizeGeometry(geometry);
    
    // Calculate total instances for all 5 floors
    const floor1Count = 33 * 33; // 1,089 instances (solid base)
    const borderCount = calculateBorderInstances(); // 396 instances per border floor
    const borderFloors = 4; // Floors 2, 3, 4, 5
    const totalCount = floor1Count + (borderCount * borderFloors); // 1,089 + (396 × 4) = 2,673 total
    
    console.log(`Creating 5-floor tower with ${totalCount} total instances:`);
    console.log(`- Floor 1 (solid): ${floor1Count} instances`);
    console.log(`- Floors 2-5 (borders): ${borderCount} × ${borderFloors} = ${borderCount * borderFloors} instances`);
    
    // Create instanced mesh with total count for all floors
    const instancedMesh = new THREE.InstancedMesh(optimizedGeometry, material, totalCount);
    
    return instancedMesh;
}

/**
 * Optimize geometry for instancing
 * @param {THREE.BufferGeometry} geometry - Original geometry
 * @returns {THREE.BufferGeometry} Optimized geometry
 */
function optimizeGeometry(geometry) {
    const optimizedGeometry = geometry.clone();
    
    // Remove unnecessary attributes but keep what we need for shading
    const attributesToKeep = ['position', 'normal', 'uv'];
    Object.keys(optimizedGeometry.attributes).forEach(name => {
        if (!attributesToKeep.includes(name)) {
            optimizedGeometry.deleteAttribute(name);
        }
    });
    
    // Generate efficient baked lighting via vertex colors (deterministic)
    generateBakedLighting(optimizedGeometry);
    
    // Compute optimized bounding sphere
    optimizedGeometry.computeBoundingSphere();
    
    // Dispose of morph attributes if present
    if (optimizedGeometry.morphAttributes) {
        optimizedGeometry.morphAttributes = {};
    }
    
    console.log(`Optimized geometry with baked lighting: ${optimizedGeometry.attributes.position.count} vertices`);
    
    return optimizedGeometry;
}

/**
 * Generate baked lighting using vertex colors (deterministic version)
 * @param {THREE.BufferGeometry} geometry - Geometry to add vertex colors to
 */
function generateBakedLighting(geometry) {
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const vertexCount = positions.count;
    
    // Pre-calculate lighting directions (simulating typical architectural lighting)
    const lightDir1 = new THREE.Vector3(0.5, 0.8, 0.3).normalize(); // Main light from above-front
    const lightDir2 = new THREE.Vector3(-0.3, 0.2, -0.8).normalize(); // Fill light
    const ambientLevel = 0.3; // Ambient lighting level
    
    // Create color array for vertex colors
    const colors = new Float32Array(vertexCount * 3);
    const normal = new THREE.Vector3();
    
    for (let i = 0; i < vertexCount; i++) {
        // Get vertex normal
        normal.fromBufferAttribute(normals, i);
        
        // Calculate lighting using simple but effective Lambert shading
        const lightContrib1 = Math.max(0, normal.dot(lightDir1)) * 0.7;
        const lightContrib2 = Math.max(0, normal.dot(lightDir2)) * 0.3;
        const totalLight = Math.min(1.0, ambientLevel + lightContrib1 + lightContrib2);
        
        // Apply deterministic variation based on vertex index (no Math.random)
        const hash = (i * 2654435761) % 2147483647; // Simple hash function
        const variation = 0.85 + (hash / 2147483647) * 0.1; // 0.85 to 0.95 range (darker than before)
        const finalIntensity = totalLight * variation * 0.7; // Additional 0.7 multiplier to make overall darker
        
        // Set RGB color with darker gray tones (architectural concrete feel)
        colors[i * 3] = finalIntensity * 0.8;     // R - darker red component
        colors[i * 3 + 1] = finalIntensity * 0.82; // G - slightly less dark
        colors[i * 3 + 2] = finalIntensity * 0.85;  // B - lightest component for cool tone
    }
    
    // Add color attribute to geometry
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    console.log('Generated deterministic baked lighting with darker gray vertex colors');
}

/**
 * Generate baked lighting using vertex colors (original brightness for non-instanced models)
 * @param {THREE.BufferGeometry} geometry - Geometry to add vertex colors to
 */
function generateOriginalBakedLighting(geometry) {
    const positions = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const vertexCount = positions.count;
    
    // Pre-calculate lighting directions (simulating typical architectural lighting)
    const lightDir1 = new THREE.Vector3(0.5, 0.8, 0.3).normalize(); // Main light from above-front
    const lightDir2 = new THREE.Vector3(-0.3, 0.2, -0.8).normalize(); // Fill light
    const ambientLevel = 0.3; // Ambient lighting level
    
    // Create color array for vertex colors
    const colors = new Float32Array(vertexCount * 3);
    const normal = new THREE.Vector3();
    
    for (let i = 0; i < vertexCount; i++) {
        // Get vertex normal
        normal.fromBufferAttribute(normals, i);
        
        // Calculate lighting using simple but effective Lambert shading
        const lightContrib1 = Math.max(0, normal.dot(lightDir1)) * 0.7;
        const lightContrib2 = Math.max(0, normal.dot(lightDir2)) * 0.3;
        const totalLight = Math.min(1.0, ambientLevel + lightContrib1 + lightContrib2);
        
        // Apply deterministic variation based on vertex index (no Math.random)
        const hash = (i * 2654435761) % 2147483647; // Simple hash function
        const variation = 0.95 + (hash / 2147483647) * 0.1; // 0.95 to 1.05 range (original brightness)
        const finalIntensity = totalLight * variation; // No additional darkening multiplier
        
        // Set RGB color (slight warm tint for architectural feel - original coloring)
        colors[i * 3] = finalIntensity * 0.95;     // R - slightly less red
        colors[i * 3 + 1] = finalIntensity * 0.97; // G - neutral
        colors[i * 3 + 2] = finalIntensity * 1.0;  // B - slightly more blue
    }
    
    // Add color attribute to geometry
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    console.log('Generated original brightness baked lighting for non-instanced model');
}

/**
 * Set up instance matrices for 5-floor tower
 * @param {THREE.InstancedMesh} instancedMesh - Instanced mesh to configure
 * @param {THREE.Vector3} size - Size of individual model unit
 */
function setupInstanceMatrices(instancedMesh, size) {
    // Pre-allocate matrix for reuse (memory optimization)
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);
    
    let instanceIndex = 0;
    
    // Calculate center offset to position world origin at center of first floor
    const gridSize = 33;
    const centerOffset = (gridSize - 1) * 0.5; // Offset to center the grid
    
    // Calculate total instances needed for all 5 floors
    const floor1Instances = 33 * 33; // Full grid: 1,089 instances
    const borderInstances = calculateBorderInstances(); // Border only: 396 instances per floor
    const totalBorderFloors = 4; // Floors 2, 3, 4, 5
    const totalInstances = floor1Instances + (borderInstances * totalBorderFloors);
    
    console.log(`Setting up ${totalInstances} instances across 5 floors:`);
    console.log(`- Floor 1 (solid): ${floor1Instances} instances`);
    console.log(`- Floors 2-5 (borders): ${borderInstances} instances each (${borderInstances * totalBorderFloors} total)`);
    console.log(`- Grid centered at origin with offset: ${centerOffset.toFixed(2)}`);
    
    // Floor 1: Full 33x33 grid at ground level (y = 0) - CENTERED
    for (let x = 0; x < 33; x++) {
        for (let z = 0; z < 33; z++) {
            // Center the grid so origin is at the center of the footprint
            position.set(
                (x - centerOffset) * size.x, 
                0, 
                (z - centerOffset) * size.z
            );
            matrix.compose(position, quaternion, scale);
            instancedMesh.setMatrixAt(instanceIndex, matrix);
            instanceIndex++;
        }
    }
    
    // Floors 2-5: Hollow borders at elevated levels - CENTERED
    for (let floor = 2; floor <= 5; floor++) {
        const floorY = size.y * (floor - 1); // Direct stacking - each floor sits on top of the previous
        
        for (let x = 0; x < 33; x++) {
            for (let z = 0; z < 33; z++) {
                // Only place instances in the 3-cell thick border
                if (isBorderCell(x, z)) {
                    // Center the grid so origin is at the center of the footprint
                    position.set(
                        (x - centerOffset) * size.x, 
                        floorY, 
                        (z - centerOffset) * size.z
                    );
                    matrix.compose(position, quaternion, scale);
                    instancedMesh.setMatrixAt(instanceIndex, matrix);
                    instanceIndex++;
                }
            }
        }
        
        console.log(`Floor ${floor} completed at height ${floorY.toFixed(2)} with ${borderInstances} border instances`);
    }
    
    console.log(`Placed ${instanceIndex} total instances across 5-floor tower (centered at origin)`);
    
    // Mark for GPU upload
    instancedMesh.instanceMatrix.needsUpdate = true;
    
    // Set usage hint for GPU optimization
    instancedMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage); // Matrices won't change
}

/**
 * Check if cell is in the 3-thick border
 * @param {number} x - Grid X coordinate
 * @param {number} z - Grid Z coordinate
 * @returns {boolean} True if cell is in border
 */
export function isBorderCell(x, z) {
    // Border cells are: x < 3 OR x >= 30 OR z < 3 OR z >= 30
    return (x < 3 || x >= 30 || z < 3 || z >= 30);
}

/**
 * Calculate total border cells in a 33x33 grid with 3-thick border
 * @returns {number} Number of border instances
 */
function calculateBorderInstances() {
    let count = 0;
    for (let x = 0; x < 33; x++) {
        for (let z = 0; z < 33; z++) {
            if (isBorderCell(x, z)) {
                count++;
            }
        }
    }
    return count;
}

/**
 * Apply GPU-level optimizations to instanced mesh
 * @param {THREE.InstancedMesh} instancedMesh - Mesh to optimize
 */
function applyGPUOptimizations(instancedMesh) {
    // Frustum culling at instance level
    instancedMesh.frustumCulled = true;
    
    // Disable shadows for performance
    instancedMesh.castShadow = false;
    instancedMesh.receiveShadow = false;
    
    // Set render order for optimal batching
    instancedMesh.renderOrder = 0;
    
    // Disable automatic matrix updates
    instancedMesh.matrixAutoUpdate = false;
    
    // Set static draw usage for GPU buffer optimization
    if (instancedMesh.geometry.attributes.position) {
        instancedMesh.geometry.attributes.position.setUsage(THREE.StaticDrawUsage);
    }
    if (instancedMesh.geometry.index) {
        instancedMesh.geometry.index.setUsage(THREE.StaticDrawUsage);
    }
    
    console.log('Applied GPU optimizations to instanced mesh');
}

/**
 * Process regular (non-instanced) models for consistent rendering
 * @param {THREE.Object3D} modelScene - Model scene to process
 * @param {string} modelName - Name of the model for logging
 */
export function processRegularModel(modelScene, modelName) {
    // Apply consistent shading system to all meshes
    modelScene.traverse(function(child) {
        if (child.isMesh) {
            console.log(`Processing ${modelName} mesh:`, child.name || 'unnamed');
            
            // Apply baked lighting to geometry (but keep original brightness)
            if (child.geometry) {
                generateOriginalBakedLighting(child.geometry);
            }
            
            // Create optimized material matching the original system (no darker base color)
            const optimizedMaterial = new THREE.MeshBasicMaterial({
                transparent: false,
                alphaTest: 0,
                side: THREE.FrontSide,
                vertexColors: true,
                fog: false
                // No darker color override - keep original appearance
            });
            
            // Copy texture if the original material has one
            if (child.material && child.material.map) {
                const texture = child.material.map.clone();
                texture.generateMipmaps = false;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                optimizedMaterial.map = texture;
            }
            
            // Apply the optimized material
            child.material = optimizedMaterial;
            
            // Apply GPU optimizations
            child.castShadow = false;
            child.receiveShadow = false;
            child.matrixAutoUpdate = false;
        }
    });
    
    // Position using shared coordinate system with small X-axis offset and Y-axis adjustment
    // Architectural tower stays at origin, other models shifted -0.3 units on X-axis and -0.2 units on Y-axis
    modelScene.position.set(-0.3, -0.2, 0);
    
    console.log(`${modelName} processed with original coloring and positioned at (-0.3, -0.2, 0)`);
}
