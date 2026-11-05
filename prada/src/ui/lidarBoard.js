import { REFERENCE_WIDTH, REFERENCE_HEIGHT } from '../config/hotspots.js';

/**
 * Initialize LiDAR board with responsive hotspots and masking
 * @param {HTMLElement} rootEl - Root LiDAR board element
 * @param {Object} callbacks - {onSelect, onZoomExtents}
 * @returns {Object} LiDAR board API
 */
export function initLidarBoard(rootEl, callbacks = {}) {
    console.log('Initializing responsive LiDAR board with SVG masking...');
    
    const { onSelect, onZoomExtents } = callbacks;
    
    const highlightBtn = document.getElementById('btnHighlight');
    const zoomExtentsBtn = document.getElementById('btnZoomExtents');
    const hotspots = rootEl.querySelectorAll('.hotspot');
    
    let isHighlighting = false;
    let maskStyleElement = null; // Reuse single style element
    
    // Highlight toggle functionality
    highlightBtn.addEventListener('click', function() {
        isHighlighting = !isHighlighting;
        
        if (isHighlighting) {
            rootEl.classList.add('highlighting');
            highlightBtn.classList.add('active');
            
            // Create CSS mask with holes for hotspots
            createMaskWithHoles();
            
            // Add smooth dissolving animation after a brief delay
            setTimeout(() => {
                rootEl.classList.add('mask-active');
            }, 50);
            
            console.log('Highlighting enabled - CSS mask with smooth dissolving animation');
            console.log('Fade-in duration: 0.8s for smooth transition');
        } else {
            rootEl.classList.remove('highlighting', 'mask-active');
            highlightBtn.classList.remove('active');
            
            // Remove CSS mask
            removeMask();
            
            console.log('Highlighting disabled - normal bright image restored');
        }
    });
    
    /**
     * Create SVG mask with holes for hotspots
     */
    function createMaskWithHoles() {
        const container = rootEl.querySelector('.lidar-container');
        if (!container) {
            console.error('LiDAR container not found for masking');
            return;
        }
        
        const containerRect = container.getBoundingClientRect();
        const scaleX = containerRect.width / REFERENCE_WIDTH;
        const scaleY = containerRect.height / REFERENCE_HEIGHT;
        
        // Build CSS mask using polygon shapes - start with full coverage
        let maskPaths = [];
        
        // Create rectangular holes for each hotspot
        hotspots.forEach(hotspot => {
            const coords = hotspot.dataset.coords.split(',').map(Number);
            const [x, y, width, height] = coords;
            
            // Scale coordinates to current container size
            const scaledX = (x * scaleX) / containerRect.width * 100; // Convert to percentage
            const scaledY = (y * scaleY) / containerRect.height * 100;
            const scaledWidth = (width * scaleX) / containerRect.width * 100;
            const scaledHeight = (height * scaleY) / containerRect.height * 100;
            
            // Create a rectangular hole (black = hidden in mask)
            const holeRect = {
                left: scaledX,
                top: scaledY,
                right: scaledX + scaledWidth,
                bottom: scaledY + scaledHeight
            };
            
            maskPaths.push(holeRect);
        });
        
        // Create an SVG mask with holes
        const svgMask = createSVGMask(maskPaths, containerRect.width, containerRect.height);
        
        // Apply the mask to the container's ::before pseudo-element
        container.style.setProperty('--mask-image', `url("data:image/svg+xml,${encodeURIComponent(svgMask)}")`);
        
        // Apply the mask via CSS (reuse single style element)
        if (!maskStyleElement) {
            maskStyleElement = document.createElement('style');
            maskStyleElement.id = 'lidar-mask-style';
            document.head.appendChild(maskStyleElement);
        }
        
        maskStyleElement.textContent = `
            #lidar-board.highlighting .lidar-container::before {
                mask: var(--mask-image);
                -webkit-mask: var(--mask-image);
                mask-repeat: no-repeat;
                -webkit-mask-repeat: no-repeat;
                mask-size: 100% 100%;
                -webkit-mask-size: 100% 100%;
            }
        `;
    }
    
    /**
     * Create SVG mask with feathered holes
     * @param {Array} holeRects - Array of hole rectangles
     * @param {number} width - Mask width
     * @param {number} height - Mask height
     * @returns {string} SVG mask string
     */
    function createSVGMask(holeRects, width, height) {
        // Create SVG mask - WHITE shows content, BLACK hides it
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        svg += `<defs>`;
        
        // Add blur filter for feathered edges
        svg += `<filter id="featherBlur">`;
        svg += `<feGaussianBlur in="SourceGraphic" stdDeviation="3"/>`;
        svg += `</filter>`;
        
        svg += `<mask id="cutoutMask">`;
        
        // White background (visible area - the overlay)
        svg += `<rect width="100%" height="100%" fill="white"/>`;
        
        // Black rectangles with feathered edges (hidden areas - holes)
        holeRects.forEach(hole => {
            const x = (hole.left / 100) * width;
            const y = (hole.top / 100) * height;
            const w = ((hole.right - hole.left) / 100) * width;
            const h = ((hole.bottom - hole.top) / 100) * height;
            
            svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="black" filter="url(#featherBlur)"/>`;
        });
        
        svg += `</mask></defs>`;
        svg += `<rect width="100%" height="100%" fill="white" mask="url(#cutoutMask)"/>`;
        svg += `</svg>`;
        
        return svg;
    }
    
    /**
     * Remove CSS mask
     */
    function removeMask() {
        const container = rootEl.querySelector('.lidar-container');
        if (container) {
            container.style.removeProperty('--mask-image');
        }
        
        // Clear the style content but keep the element for reuse
        if (maskStyleElement) {
            maskStyleElement.textContent = '';
        }
    }
    
    // Zoom extents functionality
    zoomExtentsBtn.addEventListener('click', function() {
        console.log('Zoom Extents clicked - reset camera view');
        if (onZoomExtents) {
            onZoomExtents();
        }
    });
    
    /**
    * Position hotspots responsively within the aspect ratio container
    */
function positionHotspots() {
    // Don't reposition during zoom transitions to avoid conflicts
    if (rootEl.classList.contains('zooming') || rootEl.classList.contains('zoom-reset')) {
        console.log('Skipping hotspot positioning during zoom transition');
        return;
    }
    
    // Get the container that holds both background and hotspots
    const container = rootEl.querySelector('.lidar-container');
    if (!container) {
        console.error('LiDAR container not found');
        return;
    }
    
    hotspots.forEach(hotspot => {
        const coords = hotspot.dataset.coords.split(',').map(Number);
        const rotation = parseFloat(hotspot.dataset.rotation || 0);
        
        const [x, y, width, height] = coords;
        
        // Convert to percentages based on reference dimensions
        const leftPercent = (x / REFERENCE_WIDTH) * 100;
        const topPercent = (y / REFERENCE_HEIGHT) * 100;
        const widthPercent = (width / REFERENCE_WIDTH) * 100;
        const heightPercent = (height / REFERENCE_HEIGHT) * 100;
        
        // Apply percentage-based positioning
        hotspot.style.left = leftPercent + '%';
        hotspot.style.top = topPercent + '%';
        hotspot.style.width = widthPercent + '%';
        hotspot.style.height = heightPercent + '%';
        hotspot.style.transform = `rotate(${rotation}deg)`;
    });
    
    console.log(`Positioned ${hotspots.length} hotspots using percentage-based layout`);
}
    
    // Add click handlers for hotspots with color integration
    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', function(e) {
            e.preventDefault();
            handleHotspotClick(this);
        });
        
        hotspot.addEventListener('mouseenter', function() {
            const area = this.dataset.area;
            console.log(`Hovering over ${area} area`);
            
            // Apply color highlight via callback
            if (callbacks.onHover) {
                callbacks.onHover(area, this);
            }
        });
        
        hotspot.addEventListener('mouseleave', function() {
            const area = this.dataset.area;
            console.log(`Leaving ${area} area`);
            
            // Remove color highlight via callback
            if (callbacks.onHoverEnd) {
                callbacks.onHoverEnd(area, this);
            }
        });
    });
    
    /**
     * Handle hotspot click
     * @param {HTMLElement} hotspot - Clicked hotspot element
     */
    function handleHotspotClick(hotspot) {
        const area = hotspot.dataset.area;
        console.log(`Clicked on ${area} hotspot`);
        
        // Don't add any visual state to the hotspot - no red highlighting
        
        // Callback for area selection
        if (onSelect) {
            onSelect(area, hotspot);
        }
    }
    
    // Handle window resize for responsive hotspots with improved debouncing
    let resizeTimeout;
    let isResizing = false;
    function handleResize() {
        if (isResizing) return;
        
        clearTimeout(resizeTimeout);
        isResizing = true;
        
        resizeTimeout = setTimeout(() => {
            // Reset any transform origin issues before repositioning
            const container = rootEl.querySelector('.lidar-container');
            if (!rootEl.classList.contains('zooming') && container) {
                container.style.transformOrigin = 'center';
            }
            
            positionHotspots();
            
            // Recreate mask if highlighting is active
            if (isHighlighting) {
                createMaskWithHoles();
            }
            
            isResizing = false;
        }, 150); // Increased debounce time for stability
    }
    
    // Set up resize listener
    window.addEventListener('resize', handleResize);
    
    // Enhanced initialization sequence
    function initializeHotspots() {
        // Reset any transform state on the container
        const container = rootEl.querySelector('.lidar-container');
        if (container) {
            container.style.transform = 'scale(1)';
            container.style.transformOrigin = 'center';
        }
        
        // Initial positioning with multiple checks
        setTimeout(positionHotspots, 50);
        setTimeout(positionHotspots, 200);
        setTimeout(positionHotspots, 500);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'complete') {
        initializeHotspots();
    } else {
        window.addEventListener('load', initializeHotspots);
        // Also try during DOM ready
        document.addEventListener('DOMContentLoaded', initializeHotspots);
    }
    
    console.log('Responsive LiDAR board initialized with mask-style interaction');
    
    // Public API with enhanced methods
    return {
        positionHotspots,
        createMaskWithHoles: () => isHighlighting && createMaskWithHoles(),
        setHighlighting: (enabled) => {
            if (enabled !== isHighlighting) {
                highlightBtn.click(); // Trigger the same logic
            }
        },
        getHighlighting: () => isHighlighting,
        forceRepositioning: () => {
            // Force clean state and reposition
            const container = rootEl.querySelector('.lidar-container');
            if (container) {
                container.style.transform = 'scale(1)';
                container.style.transformOrigin = 'center';
            }
            setTimeout(positionHotspots, 10);
        },
        resetState: () => {
            // Complete state reset
            rootEl.classList.remove('zooming', 'zoom-reset', 'highlighting', 'mask-active');
            const container = rootEl.querySelector('.lidar-container');
            if (container) {
                container.style.transform = 'scale(1)';
                container.style.transformOrigin = 'center';
            }
            isResizing = false;
            clearTimeout(resizeTimeout);
            setTimeout(positionHotspots, 10);
        }
    };
}
