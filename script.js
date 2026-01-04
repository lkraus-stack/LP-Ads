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
  
  // ===== Hotels Case Study Slider - Infinite Loop mit Drag =====
  // Hotels Case Study Grid - Keine Slider-Funktionalität mehr benötigt
  
  // ===== Popup-Funktionalität für Ads-Services, Outcome-Cards und Portfolio-Items =====
  const adsCards = document.querySelectorAll('.ads-card[data-popup]');
  const outcomeCards = document.querySelectorAll('.outcome-card[data-popup]');
  const processSteps = document.querySelectorAll('.process-step[data-popup]');
  const portfolioItems = document.querySelectorAll('.portfolio-item[data-popup]');
  const hotelCaseCards = document.querySelectorAll('.hotel-case-card[data-popup]');
  const popupOverlays = document.querySelectorAll('.popup-overlay');
  
  // Prozess Popup Variablen - werden später initialisiert
  let currentProcessSlide = 0;
  let processPopupFunctions = {
    updateSlides: null,
    resetPopup: null
  };
  
  // Funktion zum Öffnen eines Popups
  function openPopup(card) {
    const popupId = card.getAttribute('data-popup');
    const popup = document.getElementById(`popup-${popupId}`);
    
    if (popup) {
      popup.classList.add('active');
      document.body.classList.add('popup-open');
      // Verhindere Scrollen im Hintergrund
      document.body.style.overflow = 'hidden';
      
      // Wenn es das Prozess-Popup ist, öffne den entsprechenden Slide
      if (popupId === 'prozess') {
        const slideIndex = card.getAttribute('data-slide');
        if (slideIndex !== null && processPopupFunctions.updateSlides) {
          const slideNum = parseInt(slideIndex);
          currentProcessSlide = slideNum;
          processPopupFunctions.updateSlides(slideNum > 0 ? 'right' : 'left');
        } else if (processPopupFunctions.resetPopup) {
          processPopupFunctions.resetPopup(popup);
        }
      }
    }
  }
  
  // Öffne Popup beim Klick auf Ads-Karte
  adsCards.forEach(card => {
    card.addEventListener('click', function() {
      openPopup(this);
    }, { passive: true });
  });
  
  // Öffne Popup beim Klick auf Outcome-Karte
  outcomeCards.forEach(card => {
    card.addEventListener('click', function() {
      openPopup(this);
    }, { passive: true });
  });
  
  // Öffne Popup beim Klick auf Process-Step
  processSteps.forEach(step => {
    step.addEventListener('click', function() {
      openPopup(this);
    }, { passive: true });
  });
  
  // Öffne Popup beim Klick auf Portfolio-Item
  portfolioItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // Verhindere, dass die Animation pausiert wird
      e.stopPropagation();
      openPopup(this);
    });
  });
  
  // Hotel Case Cards Popup-Funktionalität
  hotelCaseCards.forEach(card => {
    card.addEventListener('click', function(e) {
      e.stopPropagation();
      openPopup(this);
    });
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
    
    // Wenn es das Prozess-Popup ist, reset auf ersten Slide
    if (popup.id === 'popup-prozess' && processPopupFunctions.resetPopup) {
      processPopupFunctions.resetPopup(popup);
    }
  }
  
  // ===== Prozess Popup Multi-Slide Funktionalität =====
  const processPopup = document.getElementById('popup-prozess');
  const totalProcessSlides = 3;
  let touchStartX = 0;
  let touchEndX = 0;
  
  processPopupFunctions.resetPopup = function(popup) {
    currentProcessSlide = 0;
    if (processPopupFunctions.updateSlides) {
      processPopupFunctions.updateSlides('right');
    }
  };
  
  processPopupFunctions.updateSlides = function(direction = 'right') {
    if (!processPopup) return;
    
    const slides = processPopup.querySelectorAll('.process-slide');
    const indicators = processPopup.querySelectorAll('.process-indicator');
    const prevBtn = processPopup.querySelector('.process-prev-btn');
    const nextBtn = processPopup.querySelector('.process-next-btn');
    
    slides.forEach((slide, index) => {
      // Entferne alle Animation-Klassen
      slide.classList.remove('slide-in-right', 'slide-in-left', 'slide-out-left', 'slide-out-right');
      
      if (index === currentProcessSlide) {
        // Aktiviere aktuellen Slide mit Animation
        slide.classList.add('active');
        if (direction === 'right') {
          slide.classList.add('slide-in-right');
        } else {
          slide.classList.add('slide-in-left');
        }
      } else {
        // Deaktiviere andere Slides
        slide.classList.remove('active');
        if (index < currentProcessSlide) {
          slide.classList.add('slide-out-left');
        } else if (index > currentProcessSlide) {
          slide.classList.add('slide-out-right');
        }
      }
    });
    
    indicators.forEach((indicator, index) => {
      if (index === currentProcessSlide) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
    
    // Update Navigation Buttons (nur noch für nextBtn, prevBtn wurde entfernt)
    if (nextBtn) {
      nextBtn.disabled = currentProcessSlide === totalProcessSlides - 1;
      // Verstecke Next-Button beim letzten Slide
      if (currentProcessSlide === totalProcessSlides - 1) {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'flex';
      }
    }
    
    // Update Floating Next Button
    const floatingNextBtn = processPopup.querySelector('.process-floating-next-btn');
    if (floatingNextBtn) {
      if (currentProcessSlide === totalProcessSlides - 1) {
        floatingNextBtn.style.display = 'none';
      } else {
        floatingNextBtn.style.display = 'flex';
      }
    }
    
    // Update Floating Prev Button
    const floatingPrevBtn = processPopup.querySelector('.process-floating-prev-btn');
    if (floatingPrevBtn) {
      if (currentProcessSlide === 0) {
        floatingPrevBtn.style.display = 'none';
      } else {
        floatingPrevBtn.disabled = false;
        floatingPrevBtn.style.display = 'flex';
      }
    }
  }
  
  function goToProcessSlide(index) {
    if (index < 0 || index >= totalProcessSlides) return;
    const direction = index > currentProcessSlide ? 'right' : 'left';
    currentProcessSlide = index;
    if (processPopupFunctions.updateSlides) {
      processPopupFunctions.updateSlides(direction);
    }
  }
  
  function nextProcessSlide() {
    if (currentProcessSlide < totalProcessSlides - 1) {
      goToProcessSlide(currentProcessSlide + 1);
    }
  }
  
  function prevProcessSlide() {
    if (currentProcessSlide > 0) {
      goToProcessSlide(currentProcessSlide - 1);
    }
  }
  
  // Event Listeners für Prozess Popup Navigation
  if (processPopup) {
    const nextBtn = processPopup.querySelector('.process-next-btn');
    const floatingNextBtn = processPopup.querySelector('.process-floating-next-btn');
    const prevBtn = processPopup.querySelector('.process-prev-btn');
    const indicators = processPopup.querySelectorAll('.process-indicator');
    const anfrageBtn = processPopup.querySelector('.process-anfrage-btn');
    
    if (nextBtn) {
      nextBtn.addEventListener('click', nextProcessSlide);
    }
    
    if (floatingNextBtn) {
      floatingNextBtn.addEventListener('click', nextProcessSlide);
    }
    
    const floatingPrevBtn = processPopup.querySelector('.process-floating-prev-btn');
    if (floatingPrevBtn) {
      floatingPrevBtn.addEventListener('click', prevProcessSlide);
    }
    
    // Indicator Klicks
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        goToProcessSlide(index);
      });
    });
    
    // Anfrage Button
    if (anfrageBtn) {
      anfrageBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closePopup(processPopup);
        // Öffne Formular-Modal
        if (window.openFormModal) {
          setTimeout(() => {
            window.openFormModal();
          }, 300);
        }
      });
    }
    
    
    
    // Swipe-Funktionalität
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let translateX = 0;
    
    const slidesContainer = processPopup.querySelector('.process-slides-container');
    
    if (slidesContainer) {
      // Touch Events
      slidesContainer.addEventListener('touchstart', function(e) {
        isDragging = true;
        startX = e.touches[0].clientX;
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      
      slidesContainer.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        touchEndX = e.touches[0].clientX;
        translateX = currentX - startX;
      }, { passive: true });
      
      slidesContainer.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const swipeThreshold = 50;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0) {
            // Swipe nach rechts = vorheriger Slide
            prevProcessSlide();
          } else {
            // Swipe nach links = nächster Slide
            nextProcessSlide();
          }
        }
        
        touchStartX = 0;
        touchEndX = 0;
      }, { passive: true });
      
      // Mouse Events für Desktop (optional)
      let mouseDown = false;
      let mouseStartX = 0;
      
      slidesContainer.addEventListener('mousedown', function(e) {
        mouseDown = true;
        mouseStartX = e.clientX;
        startX = e.clientX;
      });
      
      slidesContainer.addEventListener('mousemove', function(e) {
        if (!mouseDown) return;
        currentX = e.clientX;
        translateX = currentX - startX;
      });
      
      slidesContainer.addEventListener('mouseup', function(e) {
        if (!mouseDown) return;
        mouseDown = false;
        
        const swipeThreshold = 50;
        const diff = e.clientX - mouseStartX;
        
        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0) {
            prevProcessSlide();
          } else {
            nextProcessSlide();
          }
        }
      });
      
      slidesContainer.addEventListener('mouseleave', function() {
        mouseDown = false;
      });
    }
    
    // Keyboard Navigation
    document.addEventListener('keydown', function(e) {
      if (!processPopup.classList.contains('active')) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevProcessSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextProcessSlide();
      }
    });
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
  
  // ===== Multi-Step Formular Funktionalität =====
  const formModal = document.getElementById('formModal');
  const formModalClose = document.querySelector('.form-modal-close');
  const contactForm = document.getElementById('contactForm');
  const formSteps = document.querySelectorAll('.form-step');
  const formProgressBar = document.getElementById('formProgressBar');
  const formStepCounter = document.getElementById('formStepCounter');
  let currentStep = 1;
  const totalSteps = 6;
  const formData = {
    need: null,
    budget: null,
    timeline: null,
    message: '',
    fullname: '',
    company: '',
    role: '',
    phone: '',
    email: '',
    bookedAppointment: false
  };
  
  // Öffne Formular-Modal
  function openFormModal() {
    if (formModal) {
      formModal.classList.add('active');
      document.body.classList.add('form-modal-open');
      currentStep = 1;
      updateFormProgress();
      resetForm();
    }
  }
  
  // Schließe Formular-Modal
  function closeFormModal() {
    if (formModal) {
      formModal.classList.remove('active');
      document.body.classList.remove('form-modal-open');
      setTimeout(() => {
        resetForm();
      }, 350);
    }
  }
  
  // Reset Formular
  function resetForm() {
    currentStep = 1;
    formData.need = null;
    formData.budget = null;
    formData.timeline = null;
    formData.message = '';
    formData.fullname = '';
    formData.company = '';
    formData.role = '';
    formData.phone = '';
    formData.email = '';
    formData.bookedAppointment = false;
    
    // Reset UI
    document.querySelectorAll('.form-option-btn, .form-budget-btn, .form-timeline-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    document.querySelectorAll('.form-field input, .form-field textarea').forEach(input => {
      input.value = '';
    });
    
    // Reset Datenschutz-Checkbox
    const privacyCheckbox = document.getElementById('privacy-checkbox');
    if (privacyCheckbox) {
      privacyCheckbox.checked = false;
    }
    
    // Verstecke Buchungsbestätigung
    const bookingConfirmation = document.getElementById('formBookingConfirmation');
    if (bookingConfirmation) {
      bookingConfirmation.style.display = 'none';
    }
    
    updateFormSteps();
    updateFormProgress();
  }
  
  // Update Formular-Schritte
  function updateFormSteps() {
    formSteps.forEach((step, index) => {
      const stepNumber = parseInt(step.getAttribute('data-step'));
      if (stepNumber === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }
  
  // Initialisiere Formular
  if (formSteps.length > 0) {
    updateFormSteps();
    updateFormProgress();
  }
  
  // Update Progress Bar
  function updateFormProgress() {
    if (formProgressBar) {
      const progress = currentStep <= totalSteps ? (currentStep / totalSteps) * 100 : 100;
      formProgressBar.style.width = `${progress}%`;
    }
    if (formStepCounter) {
      // Beim Success-Step (6) zeige totalSteps/totalSteps
      const displayStep = currentStep <= totalSteps ? currentStep : totalSteps;
      formStepCounter.textContent = `${displayStep}`;
    }
  }
  
  // Email Validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Nächster Schritt
  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep++;
      updateFormSteps();
      updateFormProgress();
      
      // Scroll to top of form
      const formModalContent = document.querySelector('.form-modal-content');
      if (formModalContent) {
        formModalContent.scrollTop = 0;
      }
    }
  }
  
  // Vorheriger Schritt
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      updateFormSteps();
      updateFormProgress();
      
      // Scroll to top of form
      const formModalContent = document.querySelector('.form-modal-content');
      if (formModalContent) {
        formModalContent.scrollTop = 0;
      }
    }
  }
  
  // Formular absenden
  function submitForm(e) {
    if (e) e.preventDefault();
    
    // Sammle alle Daten
    const messageInput = document.getElementById('message');
    const fullnameInput = document.getElementById('fullname');
    const companyInput = document.getElementById('company');
    const roleInput = document.getElementById('role');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    
    if (messageInput) formData.message = messageInput.value.trim();
    if (fullnameInput) formData.fullname = fullnameInput.value.trim();
    if (companyInput) formData.company = companyInput.value.trim();
    if (roleInput) formData.role = roleInput.value.trim();
    if (phoneInput) formData.phone = phoneInput.value.trim();
    if (emailInput) formData.email = emailInput.value.trim();
    
    // Zeige Success Step
    currentStep = 7;
    updateFormSteps();
    if (formProgressBar) {
      formProgressBar.style.width = '100%';
    }
    
    // Zeige Buchungsbestätigung wenn Termin gebucht wurde
    const bookingConfirmation = document.getElementById('formBookingConfirmation');
    if (bookingConfirmation) {
      if (formData.bookedAppointment) {
        bookingConfirmation.style.display = 'block';
      } else {
        bookingConfirmation.style.display = 'none';
      }
    }
    
    // Hier könnten Sie die Daten an einen Server senden
    console.log('Formular-Daten:', formData);
    
    // Beispiel: Daten an Server senden
    // fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Success:', data);
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });
  }
  
  // Event Listeners für Formular-Buttons (wird von außen aufgerufen)
  if (contactForm) {
    // Option Buttons (Step 1) - Automatisch weiter nach Auswahl
    document.querySelectorAll('.form-option-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.form-option-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        formData.need = this.getAttribute('data-value');
        // Automatisch zum nächsten Schritt nach kurzer Verzögerung
        setTimeout(() => {
          nextStep();
        }, 300);
      });
    });
    
    // Budget Buttons (Step 2) - Automatisch weiter nach Auswahl
    document.querySelectorAll('.form-budget-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.form-budget-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        formData.budget = this.getAttribute('data-value');
        // Automatisch zum nächsten Schritt nach kurzer Verzögerung
        setTimeout(() => {
          nextStep();
        }, 300);
      });
    });
    
    // Timeline Buttons (Step 3) - Automatisch weiter nach Auswahl
    document.querySelectorAll('.form-timeline-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.form-timeline-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        formData.timeline = this.getAttribute('data-value');
        // Automatisch zum nächsten Schritt nach kurzer Verzögerung
        setTimeout(() => {
          nextStep();
        }, 300);
      });
    });
    
    // Input Fields (Step 4) - Real-time Validation
    document.querySelectorAll('.form-field input').forEach(input => {
      input.addEventListener('blur', function() {
        if (this.type === 'email' && this.value.trim() !== '') {
          if (!isValidEmail(this.value.trim())) {
            this.style.borderColor = 'rgba(255, 100, 100, 0.5)';
          } else {
            this.style.borderColor = 'rgba(100, 255, 100, 0.3)';
          }
        }
      });
    });
    
    document.querySelectorAll('.form-prev-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        prevStep();
      });
    });
    
    // Message Next Button (Step 4 -> Step 5)
    const messageNextBtn = contactForm.querySelector('.form-message-next-btn');
    if (messageNextBtn) {
      messageNextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const message = document.getElementById('message').value.trim();
        
        if (!message || message.length < 20) {
          alert('Bitte beschreiben Sie Ihr Vorhaben in mindestens 20 Zeichen.');
          return;
        }
        
        // Speichere Nachricht
        formData.message = message;
        
        // Weiter zu Step 5 (Kontaktdaten)
        nextStep();
      });
    }
    
    // Next Step Button (Step 5 -> Step 6)
    const nextStepBtn = contactForm.querySelector('.form-next-step-btn');
    if (nextStepBtn) {
      nextStepBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Prüfe Datenschutz-Checkbox
        const privacyCheckbox = document.getElementById('privacy-checkbox');
        if (!privacyCheckbox || !privacyCheckbox.checked) {
          alert('Bitte akzeptieren Sie die Datenschutzerklärung, um fortzufahren.');
          return;
        }
        
        // Validiere alle Pflichtfelder
        const fullname = document.getElementById('fullname').value.trim();
        const company = document.getElementById('company').value.trim();
        const role = document.getElementById('role').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!fullname || !company || !role || !phone || !email) {
          alert('Bitte füllen Sie alle Pflichtfelder aus.');
          return;
        }
        
        if (!isValidEmail(email)) {
          alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
          return;
        }
        
        // Speichere Daten
        formData.fullname = fullname;
        formData.company = company;
        formData.role = role;
        formData.phone = phone;
        formData.email = email;
        
        // Weiter zu Step 6 (Terminbuchung)
        nextStep();
      });
    }
    
    
    // Close Button
    const closeBtn = document.querySelector('.form-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeFormModal);
    }
  }
  
  // ===== Google Calendar Modal Funktionalität =====
  const calendarModal = document.getElementById('calendarModal');
  const openCalendarBtn = document.getElementById('openCalendarBtn');
  const calendarModalClose = calendarModal ? calendarModal.querySelector('.calendar-modal-close') : null;
  
  function openCalendarModal() {
    if (calendarModal) {
      calendarModal.classList.add('active');
      document.body.classList.add('calendar-modal-open');
    }
  }
  
  function closeCalendarModal() {
    if (calendarModal) {
      calendarModal.classList.remove('active');
      document.body.classList.remove('calendar-modal-open');
      
      // Markiere als gebucht und gehe zum Success Step
      formData.bookedAppointment = true;
      submitForm();
    }
  }
  
  if (openCalendarBtn) {
    openCalendarBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openCalendarModal();
    });
  }
  
  if (calendarModalClose) {
    calendarModalClose.addEventListener('click', closeCalendarModal);
  }
  
  if (calendarModal) {
    calendarModal.addEventListener('click', function(e) {
      if (e.target === calendarModal) {
        closeCalendarModal();
      }
    });
    
    // Schließe mit Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && calendarModal.classList.contains('active')) {
        closeCalendarModal();
      }
    });
  }
  
  // Close Modal Events
  if (formModalClose) {
    formModalClose.addEventListener('click', closeFormModal);
  }
  
  if (formModal) {
    formModal.addEventListener('click', function(e) {
      if (e.target === formModal) {
        closeFormModal();
      }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && formModal.classList.contains('active')) {
        closeFormModal();
      }
    });
  }
  
  // Export openFormModal function for use with buttons
  window.openFormModal = openFormModal;
  
  // ===== Footer Kontakt-Link =====
  const footerContactLink = document.querySelector('.footer-contact-trigger');
  if (footerContactLink) {
    footerContactLink.addEventListener('click', function(e) {
      e.preventDefault();
      openFormModal();
    });
  }
  
  // ===== Formular-Buttons Event Listeners =====
  // Alle Buttons, die das Formular öffnen sollen
  const formTriggerButtons = document.querySelectorAll(
    '.btn-primary, .btn-gradient, .btn-outline, .pricing-btn'
  );
  
  formTriggerButtons.forEach(button => {
    // Überprüfe, ob der Button nicht bereits andere Funktionalität hat
    const buttonText = button.textContent.trim().toLowerCase();
    const innerText = button.innerText.trim().toLowerCase();
    
    const isFormButton = 
      buttonText.includes('kostenloses erstgespräch') ||
      buttonText.includes('jetzt starten') ||
      buttonText.includes('jetzt anfragen') ||
      buttonText.includes('kostenloser audit') ||
      buttonText.includes('prozess starten') ||
      buttonText.includes('ähnliche ergebnisse') ||
      innerText.includes('kostenloses erstgespräch') ||
      innerText.includes('jetzt starten') ||
      innerText.includes('jetzt anfragen') ||
      innerText.includes('kostenloser audit') ||
      innerText.includes('prozess starten') ||
      innerText.includes('ähnliche ergebnisse');
    
    if (isFormButton && !button.hasAttribute('data-no-form')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        // Schließe alle offenen Popups bevor das Formular geöffnet wird
        document.querySelectorAll('.popup-overlay.active').forEach(popup => {
          popup.classList.remove('active');
        });
        document.body.classList.remove('popup-open');
        document.body.style.overflow = '';
        openFormModal();
      });
    }
  });
});

// ===== Multichannel Infographic Hub Pulse Interaction =====
document.addEventListener('DOMContentLoaded', function() {
  const centralHub = document.getElementById('centralHub');
  const platformBadges = document.querySelectorAll('.platform-badge');
  const resultCards = document.querySelectorAll('.result-card');
  
  if (!centralHub) return;
  
  // Funktion um Hub pulsieren zu lassen
  function pulseHub() {
    centralHub.classList.add('pulse-active');
    setTimeout(() => {
      centralHub.classList.remove('pulse-active');
    }, 500);
  }
  
  // Hover auf Plattform-Badges
  platformBadges.forEach(badge => {
    badge.addEventListener('mouseenter', pulseHub);
  });
  
  // Hover auf Result-Cards
  resultCards.forEach(card => {
    card.addEventListener('mouseenter', pulseHub);
  });
});

//// ===== Portfolio Slider mit interaktiver Scroll-Funktionalität =====
//// Deaktiviert - Portfolio verwendet jetzt Grid-Layout
///*
//document.addEventListener('DOMContentLoaded', function() {
//  const portfolioTrack = document.getElementById('portfolioTrack');
//  const portfolioWrapper = document.getElementById('portfolioSliderWrapper');
//  
//  if (!portfolioTrack || !portfolioWrapper) return;
//  
//  let isDragging = false;
//  let startX = 0;
//  let scrollLeft = 0;
//  let resumeTimeout = null;
//  
//  // Berechne die Breite eines Sets (2 Items)
//  const getSetWidth = () => {
//    const items = portfolioTrack.querySelectorAll('.portfolio-item');
//    if (items.length < 2) return 0;
//    const firstItem = items[0];
//    const secondItem = items[1];
//    const gap = parseInt(window.getComputedStyle(portfolioTrack).gap) || 32;
//    const rect1 = firstItem.getBoundingClientRect();
//    const rect2 = secondItem.getBoundingClientRect();
//    return rect2.right - rect1.left + gap;
//  };
//  
//  // Starte automatische Animation
//  const startAutoScroll = () => {
//    portfolioTrack.classList.add('auto-scroll');
//  };
//  
//  // Stoppe automatische Animation
//  const stopAutoScroll = () => {
//    portfolioTrack.classList.remove('auto-scroll');
//  };
//  
//  // Resume Auto-Scroll nach Interaktion
//  const resumeAutoScroll = () => {
//    if (resumeTimeout) clearTimeout(resumeTimeout);
//    resumeTimeout = setTimeout(() => {
//      if (!isDragging) {
//        startAutoScroll();
//      }
//    }, 2000);
//  };
//  
//  // Mouse Events
//  const handleMouseDown = (e) => {
//    isDragging = true;
//    stopAutoScroll();
//    portfolioTrack.classList.add('dragging');
//    startX = e.pageX - portfolioTrack.offsetLeft;
//    const currentTransform = window.getComputedStyle(portfolioTrack).transform;
//    if (currentTransform && currentTransform !== 'none') {
//      const matrix = currentTransform.match(/matrix.*\((.+)\)/);
//      if (matrix) {
//        scrollLeft = parseFloat(matrix[1].split(',')[4]) || 0;
//      }
//    }
//    portfolioWrapper.style.cursor = 'grabbing';
//    e.preventDefault();
//  };
//  
//  const handleMouseMove = (e) => {
//    if (!isDragging) return;
//    e.preventDefault();
//    const x = e.pageX - portfolioTrack.offsetLeft;
//    const walk = (x - startX) * 1.2;
//    // Umgekehrte Richtung: Maus nach rechts = Slider nach rechts
//    portfolioTrack.style.transform = `translateX(${scrollLeft + walk}px)`;
//  };
//  
//  const handleMouseUp = () => {
//    if (!isDragging) return;
//    isDragging = false;
//    portfolioTrack.classList.remove('dragging');
//    portfolioWrapper.style.cursor = '';
//    resumeAutoScroll();
//  };
//  
//  const handleMouseLeave = () => {
//    if (isDragging) {
//      handleMouseUp();
//    }
//  };
//  
//  // Touch Events
//  const handleTouchStart = (e) => {
//    isDragging = true;
//    stopAutoScroll();
//    portfolioTrack.classList.add('dragging');
//    startX = e.touches[0].pageX - portfolioTrack.offsetLeft;
//    const currentTransform = window.getComputedStyle(portfolioTrack).transform;
//    if (currentTransform && currentTransform !== 'none') {
//      const matrix = currentTransform.match(/matrix.*\((.+)\)/);
//      if (matrix) {
//        scrollLeft = parseFloat(matrix[1].split(',')[4]) || 0;
//      }
//    }
//  };
//  
//  const handleTouchMove = (e) => {
//    if (!isDragging) return;
//    e.preventDefault();
//    const x = e.touches[0].pageX - portfolioTrack.offsetLeft;
//    const walk = (x - startX) * 1.2;
//    // Umgekehrte Richtung: Finger nach rechts = Slider nach rechts
//    portfolioTrack.style.transform = `translateX(${scrollLeft + walk}px)`;
//  };
//  
//  const handleTouchEnd = () => {
//    if (!isDragging) return;
//    isDragging = false;
//    portfolioTrack.classList.remove('dragging');
//    resumeAutoScroll();
//  };
//  
//  // Wheel Event für horizontales Scrollen
//  const handleWheel = (e) => {
//    stopAutoScroll();
//    const delta = e.deltaY || e.deltaX;
//    const currentTransform = window.getComputedStyle(portfolioTrack).transform;
//    let currentX = 0;
//    if (currentTransform && currentTransform !== 'none') {
//      const matrix = currentTransform.match(/matrix.*\((.+)\)/);
//      if (matrix) {
//        currentX = parseFloat(matrix[1].split(',')[4]) || 0;
//      }
//    }
//    portfolioTrack.style.transition = 'transform 0.1s ease-out';
//    // Scroll nach unten = nach rechts (intuitiv)
//    portfolioTrack.style.transform = `translateX(${currentX + delta * 0.5}px)`;
//    resumeAutoScroll();
//    e.preventDefault();
//  };
//  
//  // Event Listeners
//  portfolioWrapper.addEventListener('mousedown', handleMouseDown);
//  document.addEventListener('mousemove', handleMouseMove);
//  document.addEventListener('mouseup', handleMouseUp);
//  portfolioWrapper.addEventListener('mouseleave', handleMouseLeave);
//  
//  portfolioWrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
//  portfolioWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
//  portfolioWrapper.addEventListener('touchend', handleTouchEnd);
//  
//  portfolioWrapper.addEventListener('wheel', handleWheel, { passive: false });
//  
//  // Hover: Pausiere Auto-Scroll
//  portfolioWrapper.addEventListener('mouseenter', () => {
//    stopAutoScroll();
//  });
//  
//  portfolioWrapper.addEventListener('mouseleave', () => {
//    if (!isDragging) {
//      resumeAutoScroll();
//    }
//  });
//  
//  // Starte automatische Animation beim Laden
//  startAutoScroll();
//});
