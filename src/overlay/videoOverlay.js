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
    
    // Current series playback state
    let currentSeries = null;
    let currentVideoIndex = 0;
    let isAutoPlaying = true;
    
    // Video series configuration - organized by groups
    const videoSeries = {
        'altar': {
            videos: ['videos/altar_1.mp4', 'videos/altar_2.mp4', 'videos/altar_3.mp4', 'videos/altar_4.mp4'],
            title: 'ALTAR SERIES'
        },
        'archive_inside': {
            videos: ['videos/archive_inside.mp4'],
            title: 'ARCHIVE INSIDE'
        },
        'archive_2': {
            videos: ['videos/archive_1.mp4', 'videos/archive_2.mp4', 'videos/archive_3.mp4', 'videos/archive_4.mp4', 'videos/archive_5.mp4', 'videos/archive_6.mp4'],
            title: 'ARCHIVE SERIES'
        },
        'red_dye': {
            videos: ['videos/Red Dye.mp4'],
            title: 'RED DYE'
        },
        'circulation_1': {
            videos: ['videos/circulation_1.mp4', 'videos/circulation_2.mp4'],
            title: 'CIRCULATION SERIES'
        },
        'index': {
            videos: ['videos/index_1.mp4', 'videos/index_2.mp4'],
            title: 'INDEX SERIES'
        },
        'insula': {
            videos: ['videos/insula.mp4'],
            title: 'INSULA'
        },
        'mirror': {
            videos: ['videos/Mirror.mp4'],
            title: 'MIRROR'
        },
        'exhibition-right': {
            videos: [],
            title: 'EXHIBITION RIGHT'
        }
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
        
        // Get current LiDAR board dimensions
        const boardRect = lidarBoard.getBoundingClientRect();
        const scaleX = boardRect.width / 1920; // Reference width from hotspots config
        const scaleY = boardRect.height / 1080; // Reference height from hotspots config
        
        // Calculate the actual center of the hotspot region
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;
        
        // Get the absolute center coordinates relative to the board
        const centerX = scaledX + (scaledWidth / 2);
        const centerY = scaledY + (scaledHeight / 2);
        
        console.log(`Region ${hotspot.dataset.area}:`);
        console.log(`  Original coords: [${x}, ${y}, ${width}, ${height}]`);
        console.log(`  Scaled coords: [${scaledX.toFixed(1)}, ${scaledY.toFixed(1)}, ${scaledWidth.toFixed(1)}, ${scaledHeight.toFixed(1)}]`);
        console.log(`  Center: (${centerX.toFixed(1)}, ${centerY.toFixed(1)}) in ${boardRect.width.toFixed(0)}x${boardRect.height.toFixed(0)} board`);
        console.log(`  Scale factors: ${scaleX.toFixed(3)}, ${scaleY.toFixed(3)}`);
        
        return {
            x: scaledX,
            y: scaledY,
            width: scaledWidth,
            height: scaledHeight,
            rotation,
            centerX: centerX,
            centerY: centerY
        };
    }
    
    /**
     * Show video overlay for a specific region with series support
     * @param {string} region - Region name
     * @param {HTMLElement} hotspot - Hotspot element that was clicked
     */
    function showOverlay(region, hotspot) {
        if (isOverlayActive) {
            hideOverlay(); // Close any existing overlay
        }
        
        console.log(`Opening video series overlay for region: ${region}`);
        
        // Get the video series for this region
        const series = videoSeries[region];
        if (!series || series.videos.length === 0) {
            console.log(`No videos configured for region: ${region} - showing placeholder`);
            showNoVideoMessage(region, hotspot);
            return;
        }
        
        // Initialize series state
        currentSeries = series;
        currentVideoIndex = 0;
        
        // Get frame data before zoom
        const frameData = createRegionFrameData(hotspot);
        
        // Set zoom transform origin to the clicked region center using percentages
        const boardRect = lidarBoard.getBoundingClientRect();
        
        // Convert absolute coordinates to percentages for more reliable transform-origin
        const transformOriginXPercent = (frameData.centerX / boardRect.width) * 100;
        const transformOriginYPercent = (frameData.centerY / boardRect.height) * 100;
        
        console.log(`Setting transform origin to: ${transformOriginXPercent.toFixed(1)}% ${transformOriginYPercent.toFixed(1)}% for region ${region}`);
        
        lidarBoard.style.transformOrigin = `${transformOriginXPercent}% ${transformOriginYPercent}%`;
        
        // Start zoom animation
        lidarBoard.classList.add('zooming');
        isZoomed = true;
        
        // Wait for zoom animation to complete before showing video
        setTimeout(() => {
            console.log('Creating video overlay after zoom animation');
            createVideoSeriesOverlay(frameData);
            
            isOverlayActive = true;
            console.log('Video overlay created and overlay active set to true');
            
            // Callback for overlay opened
            if (onOverlayOpen) {
                onOverlayOpen(region, hotspot);
            }
            
            // Handle escape key
            document.addEventListener('keydown', handleEscapeKey);
        }, 1000); // Wait for zoom animation (1000ms)
    }
    
    /**
     * Create video series overlay with navigation controls
     * @param {Object} frameData - Frame positioning data
     */
    function createVideoSeriesOverlay(frameData) {
        console.log('Starting createVideoSeriesOverlay function');
        console.log('Current series:', currentSeries);
        console.log('Frame data:', frameData);
        
        // Create overlay container
        currentOverlay = document.createElement('div');
        currentOverlay.className = 'video-overlay frame-positioned series-player';
        console.log('Created overlay element with classes:', currentOverlay.className);
        
        const hasMultipleVideos = currentSeries.videos.length > 1;
        const currentVideo = currentSeries.videos[currentVideoIndex];
        
        currentOverlay.innerHTML = `
            <div class="overlay-content">
                <button class="overlay-close" aria-label="Close overlay">&times;</button>
                <div class="overlay-header">
                    <div class="overlay-title">${currentSeries.title}</div>
                    ${hasMultipleVideos ? `<div class="video-counter">${currentVideoIndex + 1} / ${currentSeries.videos.length}</div>` : ''}
                </div>
                <video class="overlay-video" autoplay muted ${!hasMultipleVideos ? 'loop' : ''}>
                    <source src="${currentVideo}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                ${hasMultipleVideos ? createNavigationControls() : ''}
            </div>
        `;
        
        // Position overlay in the center of the zoomed view
        positionOverlayInZoomedView(currentOverlay, frameData);
        
        // Add overlay to the body for fixed positioning
        document.body.appendChild(currentOverlay);
        console.log('Overlay added to document body');
        console.log('Overlay current style:', currentOverlay.style.cssText);
        
        // Force reflow to ensure CSS is applied before adding active class
        currentOverlay.offsetHeight;
        console.log('Forced reflow completed');
        
        // Set up event listeners
        setupVideoSeriesListeners();
        
        // Trigger overlay animation
        setTimeout(() => {
            if (currentOverlay) {
                console.log('Triggering overlay active class');
                currentOverlay.classList.add('active');
            }
        }, 50);
    }
    
    /**
     * Create navigation controls HTML
     * @returns {string} Navigation controls HTML
     */
    function createNavigationControls() {
        const hasNext = currentVideoIndex < currentSeries.videos.length - 1;
        const hasPrev = currentVideoIndex > 0;
        
        return `
            <div class="video-navigation">
                <button class="nav-btn prev-btn" ${!hasPrev ? 'disabled' : ''} aria-label="Previous video">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11,19 2,12 11,5 11,19"></polygon>
                        <polygon points="22,19 13,12 22,5 22,19"></polygon>
                    </svg>
                </button>
                <div class="nav-info">
                    <div class="nav-dots">
                        ${currentSeries.videos.map((_, index) => 
                            `<div class="nav-dot ${index === currentVideoIndex ? 'active' : ''}" data-index="${index}"></div>`
                        ).join('')}
                    </div>
                </div>
                <button class="nav-btn next-btn" ${!hasNext ? 'disabled' : ''} aria-label="Next video">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13,19 22,12 13,5 13,19"></polygon>
                        <polygon points="2,19 11,12 2,5 2,19"></polygon>
                    </svg>
                </button>
            </div>
        `;
    }
    
    /**
     * Set up event listeners for video series player
     */
    function setupVideoSeriesListeners() {
        const closeBtn = currentOverlay.querySelector('.overlay-close');
        const video = currentOverlay.querySelector('.overlay-video');
        const prevBtn = currentOverlay.querySelector('.prev-btn');
        const nextBtn = currentOverlay.querySelector('.next-btn');
        const navDots = currentOverlay.querySelectorAll('.nav-dot');
        
        // Close button
        closeBtn.addEventListener('click', hideOverlay);
        
        // Video event listeners
        video.addEventListener('loadstart', () => {
            console.log(`Loading video: ${currentSeries.videos[currentVideoIndex]}`);
        });
        
        video.addEventListener('canplay', () => {
            console.log(`Video ready to play: ${currentVideoIndex + 1}/${currentSeries.videos.length}`);
        });
        
        video.addEventListener('ended', () => {
            if (isAutoPlaying && currentVideoIndex < currentSeries.videos.length - 1) {
                setTimeout(() => {
                    playNextVideo();
                }, 500); // Brief pause between videos
            }
        });
        
        video.addEventListener('error', (e) => {
            console.error(`Video error for ${currentSeries.title}:`, e);
            showVideoError(currentSeries.title);
        });
        
        // Navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', playPreviousVideo);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', playNextVideo);
        }
        
        // Navigation dots
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                playVideoAtIndex(index);
            });
        });
    }
    
    /**
     * Play next video in series
     */
    function playNextVideo() {
        if (currentVideoIndex < currentSeries.videos.length - 1) {
            currentVideoIndex++;
            updateVideoPlayer();
        }
    }
    
    /**
     * Play previous video in series
     */
    function playPreviousVideo() {
        if (currentVideoIndex > 0) {
            currentVideoIndex--;
            updateVideoPlayer();
        }
    }
    
    /**
     * Play video at specific index
     * @param {number} index - Video index to play
     */
    function playVideoAtIndex(index) {
        if (index >= 0 && index < currentSeries.videos.length) {
            currentVideoIndex = index;
            updateVideoPlayer();
        }
    }
    
    /**
     * Update video player with current video
     */
    function updateVideoPlayer() {
        if (!currentOverlay || !currentSeries) return;
        
        const video = currentOverlay.querySelector('.overlay-video');
        const counter = currentOverlay.querySelector('.video-counter');
        const prevBtn = currentOverlay.querySelector('.prev-btn');
        const nextBtn = currentOverlay.querySelector('.next-btn');
        const navDots = currentOverlay.querySelectorAll('.nav-dot');
        
        // Update video source
        const currentVideo = currentSeries.videos[currentVideoIndex];
        video.src = currentVideo;
        video.load();
        video.play();
        
        // Update counter
        if (counter) {
            counter.textContent = `${currentVideoIndex + 1} / ${currentSeries.videos.length}`;
        }
        
        // Update navigation buttons
        if (prevBtn) {
            prevBtn.disabled = currentVideoIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentVideoIndex === currentSeries.videos.length - 1;
        }
        
        // Update navigation dots
        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentVideoIndex);
        });
        
        console.log(`Playing video ${currentVideoIndex + 1}/${currentSeries.videos.length}: ${currentVideo}`);
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
        
        // Position overlay at center of main panel using fixed positioning, then move 800px right
        const overlayX = (centerX - overlayWidth / 2) + 800;
        const overlayY = centerY - overlayHeight / 2;
        
        // Video overlay should scale from its own center, not from LiDAR board
        // Transform origin defaults to center (50% 50%) for smooth scale animation
        
        // Apply inline styles for centered scale animation
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
            transform-origin: center center !important;
            opacity: 0 !important;
            visibility: visible !important;
            transform: scale(0.3) !important;
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
        
        // Set zoom transform origin to the clicked region center using percentages
        const boardRect = lidarBoard.getBoundingClientRect();
        
        // Convert absolute coordinates to percentages for more reliable transform-origin
        const transformOriginXPercent = (frameData.centerX / boardRect.width) * 100;
        const transformOriginYPercent = (frameData.centerY / boardRect.height) * 100;
        
        console.log(`Setting transform origin to: ${transformOriginXPercent.toFixed(1)}% ${transformOriginYPercent.toFixed(1)}% for no-video region ${region}`);
        
        lidarBoard.style.transformOrigin = `${transformOriginXPercent}% ${transformOriginYPercent}%`;
        
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
     * Hide the current video overlay and reset zoom with proper state management
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
            
            // Reset series state
            currentSeries = null;
            currentVideoIndex = 0;
            isAutoPlaying = true;
            
            // Reset zoom on LiDAR board with proper cleanup
            if (isZoomed) {
                lidarBoard.classList.remove('zooming');
                lidarBoard.classList.add('zoom-reset');
                lidarBoard.style.transformOrigin = 'center'; // Reset transform origin
                isZoomed = false;
                
                // Remove zoom-reset class after animation and force hotspot repositioning
                setTimeout(() => {
                    lidarBoard.classList.remove('zoom-reset');
                    // Force a clean state reset
                    lidarBoard.style.transform = '';
                    lidarBoard.style.transformOrigin = 'center';
                    
                    // Trigger hotspot repositioning after zoom reset is complete
                    setTimeout(() => {
                        const event = new Event('resize');
                        window.dispatchEvent(event);
                    }, 50);
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
     * Toggle zoom state (for zoom extents button) with improved state management
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
                // Force clean state
                lidarBoard.style.transform = '';
                lidarBoard.style.transformOrigin = 'center';
                
                // Trigger repositioning after zoom reset
                setTimeout(() => {
                    const event = new Event('resize');
                    window.dispatchEvent(event);
                }, 50);
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
