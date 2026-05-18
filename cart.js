/* PALOMA — cart.html (работает с window.PalomaCart в script.js) */
(function PalomaCartPage() {
  "use strict";

  const WA_NUMBER = "79180000000";
  const TG_USERNAME = "paloma_novorossiysk";

  const ADDONS = [
    {
      id: "addon-coffee",
      name: "Кофе к букету",
      price: 250,
      bg: "linear-gradient(135deg, #5c3d28, #8a6248)",
      category: "coffee",
    },
    {
      id: "addon-dessert",
      name: "Десерт из витрины",
      price: 320,
      bg: "linear-gradient(135deg, #c4a882, #8a6248)",
      category: "coffee",
    },
    {
      id: "addon-card",
      name: "Открытка",
      price: 150,
      bg: "linear-gradient(135deg, #d4bcc8, #8a5858)",
      category: "gift",
    },
    {
      id: "addon-vase",
      name: "Ваза",
      price: 600,
      bg: "linear-gradient(135deg, #e0d4bc, #9c8268)",
      category: "gift",
    },
    {
      id: "addon-bag",
      name: "Фирменный пакет",
      price: 100,
      bg: "linear-gradient(135deg, #c4a8b4, #7a4850)",
      category: "gift",
    },
    {
      id: "addon-cert",
      name: "Подарочный сертификат",
      price: 500,
      bg: "linear-gradient(135deg, #b4a4c4, #6a4870)",
      category: "gift",
    },
  ];

  const cartEmpty = document.getElementById("cartEmpty");
  const cartContent = document.getElementById("cartContent");
  const summaryItems = document.getElementById("cartSummaryItems");
  const summaryTotal = document.getElementById("cartSummaryTotal");
  const addonsList = document.getElementById("cartAddonsList");
  const deliveryRadios = document.querySelectorAll('[name="delivery"]');
  const deliveryFields = document.getElementById("deliveryFields");
  const onlineNotice = document.getElementById("onlineNotice");
  const submitBtn = document.getElementById("cartSubmitBtn");
  const modal = document.getElementById("cartSuccessModal");
  const sendWa = document.getElementById("sendToWhatsapp");
  const sendTg = document.getElementById("sendToTelegram");

  const cartApi = window.PalomaCart;

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getItems() {
    return cartApi ? cartApi.getItems() : [];
  }

  function calcTotal(items) {
    return items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  }

  function syncDeliveryFieldsVisibility() {
    const sel = document.querySelector('[name="delivery"]:checked');
    if (!deliveryFields) return;
    deliveryFields.hidden = !sel || sel.value !== "courier";
  }

  deliveryRadios.forEach((radio) => {
    radio.addEventListener("change", syncDeliveryFieldsVisibility);
  });

  let lastEncodedMessage = "";

  function renderAddons() {
    if (!addonsList) return;
    addonsList.innerHTML = ADDONS.map(
      (a) => `
      <div class="cart-addon-card">
        <div class="cart-addon-card__img" style="background: ${escHtml(a.bg)};"></div>
        <div class="cart-addon-card__name">${escHtml(a.name)}</div>
        <div class="cart-addon-card__price">
          ${a.price.toLocaleString("ru-RU")} ₽
        </div>
        <button type="button" class="cart-addon-card__add" data-addon-id="${escHtml(
          a.id
        )}">
          Добавить
        </button>
      </div>`
    ).join("");

    addonsList.querySelectorAll("[data-addon-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const addon = ADDONS.find((x) => x.id === btn.dataset.addonId);
        if (addon && cartApi)
          cartApi.add({
            id: addon.id,
            name: addon.name,
            price: addon.price,
            qty: 1,
            bg: addon.bg,
            category: addon.category,
            addons: [],
            size: "S",
          });
        refresh();
      });
    });
  }

  function refresh() {
    cartApi?.reloadFromStorage?.();
    const items = getItems();

    document.querySelectorAll(".site-header__cart-count").forEach((el) => {
      const count = items.reduce((s, i) => s + (i.qty || 1), 0);
      el.textContent = String(count);
      el.classList.toggle("is-empty", count === 0);
    });

    if (!cartEmpty || !cartContent || !summaryItems || !summaryTotal) return;

    if (!items.length) {
      cartEmpty.hidden = false;
      cartContent.hidden = true;
      return;
    }

    cartEmpty.hidden = true;
    cartContent.hidden = false;

    if (onlineNotice) {
      const hasOnline = items.some((i) => i.category === "online");
      onlineNotice.hidden = !hasOnline;
    }

    summaryItems.innerHTML = items
      .map((item) => {
        const meta = [`Размер ${item.size || "S"}`];
        if (item.addons && item.addons.length)
          meta.push(item.addons.filter(Boolean).join(", "));
        const metaStr = meta.filter(Boolean).join(" · ");

        return `
      <div class="cart-summary-item" data-id="${escHtml(item.id)}">
        <div class="cart-summary-item__img" style="background: ${
          item.bg ? escHtml(item.bg) : "var(--color-bg-alt)"
        };"></div>
        <div class="cart-summary-item__info">
          <div class="cart-summary-item__name">${escHtml(item.name)}</div>
          <div class="cart-summary-item__qty">
            <button type="button" class="cart-qty-btn" data-cart-qty="${
              item.id
            }" data-delta="-1" aria-label="Уменьшить">−</button>
            <span class="cart-qty-val">${item.qty || 1}</span>
            <button type="button" class="cart-qty-btn" data-cart-qty="${
              item.id
            }" data-delta="1" aria-label="Увеличить">+</button>
          </div>
          ${
            metaStr
              ? `<div style="font-size:12px;color:var(--color-text-muted)">${escHtml(
                  metaStr
                )}</div>`
              : ""
          }
        </div>
        <div class="cart-summary-item__price-col">
          <span class="cart-summary-item__price">
            ${(item.price * (item.qty || 1)).toLocaleString("ru-RU")} ₽
          </span>
          <button type="button" class="cart-summary-item__remove" data-cart-remove="${
            item.id
          }">
            Удалить
          </button>
        </div>
      </div>`;
      })
      .join("");

    summaryItems.querySelectorAll("[data-cart-qty]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-cart-qty");
        const delta = parseInt(btn.getAttribute("data-delta"), 10) || 0;
        cartApi?.bumpQtyById?.(id, delta);
        refresh();
      });
    });

    summaryItems.querySelectorAll("[data-cart-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        cartApi?.removeById?.(btn.getAttribute("data-cart-remove"));
        refresh();
      });
    });

    summaryTotal.textContent =
      calcTotal(items).toLocaleString("ru-RU") + " ₽";
    syncDeliveryFieldsVisibility();
    window.palomaRebindCursorHovers?.();
  }

  function collectFormData() {
    const g = (id) => (document.getElementById(id)?.value || "").trim();
    const r = (name) => {
      const el = document.querySelector(`input[name="${name}"]:checked`);
      return el ? el.value : "";
    };
    return {
      name: g("cf-name"),
      phone: g("cf-phone"),
      telegram: g("cf-telegram"),
      email: g("cf-email"),
      contactMethod: r("contact_method"),
      recipientName: g("cf-rec-name"),
      recipientPhone: g("cf-rec-phone"),
      delivery: r("delivery"),
      address: g("cf-address"),
      courierNote: g("cf-courier-note"),
      date: g("cf-date"),
      interval: document.getElementById("cf-interval")?.value || "",
      cardText: g("cf-card-text"),
      comment: g("cf-comment"),
      payment: r("payment"),
    };
  }

  function validate(d) {
    const errors = [];
    if (!d.name) errors.push("Укажите имя");
    if (!d.phone) errors.push("Укажите телефон");
    if (!d.delivery) errors.push("Выберите способ доставки");
    if (d.delivery === "courier") {
      if (!d.address) errors.push("Укажите адрес доставки");
      if (!d.date) errors.push("Укажите дату доставки");
      if (!d.interval) errors.push("Выберите интервал доставки");
    }
    if (!d.payment) errors.push("Выберите способ оплаты");
    return errors;
  }

  function contactRu(v) {
    const map = {
      telegram: "Telegram",
      whatsapp: "WhatsApp",
      call: "Звонок",
      nocontact: "Не связываться без необходимости",
    };
    return map[v] || v;
  }

  function buildMessageRaw(d, items) {
    const total = calcTotal(items);
    const itemsText = items
      .map((i) => {
        let line = `• ${i.name} × ${i.qty || 1} — ${(
          i.price *
          (i.qty || 1)
        ).toLocaleString("ru-RU")} ₽`;
        const bits = [`размер ${i.size || "S"}`];
        if (i.addons?.length)
          bits.push(i.addons.filter(Boolean).join(", "));
        if (bits.length) line += ` (${bits.join("; ")})`;
        return line;
      })
      .join("\n");

    const deliveryMap = {
      pickup: "Самовывоз — Энгельса, 74",
      ask: "Уточнить адрес у получателя",
      courier: `Курьером: ${d.address}${d.courierNote ? `, ${d.courierNote}` : ""}`,
    };
    const paymentMap = {
      card: "Карта или СБП через ЮKassa",
      transfer: "Перевод после подтверждения",
      cash: "Наличные/карта при самовывозе",
      prepay: "Предоплата — свадьбы / цветочное оформление",
    };

    return [
      "🌸 Заказ PALOMA flowers coffee you",
      "",
      "📦 Состав:",
      itemsText,
      "",
      `💰 Итого: ${total.toLocaleString("ru-RU")} ₽`,
      "",
      `👤 Заказчик: ${d.name}`,
      `📞 Телефон: ${d.phone}`,
      d.telegram ? `✈️ Telegram: ${d.telegram}` : "",
      d.email ? `📧 Email: ${d.email}` : "",
      `💬 Способ связи: ${contactRu(d.contactMethod)}`,
      "",
      d.recipientName
        ? `👤 Получатель: ${d.recipientName} ${d.recipientPhone || ""}`.trim()
        : "",
      "",
      `🚚 Доставка: ${deliveryMap[d.delivery] || d.delivery}`,
      d.date ? `📅 Дата: ${d.date}` : "",
      d.interval ? `🕐 Интервал: ${d.interval}` : "",
      "",
      `💳 Оплата: ${paymentMap[d.payment] || d.payment}`,
      "",
      d.cardText ? `💌 Текст открытки: ${d.cardText}` : "",
      d.comment ? `📝 Комментарий: ${d.comment}` : "",
    ]
      .filter((l) => l !== "")
      .join("\n");
  }

  submitBtn?.addEventListener("click", () => {
    const d = collectFormData();
    const err = validate(d);
    if (err.length) {
      let errEl = document.getElementById("cartCheckoutErrors");
      if (!errEl) {
        errEl = document.createElement("div");
        errEl.id = "cartCheckoutErrors";
        errEl.className = "cart-checkout-errors";
        errEl.setAttribute("role", "alert");
        submitBtn.parentElement?.insertBefore(errEl, submitBtn);
      }
      errEl.textContent = err[0];
      errEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    document.getElementById("cartCheckoutErrors")?.remove();

    const items = getItems();
    lastEncodedMessage = encodeURIComponent(
      window.PalomaCart && typeof window.PalomaCart.generateMessage === "function"
        ? window.PalomaCart.generateMessage(d)
        : buildMessageRaw(d, items),
    );

    if (modal) {
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  });

  modal?.querySelectorAll("[data-cart-modal-close]").forEach((el) => {
    el.addEventListener("click", () => {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    });
  });

  sendWa?.addEventListener("click", () => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${lastEncodedMessage}`, "_blank");
  });

  sendTg?.addEventListener("click", () => {
    const u = TG_USERNAME.replace(/^@/, "");
    window.open(`https://t.me/${u}?text=${lastEncodedMessage}`, "_blank");
  });

  refresh();
  renderAddons();
})();
