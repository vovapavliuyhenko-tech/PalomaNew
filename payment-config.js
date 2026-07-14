/* ════════════════════════════════════════════════════════
   payment-config.js — конфигурация онлайн-оплаты PALOMA

   ВАЖНО: только публичные значения. Секретный API-ключ Яндекс Пэй
   живёт исключительно в переменных окружения Cloud Function.

   Схема:
   checkout.js → POST <PAYMENT_ENDPOINT>?a=create → Cloud Function
               → Яндекс Пэй (Api-Key) → { paymentUrl }
   checkout.js → редирект на paymentUrl
   Яндекс Пэй → thank-you.html?orderId=…&paid=1
   Яндекс Пэй → POST <PAYMENT_ENDPOINT>?a=webhook (Callback URL в кабинете)
   ════════════════════════════════════════════════════════ */

window.PALOMA_PAYMENT_CONFIG = {
  /* Адрес Cloud Function. Пустая строка = онлайн-оплата выключена,
     чекаут молча работает как раньше (заявка менеджеру). */
  PAYMENT_ENDPOINT: "",

  MERCHANT_ID: "71f5bcc2-e0e2-4b81-af9d-fce2791ac84d",

  RETURN_URL_SUCCESS: "thank-you.html",
  RETURN_URL_FAIL: "checkout.html?payment=failed",
};
