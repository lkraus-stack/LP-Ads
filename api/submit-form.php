<?php
/**
 * Formular-Submit Handler mit E-Mail-Versand und ClickUp-Integration
 * 
 * Empfängt Formular-Daten per POST, sendet E-Mails, erstellt Task in ClickUp
 */

require_once __DIR__ . '/config.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS Request für CORS Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Nur POST-Requests erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// JSON-Daten aus Request Body lesen
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Validierung
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

// Pflichtfelder prüfen
$requiredFields = ['email', 'fullname', 'company', 'phone'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Field '{$field}' is required"]);
        exit;
    }
}

// E-Mail validieren
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email address']);
    exit;
}

// Daten sanitisieren (XSS-Schutz)
function sanitize($value) {
    if (is_string($value)) {
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }
    return $value;
}

$cleanData = array_map('sanitize', $data);

// 1. Bestätigungs-E-Mail an Absender senden
$emailConfirmationSent = sendConfirmationEmail($cleanData);

// 2. Benachrichtigungs-E-Mail an info@ihre-domain.de senden
$emailNotificationSent = sendNotificationEmail($cleanData);

// 3. ClickUp Task erstellen
$clickupSuccess = createClickUpTask($cleanData);

// Response (Success-Step bleibt sichtbar; E-Mail/ClickUp-Fehler werden geloggt)
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Formular erfolgreich übermittelt',
    'email_confirmation_sent' => $emailConfirmationSent,
    'email_notification_sent' => $emailNotificationSent,
    'clickup_task_created' => $clickupSuccess
]);

/**
 * Sendet Bestätigungs-E-Mail an den Absender
 */
function sendConfirmationEmail($data) {
    $to = $data['email'];
    $subject = 'Ihre Anfrage bei Franco Consulting GmbH';
    $fromName = defined('EMAIL_FROM_NAME') ? EMAIL_FROM_NAME : 'Franco Consulting GmbH';
    $fromAddress = defined('EMAIL_FROM_ADDRESS') ? EMAIL_FROM_ADDRESS : 'info@ihre-domain.de';

    $body = getConfirmationEmailBody($data);

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $fromName . ' <' . $fromAddress . '>',
        'Reply-To: ' . $fromAddress,
        'X-Mailer: PHP/' . phpversion()
    ];

    return @mail($to, $subject, $body, implode("\r\n", $headers));
}

/**
 * Sendet Benachrichtigungs-E-Mail an info@ihre-domain.de
 */
function sendNotificationEmail($data) {
    $to = defined('EMAIL_TO_ADDRESS') ? EMAIL_TO_ADDRESS : 'info@ihre-domain.de';
    $subject = 'Neue Anfrage von Website: ' . $data['company'] . ' - ' . $data['fullname'];
    $fromName = defined('EMAIL_FROM_NAME') ? EMAIL_FROM_NAME : 'Franco Consulting GmbH';
    $fromAddress = defined('EMAIL_FROM_ADDRESS') ? EMAIL_FROM_ADDRESS : 'info@ihre-domain.de';

    $body = getNotificationEmailBody($data);

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $fromName . ' <' . $fromAddress . '>',
        'Reply-To: ' . $data['email'],
        'X-Mailer: PHP/' . phpversion()
    ];

    return @mail($to, $subject, $body, implode("\r\n", $headers));
}

/**
 * E-Mail-Template: Bestätigung an Absender (Danksagung, Zusammenfassung)
 */
function getConfirmationEmailBody($data) {
    $name = htmlspecialchars($data['fullname'] ?? '');
    $company = htmlspecialchars($data['company'] ?? '');
    $need = htmlspecialchars($data['need'] ?? 'Nicht angegeben');
    $budget = htmlspecialchars($data['budget'] ?? 'Nicht angegeben') . ' €';
    $timeline = htmlspecialchars($data['timeline'] ?? 'Nicht angegeben');
    $message = nl2br(htmlspecialchars($data['message'] ?? ''));

    return '<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Anfrage bestätigt</title></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Vielen Dank für Ihre Anfrage</h2>
  <p>Hallo ' . $name . ',</p>
  <p>wir haben Ihre Anfrage erhalten und melden uns in Kürze bei Ihnen.</p>
  <h3 style="margin-top: 24px;">Zusammenfassung Ihrer Angaben</h3>
  <ul style="list-style: none; padding: 0;">
    <li><strong>Firma:</strong> ' . $company . '</li>
    <li><strong>Bedarf:</strong> ' . $need . '</li>
    <li><strong>Budget:</strong> ' . $budget . '</li>
    <li><strong>Startzeitpunkt:</strong> ' . $timeline . '</li>
  </ul>
  ' . ($message ? '<p><strong>Ihre Nachricht:</strong></p><p>' . $message . '</p>' : '') . '
  <p style="margin-top: 32px;">Mit freundlichen Grüßen<br>Ihr Team der Franco Consulting GmbH</p>
</body>
</html>';
}

/**
 * E-Mail-Template: Benachrichtigung an info@ (alle Formular-Daten strukturiert)
 */
function getNotificationEmailBody($data) {
    $rows = [
        'Name' => $data['fullname'] ?? '',
        'Firma' => $data['company'] ?? '',
        'Rolle' => $data['role'] ?? 'Nicht angegeben',
        'E-Mail' => $data['email'] ?? '',
        'Telefon' => $data['phone'] ?? '',
        'Bedarf' => $data['need'] ?? 'Nicht angegeben',
        'Budget' => ($data['budget'] ?? 'Nicht angegeben') . ' €',
        'Startzeitpunkt' => $data['timeline'] ?? 'Nicht angegeben',
        'Termin gebucht' => !empty($data['bookedAppointment']) ? 'Ja' : 'Nein',
    ];
    $htmlRows = '';
    foreach ($rows as $label => $value) {
        $htmlRows .= '<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>' . htmlspecialchars($label) . '</strong></td><td style="padding: 8px; border: 1px solid #ddd;">' . htmlspecialchars($value) . '</td></tr>';
    }
    $message = isset($data['message']) && $data['message'] !== '' ? nl2br(htmlspecialchars($data['message'])) : '–';

    return '<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Neue Anfrage</title></head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Neue Kontaktanfrage von der Website</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' . $htmlRows . '</table>
  <h3>Nachricht</h3>
  <p>' . $message . '</p>
</body>
</html>';
}

/**
 * Erstellt einen Task in ClickUp
 */
function createClickUpTask($data) {
    $apiUrl = CLICKUP_API_URL . '/list/' . CLICKUP_LIST_ID . '/task';
    $apiToken = CLICKUP_API_TOKEN;
    
    // Task-Name
    $taskName = 'Neue Anfrage: ' . $data['company'] . ' - ' . $data['fullname'];
    
    // Task-Beschreibung (Description)
    $description = "**Kontaktanfrage von Website**\n\n";
    $description .= "**Kontaktdaten:**\n";
    $description .= "- Name: " . $data['fullname'] . "\n";
    $description .= "- Firma: " . $data['company'] . "\n";
    $description .= "- Rolle: " . ($data['role'] ?? 'Nicht angegeben') . "\n";
    $description .= "- E-Mail: " . $data['email'] . "\n";
    $description .= "- Telefon: " . $data['phone'] . "\n\n";
    
    $description .= "**Anfrage-Details:**\n";
    $description .= "- Bedarf: " . ($data['need'] ?? 'Nicht angegeben') . "\n";
    $description .= "- Budget: " . ($data['budget'] ?? 'Nicht angegeben') . " €\n";
    $description .= "- Startzeitpunkt: " . ($data['timeline'] ?? 'Nicht angegeben') . "\n";
    
    if (!empty($data['message'])) {
        $description .= "\n**Nachricht:**\n" . $data['message'] . "\n";
    }
    
    if (!empty($data['bookedAppointment']) && $data['bookedAppointment']) {
        $description .= "\n✓ Termin wurde gebucht\n";
    }
    
    // Task-Payload für ClickUp API
    $taskData = [
        'name' => $taskName,
        'description' => $description,
        'status' => 'open', // Task-Status: 'open' = Neu
        'priority' => 3, // Priority: 1 = Urgent, 2 = High, 3 = Normal, 4 = Low
        'assignees' => [], // Optional: Array von User-IDs
        'tags' => ['website', 'anfrage'], // Optional: Tags
        'check_required_custom_fields' => false, // Überspringe erforderliche Custom Fields
        'notify_all' => false, // Benachrichtige nicht alle Teammitglieder
    ];
    
    // cURL Request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($taskData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: ' . $apiToken
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    // Logging (optional - für Debugging)
    if ($httpCode !== 200) {
        error_log("ClickUp API Error: HTTP {$httpCode} - Response: {$response}");
        if ($curlError) {
            error_log("cURL Error: {$curlError}");
        }
        return false;
    }
    
    $responseData = json_decode($response, true);
    if (isset($responseData['id'])) {
        return true; // Task erfolgreich erstellt
    }
    
    return false;
}