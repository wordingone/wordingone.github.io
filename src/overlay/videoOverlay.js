/**
 * Video overlay system - handles zoom and video playback for regions
 * @param {HTMLElement} lidarBoard - LiDAR board container
 * @param {Object} callbacks - {onOverlayOpen, onOverlayClose}
 * @returns {Object} Video overlay API
 */
export function createVideoOverlay(lidarBoard, callbacks = {}) {
    console.log('Initializing video overlay system...');
    
    const { onOverlayOpen, onOverlayClose } = callbacks;
    
    let currentOverlay = null;
    let isOverlayActive = false;
    
    // Video configuration for each region - mapped to actual files
    const regionVideos = {
        'insula': 'videos/insula.mp4',
        'mirror': 'videos/Mirror.mp4',
        'archive_2': 'videos/Red Dye.mp4'
        // Other regions will show "no video available" message
    };
    
    /**
     * Show video overlay for a specific region
     * @param {string} region - Region name
     * @param {HTMLElement} hotspot - Hotspot element that was clicked
     */
    function showOverlay(region, hotspot) {
        if (isOverlayActive) {
            hideOverlay(); // Close any existing overlay
        }
        
        console.log(`Opening video overlay for region: ${region}`);
        
        // Get the video file for this region
        const videoSrc = regionVideos[region];
        if (!videoSrc) {
            console.warn(`No video configured for region: ${region}`);
            return;
        }
        
        // Create overlay container
        currentOverlay = document.createElement('div');
        currentOverlay.className = 'video-overlay';
        currentOverlay.innerHTML = `
            <div class=\"overlay-backdrop\"></div>
            <div class=\"overlay-content\">
                <button class=\"overlay-close\" aria-label=\"Close overlay\">&times;</button>
                <div class=\"overlay-title\">${region.replace('_', ' ').toUpperCase()}</div>
                <video class=\"overlay-video\" autoplay muted loop>
                    <source src=\"${videoSrc}\" type=\"video/mp4\">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
        
        // Add overlay to DOM
        lidarBoard.appendChild(currentOverlay);
        
        // Set up event listeners
        const closeBtn = currentOverlay.querySelector('.overlay-close');
        const backdrop = currentOverlay.querySelector('.overlay-backdrop');
        const video = currentOverlay.querySelector('.overlay-video');
        
        closeBtn.addEventListener('click', hideOverlay);
        backdrop.addEventListener('click', hideOverlay);
        
        // Handle video events
        video.addEventListener('loadstart', () => {
            console.log(`Loading video: ${videoSrc}`);
        });
        
        video.addEventListener('canplay', () => {
            console.log(`Video ready to play: ${region}`);
        });
        
        video.addEventListener('error', (e) => {
            console.error(`Video error for ${region}:`, e);
            showVideoError(region);
        });
        
        // Trigger zoom animation
        setTimeout(() => {
            currentOverlay.classList.add('active');
        }, 50);
        
        isOverlayActive = true;
        
        // Callback for overlay opened
        if (onOverlayOpen) {
            onOverlayOpen(region, hotspot);
        }
        
        // Handle escape key
        document.addEventListener('keydown', handleEscapeKey);
    }
    
    /**
     * Hide the current video overlay
     */
    function hideOverlay() {
        if (!currentOverlay || !isOverlayActive) return;
        
        console.log('Closing video overlay');
        
        // Trigger close animation
        currentOverlay.classList.add('closing');
        
        setTimeout(() => {
            if (currentOverlay && currentOverlay.parentNode) {
                currentOverlay.parentNode.removeChild(currentOverlay);
            }
            currentOverlay = null;
            isOverlayActive = false;
            
            // Callback for overlay closed
            if (onOverlayClose) {
                onOverlayClose();
            }
        }, 300); // Match CSS transition duration
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
    }
    
    /**
     * Handle escape key press
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            hideOverlay();
        }
    }
    
    /**
     * Show error message when video fails to load
     * @param {string} region - Region name
     */
    function showVideoError(region) {
        if (!currentOverlay) return;
        
        const video = currentOverlay.querySelector('.overlay-video');
        if (video) {
            video.style.display = 'none';
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'video-error';
            errorDiv.innerHTML = `
                <p>Video not available</p>
                <p class=\"error-detail\">Could not load video for ${region}</p>
            `;
            
            video.parentNode.insertBefore(errorDiv, video.nextSibling);
        }
    }
    
    /**
     * Add question mark hover effect to hotspots
     * @param {NodeList} hotspots - Hotspot elements
     */
    function addHoverEffects(hotspots) {
        hotspots.forEach(hotspot => {
            let questionMark = null;
            
            hotspot.addEventListener('mouseenter', () => {
                // Create question mark indicator
                questionMark = document.createElement('div');
                questionMark.className = 'hotspot-question';
                questionMark.innerHTML = '?';
                questionMark.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 255, 255, 0.9);
                    color: #333;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                    pointer-events: none;
                    z-index: 15;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                `;
                
                hotspot.appendChild(questionMark);
            });
            
            hotspot.addEventListener('mouseleave', () => {
                if (questionMark && questionMark.parentNode) {
                    questionMark.parentNode.removeChild(questionMark);
                    questionMark = null;
                }
            });
        });
    }
    
    console.log('Video overlay system initialized');
    
    // Public API
    return {
        showOverlay,
        hideOverlay,
        addHoverEffects,
        isActive: () => isOverlayActive,
        getCurrentRegion: () => {
            if (currentOverlay) {
                const title = currentOverlay.querySelector('.overlay-title');
                return title ? title.textContent.toLowerCase().replace(' ', '_') : null;
            }
            return null;
        }
    };
}
