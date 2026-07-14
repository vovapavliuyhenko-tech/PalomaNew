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
  PAYMENT_ENDPOINT: "",

  RETURN_URL_SUCCESS: "thank-you.html?paid=1",
  RETURN_URL_FAIL: "checkout.html?payment=failed",
};
