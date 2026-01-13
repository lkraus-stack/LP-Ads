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
  const founderItems = document.querySelectorAll('.founder-item[data-popup]');
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
  
  // Founder Items Popup-Funktionalität
  founderItems.forEach(item => {
    item.addEventListener('click', function(e) {
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
  
  // Helper-Funktion: Data-Layer Event pushen
  function pushDataLayerEvent(eventName, eventData) {
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        'event': eventName,
        ...eventData
      });
    }
  }
  
  // Helper: Formular-Schritt Name
  function getFormStepName(step) {
    const stepNames = {
      1: 'Was benötigst du',
      2: 'Marketing Budget',
      3: 'Startzeitpunkt',
      4: 'Vorhaben/Anfrage',
      5: 'Kontaktdaten',
      6: 'Terminbuchung',
      7: 'Success'
    };
    return stepNames[step] || 'Unknown';
  }
  
  // Öffne Formular-Modal
  function openFormModal() {
    if (formModal) {
      formModal.classList.add('active');
      document.body.classList.add('form-modal-open');
      currentStep = 1;
      updateFormProgress();
      resetForm();
      
      // GTM Event: Formular geöffnet
      pushDataLayerEvent('form_modal_opened', {
        'form_id': 'contact_form',
        'form_name': 'Kontaktformular',
        'form_step': 1,
        'form_step_name': 'Was benötigst du'
      });
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
      const previousStep = currentStep;
      currentStep++;
      updateFormSteps();
      updateFormProgress();
      
      // GTM Event: Bei Abschluss der Kontaktdaten als Form Submit tracken,
      // sonst weiterhin Schrittwechsel melden
      if (previousStep === 5) {
        pushDataLayerEvent('form_submit', {
          'form_id': 'contact_form',
          'form_name': 'Kontaktformular',
          'form_step': currentStep,
          'form_step_name': getFormStepName(currentStep),
          'form_need': formData.need || '',
          'form_budget': formData.budget || '',
          'form_timeline': formData.timeline || '',
          'form_has_contact_data': formData.email ? 'yes' : 'no'
        });
      } else {
        pushDataLayerEvent('form_step_changed', {
          'form_id': 'contact_form',
          'form_name': 'Kontaktformular',
          'form_step': currentStep,
          'form_step_name': getFormStepName(currentStep),
          'direction': 'forward'
        });
      }
      
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
      
      // GTM Event: Formular-Schritt zurück
      pushDataLayerEvent('form_step_changed', {
        'form_id': 'contact_form',
        'form_name': 'Kontaktformular',
        'form_step': currentStep,
        'form_step_name': getFormStepName(currentStep),
        'direction': 'backward'
      });
      
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
    
    // Berechne Conversion-Wert basierend auf Budget
    let conversionValue = 0;
    let currency = 'EUR';
    if (formData.budget) {
      conversionValue = parseFloat(formData.budget);
    }
    
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
    
    // GTM Event: Formular erfolgreich abgeschickt mit Conversion-Wert
    pushDataLayerEvent('form_submit_success', {
      'form_id': 'contact_form',
      'form_name': 'Kontaktformular',
      'form_step': 7,
      'form_step_name': 'Success',
      'form_need': formData.need || '',
      'form_budget': formData.budget || '',
      'form_timeline': formData.timeline || '',
      'form_has_message': formData.message ? 'yes' : 'no',
      'form_has_contact_data': formData.email ? 'yes' : 'no',
      'form_appointment_booked': formData.bookedAppointment ? 'yes' : 'no',
      'form_company': formData.company || '',
      'form_role': formData.role || '',
      // Conversion-Wert für Google Ads Value-Based Bidding
      'value': conversionValue,
      'currency': currency,
      'transaction_id': 'form_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    });
    
    // Hier könnten Sie die Daten an einen Server senden
    console.log('Formular-Daten:', formData);
    console.log('Conversion-Wert:', conversionValue, currency);
    
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
        
        // GTM Event: Step 1 - Option ausgewählt
        pushDataLayerEvent('form_step_1_option_selected', {
          'form_id': 'contact_form',
          'form_step': 1,
          'form_step_name': 'Was benötigst du',
          'form_need': formData.need,
          'option_value': formData.need
        });
        
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
        const budgetValue = parseFloat(formData.budget);
        
        // GTM Event: Step 2 - Budget ausgewählt mit Conversion-Wert
        pushDataLayerEvent('form_step_2_budget_selected', {
          'form_id': 'contact_form',
          'form_step': 2,
          'form_step_name': 'Marketing Budget',
          'form_budget': formData.budget,
          'budget_value': formData.budget,
          // Conversion-Wert für Google Ads Value-Based Bidding
          'value': budgetValue,
          'currency': 'EUR'
        });
        
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
        
        // GTM Event: Step 3 - Timeline ausgewählt
        pushDataLayerEvent('form_step_3_timeline_selected', {
          'form_id': 'contact_form',
          'form_step': 3,
          'form_step_name': 'Startzeitpunkt',
          'form_timeline': formData.timeline,
          'timeline_value': formData.timeline
        });
        
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
          
          // GTM Event: Formular-Validierungsfehler
          pushDataLayerEvent('form_validation_error', {
            'form_id': 'contact_form',
            'form_step': 4,
            'form_step_name': 'Vorhaben/Anfrage',
            'error_type': 'message_too_short',
            'error_message': 'Nachricht muss mindestens 20 Zeichen lang sein'
          });
          
          return;
        }
        
        // Speichere Nachricht
        formData.message = message;
        
        // GTM Event: Step 4 - Nachricht eingegeben und weiter
        pushDataLayerEvent('form_step_4_message_completed', {
          'form_id': 'contact_form',
          'form_step': 4,
          'form_step_name': 'Vorhaben/Anfrage',
          'form_has_message': 'yes',
          'message_length': message.length
        });
        
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
          
          // GTM Event: Formular-Validierungsfehler
          pushDataLayerEvent('form_validation_error', {
            'form_id': 'contact_form',
            'form_step': 5,
            'form_step_name': 'Kontaktdaten',
            'error_type': 'privacy_not_accepted',
            'error_message': 'Datenschutzerklärung nicht akzeptiert'
          });
          
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
          
          // GTM Event: Formular-Validierungsfehler
          pushDataLayerEvent('form_validation_error', {
            'form_id': 'contact_form',
            'form_step': 5,
            'form_step_name': 'Kontaktdaten',
            'error_type': 'required_fields_missing',
            'error_message': 'Pflichtfelder nicht ausgefüllt'
          });
          
          return;
        }
        
        if (!isValidEmail(email)) {
          alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
          
          // GTM Event: Formular-Validierungsfehler
          pushDataLayerEvent('form_validation_error', {
            'form_id': 'contact_form',
            'form_step': 5,
            'form_step_name': 'Kontaktdaten',
            'error_type': 'invalid_email',
            'error_message': 'Ungültige E-Mail-Adresse'
          });
          
          return;
        }
        
        // Speichere Daten
        formData.fullname = fullname;
        formData.company = company;
        formData.role = role;
        formData.phone = phone;
        formData.email = email;
        
        // GTM Event: Step 5 - Kontaktdaten ausgefüllt und weiter
        pushDataLayerEvent('form_step_5_contact_data_completed', {
          'form_id': 'contact_form',
          'form_step': 5,
          'form_step_name': 'Kontaktdaten',
          'form_has_contact_data': 'yes',
          'form_company': formData.company,
          'form_role': formData.role,
          'form_privacy_accepted': 'yes'
        });
        
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
      
      // GTM Event: Kalender-Modal geöffnet
      pushDataLayerEvent('calendar_modal_opened', {
        'form_id': 'contact_form',
        'form_step': 6,
        'form_step_name': 'Terminbuchung',
        'calendar_action': 'open'
      });
    }
  }
  
  function closeCalendarModal() {
    if (calendarModal) {
      calendarModal.classList.remove('active');
      document.body.classList.remove('calendar-modal-open');
      
      // Markiere als gebucht und gehe zum Success Step
      formData.bookedAppointment = true;
      
      // GTM Event: Kalender-Modal geschlossen (Termin vermutlich gebucht)
      pushDataLayerEvent('calendar_modal_closed', {
        'form_id': 'contact_form',
        'form_step': 6,
        'form_step_name': 'Terminbuchung',
        'calendar_action': 'close',
        'appointment_booked': 'yes'
      });
      
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

// ===== COOKIE BANNER - DSGVO KONFORM =====
// Globale Variablen
const COOKIE_CONSENT_KEY = 'franco_cookie_consent';
const COOKIE_CONSENT_VERSION = '2.0'; // Version erhöht: Analytics zu Marketing verschoben
const COOKIE_EXPIRY_DAYS = 365;

// Standard Cookie-Einstellungen
const defaultCookieSettings = {
  version: COOKIE_CONSENT_VERSION,
  timestamp: new Date().toISOString(),
  necessary: true,
  analytics: false,
  marketing: false,
  consentGiven: false
};

// Cookie-Funktionen sofort verfügbar machen
(function() {
  // Cookie-Einstellungen laden
  function loadCookieSettings() {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.version === COOKIE_CONSENT_VERSION) {
          return settings;
        }
      }
    } catch (e) {
      console.warn('Cookie-Einstellungen konnten nicht geladen werden:', e);
    }
    return null;
  }
  
  // Cookie-Einstellungen speichern
  function saveCookieSettings(settings) {
    try {
      const settingsToSave = {
        ...settings,
        version: COOKIE_CONSENT_VERSION,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(settingsToSave));
      
      // GTM Event wenn verfügbar
      if (typeof pushDataLayerEvent === 'function') {
        pushDataLayerEvent('cookie_consent_updated', {
          'consent_necessary': settings.necessary,
          'consent_analytics': settings.analytics,
          'consent_marketing': settings.marketing,
          'consent_method': settings.consentMethod || 'unknown',
          'consent_version': COOKIE_CONSENT_VERSION
        });
      }
      
      return true;
    } catch (e) {
      console.error('Cookie-Einstellungen konnten nicht gespeichert werden:', e);
      return false;
    }
  }
  
  // GTM Consent Mode aktualisieren - Global verfügbar machen
  window.updateGTMConsent = function(settings) {
    // Analytics Storage: Direkt basierend auf Analytics-Einstellung
    // Marketing umfasst auch Analytics, daher: analytics ODER marketing
    const analyticsGranted = settings.analytics || settings.marketing;
    
    // Alle Consent-Signale explizit setzen
    const consentParams = {
      'analytics_storage': analyticsGranted ? 'granted' : 'denied',
      'ad_storage': settings.marketing ? 'granted' : 'denied',
      'ad_user_data': settings.marketing ? 'granted' : 'denied',
      'ad_personalization': settings.marketing ? 'granted' : 'denied',
      'functionality_storage': 'granted',
      'security_storage': 'granted'
    };
    
    // Gtag Consent Update - Warte auf gtag, falls noch nicht verfügbar
    const updateConsent = () => {
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', consentParams);
        console.log('GTM Consent aktualisiert:', consentParams);
      } else {
        // Warte kurz und versuche es erneut
        setTimeout(updateConsent, 100);
      }
    };
    updateConsent();
    
    // DataLayer Event für Tracking
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        'event': 'cookie_consent_update',
        'analytics_consent': settings.analytics,
        'marketing_consent': settings.marketing,
        'analytics_storage': analyticsGranted ? 'granted' : 'denied',
        'ad_storage': settings.marketing ? 'granted' : 'denied',
        'ad_user_data': settings.marketing ? 'granted' : 'denied',
        'ad_personalization': settings.marketing ? 'granted' : 'denied',
        'consent_timestamp': new Date().toISOString()
      });
    }
  };
  
  // Alle Cookies akzeptieren - SOFORT verfügbar
  window.acceptAllCookies = function() {
    console.log('acceptAllCookies aufgerufen');
    const settings = {
      ...defaultCookieSettings,
      analytics: true,
      marketing: true,
      consentGiven: true,
      consentMethod: 'accept_all'
    };
    
    if (saveCookieSettings(settings)) {
      updateGTMConsent(settings);
      const cookieBanner = document.getElementById('cookieBanner');
      const cookieSettingsModal = document.getElementById('cookieSettingsModal');
      if (cookieBanner) cookieBanner.classList.remove('show');
      if (cookieSettingsModal) cookieSettingsModal.classList.remove('show');
      document.body.style.overflow = '';
      document.body.style.paddingBottom = '';
      
      if (typeof pushDataLayerEvent === 'function') {
        pushDataLayerEvent('cookie_consent_all_accepted', {
          'consent_method': 'accept_all',
          'consent_version': COOKIE_CONSENT_VERSION
        });
      }
    }
  };
  
  // Alle Cookies ablehnen - SOFORT verfügbar
  window.declineAllCookies = function() {
    console.log('declineAllCookies aufgerufen');
    const settings = {
      ...defaultCookieSettings,
      analytics: false,
      marketing: false,
      consentGiven: true,
      consentMethod: 'decline_all'
    };
    
    if (saveCookieSettings(settings)) {
      updateGTMConsent(settings);
      const cookieBanner = document.getElementById('cookieBanner');
      const cookieSettingsModal = document.getElementById('cookieSettingsModal');
      if (cookieBanner) cookieBanner.classList.remove('show');
      if (cookieSettingsModal) cookieSettingsModal.classList.remove('show');
      document.body.style.overflow = '';
      document.body.style.paddingBottom = '';
      
      if (typeof pushDataLayerEvent === 'function') {
        pushDataLayerEvent('cookie_consent_all_declined', {
          'consent_method': 'decline_all',
          'consent_version': COOKIE_CONSENT_VERSION
        });
      }
    }
  };
  
  // Cookie Settings Modal anzeigen - SOFORT verfügbar
  window.showCookieSettings = function() {
    console.log('showCookieSettings aufgerufen');
    const cookieSettingsModal = document.getElementById('cookieSettingsModal');
    if (cookieSettingsModal) {
      const currentSettings = loadCookieSettings() || defaultCookieSettings;
      const marketingCheckbox = document.getElementById('cookieMarketing');
      // Analytics ist jetzt Teil von Marketing, daher immer gleich Marketing
      if (marketingCheckbox) marketingCheckbox.checked = currentSettings.marketing;
      
      cookieSettingsModal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      if (typeof pushDataLayerEvent === 'function') {
        pushDataLayerEvent('cookie_settings_opened', {
          'settings_version': COOKIE_CONSENT_VERSION
        });
      }
    }
  };
  
  // Individuelle Cookie-Einstellungen speichern - SOFORT verfügbar
  window.saveCookieIndividualSettings = function() {
    console.log('saveCookieIndividualSettings aufgerufen');
    const marketingCheckbox = document.getElementById('cookieMarketing');
    
    if (!marketingCheckbox) {
      console.error('Cookie Marketing Checkbox nicht gefunden');
      return;
    }
    
    // Analytics ist jetzt Teil von Marketing (GA4 und GTM sind unter Marketing)
    const marketingEnabled = marketingCheckbox.checked;
    const settings = {
      ...defaultCookieSettings,
      analytics: marketingEnabled, // Analytics automatisch gleich Marketing
      marketing: marketingEnabled,
      consentGiven: true,
      consentMethod: 'individual_choice'
    };
    
    if (saveCookieSettings(settings)) {
      updateGTMConsent(settings);
      const cookieBanner = document.getElementById('cookieBanner');
      const cookieSettingsModal = document.getElementById('cookieSettingsModal');
      if (cookieBanner) cookieBanner.classList.remove('show');
      if (cookieSettingsModal) cookieSettingsModal.classList.remove('show');
      document.body.style.overflow = '';
      document.body.style.paddingBottom = '';
      
      if (typeof pushDataLayerEvent === 'function') {
        pushDataLayerEvent('cookie_consent_individual_saved', {
          'consent_method': 'individual_choice',
          'consent_analytics': settings.analytics,
          'consent_marketing': settings.marketing,
          'consent_version': COOKIE_CONSENT_VERSION
        });
      }
    }
  };
})();

// Vollständige Initialisierung nach DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieSettingsModal = document.getElementById('cookieSettingsModal');
  
  // Cookie Banner Buttons
  const acceptAllBtn = document.getElementById('cookieAcceptAll');
  const declineAllBtn = document.getElementById('cookieDeclineAll');
  const settingsBtn = document.getElementById('cookieSettings');
  
  // Cookie Modal Buttons
  const modalCloseBtn = document.getElementById('cookieModalClose');
  const saveSettingsBtn = document.getElementById('cookieSaveSettings');
  const acceptAllModalBtn = document.getElementById('cookieAcceptAllModal');
  
  // Cookie Checkboxes (Analytics ist jetzt Teil von Marketing)
  const marketingCheckbox = document.getElementById('cookieMarketing');
  
  // Cookie-Einstellungen laden
  function loadCookieSettings() {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        // Prüfe Version - bei neuer Version Banner erneut anzeigen
        if (settings.version === COOKIE_CONSENT_VERSION) {
          return settings;
        }
      }
    } catch (e) {
      console.warn('Cookie-Einstellungen konnten nicht geladen werden:', e);
    }
    return null;
  }
  
  // Cookie-Einstellungen speichern
  function saveCookieSettings(settings) {
    try {
      const settingsToSave = {
        ...settings,
        version: COOKIE_CONSENT_VERSION,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(settingsToSave));
      
      // GTM Event: Cookie-Einstellungen gespeichert
      pushDataLayerEvent('cookie_consent_updated', {
        'consent_necessary': settings.necessary,
        'consent_analytics': settings.analytics,
        'consent_marketing': settings.marketing,
        'consent_method': settings.consentMethod || 'unknown',
        'consent_version': COOKIE_CONSENT_VERSION
      });
      
      return true;
    } catch (e) {
      console.error('Cookie-Einstellungen konnten nicht gespeichert werden:', e);
      return false;
    }
  }
  
  // GTM Consent Mode aktualisieren - Funktion ist bereits global verfügbar (window.updateGTMConsent)
  // Verwende die globale Funktion
  
  // Cookie Banner anzeigen
  function showCookieBanner() {
    if (cookieBanner) {
      cookieBanner.classList.add('show');
      document.body.style.paddingBottom = cookieBanner.offsetHeight + 'px';
      
      // GTM Event: Cookie Banner angezeigt
      pushDataLayerEvent('cookie_banner_shown', {
        'banner_version': COOKIE_CONSENT_VERSION,
        'page_url': window.location.href
      });
    }
  }
  
  // Cookie Banner verstecken
  function hideCookieBanner() {
    if (cookieBanner) {
      cookieBanner.classList.remove('show');
      document.body.style.paddingBottom = '';
    }
  }
  
  // Verwende die bereits definierte globale Funktion
  // Keine Neudefinition nötig
  
  // Cookie Settings Modal verstecken
  function hideCookieModal() {
    if (cookieSettingsModal) {
      cookieSettingsModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
  
  // Verwende die bereits definierten globalen Funktionen
  // Keine Neudefinition nötig - die globalen Funktionen sind bereits verfügbar
  
  // Individuelle Einstellungen speichern - verwende globale Funktion
  function saveIndividualSettings() {
    if (window.saveCookieIndividualSettings) {
      window.saveCookieIndividualSettings();
    }
  }
  
  // Event Listeners mit Debug-Ausgaben - Zusätzlich zu onclick-Handlern
  if (acceptAllBtn) {
    console.log('Cookie Accept All Button gefunden');
    acceptAllBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Accept All geklickt (Event Listener)');
      if (window.acceptAllCookies) {
        window.acceptAllCookies();
      }
    }, { capture: true });
  } else {
    console.warn('Cookie Accept All Button nicht gefunden');
  }
  
  if (declineAllBtn) {
    console.log('Cookie Decline All Button gefunden');
    declineAllBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Decline All geklickt (Event Listener)');
      if (window.declineAllCookies) {
        window.declineAllCookies();
      }
    }, { capture: true });
  } else {
    console.warn('Cookie Decline All Button nicht gefunden');
  }
  
  if (settingsBtn) {
    console.log('Cookie Settings Button gefunden');
    settingsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Settings geklickt (Event Listener)');
      if (window.showCookieSettings) {
        window.showCookieSettings();
      }
    }, { capture: true });
  } else {
    console.warn('Cookie Settings Button nicht gefunden');
  }
  
  if (acceptAllModalBtn) {
    console.log('Cookie Accept All Modal Button gefunden');
    acceptAllModalBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Accept All Modal geklickt');
      if (window.acceptAllCookies) {
        window.acceptAllCookies();
      }
    });
  } else {
    console.warn('Cookie Accept All Modal Button nicht gefunden');
  }
  
  // Cookie Modal Close Button
  function hideCookieModal() {
    if (cookieSettingsModal) {
      cookieSettingsModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }
  
  if (saveSettingsBtn) {
    console.log('Cookie Save Settings Button gefunden');
    saveSettingsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Save Settings geklickt (Event Listener)');
      if (window.saveCookieIndividualSettings) {
        window.saveCookieIndividualSettings();
      } else {
        saveIndividualSettings();
      }
    }, { capture: true });
  } else {
    console.warn('Cookie Save Settings Button nicht gefunden');
  }
  
  if (modalCloseBtn) {
    console.log('Cookie Modal Close Button gefunden');
    modalCloseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Modal Close geklickt');
      hideCookieModal();
    });
  } else {
    console.warn('Cookie Modal Close Button nicht gefunden');
  }
  
  // Modal schließen beim Klick auf Backdrop
  if (cookieSettingsModal) {
    cookieSettingsModal.addEventListener('click', function(e) {
      if (e.target === cookieSettingsModal || e.target.classList.contains('cookie-modal-backdrop')) {
        hideCookieModal();
      }
    });
  }
  
  // Modal schließen mit Escape-Taste
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && cookieSettingsModal && cookieSettingsModal.classList.contains('show')) {
      hideCookieModal();
    }
  });
  
  // Cookie-Einstellungen beim Laden der Seite prüfen
  function initializeCookies() {
    const savedSettings = loadCookieSettings();
    
    if (savedSettings && savedSettings.consentGiven) {
      // Benutzer hat bereits eine Wahl getroffen
      // Warte kurz, damit GTM vollständig geladen ist
      setTimeout(() => {
        updateGTMConsent(savedSettings);
      }, 100);
      hideCookieBanner();
      
      // GTM Event: Gespeicherte Cookie-Einstellungen geladen
      pushDataLayerEvent('cookie_consent_loaded', {
        'consent_analytics': savedSettings.analytics,
        'consent_marketing': savedSettings.marketing,
        'consent_version': savedSettings.version,
        'consent_age_days': Math.floor((new Date() - new Date(savedSettings.timestamp)) / (1000 * 60 * 60 * 24))
      });
    } else {
      // Keine Einwilligung gegeben - setze alle Signale auf 'denied'
      // Warte kurz, damit GTM vollständig geladen ist
      setTimeout(() => {
        updateGTMConsent(defaultCookieSettings);
      }, 100);
      // Zeige Cookie Banner nach kurzer Verzögerung
      setTimeout(showCookieBanner, 1000);
    }
  }
  
  // Initialisiere Cookie-System
  initializeCookies();
  
  // Globale Funktionen sind bereits oben definiert
  window.getCookieConsent = function() {
    return loadCookieSettings() || defaultCookieSettings;
  };
  
  // Footer Cookie-Einstellungen Link
  const footerCookieLink = document.querySelector('.footer-cookie-settings');
  if (footerCookieLink) {
    console.log('Footer Cookie-Link gefunden');
    footerCookieLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Footer Cookie-Link geklickt');
      showCookieModal();
    });
  }
  
  // Debug: Cookie Banner Status
  console.log('Cookie Banner Element:', cookieBanner);
  console.log('Cookie Settings Modal Element:', cookieSettingsModal);
  console.log('Accept All Button:', acceptAllBtn);
  console.log('Decline All Button:', declineAllBtn);
  console.log('Settings Button:', settingsBtn);
  
  // Teste Cookie Banner Anzeige nach 2 Sekunden für Debug
  setTimeout(function() {
    const savedSettings = loadCookieSettings();
    console.log('Gespeicherte Cookie-Einstellungen:', savedSettings);
    if (!savedSettings || !savedSettings.consentGiven) {
      console.log('Zeige Cookie Banner für Test');
      showCookieBanner();
    }
  }, 2000);
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

// ===== SCREENSHOT LIGHTBOX =====
document.addEventListener('DOMContentLoaded', function() {
  const lightbox = document.getElementById('screenshot-lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');
  const lightboxOverlay = lightbox?.querySelector('.lightbox-overlay');
  const lightboxTriggers = document.querySelectorAll('[data-lightbox-src]');

  if (!lightbox || !lightboxImage) return;

  // Öffne Lightbox beim Klick auf Screenshot
  lightboxTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const src = this.getAttribute('data-lightbox-src') || this.querySelector('img')?.getAttribute('src');
      const alt = this.getAttribute('data-lightbox-alt') || this.querySelector('img')?.getAttribute('alt') || '';

      if (!src) return;

      lightboxImage.src = src;
      lightboxImage.alt = alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Schließe Lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', closeLightbox);
  }

  // Schließe mit ESC-Taste
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
});

