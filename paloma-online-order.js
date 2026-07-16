/* ════════════════════════════════════════════════════════
   paloma-online-order.js — онлайн-оплата «свободных сумм»
   (цветочная подписка, подарочный сертификат, свадебная копилка).

   Схема: страница собирает состав заказа → palomaPayOnline() выставляет
   счёт в PayKeeper через ту же Cloud Function, что и корзина, и
   перекидывает на оплату картой. После успешной оплаты PayKeeper
   возвращает на thank-you.html?paid=1, а оттуда — сразу в WhatsApp
   менеджеру с полным составом заказа (см. thank-you.js, ветка order.custom).

   Если онлайн-оплата не настроена или счёт не выставился — не теряем
   заказ: открываем WhatsApp с просьбой прислать ссылку на оплату.
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var MANAGER_WA = "79897707000";

  function waLink(text) {
    return "https://wa.me/" + MANAGER_WA + "?text=" + encodeURIComponent(text);
  }

  function makeOrderId() {
    var raw = "ORD-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return raw.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 40);
  }

  /* opts: { id, name, total, details }
     details — текст с составом заказа, БЕЗ строки про оплату
     (её добавит thank-you после оплаты либо фолбэк ниже). */
  window.palomaPayOnline = function (opts) {
    var total = Math.round(Number(opts.total) || 0);
    var endpoint = ((window.PALOMA_PAYMENT_CONFIG || {}).PAYMENT_ENDPOINT || "").trim();
    var orderId = makeOrderId();

    /* заказ для thank-you: message — готовый текст, custom — метка спец-заказа */
    var order = {
      id: orderId,
      items: [{ id: opts.id, name: opts.name, price: total, qty: 1 }],
      total: total,
      form: {},
      messenger: "whatsapp",
      message: opts.details,
      custom: true,
      payment: "online",
      paid: false,
    };
    try {
      localStorage.setItem("paloma_last_order", JSON.stringify(order));
    } catch (e) {
      /* ignore */
    }

    var fallback = opts.details + "\n\nПришлите, пожалуйста, ссылку на оплату.";

    /* онлайн-оплата выключена → старое поведение (заявка менеджеру) */
    if (!endpoint) {
      window.location.href = waLink(fallback);
      return;
    }

    fetch(endpoint + "?a=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: orderId,
        items: [{ id: opts.id, name: opts.name, price: total, qty: 1 }],
        delivery: 0,
      }),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return {};
        });
      })
      .then(function (d) {
        if (!d || !d.paymentUrl) throw new Error((d && d.error) || "no url");
        window.location.href = d.paymentUrl;
      })
      .catch(function () {
        /* счёт не выставился → не теряем заказ, уводим в WhatsApp за ссылкой */
        window.location.href = waLink(fallback);
      });
  };
})();
