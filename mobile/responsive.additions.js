/**
 * RESPONSIVE ADDITIONS - Mobile Enablement JavaScript
 * Non-destructive, additive-only mobile enhancements
 * Load AFTER existing JavaScript files
 */

/* ROLLBACK: Remove the three FIX blocks below to restore previous behavior */

(function() {
  'use strict';

  /* FIX: Issue 1 & 3 - Scroll lock management for overlays */
  let scrollPosition = 0;

  function lockScroll() {
    if (window.innerWidth > 768) return; // Mobile only
    try {
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      document.body.classList.add('overlay-active');
      document.body.style.top = `-${scrollPosition}px`;
    } catch (e) {
      console.debug('Scroll lock skipped:', e);
    }
  }

  function unlockScroll() {
    if (window.innerWidth > 768) return; // Mobile only
    try {
      document.body.classList.remove('overlay-active');
      document.body.style.top = '';
      window.scrollTo(0, scrollPosition);
    } catch (e) {
      console.debug('Scroll unlock skipped:', e);
    }
  }

  /* FIX: Issue 1 - Ensure loader overlay coverage on mobile */
  function ensureLoaderCoverage() {
    if (window.innerWidth > 768) return; // Mobile only
    
    const overlays = document.querySelectorAll('.video-overlay, #videoOverlay');
    overlays.forEach(overlay => {
      if (!overlay) return;
      
      // Monitor class changes for active state
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (overlay.classList.contains('active')) {
              lockScroll();
              // Force full coverage
              overlay.style.position = 'fixed';
              overlay.style.inset = '0';
              overlay.style.zIndex = '999999';
            } else {
              unlockScroll();
            }
          }
        });
      });
      
      observer.observe(overlay, { attributes: true });
      
      // Initial check
      if (overlay.classList.contains('active')) {
        lockScroll();
      }
    });
  }

  /* FIX: Issue 2 - Verify logo centering on orientation change */
  function handleOrientationChange() {
    if (window.innerWidth > 768) return; // Mobile only
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        const logoSection = document.querySelector('.logo-section');
        if (logoSection && logoSection.classList.contains('locked')) {
          // Force recenter
          logoSection.style.display = 'flex';
          logoSection.style.alignItems = 'center';
          logoSection.style.justifyContent = 'center';
        }
      }, 100);
    });
  }

  /* FIX: Issue 3 - Video popup scroll lock and layout */
  function handleVideoPopups() {
    if (window.innerWidth > 768) return; // Mobile only
    
    // Monitor hotspot clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.hotspot')) {
        setTimeout(() => {
          const activeOverlay = document.querySelector('.video-overlay.active');
          if (activeOverlay) {
            lockScroll();
            
            // Ensure video is contained
            const video = activeOverlay.querySelector('.overlay-video');
            if (video) {
              video.style.objectFit = 'contain';
            }
            
            // Ensure description doesn't overlap
            const desc = activeOverlay.querySelector('.video-description-panel');
            if (desc) {
              desc.style.position = 'relative';
              desc.style.bottom = 'auto';
            }
          }
        }, 100);
      }
    });
    
    // Monitor close button clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.overlay-close')) {
        unlockScroll();
      }
    });
    
    // Monitor ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeOverlay = document.querySelector('.video-overlay.active');
        if (activeOverlay) {
          unlockScroll();
        }
      }
    });
  }

  /* Initialize all fixes */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    ensureLoaderCoverage();
    handleOrientationChange();
    handleVideoPopups();
  }
  
  init();
})();