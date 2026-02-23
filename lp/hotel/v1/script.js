document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  const formWrapper = form && form.closest(".contact-form-wrapper");
  const formSuccess = document.getElementById("formSuccess");
  const submitButton = form && form.querySelector('button[type="submit"]');
  const submitLabel = submitButton ? submitButton.textContent : "";
  let isSubmitting = false;

  if (!form || !window.FrancoFormAPI) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    if (formSuccess) formSuccess.setAttribute("hidden", "");
    if (statusEl) statusEl.textContent = "Anfrage wird gesendet…";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Wird gesendet…";
    }

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
      variant_id: "hotel_v1",
      form_version: "hotel_form_v1",
    });

    const validation = window.FrancoFormAPI.validatePayload(payload);
    if (!validation.valid) {
      const message = validation.message.startsWith("Pflichtfeld fehlt:")
        ? "Bitte füllen Sie alle Pflichtfelder aus."
        : validation.message;
      if (statusEl) statusEl.textContent = message;
      isSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
      }
      window.trackVariantFormEvent &&
        window.trackVariantFormEvent("validation_error", {
          industry: payload.industry,
          variant_id: payload.variant_id,
          form_version: payload.form_version,
          reason: message,
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
      if (statusEl) statusEl.textContent = "";
      if (formSuccess) formSuccess.removeAttribute("hidden");
      if (formWrapper) formWrapper.classList.add("is-success");
      isSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
      }
      window.trackVariantFormEvent &&
        window.trackVariantFormEvent("submit_success", {
          industry: payload.industry,
          variant_id: payload.variant_id,
          form_version: payload.form_version,
        });
    } catch (error) {
      if (statusEl) statusEl.textContent = error.message || "Senden fehlgeschlagen. Bitte erneut versuchen.";
      isSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitLabel;
      }
      window.trackVariantFormEvent &&
        window.trackVariantFormEvent("submit_error", {
          industry: payload.industry,
          variant_id: payload.variant_id,
          form_version: payload.form_version,
          reason: statusEl ? statusEl.textContent : "",
        });
    }
  });
});
