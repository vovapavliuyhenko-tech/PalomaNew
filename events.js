/* PALOMA Events — events.html */
(function () {
  "use strict";

  const d = "div";

  renderGallery();
  renderReviews();
  initEventsForm();
  initEventsReviewsCarousel();

  function renderGallery() {
    const grid = document.getElementById("eGalleryGrid");
    const items = window.PALOMA_EVENTS_GALLERY || [];
    if (!grid || !items.length) return;

    grid.innerHTML = items
      .map(
        (item) => `
      <article class="e-gallery-card" data-cursor="hover">
        <${d} class="e-gallery-card__media" style="background:${item.bg}" role="img" aria-label="${esc(item.caption)}"></${d}>
        <${d} class="e-gallery-card__body">
          <p class="e-gallery-card__meta">
            <span>${esc(item.city)}</span>
            <span class="e-gallery-card__dot" aria-hidden="true">·</span>
            <span>${esc(item.type)}</span>
          </p>
          <p class="e-gallery-card__date">${esc(item.date)}</p>
          <p class="e-gallery-card__caption">${esc(item.caption)}</p>
          <span class="e-gallery-card__brand">PALOMA</span>
        </${d}>
      </article>`,
      )
      .join("");
  }

  function renderReviews() {
    const track = document.getElementById("eventsReviewsTrack");
    const items = window.PALOMA_EVENTS_REVIEWS || [];
    if (!track || !items.length) return;

    track.innerHTML = items
      .map(
        (r) => `
      <article class="review-slide">
        <${d} class="review-slide__photo" aria-hidden="true">
          <${d} class="review-slide__ph" style="background:${r.bg}"></${d}>
        </${d}>
        <${d} class="review-slide__body">
          <blockquote class="review-slide__quote">${esc(r.quote)}</blockquote>
          <p class="review-slide__detail">${esc(r.detail)}</p>
          <p class="review-slide__brand">PALOMA</p>
        </${d}>
      </article>`,
      )
      .join("");
  }

  function initEventsReviewsCarousel() {
    const track = document.getElementById("eventsReviewsTrack");
    const prevBtn = document.getElementById("eventsReviewsPrev");
    const nextBtn = document.getElementById("eventsReviewsNext");
    if (!track) return;

    const slides = track.querySelectorAll(".review-slide");
    const total = slides.length;
    if (!total) return;

    let cur = 0;
    const go = (i) => {
      cur = (i + total) % total;
      track.style.transform = `translateX(${-cur * 100}%)`;
    };

    prevBtn?.addEventListener("click", () => go(cur - 1));
    nextBtn?.addEventListener("click", () => go(cur + 1));

    let sx = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        sx = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) go(dx < 0 ? cur + 1 : cur - 1);
      },
      { passive: true },
    );
  }

  function initEventsForm() {
    const form = document.getElementById("eventsForm");
    const success = document.getElementById("eFormSuccess");
    if (!form || !success) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value?.trim();
      const phone = form.querySelector('[name="phone"]')?.value?.trim();
      if (!name || !phone) {
        form.reportValidity?.();
        return;
      }

      const btn = form.querySelector(".e-form__submit");
      if (btn instanceof HTMLButtonElement) {
        btn.textContent = "Отправляем...";
        btn.disabled = true;
      }

      const payload = {
        name,
        phone,
        messenger: form.querySelector('[name="messenger"]')?.value || "",
        date: form.querySelector('[name="date"]')?.value || "",
        eventType: form.querySelector('[name="eventType"]')?.value || "",
        comment: form.querySelector('[name="comment"]')?.value || "",
        page: "events",
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
        form
          .querySelectorAll(".e-form__field")
          .forEach((el) => {
            el.style.display = "none";
          });
        success.hidden = false;
      }, 700);
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
