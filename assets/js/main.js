/* NoCodeCRM — nocodecrm.ru. Без внешних библиотек. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rub = function (n) { return n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽'; };

  try { console.log('%cЗаглядываете под капот? Мы тоже так делаем. Пишите: info@nocodecrm.ru', 'font:600 14px sans-serif;color:#2B2BFF'); } catch (e) {}

  /* Шапка и меню */
  var top = $('#top'), nav = $('#nav'), burger = $('#burger');
  window.addEventListener('scroll', function () { top.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
  function closeNav() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });

  /* Подписи колонок для мобильного вида сравнения */
  var heads = $$('.cmp thead th').map(function (t) { return t.textContent; });
  $$('.cmp tbody tr').forEach(function (tr) { $$('td', tr).forEach(function (td, i) { td.setAttribute('data-label', heads[i + 1]); }); });

  /* Конструктор на первом экране */
  var DATA = {
    sales: { title: 'Сделки', cols: ['Клиент', 'Сделка', 'Сумма', 'Статус'], rows: [
      ['ООО «Вектор»', 'Поставка оборудования', '480 000 ₽', ['В работе', 't1']],
      ['ИП Соколова', 'Обслуживание на год', '96 000 ₽', ['Ждёт оплату', 't3']],
      ['АО «Меридиан»', 'Монтаж линии', '1 250 000 ₽', ['Срок сегодня', 't2']],
      ['ООО «Берег»', 'Запчасти', '54 300 ₽', ['Закрыта', '']]
    ], report: 'Продажи по месяцам', bell: 'Позвонить в АО «Меридиан» до 15:00', doc: 'Счёт № 248' },
    prod: { title: 'Заказы в производстве', cols: ['Заказ', 'Изделие', 'Срок', 'Этап'], rows: [
      ['№ 1042', 'Шкаф управления', '18.11', ['Сборка', 't1']],
      ['№ 1043', 'Щит распределительный', '20.11', ['Раскрой', 't3']],
      ['№ 1039', 'Пульт оператора', '14.11', ['Просрочен', 't2']],
      ['№ 1036', 'Корпус 600×400', '12.11', ['Отгружен', '']]
    ], report: 'Загрузка цехов', bell: 'Заказ № 1039: согласовать новый срок', doc: 'Наряд-заказ № 1042' },
    stock: { title: 'Остатки на складе', cols: ['Товар', 'Остаток', 'Резерв', 'Статус'], rows: [
      ['Кабель ВВГ 3×2,5', '1 240 м', '300 м', ['В наличии', 't1']],
      ['Автомат 16А', '86 шт', '40 шт', ['В наличии', 't1']],
      ['Розетка двойная', '12 шт', '10 шт', ['Заканчивается', 't2']],
      ['Гофра 20 мм', '0 м', '—', ['Заказано', 't3']]
    ], report: 'Оборачиваемость', bell: 'Розетка двойная: остаток ниже минимума', doc: 'Накладная № 517' },
    proj: { title: 'Проекты', cols: ['Проект', 'Ответственный', 'Дедлайн', 'Статус'], rows: [
      ['Склад в Зеленодольске', 'Каримов', '30.11', ['Идёт', 't1']],
      ['Офис на Баумана', 'Орлова', '22.11', ['На согласовании', 't3']],
      ['Цех № 2, вентиляция', 'Сафин', '13.11', ['Срок завтра', 't2']],
      ['Магазин «Уют»', 'Орлова', '05.11', ['Сдан', '']]
    ], report: 'Проекты по стадиям', bell: 'Цех № 2: завтра сдача этапа', doc: 'Акт выполненных работ' }
  };
  var tab = 'sales', tools = { report: true, bell: false, doc: false };
  var bTable = $('#b-table'), bExtra = $('#b-extra'), bTitle = $('#b-title'), bFx = $('#b-fx');
  var STAT = {};
  Object.keys(DATA).forEach(function (k) {
    var seen = {}; STAT[k] = [];
    DATA[k].rows.forEach(function (r) { if (!seen[r[3][0]]) { seen[r[3][0]] = 1; STAT[k].push(r[3]); } });
  });
  function fx(bump) {
    var d = DATA[tab], hot = 0, sum = 0, allDone = true;
    d.rows.forEach(function (r) {
      if (r[3][1] !== '') allDone = false;
      if (r[3][1] === 't2') hot++;
      if (tab === 'sales' && r[3][1] !== '') sum += parseInt(r[2].replace(/\D/g, ''), 10);
    });
    bFx.innerHTML = '<i>fx</i><span>Требуют внимания: <b' + (bump ? ' class="bump"' : '') + '>' + hot + ' из ' + d.rows.length + '</b></span>' +
      (tab === 'sales' ? '<span>Открытые сделки: <b' + (bump ? ' class="bump"' : '') + '>' + rub(sum) + '</b></span>' : '') +
      '<em>' + (allDone ? 'всё закрыто — можно в отпуск' : hot === 0 ? 'ничего не горит, редкий день' : 'нажмите на статус в таблице') + '</em>';
  }
  var BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="#FFE23D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17V11a6 6 0 0 1 12 0v6zM4 17h16M10 21h4"/></svg>';
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function renderBuilder() {
    var d = DATA[tab];
    bTitle.textContent = d.title;
    var h = '<thead><tr>' + d.cols.map(function (c, i) { return '<th' + (i === 1 ? ' class="opt"' : '') + '>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    d.rows.forEach(function (r, ri) {
      var hl = tools.bell && r[3][1] === 't2';
      h += '<tr' + (hl ? ' class="hl"' : '') + '><td>' + esc(r[0]) + '</td><td class="opt">' + esc(r[1]) + '</td><td>' + esc(r[2]) +
        '</td><td><button type="button" class="tag ' + r[3][1] + '" data-r="' + ri + '" title="Сменить статус">' + esc(r[3][0]) + '</button></td></tr>';
    });
    bTable.innerHTML = h + '</tbody>';
    var x = '';
    if (tools.bell) x += '<div class="b-card b-bell">' + BELL + '<span>' + esc(d.bell) + '</span></div>';
    if (tools.report) {
      var seed = tab.length * 7, bars = '';
      for (var i = 0; i < 8; i++) bars += '<span style="height:' + (28 + ((seed + i * 37) % 70)) + '%"></span>';
      x += '<div class="b-card"><b>' + esc(d.report) + '</b><div class="b-chart">' + bars + '</div></div>';
    }
    if (tools.doc) x += '<div class="b-card b-doc"><b>' + esc(d.doc) + '</b><u></u><u></u><u></u></div>';
    bExtra.innerHTML = x;
    fx(false);
  }
  var noAnim = false;
  bTable.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-r]'); if (!b) return;
    var row = DATA[tab].rows[+b.dataset.r], list = STAT[tab], i = 0;
    list.forEach(function (st, k) { if (st[0] === row[3][0]) i = k; });
    row[3] = list[(i + 1) % list.length];
    var cards = $$('.b-card', bExtra).length;
    renderBuilder();
    $$('.b-card', bExtra).forEach(function (c, k) { if (k < cards) c.style.animation = 'none'; });
    fx(true);
    var nb = $('button[data-r="' + b.dataset.r + '"]', bTable); if (nb) nb.focus();
  });
  $$('.b-tab').forEach(function (b) {
    b.addEventListener('click', function () {
      tab = b.dataset.tab;
      $$('.b-tab').forEach(function (o) { o.setAttribute('aria-selected', String(o === b)); });
      renderBuilder();
    });
  });
  $$('.b-tool').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.tool; tools[k] = !tools[k];
      b.setAttribute('aria-pressed', String(tools[k]));
      renderBuilder();
    });
  });
  renderBuilder();

  /* Калькулятор. Цены «от», руб. — правьте здесь */
  var PRICE = [
    ['Структура данных', [
      ['Создание и настройка таблицы', 3000],
      ['Настройка карточки клиента', 3000],
      ['Дополнительные вычисляемые поля', 3000],
      ['Дополнительный фильтр', 1000],
      ['Цветовое форматирование строк', 1000]
    ]],
    ['Автоматизация', [
      ['Дополнительное действие', 4000],
      ['Напоминание', 1000],
      ['Шаблон рассылки', 2000],
      ['Внешняя форма', 5000]
    ]],
    ['Отчёты и документы', [
      ['Отчёт', 5000],
      ['График', 5000],
      ['Печатная форма', 7000],
      ['Договор с автозаполнением', 5000],
      ['Шаблон коммерческого предложения', 4000]
    ]],
    ['Доступ и запуск', [
      ['Группа доступа', 5000],
      ['Импорт клиентов или прайс-листа', 2500],
      ['Формирование ТЗ', 15000],
      ['Обучение пользователей', 2000],
      ['Документация по системе', 20000],
      ['Установка на сервер клиента', 5000]
    ]]
  ];
  var list = $('#calc-list'), qty = {}, flat = [];
  var html = '';
  PRICE.forEach(function (g) {
    html += '<div class="calc-group">' + g[0] + '</div>';
    g[1].forEach(function (it) {
      var id = flat.length; flat.push(it); qty[id] = 0;
      html += '<div class="calc-row" data-id="' + id + '"><span>' + it[0] + '</span><span class="p">от ' + rub(it[1]) +
        '</span><span class="qty"><button type="button" data-d="-1" aria-label="Меньше: ' + it[0] + '">−</button><output>0</output>' +
        '<button type="button" data-d="1" aria-label="Больше: ' + it[0] + '">+</button></span></div>';
    });
  });
  list.innerHTML = html;
  var totalEl = $('#calc-total'), pickedEl = $('#calc-picked'), hintEl = $('#calc-hint');
  function calcText() {
    var lines = [], sum = 0;
    flat.forEach(function (it, id) { if (qty[id]) { sum += qty[id] * it[1]; lines.push(it[0] + ' × ' + qty[id]); } });
    return { lines: lines, sum: sum };
  }
  function renderCalc() {
    var c = calcText(), h = '';
    flat.forEach(function (it, id) {
      if (qty[id]) h += '<li><span>' + it[0] + ' × ' + qty[id] + '</span><span>' + rub(qty[id] * it[1]) + '</span></li>';
    });
    pickedEl.innerHTML = h;
    totalEl.textContent = 'от ' + rub(c.sum);
    hintEl.textContent = c.sum
      ? 'Это ориентир по прайсу. Точную стоимость назовём после разбора задачи; проекты под ключ — от 100 000 ₽.'
      : 'Пока 0 ₽: выгодно, но и системы нет. Выберите работы слева — сумма посчитается сама.';
  }
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-d]'); if (!b) return;
    var row = b.closest('.calc-row'), id = +row.dataset.id;
    qty[id] = Math.max(0, Math.min(99, qty[id] + (+b.dataset.d)));
    $('output', row).textContent = qty[id];
    row.classList.toggle('on', qty[id] > 0);
    renderCalc();
  });
  renderCalc();
  $('#calc-send').addEventListener('click', function () {
    var c = calcText(); if (!c.sum) return;
    var ta = $('#f-msg');
    var block = 'Расчёт с сайта (от ' + rub(c.sum) + '):\n— ' + c.lines.join('\n— ');
    ta.value = (ta.value.replace(/\n*Расчёт с сайта[\s\S]*$/, '').trim() + '\n\n' + block).trim();
  });

  /* Навести порядок */
  var tidy = $('#tidy');
  tidy.addEventListener('click', function () {
    var on = $('.ba-pic').classList.toggle('tidy');
    tidy.setAttribute('aria-pressed', String(on));
    tidy.textContent = on ? 'Вернуть хаос' : 'Навести порядок';
    $('#tidy-note').classList.toggle('hidden', !on);
  });

  /* Этапы: карточка проекта идёт по воронке */
  var stages = $$('.pipe-stage'), panels = $$('.pipe-panel'), pcard = $('#pipe-card'), pres = $('#pipe-res'), pi = 0;
  function setStage(i) {
    pi = Math.max(0, Math.min(stages.length - 1, i));
    stages.forEach(function (b, k) {
      b.setAttribute('aria-selected', String(k === pi));
      b.classList.toggle('done', k < pi);
    });
    panels.forEach(function (p, k) { p.classList.toggle('hidden', k !== pi); });
    pcard.style.transform = 'translateX(calc(' + pi + ' * (100% + 8px)))';
    pres.textContent = panels[pi].dataset.res;
    $('#pipe-prev').disabled = pi === 0;
    $('#pipe-next').textContent = pi === stages.length - 1 ? 'Обсудить проект' : 'Следующий этап';
  }
  stages.forEach(function (b) { b.addEventListener('click', function () { setStage(+b.dataset.i); }); });
  $('#pipe-prev').addEventListener('click', function () { setStage(pi - 1); });
  $('#pipe-next').addEventListener('click', function () {
    if (pi === stages.length - 1) { location.hash = '#lead'; return; }
    setStage(pi + 1);
  });
  setStage(0);

  /* Подбор формата: карточка проекта */
  var ans = { src: null, team: null, areas: [] };
  var SRC = { excel: 'Excel и мессенджеры', crm: 'Готовая CRM, её не хватает', kb: 'Платформа КБ', own: 'Самописная программа' };
  var TEAM = { s: 'до 10 человек', m: '10–50 человек', l: 'больше 50 человек' };
  function put(id, text, empty) {
    var el = $('#' + id), was = el.textContent;
    el.textContent = text; el.classList.toggle('empty', !!empty);
    if (!empty && was !== text) { el.classList.remove('new'); void el.offsetWidth; el.classList.add('new'); }
  }
  function recResult() {
    var n = ans.areas.length, fmt, plan = [], price;
    if (ans.src === 'kb') {
      fmt = 'Доработка действующей системы';
      plan.push('разбор текущей конфигурации');
      price = 'по прайсу — посчитайте в калькуляторе ниже';
    } else if (ans.src === 'excel' && ans.team === 's' && n === 1) {
      fmt = 'Внедрение готовой конфигурации';
      plan.push('подбор конфигурации под раздел «' + ans.areas[0] + '»');
      price = 'среднее внедрение — 350 000 ₽';
    } else {
      fmt = 'Персональная конфигурация под ключ';
      plan.push('разбор процессов и ТЗ');
      price = 'разработка от 100 000 ₽, точнее — после разбора задачи';
    }
    if (ans.src === 'excel') plan.push('перенос данных из таблиц');
    if (ans.src === 'crm' || ans.src === 'own') plan.push('перенос данных из старой системы');
    if (ans.team !== 's') plan.push('роли и права доступа по отделам');
    if (n > 1) plan.push('запуск по очереди: сначала «' + ans.areas[0] + '»');
    return { fmt: fmt, plan: plan.join('; '), price: price };
  }
  function renderRec() {
    var done = (ans.src ? 1 : 0) + (ans.team ? 1 : 0) + (ans.areas.length ? 1 : 0);
    $('#rec-fill').textContent = 'заполнено ' + done + ' из 3';
    put('rec-src', ans.src ? SRC[ans.src] : 'не выбрано', !ans.src);
    put('rec-team', ans.team ? TEAM[ans.team] : 'не выбрано', !ans.team);
    put('rec-areas', ans.areas.length ? ans.areas.join(', ') : 'не выбрано', !ans.areas.length);
    var ok = done === 3, r = ok ? recResult() : null, wait = 'появится после трёх ответов';
    put('rec-format', ok ? r.fmt : wait, !ok);
    put('rec-plan', ok ? r.plan : wait, !ok);
    put('rec-price', ok ? r.price : wait, !ok);
    $('#rec-send').setAttribute('aria-disabled', String(!ok));
  }
  $$('.pick fieldset').forEach(function (fs) {
    var q = fs.dataset.q, multi = fs.hasAttribute('data-multi');
    $$('.opt', fs).forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        if (multi) {
          var on = b.getAttribute('aria-pressed') !== 'true';
          b.setAttribute('aria-pressed', String(on));
          ans.areas = $$('.opt[aria-pressed="true"]', fs).map(function (o) { return o.dataset.v; });
        } else {
          $$('.opt', fs).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
          ans[q] = b.dataset.v;
        }
        renderRec();
      });
    });
  });
  $('#rec-send').addEventListener('click', function (e) {
    if (this.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    var r = recResult(), ta = $('#f-msg');
    var block = 'Карточка проекта с сайта:\n— учёт сейчас: ' + SRC[ans.src] + '\n— команда: ' + TEAM[ans.team] +
      '\n— разделы: ' + ans.areas.join(', ') + '\n— формат: ' + r.fmt;
    ta.value = (ta.value.replace(/Карточка проекта с сайта[\s\S]*?(?=\n\nРасчёт с сайта|$)/, '').trim() + '\n\n' + block).trim();
  });

  /* Подсветка текущего раздела в меню и кнопка на телефоне */
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('a', nav).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('cur', k === en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (sec) { spy.observe(sec); });
    var mcta = $('#mcta');
    new IntersectionObserver(function (es) { mcta.classList.toggle('off', es[0].isIntersecting); }, { threshold: 0.05 }).observe($('#lead'));
  }

  /* Форма заявки */
  var form = $('#lead-form'), msg = $('#form-msg');
  var agreeBox = $('#f-agree'), submitBtn = $('#f-submit');
  $('#f-page').value = location.href;
  function syncSubmit() { submitBtn.disabled = !agreeBox.checked; }
  agreeBox.addEventListener('change', syncSubmit);
  form.addEventListener('reset', function () { setTimeout(syncSubmit, 0); });
  syncSubmit();
  function show(text, ok) { msg.textContent = text; msg.className = 'form-msg ' + (ok ? 'ok' : 'bad'); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#f-name'), contact = $('#f-contact'), agree = $('#f-agree'), bad = false;
    [name, contact].forEach(function (f) { var er = !f.value.trim(); f.classList.toggle('err', er); if (er) bad = true; });
    if (bad) { show('Укажите имя и телефон или электронную почту — иначе мы не сможем ответить.', false); return; }
    if (!agree.checked) { show('Отметьте согласие на обработку персональных данных.', false); return; }
    var btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Отправляем…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'X-Requested-With': 'fetch' } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error || '');
        form.reset(); show('Заявка отправлена. Ответит человек, не бот, — в рабочее время.', true);
      })
      .catch(function () { show('Заявка не отправилась. Напишите нам на info@nocodecrm.ru.', false); })
      .then(function () { btn.textContent = 'Отправить заявку'; syncSubmit(); });
  });
})();
