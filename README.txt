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
  Как это работает
    Сайт на сервере — клон этого репозитория. Скрипт update_site делает
    git reset --hard + git pull --ff-only. Запускают его трое:
      - GitHub Actions после каждого push в main (через update.php);
      - вы вручную — открыв https://nocodecrm.ru/update.php;
      - cron раз в сутки, на всякий случай.
    main — то, что развёрнуто. Работа ведётся в ветках claude/... и
    вливается в main через pull request. Влили PR — через минуту сайт
    обновился.

  Настройка с нуля (один раз на сервер)
    Ниже /var/www/html — папка сайта, www-data — пользователь PHP. Если
    у вас иначе, подставьте свои и поправьте SITE и WEB_USER в начале
    deploy/update_site. Все команды — от root на сервере (в контейнере
    сайта, если сайт в Docker).

    1. Нужны git и ssh:
         apt-get install -y git openssh-client

    2. Ключ для чтения репозитория. Репозиторий приватный, без ключа
       GitHub не отдаст код. Deploy key — SSH-ключ только на чтение и
       только для этого репозитория, не истекает:
         mkdir -p /etc/nocodecrm
         ssh-keygen -t ed25519 -N "" -C "nocodecrm.ru deploy" -f /etc/nocodecrm/deploy_key
         chown www-data /etc/nocodecrm/deploy_key
         chmod 600 /etc/nocodecrm/deploy_key
         cat /etc/nocodecrm/deploy_key.pub
       Выведенную строку добавить в GitHub:
         https://github.com/gm1981-pixel/nocodecrm/settings/keys
         -> Add deploy key, галочку «Allow write access» НЕ ставить.

    3. Чтобы ssh доверял GitHub (общий файл, для root и www-data сразу):
         ssh-keygen -F github.com -f /etc/ssh/ssh_known_hosts || ssh-keyscan github.com >> /etc/ssh/ssh_known_hosts

    4. Клон в папку сайта. Работает и в пустой папке, и поверх уже
       залитых файлов (они заменятся версией из main, лишние останутся):
         chown -R www-data /var/www/html
         cd /var/www/html
         runuser -u www-data -- git init -q
         runuser -u www-data -- git config core.sshCommand "ssh -i /etc/nocodecrm/deploy_key -o IdentitiesOnly=yes"
         runuser -u www-data -- git remote add origin git@github.com:gm1981-pixel/nocodecrm.git
         runuser -u www-data -- git fetch origin main
         runuser -u www-data -- git checkout -f -B main --track origin/main
       Ключ прописан в настройках самого клона (core.sshCommand), поэтому
       git его найдёт, кто бы ни запустил обновление.

    5. Скрипт обновления — копия deploy/update_site из репозитория:
         cp /var/www/html/deploy/update_site /etc/cron.daily/update_site
         chmod 755 /etc/cron.daily/update_site
       Имя без точек и расширения, иначе cron.daily его пропустит.
       Скрипт сам переключается на www-data и не даёт запустить два
       обновления сразу. Проверка: /etc/cron.daily/update_site
       должен напечатать «Already up to date.» или список изменений.

    6. Закрыть update.php. Своей проверки в нём нет: без этого шага любой
       сможет дёргать обновление и читать его вывод. Логин и пароль:
         htpasswd -c /etc/nocodecrm/.htpasswd deploy
       (утилита из пакета apache2-utils). Дальше одно из двух.

       nginx — в server { } сайта:
         location = /update.php {
             satisfy any;
             allow <IP офиса>;
             deny all;
             auth_basic "deploy";
             auth_basic_user_file /etc/nocodecrm/.htpasswd;
             # дальше как у остальных .php этого сайта (fastcgi_pass / proxy_pass)
         }
         location ~ ^/(\.git|\.github|deploy|docs)(/|$) { return 404; }
         location ~ ^/(CLAUDE\.md|README\.txt)$ { return 404; }
       Последние две строки нужны только на nginx: на Apache то же самое
       делает .htaccess из репозитория.

       Apache — в конфиг сайта (не в .htaccess репозитория: его затрёт
       следующее обновление):
         <Files "update.php">
             AuthType Basic
             AuthName "deploy"
             AuthUserFile /etc/nocodecrm/.htpasswd
             <RequireAny>
                 Require ip <IP офиса>
                 Require valid-user
             </RequireAny>
         </Files>

       Проверка: из другой сети (с телефона без Wi-Fi) update.php должен
       спрашивать пароль; https://nocodecrm.ru/.git/config — 404.

    7. Секреты для GitHub Actions:
         https://github.com/gm1981-pixel/nocodecrm/settings/secrets/actions
           DEPLOY_URL       https://nocodecrm.ru/update.php
           DEPLOY_USER      deploy (логин из шага 6)
           DEPLOY_PASSWORD  пароль из шага 6

    8. Проверка всей цепочки: Actions -> Deploy -> Run workflow
         https://github.com/gm1981-pixel/nocodecrm/actions
       В логе — «Site updated successfully», HTTP 200 и строка
       «Deployed commit» с последним коммитом main.

  Вручную
    https://nocodecrm.ru/update.php
    200 и «Site updated successfully» — успех, 500 и «Site update failed» —
    update_site завершился с ошибкой, её текст следом. Последняя строка
    «Deployed commit» показывает, что сейчас развёрнуто.

  Если не работает
    Не задан секрет DEPLOY_URL      шаг 7.
    HTTP 401 в Actions              неверные DEPLOY_USER / DEPLOY_PASSWORD.
    HTTP 404 в Actions              неверный DEPLOY_URL или update.php нет на
                                    сайте (клон не сделан, шаг 4).
    Permission denied (publickey)   ключ не добавлен в GitHub (шаг 2) или
                                    у www-data нет доступа к deploy_key.
    Host key verification failed    шаг 3.
    detected dubious ownership      папка сайта не у www-data:
                                    chown -R www-data /var/www/html
    cannot open .../update_site     нет скрипта (шаг 5) или он не читается.
    runuser: not found              поставить util-linux.
    Update already running          идёт другое обновление, повторить позже.
    Not possible to fast-forward    на сервере правили историю или ветку;
                                    повторить шаг 4 с git fetch и checkout.
    Сайт не обновился, а Actions    смотреть «Deployed commit» в логе: если
    зелёный                         коммит старый — кеш браузера или CDN.
