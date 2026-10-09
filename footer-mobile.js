/* ════════════════════════════════════════════════════════
   footer-mobile.js — подвал на телефоне: крупный телефон и мессенджеры
   сверху, ниже — раскрывающиеся разделы («+» поворачивается в «×»).

   Собирается из того же подвала, что видит компьютер (.sf2): ссылки и
   контакты берутся оттуда, поэтому правка в подвале страницы сразу
   попадает и в мобильный вид. Форма обратного звонка не копируется,
   а переносится — её обработчики (script.js) остаются рабочими.
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var foot = document.querySelector(".site-footer");
  var sf2 = foot && foot.querySelector(".sf2");
  if (!sf2 || foot.querySelector(".sfm")) return;

  var MAP_URL = "https://yandex.ru/maps/?text=" + encodeURIComponent("Новороссийск, улица Энгельса, 74/82, PALOMA");

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function section(title, body, open) {
    var d = el("details", "sfm-sec");
    if (open) d.open = true;
    var s = el("summary", "sfm-sec__head");
    s.appendChild(el("span", null, title));
    s.appendChild(el("span", "sfm-sec__plus", ""));
    s.lastChild.setAttribute("aria-hidden", "true");
    d.appendChild(s);
    body.classList.add("sfm-sec__body");
    d.appendChild(body);
    return d;
  }
  function linkList(nav) {
    var box = el("div", "sfm-links");
    if (nav) nav.querySelectorAll(".sf2-links a").forEach(function (a) { box.appendChild(a.cloneNode(true)); });
    return box;
  }

  var navs = sf2.querySelectorAll(".sf2-col--nav");
  var phone = sf2.querySelector(".sf2-phone");
  var hours = sf2.querySelector(".sf2-phone + .sf2-undertext");
  var addr = sf2.querySelector(".sf2-addr");
  var studio = addr && addr.nextElementSibling;

  var box = el("div", "sfm");

  /* Верх: телефон и мессенджеры */
  var top = el("div", "sfm-top");
  if (phone) { var p = phone.cloneNode(true); p.className = "sfm-phone"; top.appendChild(p); }
  var icons = el("div", "sfm-icons");
  sf2.querySelectorAll(".sf2-round__btn").forEach(function (a) { var c = a.cloneNode(true); c.className = "sfm-icon"; icons.appendChild(c); });
  top.appendChild(icons);
  box.appendChild(top);
  if (hours) box.appendChild(el("p", "sfm-hours", hours.innerHTML));

  /* Разделы */
  var acc = el("div", "sfm-acc");
  if (navs[0]) acc.appendChild(section(navs[0].querySelector(".sf2-head") ? navs[0].querySelector(".sf2-head").textContent : "Каталог", linkList(navs[0])));
  if (navs[1]) acc.appendChild(section(navs[1].querySelector(".sf2-head") ? navs[1].querySelector(".sf2-head").textContent : "Информация", linkList(navs[1])));

  var where = el("div", "sfm-text");
  if (addr) where.appendChild(el("a", "sfm-addr", addr.innerHTML.replace(/<br\s*\/?>/gi, " ")));
  if (where.firstChild) { where.firstChild.href = MAP_URL; where.firstChild.target = "_blank"; where.firstChild.rel = "noopener noreferrer"; }
  if (studio && studio.classList.contains("sf2-undertext")) where.appendChild(el("p", "sfm-note", studio.innerHTML));
  if (hours) where.appendChild(el("p", "sfm-note", hours.innerHTML));
  var route = el("a", "sfm-route", "Построить маршрут →");
  route.href = MAP_URL; route.target = "_blank"; route.rel = "noopener noreferrer";
  where.appendChild(route);
  acc.appendChild(section("Адрес и часы", where));

  var socs = el("div", "sfm-links sfm-links--one");
  sf2.querySelectorAll(".sf2-soc").forEach(function (a) {
    var c = el("a", null, (a.querySelector(".sf2-soc__name") || a).textContent);
    c.href = a.href; c.target = "_blank"; c.rel = "noopener noreferrer";
    socs.appendChild(c);
  });
  var maxBtn = sf2.querySelector('.sf2-round__btn[aria-label="Макс"]');
  if (maxBtn) { var m = el("a", null, "MAX"); m.href = maxBtn.href; m.target = "_blank"; m.rel = "noopener noreferrer"; socs.appendChild(m); }
  if (socs.children.length) acc.appendChild(section("Соцсети и мессенджеры", socs));

  /* Обратный звонок: переносим живую форму (на компьютере — обратно) */
  var sub = sf2.querySelector(".sf2-sub");
  var lead = sf2.querySelector(".sf2-lead");
  var call = el("div", "sfm-text");
  if (lead) call.appendChild(el("p", "sfm-note", lead.innerHTML.replace(/<br\s*\/?>/gi, " ")));
  var slot = el("div", "sfm-form");
  call.appendChild(slot);
  if (sub) acc.appendChild(section("Обратный звонок", call));

  /* Документы: политика, оферта, cookie и копирайт — раздел-кнопками, как всё
     остальное; внизу подвала на телефоне остаётся только «Разработчик». */
  var legal = foot.querySelector(".footer-legal");
  if (legal) {
    var docs = el("div", "sfm-docs");
    legal.querySelectorAll("a:not(.sf2-dev)").forEach(function (a) { var c = a.cloneNode(true); c.className = "sfm-doc"; docs.appendChild(c); });
    var copy = foot.querySelector(".footer-copy");
    if (copy) docs.appendChild(el("p", "sfm-docs__copy", copy.innerHTML));
    if (docs.children.length) acc.appendChild(section("Документы", docs));
  }
  box.appendChild(acc);


  sf2.parentNode.insertBefore(box, sf2.nextSibling);

  if (sub && window.matchMedia) {
    var home = sub.parentNode, after = sub.nextSibling;
    var mq = window.matchMedia("(max-width: 640px)");
    var place = function () {
      if (mq.matches) { if (sub.parentNode !== slot) slot.appendChild(sub); }
      else if (sub.parentNode !== home) home.insertBefore(sub, after);
    };
    place();
    if (mq.addEventListener) mq.addEventListener("change", place); else if (mq.addListener) mq.addListener(place);
  }
})();

/* Жираф на телефоне: движение слева направо ведёт скрипт (а не CSS-анимация) —
   на части iPhone расчёт пути в CSS не срабатывал, и жираф шагал на месте.
   Плавно появляется у левого края, идёт и растворяется у правого. Ноги
   шагают по-прежнему через CSS. Кадры считаются, только пока подвал виден. */
(function () {
  "use strict";
  var g = document.querySelector(".footer-giraffe");
  if (!g || !window.matchMedia || !window.requestAnimationFrame) return;
  var mq = window.matchMedia("(max-width: 700px)");
  var SPEED = 34;          /* px в секунду */
  var x = 4, last = 0, raf = 0, visible = true;

  function bounds() {
    var host = g.parentElement;
    var max = (host ? host.clientWidth : window.innerWidth) - g.offsetWidth - 4;
    return max > 8 ? max : 8;
  }
  function frame(t) {
    raf = 0;
    if (!mq.matches) return;
    if (last) x += SPEED * Math.min(0.05, (t - last) / 1000);
    last = t;
    var max = bounds();
    if (x >= max) x = 4;
    var fade = 26, op = Math.min(1, (x - 4) / fade, (max - x) / fade);
    g.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
    g.style.opacity = op < 0 ? 0 : op.toFixed(2);
    if (visible) raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!mq.matches) { g.style.removeProperty("animation"); g.style.transform = ""; g.style.opacity = ""; return; }
    g.style.setProperty("animation", "none", "important");
    if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); }
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible) start(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }).observe(g.closest(".site-footer") || g);
  }
  if (mq.addEventListener) mq.addEventListener("change", start); else if (mq.addListener) mq.addListener(start);
  start();
})();
