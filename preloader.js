/* ════════════════════════════════════════════════════════
   PALOMA PRELOADER
   ════════════════════════════════════════════════════════ */
(function initPalomaLoader() {
  "use strict";

  const loader = document.getElementById("palomaLoader");
  if (!loader) return;

  document.body.classList.add("pl-lock");

  const noMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let alreadySeen = false;
  try {
    alreadySeen = !!sessionStorage.getItem("paloma_seen");
  } catch {
    /* ignore */
  }

  const MIN_MS = window.innerWidth < 768 ? 1600 : 2200;
  const MAX_MS = window.innerWidth < 768 ? 2400 : 3000;
  const startTime = Date.now();

  function hideFull() {
    loader.classList.add("is-done");
    loader.style.display = "none";
    document.body.classList.remove("pl-lock");
    document.body.classList.remove("loader-lock");

    try {
      sessionStorage.setItem("paloma_seen", "1");
    } catch {
      /* ignore */
    }

    if (document.body.style.overflow === "hidden") {
      document.body.style.overflow = "";
    }

    document.dispatchEvent(new CustomEvent("paloma:loader-done"));
  }

  function hide() {
    if (noMotion) {
      loader.style.transition = "opacity 0.45s ease";
      loader.style.opacity = "0";
      window.setTimeout(hideFull, 480);
    } else {
      loader.classList.add("is-leaving");
      window.setTimeout(hideFull, 680);
    }
  }

  if (alreadySeen) {
    loader.classList.add("is-quick");
    const ring = loader.querySelector(".pl__ring-wrap");
    if (ring) ring.style.opacity = "0";
    if (noMotion) {
      window.setTimeout(hideFull, 100);
    } else {
      loader.style.transition = "opacity 0.4s ease";
      loader.style.opacity = "0";
      window.setTimeout(hideFull, 420);
    }
    return;
  }

  const fallback = window.setTimeout(() => {
    hide();
  }, MAX_MS);

  function onReady() {
    const elapsed = Date.now() - startTime;
    const wait = Math.max(0, MIN_MS - elapsed);
    window.setTimeout(() => {
      window.clearTimeout(fallback);
      hide();
    }, wait);
  }

  if (document.readyState === "complete") {
    onReady();
  } else {
    window.addEventListener("load", onReady, { once: true });
  }
})();
