NoCodeCRM — лендинг nocodecrm.ru
================================

Состав
  index.html          главная страница
  privacy.html        политика обработки персональных данных
  consent.html        согласие на обработку персональных данных
  consent-ads.html    согласие на получение рекламы
  robots.txt, sitemap.xml
  404.html, .htaccess страница «не найдено» (для хостинга на Apache; на nginx укажите error_page 404 /404.html)
  send.php            отправка заявки на почту (нужен хостинг с PHP 5.6+ и mail())
  update.php          точка входа для выкладки (см. «Выкладка»)
  .github/workflows/deploy.yml  автовыкладка после push в main
  assets/css/style.css
  assets/js/main.js   конструктор в первом экране, калькулятор, форма
  assets/js/cookie.js баннер о cookie и запуск Метрики после согласия
  assets/fonts/       шрифты Unbounded и Golos Text (лицензия SIL OFL), лежат локально
  assets/img/         favicon.svg, og.png

Установка
  Базы данных и сборки не требуется. Сайт — клон этого репозитория в корне
  сайта, обновляется через update.php (см. «Выкладка»). Можно и просто
  загрузить файлы, тогда update.php и .github не нужны.

Перед публикацией
  1. Сайт должен открываться по https. Хостинг и почта — на серверах в России.
  2. Заведите ящики info@nocodecrm.ru (сюда приходят заявки) и
     no-reply@nocodecrm.ru (отправитель писем).
  3. Подтвердите пункты 5.5 и 6.1 политики (privacy.html): где хранятся
     данные и какие меры защиты действуют. До подтверждения политику
     не публиковать.
  4. Подайте уведомление об обработке персональных данных в Роскомнадзор,
     если оно ещё не подано от ИП.
  5. Проверьте форму: отправьте тестовую заявку.

Яндекс Метрика
  Сейчас счётчика нет, баннер о cookie не показывается.
  Чтобы включить: впишите номер счётчика в assets/js/cookie.js, строка YM_ID.
  После этого появится баннер «Принять / Отклонить» и ссылка «Файлы cookie»
  в подвале; Метрика запускается только после «Принять».
  Если Метрику ставить не будете — удалите из privacy.html три строки таблиц,
  помеченные комментарием МЕТРИКА, и пункты 4.3–4.4.

При изменении текста согласий
  Обновите дату редакции в документе и значение consent_version в форме
  (index.html), чтобы в журнале согласий была видна редакция.

Где что менять
  Цены калькулятора       assets/js/main.js, массив PRICE
  Примеры в первом экране  assets/js/main.js, объект DATA
  Цвета и шрифты          assets/css/style.css, блок :root
  Иконки                  index.html, блок <svg> в начале <body>
  Адрес для заявок        send.php, переменная $TO

Выкладка (как на keby.clientbase.ru)
  Репозиторий склонирован в корень сайта. Обновление делает скрипт
  /etc/cron.daily/update_site, а дёргает его update.php из корня сайта.
  Cron остаётся резервным механизмом.

  Скрипт update_site на сервере (заводит владелец сервера), примерно:

    #!/bin/sh
    set -e
    exec 9>/tmp/update_site.lock
    flock -n 9 || { echo "Update already running"; exit 1; }
    cd /путь/к/сайту
    git fetch origin main
    git reset --hard
    git pull --ff-only origin main

  Пользователь веб-сервера (www-data) должен иметь право запускать его
  и писать в папку сайта.

  Ветки: main — то, что развёрнуто. Работа ведётся в ветках claude/...
  и вливается в main через pull request.

  Доступ к update.php закрывается на сервере: с офисных IP без пароля,
  с остальных — Basic Auth. Своей проверки в update.php нет, это
  ограничение — единственное, что его защищает. Без него сайт выкладывать
  с update.php нельзя.

  Автоматически, после push в main
    .github/workflows/deploy.yml вызывает тот же адрес по HTTPS.
    Срабатывает только на push в main; запустить вручную можно кнопкой
    Run workflow на вкладке Actions. Нужны три секрета в
    Settings -> Secrets and variables -> Actions:
      DEPLOY_URL       https://nocodecrm.ru/update.php
      DEPLOY_USER      логин Basic Auth
      DEPLOY_PASSWORD  пароль оттуда же
    Пока DEPLOY_URL не задан, запуск падает с понятной ошибкой.
    Любой ответ не 2xx роняет запуск; тело ответа печатается всегда.

  Вручную
    https://nocodecrm.ru/update.php
    200 и «Site updated successfully» — успех, 500 и «Site update failed» —
    update_site завершился с ошибкой, её текст следом. Последняя строка
    «Deployed commit» показывает, что сейчас развёрнуто.

  Служебное из клона наружу не отдаётся: .htaccess отвечает 404 на .git,
  .github, CLAUDE.md, README.txt и docs/. На nginx то же нужно прописать
  в конфиге (location ~ ^/(\.git|\.github|docs)/ и т. д. -> return 404).
