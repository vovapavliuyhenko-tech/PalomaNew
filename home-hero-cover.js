/* =====================================================
   HOME COVER HERO — scroll-driven zoom / parallax
   Replicates hide-event.tilda.ws scroll aesthetic:
   · "paloma" word scales up dramatically and fades out
   · background photo zooms in (slow scale)
   · tagline + bottombar fade out quickly
   ===================================================== */

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init() {
    if (!document.body.classList.contains('is-home')) return;

    var section = document.querySelector('.paloma-cover');
    if (!section) return;

    var word    = section.querySelector('.paloma-cover__word');
    var bg      = section.querySelector('.paloma-cover__bg');
    var tagline = section.querySelector('.paloma-cover__tagline');
    var bar     = section.querySelector('.paloma-cover__bottombar');

    if (!word || !bg) return;

    /* GPU hints */
    word.style.willChange    = 'transform, opacity';
    bg.style.willChange      = 'transform';
    if (tagline) tagline.style.willChange = 'transform, opacity';

    var rafId = null;

    /* After entry animations finish, clear them so inline
       styles take full control without fighting fill-mode.
       Both word AND tagline have forwards fill — both must be cleared. */
    var wordCleared    = false;
    var taglineCleared = false;

    function clearWordAnim() {
      if (wordCleared) return;
      wordCleared = true;
      word.style.animation = 'none';
      word.style.opacity   = '1';
      word.style.transform = 'scale(1)';
    }

    function clearTaglineAnim() {
      if (taglineCleared) return;
      taglineCleared = true;
      if (!tagline) return;
      tagline.style.animation = 'none';
      tagline.style.opacity   = '1';
      tagline.style.transform = 'translateY(0) scale(1)';
    }

    word.addEventListener('animationend', clearWordAnim, { once: true });
    setTimeout(clearWordAnim, 2600);

    if (tagline) {
      tagline.addEventListener('animationend', clearTaglineAnim, { once: true });
      /* tagline delay is 1.15s + 1s duration = ~2.2s; fallback at 2.8s */
      setTimeout(clearTaglineAnim, 2800);
    }

    function tick() {
      rafId = null;

      var scrollY = window.scrollY;
      var heroH   = section.offsetHeight;

      /* Once hero is fully off-screen, stop */
      if (scrollY > heroH) return;

      var p = scrollY / heroH; /* 0 → 1 */

      /* ── Word: drift down + scale up + fade out ─────── */
      var wScale   = 1 + p * 1.6;
      var wDriftY  = (p * 200).toFixed(1); /* px in viewport space */
      var wOpacity = Math.max(0, 1 - p * 2.1);
      word.style.transform = 'translateY(' + wDriftY + 'px) scale(' + wScale.toFixed(4) + ')';
      word.style.opacity   = wOpacity.toFixed(4);

      /* ── Tagline: drift down (same feel as word) + fade ── */
      var uiAlpha    = (Math.max(0, 1 - p * 3.2)).toFixed(4);
      var tagDriftY  = (p * 120).toFixed(1);
      var tagScale   = (1 + p * 0.18).toFixed(4);
      if (tagline) {
        tagline.style.transform = 'translateY(' + tagDriftY + 'px) scale(' + tagScale + ')';
        tagline.style.opacity   = uiAlpha;
      }
      if (bar) bar.style.opacity = (Math.max(0, 1 - p * 4.5)).toFixed(4);

      /* ── Background: zoom in (scale 1 → 1.22) ────────── */
      var bgScale = (1 + p * 0.22).toFixed(4);
      bg.style.transform = 'scale(' + bgScale + ')';
    }

    window.addEventListener('scroll', function () {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    /* Reset on scroll back to top */
    window.addEventListener('scroll', function () {
      if (window.scrollY === 0) {
        word.style.transform  = 'scale(1)';
        word.style.opacity    = '1';
        if (tagline) { tagline.style.opacity = '1'; tagline.style.transform = 'translateY(0) scale(1)'; }
        if (bar)     bar.style.opacity     = '1';
        bg.style.transform    = 'scale(1)';
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
