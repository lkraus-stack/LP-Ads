(() => {
  const CONSENT_KEY = "franco_cookie_consent_v3";
  const defaultConsent = {
    necessary: true,
    analytics: false,
    marketing: false,
    consentGiven: false,
    timestamp: null,
  };

  function loadConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      return { ...defaultConsent, ...JSON.parse(raw) };
    } catch (_error) {
      return null;
    }
  }

  function saveConsent(consent) {
    const finalConsent = {
      ...defaultConsent,
      ...consent,
      consentGiven: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(finalConsent));
    window.pushDataLayerEvent &&
      window.pushDataLayerEvent("cookie_consent_updated", {
        consent_analytics: finalConsent.analytics,
        consent_marketing: finalConsent.marketing,
      });
    if (
      (finalConsent.analytics || finalConsent.marketing) &&
      typeof window.flushVariantPageviewIfConsented === "function"
    ) {
      window.flushVariantPageviewIfConsented();
    }
    return finalConsent;
  }

  function hideBanner() {
    const banner = document.getElementById("cookieBanner");
    if (banner) banner.classList.remove("is-visible");
  }

  function showBanner() {
    const banner = document.getElementById("cookieBanner");
    if (banner) banner.classList.add("is-visible");
  }

  function applyConsentUI(consent) {
    const marketingInput = document.getElementById("cookieMarketing");
    if (marketingInput) marketingInput.checked = Boolean(consent.marketing);
  }

  function closeSettings() {
    const modal = document.getElementById("cookieSettingsModal");
    if (modal) modal.classList.remove("is-visible");
  }

  function openSettings() {
    const modal = document.getElementById("cookieSettingsModal");
    const consent = loadConsent() || defaultConsent;
    applyConsentUI(consent);
    if (modal) modal.classList.add("is-visible");
  }

  window.showCookieSettings = openSettings;

  window.acceptAllCookies = function acceptAllCookies() {
    saveConsent({
      analytics: true,
      marketing: true,
    });
    hideBanner();
    closeSettings();
  };

  window.declineAllCookies = function declineAllCookies() {
    saveConsent({
      analytics: false,
      marketing: false,
    });
    hideBanner();
    closeSettings();
  };

  window.saveCookieIndividualSettings = function saveCookieIndividualSettings() {
    const marketingInput = document.getElementById("cookieMarketing");
    const marketing = Boolean(marketingInput && marketingInput.checked);
    saveConsent({
      analytics: marketing,
      marketing,
    });
    hideBanner();
    closeSettings();
  };

  document.addEventListener("DOMContentLoaded", () => {
    const consent = loadConsent();
    if (!consent || !consent.consentGiven) {
      showBanner();
    } else {
      applyConsentUI(consent);
    }

    const acceptBtn = document.getElementById("cookieAcceptAll");
    const declineBtn = document.getElementById("cookieDeclineAll");
    const settingsBtn = document.getElementById("cookieSettings");
    const saveBtn = document.getElementById("cookieSaveSettings");
    const closeBtn = document.getElementById("cookieModalClose");
    const acceptModalBtn = document.getElementById("cookieAcceptAllModal");

    if (acceptBtn) acceptBtn.addEventListener("click", window.acceptAllCookies);
    if (declineBtn) declineBtn.addEventListener("click", window.declineAllCookies);
    if (settingsBtn) settingsBtn.addEventListener("click", window.showCookieSettings);
    if (saveBtn) saveBtn.addEventListener("click", window.saveCookieIndividualSettings);
    if (acceptModalBtn) acceptModalBtn.addEventListener("click", window.acceptAllCookies);
    if (closeBtn) closeBtn.addEventListener("click", closeSettings);

    const modal = document.getElementById("cookieSettingsModal");
    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeSettings();
      });
    }
  });
})();
