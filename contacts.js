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

  /* ── Видео студии: кнопка включения звука ──
     Автозапуск возможен только без звука, поэтому видео стартует
     muted, а звук включается по клику на кнопку-динамик. */
  function initStudioVideoSound() {
    const video = document.querySelector(".contacts-studio__video");
    const btn = document.getElementById("contactsVideoSound");
    if (!video || !btn) return;

    const ICON_MUTED =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
    const ICON_ON =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12"/></svg>';

    function render() {
      btn.innerHTML = video.muted ? ICON_MUTED : ICON_ON;
      btn.setAttribute("aria-label", video.muted ? "Включить звук" : "Выключить звук");
    }
    render();

    btn.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted) {
        video.volume = 1;
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      }
      render();
    });
  }

  initStudioVideoSound();
})();
