(function () {
  "use strict";

  (function initWServicesHover() {
    const rows = document.querySelectorAll(".page-weddings .w-service-row");
    const imgs = document.querySelectorAll(
      ".page-weddings .w-services__hover-img",
    );
    if (!rows.length) return;

    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        const id = row.dataset.img;
        imgs.forEach((img) =>
          img.classList.toggle("is-active", img.dataset.hoverImg === id),
        );
      });
      row.addEventListener("mouseleave", () =>
        imgs.forEach((img) => img.classList.remove("is-active")),
      );
    });
  })();


  (function initWeddingForm() {
    const form = document.getElementById("weddingForm");
    const success = document.getElementById("wFormSuccess");
    if (!form || !success) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector(".w-form__submit");
      if (!(btn instanceof HTMLButtonElement)) return;
      btn.textContent = "Отправляем...";
      btn.disabled = true;
      window.setTimeout(() => {
        form.style.display = "none";
        success.hidden = false;
      }, 800);
    });
  })();
})();
