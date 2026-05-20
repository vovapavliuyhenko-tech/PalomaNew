/* ════════════════════════════════════════════════════════
   payment-config.js — конфигурация оплаты PALOMA

   ВАЖНО: Только публичные настройки.
   Secret Key ЮKassa — только на backend/serverless.

   Архитектура:
   Frontend → POST /api/create-payment → Backend
           → ЮKassa API (Secret Key) → { paymentUrl }
   Frontend → redirect paymentUrl
   ЮKassa → /thank-you.html?orderId=...&status=success
   ════════════════════════════════════════════════════════ */

window.PALOMA_PAYMENT_CONFIG = {
  PAYMENT_ENDPOINT: "/api/create-payment",

  YUKASSA_SHOP_ID: "YOUR_SHOP_ID_HERE",

  TEST_MODE: true,

  RETURN_URL_SUCCESS: "thank-you.html",
  RETURN_URL_FAIL: "checkout.html?payment=failed",

  WHATSAPP_NUMBER: "79180000000",
  TELEGRAM_HANDLE: "paloma_novorossiysk",

  CITY: "Новороссийск",
  ADDRESS: "ул. Энгельса, 74",
};
