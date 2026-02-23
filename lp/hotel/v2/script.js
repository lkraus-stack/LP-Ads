document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");

  if (!form || !window.FrancoFormAPI) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.textContent = "Senden laeuft...";

    const formData = new FormData(form);
    const payload = window.FrancoFormAPI.normalizePayload({
      need: formData.get("need"),
      budget: formData.get("budget"),
      timeline: formData.get("timeline"),
      message: formData.get("message"),
      fullname: formData.get("fullname"),
      company: formData.get("company"),
      role: formData.get("role"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      bookedAppointment: formData.get("bookedAppointment") === "on",
      industry: "hotel",
      variant_id: "hotel_v2",
      form_version: "hotel_form_v2",
    });

    const validation = window.FrancoFormAPI.validatePayload(payload);
    if (!validation.valid) {
      statusEl.textContent = validation.message;
      window.trackVariantFormEvent &&
        window.trackVariantFormEvent("validation_error", {
          industry: payload.industry,
          variant_id: payload.variant_id,
          form_version: payload.form_version,
          reason: validation.message,
        });
      return;
    }

    window.trackVariantFormEvent &&
      window.trackVariantFormEvent("submit_attempt", {
        industry: payload.industry,
        variant_id: payload.variant_id,
        form_version: payload.form_version,
      });

    try {
      await window.FrancoFormAPI.submitForm(payload);
      form.reset();
      statusEl.textContent = "Danke! Wir melden uns mit einer ersten Einschaetzung.";
      window.trackVariantFormEvent &&
        window.trackVariantFormEvent("submit_success", {
          industry: payload.industry,
          variant_id: payload.variant_id,
          form_version: payload.form_version,
        });
    } catch (error) {
      statusEl.textContent = error.message || "Fehler beim Absenden.";
      window.trackVariantFormEvent &&
        window.trackVariantFormEvent("submit_error", {
          industry: payload.industry,
          variant_id: payload.variant_id,
          form_version: payload.form_version,
          reason: statusEl.textContent,
        });
    }
  });
});
