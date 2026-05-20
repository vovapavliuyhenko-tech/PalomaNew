(function () {
  "use strict";

  function initContactsForm() {
    const form = document.getElementById("contactsForm");
    const success = document.getElementById("contactsFormSuccess");
    if (!form || !success) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value?.trim();
      const phone = form.querySelector('[name="phone"]')?.value?.trim();
      const question = form.querySelector('[name="question"]')?.value?.trim();
      if (!name || !phone || !question) {
        form.reportValidity?.();
        return;
      }

      const btn = form.querySelector(".contacts-form__submit");
      if (btn instanceof HTMLButtonElement) {
        btn.textContent = "Отправляем...";
        btn.disabled = true;
      }

      const payload = {
        name,
        phone,
        question,
        page: "contacts",
        ts: new Date().toISOString(),
      };

      try {
        const key = "paloma_contact_messages";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.push(payload);
        localStorage.setItem(key, JSON.stringify(prev));
      } catch {
        /* ignore */
      }

      window.setTimeout(() => {
        form.querySelectorAll(".contacts-form__field").forEach((el) => {
          el.style.display = "none";
        });
        const note = form.querySelector(".contacts-form__note");
        if (note) note.style.display = "none";
        success.hidden = false;
      }, 700);
    });
  }

  initContactsForm();
})();
