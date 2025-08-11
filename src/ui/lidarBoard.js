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
            
            console.log('Highlighting enabled - CSS mask with tight feathered edges');
            console.log('Feather radius: 3px for sharp transition');
        } else {
            rootEl.classList.remove('highlighting');
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
        const boardRect = rootEl.getBoundingClientRect();
        const scaleX = boardRect.width / REFERENCE_WIDTH;
        const scaleY = boardRect.height / REFERENCE_HEIGHT;
        
        // Build CSS mask using polygon shapes - start with full coverage
        let maskPaths = [];
        
        // Create rectangular holes for each hotspot
        hotspots.forEach(hotspot => {
            const coords = hotspot.dataset.coords.split(',').map(Number);
            const [x, y, width, height] = coords;
            
            // Scale coordinates to current container size
            const scaledX = (x * scaleX) / boardRect.width * 100; // Convert to percentage
            const scaledY = (y * scaleY) / boardRect.height * 100;
            const scaledWidth = (width * scaleX) / boardRect.width * 100;
            const scaledHeight = (height * scaleY) / boardRect.height * 100;
            
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
        const svgMask = createSVGMask(maskPaths, boardRect.width, boardRect.height);
        
        // Apply the mask to the ::before pseudo-element via CSS custom property
        rootEl.style.setProperty('--mask-image', `url("data:image/svg+xml,${encodeURIComponent(svgMask)}")`);
        
        // Apply the mask via CSS (reuse single style element)
        if (!maskStyleElement) {
            maskStyleElement = document.createElement('style');
            maskStyleElement.id = 'lidar-mask-style';
            document.head.appendChild(maskStyleElement);
        }
        
        maskStyleElement.textContent = `
            #lidar-board.highlighting::before {
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
        // Remove the CSS mask
        rootEl.style.removeProperty('--mask-image');
        
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
     * Position hotspots responsively
     */
    function positionHotspots() {
        const boardRect = rootEl.getBoundingClientRect();
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
    
    // Handle window resize for responsive hotspots
    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            positionHotspots();
            // Recreate mask if highlighting is active
            if (isHighlighting) {
                createMaskWithHoles();
            }
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
    
    // Public API
    return {
        positionHotspots,
        createMaskWithHoles: () => isHighlighting && createMaskWithHoles(),
        setHighlighting: (enabled) => {
            if (enabled !== isHighlighting) {
                highlightBtn.click(); // Trigger the same logic
            }
        },
        getHighlighting: () => isHighlighting
    };
}
