/**
 * Debug utility for testing the model focus system
 * This can be used in browser console for testing
 */

// Add to window object for console testing
window.debugModelFocus = function() {
    // This assumes modelFocus is available globally after initialization
    // In production, you might need to expose it differently
    
    console.log('=== MODEL FOCUS DEBUG ===');
    
    if (typeof window.modelFocus === 'undefined') {
        console.warn('Model focus system not found. Make sure main.js has completed initialization.');
        return;
    }
    
    const focus = window.modelFocus;
    
    console.log('Available regions:', focus.getAvailableRegions());
    console.log('Current focus:', focus.getCurrentFocus());
    console.log('Is focused:', focus.isFocused());
    console.log('Model mapping:', focus.getModelMapping());
    console.log('Model catalog:', focus.getModelCatalog());
    
    // Test focus on altar
    console.log('\n--- Testing altar focus ---');
    focus.focusOnRegion('altar');
    
    setTimeout(() => {
        console.log('Current focus after altar:', focus.getCurrentFocus());
        console.log('Is focused after altar:', focus.isFocused());
        
        // Clear focus
        console.log('\n--- Clearing focus ---');
        focus.clearFocus();
        
        setTimeout(() => {
            console.log('Current focus after clear:', focus.getCurrentFocus());
            console.log('Is focused after clear:', focus.isFocused());
        }, 1000);
    }, 2000);
};

console.log('Debug utility loaded. Call window.debugModelFocus() to test the system.');
