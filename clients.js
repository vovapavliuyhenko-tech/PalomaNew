(function () {
  "use strict";

  function toggleAriaExpanded(trigger, active) {
    if (!trigger) return;
    trigger.setAttribute(
      "aria-expanded",
      active ? "true" : "false"
    );
  }

  /** Dropdown «Клиентам»: hover desktop, toggle ≤1024, outside-close */
  (function initClientsDropdown() {
    const wrap = document.querySelector(
      ".site-header__dropdown-wrap--clients"
    );
    if (!wrap) return;

    const trigger = wrap.querySelector(
      '.site-header__link--has-dropdown[aria-controls="clientsDropdown"]'
    );
    let hoverTimeout;

    wrap.addEventListener("mouseenter", () => {
      clearTimeout(hoverTimeout);
      wrap.classList.add("is-open");
      toggleAriaExpanded(trigger, true);
    });
    wrap.addEventListener("mouseleave", () => {
      hoverTimeout = window.setTimeout(() => {
        wrap.classList.remove("is-open");
        toggleAriaExpanded(trigger, false);
      }, 160);
    });

    trigger?.addEventListener("click", (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        const open = wrap.classList.toggle("is-open");
        toggleAriaExpanded(trigger, open);
      }
    });

    document.addEventListener("click", (e) => {
      if (!(e.target instanceof Node)) return;
      if (wrap.contains(e.target)) return;
      wrap.classList.remove("is-open");
      toggleAriaExpanded(trigger, false);
    });

    wrap.querySelectorAll(".client-nav-card").forEach((link) => {
      link.addEventListener("click", () => {
        wrap.classList.remove("is-open");
        toggleAriaExpanded(trigger, false);
      });
    });
  })();

  /** Horizontal scroll: стрелки + перетаскивание */
  (function initHscroll() {
    document
      .querySelectorAll("[data-hscroll-outer]")
      .forEach((outer) => {
        const track = outer.querySelector("[data-hscroll-track]");
        const prevBtn = outer.querySelector("[data-hscroll-prev]");
        const nextBtn = outer.querySelector("[data-hscroll-next]");
        if (!track) return;

        function gapPx() {
          const g =
            parseInt(getComputedStyle(track).columnGap, 10) ||
            parseInt(getComputedStyle(track).gap, 10);
          return Number.isFinite(g) ? g : 20;
        }

        function cardStep() {
          const card = track.querySelector(".hscroll-card");
          return card ? card.offsetWidth + gapPx() : 320;
        }

        function updateArrows() {
          if (!prevBtn || !nextBtn) return;
          prevBtn.disabled = track.scrollLeft < 6;
          nextBtn.disabled =
            track.scrollLeft >=
            track.scrollWidth - track.clientWidth - 6;
        }

        prevBtn?.addEventListener("click", () => {
          track.scrollBy({
            left: -cardStep(),
            behavior: "smooth",
          });
        });
        nextBtn?.addEventListener("click", () => {
          track.scrollBy({
            left: cardStep(),
            behavior: "smooth",
          });
        });
        track.addEventListener(
          "scroll",
          updateArrows,
          { passive: true }
        );
        window.addEventListener("resize", updateArrows, {
          passive: true,
        });
        updateArrows();

        let dragging = false;
        let startX = 0;
        let startScroll = 0;

        track.addEventListener("mousedown", (e) => {
          if (e.button !== 0) return;
          dragging = true;
          track.classList.add("is-dragging");
          startX = e.clientX;
          startScroll = track.scrollLeft;
        });

        document.addEventListener("mouseup", () => {
          dragging = false;
          track.classList.remove("is-dragging");
        });

        document.addEventListener("mousemove", (e) => {
          if (!dragging) return;
          e.preventDefault();
          const dx = e.clientX - startX;
          track.scrollLeft = startScroll - dx * 1.4;
          updateArrows();
        });

        window.addEventListener(
          "resize",
          () => {
            if (!dragging) updateArrows();
          },
          { passive: true }
        );
      });
  })();

  /** FAQ accordion */
  (function initFaqAcc() {
    document.querySelectorAll(".faq-acc").forEach((acc) => {
      const head = acc.querySelector(".faq-acc__head");
      head?.addEventListener("click", () => {
        const open = acc.classList.toggle("is-open");
        head.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  })();

  /** FAQ tabs — только если есть панели */
  (function initFaqTabs() {
    const tabs = document.querySelectorAll(".faq-tab");
    const panels = document.querySelectorAll(".faq-tab-panel");
    if (tabs.length === 0 || panels.length === 0) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.tab || "";
        tabs.forEach((t) => {
          const on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute(
            "aria-selected",
            on ? "true" : "false"
          );
          t.tabIndex = on ? 0 : -1;
        });
        panels.forEach((p) =>
          p.classList.toggle(
            "is-active",
            p.dataset.panel === id
          )
        );
      });
    });

    tabs.forEach((tab, i, arr) => {
      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next =
          e.key === "ArrowRight"
            ? (i + 1) % arr.length
            : (i - 1 + arr.length) % arr.length;
        arr[next]?.click();
        arr[next]?.focus();
      });
    });
  })();
})();
