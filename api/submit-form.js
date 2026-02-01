/**
 * Vercel Serverless Function für Formular-Submit mit ClickUp-Integration
 * 
 * Route: /api/submit-form
 */

export default async function handler(req, res) {
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
        html
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

function getConfirmationEmailHtml(data) {
  const name = sanitize(data.fullname || '');
  const company = sanitize(data.company || '');
  const need = sanitize(data.need || 'Nicht angegeben');
  const budget = (sanitize(data.budget || 'Nicht angegeben')) + ' €';
  const timeline = sanitize(data.timeline || 'Nicht angegeben');
  const message = (data.message || '').replace(/[<>]/g, '').trim();
  const messageHtml = message ? `<p><strong>Ihre Nachricht:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>` : '';
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Anfrage bestätigt</title></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Vielen Dank für Ihre Anfrage</h2>
  <p>Hallo ${name},</p>
  <p>wir haben Ihre Anfrage erhalten und melden uns in Kürze bei Ihnen.</p>
  <h3 style="margin-top: 24px;">Zusammenfassung Ihrer Angaben</h3>
  <ul style="list-style: none; padding: 0;">
    <li><strong>Firma:</strong> ${company}</li>
    <li><strong>Bedarf:</strong> ${need}</li>
    <li><strong>Budget:</strong> ${budget}</li>
    <li><strong>Startzeitpunkt:</strong> ${timeline}</li>
  </ul>
  ${messageHtml}
  <p style="margin-top: 32px;">Mit freundlichen Grüßen<br>Ihr Team der Franco Consulting GmbH</p>
</body>
</html>`;
}

function getNotificationEmailHtml(data) {
  const rows = [
    ['Name', data.fullname || ''],
    ['Firma', data.company || ''],
    ['Rolle', data.role || 'Nicht angegeben'],
    ['E-Mail', data.email || ''],
    ['Telefon', data.phone || ''],
    ['Bedarf', data.need || 'Nicht angegeben'],
    ['Budget', (data.budget || 'Nicht angegeben') + ' €'],
    ['Startzeitpunkt', data.timeline || 'Nicht angegeben'],
    ['Termin gebucht', data.bookedAppointment ? 'Ja' : 'Nein']
  ];
  const trs = rows.map(([label, val]) =>
    `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${sanitize(label)}</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${sanitize(String(val))}</td></tr>`
  ).join('');
  const msg = (data.message || '').replace(/[<>]/g, '').trim();
  const messageHtml = msg ? `<p>${msg.replace(/\n/g, '<br>')}</p>` : '<p>–</p>';
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Neue Anfrage</title></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Neue Kontaktanfrage von der Website</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">${trs}</table>
  <h3>Nachricht</h3>
  ${messageHtml}
</body>
</html>`;
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