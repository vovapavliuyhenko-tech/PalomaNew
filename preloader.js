/* =====================================================
   PALOMA PAGE LOADER — premium curtain transition
   ===================================================== */

(function PalomaPageLoaderModule() {
  "use strict";

  function removeLegacyLoaders() {
    document.querySelectorAll("#palomaLoader, #palomaTransition, .paloma-loader, .paloma-transition").forEach(function (node) {
      node.remove();
    });
    document.body.classList.remove("pl-lock", "loader-lock");
  }

  function createPalomaPageLoader() {
    removeLegacyLoaders();

    let loader = document.getElementById("palomaPageLoader");

    if (loader) return loader;

    loader = document.createElement("div");
    loader.className = "paloma-page-loader";
    loader.id = "palomaPageLoader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = [
      '<div class="paloma-page-loader__logo" aria-label="PALOMA">',
      '  <span class="paloma-page-loader__logo-base">PALOMA</span>',
      '  <span class="paloma-page-loader__logo-fill">PALOMA</span>',
      "</div>",
    ].join("");

    document.body.prepend(loader);
    return loader;
  }

  function isInternalNavigationLink(link) {
    if (!link) return false;

    const href = (link.getAttribute("href") || "").trim();

    if (!href || href === "#") return false;
    if (href.startsWith("#")) return false;
    if (href.startsWith("tel:")) return false;
    if (href.startsWith("mailto:")) return false;
    if (href.startsWith("javascript:")) return false;
    if (/^(tg:|https?:\/\/(t\.me|wa\.me|api\.whatsapp))/i.test(href)) return false;
    if (link.hasAttribute("download")) return false;
    if (link.hasAttribute("data-no-transition") || link.hasAttribute("data-cart-close")) return false;

    const target = link.getAttribute("target");
    if (target && target !== "_self") return false;

    let nextUrl;

    try {
      nextUrl = new URL(href, window.location.href);
    } catch (error) {
      return false;
    }

    const currentUrl = new URL(window.location.href);

    if (nextUrl.origin !== currentUrl.origin) return false;

    if (/\.(pdf|zip|png|jpg|jpeg|gif|svg|webp|mp4|mp3)$/i.test(nextUrl.pathname)) {
      return false;
    }

    const samePageHashOnly =
      nextUrl.pathname === currentUrl.pathname &&
      nextUrl.search === currentUrl.search &&
      nextUrl.hash;

    if (samePageHashOnly) return false;

    if (nextUrl.href === currentUrl.href) return false;

    return true;
  }

  function initPalomaPageLoader() {
    const loader = createPalomaPageLoader();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let isTransitioning = false;
    let initialDone = false;
    const revealDelay = reduceMotion ? 80 : 120;
    const leaveDelay = reduceMotion ? 260 : 1650;
    const cleanupDelay = reduceMotion ? 320 : 2800;

    function lockScroll() {
      document.body.classList.add("is-paloma-loading");
      document.body.classList.remove("pl-lock", "loader-lock");
    }

    function unlockScroll() {
      document.body.classList.remove("is-paloma-loading", "pl-lock", "loader-lock");
    }

    function resetLoaderVisualState() {
      loader.classList.remove("is-hidden", "is-leaving", "is-ready");
      loader.style.transform = "";
      loader.style.opacity = "";
      loader.style.visibility = "";
    }

    function finishInitialLoader() {
      if (initialDone) return;
      initialDone = true;
      unlockScroll();
      document.body.classList.add("is-paloma-page-visible");
      document.dispatchEvent(new CustomEvent("paloma:loader-done"));
    }

    function showInitialLoader() {
      resetLoaderVisualState();
      lockScroll();

      window.requestAnimationFrame(function () {
        loader.classList.add("is-ready");
      });

      window.setTimeout(function () {
        loader.classList.add("is-leaving");
        document.body.classList.add("is-paloma-page-visible");
      }, leaveDelay);

      window.setTimeout(function () {
        loader.classList.add("is-hidden");
        finishInitialLoader();
      }, cleanupDelay);
    }

    function showTransitionAndNavigate(url) {
      if (isTransitioning) return;

      isTransitioning = true;
      lockScroll();

      resetLoaderVisualState();

      window.requestAnimationFrame(function () {
        loader.classList.add("is-ready");
      });

      window.setTimeout(function () {
        window.location.href = url;
      }, reduceMotion ? 120 : 720);
    }

    document.addEventListener(
      "click",
      function (event) {
        const link = event.target.closest("a[href]");

        if (!isInternalNavigationLink(link)) return;
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

        const href = link.getAttribute("href");
        const nextUrl = new URL(href, window.location.href);

        event.preventDefault();
        showTransitionAndNavigate(nextUrl.href);
      },
      false,
    );

    window.addEventListener("pageshow", function (event) {
      isTransitioning = false;

      if (event.persisted) {
        resetLoaderVisualState();
        loader.classList.add("is-hidden");
        finishInitialLoader();
      }
    });

    window.addEventListener("popstate", function () {
      isTransitioning = false;
    });

    window.setTimeout(function () {
      if (!loader.classList.contains("is-hidden") && !initialDone) {
        loader.classList.add("is-leaving", "is-hidden");
        finishInitialLoader();
      }
    }, 5000);

    window.setTimeout(showInitialLoader, revealDelay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPalomaPageLoader, { once: true });
  } else {
    initPalomaPageLoader();
  }
})();
