<?php
// Выкладка сайта: запускает /etc/cron.daily/update_site и печатает его вывод.
// Дёрнули адрес — сайт обновился. Устроено так же, как на keby.clientbase.ru.
//
// ВНИМАНИЕ. Своей проверки доступа здесь нет намеренно: адрес должен быть
// закрыт на уровне сервера (IP офиса без пароля, остальным — Basic Auth).
// Если этого ограничения нет — точка входа открыта всему интернету: любой
// сможет запускать обновление подряд и читать вывод update_site, где видны
// пути, адрес репозитория и текст ошибок. Тогда здесь нужна проверка:
// токен или список адресов.

header('Content-Type: text/plain; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');

exec('/bin/sh /etc/cron.daily/update_site 2>&1', $output, $exitCode);

if ($exitCode === 0) {
    http_response_code(200);
    echo "Site updated successfully.\n\n";
} else {
    http_response_code(500);
    echo "Site update failed.\n\n";
}

echo implode("\n", $output), "\n";

// Какой коммит сейчас развёрнут. Нужно, чтобы в логе GitHub Actions было
// видно, что именно приехало на сайт, а не только «успешно». Печатается и
// при ошибке — тогда видно, на чём сайт остался. Клон репозитория — это
// папка самого сайта, где лежит этот файл.
exec('git -C ' . escapeshellarg(__DIR__) . ' log -1 --pretty=format:"%h %ci %s" 2>&1', $head, $gitCode);
echo "\nDeployed commit: ", ($gitCode === 0 ? implode(' ', $head) : 'не определён (' . implode(' ', $head) . ')'), "\n";
