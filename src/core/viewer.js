import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Core 3D viewer - handles scene, camera, renderer, controls, and render loop
 * @param {HTMLCanvasElement} canvasEl - Canvas element for rendering
 * @returns {Object} Viewer API with scene, camera, renderer, controls, render, dispose
 */
export function createViewer(canvasEl) {
    console.log('Initializing advanced instanced viewer...');
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // Get model panel dimensions for proper sizing
    const modelPanel = canvasEl.closest('#model-panel');
    const rect = modelPanel.getBoundingClientRect();
    const panelWidth = rect.width || window.innerWidth / 3;
    const panelHeight = rect.height || window.innerHeight;
    
    // Orthographic camera sized to model panel (60% total zoom increase from original)
    const frustumSize = 10; // Reduced from 14 to 10 for additional 30% zoom (20→14→10 = 50% total)
    const aspect = panelWidth / panelHeight;
    const camera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
    );
    
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    // Optimized renderer
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasEl,
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
    
    // GPU instancing check
    const gl = renderer.getContext();
    console.log('GPU Instancing support:', gl.getExtension('ANGLE_instanced_arrays') ? 'YES' : 'NO');
    console.log('WebGL2 support:', gl instanceof WebGL2RenderingContext ? 'YES' : 'NO');
    
    // State tracking
    let isAnimating = false;
    let needsRender = true;
    
    // Event-driven controls
    const controls = new OrbitControls(camera, renderer.domElement);
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
    
    // Render function
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
    
    // Public render request (for UI to call)
    function requestRender() {
        needsRender = true;
        render();
    }
    
    // Resize handler
    function handleResize() {
        const modelPanel = canvasEl.closest('#model-panel');
        const rect = modelPanel.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        const aspect = width / height;
        const frustumSize = 10; // Keep consistent with 60% total zoom increase
        
        camera.left = frustumSize * aspect / -2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = frustumSize / -2;
        
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        needsRender = true;
        
        console.log(`Resized canvas to model panel: ${width}x${height}`);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (isAnimating) {
            controls.update();
            render();
        }
    }
    
    // Cleanup
    function dispose() {
        controls.dispose();
        renderer.dispose();
        // Scene cleanup will be handled by individual modules
        console.log('Viewer disposed');
    }
    
    // Set up resize listener
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    animate();
    
    console.log('Advanced viewer system initialized');
    
    return {
        scene,
        camera,
        renderer,
        controls,
        render: requestRender,
        dispose
    };
}
