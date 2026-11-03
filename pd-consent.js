/* ════════════════════════════════════════════════════════
   pd-consent.js — согласие на обработку ПДн в каждой форме сайта
   С 01.09.2025 (152-ФЗ в ред. ФЗ-156) согласие — отдельный документ
   (consent.html), и человек отмечает его сам: галочка не стоит заранее.

   Скрипт находит формы, где спрашивают телефон или почту, и если своей
   галочки согласия в форме нет — добавляет её перед кнопкой отправки.
   Пока галочка не отмечена, форма не отправляется (проверка до всех
   остальных обработчиков — на этапе перехвата события submit).
   ════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var PD_FIELDS = 'input[type="tel"], input[type="email"], input[autocomplete="tel"], input[autocomplete="email"]';

  function hasOwnConsent(form) {
    var boxes = form.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      var text = (b.getAttribute("aria-label") || "") + " " + ((b.closest("label") || {}).textContent || "") + " " + (b.id || "");
      if (/согласи|consent|agree/i.test(text)) return true;
    }
    return false;
  }

  function enhance(form) {
    if (form.dataset.pdConsent || form.classList.contains("sf2-form")) return;
    if (!form.querySelector(PD_FIELDS) || hasOwnConsent(form)) return;
    form.dataset.pdConsent = "1";
    var label = document.createElement("label");
    label.className = "pd-consent";
    label.innerHTML = '<input type="checkbox" class="pd-consent__box" aria-label="Согласие на обработку персональных данных"> ' +
      '<span>Даю <a href="consent.html" target="_blank" rel="noopener">согласие</a> на обработку персональных данных и соглашаюсь с ' +
      '<a href="privacy.html" target="_blank" rel="noopener">политикой конфиденциальности</a></span>';
    var btn = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
    if (btn && btn.parentNode) btn.parentNode.insertBefore(label, btn);
    else form.appendChild(label);
    label.querySelector("input").addEventListener("change", function () { label.classList.remove("is-err"); });
  }

  function scan(root) {
    var forms = (root || document).querySelectorAll ? (root || document).querySelectorAll("form") : [];
    for (var i = 0; i < forms.length; i++) enhance(forms[i]);
  }

  /* Не пускаем отправку без галочки — раньше обработчиков самих форм */
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || !form.querySelector) return;
    var box = form.querySelector(".pd-consent__box");
    if (!box || box.checked) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var label = box.closest(".pd-consent");
    if (label) {
      label.classList.remove("is-err"); void label.offsetWidth; label.classList.add("is-err");
      if (label.scrollIntoView) label.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, true);

  function start() {
    scan(document);
    /* формы, которые появляются позже (окна заявок, корзина) */
    if (window.MutationObserver) {
      new MutationObserver(function (list) {
        for (var i = 0; i < list.length; i++) {
          for (var j = 0; j < list[i].addedNodes.length; j++) {
            var n = list[i].addedNodes[j];
            if (n.nodeType !== 1) continue;
            if (n.tagName === "FORM") enhance(n); else if (n.querySelector && n.querySelector("form")) scan(n);
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  var css = document.createElement("style");
  css.textContent =
    ".pd-consent{display:flex;gap:8px;align-items:flex-start;margin:10px 0 6px;font-size:12px;line-height:1.45;color:rgba(27,26,24,.65);text-align:left;cursor:pointer}" +
    ".pd-consent input{flex:none;width:16px;height:16px;margin:1px 0 0;accent-color:#E7385A;cursor:pointer}" +
    ".pd-consent a{color:inherit;text-decoration:underline;text-underline-offset:2px}" +
    ".pd-consent.is-err{color:#E7385A;animation:pdShake .35s}" +
    "@keyframes pdShake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}";
  document.head.appendChild(css);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
