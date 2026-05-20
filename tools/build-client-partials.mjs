import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const partialsDir = path.join(root, "partials");
const t = "div";

function breadcrumbs(currentName) {
  return `    <nav class="breadcrumbs" aria-label="Хлебные крошки">
      <${t} class="breadcrumbs__inner">
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
            <span itemprop="name">${currentName}</span>
            <meta itemprop="position" content="3">
          </li>
        </ol>
      </${t}>
    </nav>`;
}

const deliveryMain = `  <main id="main" class="client-page">
${breadcrumbs("Доставка")}

    <section class="client-hero">
      <${t} class="client-hero__inner">
        <span class="client-hero__eyebrow">[ Клиентам ]</span>
        <h1 class="client-hero__title">Доставка</h1>
        <p class="client-hero__lead">
          Доставляем букеты по Новороссийску, Геленджику и Анапе — день в день, в удобный интервал.
          Самовывоз из PALOMA на Энгельса, 74.
        </p>
      </${t}>
    </section>

    <section class="info-cards-section info-cards-section--alt">
      <${t} class="info-cards-section__inner">
        <header class="info-cards-section__header info-cards-section--centered">
          <span class="info-cards-section__eyebrow">[ Зоны ]</span>
          <h2 class="info-cards-section__title">Зоны доставки</h2>
        </header>
        <${t} class="info-cards-grid" data-cols="3">
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">01</${t}>
            <h3 class="info-card__title">Новороссийск</h3>
            <p class="info-card__desc">Доставка курьером — от 350 ₽. День в день в выбранный интервал.</p>
          </article>
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">02</${t}>
            <h3 class="info-card__title">Геленджик</h3>
            <p class="info-card__desc">Доставка курьером — от 600 ₽. Согласуем маршрут при оформлении.</p>
          </article>
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">03</${t}>
            <h3 class="info-card__title">Анапа</h3>
            <p class="info-card__desc">Доставка курьером — от 800 ₽. День в день по возможности маршрута.</p>
          </article>
        </${t}>
      </${t}>
    </section>

    <section class="client-methods">
      <${t} class="client-methods__inner">
        <header class="client-methods__header">
          <span class="client-methods__eyebrow">[ Способы ]</span>
          <h2 class="client-methods__title">Как получить букет</h2>
        </header>
        <${t} class="client-methods__grid">
          <article class="client-methods__card" data-cursor="hover">
            <h3 class="client-methods__card-title">Самовывоз из PALOMA</h3>
            <p class="client-methods__card-text">ул. Энгельса, 74 — ежедневно с 9:00 до 21:00. Сообщим, когда букет готов.</p>
          </article>
          <article class="client-methods__card" data-cursor="hover">
            <h3 class="client-methods__card-title">Доставка курьером</h3>
            <p class="client-methods__card-text">Курьер привезёт букет в выбранный интервал. По запросу — фото перед отправкой.</p>
          </article>
        </${t}>
      </${t}>
    </section>

    <section class="hscroll-section">
      <${t} class="hscroll-section__header-wrap">
        <span class="hscroll-section__eyebrow">[ Этапы ]</span>
        <h2 class="hscroll-section__title">Как проходит доставка</h2>
        <p class="hscroll-section__lead">От заказа до вручения букета получателю.</p>
      </${t}>
      <${t} class="hscroll-section__outer" data-hscroll-outer>
        <button type="button" class="hscroll-section__arrow hscroll-section__arrow--prev" data-hscroll-prev data-cursor="hover" aria-label="Назад"><svg width="20" height="12" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 7H1M1 7l6-6M1 7l6 6"/></svg></button>
        <${t} class="hscroll-section__track" data-hscroll-track>
          <article class="hscroll-card" data-cursor="hover"><span class="hscroll-card__num">01</span><h3 class="hscroll-card__title">Заказ</h3><p class="hscroll-card__desc">Оформляете на сайте или пишете нам — подтверждаем детали и время.</p></article>
          <article class="hscroll-card" data-cursor="hover"><span class="hscroll-card__num">02</span><h3 class="hscroll-card__title">Сборка</h3><p class="hscroll-card__desc">Флорист собирает букет из свежих цветов под ваш заказ.</p></article>
          <article class="hscroll-card" data-cursor="hover"><span class="hscroll-card__num">03</span><h3 class="hscroll-card__title">Фото перед отправкой</h3><p class="hscroll-card__desc">По запросу присылаем фото готового букета в мессенджер.</p></article>
          <article class="hscroll-card" data-cursor="hover"><span class="hscroll-card__num">04</span><h3 class="hscroll-card__title">Передача курьеру</h3><p class="hscroll-card__desc">Упаковываем бережно и передаём курьеру в согласованное окно.</p></article>
          <article class="hscroll-card" data-cursor="hover"><span class="hscroll-card__num">05</span><h3 class="hscroll-card__title">Доставка получателю</h3><p class="hscroll-card__desc">Курьер вручает букет в выбранный интервал, звонит заранее.</p></article>
        </${t}>
        <button type="button" class="hscroll-section__arrow hscroll-section__arrow--next" data-hscroll-next data-cursor="hover" aria-label="Вперёд"><svg width="20" height="12" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 7h22M23 7l-6-6M23 7l-6 6"/></svg></button>
      </${t}>
    </section>

    <section class="client-intervals">
      <${t} class="client-intervals__inner">
        <header class="client-intervals__header">
          <span class="client-intervals__eyebrow">[ Время ]</span>
          <h2 class="client-intervals__title">Интервалы доставки</h2>
          <p class="client-intervals__lead">Выберите удобный слот при оформлении заказа.</p>
        </header>
        <ul class="client-intervals__grid">
          <li class="client-intervals__item">9:30 – 12:30</li>
          <li class="client-intervals__item">12:00 – 15:00</li>
          <li class="client-intervals__item">15:00 – 18:00</li>
          <li class="client-intervals__item">18:00 – 22:00</li>
        </ul>
      </${t}>
    </section>

    <section class="client-cta">
      <${t} class="client-cta__inner">
        <h2 class="client-cta__title">Готовы заказать?</h2>
        <p class="client-cta__lead">Выберите букет в каталоге или напишите нам — поможем с доставкой.</p>
        <${t} class="client-cta__actions">
          <a href="catalog.html" class="btn btn--dark client-cta__btn" data-cursor="hover">В каталог</a>
          <a href="https://wa.me/79180000000" target="_blank" rel="noopener" class="btn btn--outline client-cta__btn" data-cursor="hover">WhatsApp</a>
        </${t}>
      </${t}>
    </section>
  </main>`;

const paymentMain = `  <main id="main" class="client-page">
${breadcrumbs("Оплата")}

    <section class="client-hero">
      <${t} class="client-hero__inner">
        <span class="client-hero__eyebrow">[ Клиентам ]</span>
        <h1 class="client-hero__title">Оплата</h1>
        <p class="client-hero__lead">
          Оплата заказа онлайн через ЮKassa — быстро и безопасно. Данные карты обрабатываются на защищённой странице платёжного сервиса.
        </p>
      </${t}>
    </section>

    <section class="info-cards-section info-cards-section--alt">
      <${t} class="info-cards-section__inner">
        <header class="info-cards-section__header info-cards-section--centered">
          <span class="info-cards-section__eyebrow">[ Способы ]</span>
          <h2 class="info-cards-section__title">Способы оплаты</h2>
        </header>
        <${t} class="info-cards-grid" data-cols="3">
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">01</${t}>
            <h3 class="info-card__title">Банковская карта</h3>
            <p class="info-card__desc">Visa, Mastercard, «Мир» — ввод данных в защищённой форме ЮKassa.</p>
          </article>
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">02</${t}>
            <h3 class="info-card__title">СБП через ЮKassa</h3>
            <p class="info-card__desc">Оплата по QR-коду или в приложении банка — без ввода реквизитов карты.</p>
          </article>
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">03</${t}>
            <h3 class="info-card__title">Яндекс Pay</h3>
            <p class="info-card__desc">Оплата в один клик, если способ подключён в вашем аккаунте Яндекса.</p>
          </article>
        </${t}>
      </${t}>
    </section>

    <section class="client-security">
      <${t} class="client-security__inner">
        <header class="client-security__header">
          <span class="client-security__eyebrow">[ Безопасность ]</span>
          <h2 class="client-security__title">Платёж под защитой</h2>
          <p class="client-security__lead">
            Мы не храним данные банковских карт. Оплата проходит на стороне ЮKassa — сертифицированного оператора с шифрованием TLS и стандартом PCI DSS Level 1.
            После успешной оплаты фискальный чек приходит на email.
          </p>
        </header>
        <${t} class="client-security__grid">
          <article class="client-security__item" data-cursor="hover">
            <h3 class="client-security__item-title">Защищённое соединение</h3>
            <p class="client-security__item-text">Передача данных по HTTPS — как в интернет-банке.</p>
          </article>
          <article class="client-security__item" data-cursor="hover">
            <h3 class="client-security__item-title">ЮKassa</h3>
            <p class="client-security__item-text">Платёжный партнёр экосистемы Сбера с проверенными протоколами.</p>
          </article>
          <article class="client-security__item" data-cursor="hover">
            <h3 class="client-security__item-title">Подтверждение заказа</h3>
            <p class="client-security__item-text">После оплаты менеджер свяжется с вами и подтвердит детали доставки.</p>
          </article>
        </${t}>
      </${t}>
    </section>

    <section class="client-cta">
      <${t} class="client-cta__inner">
        <h2 class="client-cta__title">Готовы оформить заказ?</h2>
        <p class="client-cta__lead">Выберите букет в каталоге — оплата займёт пару минут.</p>
        <${t} class="client-cta__actions">
          <a href="catalog.html" class="btn btn--dark client-cta__btn" data-cursor="hover">В каталог</a>
          <a href="faq.html" class="btn btn--outline client-cta__btn" data-cursor="hover">Вопрос-ответ</a>
        </${t}>
      </${t}>
    </section>
  </main>`;

const careMain = `  <main id="main" class="client-page">
${breadcrumbs("Уход за букетом")}

    <section class="client-hero">
      <${t} class="client-hero__inner">
        <span class="client-hero__eyebrow">[ Клиентам ]</span>
        <h1 class="client-hero__title">Уход за букетом</h1>
        <p class="client-hero__lead">
          Несколько простых шагов — и букет дольше сохраняет свежесть и форму. Собрали советы флористов PALOMA.
        </p>
      </${t}>
    </section>

    <section class="video-block video-block--care" aria-label="Видео об уходе за букетом">
      <${t} class="video-block__media">
        <${t} class="video-block__placeholder" aria-hidden="true"></${t}>
      </${t}>
      <${t} class="video-block__overlay" aria-hidden="true"></${t}>
      <${t} class="video-block__content">
        <span class="video-block__eyebrow">PALOMA · care</span>
        <h2 class="video-block__title">Как продлить жизнь букета</h2>
        <p class="video-block__lead">Скоро здесь будет короткое видео от нашей команды.</p>
      </${t}>
    </section>

    <section class="info-cards-section info-cards-section--light">
      <${t} class="info-cards-section__inner">
        <header class="info-cards-section__header info-cards-section--centered">
          <span class="info-cards-section__eyebrow">[ Советы ]</span>
          <h2 class="info-cards-section__title">Пять правил ухода</h2>
        </header>
        <${t} class="info-cards-grid" data-cols="3">
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">01</${t}>
            <h3 class="info-card__title">Подрезать стебли</h3>
            <p class="info-card__desc">Под углом 45° острым ножом на 2–3 см — сразу после получения букета.</p>
          </article>
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">02</${t}>
            <h3 class="info-card__title">Менять воду</h3>
            <p class="info-card__desc">Каждые 1–2 дня наливайте чистую воду комнатной температуры.</p>
          </article>
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">03</${t}>
            <h3 class="info-card__title">Держать вдали от солнца</h3>
            <p class="info-card__desc">Прохладное место без прямых лучей, батарей и сквозняков.</p>
          </article>
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">04</${t}>
            <h3 class="info-card__title">Убрать упаковку при необходимости</h3>
            <p class="info-card__desc">Снимите декоративную плёнку, если цветы в вазе — так им легче дышать.</p>
          </article>
          <article class="info-card" data-cursor="hover">
            <${t} class="info-card__num" aria-hidden="true">05</${t}>
            <h3 class="info-card__title">Обновлять срез</h3>
            <p class="info-card__desc">При смене воды слегка подрежьте стебли — так цветы лучше пьют влагу.</p>
          </article>
        </${t}>
      </${t}>
    </section>

    <section class="client-cta">
      <${t} class="client-cta__inner">
        <h2 class="client-cta__title">Нужен свежий букет?</h2>
        <p class="client-cta__lead">Соберём с доставкой день в день или подготовим к самовывозу.</p>
        <${t} class="client-cta__actions">
          <a href="catalog.html" class="btn btn--dark client-cta__btn" data-cursor="hover">В каталог</a>
          <a href="delivery.html" class="btn btn--outline client-cta__btn" data-cursor="hover">Доставка</a>
        </${t}>
      </${t}>
    </section>
  </main>`;

function faqRow(q, a, thumbClass) {
  return `          <article class="faq-lines__row" data-cursor="hover">
            <p class="faq-lines__q">${q}</p>
            <p class="faq-lines__a">${a}</p>
            <${t} class="faq-lines__thumb faq-lines__thumb--${thumbClass}" aria-hidden="true"></${t}>
          </article>`;
}

const faqItems = [
  ["Можно ли заказать букет день в день?", "Да — готовые позиции из каталога и сборка под заказ, если есть цветы в студии. Уточним при оформлении.", "a"],
  ["Куда вы доставляете?", "Новороссийск, Геленджик и Анапа. Стоимость зависит от зоны — см. страницу «Доставка».", "b"],
  ["Какие интервалы доставки?", "9:30–12:30, 12:00–15:00, 15:00–18:00 и 18:00–22:00 — выбираете при оформлении.", "c"],
  ["Пришлёте фото перед отправкой?", "Да, по запросу отправим фото готового букета в мессенджер до выезда курьера.", "d"],
  ["Какие способы оплаты доступны?", "Банковская карта, СБП и Яндекс Pay через ЮKassa на защищённой странице оплаты.", "e"],
  ["Безопасно ли платить на сайте?", "Да. Данные карты обрабатывает ЮKassa — PCI DSS Level 1, шифрование TLS.", "f"],
  ["Можно ли заказать анонимно?", "Да — укажите при оформлении, что доставка анонимная, и мы не раскроем отправителя.", "a"],
  ["Как изменить адрес после заказа?", "Напишите в WhatsApp или Telegram как можно скорее — обновим до выхода курьера.", "b"],
  ["Сколько живёт букет?", "В среднем 5–10 дней при правильном уходе — подробнее на странице «Уход за букетом».", "c"],
  ["Можно собрать букет по фото?", "Пришлите референс — флорист соберёт в похожей палитре с учётом сезонности.", "d"],
  ["Что если получателя не окажется дома?", "Согласуем с вами: перенос, оставить у консьержа или соседям.", "e"],
  ["Оформляете ли вы мероприятия?", "Да — цветочное оформление событий. Кратко на странице «Оформление мероприятий», портфолио — в разделе «Оформление».", "f"],
];

const faqMain = `  <main id="main" class="client-page">
${breadcrumbs("Вопрос-ответ")}

    <section class="client-hero">
      <${t} class="client-hero__inner">
        <span class="client-hero__eyebrow">[ Клиентам ]</span>
        <h1 class="client-hero__title">Вопрос-ответ</h1>
        <p class="client-hero__lead">Ответы на частые вопросы о заказе, доставке, оплате и услугах PALOMA.</p>
      </${t}>
    </section>

    <section class="faq-lines" aria-labelledby="faq-lines-heading">
      <${t} class="faq-lines__inner">
        <header class="faq-lines__header">
          <span class="faq-lines__eyebrow">[ FAQ ]</span>
          <h2 class="faq-lines__title" id="faq-lines-heading">Частые вопросы</h2>
        </header>
        <${t} class="faq-lines__list">
${faqItems.map(([q, a, thumb]) => faqRow(q, a, thumb)).join("\n")}
        </${t}>
      </${t}>
    </section>

    <section class="client-cta">
      <${t} class="client-cta__inner">
        <h2 class="client-cta__title">Не нашли ответ?</h2>
        <p class="client-cta__lead">Напишите нам — ответим в течение рабочего дня.</p>
        <${t} class="client-cta__actions">
          <a href="https://wa.me/79180000000" target="_blank" rel="noopener" class="btn btn--dark client-cta__btn" data-cursor="hover">WhatsApp</a>
          <a href="contacts.html" class="btn btn--outline client-cta__btn" data-cursor="hover">Контакты</a>
        </${t}>
      </${t}>
    </section>
  </main>`;

const eventDecoMain = `  <main id="main" class="client-page">
${breadcrumbs("Оформление мероприятий")}

    <section class="client-hero">
      <${t} class="client-hero__inner">
        <span class="client-hero__eyebrow">[ Клиентам ]</span>
        <h1 class="client-hero__title">Оформление мероприятий</h1>
        <p class="client-hero__lead">
          Цветочное оформление для свадеб, ужинов, презентаций и частных событий.
          Продумываем композиции, палитру и логистику — от концепции до монтажа на площадке.
        </p>
        <${t} class="client-hero__actions">
          <a href="events.html" class="btn btn--dark" data-cursor="hover">Страница «Оформление»</a>
        </${t}>
      </${t}>
    </section>

    <section class="client-event-intro">
      <${t} class="client-event-intro__inner">
        <header class="client-event-intro__header">
          <span class="client-event-intro__eyebrow">[ Услуга ]</span>
          <h2 class="client-event-intro__title">Что мы делаем</h2>
        </header>
        <${t} class="client-event-intro__grid">
          <article class="client-event-intro__card" data-cursor="hover">
            <h3 class="client-event-intro__card-title">Букеты и композиции</h3>
            <p class="client-event-intro__card-text">Букеты невесты, бутоньерки, настольные и напольные инсталляции.</p>
          </article>
          <article class="client-event-intro__card" data-cursor="hover">
            <h3 class="client-event-intro__card-title">Арки и фотозоны</h3>
            <p class="client-event-intro__card-text">Церемония, welcome-зона, фон для гостей и пресс-волл.</p>
          </article>
          <article class="client-event-intro__card" data-cursor="hover">
            <h3 class="client-event-intro__card-title">Декор пространства</h3>
            <p class="client-event-intro__card-text">Столы, подиумы, подвесы — в единой палитре события.</p>
          </article>
        </${t}>
        <p class="client-event-intro__note">
          Подробные кейсы, этапы работы и портфолио — на странице
          <a href="events.html">Оформление</a>.
        </p>
      </${t}>
    </section>

    <section class="client-lead" id="event-deco-form" aria-labelledby="event-deco-form-heading">
      <${t} class="client-lead__inner">
        <header class="client-lead__header">
          <span class="client-lead__eyebrow">[ Заявка ]</span>
          <h2 class="client-lead__title" id="event-deco-form-heading">Оставить заявку</h2>
          <p class="client-lead__lead">Опишите событие — перезвоним и предложим концепцию оформления.</p>
        </header>
        <form class="client-lead__form" id="eventDecoForm" novalidate>
          <${t} class="client-lead__field">
            <label class="client-lead__label" for="edf-name">Имя</label>
            <input class="client-lead__input" type="text" id="edf-name" name="name" autocomplete="name" required placeholder="Ваше имя" />
          </${t}>
          <${t} class="client-lead__field">
            <label class="client-lead__label" for="edf-phone">Телефон</label>
            <input class="client-lead__input" type="tel" id="edf-phone" name="phone" autocomplete="tel" required placeholder="+7 ___ ___ __ __" />
          </${t}>
          <${t} class="client-lead__field">
            <label class="client-lead__label" for="edf-date">Дата события</label>
            <input class="client-lead__input" type="text" id="edf-date" name="date" placeholder="Например, 14 июня 2026" />
          </${t}>
          <${t} class="client-lead__field client-lead__field--full">
            <label class="client-lead__label" for="edf-type">Тип события</label>
            <select class="client-lead__input client-lead__select" id="edf-type" name="eventType">
              <option value="">Выберите</option>
              <option value="wedding">Свадьба</option>
              <option value="corporate">Корпоратив</option>
              <option value="private">Частное событие</option>
              <option value="other">Другое</option>
            </select>
          </${t}>
          <${t} class="client-lead__field client-lead__field--full">
            <label class="client-lead__label" for="edf-comment">Комментарий</label>
            <textarea class="client-lead__input client-lead__textarea" id="edf-comment" name="comment" rows="4" placeholder="Площадка, палитра, зоны оформления…"></textarea>
          </${t}>
          <${t} class="client-lead__field client-lead__field--full">
            <button type="submit" class="btn btn--dark client-lead__submit" data-cursor="hover">Отправить заявку</button>
          </${t}>
          <${t} class="client-lead__success" id="eventDecoSuccess" hidden>
            <p>Спасибо! Мы получили заявку и свяжемся с вами в ближайшее время.</p>
          </${t}>
        </form>
      </${t}>
    </section>
  </main>`;

const files = {
  "delivery-main.html": deliveryMain,
  "payment-main.html": paymentMain,
  "care-main.html": careMain,
  "faq-main.html": faqMain,
  "event-decoration-main.html": eventDecoMain,
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(partialsDir, name), content, "utf8");
  console.log("wrote", name);
}
