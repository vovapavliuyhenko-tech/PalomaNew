/* ════════════════════════════════════════════════════════
   PALOMA CHECKOUT — полная логика
   Зависимости: cart-core.js (PalomaCart)
   ════════════════════════════════════════════════════════ */

(function PalomaCheckout() {
  "use strict";

  if (!document.body.classList.contains("checkout-page")) return;

  const CART_KEY = "paloma_cart_v3";
  const ORDER_KEY = "paloma_last_order";
  const DELIVERY_COST = 300;
  const FREE_DELIVERY = 10000;
  const CARD_COST = 100;

  const UPSELL_ITEMS = [
    {
      id: "upsell-card",
      name: "Открытка с текстом",
      price: 100,
      ph: "linear-gradient(135deg,#f0e8d8,#e0d0b8)",
      image: "",
    },
    {
      id: "upsell-vase",
      name: "Ваза для букета",
      price: 550,
      ph: "linear-gradient(135deg,#d8e8f0,#b8c8d8)",
      image: "",
    },
    {
      id: "upsell-coffee",
      name: "Кофе PALOMA",
      price: 280,
      ph: "linear-gradient(135deg,#d8c0a8,#a07848)",
      image: "",
    },
    {
      id: "upsell-choco",
      name: "Шоколад ручной работы",
      price: 350,
      ph: "linear-gradient(135deg,#c8a878,#785830)",
      image: "",
    },
    {
      id: "upsell-dessert",
      name: "Десерт дня",
      price: 320,
      ph: "linear-gradient(135deg,#e8c8b8,#c09878)",
      image: "",
    },
  ];

  const $grid = document.getElementById("coGrid");
  const $empty = document.getElementById("coEmpty");
  const $success = document.getElementById("coSuccess");
  const $items = document.getElementById("coItems");
  const $subtotal = document.getElementById("coSubtotal");
  const $deliveryTotal = document.getElementById("coDeliveryTotal");
  const $total = document.getElementById("coTotal");
  const $mobileTotal = document.getElementById("coMobileTotal");
  const $form = document.getElementById("coForm");
  const $upsellGrid = document.getElementById("coUpsellGrid");
  const $cardRow = document.getElementById("coCardRow");
  const $deliveryPrice = document.getElementById("coDeliveryPrice");
  const $mobileBar = document.getElementById("coMobileBar");

  function getCart() {
    if (window.PalomaCart?.getItems) {
      return window.PalomaCart.getItems();
    }
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function itemMedia(item) {
    if (item.image) {
      return `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">`;
    }
    const bg = item.bg || item.ph || "linear-gradient(135deg,#f0e8d8,#e0d0b8)";
    return `<div class="co-item__photo-ph" style="background:${esc(bg)};width:100%;height:100%;"></div>`;
  }

  function itemMeta(item) {
    const parts = [];
    if (item.size && item.size !== "—") parts.push(esc(item.size));
    if (item.addons?.length) {
      parts.push(esc(item.addons.filter(Boolean).join(", ")));
    }
    return parts.length
      ? `<p class="co-item__meta">${parts.join(" · ")}</p>`
      : "";
  }

  function renderItems(cart) {
    if (!$items) return;
    $items.innerHTML = "";

    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "co-item";
      li.dataset.id = item.id;

      li.innerHTML = `
        <div class="co-item__photo">${itemMedia(item)}</div>
        <div class="co-item__info">
          <p class="co-item__name">${esc(item.name)}</p>
          ${itemMeta(item)}
          <div class="co-item__qty">
            <button type="button" class="co-item__qty-btn" data-action="dec" data-id="${esc(item.id)}"
                    aria-label="Уменьшить количество">−</button>
            <span class="co-item__qty-num">${item.qty || 1}</span>
            <button type="button" class="co-item__qty-btn" data-action="inc" data-id="${esc(item.id)}"
                    aria-label="Увеличить количество">+</button>
          </div>
        </div>
        <div class="co-item__right">
          <span class="co-item__price">${((item.price || 0) * (item.qty || 1)).toLocaleString("ru-RU")} ₽</span>
          <button type="button" class="co-item__remove" data-action="remove" data-id="${esc(item.id)}"
                  aria-label="Удалить ${esc(item.name)} из заказа">Удалить</button>
          </div>
      `;
      $items.appendChild(li);
    });
  }

  function renderUpsell(cart) {
    if (!$upsellGrid) return;
    $upsellGrid.innerHTML = "";

    UPSELL_ITEMS.forEach((item) => {
      const inCart = cart.some((c) => c.id === item.id);
      const div = document.createElement("div");
      div.className = "co-upsell-card";

      const imgHtml = item.image
        ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">`
        : `<div style="background:${esc(item.ph)};width:100%;height:100%;"></div>`;

      div.innerHTML = `
        <div class="co-upsell-card__photo">${imgHtml}</div>
        <div class="co-upsell-card__body">
          <p class="co-upsell-card__name">${esc(item.name)}</p>
          <p class="co-upsell-card__price">${item.price.toLocaleString("ru-RU")} ₽</p>
          <button type="button" class="co-upsell-card__btn ${inCart ? "is-added" : ""}"
                  data-upsell-id="${esc(item.id)}"
                  ${inCart ? "disabled" : ""}>
            ${inCart ? "✓ Добавлено" : "Добавить"}
          </button>
        </div>
      `;
      $upsellGrid.appendChild(div);
    });
  }

  function getDeliveryType() {
    const checked = document.querySelector('[name="delivery_type"]:checked');
    return checked ? checked.value : "courier";
  }

  function hasCard() {
    const cb = document.getElementById("co-add-card");
    return cb && cb.checked;
  }

  function calcTotals(cart) {
    const subtotal = cart.reduce(
      (s, i) => s + (i.price || 0) * (i.qty || 1),
      0,
    );
    const deliveryType = getDeliveryType();
    const delivery =
      deliveryType === "pickup" || deliveryType === "ask_recipient"
        ? 0
        : subtotal >= FREE_DELIVERY
          ? 0
          : DELIVERY_COST;
    const cardCost = hasCard() ? CARD_COST : 0;
    const total = subtotal + delivery + cardCost;

    if ($subtotal) {
      $subtotal.textContent = subtotal.toLocaleString("ru-RU") + " ₽";
    }
    if ($deliveryTotal) {
      $deliveryTotal.textContent =
        delivery === 0
          ? deliveryType === "pickup"
            ? "Бесплатно"
            : "0 ₽"
          : delivery.toLocaleString("ru-RU") + " ₽";
    }
    if ($total) $total.textContent = total.toLocaleString("ru-RU") + " ₽";
    if ($mobileTotal) {
      $mobileTotal.textContent = total.toLocaleString("ru-RU") + " ₽";
    }
    if ($cardRow) $cardRow.hidden = !hasCard();

    return { subtotal, delivery, cardCost, total };
  }

  function updateView() {
    const cart = getCart();
    const empty = cart.length === 0;

    if ($grid) $grid.hidden = empty;
    if ($empty) $empty.hidden = !empty;
    if ($success) $success.hidden = true;
    if ($mobileBar) $mobileBar.hidden = empty;

    if (!empty) {
      renderItems(cart);
      renderUpsell(cart);
      calcTotals(cart);
    }
  }

  function handleDeliveryToggle() {
    const type = getDeliveryType();
    const $addrFields = document.getElementById("coAddressFields");
    if ($addrFields) {
      $addrFields.hidden = type !== "courier";
    }
    if ($deliveryPrice) {
      $deliveryPrice.textContent =
        type === "pickup" ? "Бесплатно" : DELIVERY_COST + " ₽";
    }
    calcTotals(getCart());
  }

  function cartAction(id, action) {
    if (!window.PalomaCart) return;
    if (action === "inc") window.PalomaCart.bumpQtyById(id, 1);
    else if (action === "dec") window.PalomaCart.bumpQtyById(id, -1);
    else if (action === "remove") window.PalomaCart.removeById(id);
    updateView();
  }

  function addUpsell(id) {
    const item = UPSELL_ITEMS.find((u) => u.id === id);
    const cart = getCart();
    if (!item || cart.some((c) => c.id === id)) return;

    const payload = {
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1,
      bg: item.ph,
      image: item.image,
      category: "upsell",
    };

    if (window.PalomaCart?.add) {
      window.PalomaCart.add(payload);
      window.PalomaCart.closeDrawer?.();
    } else {
      cart.push(payload);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
    updateView();
  }

  document.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest(
      '[data-action="inc"], [data-action="dec"], [data-action="remove"]',
    );
    if (qtyBtn && $items?.contains(qtyBtn)) {
      cartAction(qtyBtn.dataset.id, qtyBtn.dataset.action);
      return;
    }

    const upsellBtn = e.target.closest("[data-upsell-id]");
    if (upsellBtn) {
      addUpsell(upsellBtn.dataset.upsellId);
      return;
    }

    if (
      e.target.closest("#coSubmitBtn, #coMobileSubmit, #coSubmitMobile")
    ) {
      e.preventDefault();
      handleSubmit();
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.name === "delivery_type") {
      handleDeliveryToggle();
    }
    if (e.target.dataset.action === "toggle-recipient") {
      const fields = document.getElementById("coRecipientFields");
      if (fields) fields.hidden = e.target.value !== "other";
    }
    if (e.target.name === "time_type") {
      const interval = document.getElementById("coTimeInterval");
      const exact = document.getElementById("coTimeExact");
      if (interval) interval.hidden = e.target.value !== "interval";
      if (exact) exact.hidden = e.target.value !== "exact";
    }
    if (e.target.id === "co-add-card") {
      const tf = document.getElementById("coCardTextField");
      if (tf) tf.hidden = !e.target.checked;
      calcTotals(getCart());
    }
  });

  $form?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
  });

  document.addEventListener("paloma-cart-updated", updateView);

  function validateForm() {
    let valid = true;

    const rules = [
      {
        id: "co-name",
        errorId: "co-name-error",
        check: (v) => v.trim().length >= 2,
      },
      {
        id: "co-phone",
        errorId: "co-phone-error",
        check: (v) => v.replace(/\D/g, "").length >= 10,
      },
      {
        id: "co-date",
        errorId: "co-date-error",
        check: (v) => v.trim() !== "",
        skip: () => getDeliveryType() === "pickup",
      },
    ];

    rules.forEach((rule) => {
      if (rule.skip && rule.skip()) return;
      const input = document.getElementById(rule.id);
      const error = document.getElementById(rule.errorId);
      if (!input) return;
      const ok = rule.check(input.value);
      input.classList.toggle("is-error", !ok);
      if (error) error.hidden = ok;
      if (!ok) valid = false;
    });

    if (getDeliveryType() === "courier") {
      const addrInput = document.getElementById("co-address");
      if (addrInput && addrInput.value.trim().length < 5) {
        addrInput.classList.add("is-error");
      valid = false;
      } else if (addrInput) {
        addrInput.classList.remove("is-error");
      }
    }

    const recipientType = document.querySelector(
      '[name="recipient_type"]:checked',
    )?.value;
    if (recipientType === "other") {
      const recName = document.getElementById("co-recipient-name");
      if (recName && recName.value.trim().length < 2) {
        recName.classList.add("is-error");
      valid = false;
      } else if (recName) {
        recName.classList.remove("is-error");
      }
    }

    return valid;
  }

  function collectFormData() {
    const data = {};
    if ($form) {
      new FormData($form).forEach((v, k) => {
        data[k] = v;
      });
    }
    const payment = document.querySelector('[name="payment"]:checked');
    if (payment) data.payment = payment.value;
    return data;
  }

  function handleSubmit() {
    const cart = getCart();
    if (!cart.length) {
      updateView();
      return;
    }

    if (!validateForm()) {
      const firstError = document.querySelector(
        ".is-error, .co-error:not([hidden])",
      );
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const totals = calcTotals(cart);
    const orderId = "ORD-" + Date.now().toString(36).toUpperCase();

    const orderData = {
      id: orderId,
      date: new Date().toISOString(),
      items: cart.slice(),
      subtotal: totals.subtotal,
      delivery: totals.delivery,
      cardCost: totals.cardCost,
      total: totals.total,
      form: collectFormData(),
    };

    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(orderData));
    } catch {
      /* ignore */
    }

    if (window.PalomaCart?.emptyCart) {
      window.PalomaCart.emptyCart();
    } else {
      localStorage.removeItem(CART_KEY);
    }

    showSuccess(orderId);
  }

  function showSuccess(orderId) {
    if ($grid) $grid.hidden = true;
    if ($empty) $empty.hidden = true;
    if ($mobileBar) $mobileBar.hidden = true;
    if ($success) {
      $success.hidden = false;
      const numEl = document.getElementById("coSuccessOrderNum");
      if (numEl) numEl.textContent = "№ " + orderId;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initPayment(orderData) {
    /* TODO: ЮKassa — см. payment-config.js */
    console.log("[PALOMA] Payment initiated for order:", orderData.id);
    showSuccess(orderData.id);
  }

  function init() {
    updateView();
    handleDeliveryToggle();

    const dateInput = document.getElementById("co-date");
    if (dateInput) {
      dateInput.min = new Date().toISOString().split("T")[0];
    }

    $form?.querySelectorAll(".co-input").forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("is-error");
        const err = document.getElementById(input.id + "-error");
        if (err) err.hidden = true;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
