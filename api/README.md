# Formular-Backend: E-Mail-Versand und ClickUp-Integration

## Übersicht

Das Kontaktformular unterstützt nach dem Absenden:

1. **Bestätigungs-E-Mail** an den Absender (Danksagung, Zusammenfassung der Anfrage)
2. **Benachrichtigungs-E-Mail** an `info@ihre-domain.de` (alle Formular-Daten strukturiert)
3. **ClickUp-Task** mit allen Formular-Daten

Es gibt zwei Backend-Varianten:

- **Vercel (Serverless):** `api/submit-form.js` – für Hosting auf Vercel
- **PHP (IONOS):** `api/submit-form.php` + `api/config.php` – für Hosting auf IONOS mit PHP

---

## Vercel (aktuelle Hosting-Umgebung)

### Dateien

- **`submit-form.js`** – Serverless Function: E-Mail (Resend) + ClickUp

### Environment Variables (Vercel Dashboard)

**Pflicht für ClickUp:**

- `CLICKUP_API_TOKEN` – ClickUp API Token (Settings → Apps → API)
- `CLICKUP_LIST_ID` – List ID, in die Tasks erstellt werden (z. B. `90124190263`)

**Optional für E-Mail (Resend):**

- `RESEND_API_KEY` – API-Key von [resend.com](https://resend.com)
- `EMAIL_FROM_ADDRESS` – Absender (z. B. `Franco Consulting <info@ihre-domain.de>`)
- `EMAIL_TO_ADDRESS` – Empfänger für Benachrichtigungen (z. B. `info@ihre-domain.de`)

Ohne `RESEND_API_KEY` wird kein E-Mail-Versand ausgeführt; ClickUp und Response laufen weiter.

### ClickUp-Setup (Vercel)

1. ClickUp: **Settings** → **Apps** → **API** → Token erzeugen
2. Workspace/List öffnen; List ID aus der URL:  
   `https://app.clickup.com/{workspace_id}/v/li/{list_id}`
3. In Vercel: **Settings** → **Environment Variables** eintragen:
   - `CLICKUP_API_TOKEN`
   - `CLICKUP_LIST_ID`

---

## PHP-Backend (IONOS)

### Dateien

- **`submit-form.php`** – E-Mail (PHP `mail()`) + ClickUp
- **`config.php`** – E-Mail- und ClickUp-Konfiguration (sensible Daten, in `.gitignore`)
- **`config.example.php`** – Vorlage; nach `config.php` kopieren und anpassen

### Konfiguration (IONOS)

1. `config.example.php` als `config.php` kopieren
2. In `config.php` eintragen:
   - ClickUp: `CLICKUP_API_TOKEN`, `CLICKUP_WORKSPACE_ID`, `CLICKUP_LIST_ID`
   - E-Mail: `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`, `EMAIL_TO_ADDRESS`
3. Optional: IONOS SMTP in `config.php` setzen (siehe Kommentare), falls PHPMailer später genutzt wird; Standard ist PHP `mail()`.

### Frontend auf PHP umstellen

Wenn die Seite auf IONOS mit PHP gehostet wird, im Frontend die API-URL auf das PHP-Skript zeigen:

- Statt `/api/submit-form` z. B. `/api/submit-form.php` (je nach Verzeichnisstruktur auf dem Server)

---

## E-Mail-Templates

- **Bestätigung (an Absender):** Danksagung, Zusammenfassung (Firma, Bedarf, Budget, Startzeitpunkt, Nachricht)
- **Benachrichtigung (an info@):** Tabelle mit allen Feldern (Name, Firma, Rolle, E-Mail, Telefon, Bedarf, Budget, Startzeitpunkt, Termin gebucht, Nachricht)

Templates sind in `submit-form.php` (PHP) und in `submit-form.js` (Vercel/Resend) umgesetzt.

---

## Frontend

- **Loading-State:** Beim Absenden wird „Daten werden gesendet…“ angezeigt
- **Error-Handling:** Bei API-Fehler erscheint eine Fehlermeldung; der Success-Step bleibt sichtbar (wie im Plan)
- **Daten:** Alle Formular-Felder werden als JSON gesendet:  
  `need`, `budget`, `timeline`, `message`, `fullname`, `company`, `role`, `phone`, `email`, `bookedAppointment`

---

## Fehlerbehandlung

- **ClickUp fehlgeschlagen:** E-Mails werden trotzdem versendet; Response bleibt `success: true`, `clickup_task_created: false`
- **E-Mail fehlgeschlagen:** ClickUp-Task wird trotzdem erstellt; Response enthält `email_confirmation_sent` / `email_notification_sent: false`
- **Frontend:** Bei Netzwerk-/Server-Fehler wird eine Fehlermeldung angezeigt, der Success-Step bleibt erhalten

---

## Sicherheit

- Input-Validierung und Sanitization (XSS-Schutz)
- Pflichtfelder: `email`, `fullname`, `company`, `phone`
- E-Mail-Format-Validierung
- API-Keys und sensible Daten nur in Environment Variables bzw. `config.php` (nicht im Frontend)
- `config.php` in `.gitignore`
