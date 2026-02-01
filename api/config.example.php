<?php
/**
 * Beispiel-Konfigurationsdatei für Formular-Backend
 * 
 * Kopieren Sie diese Datei nach config.php und tragen Sie Ihre Werte ein.
 * config.php ist in .gitignore und wird nicht ins Repository committet.
 */

// ClickUp API Konfiguration
define('CLICKUP_API_TOKEN', 'Ihr_ClickUp_API_Token');
define('CLICKUP_WORKSPACE_ID', 'Ihre_Workspace_ID');
define('CLICKUP_LIST_ID', 'Ihre_List_ID');
define('CLICKUP_API_URL', 'https://api.clickup.com/api/v2');

// E-Mail Konfiguration
define('EMAIL_FROM_ADDRESS', 'info@ihre-domain.de');  // Absender-Adresse
define('EMAIL_FROM_NAME', 'Franco Consulting GmbH');   // Absender-Name
define('EMAIL_TO_ADDRESS', 'info@ihre-domain.de');     // Empfänger für Benachrichtigungen (neue Anfragen)

// Optional: SMTP für zuverlässigeren Versand (IONOS)
// Wenn nicht gesetzt, wird PHP mail() verwendet
define('SMTP_HOST', 'smtp.ionos.de');
define('SMTP_PORT', 587);
define('SMTP_USER', 'info@ihre-domain.de');
define('SMTP_PASS', 'Ihr_Passwort');
define('SMTP_SECURE', 'tls');  // 'tls' oder 'ssl'