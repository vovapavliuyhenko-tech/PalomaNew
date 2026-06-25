/* PALOMA — «Преимущества»: scroll-driven веер карточек.
   Карточки стартуют сложенной стопкой по центру и по мере прокрутки
   закреплённой секции разъезжаются веером с поворотом. */
(function () {
  var sec = document.getElementById("advantages");
  if (!sec) return;

  var cards = Array.prototype.slice.call(sec.querySelectorAll(".adv__card"));
  var photos = Array.prototype.slice.call(sec.querySelectorAll(".adv__photo"));
  var spark = sec.querySelector(".adv__spark");
  var stage = sec.querySelector(".adv__stage");
  if (!cards.length || !stage) return;

  var n = cards.length;
  var mqDesktop = window.matchMedia("(min-width: 900px)");
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var active = false;
  var ticking = false;

  // нормированная позиция карточки в веере: -1 (слева) .. +1 (справа)
  var T = cards.map(function (_, i) {
    return n > 1 ? (i / (n - 1)) * 2 - 1 : 0;
  });

  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function render() {
    ticking = false;
    if (!active) return;

    var vh = window.innerHeight;
    var total = sec.offsetHeight - vh;
    var top = sec.getBoundingClientRect().top;
    var p = total > 0 ? clamp01(-top / total) : 0;

    var spread = easeOut(clamp01(p / 0.85)); // полный веер к 85% прокрутки
    var halfW = stage.clientWidth / 2;

    for (var i = 0; i < n; i++) {
      var t = T[i];
      var rev = clamp01((p - i * 0.05) * 3.2);       // ступенчатое появление
      var s = 0.84 + 0.16 * rev;
      var xPx = t * (halfW * 0.70) * spread;
      var yArc = (Math.abs(t) * 158 - 64) * spread;  // дуга: центр выше краёв
      var yStagger = (i % 2 ? 44 : -14) * spread;
      var yIn = (1 - rev) * 96;                        // въезд снизу
      var yPx = yArc + yStagger + yIn;
      var rot = t * 15 * spread + (i % 2 ? 3 : -3) * spread;
      cards[i].style.transform =
        "translate(-50%,-50%) translate(" + xPx.toFixed(1) + "px," +
        yPx.toFixed(1) + "px) rotate(" + rot.toFixed(2) + "deg) scale(" + s.toFixed(3) + ")";
      cards[i].style.opacity = rev.toFixed(3);
      cards[i].style.zIndex = String(10 + (t < 0 ? i : n - i));
    }

    for (var k = 0; k < photos.length; k++) {
      var pr = clamp01((p - 0.05 - k * 0.04) * 2.4);
      photos[k].style.transform = "translateY(" + ((1 - pr) * 70).toFixed(1) + "px)";
      photos[k].style.opacity = (pr * 0.92).toFixed(3);
    }
    if (spark) {
      var sp = clamp01((p - 0.35) * 2);
      spark.style.transform = "translateY(" + ((1 - sp) * 80).toFixed(1) + "px) rotate(" + (sp * -8).toFixed(1) + "deg)";
      spark.style.opacity = sp.toFixed(3);
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(render); }
  }

  function reset() {
    for (var i = 0; i < n; i++) { cards[i].style.transform = ""; cards[i].style.opacity = ""; cards[i].style.zIndex = ""; }
    for (var k = 0; k < photos.length; k++) { photos[k].style.transform = ""; photos[k].style.opacity = ""; }
    if (spark) { spark.style.transform = ""; spark.style.opacity = ""; }
  }

  function setup() {
    var on = mqDesktop.matches && !mqReduce.matches;
    if (on === active) { if (active) render(); return; }
    active = on;
    if (active) { render(); }
    else { reset(); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { setup(); onScroll(); }, { passive: true });
  if (mqDesktop.addEventListener) {
    mqDesktop.addEventListener("change", setup);
    mqReduce.addEventListener("change", setup);
  } else if (mqDesktop.addListener) {
    mqDesktop.addListener(setup);
    mqReduce.addListener(setup);
  }
  setup();
})();
