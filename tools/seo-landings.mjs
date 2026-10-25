/* ════════════════════════════════════════════════════════
   tools/seo-landings.mjs — посадочные страницы под поводы и города
   (вызывается из build-seo.mjs при каждой публикации).

   /povod/<повод>/     — «букет на день рождения», «цветы маме»…
   /dostavka/<город>/  — «доставка цветов в Геленджик»…

   Подборка букетов на каждой странице собирается из базы сама — по
   ключевым словам в названии/описании и по цене, от дешёвых к дорогим.
   Факты о доставке — только те, что написаны на странице «Доставка».
   ════════════════════════════════════════════════════════ */

const DELIVERY_FACTS = "Доставляем примерно за 1–1,5 часа — точное время или удобный интервал согласуем с вами при оформлении. Перед отправкой пришлём фото букета. Везут наши сотрудники, букет едет в аквабоксе.";

export const OCCASIONS = {
  "den-rozhdeniya": {
    h1: "Букет на день рождения с доставкой в Новороссийске",
    title: "Букет на день рождения — доставка цветов в Новороссийске",
    menu: "На день рождения",
    pick: { cats: ["authors", "duo", "compositions"] },
    intro: "Цветы на день рождения — самый частый повод заказать букет. Подобрали букеты, которые одинаково хорошо смотрятся в руках именинницы и на праздничном столе: от компактных монобукетов до пышных авторских.",
    text: [
      "Не знаете, что выбрать? Беспроигрышный вариант — монобукет из гортензий или пионовидных роз: он объёмный, нарядный и стоит недорого. Для близкого человека подойдёт авторский букет в любимых цветах именинницы — напишите пожелания в комментарии к заказу.",
      "К букету можно добавить открытку с вашим текстом, вазу, шоколад или кофе из нашей кофейни — привезём всё вместе.",
    ],
    faq: [
      ["Можно доставить букет ко времени поздравления?", "Да. При оформлении укажите удобное время или интервал — курьер позвонит заранее и согласует доставку."],
      ["Можно ли сделать сюрприз и не говорить получателю?", "Да, выберите «Другой получатель» при оформлении — мы свяжемся с получателем только для согласования времени, не раскрывая сюрприз заранее."],
      ["Сколько стоит букет на день рождения?", "Букеты в подборке — от самых бюджетных до больших авторских; цена указана на карточке, на странице букета можно выбрать размер."],
    ],
  },
  mame: {
    h1: "Цветы маме с доставкой в Новороссийске",
    title: "Букет маме — нежные цветы с доставкой в Новороссийске",
    menu: "Маме",
    pick: { words: /гортенз|пионовид|нежн|пудр|эустом|кремов|бел|облак|светл|пастел/i },
    intro: "Для мамы — нежные и светлые букеты: гортензии, пионовидные и французские розы, эустома в пастельных оттенках. Такие цветы долго стоят и создают настроение дома.",
    text: [
      "Если не знаете любимые цветы мамы, выбирайте гортензию: пышная, нежная и очень благодарная в вазе. Пионовидные розы — для особенного случая, они раскрываются несколько дней и красиво меняются.",
      "Можем подписать открытку от вашего имени и доставить букет в удобное маме время.",
    ],
    faq: [
      ["Какие цветы подарить маме?", "Чаще всего выбирают гортензии, пионовидные и французские розы в светлых оттенках — они нежные и долго стоят."],
      ["Можно доставить маме в другой город?", "Доставляем по Новороссийску, в Абрау-Дюрсо, Геленджик и Анапу. Стоимость — на странице «Доставка»."],
      ["Пришлёте фото букета?", "Да, перед отправкой пришлём фото — вы увидите, какой букет получит мама."],
    ],
  },
  lyubimoy: {
    h1: "Цветы любимой с доставкой в Новороссийске",
    title: "Букет любимой девушке — розы и цветы с доставкой в Новороссийске",
    menu: "Любимой",
    pick: { words: /роз|красн|бордо|малин|французск|сердц|страст|любов/i },
    intro: "Розы, пионовидные розы и выразительные авторские букеты — для любимой. Подобрали букеты, которые говорят о чувствах без лишних слов.",
    text: [
      "Классика — красные или французские розы. Если хочется удивить, выбирайте пионовидные розы: они пышные, ароматные и выглядят дороже обычных.",
      "Добавьте открытку с признанием — напишите текст при оформлении. Привезём в нужное время, а перед отправкой пришлём вам фото.",
    ],
    faq: [
      ["Какой букет подарить девушке?", "Розы — беспроигрышная классика, пионовидные розы — когда хочется удивить. Если знаете её любимый цвет, напишите в комментарии к заказу."],
      ["Успеете привезти сегодня?", "Обычно доставляем примерно за 1–1,5 часа после подтверждения заказа, время согласуем с вами."],
    ],
  },
  kollege: {
    h1: "Букет коллеге и руководителю",
    title: "Букет коллеге, руководителю, на работу — доставка в Новороссийске",
    menu: "Коллеге",
    pick: { max: 6000, cats: ["mono"] },
    intro: "Аккуратные букеты для поздравления на работе: коллеге, руководителю, партнёрам. Сдержанно, красиво и в разумном бюджете.",
    text: [
      "Для рабочего поздравления подходят монобукеты и компактные авторские букеты: они не требуют особого ухода и хорошо смотрятся в офисе. Для руководителя можно выбрать букет побольше или корзину.",
      "Нужно несколько букетов сразу — для всего отдела или партнёров? Напишите нам, согласуем состав и время доставки.",
    ],
    faq: [
      ["Можно доставить в офис к определённому времени?", "Да, укажите адрес офиса и удобное время — курьер позвонит заранее."],
    ],
  },
  prosti: {
    h1: "Цветы «Прости» — букет, чтобы извиниться",
    title: "Букет, чтобы извиниться — цветы с доставкой в Новороссийске",
    menu: "Извиниться",
    pick: { words: /нежн|пудр|пионовид|эустом|кремов|розов/i },
    intro: "Иногда цветы говорят лучше слов. Нежные букеты, с которыми проще начать разговор и показать, что вы дорожите человеком.",
    text: [
      "Выбирайте мягкие оттенки — пудровые, кремовые, нежно-розовые. Добавьте открытку: даже пара искренних строк делает букет личным.",
    ],
    faq: [
      ["Что написать в открытке?", "Лучше всего — простые искренние слова от себя. На странице конструктора букета есть готовые идеи для текста."],
    ],
  },
  "prosto-tak": {
    h1: "Букет без повода",
    title: "Букет просто так, без повода — недорогие цветы с доставкой в Новороссийске",
    menu: "Без повода",
    pick: { max: 5000, cats: ["authors", "online"] },
    intro: "Самые приятные цветы — неожиданные. Недорогие букеты, чтобы порадовать близкого человека просто так.",
    text: [
      "Монобукеты из гортензий, роз или хризантем — красиво, свежо и не требует повода. Заказ можно оформить за пару минут на сайте.",
    ],
    faq: [
      ["Сколько стоит недорогой букет?", "Самые доступные букеты в подборке — от 2 000–3 000 ₽; цена на карточке — за самый маленький размер."],
    ],
  },
  vypiska: {
    h1: "Цветы на выписку из роддома",
    title: "Букет на выписку из роддома — доставка в Новороссийске",
    menu: "На выписку",
    pick: { words: /бел|голуб|нежн|облак|пудр|кремов|светл/i },
    intro: "Нежные светлые букеты для самого трогательного дня — выписки из роддома. Голубые и розовые гортензии, белые и пудровые розы.",
    text: [
      "Для выписки выбирают светлые букеты без резкого аромата: гортензии, розы, эустому. Привезём ко времени выписки — укажите его при оформлении.",
    ],
    faq: [
      ["Успеете привезти ко времени выписки?", "Да, укажите время — согласуем доставку заранее, чтобы букет был у вас вовремя."],
    ],
  },
};

export const CITIES = {
  novorossiysk: {
    city: "Новороссийск", in: "Новороссийске", to: "по Новороссийску",
    price: "от 350 ₽, при заказе от 7 000 ₽ — бесплатно",
    h1: "Доставка цветов в Новороссийске",
    title: "Доставка цветов в Новороссийске — букеты от 2 150 ₽, фото до отправки",
    intro: "Цветочная студия PALOMA на ул. Энгельса, 74/82. Доставляем букеты по всему Новороссийску в день заказа.",
  },
  gelendzhik: {
    city: "Геленджик", in: "Геленджике", to: "в Геленджик",
    price: "1 000 ₽ — маршрут согласуем при оформлении",
    h1: "Доставка цветов в Геленджик",
    title: "Доставка цветов в Геленджик из Новороссийска — PALOMA",
    intro: "Привезём букет из студии PALOMA в Новороссийске в Геленджик. Маршрут и время согласуем при оформлении.",
  },
  anapa: {
    city: "Анапа", in: "Анапе", to: "в Анапу",
    price: "1 500 ₽ — день в день по возможности маршрута",
    h1: "Доставка цветов в Анапу",
    title: "Доставка цветов в Анапу из Новороссийска — PALOMA",
    intro: "Доставляем букеты PALOMA из Новороссийска в Анапу — день в день по возможности маршрута.",
  },
  "abrau-dyurso": {
    city: "Абрау-Дюрсо", in: "Абрау-Дюрсо", to: "в Абрау-Дюрсо",
    price: "750 ₽ — маршрут согласуем при оформлении",
    h1: "Доставка цветов в Абрау-Дюрсо",
    title: "Доставка цветов в Абрау-Дюрсо — букеты PALOMA",
    intro: "Привезём букет в Абрау-Дюрсо — для праздника, свидания или поздравления на отдыхе.",
  },
  myskhako: {
    city: "Мысхако", in: "Мысхако", to: "в Мысхако",
    price: "стоимость уточним при оформлении",
    h1: "Доставка цветов в Мысхако",
    title: "Доставка цветов в Мысхако — букеты PALOMA",
    intro: "Доставляем букеты из студии PALOMA в Мысхако. Стоимость и время согласуем при оформлении.",
  },
  kabardinka: {
    city: "Кабардинка", in: "Кабардинке", to: "в Кабардинку",
    price: "стоимость уточним при оформлении",
    h1: "Доставка цветов в Кабардинку",
    title: "Доставка цветов в Кабардинку — букеты PALOMA",
    intro: "Привезём букет в Кабардинку — стоимость и время согласуем при оформлении.",
  },
};

export function buildLandings({ tpl, products, write, esc, money, abs, purl, minPrice, cats, SITE }) {
  const bouquets = products.filter((p) => {
    const c = cats(p);
    return c.length && c.some((x) => x !== "vases") && !c.includes("wedding");
  });
  const textOf = (p) => `${p.name} ${p.desc || ""} ${p.composition || ""}`;
  const byPrice = (a, b) => minPrice(a) - minPrice(b);
  /* Подборка под страницу: чем больше совпадений по смыслу — тем выше,
     затем дешевле. Так у каждой страницы своя подборка, а не одни и те же
     12 самых дешёвых букетов (иначе поиск сочтёт страницы копиями). */
  const pick = (rule) => {
    let list = bouquets.slice();
    if (rule.max) list = list.filter((p) => minPrice(p) <= rule.max);
    const score = (p) => {
      let n = 0;
      if (rule.words) n += (textOf(p).match(new RegExp(rule.words.source, "gi")) || []).length;
      if (rule.cats) n += cats(p).filter((c) => rule.cats.includes(c)).length * 2;
      return n;
    };
    if (rule.words || rule.cats) {
      const hit = list.filter((p) => score(p) > 0);
      if (hit.length >= 6) list = hit;
    }
    list = list.map((p) => ({ p, s: score(p) })).sort((a, b) => b.s - a.s || byPrice(a.p, b.p)).map((x) => x.p);
    if (rule.offset) list = list.slice(rule.offset % Math.max(1, list.length - 12)).concat(list);
    const out = [];
    for (const p of list) { if (!out.includes(p)) out.push(p); if (out.length === 12) break; }
    return out.sort(byPrice);
  };
  const lowest = bouquets.length ? Math.min(...bouquets.map(minPrice)) : 0;

  const card = (p) => {
    const many = (p.sizes || []).length > 1;
    return `<a class="lp-card" href="${purl(p)}">` +
      (p.image ? `<span class="lp-card__img"><img src="${esc(p.image)}" alt="${esc(p.name)} — букет PALOMA" loading="lazy" decoding="async" width="600" height="800"></span>` : "") +
      `<span class="lp-card__name">${esc(p.name)}</span>` +
      `<span class="lp-card__price">${money(minPrice(p))}</span></a>`;
  };

  const steps = `<ol class="lp-steps">
      <li><b>Выберите букет</b><span>или соберите свой в конструкторе — флорист повторит.</span></li>
      <li><b>Оформите заказ</b><span>оплата онлайн, Яндекс Сплитом или при получении.</span></li>
      <li><b>Фото до отправки</b><span>пришлём фото букета перед доставкой.</span></li>
      <li><b>Доставка</b><span>примерно за 1–1,5 часа, время согласуем с вами.</span></li>
    </ol>`;

  const navLinks = (kind, current) => {
    const occ = Object.entries(OCCASIONS).map(([k, o]) => `<a href="/povod/${k}/"${kind === "povod" && k === current ? ' aria-current="page"' : ""}>${esc(o.menu)}</a>`).join("");
    const cit = Object.entries(CITIES).map(([k, c]) => `<a href="/dostavka/${k}/"${kind === "dostavka" && k === current ? ' aria-current="page"' : ""}>${esc(c.city)}</a>`).join("");
    return `<nav class="lp-nav" aria-label="Поводы и города"><p class="lp-nav__t">Букеты по поводам</p><div>${occ}</div>` +
      `<p class="lp-nav__t">Доставка цветов</p><div>${cit}</div></nav>`;
  };

  const page = ({ url, title, desc, h1, lead, list, paragraphs, faq, kind, key, crumb }) => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "CollectionPage", name: h1, url, description: desc,
          mainEntity: { "@type": "ItemList", numberOfItems: list.length,
            itemListElement: list.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: SITE + purl(p), name: p.name })) } },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: crumb, item: url } ] },
        ...(faq.length ? [{ "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] : []),
      ],
    };
    const main = `<main id="main" class="lp-page">
    <nav class="lp-crumbs" aria-label="Навигация"><a href="/">Главная</a><span>/</span><span>${esc(crumb)}</span></nav>
    <header class="lp-hero">
      <h1 class="lp-title">${esc(h1)}</h1>
      <p class="lp-lead">${esc(lead)}</p>
      <p class="lp-badges"><span>доставка за 1–1,5 часа</span><span>фото до отправки</span></p>
    </header>
    <section class="lp-grid" aria-label="Букеты">${list.map(card).join("")}</section>
    <p class="lp-more"><a class="lp-btn" href="/catalog.html">Смотреть весь каталог</a> <a class="lp-btn lp-btn--line" href="/bouquet-create.html">Собрать свой букет</a></p>
    <section class="lp-text">${paragraphs.map((t) => `<p>${esc(t)}</p>`).join("")}</section>
    <section class="lp-how"><h2 class="lp-h2">Как мы доставляем</h2>${steps}</section>
    ${faq.length ? `<section class="lp-faq"><h2 class="lp-h2">Частые вопросы</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>` : ""}
    ${navLinks(kind, key)}
  </main>`;
    let s = tpl;
    s = s.replace(/<head>/, `<head>\n  <base href="/">`);
    s = s.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
    s = s.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc.slice(0, 160))}">`);
    s = s.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
    s = s.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`);
    s = s.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(h1)} — PALOMA">`);
    s = s.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc.slice(0, 200))}">`);
    if (list[0] && list[0].image) s = s.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(abs(list[0].image))}">`);
    s = s.replace("</head>", `  <link rel="stylesheet" href="seo-landing.css?v=1">\n  <script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`);
    s = s.replace(/<main[\s\S]*?<\/main>/, main);
    s = s.replace(/href="#([^"]*)"/g, (m, h) => `href="${url.replace(SITE, "")}#${h}"`);
    return s;
  };

  const urls = [];
  for (const [key, o] of Object.entries(OCCASIONS)) {
    const list = pick(o.pick);
    if (!list.length) continue;
    const url = `${SITE}/povod/${key}/`;
    write(`povod/${key}/index.html`, page({
      url, kind: "povod", key, crumb: o.menu,
      title: `${o.title} | PALOMA`,
      desc: `${o.intro} Цены от ${money(Math.min(...list.map(minPrice)))}. Доставка за 1–1,5 часа, фото до отправки.`,
      h1: o.h1, lead: o.intro, list,
      paragraphs: [...o.text, DELIVERY_FACTS],
      faq: o.faq,
    }));
    urls.push(url);
  }
  for (const [key, c] of Object.entries(CITIES)) {
    const list = pick({ offset: Object.keys(CITIES).indexOf(key) * 5 });
    const url = `${SITE}/dostavka/${key}/`;
    const faq = [
      [`Сколько стоит доставка ${c.to}?`, `Доставка ${c.to}: ${c.price}.`],
      [`За сколько привезёте букет ${c.to}?`, "Примерно за 1–1,5 часа. Точное время или удобный интервал согласуем с вами при оформлении."],
      ["Можно увидеть букет до доставки?", "Да, перед отправкой пришлём фото букета."],
      ["Как оплатить?", "Онлайн картой, Яндекс Сплитом (частями) или при получении."],
    ];
    write(`dostavka/${key}/index.html`, page({
      url, kind: "dostavka", key, crumb: `Доставка: ${c.city}`,
      title: c.title.replace("от 2 150 ₽", `от ${money(lowest)}`),
      desc: `${c.intro} Доставка ${c.to}: ${c.price}. Букеты от ${money(lowest)}, фото до отправки.`,
      h1: c.h1, lead: c.intro, list,
      paragraphs: [
        `Стоимость доставки ${c.to}: ${c.price}. Самовывоз — из студии на ул. Энгельса, 74/82, ежедневно с 7:30 до 22:00.`,
        DELIVERY_FACTS,
        "В каталоге — монобукеты, авторские и свадебные букеты, корзины и композиции. Можно собрать свой букет в конструкторе — флорист повторит его из живых цветов.",
      ],
      faq,
    }));
    urls.push(url);
  }
  return urls;
}

/* Ссылки на поводы и города — для страниц разделов каталога (перелинковка) */
export function landingLinks(esc) {
  return `<nav class="seo-links" aria-label="Букеты по поводам"><p class="seo-links__t">Букеты по поводам</p>` +
    Object.entries(OCCASIONS).map(([k, o]) => `<a href="/povod/${k}/">${esc(o.h1.replace(/ с доставкой в Новороссийске$/, ""))}</a>`).join("") +
    `</nav><nav class="seo-links" aria-label="Доставка по городам"><p class="seo-links__t">Доставка цветов</p>` +
    Object.entries(CITIES).map(([k, c]) => `<a href="/dostavka/${k}/">${esc(c.h1)}</a>`).join("") + `</nav>`;
}
