/* ════════════════════════════════════════════════════════
   payment-config.js — конфигурация онлайн-оплаты PALOMA

   Эквайринг: PayKeeper (АО «Альфа-Банк»), сервер paloma.server.paykeeper.ru

   ВАЖНО: только публичные значения. Логин/пароль от ЛК PayKeeper и
   секретное слово живут исключительно в переменных окружения
   Cloud Function — в сайт они не попадают.

   Схема:
   checkout.js → POST <PAYMENT_ENDPOINT>?a=create → Cloud Function
               → PayKeeper (Basic-авторизация) → { paymentUrl }
   checkout.js → редирект на paymentUrl (страница оплаты картой)
   PayKeeper  → thank-you.html?paid=1            (URL успешной оплаты в ЛК)
   PayKeeper  → POST <PAYMENT_ENDPOINT>?a=webhook (POST-оповещения в ЛК)
   ════════════════════════════════════════════════════════ */

window.PALOMA_PAYMENT_CONFIG = {
  /* Адрес Cloud Function. Пустая строка = онлайн-оплата выключена,
     чекаут молча работает как раньше (заявка менеджеру). */
  /* Функция в Яндекс Облаке (рядом с PayKeeper — счёт выставляется за ~0.7 с;
     Netlify зависал на 30 с из-за зарубежных серверов и был отброшен). */
  PAYMENT_ENDPOINT: "https://palomanew.onrender.com",

  RETURN_URL_SUCCESS: "thank-you.html?paid=1",
  RETURN_URL_FAIL: "checkout.html?payment=failed",
};

/* ════════════════════════════════════════════════════════
   РЕЗЕРВНЫЙ СЕРВЕР. Если Яндекс Облако недоступно (сбой 11.10.2026),
   заказы, заявки и оплата идут через резервный сервер (Cloudflare Worker,
   paykeeper/backup-worker.js). Пустая строка — резерв выключен.
   ════════════════════════════════════════════════════════ */
window.PALOMA_PAYMENT_CONFIG.BACKUP_ENDPOINT = "";

/* palomaFetch("?a=create", init) — запрос сначала к основному серверу,
   при обрыве или молчании дольше 7 с — к резервному. Если основной уже
   падал за последние 5 минут, сразу идём в резерв (не заставляем ждать). */
window.palomaFetch = function (query, init) {
  var cfg = window.PALOMA_PAYMENT_CONFIG || {};
  var main = String(cfg.PAYMENT_ENDPOINT || "").trim();
  var backup = String(cfg.BACKUP_ENDPOINT || "").trim();
  var DOWN_KEY = "paloma_api_down";
  var downAt = 0;
  try { downAt = Number(sessionStorage.getItem(DOWN_KEY)) || 0; } catch (e) { /* приватный режим */ }
  var mainDown = backup && Date.now() - downAt < 5 * 60 * 1000;
  var list = [];
  if (main && !mainDown) list.push({ url: main, ms: backup ? 7000 : 60000, main: true });
  if (backup) list.push({ url: backup, ms: 15000 });
  if (main && mainDown) list.push({ url: main, ms: 15000, main: true });

  function attempt(i) {
    if (i >= list.length) return Promise.reject(new Error("сервер не отвечает"));
    var t = list[i];
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, t.ms) : 0;
    var opts = {};
    for (var k in init || {}) opts[k] = init[k];
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(t.url + query, opts).then(function (res) {
      clearTimeout(timer);
      if (t.main) { try { sessionStorage.removeItem(DOWN_KEY); } catch (e) { /* ок */ } }
      return res;
    }, function (err) {
      clearTimeout(timer);
      if (t.main) { try { sessionStorage.setItem(DOWN_KEY, String(Date.now())); } catch (e) { /* ок */ } }
      if (i + 1 < list.length) return attempt(i + 1);
      throw err;
    });
  }
  return attempt(0);
};

/* Бесплатный сервер Render засыпает после 15 минут тишины и просыпается
   до минуты. Будим его заранее — при открытии любой страницы с корзиной,
   чтобы к моменту оформления заказа он уже отвечал. */
(function () {
  try {
    var ep = String((window.PALOMA_PAYMENT_CONFIG || {}).PAYMENT_ENDPOINT || "");
    if (ep && typeof fetch === "function") fetch(ep + "?a=ping", { cache: "no-store" }).catch(function () {});
  } catch (e) { /* не мешаем странице */ }
})();
