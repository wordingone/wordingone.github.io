import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Global variables
let scene, camera, renderer, controls;
let loadingElement;
let isAnimating = false;
let needsRender = true;
let instancedMeshes = [];

// Initialize the 3D scene
function init() {
    console.log('Initializing advanced instanced rendering...');
    
    loadingElement = document.getElementById('loading');
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // Get model panel dimensions for proper sizing
    const modelPanel = document.getElementById('model-panel');
    const rect = modelPanel.getBoundingClientRect();
    const panelWidth = rect.width || window.innerWidth / 3;
    const panelHeight = rect.height || window.innerHeight;
    
    // Orthographic camera sized to model panel
    const frustumSize = 20;
    const aspect = panelWidth / panelHeight;
    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );
    
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    // Optimized renderer sized to model panel
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('canvas'),
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false
    });
    
    renderer.setSize(panelWidth, panelHeight);
    console.log(`Initialized canvas at model panel size: ${panelWidth}x${panelHeight}`);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.shadowMap.enabled = false;
    renderer.sortObjects = false;
    renderer.autoClear = false;
    
    // Enable GPU instancing extensions
    const gl = renderer.getContext();
    console.log('GPU Instancing support:', gl.getExtension('ANGLE_instanced_arrays') ? 'YES' : 'NO');
    console.log('WebGL2 support:', gl instanceof WebGL2RenderingContext ? 'YES' : 'NO');
    
    // Event-driven controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    
    controls.addEventListener('start', () => {
        isAnimating = true;
        needsRender = true;
    });
    
    controls.addEventListener('end', () => {
        isAnimating = false;
        setTimeout(() => {
            needsRender = true;
            render();
        }, 100);
    });
    
    controls.addEventListener('change', () => {
        needsRender = true;
    });
    
    // Minimal lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    loadModel();
    
    window.addEventListener('resize', onWindowResize);
    
    console.log('Advanced instancing system initialized');
}

function loadModel() {
    console.log('Loading all models for advanced instancing...');
    
    const loader = new GLTFLoader();
    
    // Set up DRACO loader for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
    
    let modelsLoaded = 0;
    
    // Define all models to load (excluding .glbbak backup files)
    const modelsToLoad = [
        { name: 'Architectural System', file: './src/assets/models/arch_module_smallest.glb', isInstanced: true },
        { name: 'Misc Geometry', file: './src/assets/models/misc geometry.glb', isInstanced: false },
        { name: 'Altars', file: './src/assets/models/altars.glb', isInstanced: false },
        { name: 'Circulation', file: './src/assets/models/circulation.glb', isInstanced: false },
        { name: 'Distress', file: './src/assets/models/Distress.glb', isInstanced: false },
        { name: 'Embellishments', file: './src/assets/models/embellishments.glb', isInstanced: false },
        { name: 'Index', file: './src/assets/models/Index.glb', isInstanced: false },
        { name: 'Mirror', file: './src/assets/models/mirror.glb', isInstanced: false },
        { name: 'Moulage', file: './src/assets/models/Moulage.glb', isInstanced: false },
        { name: 'Robot', file: './src/assets/models/robot.glb', isInstanced: false }
    ];
    
    const totalModels = modelsToLoad.length;
    console.log(`Loading ${totalModels} models from shared coordinate system...`);
    
    // Load each model
    modelsToLoad.forEach((modelInfo, index) => {
        loader.load(
            modelInfo.file,
            function(gltf) {
                console.log(`${modelInfo.name} loaded, processing...`);
                
                if (modelInfo.isInstanced) {
                    // Handle the main architectural instanced system
                    const model = gltf.scene;
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    
                    console.log('Architectural model size:', size.x.toFixed(2), '×', size.y.toFixed(2), '×', size.z.toFixed(2));
                    createAdvancedInstancedSystem(model, size);
                    console.log('Advanced instanced system complete!');
                } else {
                    // Handle regular models with shared coordinate system
                    const loadedModel = gltf.scene;
                    
                    // Apply consistent shading system to all meshes
                    loadedModel.traverse(function(child) {
                        if (child.isMesh) {
                            console.log(`Processing ${modelInfo.name} mesh:`, child.name || 'unnamed');
                            
                            // Apply baked lighting to geometry
                            if (child.geometry) {
                                generateBakedLighting(child.geometry);
                            }
                            
                            // Create optimized material matching the instanced system
                            const optimizedMaterial = new THREE.MeshBasicMaterial({
                                transparent: false,
                                alphaTest: 0,
                                side: THREE.FrontSide,
                                vertexColors: true,
                                fog: false
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
                    
                    // Position using shared coordinate system with small X-axis offset
                    // Architectural tower stays at origin, other models shifted -0.3 units on X-axis
                    loadedModel.position.set(-0.3, 0, 0);
                    
                    // Add to scene
                    scene.add(loadedModel);
                    
                    console.log(`${modelInfo.name} placed in scene with matching shading`);
                }
                
                modelsLoaded++;
                checkAllModelsLoaded();
            },
            function(progress) {
                const percent = Math.round((progress.loaded / progress.total * 100));
                console.log(`Loading ${modelInfo.name} progress: ${percent}%`);
            },
            function(error) {
                console.error(`Error loading ${modelInfo.name}:`, error);
                showError(`Failed to load ${modelInfo.name}: ` + error.message);
            }
        );
    });
    
    function checkAllModelsLoaded() {
        if (modelsLoaded === totalModels) {
            hideLoading();
            needsRender = true;
            console.log(`All ${totalModels} models loaded successfully from shared coordinate system!`);
            
            // Dispose of DRACO loader resources
            dracoLoader.dispose();
        }
    }
}

function createAdvancedInstancedSystem(model, size) {
    console.log('Creating advanced instanced system with GPU optimizations...');
    
    // Collect all unique geometries and materials
    const geometryMaterialPairs = [];
    
    model.traverse(function(child) {
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
}

function createOptimizedMaterial(originalMaterial) {
    // Create efficient material with baked lighting simulation
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

function optimizeGeometry(geometry) {
    // Clone and optimize geometry
    const optimizedGeometry = geometry.clone();
    
    // Remove unnecessary attributes but keep what we need for shading
    const attributesToKeep = ['position', 'normal', 'uv'];
    Object.keys(optimizedGeometry.attributes).forEach(name => {
        if (!attributesToKeep.includes(name)) {
            optimizedGeometry.deleteAttribute(name);
        }
    });
    
    // Generate efficient baked lighting via vertex colors
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

function generateBakedLighting(geometry) {
    // Create baked lighting using vertex colors (super efficient)
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
        
        // Apply slight variation for visual interest
        const variation = 0.95 + Math.random() * 0.1;
        const finalIntensity = totalLight * variation;
        
        // Set RGB color (slight warm tint for architectural feel)
        colors[i * 3] = finalIntensity * 0.95;     // R - slightly less red
        colors[i * 3 + 1] = finalIntensity * 0.97; // G - neutral
        colors[i * 3 + 2] = finalIntensity * 1.0;  // B - slightly more blue
    }
    
    // Add color attribute to geometry
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    console.log('Generated baked lighting with vertex colors');
}

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

function isBorderCell(x, z) {
    // Check if cell is in the 3-thick border
    // Border cells are: x < 3 OR x >= 30 OR z < 3 OR z >= 30
    return (x < 3 || x >= 30 || z < 3 || z >= 30);
}

function calculateBorderInstances() {
    // Calculate total border cells in a 33x33 grid with 3-thick border
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

function applyGPUOptimizations(instancedMesh) {
    // Apply various GPU-level optimizations
    
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

function hideLoading() {
    if (loadingElement) {
        loadingElement.classList.add('hidden');
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 500);
    }
}

function showError(message) {
    if (loadingElement) {
        const loadingText = loadingElement.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = '#ff6b6b';
        }
    }
}

function onWindowResize() {
    // Get the model panel dimensions instead of full window
    const modelPanel = document.getElementById('model-panel');
    const rect = modelPanel.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const aspect = width / height;
    const frustumSize = 20;
    
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    needsRender = true;
    
    console.log(`Resized canvas to model panel: ${width}x${height}`);
}

// Optimized render function
function render() {
    if (needsRender) {
        renderer.clear();
        renderer.render(scene, camera);
        needsRender = false;
        
        // Log render info occasionally for debugging
        if (Math.random() < 0.01) { // 1% chance
            console.log('Render info:', renderer.info.render);
        }
    }
}

// Minimal render loop
function animate() {
    requestAnimationFrame(animate);
    
    if (isAnimating) {
        controls.update();
        render();
    }
}

// Cleanup function for memory management
function cleanup() {
    instancedMeshes.forEach(mesh => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        if (mesh.material.map) {
            mesh.material.map.dispose();
        }
    });
    renderer.dispose();
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Start the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Starting advanced instanced rendering system...');
    console.log('GPU Optimizations: Static draw usage, matrix composition, geometry optimization, material batching');
    
    init();
    animate();
    
    // Initialize LiDAR board
    initLiDARBoard();
    
    // Initial render
    render();
});

// ===== LIDAR BOARD FUNCTIONALITY =====
function initLiDARBoard() {
    console.log('Initializing LiDAR board interface...');
    
    // Get board elements
    const highlightBtn = document.getElementById('highlight-btn');
    const resetBtn = document.getElementById('reset-btn');
    const lidarImage = document.getElementById('lidar-image');
    const highlightOverlay = document.getElementById('highlight-overlay');
    const crosshair = document.getElementById('crosshair');
    
    let isHighlightMode = false;
    let highlightAreas = [];
    
    // LiDAR image load handler
    lidarImage.addEventListener('load', function() {
        console.log('LiDAR image loaded successfully');
        lidarImage.classList.add('loaded');
    });
    
    // Highlight button functionality
    highlightBtn.addEventListener('click', function() {
        isHighlightMode = !isHighlightMode;
        
        if (isHighlightMode) {
            activateHighlightMode();
        } else {
            deactivateHighlightMode();
        }
    });
    
    // Reset button functionality
    resetBtn.addEventListener('click', function() {
        resetBoardView();
    });
    
    function activateHighlightMode() {
        console.log('Activating highlight mode...');
        
        // Update button state
        highlightBtn.classList.add('active');
        highlightBtn.querySelector('.btn-text').textContent = 'Exit Highlight';
        
        // Activate light dark overlay so LiDAR is still visible
        highlightOverlay.classList.add('highlight-active');
        
        // Show crosshair
        crosshair.classList.add('visible');
        
        // Create highlight areas (simulating the prototype behavior)
        createHighlightAreas();
        
        // Update status
        updateBoardStatus('Highlight Mode Active', 'LiDAR darkened with highlighted sections visible');
    }
    
    function deactivateHighlightMode() {
        console.log('Deactivating highlight mode...');
        
        // Update button state
        highlightBtn.classList.remove('active');
        highlightBtn.querySelector('.btn-text').textContent = 'Highlight';
        
        // Remove dark overlay
        highlightOverlay.classList.remove('highlight-active');
        
        // Hide crosshair
        crosshair.classList.remove('visible');
        
        // Clear highlight areas
        clearHighlightAreas();
        
        // Update status
        updateBoardStatus('LiDAR Navigation Board | Ready', 'Full LiDAR image visible');
    }
    
    function createHighlightAreas() {
        // Clear existing highlights
        clearHighlightAreas();
        
        // Create sample highlight areas based on architectural zones
        const sampleAreas = [
            { x: 15, y: 12, width: 8, height: 6, label: 'Central Altar' },
            { x: 8, y: 20, width: 6, height: 4, label: 'Left Circulation' },
            { x: 22, y: 20, width: 6, height: 4, label: 'Right Circulation' },
            { x: 16, y: 8, width: 4, height: 3, label: 'Entry Point' },
            { x: 10, y: 28, width: 12, height: 3, label: 'Back Gallery' }
        ];
        
        sampleAreas.forEach((area, index) => {
            setTimeout(() => {
                createHighlightSection(area.x, area.y, area.width, area.height, area.label);
            }, index * 200); // Staggered animation
        });
    }
    
    function createHighlightSection(gridX, gridY, width, height, label) {
        const highlightDiv = document.createElement('div');
        highlightDiv.className = 'highlight-section';
        
        // Calculate position as percentage of container
        const left = (gridX / 33) * 100;
        const top = (gridY / 33) * 100;
        const sectionWidth = (width / 33) * 100;
        const sectionHeight = (height / 33) * 100;
        
        highlightDiv.style.left = left + '%';
        highlightDiv.style.top = top + '%';
        highlightDiv.style.width = sectionWidth + '%';
        highlightDiv.style.height = sectionHeight + '%';
        
        // Add label
        if (label) {
            highlightDiv.setAttribute('data-label', label);
            highlightDiv.title = label;
        }
        
        highlightOverlay.appendChild(highlightDiv);
        highlightAreas.push(highlightDiv);
        
        // Animate in
        setTimeout(() => {
            highlightDiv.classList.add('visible', 'pulsing');
        }, 50);
    }
    
    function clearHighlightAreas() {
        highlightAreas.forEach(area => {
            area.classList.remove('visible');
            setTimeout(() => {
                if (area.parentNode) {
                    area.parentNode.removeChild(area);
                }
            }, 300);
        });
        highlightAreas = [];
    }
    
    function resetBoardView() {
        console.log('Resetting board view...');
        
        // Reset highlight mode if active
        if (isHighlightMode) {
            deactivateHighlightMode();
            isHighlightMode = false;
        }
        
        // Reset zoom level
        document.getElementById('zoom-level').textContent = '100%';
        
        // Update status
        updateBoardStatus('LiDAR Navigation Board | Ready', 'View reset | Ready for navigation');
    }
    
    function updateBoardStatus(info, selection) {
        document.getElementById('board-info').textContent = info;
        document.getElementById('selection-info').textContent = selection;
    }
    
    console.log('LiDAR board interface initialized successfully');
}