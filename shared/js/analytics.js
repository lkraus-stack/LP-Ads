(() => {
  const PAGE_VIEW_EVENT = "lp_variant_view";
  const CONSENT_KEY = "franco_cookie_consent_v3";

  window.dataLayer = window.dataLayer || [];

  window.pushDataLayerEvent = function pushDataLayerEvent(eventName, eventData = {}) {
    if (!eventName) return;
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
  };

  function getConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_error) {
      return null;
    }
  }

  function hasAnalyticsConsent() {
    const consent = getConsent();
    if (!consent || !consent.consentGiven) return false;
    return Boolean(consent.analytics || consent.marketing);
  }

  window.trackVariantPageView = function trackVariantPageView(meta = {}) {
    if (!hasAnalyticsConsent()) {
      window.__francoVariantPageviewPendingMeta = meta;
      return;
    }
    if (window.__francoVariantPageviewTracked) return;
    window.pushDataLayerEvent(PAGE_VIEW_EVENT, {
      page_title: document.title,
      page_path: window.location.pathname,
      page_location: window.location.href,
      ...meta,
    });
    window.__francoVariantPageviewTracked = true;
  };

  window.trackVariantFormEvent = function trackVariantFormEvent(step, meta = {}) {
    if (!hasAnalyticsConsent()) return;
    window.pushDataLayerEvent("lp_form_event", {
      step,
      page_path: window.location.pathname,
      ...meta,
    });
  };

  window.flushVariantPageviewIfConsented = function flushVariantPageviewIfConsented() {
    if (window.__francoVariantPageviewTracked) return;
    if (!hasAnalyticsConsent()) return;
    const pendingMeta = window.__francoVariantPageviewPendingMeta || {};
    window.__francoVariantPageviewPendingMeta = null;
    window.trackVariantPageView(pendingMeta);
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (window.__francoVariantPageviewTracked) return;

    const body = document.body || {};
    const industry = body.dataset.industry || "unknown";
    const variantId = body.dataset.variant || "unknown";
    const formVersion = body.dataset.formVersion || "default";

    window.trackVariantPageView({
      industry,
      variant_id: variantId,
      form_version: formVersion,
    });
  });
})();
