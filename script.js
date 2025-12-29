// Verhindere automatisches Scrollen zu Ankern beim Neuladen der Seite
(function() {
  // Wenn die Seite mit einem Hash geladen wird, verhindere das automatische Scrollen
  if (window.location.hash) {
    // Setze scroll-behavior temporär auf auto, um automatisches Scrollen zu verhindern
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    
    // Entferne den Hash aus der URL ohne zu scrollen
    const hash = window.location.hash;
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
    
    // Scroll sofort nach oben, falls der Browser bereits gescrollt hat
    window.scrollTo(0, 0);
    
    // Warte bis die Seite vollständig geladen ist, dann setze scroll-behavior zurück
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
          html.style.scrollBehavior = originalScrollBehavior || '';
        }, 100);
      }, { once: true });
    } else {
      setTimeout(function() {
        html.style.scrollBehavior = originalScrollBehavior || '';
      }, 100);
    }
  }
})();

// Mobile Menu Toggle & Popup-Funktionalität
document.addEventListener('DOMContentLoaded', function() {
  // ===== Mobile Menu Toggle =====
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  const navLinks = document.querySelectorAll('nav a');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      const isActive = nav.classList.toggle('active');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isActive);
      
      // Verhindere Scrollen wenn Menü offen
      if (isActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Schließe Menü beim Klick auf einen Link
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    
    // Schließe Menü beim Klick außerhalb
    document.addEventListener('click', function(e) {
      if (nav.classList.contains('active') && 
          !nav.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    
    // Schließe Menü mit Escape-Taste
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
  
  // ===== Popup-Funktionalität für Ads-Services =====
  const adsCards = document.querySelectorAll('.ads-card[data-popup]');
  const popupOverlays = document.querySelectorAll('.popup-overlay');
  
  // Öffne Popup beim Klick auf Karte
  adsCards.forEach(card => {
    card.addEventListener('click', function() {
      const popupId = this.getAttribute('data-popup');
      const popup = document.getElementById(`popup-${popupId}`);
      
      if (popup) {
        popup.classList.add('active');
        document.body.classList.add('popup-open');
        // Verhindere Scrollen im Hintergrund
        document.body.style.overflow = 'hidden';
      }
    }, { passive: true });
  });
  
  // Schließe Popup beim Klick auf Schließen-Button
  popupOverlays.forEach(overlay => {
    const closeBtn = overlay.querySelector('.popup-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closePopup(overlay);
      });
    }
    
    // Schließe Popup beim Klick auf Overlay (außerhalb des Contents)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closePopup(overlay);
      }
    });
  });
  
  // Schließe Popup mit Escape-Taste
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const activePopup = document.querySelector('.popup-overlay.active');
      if (activePopup) {
        closePopup(activePopup);
      }
    }
  });
  
  function closePopup(popup) {
    popup.classList.remove('active');
    document.body.classList.remove('popup-open');
    document.body.style.overflow = '';
  }
  
  // ===== Smooth Scroll für Anchor-Links (Mobile optimiert) =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Logo-Link zur Homepage - scroll nach oben
      if (href === '#' || href === '#!') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        // Entferne Hash aus URL falls vorhanden
        if (window.location.hash) {
          window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }
        return;
      }
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        
        // Update URL ohne zu scrollen
        window.history.pushState(null, null, href);
        
        // Smooth Scroll zum Ziel
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
