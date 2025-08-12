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
            title: 'ALTAR SERIES',
            description: 'The primary work platforms for direct interaction between designers and visitors. Garments are altered, repaired, or customized in an open, visible setting.'
        },
        'archive_inside': {
            videos: ['videos/archive_inside.mp4'],
            title: 'ARCHIVE INSIDE',
            description: 'Views of the archive inside the archive. Items are stored in a controlled environment, ready to be retrieved for alteration or display.'
        },
        'archive_2': {
            videos: ['videos/archive_1.mp4', 'videos/archive_2.mp4', 'videos/archive_3.mp4', 'videos/archive_4.mp4', 'videos/archive_5.mp4', 'videos/archive_6.mp4'],
            title: 'ARCHIVE SERIES',
            description: 'The exterior view of the archive, where the visitor first meets the building. The glass blocks both obscure and tease of the archive.'
        },
        'red_dye': {
            videos: ['videos/Red Dye.mp4'],
            title: 'RED DYE',
            description: 'The dyeing station where garments are recolored or treated to change their material properties. Used for both restoration and creative alteration.'
        },
        'circulation_1': {
            videos: ['videos/circulation_1.mp4', 'videos/circulation_2.mp4'],
            title: 'CIRCULATION SERIES',
            description: 'Main vertical and horizontal circulation routes. Connects the courtyard, work areas, and archive, enabling movement of people, garments, and equipment.'
        },
        'index': {
            videos: ['videos/index_1.mp4', 'videos/index_2.mp4'],
            title: 'INDEX SERIES',
            description: 'Garments are scanned, measured, and documented in detail. Each item\'s physical characteristics are converted into digital records that guide repair, modification, and design decisions.'
        },
        'insula': {
            videos: ['videos/insula.mp4'],
            title: 'INSULA',
            description: 'The overall insula layout. Organizes the building around a central courtyard, with production, storage, and exhibition spaces positioned for visibility and accessibility.'
        },
        'mirror': {
            videos: ['videos/Mirror.mp4'],
            title: 'MIRROR',
            description: 'A mirrored corridor on the first floor provides visual continuity through the building. It reflects movement and activity, introducing visitors to the processes that will appear later at the altars.'
        },
        'exhibition-right': {
            videos: ['videos/Model 1.mp4', 'videos/Model 2.mp4', 'videos/Model 3.mp4', 'videos/Model 4.mp4'],
            title: 'MODEL SERIES',
            description: 'The physical model as well as the actual presentation of the project being filmed, using projections, resin casted model, as well as a Pepper\'s ghost hologram.'
        }
    };
    
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
        
        // Find the lidar container element that actually needs to zoom
        const lidarContainer = lidarBoard.querySelector('.lidar-container');
        if (!lidarContainer) {
            console.error('Could not find .lidar-container for zoom');
            return;
        }
        
        // Calculate transform origin based on hotspot center
        const coords = hotspot.dataset.coords.split(',').map(Number);
        const [x, y, width, height] = coords;
        
        // Calculate center in reference coordinates
        const centerX = x + (width / 2);
        const centerY = y + (height / 2);
        
        // Convert to percentages (reference dimensions are 1920x1080)
        const transformOriginXPercent = (centerX / 1920) * 100;
        const transformOriginYPercent = (centerY / 1080) * 100;
        
        console.log(`Setting transform origin to: ${transformOriginXPercent.toFixed(1)}% ${transformOriginYPercent.toFixed(1)}% for region ${region}`);
        
        // CRITICAL FIX: Apply the transform origin AND scale transform directly
        lidarContainer.style.transformOrigin = `${transformOriginXPercent}% ${transformOriginYPercent}%`;
        lidarContainer.style.transform = 'scale(3.5)';
        lidarContainer.style.transition = 'transform 1000ms ease-out';
        
        // Also add the class for any CSS-based styling
        lidarBoard.classList.add('zooming');
        isZoomed = true;
        
        console.log('Applied zoom transform directly to lidar container');
        console.log('Container transform:', lidarContainer.style.transform);
        console.log('Container transform-origin:', lidarContainer.style.transformOrigin);
        
        // Wait for zoom animation to complete before showing video
        setTimeout(() => {
            console.log('Creating video overlay after zoom animation');
            createVideoSeriesOverlay(region);
            
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
     * Create video series overlay with navigation controls
     * @param {string} region - Region name for the overlay
     */
    function createVideoSeriesOverlay(region) {
        console.log('Creating video overlay for region:', region);
        
        // Create overlay container
        currentOverlay = document.createElement('div');
        currentOverlay.className = 'video-overlay frame-positioned series-player';
        currentOverlay.setAttribute('data-region', region); // Add region for CSS targeting
        
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
                ${currentSeries.description ? `
                    <div class="video-description-panel">
                        <p class="video-description-text">${currentSeries.description}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Position overlay in fixed viewport location
        positionOverlayInViewport(currentOverlay);
        
        // Add overlay to the body for fixed positioning
        document.body.appendChild(currentOverlay);
        
        // Force reflow
        currentOverlay.offsetHeight;
        
        // Set up event listeners
        setupVideoSeriesListeners();
        
        // Trigger overlay animation
        setTimeout(() => {
            if (currentOverlay) {
                currentOverlay.classList.add('active');
            }
        }, 50);
    }
    
    /**
     * Position overlay in a fixed viewport location
     * @param {HTMLElement} overlay - Overlay element
     */
    function positionOverlayInViewport(overlay) {
        // Fixed viewport positioning
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Position overlay at a fixed location in viewport
        const overlayWidth = 600;
        const overlayHeight = 530; // Increased to accommodate description
        
        // Fixed position: right side of viewport, vertically centered
        const overlayX = viewportWidth - overlayWidth - 40;
        const overlayY = (viewportHeight - overlayHeight) / 2;
        
        overlay.style.cssText = `
            position: fixed !important;
            left: ${overlayX}px !important;
            top: ${overlayY}px !important;
            width: ${overlayWidth}px !important;
            height: ${overlayHeight}px !important;
            z-index: 10000 !important;
            border-radius: 20px !important;
            overflow: visible !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.8) !important;
            pointer-events: auto !important;
            background: rgba(15, 15, 18, 0.95) !important;
            display: block !important;
        `;
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
        video.addEventListener('ended', () => {
            if (isAutoPlaying && currentVideoIndex < currentSeries.videos.length - 1) {
                setTimeout(() => {
                    playNextVideo();
                }, 500);
            }
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
    }
    
    /**
     * Show "no video available" message
     * @param {string} region - Region name
     * @param {HTMLElement} hotspot - Hotspot element
     */
    function showNoVideoMessage(region, hotspot) {
        // Find the lidar container element that needs to zoom
        const lidarContainer = lidarBoard.querySelector('.lidar-container');
        if (!lidarContainer) {
            console.error('Could not find .lidar-container for zoom');
            return;
        }
        
        // Calculate transform origin based on hotspot center
        const coords = hotspot.dataset.coords.split(',').map(Number);
        const [x, y, width, height] = coords;
        
        const centerX = x + (width / 2);
        const centerY = y + (height / 2);
        
        const transformOriginXPercent = (centerX / 1920) * 100;
        const transformOriginYPercent = (centerY / 1080) * 100;
        
        // Apply zoom transform directly
        lidarContainer.style.transformOrigin = `${transformOriginXPercent}% ${transformOriginYPercent}%`;
        lidarContainer.style.transform = 'scale(3.5)';
        lidarContainer.style.transition = 'transform 1000ms ease-out';
        
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
            
            positionOverlayInViewport(currentOverlay);
            document.body.appendChild(currentOverlay);
            
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
            
            isOverlayActive = false;
            
            // Reset series state
            currentSeries = null;
            currentVideoIndex = 0;
            isAutoPlaying = true;
            
            // Reset zoom on LiDAR board
            if (isZoomed) {
                const lidarContainer = lidarBoard.querySelector('.lidar-container');
                
                // CRITICAL FIX: Reset the transform directly
                if (lidarContainer) {
                    lidarContainer.style.transform = 'scale(1)';
                    lidarContainer.style.transition = 'transform 800ms ease-in-out';
                    
                    // Reset transform origin after animation
                    setTimeout(() => {
                        lidarContainer.style.transformOrigin = 'center';
                    }, 800);
                }
                
                lidarBoard.classList.remove('zooming');
                lidarBoard.classList.add('zoom-reset');
                
                isZoomed = false;
                
                // Remove zoom-reset class after animation
                setTimeout(() => {
                    lidarBoard.classList.remove('zoom-reset');
                    
                    // Trigger hotspot repositioning
                    const event = new Event('resize');
                    window.dispatchEvent(event);
                }, 800);
            }
            
            // Callback for overlay closed
            if (onOverlayClose) {
                onOverlayClose();
            }
        }, 300);
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
    }
    
    /**
     * Toggle zoom state (for zoom extents button)
     */
    function toggleZoom() {
        if (isZoomed && !isOverlayActive) {
            // Reset zoom if zoomed but no active overlay
            const lidarContainer = lidarBoard.querySelector('.lidar-container');
            
            if (lidarContainer) {
                lidarContainer.style.transform = 'scale(1)';
                lidarContainer.style.transition = 'transform 800ms ease-in-out';
                
                setTimeout(() => {
                    lidarContainer.style.transformOrigin = 'center';
                }, 800);
            }
            
            lidarBoard.classList.remove('zooming');
            lidarBoard.classList.add('zoom-reset');
            
            isZoomed = false;
            
            setTimeout(() => {
                lidarBoard.classList.remove('zoom-reset');
                
                const event = new Event('resize');
                window.dispatchEvent(event);
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
    
    console.log('Video overlay system initialized with FIXED zoom functionality');
    
    // Public API
    return {
        showOverlay,
        hideOverlay,
        toggleZoom,
        addHoverEffects,
        isActive: () => isOverlayActive,
        isZoomed: () => isZoomed
    };
}