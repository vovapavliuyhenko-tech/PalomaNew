/* ════════════════════════════════════════════════════════
   cookie-consent.js — баннер согласия на использование cookie
   Показывается один раз до выбора. Выбор хранится в localStorage.
   Соответствует ст. 9 152-ФЗ (информирование + согласие).
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

  function build() {
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.id = "cookieBar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Уведомление об использовании cookie");
    bar.innerHTML =
      '<div class="cookie-bar__inner">' +
      '<p class="cookie-bar__text">Мы используем файлы cookie, чтобы сайт работал корректно и удобно. ' +
      "Оставаясь на сайте, вы соглашаетесь с обработкой cookie и данных в соответствии с " +
      '<a href="cookies.html">Политикой в отношении cookie</a> и ' +
      '<a href="privacy.html">Политикой конфиденциальности</a>.</p>' +
      '<div class="cookie-bar__actions">' +
      '<button type="button" class="cookie-bar__btn cookie-bar__btn--accept" id="cookieAccept" data-cursor="hover">Принять</button>' +
      '<button type="button" class="cookie-bar__btn cookie-bar__btn--decline" id="cookieDecline" data-cursor="hover">Только необходимые</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(bar);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.classList.add("is-shown");
      });
    });

    function close(choice) {
      setChoice(choice);
      bar.classList.remove("is-shown");
      window.setTimeout(function () {
        if (bar.parentNode) bar.parentNode.removeChild(bar);
      }, 600);
    }

    var accept = bar.querySelector("#cookieAccept");
    var decline = bar.querySelector("#cookieDecline");
    if (accept) accept.addEventListener("click", function () { close("accepted"); });
    if (decline) decline.addEventListener("click", function () { close("necessary"); });
  }

  function init() {
    if (getChoice()) return; // выбор уже сделан
    if (document.getElementById("cookieBar")) return;
    build();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
