/* ════════════════════════════════════════════════════════
   attribution.js — откуда пришёл покупатель

   Зачем: с рекламы часто кладут букет в корзину, а покупают через
   несколько дней, зайдя на сайт напрямую. В заказ тогда попадает
   «прямой заход», и реклама остаётся без продажи.

   Что делает: при КАЖДОМ заходе смотрит, откуда человек пришёл
   (UTM-метки, клик из Директа, поисковик, соцсеть, прямой заход):
   • первый заход запоминается навсегда и больше не перезаписывается;
   • последний «значимый» заход (не прямой) — обновляется;
   • считаются визиты и дата первого появления.
   Хранится в localStorage + дублируется в cookie на год.

   К каждому заказу и заявке дописывается блок «📊 Источник»:
   window.palomaAttribution.text() — его вызывают checkout.js,
   lead-send.js и paloma-online-order.js.

   ClientID Метрики тоже попадает в заказ: по нему продажу можно
   загрузить в Метрику как офлайн-конверсию, и она привяжется к
   рекламному визиту.

   Подключать на всех страницах сайта ДО cart-core.js.
   ════════════════════════════════════════════════════════ */
(function PalomaAttribution() {
  "use strict";

  var FIRST_KEY = "paloma_first_touch";
  var LAST_KEY = "paloma_last_touch";
  var VISITS_KEY = "paloma_visits";
  var CID_KEY = "paloma_ym_cid";
  var SESSION_KEY = "paloma_session";
  var COOKIE = "pl_ft";
  var METRIKA_ID = 110912456;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* приватный режим */ } }
  function readJSON(s) { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } }

  function cookieGet(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function cookieSet(name, value) {
    try {
      document.cookie = name + "=" + encodeURIComponent(value) +
        "; max-age=" + 60 * 60 * 24 * 400 + "; path=/; SameSite=Lax" +
        (location.protocol === "https:" ? "; Secure" : "");
    } catch (e) { /* ничего */ }
  }

  /* ── откуда пришёл этот заход ────────────────────────── */
  var AD_MEDIUMS = /^(cpc|ppc|cpm|cpa|paid|paidsocial|paid_social|display|banner|retargeting|remarketing|ads?|context|smm_paid|target|targeting)$/i;
  var AD_SOURCES = /(yandex[_-]?direct|^direct$|ya[_-]?direct|google[_-]?ads|adwords|vk[_-]?ads|vk[_-]?reklama|mytarget|facebook[_-]?ads|telegram[_-]?ads|avito[_-]?ads)/i;
  var SEARCH = /(^|\.)(yandex\.[a-z.]+|ya\.ru|google\.[a-z.]+|bing\.com|mail\.ru|duckduckgo\.com|rambler\.ru)$/i;
  var SOCIAL = /(^|\.)(vk\.com|vk\.ru|instagram\.com|t\.me|telegram\.org|web\.telegram\.org|facebook\.com|ok\.ru|youtube\.com|dzen\.ru|pinterest\.[a-z.]+|tiktok\.com|whatsapp\.com|wa\.me)$/i;
  var MAPS = /(^|\.)(2gis\.[a-z.]+|yandex\.[a-z.]+\/maps)$/i;

  function clean(v) { return String(v || "").trim().slice(0, 120); }

  function currentTouch() {
    var q;
    try { q = new URLSearchParams(location.search); } catch (e) { q = { get: function () { return null; } }; }
    var utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      var v = clean(q.get(k));
      if (v) utm[k.slice(4)] = v;
    });
    var clicks = {};
    ["yclid", "gclid", "fbclid", "vkclid", "ysclid"].forEach(function (k) {
      if (q.get(k)) clicks[k] = 1;
    });

    var refHost = "";
    try {
      if (document.referrer) {
        var r = new URL(document.referrer);
        if (r.hostname && r.hostname !== location.hostname) refHost = r.hostname.replace(/^www\./, "");
      }
    } catch (e) { /* битый referrer */ }

    var isAd = !!(clicks.yclid || clicks.gclid || clicks.vkclid ||
      AD_MEDIUMS.test(utm.medium || "") || AD_SOURCES.test(utm.source || ""));

    var type;
    if (isAd) type = "реклама";
    else if (utm.source || utm.medium || utm.campaign) type = "ссылка с меткой";
    else if (refHost && SEARCH.test(refHost)) type = clicks.ysclid || /yandex|ya\.ru/.test(refHost) ? "поиск Яндекса" : "поиск";
    else if (refHost && SOCIAL.test(refHost)) type = "соцсети / мессенджеры";
    else if (refHost && MAPS.test(refHost)) type = "карты";
    else if (refHost) type = "переход с сайта";
    else type = "прямой заход";

    return {
      at: new Date().toISOString(),
      type: type,
      ad: isAd,
      utm: utm,
      click: Object.keys(clicks).join(","),
      ref: refHost,
      page: location.pathname.slice(0, 120),
    };
  }

  /* ── запоминание ─────────────────────────────────────── */
  var now = currentTouch();
  var first = readJSON(lsGet(FIRST_KEY)) || readJSON(cookieGet(COOKIE));

  if (!first) {
    first = now;
    /* Человек мог бывать на сайте до того, как мы начали запоминать
       источник. Метрика хранит дату его первого визита в cookie _ym_d —
       если она заметно старше сегодняшнего дня, это не новый клиент. */
    var ymd = parseInt(cookieGet("_ym_d") || "", 10);
    if (ymd && Date.now() / 1000 - ymd > 3600) {
      first.before = new Date(ymd * 1000).toISOString();
    }
  }
  lsSet(FIRST_KEY, JSON.stringify(first));
  cookieSet(COOKIE, JSON.stringify({ at: first.at, type: first.type, ad: first.ad, utm: first.utm, click: first.click, ref: first.ref, before: first.before }));

  /* Последний значимый источник: прямой заход не затирает рекламу */
  var last = readJSON(lsGet(LAST_KEY));
  if (now.type !== "прямой заход" || !last) {
    last = now;
    lsSet(LAST_KEY, JSON.stringify(last));
  }

  /* Визиты: новая вкладка/сессия = новый визит */
  var visits = readJSON(lsGet(VISITS_KEY)) || { n: 0, ads: 0 };
  var inSession = false;
  try { inSession = sessionStorage.getItem(SESSION_KEY) === "1"; sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) { /* ничего */ }
  if (!inSession) {
    visits.n += 1;
    if (now.ad) visits.ads += 1;
    visits.lastAt = now.at;
    lsSet(VISITS_KEY, JSON.stringify(visits));
  }

  /* ClientID Метрики — когда счётчик загрузится */
  function grabClientId(tries) {
    try {
      if (typeof window.ym === "function") {
        window.ym(METRIKA_ID, "getClientID", function (id) { if (id) lsSet(CID_KEY, String(id)); });
        return;
      }
    } catch (e) { /* ничего */ }
    if (tries > 0) setTimeout(function () { grabClientId(tries - 1); }, 1500);
  }
  grabClientId(8);

  /* ── текст для менеджера ─────────────────────────────── */
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    var p = function (n) { return String(n).padStart(2, "0"); };
    return p(d.getDate()) + "." + p(d.getMonth() + 1) + "." + d.getFullYear();
  }
  function daysSince(iso) {
    return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  }
  function describe(t) {
    var parts = [t.type];
    var u = t.utm || {};
    var tags = [u.source, u.medium, u.campaign].filter(Boolean).join(" / ");
    if (tags) parts.push(tags);
    else if (t.ref) parts.push(t.ref);
    if (u.content) parts.push("объявление: " + u.content);
    if (u.term) parts.push("запрос: " + u.term);
    return parts.join(" — ");
  }

  function info() {
    var f = readJSON(lsGet(FIRST_KEY)) || first;
    var l = readJSON(lsGet(LAST_KEY)) || last;
    var v = readJSON(lsGet(VISITS_KEY)) || visits;
    var knownSince = f.before || f.at;
    var isNew = !f.before && v.n <= 1 && daysSince(f.at) < 1;
    return {
      first: f,
      last: l,
      visits: v.n,
      adVisits: v.ads,
      isNew: isNew,
      days: daysSince(knownSince),
      anyAd: !!(f.ad || l.ad || v.ads),
      clientId: lsGet(CID_KEY) || cookieGet("_ym_uid") || "",
    };
  }

  function text() {
    var a = info();
    var lines = ["", "📊 ИСТОЧНИК"];
    lines.push("Реклама: " + (a.anyAd ? "ДА" + (a.first.ad ? " (первый заход с рекламы)" : " (был заход с рекламы)") : "нет"));
    lines.push("Клиент: " + (a.isNew
      ? "новый (первый визит)"
      : "вернувшийся — визит № " + a.visits + (a.days ? ", впервые " + a.days + " дн. назад" : ", впервые сегодня")));
    lines.push("Первый заход: " + (a.first.before
      ? "до " + fmtDate(a.first.at) + " (впервые " + fmtDate(a.first.before) + ", источник тогда не записывался)"
      : fmtDate(a.first.at) + " — " + describe(a.first)));
    if (a.last && a.last.at !== a.first.at) lines.push("Последний источник: " + fmtDate(a.last.at) + " — " + describe(a.last));
    if (a.first.page && !a.first.before) lines.push("Вход на страницу: " + a.first.page);
    if (a.clientId) lines.push("Метрика ClientID: " + a.clientId);
    return lines.join("\n");
  }

  window.palomaAttribution = { info: info, text: text };
})();
