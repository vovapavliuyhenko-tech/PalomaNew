/* =====================================================
   PALOMA — мягкая авто-прокрутка горизонтальных лент на телефоне.
   Раз в несколько секунд лента плавно (≈1,2 с) сдвигается на одну
   карточку, в конце так же плавно возвращается к началу. Без
   непрерывного requestAnimationFrame: кадры считаются только во время
   короткого сдвига. Касание пальцем — пауза; лента вне экрана стоит.
   ===================================================== */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(max-width: 1024px)').matches) return;

  var SELECTOR = '.home-showcase__viewport, .home-categories__grid, .home-blog__grid';
  var INTERVAL = 3800;   /* пауза между сдвигами, мс */
  var DURATION = 1200;   /* длительность сдвига, мс */
  var RESUME = 6000;     /* после касания ждём столько, прежде чем продолжить */

  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function items(el) {
    var list = el.children.length === 1 ? el.firstElementChild.children : el.children;
    return Array.prototype.filter.call(list, function (c) { return c.offsetWidth > 0; });
  }

  function setup(el) {
    if (el.dataset.mAuto === '1') return;
    el.dataset.mAuto = '1';
    var visible = false, holdUntil = 0, busy = false;

    function animateTo(target) {
      var start = el.scrollLeft, dist = target - start;
      if (Math.abs(dist) < 2) return;
      busy = true;
      var snap = el.style.scrollSnapType;
      el.style.scrollSnapType = 'none';
      var t0 = performance.now();
      function frame(now) {
        if (Date.now() < holdUntil) { done(); return; }   /* палец перехватил ленту */
        var p = Math.min(1, (now - t0) / DURATION);
        el.scrollLeft = start + dist * ease(p);
        if (p < 1) requestAnimationFrame(frame); else done();
      }
      function done() { el.style.scrollSnapType = snap; busy = false; }
      requestAnimationFrame(frame);
    }

    function step() {
      if (!visible || busy || document.hidden || Date.now() < holdUntil) return;
      var cards = items(el);
      if (cards.length < 2) return;
      var max = el.scrollWidth - el.clientWidth;
      if (max < 5) return;
      if (el.scrollLeft >= max - 4) { animateTo(0); return; }
      /* следующая карточка, чей левый край правее текущей позиции */
      var base = cards[0].offsetLeft, cur = el.scrollLeft, next = max;
      for (var i = 0; i < cards.length; i++) {
        var x = cards[i].offsetLeft - base;
        if (x > cur + 4) { next = Math.min(x, max); break; }
      }
      animateTo(next);
    }

    function hold() { holdUntil = Date.now() + RESUME; }
    el.addEventListener('touchstart', hold, { passive: true });
    el.addEventListener('touchmove', hold, { passive: true });
    el.addEventListener('pointerdown', hold, { passive: true });
    el.addEventListener('wheel', hold, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: .5 }).observe(el);
    } else visible = true;

    setInterval(step, INTERVAL);
  }

  function init() { document.querySelectorAll(SELECTOR).forEach(setup); }
  window.initPalomaMobileAutoScroll = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  /* карточки товаров дорисовываются из базы позже — ленты те же, просто подхватим ещё раз */
  window.addEventListener('load', init);
})();
