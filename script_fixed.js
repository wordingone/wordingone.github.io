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
    
    // FIXED: Use GitHub release URLs to bypass Git LFS issue
    // These URLs serve actual binary GLB files instead of LFS pointers
    const releaseBaseUrl = 'https://github.com/wordingone/wordingone.github.io/releases/download/v1.0/';
    
    const modelsToLoad = [
        { name: 'Architectural System', file: releaseBaseUrl + 'arch_module_smallest.glb', isInstanced: true },
        { name: 'Misc Geometry', file: releaseBaseUrl + 'misc%20geometry.glb', isInstanced: false },
        { name: 'Altars', file: releaseBaseUrl + 'altars.glb', isInstanced: false },
        { name: 'Circulation', file: releaseBaseUrl + 'circulation.glb', isInstanced: false },
        { name: 'Distress', file: releaseBaseUrl + 'Distress.glb', isInstanced: false },
        { name: 'Embellishments', file: releaseBaseUrl + 'embellishments.glb', isInstanced: false },
        { name: 'Index', file: releaseBaseUrl + 'Index.glb', isInstanced: false },
        { name: 'Mirror', file: releaseBaseUrl + 'mirror.glb', isInstanced: false },
        { name: 'Moulage', file: releaseBaseUrl + 'Moulage.glb', isInstanced: false },
        { name: 'Robot', file: releaseBaseUrl + 'robot.glb', isInstanced: false }
    ];
    
    const totalModels = modelsToLoad.length;
    console.log(`Loading ${totalModels} models from GitHub release (bypassing Git LFS)...`);
    
    // Load each model directly
    modelsToLoad.forEach((modelInfo, index) => {
        
        loader.load(
            modelInfo.file,
            function(gltf) {
                console.log(`${modelInfo.name} loaded successfully from release!`);
                
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
            console.log(`All ${totalModels} models loaded successfully from GitHub release!`);
            
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
    
    // Initialize LiDAR board with responsive hotspots
    initResponsiveLiDARBoard();
    
    // Initial render
    render();
});

// ===== RESPONSIVE LIDAR BOARD FUNCTIONALITY =====
function initResponsiveLiDARBoard() {
    console.log('Initializing responsive LiDAR board with Figma-style hotspots...');
    
    const lidarBoard = document.getElementById('lidar-board');
    const hotspots = document.querySelectorAll('.hotspot');
    
    // Figma SVG reference dimensions (1920x1080)
    const REFERENCE_WIDTH = 1920;
    const REFERENCE_HEIGHT = 1080;
    
    // Position hotspots responsively
    function positionHotspots() {
        const boardRect = lidarBoard.getBoundingClientRect();
        const scaleX = boardRect.width / REFERENCE_WIDTH;
        const scaleY = boardRect.height / REFERENCE_HEIGHT;
        
        hotspots.forEach(hotspot => {
            const coords = hotspot.dataset.coords.split(',').map(Number);
            const rotation = parseFloat(hotspot.dataset.rotation || 0);
            
            const [x, y, width, height] = coords;
            
            // Scale coordinates to current container size
            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;
            
            // Apply responsive positioning
            hotspot.style.left = scaledX + 'px';
            hotspot.style.top = scaledY + 'px';
            hotspot.style.width = scaledWidth + 'px';
            hotspot.style.height = scaledHeight + 'px';
            hotspot.style.transform = `rotate(${rotation}deg)`;
        });
        
        console.log(`Positioned ${hotspots.length} hotspots for ${boardRect.width.toFixed(0)}x${boardRect.height.toFixed(0)} container`);
    }
    
    // Add click handlers for hotspots
    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', function(e) {
            e.preventDefault();
            handleHotspotClick(this);
        });
        
        hotspot.addEventListener('mouseenter', function() {
            console.log(`Hovering over ${this.dataset.area} area`);
        });
    });
    
    function handleHotspotClick(hotspot) {
        const area = hotspot.dataset.area;
        console.log(`Clicked on ${area} hotspot`);
        
        // Remove active state from all hotspots
        hotspots.forEach(h => h.classList.remove('active'));
        
        // Add active state to clicked hotspot
        hotspot.classList.add('active');
        
        // Log the interaction (you can expand this to sync with 3D model)
        console.log(`Selected area: ${area}`);
        
        // Future: Sync with 3D model camera position/highlighting
        syncWith3DModel(area);
    }
    
    function syncWith3DModel(area) {
        // Placeholder for 3D model synchronization
        console.log(`Syncing 3D model with area: ${area}`);
        
        // You can add specific camera movements or highlighting here
        // For example:
        // - Move camera to specific position
        // - Highlight certain model parts
        // - Change model visibility layers
    }
    
    // Handle window resize for responsive hotspots
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            positionHotspots();
        }, 100); // Debounce resize events
    }
    
    // Set up resize listener
    window.addEventListener('resize', handleResize);
    
    // Initial positioning
    // Wait for layout to be ready
    setTimeout(positionHotspots, 100);
    
    // Also reposition when images load (if any)
    if (document.readyState === 'complete') {
        setTimeout(positionHotspots, 200);
    } else {
        window.addEventListener('load', () => {
            setTimeout(positionHotspots, 200);
        });
    }
    
    console.log('Responsive LiDAR board initialized with mask-style interaction');
}
