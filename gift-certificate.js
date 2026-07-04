/* ════════════════════════════════════════════════════════
   gift-certificate.js — конфигуратор подарочного сертификата PALOMA

   Модель без бэкенда: клиент заполняет форму → «Оформить и оплатить»
   отправляет админу заявку со всеми данными (сумма, формат, получатель,
   поздравление, email) в WhatsApp. Админ присылает ссылку на оплату
   Яндекс Пей. Всё остальное на сайте оплачивается только через чат.
   ════════════════════════════════════════════════════════ */
(function GiftCertificate() {
  "use strict";

  var WA_NUMBER = "79897707000";

  function init() {
    var page = document.getElementById("giftCertPage");
    if (!page) return;

    var form = document.getElementById("gcForm");
    if (!form) return;

    var amountsWrap = page.querySelector("[data-gc-amounts]");
    var amountBtns = amountsWrap
      ? Array.prototype.slice.call(amountsWrap.querySelectorAll("button"))
      : [];
    var customToggle = page.querySelector("[data-gc-custom-toggle]");
    var customInput = page.querySelector("[data-gc-custom-input]");
    var formatsWrap = page.querySelector("[data-gc-formats]");
    var formatBtns = formatsWrap
      ? Array.prototype.slice.call(formatsWrap.querySelectorAll("[data-format]"))
      : [];
    var recipientInput = page.querySelector("[data-gc-recipient]");
    var emailField = page.querySelector("[data-gc-email-field]");
    var emailInput = page.querySelector("[data-gc-email]");
    var messageInput = page.querySelector("[data-gc-message]");

    var out = {
      format: page.querySelector("[data-gc-sum-format]"),
      recipient: page.querySelector("[data-gc-sum-recipient]"),
      message: page.querySelector("[data-gc-sum-message]"),
      messageRow: page.querySelector("[data-gc-message-row]"),
      total: page.querySelector("[data-gc-sum-total]"),
      btn: page.querySelector("[data-gc-sum-btn]"),
    };

    var state = { amount: 5000, custom: false, format: "electronic" };

    var fmt = function (n) {
      return Number(n || 0).toLocaleString("ru-RU") + " ₽";
    };

    function setActive(btn) {
      amountBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function recalc() {
      var amt = state.amount > 0 ? state.amount : 0;
      if (out.total) out.total.textContent = amt ? fmt(amt) : "—";
      if (out.btn) out.btn.textContent = amt ? fmt(amt) : "—";
      if (out.format) {
        out.format.textContent =
          state.format === "paper" ? "Бумажный · самовывоз" : "Электронный";
      }
      var recipient = (recipientInput && recipientInput.value.trim()) || "";
      if (out.recipient) out.recipient.textContent = recipient || "—";
      var message = (messageInput && messageInput.value.trim()) || "";
      if (out.messageRow) out.messageRow.hidden = !message;
      if (out.message) {
        out.message.textContent = message
          ? message.length > 40
            ? message.slice(0, 40) + "…"
            : message
          : "—";
      }
    }

    /* email нужен только для электронного формата */
    function updateEmailField() {
      if (!emailField) return;
      var isElectronic = state.format === "electronic";
      emailField.hidden = !isElectronic;
      if (!isElectronic && emailInput) emailInput.classList.remove("wpb-err");
    }

    /* пресеты суммы */
    amountBtns.forEach(function (btn) {
      btn.setAttribute(
        "aria-pressed",
        btn.classList.contains("is-active") ? "true" : "false"
      );
      btn.addEventListener("click", function () {
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
      customToggle.addEventListener("click", function () {
        state.custom = true;
        setActive(null);
        customToggle.classList.add("is-active");
        customInput.hidden = false;
        customInput.focus();
        state.amount = parseInt(customInput.value, 10) || 0;
        recalc();
      });
      customInput.addEventListener("input", function () {
        state.amount = parseInt(customInput.value, 10) || 0;
        recalc();
      });
    }

    /* формат */
    formatBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.format = btn.dataset.format === "paper" ? "paper" : "electronic";
        formatBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-checked", on ? "true" : "false");
        });
        updateEmailField();
        recalc();
      });
    });

    if (recipientInput) recipientInput.addEventListener("input", recalc);
    if (messageInput) messageInput.addEventListener("input", recalc);

    function flash(el) {
      if (!el) return;
      el.classList.add("wpb-err");
      setTimeout(function () {
        el.classList.remove("wpb-err");
      }, 1200);
    }

    function validEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!state.amount || state.amount < 1000) {
        flash(state.custom ? customInput : amountsWrap);
        return;
      }
      var recipient = (recipientInput && recipientInput.value.trim()) || "";
      if (!recipient) {
        flash(recipientInput);
        recipientInput && recipientInput.focus();
        return;
      }
      var email = (emailInput && emailInput.value.trim()) || "";
      if (state.format === "electronic" && !validEmail(email)) {
        flash(emailInput);
        emailInput && emailInput.focus();
        return;
      }
      var message = (messageInput && messageInput.value.trim()) || "";

      var lines = [
        "Здравствуйте! Хочу оформить подарочный сертификат PALOMA.",
        "",
        "Сумма: " + fmt(state.amount),
        "Формат: " +
          (state.format === "paper"
            ? "бумажный (самовывоз в студии)"
            : "электронный (на email)"),
        "Получатель: " + recipient,
      ];
      if (state.format === "electronic") lines.push("Email для отправки: " + email);
      if (message) lines.push("Поздравление: " + message);
      lines.push("", "Пришлите, пожалуйста, ссылку на оплату Яндекс Пей.");

      var url =
        "https://wa.me/" +
        WA_NUMBER +
        "?text=" +
        encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });

    updateEmailField();
    recalc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
