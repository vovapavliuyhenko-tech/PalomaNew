(function PalomaAnimations() {
  "use strict";

  const T = "div";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const coarsePointer = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;
  const isMobile = window.innerWidth < 1025;

  /* Preloader — см. preloader.js */

  /* Custom cursor — см. cursor.js */

  function initHeroParallax() {
    if (reducedMotion) return;
    document.querySelectorAll(".e-hero, .coffee-hero").forEach((hero) => {
      const layers = hero.querySelectorAll(
        ".e-hero__placeholder, .coffee-hero__placeholder",
      );
      if (!layers.length) return;
      let raf;
      function update() {
        const h = hero.offsetHeight || 1;
        const progress = Math.min(Math.max(window.scrollY / h, 0), 1);
        const scale = 1 + progress * 0.18;
        layers.forEach((el) => {
          el.style.transform = `scale(${scale})`;
        });
      }
      window.addEventListener(
        "scroll",
        () => {
          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(update);
        },
        { passive: true },
      );
      update();
    });
  }

  function initReveal() {
    const selector = [
      ".showcase__header",
      ".home-showcase__head",
      ".home-categories__head",
      ".home-blog__head",
      ".process__intro",
      ".reviews__header",
      ".reviews-section__top",
      ".paloma-location__content",
      ".client-hero",
      ".blog-hero",
      ".contacts-studio",
      "[data-reveal]",
    ].join(",");

    const nodes = document.querySelectorAll(selector);
    if (!nodes.length) return;

    if (reducedMotion || typeof IntersectionObserver !== "function") {
      nodes.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    nodes.forEach((el, i) => {
      el.classList.add("paloma-reveal");
      if (i % 3 === 1) el.classList.add("paloma-reveal--delay-1");
      if (i % 3 === 2) el.classList.add("paloma-reveal--delay-2");
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    nodes.forEach((el) => io.observe(el));
  }

  function waveSvg(fillClass) {
    return (
      `<${T} class="paloma-wave ${fillClass}" aria-hidden="true">` +
      `<svg viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M0,34 C180,8 320,52 480,26 C640,2 820,48 980,22 C1140,6 1280,40 1440,28 L1440,56 L0,56 Z"/></svg></${T}>`
    );
  }

  function initSectionWaves() {
    if (reducedMotion || isMobile) return;
    if (!document.body.classList.contains("is-home")) return;

    const hero =
      document.getElementById("homeHero") || document.getElementById("hero");
    const marquee = document.querySelector(".home-marquee");
    const subscription = document.querySelector(
      ".home-sub, .home-subscription-promo, .home-subscription, .sub-block",
    );
    const about = document.querySelector(".home-about-scroll");

    const waveAnchor = marquee || hero;
    if (
      waveAnchor &&
      !waveAnchor.nextElementSibling?.classList?.contains("paloma-wave")
    ) {
      waveAnchor.insertAdjacentHTML("afterend", waveSvg("paloma-wave--to-milk"));
    }
    if (subscription && !subscription.previousElementSibling?.classList?.contains("paloma-wave")) {
      subscription.insertAdjacentHTML("beforebegin", waveSvg("paloma-wave--to-paper"));
    }
    if (about && !about.nextElementSibling?.classList?.contains("paloma-wave")) {
      about.insertAdjacentHTML("afterend", waveSvg("paloma-wave--to-ivory"));
    }
    /* Не вешать paloma-reveal на .home-showcase — иначе вся витрина остаётся opacity: 0 */
  }

  function initProductCards() {
    const cards = document.querySelectorAll(".product-card");
    if (!cards.length) return;

    if (reducedMotion || typeof IntersectionObserver !== "function") {
      cards.forEach((c) => c.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (!e.isIntersecting) return;
          window.setTimeout(() => {
            e.target.classList.add("is-revealed");
          }, (i % 6) * 70);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.06 },
    );
    cards.forEach((el) => io.observe(el));
  }

  initHeroParallax();
  initReveal();
  initSectionWaves();
  initProductCards();
})();
