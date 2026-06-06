/* PALOMA Subscription — subscription.html
   Живой расчёт цены (subscription-pricing.js) + оформление в корзину. */
function initSubscriptionPage() {
  "use strict";

  const page = document.getElementById("subscriptionPage");
  if (!page) return;

  const form = document.getElementById("subscriptionForm");
  if (!form) return;

  const SUB_ID_PREFIX = "paloma-flower-subscription";
  const SUB_BG =
    "linear-gradient(135deg, #eaded1 0%, #b98d8b 48%, #643640 100%)";

  /* Текущий выбор */
  const state = {
    period: "3",
    frequency: "biweekly",
    size: "M",
    fulfillment: "pickup",
    contact: "Telegram",
  };

  const fmt = (n) => n.toLocaleString("ru-RU") + " ₽";

  /* Группы кнопок-переключателей */
  const groups = [
    { sel: "[data-sub-period]",      attr: "period" },
    { sel: "[data-sub-frequency]",   attr: "frequency" },
    { sel: "[data-sub-size]",        attr: "size" },
    { sel: "[data-sub-fulfillment]", attr: "fulfillment" },
    { sel: "[data-sub-contact]",     attr: "contact" },
  ];

  function bindGroup(container, key) {
    if (!container) return;
    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.classList.contains("is-active") ? "true" : "false",
      );
      btn.addEventListener("click", () => {
        const val = btn.dataset[key];
        if (val == null) return;
        state[key] = val;
        buttons.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        recalc();
      });
    });
  }

  groups.forEach((g) => bindGroup(page.querySelector(g.sel), g.attr));

  /* Элементы вывода */
  const out = {
    deliveries: page.querySelector("[data-sum-deliveries]"),
    bouquets: page.querySelector("[data-sum-bouquets]"),
    deliveryRow: page.querySelector("[data-sum-delivery-row]"),
    delivery: page.querySelector("[data-sum-delivery]"),
    total: page.querySelector("[data-sum-total]"),
    totalBtn: page.querySelector("[data-sum-total-btn]"),
    priceTop: page.querySelector("[data-sub-price-top]"),
  };

  let last = null;

  function recalc() {
    if (typeof window.PalomaSubscriptionCalc !== "function") return;
    const r = window.PalomaSubscriptionCalc({
      size: state.size,
      period: state.period,
      frequency: state.frequency,
      fulfillment: state.fulfillment,
    });
    last = r;
    if (out.deliveries) out.deliveries.textContent = r.deliveries + " шт";
    if (out.bouquets) out.bouquets.textContent = fmt(r.bouquetsTotal);
    if (out.delivery) out.delivery.textContent = fmt(r.deliveryTotal);
    if (out.deliveryRow) out.deliveryRow.hidden = r.deliveryTotal === 0;
    if (out.total) out.total.textContent = fmt(r.total);
    if (out.totalBtn) out.totalBtn.textContent = fmt(r.total);
    if (out.priceTop) out.priceTop.textContent = fmt(r.total);
  }

  recalc();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!last) recalc();

    const lbl = last ? last.labels : {};
    const cartId =
      SUB_ID_PREFIX + "-" + state.period + "m-" + state.frequency +
      "-" + state.size + "-" + state.fulfillment;

    if (window.PalomaCart && typeof window.PalomaCart.add === "function") {
      window.PalomaCart.getItems().forEach((item) => {
        if (String(item.id).startsWith(SUB_ID_PREFIX)) {
          window.PalomaCart.remove(item.id);
        }
      });

      window.PalomaCart.add({
        id: cartId,
        name: "Цветочная подписка",
        price: last ? last.total : 0,
        qty: 1,
        size: state.size,
        category: "subscription",
        type: "subscription",
        bg: SUB_BG,
        addons: [
          lbl.period || "",
          lbl.frequency || "",
          "Размер " + state.size,
          lbl.fulfillment || "",
        ].filter(Boolean),
      });

      if (typeof window.PalomaCart.openDrawer === "function") {
        window.PalomaCart.openDrawer();
      }
      return;
    }

    window.location.href = "checkout.html";
  });
}

/* Горизонтальный скролл блока «Как это работает» (как на главной) */
function initSubStepsScroll() {
  "use strict";
  const section = document.getElementById("subStepsScroll");
  const track = document.getElementById("subStepsTrack");
  if (!section || !track) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  let raf = null;
  let scrollDistance = 0;
  let enabled = false;

  function measure() {
    if (reduceMotion || mobileQuery.matches) {
      section.style.height = "auto";
      track.style.transform = "none";
      scrollDistance = 0;
      enabled = false;
      return;
    }
    enabled = true;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    section.style.height = viewportH + "px";
    requestAnimationFrame(() => {
      const trackW = track.scrollWidth;
      scrollDistance = Math.max(0, trackW - viewportW);
      section.style.height = (viewportH + scrollDistance) + "px";
      update();
    });
  }

  function update() {
    if (!enabled) return;
    const rect = section.getBoundingClientRect();
    const scrolled = Math.max(0, Math.min(scrollDistance, -rect.top));
    track.style.transform = "translate3d(" + -scrolled + "px,0,0)";
    raf = null;
  }

  function requestUpdate() {
    if (raf) return;
    raf = window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", measure);
  if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", measure);
  measure();
}

document.addEventListener("DOMContentLoaded", function () {
  initSubscriptionPage();
  initSubStepsScroll();
});
