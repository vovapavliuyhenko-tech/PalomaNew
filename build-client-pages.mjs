import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.join(__dirname);

function faqPanel(tabId, items, active) {
  const cls = active ? 'faq-tab-panel is-active' : 'faq-tab-panel';
  const accs = items
    .map(
      ([q, a]) => `
      <div class="faq-acc">
        <button type="button" class="faq-acc__head" aria-expanded="false" data-cursor="hover">
          <span class="faq-acc__q">${q}</span>
          <span class="faq-acc__icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 7h12"/><path class="faq-acc__icon-v" d="M7 1v12"/></svg>
          </span>
        </button>
        <div class="faq-acc__body" role="region"><p class="faq-acc__a">${a}</p></div>
      </div>`,
    )
    .join('');
  return `\n    <div class="${cls}" data-panel="${tabId}" role="tabpanel">${accs}\n    </div>`;
}

function slugPage(slug, title, desc, inner, suffix) {
  let t = fs.readFileSync(path.join(ROOT, 'catalog.html'), 'utf8');
  t = t.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  t = t.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${desc}">`,
  );
  t = t.replaceAll('preloaderCircleCatalog', `preloaderCircle${suffix}`);
  t = t.replaceAll('clientsNavTriggerCatalog', `clientsNavTrigger${suffix}`);
  let wrapped = inner.trim();
  if (!wrapped.toLowerCase().startsWith('<main')) {
    wrapped = `<main id="main">\n${wrapped}\n  </main>`;
  }
  t = t.replace(/<main id="main"[\s\S]*?<\/main>/, wrapped);
  fs.writeFileSync(path.join(ROOT, `${slug}.html`), t, 'utf8');
}

function pairsToLdQuestions(pairs) {
  return pairs.map(([name, text]) => ({
    '@type': 'Question',
    name,
    acceptedAnswer: {
      '@type': 'Answer',
      text,
    },
  }));
}

function injectFaqPageJsonLd() {
  const mainEntity = [
    ...pairsToLdQuestions(faq_order),
    ...pairsToLdQuestions(faq_delivery),
    ...pairsToLdQuestions(faq_payment),
    ...pairsToLdQuestions(faq_care_tab),
    ...pairsToLdQuestions(faq_wedding_tab),
    ...pairsToLdQuestions(faq_events_tab),
  ];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
  const tagBody = `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  const fp = path.join(ROOT, 'faq.html');
  let html = fs.readFileSync(fp, 'utf8');
  const pattern = /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/i;
  if (pattern.test(html)) {
    html = html.replace(pattern, `${tagBody}\n  `);
  } else {
    html = html.replace('</head>', `\n  ${tagBody}\n</head>`);
  }
  fs.writeFileSync(fp, html, 'utf8');
}

const faq_order = [
  [
    'Можно ли заказать букет день в день?',
    'Да, готовые букеты из онлайн-витрины доступны к заказу. Индивидуальный — уточним наличие и соберём в похожем настроении.',
  ],
  [
    'Как изменить адрес после оформления?',
    'Напишите в WhatsApp или Telegram как можно скорее — обновим маршрут до выхода курьера.',
  ],
  ['Можно ли заказать анонимно?', 'Да, при оформлении укажите «Анонимная доставка».'],
  [
    'Можно собрать букет по фото?',
    'Пришлите референс — флорист соберёт в аналогичной палитре и настроении.',
  ],
  [
    'Что если получателя не окажется дома?',
    'Уточним у вас: оставить соседям, у двери или перенести доставку.',
  ],
];

const faq_delivery = [
  ['Куда вы доставляете?', 'Новороссийск, Геленджик и Анапа.'],
  [
    'Сколько стоит доставка?',
    'Стоимость зависит от зоны и маршрута — подскажем при оформлении заказа.',
  ],
  ['Когда доставите?', 'В выбранный интервал 09–12, 12–15, 15–18 или 18–21.'],
  [
    'Пришлёте фото перед отправкой?',
    'Да — по запросу отправляем фото готового букета до выезда.',
  ],
  [
    'Что нужно указать получателю?',
    'Телефон и удобный интервал безопаснее — можно получить код от домофона или оставить у консьержа.',
  ],
];

const faq_payment = [
  ['Какие способы оплаты доступны?', 'Банковская карта и другие поддерживаемые ЮKassa способы онлайн — перед доставкой после подтверждения менеджером.'],
  ['Безопасно ли платить на сайте?', 'Да, через ЮKassa с PCI DSS Level 1.'],
  ['Оплата при получении?', 'Нет. Только онлайн перед доставкой.'],
  ['Когда придёт чек?', 'Фискальный чек на email сразу после оплаты.'],
  [
    'Нужно ли сохранять ссылку на оплату?',
    'Ссылки одноразовые — сохранять не обязательно, но чек сохранится в почте после успешной оплаты.',
  ],
];

const faq_care_tab = [
  ['Сколько живёт букет?', 'В среднем 5–10 дней при правильном уходе.'],
  [
    'Как реанимировать увядший букет?',
    'Обновите срез, свежая вода с подкормкой, прохлада без сквозняков.',
  ],
  ['Нужна ли подкормка?', 'Да, она существенно продлевает жизнь срезу — пакетик в каждом заказе.'],
  ['Можно ли хранить в холодильнике?', 'Не все цветы переносят холод; лучше стабильная прохладная комната.'],
  ['Когда лучше обновить воду?', 'Раз в два дня вместе с лёгким подрезом — вода должна быть прозрачной.'],
];

const faq_wedding_tab = [
  ['За сколько бронировать флориста?', 'Для лета — за 2–3 месяца; вне сезона часто достаточно 4–6 недель.'],
  ['Можно ли посмотреть состав заранее?', 'Да, moodboard и сметная карта до подписания договора.'],
  ['Работаете ли выездом?', 'Да, по всему черноморскому побережью.'],
  ['Какой аванс?', '30% при подписании, остаток — за 3 дня до события.'],
  [
    'Что если погода испортится на выездной церемонии?',
    'Перенастраиваем укрытие, усиливаем устойчивые сорта и можем временно переместить церемонию под навес или в зал при согласии площадки.',
  ],
];

const faq_events_tab = [
  [
    'За сколько подать заявку?',
    '2–3 недели для стандартного оформления, от месяца — для крупного.',
  ],
  ['Что входит в стоимость?', 'Концепция, композиции, доставка и монтаж на площадке.'],
  ['Делаете ли демонтаж?', 'Да, заранее согласуем отдельной строкой.'],
  ['Можно получить смету заранее?', 'Да, коммерческое предложение в течение 24 часов.'],
  [
    'Работаете ли в других городах?',
    'Да, по всему черноморскому побережью и точечным выездам — маршрут и логистика согласуем индивидуально.',
  ],
];

const faq_tabs =
  `
    <section class="faq-tabs-section">
      <div class="faq-tabs-section__inner">
        <nav class="faq-tabs__nav" role="tablist">
          <button type="button" class="faq-tab is-active" role="tab" data-tab="order" aria-selected="true" tabindex="0" data-cursor="hover">Заказ</button>
          <button type="button" class="faq-tab" role="tab" data-tab="delivery" aria-selected="false" tabindex="-1" data-cursor="hover">Доставка</button>
          <button type="button" class="faq-tab" role="tab" data-tab="payment" aria-selected="false" tabindex="-1" data-cursor="hover">Оплата</button>
          <button type="button" class="faq-tab" role="tab" data-tab="care" aria-selected="false" tabindex="-1" data-cursor="hover">Уход</button>
          <button type="button" class="faq-tab" role="tab" data-tab="wedding" aria-selected="false" tabindex="-1" data-cursor="hover">Свадьбы</button>
          <button type="button" class="faq-tab" role="tab" data-tab="events" aria-selected="false" tabindex="-1" data-cursor="hover">Мероприятия</button>
        </nav>
        <div class="faq-tabs__panels">` +
  faqPanel('order', faq_order, true) +
  faqPanel('delivery', faq_delivery, false) +
  faqPanel('payment', faq_payment, false) +
  faqPanel('care', faq_care_tab, false) +
  faqPanel('wedding', faq_wedding_tab, false) +
  faqPanel('events', faq_events_tab, false) +
  `
        </div>
      </div>
    </section>`;

const breadcrumbsFaq = `    <nav class="breadcrumbs" aria-label="Хлебные крошки">
      <div class="breadcrumbs__inner">
        <ol class="breadcrumbs__list" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="index.html" itemprop="item"><span itemprop="name">Главная</span></a>
            <meta itemprop="position" content="1">
          </li>
          <li class="breadcrumbs__sep" aria-hidden="true">/</li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="faq.html" itemprop="item"><span itemprop="name">Клиентам</span></a>
            <meta itemprop="position" content="2">
          </li>
          <li class="breadcrumbs__sep" aria-hidden="true">/</li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">Вопрос-ответ</span>
            <meta itemprop="position" content="3">
          </li>
        </ol>
      </div>
    </nav>`;

const heroFaq = `    <section class="client-hero">
      <div class="client-hero__inner">
        <span class="client-hero__eyebrow" aria-hidden="true">[ Клиентам ]</span>
        <h1 class="client-hero__title">Вопрос-ответ</h1>
        <p class="client-hero__lead">Всё о заказе, доставке, оплате и услугах PALOMA.</p>
      </div>
    </section>`;

const standardCta = fs.readFileSync(path.join(ROOT, 'internals', 'delivery.html'), 'utf8').split('<section class="client-cta">')[1];

const faqInner =
  breadcrumbsFaq +
  '\n' +
  heroFaq +
  '\n' +
  faq_tabs +
  '\n    <section class="client-cta">' +
  standardCta;

slugPage(
  'delivery',
  'Доставка букетов в Новороссийске, Геленджике и Анапе — PALOMA',
  'Доставка свежих букетов PALOMA по Новороссийску и побережью. Самовывоз на Энгельса, 74. Фото перед отправкой по запросу.',
  fs.readFileSync(path.join(ROOT, 'internals', 'delivery.html'), 'utf8'),
  'Delivery',
);

slugPage(
  'payment',
  'Оплата заказа онлайн — PALOMA Flowers Coffee You',
  'Оплата заказа онлайн через ЮKassa. Безопасно. Чек на email. Условия уточняем при подтверждении.',
  fs.readFileSync(path.join(ROOT, 'internals', 'payment.html'), 'utf8'),
  'Payment',
);

slugPage(
  'care',
  'Уход за букетом — 7 дней свежести | PALOMA',
  'Как ухаживать за свежим букетом: подрезать стебли, менять воду, использовать подкормку. 5 простых шагов от флористов PALOMA.',
  fs.readFileSync(path.join(ROOT, 'internals', 'care.html'), 'utf8'),
  'Care',
);

slugPage(
  'faq',
  'Вопрос-ответ о заказе, доставке и цветах — PALOMA',
  'Частые вопросы о заказе, доставке, оплате, уходе, свадьбах и мероприятиях PALOMA в Новороссийске.',
  faqInner,
  'FAQ',
);
injectFaqPageJsonLd();

slugPage(
  'wedding-piggy-bank',
  'Свадебная копилка PALOMA — как мы готовим вашу свадьбу',
  'Этапы подготовки свадебной флористики с PALOMA: от первой встречи до дня торжества. Новороссийск, Геленджик, Анапа.',
  fs.readFileSync(path.join(ROOT, 'internals', 'wedding-piggy-bank.html'), 'utf8'),
  'Wedding',
);

slugPage(
  'events',
  'Оформление мероприятий цветами — PALOMA Новороссийск',
  'Флористическое оформление корпоративов, дней рождения, ужинов и фотосессий. Концепция, монтаж и оформление пространства.',
  fs.readFileSync(path.join(ROOT, 'internals', 'events.html'), 'utf8'),
  'Events',
);

const privacyInner = `
    <nav class="breadcrumbs" aria-label="Хлебные крошки">
      <div class="breadcrumbs__inner">
        <ol class="breadcrumbs__list" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="index.html" itemprop="item"><span itemprop="name">Главная</span></a>
            <meta itemprop="position" content="1">
          </li>
          <li class="breadcrumbs__sep" aria-hidden="true">/</li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">Политика конфиденциальности</span>
            <meta itemprop="position" content="2">
          </li>
        </ol>
      </div>
    </nav>
    <section class="client-hero">
      <div class="client-hero__inner">
        <span class="client-hero__eyebrow" aria-hidden="true">[ Юридическое ]</span>
        <h1 class="client-hero__title">Политика конфиденциальности</h1>
        <p class="client-hero__lead">Полный текст документа готовится к публикации. По вопросам персональных данных и согласий напишите в WhatsApp или Telegram PALOMA — мы ответим в рабочие часы.</p>
      </div>
    </section>
    <section class="info-cards-section info-cards-section--light">
      <div class="info-cards-section__inner">
        <div class="info-cards-section__header info-cards-section--centered">
          <h2 class="info-cards-section__title legal-doc__title">Обработка данных</h2>
        </div>
        <div class="info-cards-grid legal-doc__grid" data-cols="1">
          <article class="info-card" data-cursor="hover"><p class="info-card__desc legal-doc__desc-full">Мы собираем только те данные, которые вы указываете при заказе (имя, телефон, адрес доставки, текст открытки), и используем их для исполнения заказа. Оплата проходит через сертифицированный эквайринг; реквизиты карт на наших серверах не хранятся.</p></article>
        </div>
        <div class="legal-doc__cta-row">
          <a href="https://wa.me/79180000000" target="_blank" rel="noopener" class="btn btn--outline client-cta__btn" data-cursor="hover">Написать в WhatsApp</a>
          <a href="catalog.html" class="btn btn--ghost client-cta__btn" data-cursor="hover">В каталог</a>
        </div>
      </div>
    </section>`;

const offerInner = `
    <nav class="breadcrumbs" aria-label="Хлебные крошки">
      <div class="breadcrumbs__inner">
        <ol class="breadcrumbs__list" itemscope itemtype="https://schema.org/BreadcrumbList">
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a href="index.html" itemprop="item"><span itemprop="name">Главная</span></a>
            <meta itemprop="position" content="1">
          </li>
          <li class="breadcrumbs__sep" aria-hidden="true">/</li>
          <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">Публичная оферта</span>
            <meta itemprop="position" content="2">
          </li>
        </ol>
      </div>
    </nav>
    <section class="client-hero">
      <div class="client-hero__inner">
        <span class="client-hero__eyebrow" aria-hidden="true">[ Юридическое ]</span>
        <h1 class="client-hero__title">Публичная оферта</h1>
        <p class="client-hero__lead">Полный договор оферты будет размещён до запуска приёма платежей на сайте. По условиям заказа, оплаты и доставки вы можете получить информацию через мессенджеры PALOMA.</p>
      </div>
    </section>
    <section class="info-cards-section info-cards-section--alt">
      <div class="info-cards-section__inner">
        <div class="info-cards-section__header info-cards-section--centered">
          <h2 class="info-cards-section__title legal-doc__title">Что уже действует</h2>
        </div>
        <div class="info-cards-grid legal-doc__grid" data-cols="1">
          <article class="info-card" data-cursor="hover"><p class="info-card__desc legal-doc__desc-full">Оформление заказа на сайте означает ваше ознакомление с базовой информацией о доставке и оплате в разделе «Клиентам». После утверждения текста оферты ссылка будет продублирована здесь.</p></article>
        </div>
        <div class="legal-doc__cta-row">
          <a href="contacts.html" class="btn btn--outline client-cta__btn" data-cursor="hover">Контакты</a>
          <a href="catalog.html" class="btn btn--ghost client-cta__btn" data-cursor="hover">В каталог</a>
        </div>
      </div>
    </section>`;

slugPage(
  'privacy',
  'Политика конфиденциальности — PALOMA flowers coffee you',
  'Как PALOMA обрабатывает персональные данные при заказе цветов и оплате через сайт.',
  privacyInner,
  'Privacy',
);

slugPage(
  'offer',
  'Публичная оферта — PALOMA flowers coffee you',
  'Условия продажи букетов и услуг PALOMA: текст оферты публикуется на сайте.',
  offerInner,
  'Offer',
);

console.log('Wrote delivery, payment, care, faq, wedding-piggy-bank, events, privacy, offer');
