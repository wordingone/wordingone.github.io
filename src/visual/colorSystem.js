import * as THREE from 'three';

/**
 * Advanced Color System for Regional Model Highlighting
 * Based on patinated material aesthetic with weathered blue-gray + warm undertones
 * Follows UX principles for subtle, accessible color differentiation
 */

// Regional color palette inspired by the patinated material screenshot
// Uses very low saturation (3-8%) to maintain sophisticated, subtle appearance
export const REGION_COLORS = {
    'mirror': {
        name: 'Aureate Patina',
        primary: new THREE.Color(0xB8860B),    // Dark goldenrod
        tint: new THREE.Color(0xFDFCF7),       // Warm ivory tint (2% saturation)
        hover: new THREE.Color(0xFBF8EC),      // Slightly warmer for hover (4% saturation)
        focus: new THREE.Color(0xF7F1D8),      // Focus state (6% saturation)
        css: '#FDFCF7',
        description: 'Warm golden patina, like aged brass'
    },
    'red_dye': {
        name: 'Oxide Vermillion',
        primary: new THREE.Color(0x8B4513),    // Saddle brown with red undertones
        tint: new THREE.Color(0xFEF9F8),       // Very light warm blush (2% saturation)
        hover: new THREE.Color(0xFDF2F0),      // Hover state (4% saturation)
        focus: new THREE.Color(0xFBE6E2),      // Focus state (6% saturation)
        css: '#FEF9F8',
        description: 'Rust-red patina, like oxidized iron'
    },
    'circulation_1': {
        name: 'Verdigris Violet',
        primary: new THREE.Color(0x5D6B83),    // Blue-gray from screenshot
        tint: new THREE.Color(0xF8F9FB),       // Cool blue-gray tint (3% saturation)
        hover: new THREE.Color(0xF2F4F7),      // Hover state (5% saturation)
        focus: new THREE.Color(0xE8EBEF),      // Focus state (8% saturation)
        css: '#F8F9FB',
        description: 'Cool blue-gray patina, like aged copper'
    },
    'archive_inside': {
        name: 'Concrete Ash',
        primary: new THREE.Color(0x6B7280),    // Cool gray
        tint: new THREE.Color(0xFAFAFA),       // Pure light gray (1% saturation)
        hover: new THREE.Color(0xF4F5F6),      // Hover state (3% saturation)
        focus: new THREE.Color(0xEBECED),      // Focus state (5% saturation)
        css: '#FAFAFA',
        description: 'Clean concrete gray, architectural neutrality'
    },
    'archive_2': {
        name: 'Midnight Patina',
        primary: new THREE.Color(0x1E3A5F),    // Deep blue from screenshot undertones
        tint: new THREE.Color(0xF7F8FB),       // Very light blue tint (3% saturation)
        hover: new THREE.Color(0xEFF2F7),      // Hover state (6% saturation)
        focus: new THREE.Color(0xE1E8F0),      // Focus state (8% saturation)
        css: '#F7F8FB',
        description: 'Deep blue patina, like twilight stone'
    },
    'insula': {
        name: 'Umber Shadow',
        primary: new THREE.Color(0x704241),    // Warm brown from screenshot warm tones
        tint: new THREE.Color(0xFBF9F8),       // Warm neutral tint (2% saturation)
        hover: new THREE.Color(0xF7F3F1),      // Hover state (4% saturation)
        focus: new THREE.Color(0xF0E8E4),      // Focus state (6% saturation)
        css: '#FBF9F8',
        description: 'Warm earth tone, like aged terracotta'
    },
    'altar': {
        name: 'Sacred Bronze',
        primary: new THREE.Color(0x9A7B4F),    // Warm bronze
        tint: new THREE.Color(0xFCFAF7),       // Warm stone tint (2% saturation)
        hover: new THREE.Color(0xF9F5F0),      // Hover state (4% saturation)
        focus: new THREE.Color(0xF4EDDE),      // Focus state (7% saturation)
        css: '#FCFAF7',
        description: 'Sacred bronze patina, ceremonial warmth'
    },
    'index': {
        name: 'Archive Silver',
        primary: new THREE.Color(0x8E9AAF),    // Cool blue-gray
        tint: new THREE.Color(0xF9F9FB),       // Neutral cool tint (2% saturation)
        hover: new THREE.Color(0xF2F3F6),      // Hover state (4% saturation)
        focus: new THREE.Color(0xE7E9ED),      // Focus state (6% saturation)
        css: '#F9F9FB',
        description: 'Cool archival silver, information clarity'
    }
};

/**
 * Color application states for smooth transitions
 */
export const COLOR_STATES = {
    DEFAULT: 'default',     // No color applied (pure materials)
    HOVER: 'hover',         // Subtle tint on hotspot hover
    FOCUS: 'focus'          // Stronger tint when region is selected
};

/**
 * Color System Manager
 * Handles application and removal of regional colors with smooth transitions
 */
export class ColorSystem {
    constructor() {
        this.originalMaterials = new Map(); // Store original material colors
        this.currentState = COLOR_STATES.DEFAULT;
        this.currentRegion = null;
        this.transitionDuration = 300; // ms for smooth color transitions
    }

    /**
     * Store original material colors for restoration
     * @param {THREE.Object3D} object - Object to catalog
     */
    catalogMaterial(object) {
        if (!object.material) return;

        if (Array.isArray(object.material)) {
            this.originalMaterials.set(object.uuid, object.material.map(mat => ({
                color: mat.color.clone(),
                emissive: mat.emissive ? mat.emissive.clone() : new THREE.Color(0x000000)
            })));
        } else {
            this.originalMaterials.set(object.uuid, {
                color: object.material.color.clone(),
                emissive: object.material.emissive ? object.material.emissive.clone() : new THREE.Color(0x000000)
            });
        }
    }

    /**
     * Apply regional color tint to object materials
     * @param {THREE.Object3D} object - Object to tint
     * @param {string} regionName - Region name for color lookup
     * @param {string} state - Color state (hover, focus)
     */
    applyRegionalTint(object, regionName, state = COLOR_STATES.HOVER) {
        if (!object.material || !REGION_COLORS[regionName]) {
            console.warn(`Cannot apply tint - missing material or region color for: ${regionName}`);
            return;
        }

        const colorConfig = REGION_COLORS[regionName];
        const tintColor = colorConfig[state] || colorConfig.tint;
        
        console.log(`Applying ${state} tint for ${regionName}:`, tintColor.getHexString());

        if (Array.isArray(object.material)) {
            console.log(`Processing ${object.material.length} materials for object`);
            object.material.forEach((material, index) => {
                this.applyTintToMaterial(material, tintColor, object.uuid, index);
            });
        } else {
            console.log(`Processing single material for object`);
            this.applyTintToMaterial(object.material, tintColor, object.uuid);
        }
    }

    /**
     * Apply tint to individual material
     * @param {THREE.Material} material - Material to tint
     * @param {THREE.Color} tintColor - Color to apply
     * @param {string} objectId - Object UUID for restoration
     * @param {number} materialIndex - Material index for arrays
     */
    applyTintToMaterial(material, tintColor, objectId, materialIndex = 0) {
        console.log(`Applying tint to material:`, material.type, 'with color:', tintColor.getHexString());
        
        // Store original if not already stored
        if (!this.originalMaterials.has(objectId)) {
            this.catalogMaterial({ uuid: objectId, material });
        }

        // Apply tint by multiplying with original color
        const original = this.originalMaterials.get(objectId);
        if (original) {
            const originalColor = Array.isArray(original) ? original[materialIndex]?.color : original.color;
            if (originalColor) {
                console.log(`Original color:`, originalColor.getHexString());
                
                // Store current color before change
                const beforeColor = material.color.getHexString();
                
                // Subtle color mixing: 85% original + 15% tint for very subtle effect
                material.color.copy(originalColor).lerp(tintColor, 0.15);
                
                console.log(`Color changed from ${beforeColor} to ${material.color.getHexString()}`);
                
                // Add very subtle emissive glow for enhanced visibility
                if (material.emissive) {
                    material.emissive.copy(tintColor).multiplyScalar(0.02); // Very subtle glow
                    console.log(`Applied emissive:`, material.emissive.getHexString());
                }
                
                // Force material update
                material.needsUpdate = true;
            } else {
                console.warn('No original color found for material');
            }
        } else {
            console.warn('No original material data found for object:', objectId);
        }
    }

    /**
     * Restore original material colors
     * @param {THREE.Object3D} object - Object to restore
     */
    restoreOriginalColors(object) {
        if (!object.material) return;

        const original = this.originalMaterials.get(object.uuid);
        if (!original) return;

        if (Array.isArray(object.material)) {
            object.material.forEach((material, index) => {
                if (original[index]) {
                    material.color.copy(original[index].color);
                    if (material.emissive && original[index].emissive) {
                        material.emissive.copy(original[index].emissive);
                    }
                }
            });
        } else {
            object.material.color.copy(original.color);
            if (object.material.emissive && original.emissive) {
                object.material.emissive.copy(original.emissive);
            }
        }
    }

    /**
     * Set global color state for region
     * @param {string} regionName - Region to highlight
     * @param {string} state - Color state to apply
     */
    setRegionState(regionName, state = COLOR_STATES.HOVER) {
        this.currentRegion = regionName;
        this.currentState = state;
    }

    /**
     * Clear all color states and restore defaults
     */
    clearState() {
        this.currentRegion = null;
        this.currentState = COLOR_STATES.DEFAULT;
    }

    /**
     * Get CSS color for UI elements
     * @param {string} regionName - Region name
     * @param {string} state - Color state
     * @returns {string} CSS color value
     */
    getCSSColor(regionName, state = COLOR_STATES.HOVER) {
        const colorConfig = REGION_COLORS[regionName];
        if (!colorConfig) return '#FFFFFF';
        
        return colorConfig.css;
    }

    /**
     * Get color description for accessibility
     * @param {string} regionName - Region name
     * @returns {string} Color description
     */
    getColorDescription(regionName) {
        const colorConfig = REGION_COLORS[regionName];
        return colorConfig ? colorConfig.description : 'Default color';
    }
}

/**
 * Create and initialize the color system
 * @returns {ColorSystem} Initialized color system
 */
export function createColorSystem() {
    const colorSystem = new ColorSystem();
    console.log('Advanced patinated color system initialized');
    console.log('Available regions:', Object.keys(REGION_COLORS));
    return colorSystem;
}

// Export for debugging and inspection
export { REGION_COLORS as debugColors };
