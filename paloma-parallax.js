/* =====================================================
   PALOMA — section parallax effects
   · Subscription block: background moves at ~40% scroll
     speed, creating a floating-card-over-photo effect
     similar to skladcvetov73.ru
   ===================================================== */

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init() {

    /* ── Subscription parallax ─────────────────────── */
    var section = document.getElementById('subscription');
    if (!section) return;

    var bg = section.querySelector('.home-subscription__bg');
    if (!bg) return;

    var rafId = null;

    function tick() {
      rafId = null;

      var rect   = section.getBoundingClientRect();
      var viewH  = window.innerHeight;
      var sectH  = section.offsetHeight;

      /* Skip when fully off-screen */
      if (rect.bottom < 0 || rect.top > viewH) return;

      /* progress 0 → 1 as section scrolls from bottom of viewport to top */
      var progress = (viewH - rect.top) / (viewH + sectH);
      progress = Math.max(0, Math.min(1, progress));

      /* Bg travels ±200px (400px total) — CSS sets top/bottom: -200px
         so the image always covers the section completely.
         At progress=0  → bgY = -200 (bg shifted up, shows lower part of photo)
         At progress=0.5 → bgY =  0  (centered)
         At progress=1  → bgY = +200 (bg shifted down, shows upper part)       */
      var bgY = (progress * 520 - 260).toFixed(2);
      bg.style.transform = 'translateY(' + bgY + 'px)';
    }

    window.addEventListener('scroll', function () {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    /* Kick off on load so initial position is correct */
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
