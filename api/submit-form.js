const fs = require('fs');
const path = require('path');

/**
 * Vercel Serverless Function für Formular-Submit mit ClickUp-Integration
 * 
 * Route: /api/submit-form
 */

const TEMPLATE_DIR = path.join(__dirname, 'email-templates');
const templateCache = new Map();
const BRAND_NAME = process.env.EMAIL_BRAND_NAME || 'Franco Consulting GmbH';

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // OPTIONS Request für CORS Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Nur POST-Requests erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Daten aus Request Body
    const data = req.body;

    // Validierung
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON data'
      });
    }

    // Pflichtfelder prüfen
    const requiredFields = ['email', 'fullname', 'company', 'phone'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        return res.status(400).json({
          success: false,
          error: `Field '${field}' is required`
        });
      }
    }

    // E-Mail validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Environment Variables (aus Vercel Dashboard)
    const clickupApiToken = process.env.CLICKUP_API_TOKEN;
    const clickupListId = process.env.CLICKUP_LIST_ID;

    // 1. Bestätigungs-E-Mail an Absender senden (wenn RESEND_API_KEY gesetzt)
    const emailConfirmationSent = await sendConfirmationEmail(data);
    // 2. Benachrichtigungs-E-Mail an info@ senden
    const emailNotificationSent = await sendNotificationEmail(data);
    // 3. ClickUp Task erstellen (wenn Credentials gesetzt)
    let clickupSuccess = false;
    if (clickupApiToken && clickupListId) {
      clickupSuccess = await createClickUpTask(data, clickupApiToken, clickupListId);
    } else {
      console.warn('ClickUp credentials missing; task not created');
    }

    // Response (Success-Step bleibt sichtbar; E-Mail/ClickUp-Fehler werden geloggt)
    return res.status(200).json({
      success: true,
      message: 'Formular erfolgreich übermittelt',
      email_confirmation_sent: emailConfirmationSent,
      email_notification_sent: emailNotificationSent,
      clickup_task_created: clickupSuccess
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Sendet Bestätigungs-E-Mail an den Absender (via Resend API)
 */
async function sendConfirmationEmail(data) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.EMAIL_FROM_ADDRESS || 'Franco Consulting <onboarding@resend.dev>';
  const subject = 'Ihre Anfrage bei Franco Consulting GmbH';
  const html = getConfirmationEmailHtml(data);
  const text = getConfirmationEmailText(data);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to: [data.email],
        subject,
        html,
        text
      })
    });
    if (!r.ok) {
      const err = await r.text();
      console.error('Resend confirmation error:', r.status, err);
      return false;
    }
    return true;
  } catch (e) {
    console.error('sendConfirmationEmail error:', e);
    return false;
  }
}

/**
 * Sendet Benachrichtigungs-E-Mail an info@ (via Resend API)
 */
async function sendNotificationEmail(data) {
  const apiKey = process.env.RESEND_API_KEY;
  const toAddress = process.env.EMAIL_TO_ADDRESS || 'info@ihre-domain.de';
  if (!apiKey) return false;
  const from = process.env.EMAIL_FROM_ADDRESS || 'Franco Consulting <onboarding@resend.dev>';
  const subject = `Neue Anfrage von Website: ${sanitize(data.company)} - ${sanitize(data.fullname)}`;
  const html = getNotificationEmailHtml(data);
  const text = getNotificationEmailText(data);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to: [toAddress],
        subject,
        html,
        text,
        reply_to: data.email
      })
    });
    if (!r.ok) {
      const err = await r.text();
      console.error('Resend notification error:', r.status, err);
      return false;
    }
    return true;
  } catch (e) {
    console.error('sendNotificationEmail error:', e);
    return false;
  }
}

function loadTemplate(filename) {
  if (templateCache.has(filename)) {
    return templateCache.get(filename);
  }
  const templatePath = path.join(TEMPLATE_DIR, filename);
  const template = fs.readFileSync(templatePath, 'utf8');
  templateCache.set(filename, template);
  return template;
}

function renderTemplate(template, variables) {
  let output = template;
  for (const [key, value] of Object.entries(variables)) {
    const token = `{{${key}}}`;
    output = output.split(token).join(value ?? '');
  }
  return output;
}

function safeValue(value, fallback = '') {
  const cleaned = sanitize(String(value ?? '')).trim();
  return cleaned || fallback;
}

function formatBudget(value) {
  const cleaned = safeValue(value, 'Nicht angegeben');
  if (cleaned === 'Nicht angegeben') return cleaned;
  if (/[€]|eur/i.test(cleaned)) return cleaned;
  return `${cleaned} €`;
}

function formatMessageHtml(message) {
  const cleaned = (message || '').replace(/[<>]/g, '').trim();
  if (!cleaned) return '–';
  return cleaned.replace(/\n/g, '<br>');
}

function formatMessageText(message) {
  const cleaned = (message || '').replace(/[<>]/g, '').trim();
  return cleaned || '–';
}

function getLogoBlock() {
  const logoUrl = (process.env.EMAIL_LOGO_URL || '').trim();
  if (logoUrl) {
    const safeUrl = logoUrl.replace(/["<>]/g, '');
    const safeAlt = BRAND_NAME.replace(/["<>]/g, '');
    return `<img src="${safeUrl}" alt="${safeAlt}" height="28" style="display:block; height:28px; max-width:200px; width:auto; border:0;" />`;
  }
  return `<span style="color:#ffffff; font-size:16px; font-weight:600; letter-spacing:0.2px;">${BRAND_NAME}</span>`;
}

function getEmailLink(email) {
  const safeEmail = safeValue(email, '–');
  if (safeEmail === '–') return '–';
  return `<a href="mailto:${safeEmail}" style="color:#1a1a1a; text-decoration:underline;">${safeEmail}</a>`;
}

function getConfirmationEmailHtml(data) {
  const template = loadTemplate('confirmation.html');
  const name = safeValue(data.fullname, '');
  const company = safeValue(data.company, 'Nicht angegeben');
  const need = safeValue(data.need, 'Nicht angegeben');
  const budget = formatBudget(data.budget);
  const timeline = safeValue(data.timeline, 'Nicht angegeben');
  const messageHtml = formatMessageHtml(data.message);
  const preheader = `Danke für Ihre Anfrage${name ? `, ${name}` : ''}.`;
  return renderTemplate(template, {
    preheader,
    logoBlock: getLogoBlock(),
    name,
    company,
    need,
    budget,
    timeline,
    messageHtml,
    year: new Date().getFullYear()
  });
}

function getNotificationEmailHtml(data) {
  const template = loadTemplate('notification.html');
  const company = safeValue(data.company, 'Website');
  const preheader = `Neue Anfrage von ${company}.`;
  return renderTemplate(template, {
    preheader,
    logoBlock: getLogoBlock(),
    fullName: safeValue(data.fullname, '–'),
    company: safeValue(data.company, '–'),
    role: safeValue(data.role, 'Nicht angegeben'),
    emailLink: getEmailLink(data.email),
    phone: safeValue(data.phone, '–'),
    need: safeValue(data.need, 'Nicht angegeben'),
    budget: formatBudget(data.budget),
    timeline: safeValue(data.timeline, 'Nicht angegeben'),
    bookedAppointment: data.bookedAppointment ? 'Ja' : 'Nein',
    messageHtml: formatMessageHtml(data.message),
    year: new Date().getFullYear()
  });
}

function getConfirmationEmailText(data) {
  const name = safeValue(data.fullname, '');
  const lines = [
    'Vielen Dank für Ihre Anfrage',
    '',
    `Hallo ${name},`,
    'wir haben Ihre Anfrage erhalten und melden uns in Kürze bei Ihnen.',
    '',
    'Zusammenfassung Ihrer Angaben',
    `Firma: ${safeValue(data.company, 'Nicht angegeben')}`,
    `Bedarf: ${safeValue(data.need, 'Nicht angegeben')}`,
    `Budget: ${formatBudget(data.budget)}`,
    `Startzeitpunkt: ${safeValue(data.timeline, 'Nicht angegeben')}`,
    '',
    'Ihre Nachricht:',
    formatMessageText(data.message),
    '',
    'Mit freundlichen Grüßen',
    `Ihr Team der ${BRAND_NAME}`
  ];
  return lines.join('\n');
}

function getNotificationEmailText(data) {
  const lines = [
    'Neue Kontaktanfrage von der Website',
    '',
    'Kontakt- und Anfrage-Details',
    `Name: ${safeValue(data.fullname, '–')}`,
    `Firma: ${safeValue(data.company, '–')}`,
    `Rolle: ${safeValue(data.role, 'Nicht angegeben')}`,
    `E-Mail: ${safeValue(data.email, '–')}`,
    `Telefon: ${safeValue(data.phone, '–')}`,
    `Bedarf: ${safeValue(data.need, 'Nicht angegeben')}`,
    `Budget: ${formatBudget(data.budget)}`,
    `Startzeitpunkt: ${safeValue(data.timeline, 'Nicht angegeben')}`,
    `Termin gebucht: ${data.bookedAppointment ? 'Ja' : 'Nein'}`,
    '',
    'Nachricht:',
    formatMessageText(data.message)
  ];
  return lines.join('\n');
}

/**
 * Erstellt einen Task in ClickUp
 */
async function createClickUpTask(data, apiToken, listId) {
  const apiUrl = `https://api.clickup.com/api/v2/list/${listId}/task`;

  // Task-Name
  const taskName = `Neue Anfrage: ${sanitize(data.company)} - ${sanitize(data.fullname)}`;

  // Task-Beschreibung (Description) - Alle Formular-Daten
  let description = '**Kontaktanfrage von Website**\n\n';
  
  description += '**Kontaktdaten:**\n';
  description += `- Name: ${sanitize(data.fullname)}\n`;
  description += `- Firma: ${sanitize(data.company)}\n`;
  description += `- Rolle: ${sanitize(data.role || 'Nicht angegeben')}\n`;
  description += `- E-Mail: ${sanitize(data.email)}\n`;
  description += `- Telefon: ${sanitize(data.phone)}\n\n`;
  
  description += '**Anfrage-Details:**\n';
  description += `- Bedarf: ${sanitize(data.need || 'Nicht angegeben')}\n`;
  description += `- Budget: ${sanitize(data.budget || 'Nicht angegeben')} €\n`;
  description += `- Startzeitpunkt: ${sanitize(data.timeline || 'Nicht angegeben')}\n`;
  
  if (data.message && data.message.trim() !== '') {
    description += `\n**Nachricht:**\n${sanitize(data.message)}\n`;
  }
  
  if (data.bookedAppointment) {
    description += '\n✓ Termin wurde gebucht\n';
  }

  // Task-Payload für ClickUp API
  const taskData = {
    name: taskName,
    description: description,
    status: 'open', // Task-Status: 'open' = Neu
    priority: 3, // Priority: 1 = Urgent, 2 = High, 3 = Normal, 4 = Low
    assignees: [], // Optional: Array von User-IDs
    tags: ['website', 'anfrage'], // Optional: Tags
    check_required_custom_fields: false, // Überspringe erforderliche Custom Fields
    notify_all: false, // Benachrichtige nicht alle Teammitglieder
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiToken
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ClickUp API Error: HTTP ${response.status} - ${errorText}`);
      return false;
    }

    const responseData = await response.json();
    if (responseData.id) {
      console.log(`ClickUp Task erstellt: ${responseData.id}`);
      return true; // Task erfolgreich erstellt
    }

    return false;
  } catch (error) {
    console.error('Error creating ClickUp task:', error);
    return false;
  }
}

/**
 * Sanitize-Funktion für XSS-Schutz
 */
function sanitize(value) {
  if (typeof value !== 'string') {
    return value;
  }
  // Entferne HTML-Tags und escapen von gefährlichen Zeichen
  return value
    .replace(/[<>]/g, '') // Entferne < und >
    .trim();
}