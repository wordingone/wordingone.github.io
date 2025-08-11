import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

/**
 * Model loading system with DRACO support and lifecycle management
 * @param {Array} models - Array of model configs {name, file, isInstanced}
 * @param {Object} callbacks - {onProgress, onLoaded, onError}
 * @returns {Promise} Promise that resolves when all models are loaded
 */
export async function loadModels(models, callbacks = {}) {
    console.log('Loading all models for advanced instancing...');
    
    const { onProgress, onLoaded, onError } = callbacks;
    
    const loader = new GLTFLoader();
    
    // Set up DRACO loader for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
    
    const totalModels = models.length;
    const loadedScenes = [];
    let modelsLoaded = 0;
    
    console.log(`Loading ${totalModels} models from local directory...`);
    
    // Create promises for all model loads
    const loadPromises = models.map((modelInfo, index) => {
        return new Promise((resolve, reject) => {
            loader.load(
                modelInfo.file,
                function(gltf) {
                    console.log(`${modelInfo.name} loaded successfully!`);
                    
                    const result = {
                        name: modelInfo.name,
                        scene: gltf.scene,
                        isInstanced: modelInfo.isInstanced,
                        gltf: gltf
                    };
                    
                    loadedScenes.push(result);
                    modelsLoaded++;
                    
                    // Progress callback
                    if (onProgress) {
                        onProgress(modelsLoaded, totalModels, result);
                    }
                    
                    resolve(result);
                },
                function(progress) {
                    const percent = Math.round((progress.loaded / progress.total * 100));
                    console.log(`Loading ${modelInfo.name} progress: ${percent}%`);
                },
                function(error) {
                    console.error(`Error loading ${modelInfo.name}:`, error);
                    if (onError) {
                        onError(error, modelInfo);
                    }
                    reject(error);
                }
            );
        });
    });
    
    try {
        // Wait for all models to load
        await Promise.all(loadPromises);
        
        console.log(`All ${totalModels} models loaded successfully!`);
        
        // Success callback
        if (onLoaded) {
            onLoaded(loadedScenes);
        }
        
        // Dispose of DRACO loader resources
        dracoLoader.dispose();
        
        return loadedScenes;
        
    } catch (error) {
        console.error('Model loading failed:', error);
        // Dispose of DRACO loader even on error
        dracoLoader.dispose();
        throw error;
    }
}

/**
 * Hide loading UI element
 * @param {HTMLElement} loadingElement - Loading element to hide
 */
export function hideLoading(loadingElement) {
    if (loadingElement) {
        loadingElement.classList.add('hidden');
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 500);
    }
}

/**
 * Show error message in loading UI
 * @param {HTMLElement} loadingElement - Loading element
 * @param {string} message - Error message to display
 */
export function showError(loadingElement, message) {
    if (loadingElement) {
        const loadingText = loadingElement.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = '#ff6b6b';
        }
    }
}
