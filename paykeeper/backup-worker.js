/* ════════════════════════════════════════════════════════════════════════
   PALOMA — РЕЗЕРВНЫЙ сервер заказов и оплаты (Cloudflare Worker).

   Зачем: основной сервер — функция в Яндекс Облаке. Когда облако падает
   (11.10.2026 — инцидент «Недоступность зон Yandex Cloud»), сайт не мог ни
   создать оплату, ни передать заказ в бот. Сайт сначала стучится в Яндекс,
   и только если тот не ответил — сюда (см. palomaFetch в payment-config.js).

   Умеет то же, что нужно покупателю:
     ?a=ping      — проверка (и доступен ли PayKeeper: &pk=1)
     ?a=create    — счёт в PayKeeper → ссылка на оплату (+ заказ сразу в бот)
     ?a=notify    — заказ «при получении», заявка с формы, «оплачено» со
                    страницы «спасибо» (оплата проверяется в самом PayKeeper)
     ?a=webhook   — POST-оповещение PayKeeper (если адрес вписать в ЛК)
   Базы нет: заказы идут сразу в Telegram (без CRM — её вернёт Яндекс).

   Секреты (Settings → Variables → Add, тип Secret) — те же, что у функции:
     PK_USER, PK_PASSWORD, PK_SECRET, TG_BOT_TOKEN, TG_CHAT_ID
   Обычные переменные (не обязательно):
     PK_SERVER = https://paloma.server.paykeeper.ru
   ════════════════════════════════════════════════════════════════════════ */

const SITE = "https://paloma.website";
const ORIGINS = [SITE, "https://www.paloma.website", "http://localhost:8765", "http://127.0.0.1:8765"];

/* ── прайс: берём с самого сайта (тот же, что видит покупатель) ── */
let PRICE = null, PRICE_AT = 0;
async function loadPrice() {
  if (PRICE && Date.now() - PRICE_AT < 10 * 60 * 1000) return PRICE;
  const grab = async (path) => {
    const t = await (await fetch(SITE + "/" + path + "?w=" + Math.floor(Date.now() / 600000))).text();
    return JSON.parse(t.slice(t.indexOf("["), t.lastIndexOf("]") + 1));
  };
  const [products, coffee] = await Promise.all([grab("paloma-products.js"), grab("coffee-menu-data.js")]);
  PRICE = { products, coffee };
  PRICE_AT = Date.now();
  return PRICE;
}

const FIXED = { "upsell-coffee": 250, "upsell-vase": 1500, "upsell-secateurs": 1000, "upsell-dessert": 190 };
const COFFEE_ADDONS_MAX = 200, OPEN_MIN = 100, OPEN_MAX = 300000, DELIVERY_ALLOWED = [0, 350];

function allowedRange(id, P) {
  id = String(id || "");
  const p = P.products.filter((x) => id === x.id || id.startsWith(x.id + "-")).sort((a, b) => b.id.length - a.id.length)[0];
  if (p) {
    const base = Number(p.price) || 0;
    const addons = (p.addons || []).reduce((s, a) => s + (Number(a.price) || 0), 0);
    if ((p.categories || []).includes("authors")) return { min: 3000, max: (base >= 18000 ? 40000 : 30000) + addons };
    const maxDelta = (p.sizes || []).reduce((m, s) => Math.max(m, Number(s.priceDelta) || 0), 0);
    return { min: base, max: base + maxDelta + addons };
  }
  const cof = P.coffee.filter((x) => id.startsWith(x.id)).sort((a, b) => b.id.length - a.id.length)[0];
  if (cof) {
    const prices = String(cof.priceLabel || "").split("/").map((s) => parseInt(s.replace(/[^0-9]/g, ""), 10)).filter((n) => n > 0);
    const base = Number(cof.price) || 0;
    return { min: Math.min(prices.length ? Math.min(...prices) : base, base), max: Math.max(prices.length ? Math.max(...prices) : base, base) + COFFEE_ADDONS_MAX };
  }
  /* допы букета (открытка, ваза…) */
  for (const pr of P.products) for (const a of pr.addons || []) if (a.id === id) return { min: a.price, max: a.price };
  if (FIXED[id] != null) return { min: FIXED[id], max: FIXED[id] };
  return { min: OPEN_MIN, max: OPEN_MAX };
}

function verifyCart(body, P) {
  const raw = Array.isArray(body.items) ? body.items : [];
  if (!raw.length || raw.length > 50) return { error: "Корзина пуста или слишком большая" };
  const delivery = Number(body.delivery) || 0;
  if (!DELIVERY_ALLOWED.includes(delivery)) return { error: "Недопустимая стоимость доставки" };
  const names = [];
  let sum = 0;
  for (const it of raw) {
    const price = Number(it.price), qty = Number(it.qty) || 1;
    if (!Number.isFinite(price) || price <= 0) return { error: "Некорректная цена позиции" };
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return { error: "Некорректное количество" };
    const r = allowedRange(it.id, P);
    if (price < r.min || price > r.max) return { error: "Цена позиции не совпадает с каталогом: " + it.id };
    sum += price * qty;
    names.push(String(it.name || "Позиция") + (qty > 1 ? " × " + qty : ""));
  }
  if (delivery > 0) { sum += delivery; names.push("Доставка"); }
  if (sum < 1) return { error: "Сумма заказа меньше 1 ₽" };
  return { names, total: sum };
}

/* ── Telegram ── */
async function tg(env, text) {
  if (!env.TG_BOT_TOKEN || !env.TG_CHAT_ID) return false;
  let any = false;
  for (const chat of String(env.TG_CHAT_ID).split(",").map((s) => s.trim()).filter(Boolean)) {
    try {
      const r = await fetch("https://api.telegram.org/bot" + env.TG_BOT_TOKEN + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: String(text).slice(0, 4000), disable_web_page_preview: true }),
      });
      if (r.ok) any = true;
    } catch (e) { /* следующий чат */ }
  }
  return any;
}

/* ── PayKeeper ── */
const pkServer = (env) => String(env.PK_SERVER || "https://paloma.server.paykeeper.ru").replace(/\/+$/, "");
const pkAuth = (env) => "Basic " + btoa(unescape(encodeURIComponent(env.PK_USER + ":" + env.PK_PASSWORD)));
async function pkFetch(env, path, init, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms || 12000);
  try { return await fetch(pkServer(env) + path, Object.assign({}, init || {}, { signal: c.signal })); }
  finally { clearTimeout(t); }
}
async function pkPaid(env, orderId) {
  try {
    const r = await pkFetch(env, "/info/payments/byorderid/?id=" + encodeURIComponent(orderId), { headers: { Authorization: pkAuth(env) } }, 9000);
    if (!r.ok) return null;
    const d = await r.json().catch(() => null);
    const list = Array.isArray(d) ? d : d && Array.isArray(d.payments) ? d.payments : null;
    if (!list) return null;
    const ok = list.find((p) => p && /^success$/i.test(String(p.status || "")));
    return ok ? { paid: true, sum: Number(ok.pay_amount != null ? ok.pay_amount : ok.sum) || 0 } : { paid: false };
  } catch (e) { return null; }
}

/* без базы: не шлём одно и то же дважды (кэш на час) */
async function once(key) {
  const cache = caches.default, req = new Request("https://dedupe.paloma/" + encodeURIComponent(key));
  if (await cache.match(req)) return false;
  await cache.put(req, new Response("1", { headers: { "Cache-Control": "max-age=3600" } }));
  return true;
}

async function md5(s) {
  const buf = await crypto.subtle.digest("MD5", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : SITE,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
const json = (status, data, origin) => new Response(JSON.stringify(data), { status, headers: Object.assign({ "Content-Type": "application/json" }, cors(origin)) });
const fmt = (n) => Number(n).toLocaleString("ru-RU");
const TAG = "\n\n⚙️ через резервный сервер (Яндекс Облако недоступно) — в CRM не попал";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const a = url.searchParams.get("a") || "";
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });

    if (a === "ping") {
      const out = { ok: true, backup: true, настроен: !!(env.PK_USER && env.PK_PASSWORD && env.TG_BOT_TOKEN && env.TG_CHAT_ID) };
      if (url.searchParams.get("pk")) {
        const t0 = Date.now();
        try { const r = await pkFetch(env, "/info/settings/token/", { headers: { Authorization: pkAuth(env) } }, 12000); out.paykeeper = r.status; }
        catch (e) { out.paykeeper = "нет ответа: " + (e && e.message); }
        out.paykeeper_ms = Date.now() - t0;
      }
      return json(200, out, origin);
    }

    if (a === "webhook" && request.method === "POST") {
      const p = new URLSearchParams(await request.text());
      const id = p.get("id") || "", sum = p.get("sum") || "", clientid = p.get("clientid") || "", orderid = p.get("orderid") || "";
      const amount = Number(sum);
      const expected = await md5(id + (Number.isFinite(amount) ? amount.toFixed(2) : sum) + clientid + orderid + (env.PK_SECRET || ""));
      if (!env.PK_SECRET || p.get("key") !== expected) return new Response("Error! Bad signature", { status: 401 });
      if (await once("paid:" + orderid)) await tg(env, "✅ ОПЛАЧЕН (онлайн картой)\n№ " + orderid + "\nСумма: " + fmt(amount) + " ₽\nКлиент: " + (clientid || "—") + TAG);
      return new Response("OK " + (await md5(id + env.PK_SECRET)), { headers: { "Content-Type": "text/plain" } });
    }

    if (request.method !== "POST") return json(405, { error: "POST only" }, origin);
    let body = {};
    try { body = await request.json(); } catch (e) { return json(400, { error: "Некорректный запрос" }, origin); }
    const orderId = String(body.orderId || "").trim();
    if (!/^[A-Za-z0-9-]{6,64}$/.test(orderId)) return json(400, { error: "Некорректный номер заказа" }, origin);
    const details = String(body.managerText || "").slice(0, 3500);

    if (a === "create") {
      if (!env.PK_USER || !env.PK_PASSWORD) return json(500, { error: "Резервный сервер не настроен" }, origin);
      let P;
      try { P = await loadPrice(); } catch (e) { return json(502, { error: "Не удалось загрузить прайс" }, origin); }
      const cart = verifyCart(body, P);
      if (cart.error) return json(400, { error: cart.error }, origin);
      const tr = await pkFetch(env, "/info/settings/token/", { headers: { Authorization: pkAuth(env) } }, 12000).catch(() => null);
      const tj = tr ? await tr.json().catch(() => ({})) : {};
      if (!tr || !tr.ok || !tj.token) return json(502, { error: "PayKeeper не выдал токен" }, origin);
      const form = new URLSearchParams({
        token: tj.token,
        pay_amount: cart.total.toFixed(2),
        clientid: String(body.clientName || "Покупатель PALOMA").slice(0, 128),
        orderid: orderId,
        service_name: cart.names.join(", ").slice(0, 250),
      });
      if (body.email) form.set("client_email", String(body.email).slice(0, 128));
      if (body.phone) form.set("client_phone", String(body.phone).replace(/\D/g, "").slice(0, 16));
      const ir = await pkFetch(env, "/change/invoice/preview/", {
        method: "POST",
        headers: { Authorization: pkAuth(env), "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      }, 15000).catch(() => null);
      const ij = ir ? await ir.json().catch(() => ({})) : {};
      if (!ir || !ir.ok || !ij.invoice_id) return json(502, { error: ij.msg || "PayKeeper не принял заказ" }, origin);
      /* базы нет — заказ сразу в бот, с пометкой, что оплата ещё не подтверждена */
      await tg(env, "🆕 НОВЫЙ ЗАКАЗ (⏳ ждёт оплаты картой)\n№ " + orderId + "\nСумма: " + fmt(cart.total) + " ₽\n\n" + (details || cart.names.join(", ")) + TAG);
      return json(200, { paymentUrl: pkServer(env) + "/bill/" + ij.invoice_id + "/", orderId, total: cart.total, backup: true }, origin);
    }

    if (a === "notify") {
      if (body.payment === "online_paid") {
        const info = await pkPaid(env, orderId);
        if (!info) return json(200, { ok: true, orderId, pending: true }, origin);
        if (!info.paid) return json(200, { ok: true, orderId, notPaid: true }, origin);
        let ok = true;
        if (await once("paid:" + orderId)) ok = await tg(env, "✅ ОПЛАЧЕН (онлайн картой)\n№ " + orderId + "\nСумма: " + fmt(info.sum) + " ₽\n\n" + details + TAG);
        return json(200, { ok: true, orderId, delivered: ok }, origin);
      }
      if (!details) return json(400, { error: "Пустой заказ" }, origin);
      if (!(await once("n:" + orderId))) return json(200, { ok: true, orderId, delivered: true, dup: true }, origin);
      let msg;
      if (body.kind === "event_lead") msg = details + "\n№ " + orderId;
      else {
        let total = "";
        try { const c = verifyCart(body, await loadPrice()); if (!c.error) total = "\nСумма: " + fmt(c.total) + " ₽"; } catch (e) { /* без суммы */ }
        const head = body.payment === "payment_failed" ? "" :
          "🆕 НОВЫЙ ЗАКАЗ" + (body.payment === "payment_on_receipt" ? " (оплата при получении)" : "");
        msg = (head ? head + "\n" : "") + "№ " + orderId + total + "\n\n" + details;
      }
      const ok = await tg(env, msg + TAG);
      return json(ok ? 200 : 502, { ok, orderId, delivered: ok }, origin);
    }

    return json(404, { error: "Неизвестное действие" }, origin);
  },
};
