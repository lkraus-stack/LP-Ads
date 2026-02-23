document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  if (!form || !window.FrancoFormAPI) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.textContent = "Anfrage wird verarbeitet...";
    const data = new FormData(form);
    const payload = window.FrancoFormAPI.normalizePayload({
      need: data.get("need"),
      budget: data.get("budget"),
      timeline: data.get("timeline"),
      message: data.get("message"),
      fullname: data.get("fullname"),
      company: data.get("company"),
      role: data.get("role"),
      phone: data.get("phone"),
      email: data.get("email"),
      bookedAppointment: data.get("bookedAppointment") === "on",
      industry: "ecommerce",
      variant_id: "branche_x_v1",
      form_version: "ecom_form_v1",
    });

    const validation = window.FrancoFormAPI.validatePayload(payload);
    if (!validation.valid) {
      statusEl.textContent = validation.message;
      window.trackVariantFormEvent &&
        window.trackVariantFormEvent("validation_error", { ...payload, reason: validation.message });
      return;
    }

    window.trackVariantFormEvent && window.trackVariantFormEvent("submit_attempt", payload);

    try {
      await window.FrancoFormAPI.submitForm(payload);
      form.reset();
      statusEl.textContent = "Danke! Wir senden dir die naechsten Schritte.";
      window.trackVariantFormEvent && window.trackVariantFormEvent("submit_success", payload);
    } catch (error) {
      statusEl.textContent = error.message || "Fehler beim Senden.";
      window.trackVariantFormEvent &&
        window.trackVariantFormEvent("submit_error", { ...payload, reason: statusEl.textContent });
    }
  });
});
