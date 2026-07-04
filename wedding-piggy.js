/* PALOMA — Свадебная копилка (wedding-piggy-bank.html)
   Гость выбирает сумму сертификата (пресет или своя), указывает пару
   и кладёт взнос в корзину → оформление как заказ. */
(function () {
  "use strict";

  function init() {
    const page = document.getElementById("weddingPiggyPage");
    if (!page) return;
    const form = document.getElementById("wpbForm");
    if (!form) return;

    const PIGGY_PREFIX = "paloma-wedding-piggy";
    const PIGGY_BG =
      "linear-gradient(135deg, #FBF6E8 0%, #E7385A 60%, #C82847 100%)";

    const amountsWrap = page.querySelector("[data-wpb-amounts]");
    const amountBtns = amountsWrap
      ? Array.from(amountsWrap.querySelectorAll("button"))
      : [];
    const customToggle = page.querySelector("[data-wpb-custom-toggle]");
    const customInput = page.querySelector("[data-wpb-custom-input]");
    const coupleInput = page.querySelector("[data-wpb-couple]");
    const wishInput = page.querySelector("[data-wpb-wish]");

    const out = {
      couple: page.querySelector("[data-wpb-sum-couple]"),
      amount: page.querySelector("[data-wpb-sum-amount]"),
      total: page.querySelector("[data-wpb-sum-total]"),
      btn: page.querySelector("[data-wpb-sum-btn]"),
      wish: page.querySelector("[data-wpb-sum-wish]"),
      wishRow: page.querySelector("[data-wpb-wish-row]"),
    };

    const state = { amount: 5000, custom: false };

    const fmt = (n) => Number(n || 0).toLocaleString("ru-RU") + " ₽";

    function setActive(btn) {
      amountBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function recalc() {
      const couple = (coupleInput && coupleInput.value.trim()) || "";
      if (out.couple) out.couple.textContent = couple || "—";
      const amt = state.amount > 0 ? state.amount : 0;
      if (out.amount) out.amount.textContent = amt ? fmt(amt) : "—";
      if (out.total) out.total.textContent = amt ? fmt(amt) : "—";
      if (out.btn) out.btn.textContent = amt ? fmt(amt) : "—";
      const wish = (wishInput && wishInput.value.trim()) || "";
      if (out.wishRow) out.wishRow.hidden = !wish;
      if (out.wish) {
        out.wish.textContent = wish
          ? (wish.length > 40 ? wish.slice(0, 40) + "…" : wish)
          : "—";
      }
    }

    /* пресеты */
    amountBtns.forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.classList.contains("is-active") ? "true" : "false",
      );
      btn.addEventListener("click", () => {
        state.custom = false;
        state.amount = parseInt(btn.dataset.amount, 10) || 0;
        setActive(btn);
        if (customToggle) customToggle.classList.remove("is-active");
        if (customInput) {
          customInput.hidden = true;
          customInput.value = "";
        }
        recalc();
      });
    });

    /* своя сумма */
    if (customToggle && customInput) {
      customToggle.addEventListener("click", () => {
        state.custom = true;
        setActive(null);
        customToggle.classList.add("is-active");
        customInput.hidden = false;
        customInput.focus();
        state.amount = parseInt(customInput.value, 10) || 0;
        recalc();
      });
      customInput.addEventListener("input", () => {
        state.amount = parseInt(customInput.value, 10) || 0;
        recalc();
      });
    }

    if (coupleInput) coupleInput.addEventListener("input", recalc);
    if (wishInput) wishInput.addEventListener("input", recalc);

    function flash(el) {
      if (!el) return;
      el.classList.add("wpb-err");
      setTimeout(() => el.classList.remove("wpb-err"), 1200);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const couple = (coupleInput && coupleInput.value.trim()) || "";
      if (!couple) {
        flash(coupleInput);
        coupleInput && coupleInput.focus();
        return;
      }
      if (!state.amount || state.amount < 500) {
        flash(state.custom ? customInput : amountsWrap);
        return;
      }

      const wish = (wishInput && wishInput.value.trim()) || "";

      if (window.PalomaCart && typeof window.PalomaCart.add === "function") {
        /* один взнос — заменяем прежний, если гость менял сумму */
        window.PalomaCart.getItems().forEach((item) => {
          if (String(item.id).startsWith(PIGGY_PREFIX)) {
            window.PalomaCart.remove(item.id);
          }
        });

        const addons = ["Кому: " + couple, "Цветочный депозит молодожёнам"];
        if (wish) addons.push("Открытка: " + wish);

        window.PalomaCart.add({
          id: PIGGY_PREFIX + "-" + state.amount,
          name: "Свадебная копилка — сертификат",
          price: state.amount,
          qty: 1,
          size: "—",
          category: "wedding-piggy",
          type: "wedding-piggy",
          bg: PIGGY_BG,
          addons: addons,
        });

        if (typeof window.PalomaCart.openDrawer === "function") {
          window.PalomaCart.openDrawer();
        }
        return;
      }

      window.location.href = "checkout.html";
    });

    recalc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
