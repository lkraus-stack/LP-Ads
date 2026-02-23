(() => {
  const PAGE_VIEW_EVENT = "lp_variant_view";

  window.dataLayer = window.dataLayer || [];

  window.pushDataLayerEvent = function pushDataLayerEvent(eventName, eventData = {}) {
    if (!eventName) return;
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
  };

  window.trackVariantPageView = function trackVariantPageView(meta = {}) {
    window.pushDataLayerEvent(PAGE_VIEW_EVENT, {
      page_title: document.title,
      page_path: window.location.pathname,
      page_location: window.location.href,
      ...meta,
    });
  };

  window.trackVariantFormEvent = function trackVariantFormEvent(step, meta = {}) {
    window.pushDataLayerEvent("lp_form_event", {
      step,
      page_path: window.location.pathname,
      ...meta,
    });
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

    window.__francoVariantPageviewTracked = true;
  });
})();
