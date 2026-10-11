/* ════════════════════════════════════════════════════════
   lead-send.js — отправка заявок с форм «Оформление» и «События»

   До этого обе формы складывали заявку только в localStorage браузера
   клиента и показывали «Спасибо» — до студии заявка не доходила вообще.
   Здесь отправляем её в ту же облачную функцию, что принимает заказы:
   она пишет заявку в базу (CRM) и шлёт менеджеру в Telegram.

   Приём на сервере: ?a=notify с kind: "event_lead" — обработчик уже есть.
   ════════════════════════════════════════════════════════ */
(function PalomaLeadSend() {
  "use strict";

  /* Номер заявки в том же формате, что у заказов: сервер проверяет
     ^[A-Za-z0-9-]{6,64}$ и по нему же заявка ложится в CRM. */
  function makeLeadId() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    const stamp =
      String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) +
      p(d.getHours()) + p(d.getMinutes());
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "LEAD-" + stamp + "-" + rnd;
  }

  const PAGE_TITLE = {
    events: "🎉 ЗАЯВКА — оформление события",
    "event-decoration": "🎉 ЗАЯВКА — оформление мероприятия",
    "wedding-piggy": "💍 ЗАЯВКА — свадебная копилка",
    "footer-call": "📞 ЗАЯВКА — обратный звонок",
    "bouquet-builder": "🎨 ЗАЯВКА — букет из конструктора",
    rent: "🪑 ЗАЯВКА — аренда декора",
  };

  const EVENT_TYPE = {
    wedding: "свадьба",
    birthday: "день рождения",
    corporate: "корпоратив",
    anniversary: "юбилей",
    other: "другое",
  };

  function buildText(p) {
    const lines = [PAGE_TITLE[p.page] || "🎉 ЗАЯВКА с сайта"];
    /* Форма обратного звонка в подвале собирает только телефон:
       пустая строка «Имя: —» в сообщении менеджеру только мешает. */
    if (p.name) lines.push("Имя: " + p.name);
    lines.push("Телефон: " + (p.phone || "—"));
    if (p.source) lines.push("Со страницы: " + p.source);
    if (p.messenger) lines.push("Связь: " + p.messenger);
    if (p.eventType) lines.push("Повод: " + (EVENT_TYPE[p.eventType] || p.eventType));
    if (p.date) lines.push((p.page === "bouquet-builder" ? "Когда нужен букет: " : p.page === "rent" ? "Даты аренды: " : "Дата события: ") + p.date);
    /* Конструктор букета присылает готовый состав отдельным блоком */
    if (p.details) lines.push("\n" + p.details);
    if (p.comment) lines.push("\nКомментарий:\n" + p.comment);
    return lines.join("\n");
  }

  /* Возвращает промис, который НИКОГДА не отклоняется: форма должна
     показать «Спасибо» даже если сеть подвела — заявка при этом
     останется в localStorage, как и раньше. */
  window.palomaSendLead = function (payload) {
    const endpoint = ((window.PALOMA_PAYMENT_CONFIG || {}).PAYMENT_ENDPOINT || "").trim();
    if (!endpoint) return Promise.resolve({ ok: false, reason: "no-endpoint" });

    const orderId = makeLeadId();
    const send = window.palomaFetch("?a=notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        orderId: orderId,
        kind: "event_lead",
        managerText: buildText(payload),
        clientName: payload.name || "",
        phone: payload.phone || "",
        messengerContact: payload.messenger || "",
        deliveryInfo: {
          date: payload.date || "",
          eventType: payload.eventType || "",
          comment: payload.comment || "",
          page: payload.page || "",
          source: payload.source || "",
        },
      }),
    })
      .then(function (r) { return { ok: r.ok, orderId: orderId }; })
      .catch(function () { return { ok: false, orderId: orderId }; });

    /* Не держим пользователя дольше 8 секунд: форма всё равно покажет
       «Спасибо», а запрос уйдёт в фоне (keepalive). */
    return Promise.race([
      send,
      new Promise(function (resolve) {
        window.setTimeout(function () { resolve({ ok: false, orderId: orderId, slow: true }); }, 24000);
      }),
    ]).then(function (res) {
      /* Сервер заявку не подтвердил (сбой облака) — не теряем её:
         предлагаем отправить тот же текст в WhatsApp или позвонить. */
      if (!res || !res.ok) offerMessenger(buildText(payload));
      return res;
    });
  };

  function offerMessenger(text) {
    if (document.getElementById("palomaLeadFallback")) return;
    var wa = "https://wa.me/79897707000?text=" + encodeURIComponent("Здравствуйте! " + String(text || "").slice(0, 3000));
    var btn = "display:block;text-align:center;border-radius:12px;padding:12px;margin-bottom:8px;text-decoration:none;font-weight:600;";
    var box = document.createElement("div");
    box.id = "palomaLeadFallback";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(27,26,24,.55);" +
      "display:flex;align-items:center;justify-content:center;padding:16px";
    box.innerHTML =
      '<div style="background:#fff;border-radius:18px;max-width:400px;width:100%;padding:22px 20px;' +
        'font:14px/1.5 Montserrat,Arial,sans-serif;color:#1B1A18;box-shadow:0 20px 60px rgba(0,0,0,.3)">' +
      '<div style="font-size:17px;font-weight:600;margin-bottom:8px">Заявка не отправилась</div>' +
      '<div style="font-size:13px;color:#555;margin-bottom:16px">Сервер сейчас не отвечает. ' +
        'Отправьте заявку нам в WhatsApp — текст уже готов — или позвоните.</div>' +
      '<a href="' + wa + '" target="_blank" rel="noopener" style="' + btn + 'background:#25D366;color:#fff">Отправить в WhatsApp</a>' +
      '<a href="tel:+79897707000" style="' + btn + 'border:1px solid #1B1A18;color:#1B1A18;margin-bottom:12px">Позвонить +7 989 770-70-00</a>' +
      '<button type="button" style="display:block;width:100%;background:none;border:0;color:#888;' +
        'font:inherit;font-size:12px;text-decoration:underline;cursor:pointer">Закрыть</button>' +
      "</div>";
    document.body.appendChild(box);
    box.querySelector("button").addEventListener("click", function () { box.remove(); });
  }
})();
