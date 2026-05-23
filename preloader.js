/* ════════════════════════════════════════════════════════
   PALOMA LOADER + PAGE TRANSITIONS
   ════════════════════════════════════════════════════════ */

(function PalomaLoader() {
  "use strict";

  function injectLoaderHTML() {
    if (document.getElementById("palomaLoader")) return;

    const markup = [
      '<div id="palomaLoader" class="paloma-loader" aria-hidden="true" role="presentation">',
      '  <div class="paloma-loader__inner">',
      '    <div class="paloma-loader__brand">',
      '      <span class="paloma-loader__name">PALOMA</span>',
      '      <span class="paloma-loader__tagline">FLOWERS · COFFEE · YOU</span>',
      "    </div>",
      '    <div class="paloma-loader__progress" aria-hidden="true">',
      '      <div class="paloma-loader__progress-fill" id="palomaLoaderProgress"></div>',
      "    </div>",
      "  </div>",
      "</div>",
      '<div id="palomaTransition" class="paloma-transition" aria-hidden="true" role="presentation">',
      '  <div class="paloma-transition__inner">',
      '    <div class="paloma-transition__brand">',
      '      <span class="paloma-transition__name">PALOMA</span>',
      "    </div>",
      "  </div>",
      "</div>",
    ].join("");

    const template = document.createElement("template");
    template.innerHTML = markup.trim();
    const nodes = Array.from(template.content.children);
    const first = document.body.firstChild;

    nodes.forEach(function (node) {
      document.body.insertBefore(node, first);
    });
  }

  injectLoaderHTML();

  const loader = document.getElementById("palomaLoader");
  const transition = document.getElementById("palomaTransition");
  const progress = document.getElementById("palomaLoaderProgress");

  if (!loader || !transition) return;

  const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let progressInterval = null;
  let hideTimeout = null;
  let loaded = false;

  document.body.classList.add("pl-lock");

  function isExcludedLink(link) {
    const href = (link.getAttribute("href") || "").trim();

    if (!href || href === "#" || href.startsWith("#") || href.startsWith("javascript:")) {
      return true;
    }

    if (/^(tel:|mailto:|tg:|https?:\/\/(t\.me|wa\.me|api\.whatsapp))/i.test(href)) {
      return true;
    }

    if (link.hasAttribute("data-no-transition") || link.hasAttribute("data-cart-close")) {
      return true;
    }

    if (link.target === "_blank") {
      return true;
    }

    if (link.hostname && link.hostname !== window.location.hostname) {
      return true;
    }

    if (/\.(pdf|zip|png|jpg|jpeg|gif|svg|webp|mp4|mp3)$/i.test(href)) {
      return true;
    }

    return false;
  }

  function hideLoader() {
    if (loader.classList.contains("is-hidden")) return;

    loader.classList.add("is-hiding");
    const duration = noMotion ? 200 : 580;

    hideTimeout = window.setTimeout(function () {
      loader.classList.add("is-hidden");
      document.body.classList.remove("pl-lock");
      document.body.classList.remove("loader-lock");
      document.dispatchEvent(new CustomEvent("paloma:loader-done"));
    }, duration);
  }

  function initLoader() {
    let progressValue = 0;

    progressInterval = window.setInterval(function () {
      progressValue += Math.random() * 18;
      if (progressValue > 85) progressValue = 85;
      if (progress) progress.style.width = progressValue + "%";
    }, 100);

    requestAnimationFrame(function () {
      loader.classList.add("is-revealed");
    });

    function onLoaded() {
      if (loaded) return;
      loaded = true;

      if (progressInterval) {
        window.clearInterval(progressInterval);
        progressInterval = null;
      }

      if (progress) progress.style.width = "100%";

      const minDisplayTime = noMotion ? 150 : 600;
      window.setTimeout(hideLoader, minDisplayTime);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onLoaded, { once: true });
    } else {
      onLoaded();
    }

    window.addEventListener("load", onLoaded, { once: true });
  }

  function transitionIn(callback) {
    transition.classList.add("is-entering");
    document.body.classList.add("pl-lock");

    const enterDuration = noMotion ? 100 : 450;
    window.setTimeout(function () {
      if (typeof callback === "function") callback();
    }, enterDuration);
  }

  function transitionOut() {
    transition.classList.remove("is-entering");
    if (loader.classList.contains("is-hidden")) {
      document.body.classList.remove("pl-lock");
    }
  }

  document.addEventListener(
    "click",
    function (e) {
      const link = e.target.closest("a[href]");
      if (!link) return;
      if (isExcludedLink(link)) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const href = link.href;
      if (href === window.location.href) return;

      e.preventDefault();
      transitionIn(function () {
        window.location.href = href;
      });
    },
    false,
  );

  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      transitionOut();
    }

    if (!loader.classList.contains("is-hidden") && loaded) {
      hideLoader();
    }
  });

  window.addEventListener("popstate", transitionOut);

  window.setTimeout(function () {
    if (loader && !loader.classList.contains("is-hidden")) {
      hideLoader();
    }
    if (transition && transition.classList.contains("is-entering")) {
      transitionOut();
    }
  }, 5000);

  initLoader();
})();
