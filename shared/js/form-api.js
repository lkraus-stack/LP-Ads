(() => {
  const DEFAULT_ENDPOINT = "/api/submit-form";

  function toText(value) {
    return String(value || "").trim();
  }

  function normalizePayload(data = {}) {
    return {
      need: toText(data.need),
      budget: toText(data.budget),
      timeline: toText(data.timeline),
      message: toText(data.message),
      fullname: toText(data.fullname),
      company: toText(data.company),
      role: toText(data.role),
      phone: toText(data.phone),
      email: toText(data.email),
      bookedAppointment: Boolean(data.bookedAppointment),
      industry: toText(data.industry),
      variant_id: toText(data.variant_id),
      form_version: toText(data.form_version),
    };
  }

  function validatePayload(payload) {
    const required = ["fullname", "company", "phone", "email"];
    for (const key of required) {
      if (!toText(payload[key])) {
        return {
          valid: false,
          message: `Pflichtfeld fehlt: ${key}`,
        };
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return {
        valid: false,
        message: "Bitte gib eine gueltige E-Mail-Adresse ein.",
      };
    }

    return { valid: true, message: "" };
  }

  async function submitForm(payload, options = {}) {
    const endpoint = options.endpoint || DEFAULT_ENDPOINT;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let body = {};
    try {
      body = await response.json();
    } catch (_error) {
      body = {};
    }

    if (!response.ok || body.success === false) {
      const message = body.error || "Die Anfrage konnte nicht uebermittelt werden.";
      throw new Error(message);
    }

    return body;
  }

  window.FrancoFormAPI = {
    normalizePayload,
    validatePayload,
    submitForm,
  };
})();
