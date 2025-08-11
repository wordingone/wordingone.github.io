/**
 * Video overlay system with frame-based positioning and zoom management
 * @param {HTMLElement} lidarBoard - LiDAR board container
 * @param {Object} callbacks - {onOverlayOpen, onOverlayClose}
 * @returns {Object} Video overlay API
 */
export function createVideoOverlay(lidarBoard, callbacks = {}) {
    console.log('Initializing frame-based video overlay system...');
    
    const { onOverlayOpen, onOverlayClose } = callbacks;
    
    let currentOverlay = null;
    let currentRegionFrame = null;
    let isOverlayActive = false;
    let isZoomed = false;
    let zoomScale = 3.5; // Match CSS zoom scale
    
    // Video configuration for each region - mapped to actual files
    const regionVideos = {
        'insula': 'videos/insula.mp4',
        'mirror': 'videos/Mirror.mp4',
        'archive_2': 'videos/Red Dye.mp4',
        // All other regions will show "no video available" message
        'index': null,
        'exhibition-right': null,
        'archive_1': null,
        'circulation_2': null,
        'circulation_1': null,
        'altar': null
    };
    
    /**
     * Create invisible frame for the clicked region (pre-zoom coordinates)
     * @param {HTMLElement} hotspot - Hotspot element that was clicked
     * @returns {Object} Frame data for positioning
     */
    function createRegionFrameData(hotspot) {
        // Copy position and size from hotspot
        const coords = hotspot.dataset.coords.split(',').map(Number);
        const [x, y, width, height] = coords;
        const rotation = parseFloat(hotspot.dataset.rotation || 0);
        
        // Get current scale factors (before zoom)
        const boardRect = lidarBoard.getBoundingClientRect();
        const scaleX = boardRect.width / 1920; // Reference width from hotspots config
        const scaleY = boardRect.height / 1080; // Reference height from hotspots config
        
        return {
            x: x * scaleX,
            y: y * scaleY,
            width: width * scaleX,
            height: height * scaleY,
            rotation,
            centerX: (x * scaleX) + (width * scaleX) / 2,
            centerY: (y * scaleY) + (height * scaleY) / 2
        };
    }
    
    /**
     * Show video overlay for a specific region with frame-based positioning
     * @param {string} region - Region name
     * @param {HTMLElement} hotspot - Hotspot element that was clicked
     */
    function showOverlay(region, hotspot) {
        if (isOverlayActive) {
            hideOverlay(); // Close any existing overlay
        }
        
        console.log(`Opening frame-based video overlay for region: ${region}`);
        
        // Get the video file for this region
        const videoSrc = regionVideos[region];
        if (!videoSrc) {
            console.log(`No video configured for region: ${region} - showing placeholder`);
            showNoVideoMessage(region, hotspot);
            return;
        }
        
        // Get frame data before zoom
        const frameData = createRegionFrameData(hotspot);
        
        // Set zoom transform origin to the clicked region center
        lidarBoard.style.transformOrigin = `${frameData.centerX}px ${frameData.centerY}px`;
        
        // Start zoom animation
        lidarBoard.classList.add('zooming');
        isZoomed = true;
        
        // Wait for zoom animation to complete before showing video
        setTimeout(() => {
            // Create overlay container
            currentOverlay = document.createElement('div');
            currentOverlay.className = 'video-overlay frame-positioned';
            currentOverlay.innerHTML = `
                <div class="overlay-content">
                    <button class="overlay-close" aria-label="Close overlay">&times;</button>
                    <div class="overlay-title">${region.replace('_', ' ').toUpperCase()}</div>
                    <video class="overlay-video" autoplay muted loop>
                        <source src="${videoSrc}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
            
            // Position overlay in the center of the zoomed view
            positionOverlayInZoomedView(currentOverlay, frameData);
            
            // Add overlay to the body for fixed positioning
            document.body.appendChild(currentOverlay);
            
            // Force reflow to ensure CSS is applied before adding active class
            currentOverlay.offsetHeight;
            
            // Set up event listeners
            const closeBtn = currentOverlay.querySelector('.overlay-close');
            const video = currentOverlay.querySelector('.overlay-video');
            
            closeBtn.addEventListener('click', hideOverlay);
            
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
            
            // Trigger overlay animation
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
        }, 1000); // Wait for zoom animation (1000ms)
    }
    
    /**
     * Position overlay in the center of the zoomed view
     * @param {HTMLElement} overlay - Overlay element
     * @param {Object} frameData - Frame positioning data
     */
    function positionOverlayInZoomedView(overlay, frameData) {
        // Get the main panel dimensions (right 2/3 of screen)
        const mainPanel = document.getElementById('main-panel');
        const panelRect = mainPanel.getBoundingClientRect();
        
        // Calculate center of the main panel
        const centerX = panelRect.left + panelRect.width / 2;
        const centerY = panelRect.top + panelRect.height / 2;
        
        // Size the overlay appropriately (increased by 50%)
        const overlayWidth = 600;  // 400 * 1.5
        const overlayHeight = 450; // 300 * 1.5
        
        // Position overlay at center of main panel using fixed positioning, then move 500px right
        const overlayX = (centerX - overlayWidth / 2) + 500;
        const overlayY = centerY - overlayHeight / 2;
        
        // Apply inline styles for immediate visibility with fixed positioning
        overlay.style.cssText = `
            position: fixed !important;
            left: ${overlayX}px !important;
            top: ${overlayY}px !important;
            width: ${overlayWidth}px !important;
            height: ${overlayHeight}px !important;
            z-index: 10000 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.8) !important;
            pointer-events: auto !important;
            background: #000 !important;
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            display: block !important;
        `;
        
        console.log(`Overlay positioned at: ${overlayX.toFixed(0)}, ${overlayY.toFixed(0)} (${overlayWidth}x${overlayHeight})`);
    }
    
    /**
     * Show "no video available" message in the center of zoomed view
     * @param {string} region - Region name
     * @param {HTMLElement} hotspot - Hotspot element
     */
    function showNoVideoMessage(region, hotspot) {
        // Get frame data before zoom
        const frameData = createRegionFrameData(hotspot);
        
        // Set zoom transform origin to the clicked region center
        lidarBoard.style.transformOrigin = `${frameData.centerX}px ${frameData.centerY}px`;
        
        lidarBoard.classList.add('zooming');
        isZoomed = true;
        
        setTimeout(() => {
            currentOverlay = document.createElement('div');
            currentOverlay.className = 'video-overlay frame-positioned no-video';
            currentOverlay.innerHTML = `
                <div class="overlay-content">
                    <button class="overlay-close" aria-label="Close overlay">&times;</button>
                    <div class="overlay-title">${region.replace('_', ' ').toUpperCase()}</div>
                    <div class="video-error">
                        <p>No video available</p>
                        <p class="error-detail">Content for ${region} is coming soon</p>
                    </div>
                </div>
            `;
            
            positionOverlayInZoomedView(currentOverlay, frameData);
            document.body.appendChild(currentOverlay);
            
            // Force reflow to ensure CSS is applied before adding active class
            currentOverlay.offsetHeight;
            
            const closeBtn = currentOverlay.querySelector('.overlay-close');
            closeBtn.addEventListener('click', hideOverlay);
            
            setTimeout(() => {
                currentOverlay.classList.add('active');
            }, 50);
            
            isOverlayActive = true;
            
            if (onOverlayOpen) {
                onOverlayOpen(region, hotspot);
            }
            
            document.addEventListener('keydown', handleEscapeKey);
        }, 1000);
    }
    
    /**
     * Hide the current video overlay and reset zoom
     */
    function hideOverlay() {
        if (!currentOverlay || !isOverlayActive) return;
        
        console.log('Closing video overlay and resetting zoom');
        
        // Trigger close animation
        currentOverlay.classList.add('closing');
        
        setTimeout(() => {
            // Remove overlay
            if (currentOverlay && currentOverlay.parentNode) {
                currentOverlay.parentNode.removeChild(currentOverlay);
            }
            currentOverlay = null;
            
            // Remove region frame
            if (currentRegionFrame && currentRegionFrame.parentNode) {
                currentRegionFrame.parentNode.removeChild(currentRegionFrame);
            }
            currentRegionFrame = null;
            
            isOverlayActive = false;
            
            // Reset zoom on LiDAR board
            if (isZoomed) {
                lidarBoard.classList.remove('zooming');
                lidarBoard.classList.add('zoom-reset');
                lidarBoard.style.transformOrigin = 'center'; // Reset transform origin
                isZoomed = false;
                
                // Remove zoom-reset class after animation
                setTimeout(() => {
                    lidarBoard.classList.remove('zoom-reset');
                }, 800);
            }
            
            // Callback for overlay closed
            if (onOverlayClose) {
                onOverlayClose();
            }
        }, 300); // Match CSS transition duration
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
    }
    
    /**
     * Toggle zoom state (for zoom extents button)
     */
    function toggleZoom() {
        if (isZoomed && !isOverlayActive) {
            // Reset zoom if zoomed but no active overlay
            lidarBoard.classList.remove('zooming');
            lidarBoard.classList.add('zoom-reset');
            lidarBoard.style.transformOrigin = 'center'; // Reset transform origin
            isZoomed = false;
            
            setTimeout(() => {
                lidarBoard.classList.remove('zoom-reset');
            }, 800);
            
            console.log('Zoom reset via toggle');
        } else if (isOverlayActive) {
            // Close overlay which will also reset zoom
            hideOverlay();
        }
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
                <p>Video failed to load</p>
                <p class="error-detail">Could not load video for ${region}</p>
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
                    background: rgba(255, 255, 255, 0.95);
                    color: #333;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 18px;
                    pointer-events: none;
                    z-index: 15;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                    border: 2px solid #3498db;
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
    
    console.log('Frame-based video overlay system initialized');
    
    // Public API
    return {
        showOverlay,
        hideOverlay,
        toggleZoom,
        addHoverEffects,
        isActive: () => isOverlayActive,
        isZoomed: () => isZoomed,
        getCurrentRegion: () => {
            if (currentOverlay) {
                const title = currentOverlay.querySelector('.overlay-title');
                return title ? title.textContent.toLowerCase().replace(' ', '_') : null;
            }
            return null;
        }
    };
}
