/* ════════════════════════════════════════════════════════
   cookie-consent.js — баннер согласия на использование cookie
   Показывается один раз до выбора. Выбор хранится в localStorage.
   Аналитика (Яндекс Метрика) включается только после «Принять» — opt-in по 152-ФЗ.
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var STORE_KEY = "paloma-cookie-consent";

  function getChoice() {
    try {
      return localStorage.getItem(STORE_KEY);
    } catch (e) {
      return "accepted"; // если хранилище недоступно — не мешаем
    }
  }

  function setChoice(value) {
    try {
      localStorage.setItem(STORE_KEY, value);
    } catch (e) {
      /* no-op */
    }
  }

  /* Яндекс Метрика ставит cookie, поэтому подключаем её только после «Принять»
     (152-ФЗ в ред. ФЗ-156, ФЗ-420). До этого вызовы ym() просто копятся в очереди
     и ничего никуда не уходят. Адрес счётчика кладёт сниппет в <head>. */
  function startMetrika() {
    var src = window.palomaMetrikaSrc;
    if (!src) return;
    for (var j = 0; j < document.scripts.length; j++) if (document.scripts[j].src === src) return;
    var k = document.createElement("script");
    k.async = true;
    k.src = src;
    document.head.appendChild(k);
  }

  function build() {
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.id = "cookieBar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Уведомление об использовании cookie");
    bar.innerHTML =
      '<div class="cookie-bar__inner">' +
      '<p class="cookie-bar__text">Используем cookie. Яндекс Метрика — только с вашего согласия. Подробнее — в ' +
      '<a href="cookies.html">политике cookie</a> и <a href="privacy.html">политике конфиденциальности</a>.</p>' +
      '<div class="cookie-bar__actions">' +
      '<button type="button" class="cookie-bar__btn cookie-bar__btn--accept" id="cookieAccept" data-cursor="hover">Принять</button>' +
      '<button type="button" class="cookie-bar__btn cookie-bar__btn--decline" id="cookieDecline" data-cursor="hover">Только необходимые</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(bar);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.classList.add("is-shown");
        /* место под уведомлением: кнопки внизу страницы (оформление заказа)
           можно докрутить выше него, а не нажимать сквозь него */
        var pad = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
        document.body.style.paddingBottom = (pad + bar.offsetHeight) + "px";
      });
    });

    function close(choice) {
      setChoice(choice);
      bar.classList.remove("is-shown");
      document.body.style.paddingBottom = "";
      window.setTimeout(function () {
        if (bar.parentNode) bar.parentNode.removeChild(bar);
      }, 600);
    }

    var accept = bar.querySelector("#cookieAccept");
    var decline = bar.querySelector("#cookieDecline");
    if (accept) accept.addEventListener("click", function () { close("accepted"); startMetrika(); });
    if (decline) decline.addEventListener("click", function () { close("necessary"); });
  }

  function init() {
    if (getChoice()) return; // выбор уже сделан
    if (document.getElementById("cookieBar")) return;
    /* На странице оформления заказа уведомление не показываем: на телефоне
       единственная кнопка «Оформить заказ» — в нижней панели, и уведомление
       её закрывало (13.11.2026). Согласие спросим на любой другой странице. */
    if (document.getElementById("coMobileBar") || document.getElementById("checkoutForm")) return;
    build();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
