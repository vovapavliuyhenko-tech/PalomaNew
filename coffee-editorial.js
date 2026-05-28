/* =====================================================
   PALOMA Coffee — editorial interactions
   · Menu: photo follows cursor (sjostrand style)
   · Story panels: parallax background
   · Stages: drag-to-scroll
   ===================================================== */

(function () {
  'use strict';

  /* ── Cursor-following image on menu hover ──────────────── */
  function initMenuCursor() {
    var wrapper = document.getElementById('cofCursorImg');
    var imgEl   = document.getElementById('cofCursorImgEl');
    if (!wrapper || !imgEl) return;

    /* Position tracks raw mouse; wrapper position lerps toward it */
    var mouseX = 0, mouseY = 0;
    var posX   = 0, posY   = 0;
    var rafId  = null;
    var active = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      posX = lerp(posX, mouseX, 0.1);
      posY = lerp(posY, mouseY, 0.1);
      wrapper.style.left = posX + 'px';
      wrapper.style.top  = posY + 'px';
      if (active) rafId = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    var items = document.querySelectorAll('[data-cof-img]');
    var currentSrc = '';

    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        var src = item.getAttribute('data-cof-img');
        if (src && src !== currentSrc) {
          currentSrc = src;
          imgEl.src  = src;
        }
        wrapper.classList.add('is-visible');
        active = true;
        if (!rafId) rafId = requestAnimationFrame(animate);
      });

      item.addEventListener('mouseleave', function () {
        wrapper.classList.remove('is-visible');
        active = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      });
    });
  }

  /* ── Parallax on dark story panels ────────────────────── */
  function initPanelParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var panels = document.querySelectorAll('.cof-panel');
    if (!panels.length) return;

    var rafId = null;

    function tick() {
      rafId = null;
      var viewH = window.innerHeight;

      panels.forEach(function (panel) {
        var bg = panel.querySelector('.cof-panel__bg');
        if (!bg) return;

        var rect  = panel.getBoundingClientRect();
        var sectH = panel.offsetHeight;
        if (rect.bottom < 0 || rect.top > viewH) return;

        /* progress 0→1 as section travels bottom-of-viewport → top */
        var progress = (viewH - rect.top) / (viewH + sectH);
        progress = Math.max(0, Math.min(1, progress));

        /* bg travels ±160px; CSS sets top/bottom: -160px */
        var bgY = (progress * 320 - 160).toFixed(2);
        bg.style.transform = 'translateY(' + bgY + 'px)';
      });
    }

    window.addEventListener('scroll', function () {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    requestAnimationFrame(tick);
  }

  /* ── Drag-to-scroll on stages viewport ────────────────── */
  function initDragScroll() {
    var viewport = document.querySelector('.cof-stages__viewport');
    if (!viewport) return;

    var isDown = false;
    var startX, startScrollLeft;

    viewport.addEventListener('mousedown', function (e) {
      isDown = true;
      startX = e.pageX - viewport.offsetLeft;
      startScrollLeft = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
    });

    document.addEventListener('mouseup', function () {
      if (!isDown) return;
      isDown = false;
      viewport.classList.remove('is-dragging');
    });

    viewport.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x    = e.pageX - viewport.offsetLeft;
      var walk = (x - startX) * 1.4;
      viewport.scrollLeft = startScrollLeft - walk;
    });

    /* Prevent link clicks after drag */
    viewport.addEventListener('click', function (e) {
      if (Math.abs(viewport.scrollLeft - startScrollLeft) > 4) {
        e.preventDefault();
      }
    });
  }

  /* ── Boot ──────────────────────────────────────────────── */
  function init() {
    initMenuCursor();
    initPanelParallax();
    initDragScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
