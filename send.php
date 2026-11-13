<?php
/**
 * Обработчик формы заявки nocodecrm.ru.
 * Отправляет письмо на почту. Базы данных нет.
 * Позже сюда можно добавить передачу заявки в CRM (см. блок «CRM» ниже).
 */

$TO      = 'info@nocodecrm.ru';         // куда приходят заявки (ящик оператора)
$FROM    = 'no-reply@nocodecrm.ru';     // ящик на домене сайта (нужен для доставки)
$SUBJECT = 'Заявка с сайта nocodecrm.ru';

header('Content-Type: application/json; charset=utf-8');

function out($ok, $error = '') {
    echo json_encode(array('ok' => $ok, 'error' => $error), JSON_UNESCAPED_UNICODE);
    exit;
}
function clean($s, $max) {
    $s = trim((string)$s);
    $s = str_replace(array("\r\n", "\r"), "\n", $s);
    return mb_substr($s, 0, $max, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); out(false, 'method'); }
if (!empty($_POST['website'])) { out(true); }            // ловушка для ботов

$name    = str_replace("\n", ' ', clean(isset($_POST['name']) ? $_POST['name'] : '', 100));
$contact = str_replace("\n", ' ', clean(isset($_POST['contact']) ? $_POST['contact'] : '', 150));
$message = clean(isset($_POST['message']) ? $_POST['message'] : '', 5000);
$agree   = !empty($_POST['agree']);
$ads     = !empty($_POST['ads']);
$version = str_replace("\n", ' ', clean(isset($_POST['consent_version']) ? $_POST['consent_version'] : '', 20));
$page    = str_replace("\n", ' ', clean(isset($_POST['page_url']) ? $_POST['page_url'] : '', 300));
$fname   = str_replace("\n", ' ', clean(isset($_POST['form_name']) ? $_POST['form_name'] : '', 100));

if ($name === '' || $contact === '') { http_response_code(422); out(false, 'empty'); }
if (!$agree) { http_response_code(422); out(false, 'agree'); }

$body  = "Имя: $name\n";
$body .= "Контакт: $contact\n\n";
$body .= "Задача:\n" . ($message !== '' ? $message : '—') . "\n\n";
$body .= "--- Журнал согласий ---\n";
$body .= "Форма: $fname\n";
$body .= "Страница: $page\n";
$body .= "Согласие на обработку ПДн: да, редакция $version\n";
$body .= "Согласие на рекламу: " . ($ads ? "да, редакция $version" : "нет") . "\n";
$body .= "Дата и время: " . date('d.m.Y H:i:s') . "\n";
$body .= "IP: " . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '') . "\n";

$headers  = "From: NoCodeCRM <$FROM>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$sent = mail($TO, '=?UTF-8?B?' . base64_encode($SUBJECT) . '?=', $body, $headers);

/* CRM: здесь позже можно отправить заявку во внешнюю форму или API Платформы КБ.
   Вместе с заявкой передавайте поля журнала согласий и храните их в CRM. */

if (!$sent) { http_response_code(500); out(false, 'mail'); }
out(true);
