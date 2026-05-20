(function () {
  "use strict";

  function initEventDecoForm() {
    const form = document.getElementById("eventDecoForm");
    const success = document.getElementById("eventDecoSuccess");
    if (!form || !success) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value?.trim();
      const phone = form.querySelector('[name="phone"]')?.value?.trim();
      if (!name || !phone) {
        form.reportValidity?.();
        return;
      }

      const btn = form.querySelector(".client-lead__submit");
      if (btn instanceof HTMLButtonElement) {
        btn.textContent = "Отправляем...";
        btn.disabled = true;
      }

      const payload = {
        name,
        phone,
        date: form.querySelector('[name="date"]')?.value || "",
        eventType: form.querySelector('[name="eventType"]')?.value || "",
        comment: form.querySelector('[name="comment"]')?.value || "",
        page: "event-decoration",
        ts: new Date().toISOString(),
      };

      try {
        const key = "paloma_event_leads";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.push(payload);
        localStorage.setItem(key, JSON.stringify(prev));
      } catch {
        /* ignore */
      }

      window.setTimeout(() => {
        form.querySelectorAll(".client-lead__field").forEach((el) => {
          el.style.display = "none";
        });
        success.hidden = false;
      }, 700);
    });
  }

  initEventDecoForm();
})();
