/* ════════════════════════════════════════════════════════
   checkout.js — оформление заказа PALOMA
   ════════════════════════════════════════════════════════ */

(function initCheckout() {
  "use strict";

  if (!document.body.classList.contains("checkout-page")) return;

  const form = document.getElementById("checkoutForm");
  const emptyEl = document.getElementById("checkoutEmpty");
  const layoutEl = document.getElementById("checkoutLayout");
  const loadingEl = document.getElementById("checkoutLoading");
  const loadingText = document.getElementById("checkoutLoadingText");
  const summaryItems = document.getElementById("checkoutSummaryItems");
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const totalEl = document.getElementById("checkoutTotal");
  const failedBanner = document.getElementById("paymentFailedBanner");
  const failedClose = document.getElementById("paymentFailedClose");
  const cardTextArea = document.getElementById("cf-card-text");
  const cardTextCount = document.getElementById("cardTextCount");
  const recipientRadios = form?.querySelectorAll('[name="recipient-type"]');
  const recipientOther = document.getElementById("recipientOtherFields");
  const deliveryRadios = form?.querySelectorAll('[name="delivery"]');
  const courierFields = document.getElementById("courierFields");

  const CFG = window.PALOMA_PAYMENT_CONFIG || {
    TEST_MODE: true,
    PAYMENT_ENDPOINT: "/api/create-payment",
    RETURN_URL_SUCCESS: "thank-you.html",
    RETURN_URL_FAIL: "checkout.html?payment=failed",
    WHATSAPP_NUMBER: "79180000000",
    TELEGRAM_HANDLE: "paloma_novorossiysk",
    CITY: "Новороссийск",
  };

  const CART_KEY = "paloma_cart_v3";

  let items = [];

  function init() {
    items = window.PalomaCart
      ? window.PalomaCart.getItems()
      : _loadCartFallback();

    if (!items.length) {
      showEmpty();
      return;
    }

    const dateInput = document.getElementById("cf-date");
    if (dateInput) {
      dateInput.min = new Date().toISOString().split("T")[0];
    }

    renderSummary();
    initRecipientToggle();
    initDeliveryToggle();
    initCardTextCounter();
    initPaymentFailedBanner();
    initFormSubmit();
    initFieldClearOnInput();
  }

  function showEmpty() {
    if (emptyEl) emptyEl.hidden = false;
    if (layoutEl) layoutEl.hidden = true;
    if (failedBanner) failedBanner.hidden = true;
  }

  function renderSummary() {
    if (!summaryItems) return;

    summaryItems.innerHTML = items
      .map((item) => {
        const lineTotal = (item.price * (item.qty || 1)).toLocaleString(
          "ru-RU",
        );
        const mediaStyle = `background:${esc(item.bg || "var(--color-bg-alt)")};`;
        const imgHtml = item.image
          ? `<img src="${esc(item.image)}" alt="${esc(item.name)}"
                loading="lazy" class="checkout-summary__item-img"
                onerror="this.style.display='none'">`
          : "";
        return `
        <div class="checkout-summary__item">
          <div class="checkout-summary__item-media"
               style="${mediaStyle}" aria-hidden="true">
            ${imgHtml}
          </div>
          <div class="checkout-summary__item-info">
            <p class="checkout-summary__item-name">${esc(item.name)}</p>
            <p class="checkout-summary__item-qty">
              ${esc(item.size ? item.size + " · " : "")}${item.qty || 1} шт.
            </p>
          </div>
          <span class="checkout-summary__item-price">${lineTotal} ₽</span>
        </div>`;
      })
      .join("");

    const total = window.PalomaCart
      ? window.PalomaCart.calcTotal(items)
      : items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    const fmt = total.toLocaleString("ru-RU") + " ₽";
    if (subtotalEl) subtotalEl.textContent = fmt;
    if (totalEl) totalEl.textContent = fmt;
  }

  function initRecipientToggle() {
    if (!recipientRadios || !recipientOther) return;
    recipientRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        const isOther = radio.value === "other" && radio.checked;
        recipientOther.hidden = !isOther;
      });
    });
  }

  function initDeliveryToggle() {
    if (!deliveryRadios || !courierFields) return;
    deliveryRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        const isCourier = radio.value === "courier" && radio.checked;
        courierFields.hidden = !isCourier;
        const addr = document.getElementById("cf-address");
        if (addr) addr.required = isCourier;
      });
    });
  }

  function initCardTextCounter() {
    if (!cardTextArea || !cardTextCount) return;
    cardTextArea.addEventListener("input", () => {
      cardTextCount.textContent = String(cardTextArea.value.length);
    });
  }

  function initPaymentFailedBanner() {
    if (!failedBanner || !failedClose) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "failed") {
      failedBanner.hidden = false;
    }
    failedClose.addEventListener("click", () => {
      failedBanner.hidden = true;
    });
  }

  function initFieldClearOnInput() {
    form?.querySelectorAll(".checkout-field__input").forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("is-error");
        const errId = input.id + "-error";
        const errEl = document.getElementById(errId);
        if (errEl) errEl.hidden = true;
      });
    });
  }

  const RULES = [
    {
      id: "cf-name",
      errorId: "cf-name-error",
      validate: (v) => v.trim().length >= 2,
      message: "Укажите имя (минимум 2 символа)",
    },
    {
      id: "cf-phone",
      errorId: "cf-phone-error",
      validate: (v) => /^[\d\s+\-()]{10,}$/.test(v.trim()),
      message: "Укажите корректный телефон",
    },
    {
      id: "cf-date",
      errorId: "cf-date-error",
      validate: (v) => Boolean(v),
      message: "Выберите дату",
    },
  ];

  function validate() {
    let valid = true;

    RULES.forEach((rule) => {
      const input = document.getElementById(rule.id);
      const errEl = document.getElementById(rule.errorId);
      if (!input) return;
      const ok = rule.validate(input.value);
      input.classList.toggle("is-error", !ok);
      if (errEl) {
        errEl.hidden = ok;
        if (!ok) errEl.textContent = rule.message;
      }
      if (!ok) valid = false;
    });

    const delivery = form.querySelector('[name="delivery"]:checked');
    const deliveryErr = document.getElementById("delivery-error");
    if (!delivery) {
      if (deliveryErr) {
        deliveryErr.hidden = false;
        deliveryErr.textContent = "Выберите способ получения";
      }
      valid = false;
    } else if (deliveryErr) {
      deliveryErr.hidden = true;

      if (delivery.value === "courier") {
        const addr = document.getElementById("cf-address");
        const addrErr = document.getElementById("cf-address-error");
        const addrOk = addr && addr.value.trim().length >= 5;
        addr?.classList.toggle("is-error", !addrOk);
        if (addrErr) addrErr.hidden = !!addrOk;
        if (!addrOk) valid = false;
      }
    }

    const interval = form.querySelector('[name="interval"]:checked');
    const intervalErr = document.getElementById("cf-interval-error");
    if (!interval) {
      if (intervalErr) {
        intervalErr.hidden = false;
        intervalErr.textContent = "Выберите интервал доставки";
      }
      valid = false;
    } else if (intervalErr) {
      intervalErr.hidden = true;
    }

    const payment = form.querySelector('[name="payment"]:checked');
    const paymentErr = document.getElementById("payment-error");
    if (!payment) {
      if (paymentErr) {
        paymentErr.hidden = false;
        paymentErr.textContent = "Выберите способ оплаты";
      }
      valid = false;
    } else if (paymentErr) {
      paymentErr.hidden = true;
    }

    return valid;
  }

  function scrollToFirstError() {
    const firstError = form.querySelector(
      ".is-error, .checkout-field__error:not([hidden])",
    );
    firstError
      ?.closest(".checkout-section, .checkout-field")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function collectOrder() {
    const g = (id) => document.getElementById(id)?.value?.trim() || "";
    const r = (name) =>
      form.querySelector(`[name="${name}"]:checked`)?.value || "";

    const total = window.PalomaCart
      ? window.PalomaCart.calcTotal(items)
      : items.reduce((s, i) => s + i.price * (i.qty || 1), 0);

    return {
      orderId: _generateOrderId(),
      createdAt: new Date().toISOString(),
      status: "pending",
      customer: {
        name: g("cf-name"),
        phone: g("cf-phone"),
        email: g("cf-email"),
        messenger: g("cf-messenger"),
      },
      recipient: {
        type: r("recipient-type") || "self",
        name: g("cf-rec-name"),
        phone: g("cf-rec-phone"),
      },
      delivery: {
        method: r("delivery"),
        address: g("cf-address"),
        courierComment: g("cf-courier-comment"),
        date: g("cf-date"),
        interval: r("interval"),
      },
      cardText: g("cf-card-text"),
      comment: g("cf-comment"),
      paymentMethod: r("payment"),
      items: items.map((i) => ({ ...i })),
      total,
      city: CFG.CITY || "Новороссийск",
    };
  }

  function initFormSubmit() {
    [
      document.getElementById("checkoutSubmitDesktop"),
      document.getElementById("checkoutSubmitMobile"),
    ].forEach((btn) => {
      btn?.addEventListener("click", (e) => {
        e.preventDefault();
        handleSubmit();
      });
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSubmit();
    });
  }

  async function handleSubmit() {
    if (!validate()) {
      scrollToFirstError();
      return;
    }

    const order = collectOrder();

    try {
      localStorage.setItem("paloma_last_order", JSON.stringify(order));
    } catch {
      /* ignore */
    }

    showLoading("Создаём заказ...");

    if (CFG.TEST_MODE) {
      await _sleep(1500);
      _onPaymentSuccess(order);
      return;
    }

    try {
      updateLoadingText("Перенаправляем на страницу оплаты...");
      const res = await fetch(CFG.PAYMENT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order,
          paymentMethod: order.paymentMethod,
          returnUrl:
            CFG.RETURN_URL_SUCCESS + "?orderId=" + encodeURIComponent(order.orderId),
        }),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.status === "succeeded") {
        _onPaymentSuccess(order);
      } else {
        throw new Error("No paymentUrl");
      }
    } catch (err) {
      console.error("[PALOMA Checkout]", err);
      hideLoading();
      window.location.href = CFG.RETURN_URL_FAIL;
    }
  }

  function _onPaymentSuccess(order) {
    try {
      localStorage.setItem("paloma_last_order", JSON.stringify(order));
      sessionStorage.setItem("paloma_checkout_success", order.orderId);
    } catch {
      /* ignore */
    }

    if (window.PalomaCart?.emptyCart) {
      window.PalomaCart.emptyCart();
    } else {
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem("paloma_cart_v1");
    }

    const url =
      CFG.RETURN_URL_SUCCESS +
      "?orderId=" +
      encodeURIComponent(order.orderId) +
      "&method=" +
      encodeURIComponent(order.paymentMethod);
    window.location.href = url;
  }

  function showLoading(text) {
    if (!loadingEl) return;
    if (loadingText) loadingText.textContent = text || "Загрузка...";
    loadingEl.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function hideLoading() {
    if (!loadingEl) return;
    loadingEl.hidden = true;
    document.body.style.overflow = "";
  }

  function updateLoadingText(text) {
    if (loadingText) loadingText.textContent = text;
  }

  function _generateOrderId() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "PL-" + ts + "-" + rand;
  }

  function _loadCartFallback() {
    try {
      const raw =
        localStorage.getItem(CART_KEY) ||
        localStorage.getItem("paloma_cart_v2") ||
        localStorage.getItem("paloma_cart_v1") ||
        "[]";
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  init();
})();
