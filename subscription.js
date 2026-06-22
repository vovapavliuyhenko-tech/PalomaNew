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
    "linear-gradient(135deg, #FBF6E8 0%, #E7385A 60%, #C82847 100%)";

  /* Текущий выбор */
  const state = {
    plan: "month",
    count: "2",
    composition: "mono",
    size: "M",
    fulfillment: "delivery",
  };

  const fmt = (n) => n.toLocaleString("ru-RU") + " ₽";

  /* Группы кнопок-переключателей */
  const groups = [
    { sel: "[data-sub-plan]", attr: "plan" },
    { sel: "[data-sub-count]", attr: "count" },
    { sel: "[data-sub-composition]", attr: "composition" },
    { sel: "[data-sub-size]", attr: "size" },
    { sel: "[data-sub-fulfillment]", attr: "fulfillment" },
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

  const countGroup = page.querySelector("[data-sub-count-group]");

  /* Элементы вывода */
  const out = {
    deliveries: page.querySelector("[data-sum-deliveries]"),
    meta: page.querySelector("[data-sum-meta]"),
    discountRow: page.querySelector("[data-sum-discount-row]"),
    discount: page.querySelector("[data-sum-discount]"),
    total: page.querySelector("[data-sum-total]"),
    totalBtn: page.querySelector("[data-sum-total-btn]"),
    submitLabel: page.querySelector("[data-submit-label]"),
    priceTop: page.querySelector("[data-sub-price-top]"),
  };

  let last = null;

  function recalc() {
    if (typeof window.PalomaSubscriptionCalc !== "function") return;
    const r = window.PalomaSubscriptionCalc({
      plan: state.plan,
      count: state.count,
      composition: state.composition,
      size: state.size,
      fulfillment: state.fulfillment,
    });
    last = r;

    /* «Количество букетов» не нужно для пробной недели */
    if (countGroup) countGroup.hidden = r.isTrial;

    if (out.deliveries) out.deliveries.textContent = r.count + " шт";
    if (out.meta) {
      out.meta.textContent = "Размер " + r.labels.size + " · " + r.labels.composition;
    }
    if (out.discountRow) out.discountRow.hidden = !r.isTrial;
    if (out.discount) out.discount.textContent = "−" + fmt(r.discount);
    if (out.total) out.total.textContent = fmt(r.total);
    if (out.totalBtn) out.totalBtn.textContent = fmt(r.total);
    if (out.priceTop) out.priceTop.textContent = fmt(r.total);
    if (out.submitLabel) {
      out.submitLabel.textContent = r.isTrial
        ? "Оформить пробную неделю"
        : "Оформить подписку";
    }
  }

  recalc();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!last) recalc();

    const lbl = last ? last.labels : {};
    const cartId =
      SUB_ID_PREFIX + "-" + state.plan + "-" + state.count + "-" +
      state.size + "-" + state.composition + "-" + state.fulfillment;

    if (window.PalomaCart && typeof window.PalomaCart.add === "function") {
      window.PalomaCart.getItems().forEach((item) => {
        if (String(item.id).startsWith(SUB_ID_PREFIX)) {
          window.PalomaCart.remove(item.id);
        }
      });

      window.PalomaCart.add({
        id: cartId,
        name: last && last.isTrial ? "Пробная неделя подписки" : "Цветочная подписка",
        price: last ? last.total : 0,
        qty: 1,
        size: state.size,
        category: "subscription",
        type: "subscription",
        bg: SUB_BG,
        addons: [
          lbl.plan || "",
          (last ? last.count : 2) + " букета",
          "Размер " + state.size,
          lbl.composition || "",
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

document.addEventListener("DOMContentLoaded", function () {
  initSubscriptionPage();
});
