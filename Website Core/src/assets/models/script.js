// Global variables
let scene, camera, renderer, controls;
let loadedModel = null;
let modelInstances = [];
let loadingElement;
let modelCountElement;

// Configuration
const GRID_SIZE = 33;
const SPACING = 2; // Distance between models
const TOTAL_MODELS = GRID_SIZE * GRID_SIZE;

// Initialize the 3D scene
function init() {
    // Get DOM elements
    loadingElement = document.getElementById('loading');
    modelCountElement = document.getElementById('modelCount');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    // Create camera
    const canvas = document.getElementById('canvas');
    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    
    // Position camera to see the entire grid
    const gridWidth = (GRID_SIZE - 1) * SPACING;
    const cameraDistance = Math.max(gridWidth * 0.8, 50);
    camera.position.set(cameraDistance, cameraDistance * 0.5, cameraDistance);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    // Create controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 200;
    controls.minDistance = 10;
    
    // Set up lighting
    setupLighting();
    
    // Load and array the model
    loadModel();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // Fill light from the opposite direction
    const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);
    
    // Top light
    const topLight = new THREE.DirectionalLight(0xffffaa, 0.2);
    topLight.position.set(0, 100, 0);
    scene.add(topLight);
}

function loadModel() {
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        './arch_module_smallest.glb',
        function(gltf) {
            loadedModel = gltf.scene;
            
            // Prepare model for instancing
            prepareModel(loadedModel);
            
            // Create the grid array
            createModelArray();
            
            // Hide loading screen
            hideLoading();
            
            console.log('Model loaded successfully!');
        },
        function(progress) {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading model:', error);
            hideLoading();
        }
    );
}

function prepareModel(model) {
    // Ensure all meshes can cast and receive shadows
    model.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Enhance materials
            if (child.material) {
                child.material.needsUpdate = true;
            }
        }
    });
    
    // Scale the model if needed (adjust as necessary)
    model.scale.set(1, 1, 1);
}

function createModelArray() {
    const startX = -(GRID_SIZE - 1) * SPACING / 2;
    const startZ = -(GRID_SIZE - 1) * SPACING / 2;
    
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let z = 0; z < GRID_SIZE; z++) {
            // Clone the model
            const modelClone = loadedModel.clone();
            
            // Position the clone
            modelClone.position.x = startX + x * SPACING;
            modelClone.position.y = 0;
            modelClone.position.z = startZ + z * SPACING;
            
            // Add slight rotation variation for visual interest
            modelClone.rotation.y = Math.random() * Math.PI * 2;
            
            // Add to scene and tracking array
            scene.add(modelClone);
            modelInstances.push(modelClone);
            
            // Update counter
            updateModelCount();
        }
    }
    
    console.log(`Created ${modelInstances.length} model instances`);
}

function updateModelCount() {
    if (modelCountElement) {
        modelCountElement.textContent = modelInstances.length;
    }
}

function hideLoading() {
    if (loadingElement) {
        loadingElement.classList.add('hidden');
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 500);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Optional: Add subtle animation to models
    const time = Date.now() * 0.001;
    modelInstances.forEach((model, index) => {
        // Subtle floating animation
        model.position.y = Math.sin(time + index * 0.1) * 0.1;
    });
    
    // Render the scene
    renderer.render(scene, camera);
}

// Start the application
document.addEventListener('DOMContentLoaded', function() {
    init();
    animate();
});