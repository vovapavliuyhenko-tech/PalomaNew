/* =====================================================
   PALOMA — блок «Процесс» (#process на «Оформлении», #cf-steps в кофейне):
   вертикальная прокрутка плавно листает ленту по горизонтали.
   · Лента не прыгает за скроллом, а мягко догоняет его (сглаживание на rAF),
     сдвиг через translate3d — работает на видеокарте.
   · Высоты в lvh (CSS): при скрытии адресной строки на телефоне ничего не
     пересчитывается, поэтому нет тряски, из-за которой раньше эффект
     выключали на мобильных.
   · Кадры считаются только пока лента догоняет цель; вне экрана — тишина.
   ===================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setup(sec) {
    var sticky = sec.querySelector('.ea-proc__sticky');
    var track = sec.querySelector('.ea-proc__track');
    var bar = sec.querySelector('.ea-proc__bar, [id$="Bar"]');
    if (!sticky || !track) return;
    document.documentElement.classList.add('has-hscroll');

    var cur = 0, target = 0, max = 0, raf = 0;

    function measure() {
      max = Math.max(0, track.scrollWidth - sticky.clientWidth);
    }
    function progress() {
      var dist = sec.offsetHeight - sticky.offsetHeight;
      if (dist <= 0) return 0;
      var p = -sec.getBoundingClientRect().top / dist;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    }
    function paint() {
      track.style.setProperty('transform', 'translate3d(' + (-cur).toFixed(2) + 'px,0,0)', 'important');
      if (bar) bar.style.width = (max ? cur / max * 100 : 0).toFixed(1) + '%';
    }
    function frame() {
      var d = target - cur;
      if (reduce || Math.abs(d) < 0.4) { cur = target; paint(); raf = 0; return; }
      cur += d * 0.11;   /* мягкое догоняние: чем дальше — тем быстрее, у цели — плавно тормозит */
      paint();
      raf = requestAnimationFrame(frame);
    }
    function onScroll() {
      target = progress() * max;
      if (!raf) raf = requestAnimationFrame(frame);
    }
    var lastW = window.innerWidth;
    function onResize() {
      /* адресная строка меняет только высоту — ширину ленты не трогает */
      if (window.innerWidth === lastW && max) return;
      lastW = window.innerWidth;
      measure(); onScroll();
    }

    measure();
    target = cur = progress() * max;
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', function () { measure(); onScroll(); });
  }

  function init() {
    ['process', 'cf-steps'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) setup(s);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
