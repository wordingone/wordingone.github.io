/**
 * RESPONSIVE ADDITIONS - Mobile Enablement JavaScript
 * Non-destructive, additive-only mobile enhancements
 * Load AFTER existing JavaScript files
 */

// Module pattern to avoid global scope pollution
(function() {
  'use strict';

  // ==========================================
  // Feature Detection
  // ==========================================
  
  const features = {
    touch: 'ontouchstart' in window,
    pointer: window.matchMedia('(any-pointer: coarse)').matches,
    hover: window.matchMedia('(any-hover: hover)').matches,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    lowMemory: navigator.deviceMemory && navigator.deviceMemory <= 4,
    webgl: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch(e) {
        return false;
      }
    })()
  };

  // ==========================================
  // Performance Optimizations
  // ==========================================
  
  /**
   * Reduce pixel ratio for mobile/low-memory devices
   * Only applies if renderer exists, otherwise no-op
   */
  function optimizePixelRatio() {
    try {
      const maxRatio = features.pointer ? 1.25 : 
                       features.lowMemory ? 1.5 : 2;
      
      const actualRatio = Math.min(window.devicePixelRatio || 1, maxRatio);
      
      // Try multiple possible renderer locations
      const rendererPaths = [
        window.app?.renderer,
        window.renderer,
        document.querySelector('canvas')?._renderer,
        window.THREE?.renderer
      ];
      
      for (const renderer of rendererPaths) {
        if (renderer?.setPixelRatio) {
          renderer.setPixelRatio(actualRatio);
          console.log(`Set pixel ratio to ${actualRatio} for mobile optimization`);
          break;
        }
      }
    } catch (error) {
      // Silently fail - non-destructive approach
      console.debug('Pixel ratio optimization not applied:', error.message);
    }
  }

  // ==========================================
  // Lazy Loading for Non-Critical Assets
  // ==========================================
  
  /**
   * Lazy load images and videos using IntersectionObserver
   * Only processes elements with data-lazy attribute
   */
  function initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      return; // Fallback to normal loading
    }
    
    const lazyElements = document.querySelectorAll('[data-lazy]');
    if (lazyElements.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          if (element.tagName === 'IMG' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
          } else if (element.tagName === 'VIDEO' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            element.load();
          }
          
          element.removeAttribute('data-lazy');
          imageObserver.unobserve(element);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    lazyElements.forEach(element => imageObserver.observe(element));
  }

  // ==========================================
  // Responsive Video Sources
  // ==========================================
  
  /**
   * Select appropriate video source based on viewport
   * Only applies to videos with data-sources attribute
   */
  function optimizeVideoSources() {
    const videos = document.querySelectorAll('video[data-sources]');
    if (videos.length === 0) return;
    
    const width = window.innerWidth;
    const connection = navigator.connection;
    const slowConnection = connection && 
      (connection.saveData || connection.effectiveType === 'slow-2g' || 
       connection.effectiveType === '2g');
    
    videos.forEach(video => {
      try {
        const sources = JSON.parse(video.dataset.sources);
        let selectedSource;
        
        if (slowConnection || width <= 480) {
          selectedSource = sources.low || sources.medium || sources.high;
        } else if (width <= 768) {
          selectedSource = sources.medium || sources.high;
        } else {
          selectedSource = sources.high || sources.medium;
        }
        
        if (selectedSource && video.src !== selectedSource) {
          const currentTime = video.currentTime;
          const wasPlaying = !video.paused;
          
          video.src = selectedSource;
          video.currentTime = currentTime;
          
          if (wasPlaying) {
            video.play().catch(() => {});
          }
        }
      } catch (error) {
        // Invalid JSON or missing sources - skip
        console.debug('Video source optimization skipped:', error.message);
      }
    });
  }

  // ==========================================
  // Touch-Friendly Enhancements
  // ==========================================
  
  /**
   * Add touch feedback to interactive elements
   */
  function enhanceTouchFeedback() {
    if (!features.touch) return;
    
    const interactiveElements = document.querySelectorAll(
      'button, .control-btn, .hotspot, .nav-btn, [role="button"]'
    );
    
    interactiveElements.forEach(element => {
      // Add haptic feedback support if available
      element.addEventListener('touchstart', () => {
        if (navigator.vibrate) {
          navigator.vibrate(10); // Very brief haptic feedback
        }
        element.classList.add('touch-active');
      }, { passive: true });
      
      element.addEventListener('touchend', () => {
        element.classList.remove('touch-active');
      }, { passive: true });
    });
  }

  // ==========================================
  // Viewport Height Fix
  // ==========================================
  
  /**
   * Fix viewport height issues on mobile browsers
   */
  function fixViewportHeight() {
    if (!features.touch) return;
    
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    
    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setViewportHeight, 100);
    }, { passive: true });
  }

  // ==========================================
  // Magnifier Cursor Fix
  // ==========================================
  
  /**
   * Ensure magnifier cursor is always visible and properly scoped
   */
  function fixMagnifierCursor() {
    const lidarBoard = document.getElementById('lidar-board');
    if (!lidarBoard) return;
    
    // Ensure cursor is visible in all states
    const style = document.createElement('style');
    style.textContent = `
      /* Ensure magnifier is always visible when active */
      #lidar-board:not(.highlighting):not(.zooming):not(.zoom-reset) {
        cursor: none !important;
      }
      
      #lidar-board .magnifier-cursor {
        display: block !important;
        visibility: visible !important;
      }
      
      /* Hide magnifier only when highlighting or zoomed */
      #lidar-board.highlighting .magnifier-cursor,
      #lidar-board.zooming .magnifier-cursor,
      #lidar-board.zoom-reset .magnifier-cursor {
        display: none !important;
      }
      
      /* Ensure hotspots don't interfere with magnifier */
      #lidar-board:not(.highlighting) .hotspot {
        pointer-events: none;
      }
      
      #lidar-board.highlighting .hotspot {
        pointer-events: auto;
      }
      
      /* Fix cursor visibility in zoom view */
      #lidar-board.zooming,
      #lidar-board.zoom-reset {
        cursor: default !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================
  // Video Description Container Fix
  // ==========================================
  
  /**
   * Fix video description panel to be in separate container
   */
  function fixVideoDescriptionContainers() {
    const videoOverlays = document.querySelectorAll('.video-overlay');
    
    videoOverlays.forEach(overlay => {
      // Check if description panel exists and needs fixing
      const descPanel = overlay.querySelector('.video-description-panel');
      if (!descPanel) return;
      
      // Create wrapper container if not exists
      let wrapper = overlay.querySelector('.video-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';
        wrapper.style.cssText = `
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        `;
        
        // Move overlay content into wrapper
        const content = overlay.querySelector('.overlay-content');
        if (content) {
          wrapper.appendChild(content);
        }
        
        overlay.appendChild(wrapper);
      }
      
      // Move description panel outside of video container
      if (descPanel.parentElement !== wrapper) {
        wrapper.appendChild(descPanel);
        
        // Fix description panel positioning
        descPanel.style.cssText = `
          position: relative;
          margin-top: 20px;
          bottom: auto;
          left: 0;
          right: 0;
        `;
      }
    });
    
    // Add styles for proper layout
    const style = document.createElement('style');
    style.textContent = `
      .video-wrapper {
        display: flex;
        flex-direction: column;
        gap: 20px;
        height: auto !important;
        padding-bottom: 20px;
      }
      
      .video-wrapper .overlay-content {
        flex-shrink: 0;
        height: 450px;
        border-radius: 20px;
        overflow: hidden;
      }
      
      .video-wrapper .video-description-panel {
        position: relative !important;
        bottom: auto !important;
        margin: 0 !important;
        transform: none !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================
  // Scroll Prevention Helper
  // ==========================================
  
  /**
   * Prevent scroll when modal/overlay is open
   */
  function manageScrollLock() {
    const triggers = ['.video-overlay.active', '.onboarding-overlay.visible'];
    
    const checkScrollLock = () => {
      const shouldLock = triggers.some(selector => 
        document.querySelector(selector)
      );
      
      if (shouldLock) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    };
    
    // Monitor for overlay changes
    const observer = new MutationObserver(checkScrollLock);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true
    });
    
    checkScrollLock();
  }

  // ============================================
  // MOBILE FIX: Dynamic overlay management
  // ============================================
  
  function mobileOverlayFixes() {
    // Only apply fixes on mobile
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    
    // Fix 1: Ensure overlay covers everything during load
    const videoOverlay = document.getElementById('videoOverlay');
    const loadingElement = document.getElementById('loading');
    
    if (videoOverlay && videoOverlay.classList.contains('active')) {
      // Lock body scroll while overlay is active
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      // Ensure overlay has highest z-index
      videoOverlay.style.zIndex = '999999';
      
      // Hide any project brief or onboarding panels
      const projectBrief = document.querySelector('.project-brief, .onboarding-panel');
      if (projectBrief) {
        projectBrief.style.visibility = 'hidden';
        projectBrief.style.pointerEvents = 'none';
      }
    }
    
    // Monitor overlay state changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target.id === 'videoOverlay' || target.classList.contains('video-overlay')) {
            if (target.classList.contains('active')) {
              // Lock scroll
              document.body.style.overflow = 'hidden';
              document.body.style.position = 'fixed';
              document.body.style.width = '100%';
              
              // Hide background content
              const projectBrief = document.querySelector('.project-brief, .onboarding-panel');
              if (projectBrief) {
                projectBrief.style.visibility = 'hidden';
                projectBrief.style.pointerEvents = 'none';
              }
            } else {
              // Unlock scroll
              document.body.style.overflow = '';
              document.body.style.position = '';
              document.body.style.width = '';
              
              // Restore visibility of hidden elements
              const projectBrief = document.querySelector('.project-brief, .onboarding-panel');
              if (projectBrief) {
                projectBrief.style.visibility = '';
                projectBrief.style.pointerEvents = '';
              }
            }
          }
        }
      });
    });
    
    // Observe overlay elements
    if (videoOverlay) {
      observer.observe(videoOverlay, { attributes: true });
    }
    
    const overlays = document.querySelectorAll('.video-overlay');
    overlays.forEach(overlay => {
      observer.observe(overlay, { attributes: true });
    });
  }
  
  // Fix 2: Ensure logo centering on scroll lock
  function mobileLogoCenteringFix() {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    
    window.addEventListener('scroll', function() {
      const logoSection = document.querySelector('.logo-section');
      if (logoSection && logoSection.classList.contains('locked')) {
        // Force recenter on mobile
        logoSection.style.top = '0';
        logoSection.style.bottom = '0';
        logoSection.style.display = 'flex';
        logoSection.style.alignItems = 'center';
        logoSection.style.justifyContent = 'center';
      }
    });
  }
  
  // Fix 3: Video popup responsive handling
  function mobileVideoPopupFix() {
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    
    document.addEventListener('click', function(e) {
      // Check if a hotspot was clicked
      if (e.target.closest('.hotspot')) {
        setTimeout(function() {
          const activeOverlay = document.querySelector('.video-overlay.active');
          if (activeOverlay) {
            // Ensure proper mobile layout
            const video = activeOverlay.querySelector('.overlay-video, .intro-video');
            const description = activeOverlay.querySelector('.video-description-panel');
            
            if (video) {
              // Force contain fit for mobile
              video.style.objectFit = 'contain';
              video.style.width = '100%';
              video.style.height = '100%';
            }
            
            if (description) {
              // Ensure description doesn't overlap
              description.style.position = 'relative';
              description.style.marginTop = '10px';
            }
            
            // Lock body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
          }
        }, 100);
      }
    });
    
    // Cleanup on close
    document.addEventListener('click', function(e) {
      if (e.target.closest('.overlay-close')) {
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    });
  }
  
  // Handle orientation changes
  function handleOrientationChange() {
    window.addEventListener('orientationchange', function() {
      if (window.matchMedia('(max-width: 768px)').matches) {
        // Recalculate heights after orientation change
        setTimeout(function() {
          const activeOverlay = document.querySelector('.video-overlay.active');
          if (activeOverlay) {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
          }
        }, 100);
      }
    });
  }

  // ==========================================
  // Initialization
  // ==========================================
  
  function init() {
    // Wait for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Apply optimizations
    optimizePixelRatio();
    initLazyLoading();
    optimizeVideoSources();
    enhanceTouchFeedback();
    fixViewportHeight();
    fixMagnifierCursor();
    fixVideoDescriptionContainers();
    manageScrollLock();
    
    // Apply mobile-specific fixes
    mobileOverlayFixes();
    mobileLogoCenteringFix();
    mobileVideoPopupFix();
    handleOrientationChange();
    
    // Re-apply on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        optimizePixelRatio();
        optimizeVideoSources();
        fixViewportHeight();
      }, 100);
    });
    
    // Monitor for dynamic content
    const contentObserver = new MutationObserver(() => {
      initLazyLoading();
      enhanceTouchFeedback();
      fixVideoDescriptionContainers();
    });
    
    contentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('Responsive additions loaded:', features);
  }
  
  // Start initialization
  init();
  
  // Export for debugging (development only)
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    window.responsiveAdditions = {
      features,
      optimizePixelRatio,
      initLazyLoading,
      optimizeVideoSources
    };
  }
})();
