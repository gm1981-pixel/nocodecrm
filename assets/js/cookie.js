/* Баннер о файлах cookie и отложенный запуск Яндекс Метрики.
   Пока номер счётчика не указан, баннер не показывается и ничего не загружается. */
(function () {
  'use strict';
  var YM_ID = '';                 // номер счётчика Яндекс Метрики, например '12345678'
  var BANNER_VERSION = '2026-11-12';
  var KEY = 'cookieConsent';
  if (!YM_ID) return;

  function read() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify({ choice: v, version: BANNER_VERSION, date: new Date().toISOString() })); } catch (e) {} }

  window.addEventListener('cookieConsentAccepted', function () {
    if (window.ym) return;
    window.ym = function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = 1 * new Date();
    var s = document.createElement('script');
    s.src = 'https://mc.yandex.ru/metrika/tag.js';
    s.async = true;
    document.head.appendChild(s);
    window.ym(YM_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  });

  var box;
  function show() {
    if (box) return;
    box = document.createElement('div');
    box.className = 'cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Файлы cookie');
    box.innerHTML = '<b>Мы используем файлы cookie</b>' +
      '<span>Технические данные нужны для работы сайта. Аналитические (Яндекс Метрика) помогают понять, какими разделами пользуются, — их мы включаем только с вашего согласия. Подробнее — в <a href="privacy.html" target="_blank" rel="noopener">политике обработки персональных данных</a>.</span>' +
      '<div class="cookie-btns"><button type="button" class="btn btn-sm btn-ghost" data-c="accepted">Принять</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" data-c="declined">Отклонить</button></div>';
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]'); if (!b) return;
      save(b.dataset.c);
      box.remove(); box = null;
      if (b.dataset.c === 'accepted') window.dispatchEvent(new Event('cookieConsentAccepted'));
      else if (window.ym) location.reload();
    });
    document.body.appendChild(box);
  }

  function start() {
    var open = document.getElementById('cookie-open');
    if (open) { open.classList.remove('hidden'); open.addEventListener('click', show); }
    var c = read();
    if (!c || c.version !== BANNER_VERSION) show();
    else if (c.choice === 'accepted') window.dispatchEvent(new Event('cookieConsentAccepted'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
