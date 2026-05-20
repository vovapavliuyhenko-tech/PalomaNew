(function PalomaMedia() {
  "use strict";

  const PATHS = window.PALOMA_MEDIA_PATHS || {};

  function tryImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function resolve(key) {
    const url = PATHS[key];
    if (!url) return null;
    return tryImage(url);
  }

  async function applyToElement(el) {
    const key = el.getAttribute("data-paloma-media");
    if (!key) return;
    const url = await resolve(key);
    if (!url) return;

    if (el.tagName === "IMG") {
      el.src = url;
      el.removeAttribute("hidden");
    } else if (el.classList.contains("hero__bg-img")) {
      el.src = url;
      el.style.display = "block";
      const ph = el.parentElement?.querySelector(".hero__bg-ph");
      if (ph) ph.style.display = "none";
    } else {
      el.style.backgroundImage = `url("${url}")`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    }
  }

  async function init() {
    const nodes = document.querySelectorAll("[data-paloma-media]");
    await Promise.all([...nodes].map((el) => applyToElement(el)));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.PalomaMedia = { resolve, init };
})();
