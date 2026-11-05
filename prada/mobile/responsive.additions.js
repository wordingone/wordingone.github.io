/**
 * RESPONSIVE ADDITIONS - Mobile Enablement JavaScript
 * Non-destructive, additive-only mobile enhancements
 * Load AFTER existing JavaScript files
 */

(function() {
  'use strict';

  // Detect mobile viewport
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Fix video overlay positioning on mobile
  function fixVideoOverlayPosition() {
    if (!isMobile()) return;
    
    // Watch for video overlays being added to DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList && node.classList.contains('video-overlay')) {
            console.log('Mobile: Fixing video overlay position');
            
            // Override the inline styles set by JavaScript
            setTimeout(() => {
              node.style.position = 'fixed';
              node.style.left = '50%';
              node.style.top = '50%';
              node.style.transform = 'translate(-50%, -50%)';
              node.style.width = 'calc(100vw - 40px)';
              node.style.maxWidth = '400px';
              node.style.height = 'auto';
              node.style.maxHeight = '80vh';
              node.style.borderRadius = '12px';
              
              // Add body lock
              document.body.classList.add('video-overlay-active');
            }, 100);
            
            // Watch for removal
            const closeObserver = new MutationObserver(() => {
              if (!document.querySelector('.video-overlay')) {
                document.body.classList.remove('video-overlay-active');
              }
            });
            closeObserver.observe(document.body, { childList: true, subtree: true });
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Fix hotspot sizing on mobile
  function fixHotspotSizing() {
    if (!isMobile()) return;
    
    const style = document.createElement('style');
    style.id = 'mobile-hotspot-fixes';
    style.textContent = `
      @media screen and (max-width: 768px) {
        .hotspot::after {
          width: 18px !important;
          height: 18px !important;
          font-size: 9px !important;
          line-height: 18px !important;
        }
      }
      
      @media screen and (max-width: 480px) {
        .hotspot::after {
          width: 16px !important;
          height: 16px !important;
          font-size: 8px !important;
          line-height: 16px !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // Handle orientation changes
  function handleOrientationChange() {
    if (!isMobile()) return;
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        const overlay = document.querySelector('.video-overlay');
        if (overlay) {
          overlay.style.left = '50%';
          overlay.style.top = '50%';
          overlay.style.transform = 'translate(-50%, -50%)';
        }
      }, 300);
    });
  }

  // Initialize all mobile fixes
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    console.log('Mobile fixes initializing...');
    
    fixVideoOverlayPosition();
    fixHotspotSizing();
    handleOrientationChange();
    
    // Also fix on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (isMobile()) {
          const overlay = document.querySelector('.video-overlay');
          if (overlay) {
            overlay.style.left = '50%';
            overlay.style.top = '50%';
            overlay.style.transform = 'translate(-50%, -50%)';
            overlay.style.width = 'calc(100vw - 40px)';
            overlay.style.maxWidth = '400px';
          }
        }
      }, 250);
    });
  }
  
  init();
})();