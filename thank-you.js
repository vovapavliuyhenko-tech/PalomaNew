/* ════════════════════════════════════════════════════════
   thank-you.js — страница «Заказ сформирован» PALOMA
   ════════════════════════════════════════════════════════ */

(function initThankYou() {
  "use strict";

  if (!document.body.classList.contains("thank-you-page")) return;

  const STORAGE_ORDER = "paloma_last_order";
  const SESSION_SUCCESS = "paloma_checkout_success";
  const CFG = window.PALOMA_PAYMENT_CONFIG || {
    WHATSAPP_NUMBER: "79180000000",
    TELEGRAM_HANDLE: "paloma_novorossiysk",
    ADDRESS: "ул. Энгельса, 74",
  };

  const params = new URLSearchParams(window.location.search);
  const orderIdFromUrl = params.get("orderId");

  const orderIdEl = document.getElementById("tyOrderId");
  const emptyEl = document.getElementById("tyEmpty");
  const contentEl = document.getElementById("tyContent");

  const order = loadOrder();
  const canShow = canShowThankYou(orderIdFromUrl, order);

  if (!canShow) {
    showEmptyState();
    return;
  }

  const orderId = orderIdFromUrl || order.orderId;
  showSuccessState(orderId, order);

  const orderText = buildOrderText(order, orderId);
  const encoded = encodeURIComponent(orderText);

  document.getElementById("tyBtnWa")?.addEventListener("click", () => {
    const phone = String(CFG.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    window.open(
      `https://wa.me/${phone}?text=${encoded}`,
      "_blank",
      "noopener,noreferrer",
    );
  });

  document.getElementById("tyBtnTg")?.addEventListener("click", () => {
    window.open(
      `https://t.me/share/url?text=${encoded}`,
      "_blank",
      "noopener,noreferrer",
    );
  });

  function loadOrder() {
    try {
      const raw = localStorage.getItem(STORAGE_ORDER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function canShowThankYou(orderId, order) {
    if (!orderId || !order || order.orderId !== orderId) return false;
    if (sessionStorage.getItem(SESSION_SUCCESS) === orderId) return true;
    if (!order.createdAt) return false;
    const age = Date.now() - new Date(order.createdAt).getTime();
    return age >= 0 && age < 30 * 60 * 1000;
  }

  function showEmptyState() {
    if (orderIdEl) orderIdEl.textContent = "—";
    if (emptyEl) emptyEl.hidden = false;
    if (contentEl) contentEl.hidden = true;
  }

  function showSuccessState(orderId, order) {
    if (emptyEl) emptyEl.hidden = true;
    if (contentEl) contentEl.hidden = false;
    if (orderIdEl) orderIdEl.textContent = orderId;

    if (order?.items?.length) {
      const summaryEl = document.getElementById("tyOrderSummary");
      const itemsEl = document.getElementById("tyOrderItems");
      const totalEl = document.getElementById("tyOrderTotal");

      if (summaryEl) summaryEl.hidden = false;

      if (itemsEl) {
        itemsEl.innerHTML = order.items
          .map((item) => {
            const qty = item.qty || 1;
            const lineSum = (item.price * qty).toLocaleString("ru-RU");
            return `
          <div class="ty-order-summary__item">
            <span>${esc(item.name)}${item.size ? " · " + esc(item.size) : ""} × ${qty}</span>
            <span>${lineSum} ₽</span>
          </div>`;
          })
          .join("");
      }

      if (totalEl) {
        totalEl.textContent =
          (order.total || 0).toLocaleString("ru-RU") + " ₽";
      }
    }
  }

  function buildOrderText(o, id) {
    const delivMap = {
      pickup: `Самовывоз — ${CFG.ADDRESS || "ул. Энгельса, 74"}`,
      courier: "Доставка курьером",
    };
    const payMap = {
      bank_card: "Банковская карта (ЮKassa)",
      sbp: "СБП (ЮKassa)",
      yandex_pay: "Яндекс Пэй",
    };

    const itemLines = (o.items || []).map((i) => {
      const qty = i.qty || 1;
      const sum = (i.price * qty).toLocaleString("ru-RU");
      const sizePart = i.size && i.size !== "—" ? `, размер ${i.size}` : "";
      return `• ${i.name}${sizePart} — ${qty} шт. — ${sum} ₽`;
    });

    const lines = [
      "🌸 Заказ PALOMA flowers coffee you",
      "",
      `📋 Номер заказа: ${id}`,
      "",
      "📦 Товары:",
      itemLines.length ? itemLines.join("\n") : "—",
      "",
      `💰 Сумма: ${(o.total || 0).toLocaleString("ru-RU")} ₽`,
      "",
      `👤 Имя: ${o.customer?.name || "—"}`,
      `📞 Телефон: ${o.customer?.phone || "—"}`,
    ];

    if (o.customer?.email) {
      lines.push(`✉️ Email: ${o.customer.email}`);
    }
    if (o.customer?.messenger) {
      lines.push(`💬 Telegram/WhatsApp: ${o.customer.messenger}`);
    }

    if (o.recipient?.type === "other") {
      lines.push("");
      lines.push(
        `🎁 Получатель: ${o.recipient.name || "—"}${o.recipient.phone ? ", " + o.recipient.phone : ""}`,
      );
    }

    lines.push("");
    lines.push(
      `🚚 Способ получения: ${delivMap[o.delivery?.method] || o.delivery?.method || "—"}`,
    );

    if (o.delivery?.method === "courier" && o.delivery?.address) {
      lines.push(`📍 Адрес: ${o.delivery.address}`);
    }

    if (o.delivery?.courierComment) {
      lines.push(`🚪 Комментарий курьеру: ${o.delivery.courierComment}`);
    }

    if (o.delivery?.date) {
      lines.push(`📅 Дата: ${formatDateRu(o.delivery.date)}`);
    }

    if (o.delivery?.interval) {
      lines.push(`🕐 Интервал: ${o.delivery.interval}`);
    }

    lines.push("");
    lines.push(
      `💳 Способ оплаты: ${payMap[o.paymentMethod] || o.paymentMethod || "—"}`,
    );

    const commentParts = [];
    if (o.cardText) commentParts.push(`Открытка: ${o.cardText}`);
    if (o.comment) commentParts.push(o.comment);

    if (commentParts.length) {
      lines.push("");
      lines.push("📝 Комментарий:");
      lines.push(commentParts.join("\n"));
    }

    lines.push("");
    lines.push(
      "Прошу подтвердить состав, время и детали доставки. Спасибо!",
    );

    return lines.join("\n");
  }

  function formatDateRu(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    if (!d) return iso;
    return `${d}.${m}.${y}`;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
