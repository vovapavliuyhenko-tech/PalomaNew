# PALOMA_REPORT.md — финальный отчёт редизайна

Дата: 2026-05-13. Окружение: Next.js 16.x, палитра через `src/styles/tokens.css` и семантические алиасы в `src/styles/globals.css`.

---

## Этап 13 — консолидация по всему сайту

- `:root`: токены `--color-sand`, `--bg-page` для `FinalCTA` и `WeddingGallery`.
- **Footer** — явный `--paloma-coal`, сетка с системными отступами, hover orange/burgundy.
- **PageHero** — `--bg-primary` вместо oil.
- **MobileMenu** — фон fullscreen `--paloma-coal` вместо бордо (~10 % палитры на акцентах, не на весь маршрут).
- **Header** — выпадающие блоки `--bg-primary`.
- Тени: вместо `rgba(40,40,40,…)` — `var(--shadow-soft)` / `var(--shadow-card)`.
- Панели/хедеры страниц: `--color-oil/*` заменены на `--bg-primary` / `--bg-secondary` / целевые `color-mix` (catalog, checkout, wedding, wedding-piggybank, cart, CartDrawer, care, events, CheckoutForm, SubscriptionLeadForm, ProductDetail).
- **/wedding** — блок галереи (3 placeholder), подпись CTA «Рассчитать оформление» на `/events`.
- Удалён неиспользуемый `HomeCafeSection.tsx`.
- **Badge** — акцент без массового oil-фона.

---

## Этап 14 — пассивный «beige» и блог

- Пассивные блоки **`bg-[var(--color-beige)]`** переведены на **`var(--bg-secondary)`**: доставка, контакты, оплата, подписка (FAQ-блоки), уход (`care`).
- Hover-подложки UI: **Header**, **CartDrawer**, **CartItem**, **ContactMenu**, **ProductFilters**, **ProductQuickViewModal**, **FAQAccordion**, **QuickAccess**, **QuickCategories**; вторичная кнопка **`Button`**; секция **`USPCircle`** (фон и круг-плашки).
- **EventQuizClient**: выделенный вариант — **`color-mix` orange 12%** в духе checkout/lead-форм.
- **PageHero**: hover на хлебных крошках — **`var(--paloma-orange)`**.
- Страница **FAQ**: CTA-блок уже на **`--bg-secondary`**, **`radius-md`**, **`shadow-soft`**.
- **Блог** (`/blog`): сетка **3 колонки на xl**, отступ **`--space-lg`**, карточки **`radius-md`**, **`shadow-soft`** → **`shadow-card`** при hover, зум изображения с **`dur-slow`**.
- **`--color-beige`** в `@theme`/`:root` сохранён как алиас на **`--paloma-white`** для обратной совместимости.

---

## Этап 15 — юридические и короткие текстовые страницы

- Класс **`.legal-doc`** в `globals.css`: единый межстрочный интервал, заголовки секций **h2**, разделитель **border-top** между разделами (кроме первого), списки, ссылки (**orange → burgundy** на hover), блок **мета-даты** с нижней линией.
- Компонент **`LegalArticle`**: семантический **`<article>`**, `container`, настраиваемая ширина (`max-w-4xl` по умолчанию).
- Подключено к **`/privacy`**, **`/offer`**, **`/consent`**; для единого ритма также **`/about`** (`max-w-3xl`), **`/gifts`** (внутренние ссылки без разрозненных классов).

---

## Этап 16 — оплата и «спасибо за заказ»

- **`/checkout/thank-you`**: **Breadcrumb JSON-LD**, **`PageHero`** по центру (eyebrow «Заказ создан»), один **h1**, иконка в блоке героя, ниже — панель CTA (**`radius-md`**, **`shadow-soft`**, **`--bg-primary`**).
- **`/payment/success`**, **`/payment/failed`**: блок под героем в той же панели; ссылка «Связаться с нами» — **orange → burgundy** на hover; **`definePageMeta`** (canonical и OG при **`noIndex`**).
- **`/payment`**: карточки способов оплаты — **`radius-md`**, **`shadow-soft`**, **`hover:shadow-card`**; блок «Безопасная оплата» — **`radius-md`**.

---

## Этап 17 — checkout, корзина, 404 под витрину

- **`/checkout`**: дублирующий локальный header заменён на **`PageHero`** (крошки как везде, eyebrow с брендом), метаданные — **`definePageMeta`** с **`noIndex`**, отступы контейнера на системных **`--space-*`**.
- **`CheckoutForm`**: панель «Корзина пуста» — **`bg-primary`**, **`shadow-soft`**, **`radius-md`**; кнопка «Назад» — hover **`--paloma-orange`**; ссылки согласия/оферты — **orange → burgundy**.
- **`CartPageClient`**: пустая корзина в карточке; сетка с **`--space-lg` / `--space-xl`**; сайдбар итого — **`bg-primary`**, **`shadow-soft`**, **`radius-md`**; «Продолжить выбор» в стиле брендовых ссылок.
- **`(site)/not-found.tsx`**: кастомная 404 с **`PageHero`** и панелью CTA (каталог / главная), в оболочке сайта (Header/Footer).

---

## Этап 18 — каталог и карточка товара

- **`/catalog`**: hero заменён на **`PageHero`** (eyebrow «Раздел/Коллекция», прежние **h1** и lead, крошки без устаревшего **`paloma-deep-cherry`** hover).
- **`ProductDetailClient`**: крошки и **h1** — **`PageHero`** с **`titleStyle`** под прежний компактный размер заголовка; мелкие акценты переведены на **`var(--color-cherry)`**.
- **`PageHero`**: необязательный проп **`titleStyle`** (слияние со стилем **h1**).
- **`CatalogContent`**, **`ProductFilters`**: отступы и зазоры через **`--space-*`**; десктоп-фильтры в панели (**`radius-md`**, **`shadow-soft`**); мобильный sheet — **`bg-primary`**, **`shadow-card`**; «Сбросить» — hover **burgundy**.

---

## Этап 19 — быстрый просмотр, моб. бар и мелкая хромота

- **`ProductQuickViewModal`**: оверлей на **`paloma-coal` + blur** вместо чистого **`black/45`**; диалог **`--bg-primary`**, **`shadow-card`**, **`radius-md`**; чип размера как в формах (**`color-mix` orange / white**); мессенджеры — **`underline-offset`** + hover **burgundy**.
- **`MobileBottomNav`**: лёгкая **верхняя тень** в тон углю, **`color-mix`** для полупрозрачного фона.
- **`PageHero`**: eyebrow и линейка под ним только через **`--color-cherry`** / **`color-mix(orange)`** без классов **`text-paloma-cherry`**.
- Общее: **`Breadcrumb`**, **`CookieBanner`**, **`ProductGrid`** (empty), **`QuickAccess`**, **`ReadyTodayGrid`**, **`HomeFAQSection`**, **`HomeDeliveryPayment`**, **`MusicToggle`**, цена тарифов в **`SubscriptionLeadForm`** — акценты и hover выровнены (**orange/cherry**, **burgundy** на текстовых hover).

---

## Этап 20 — кофейня, свадьба, копилка, пост блога

- **`/coffee`**: локальный hero заменён на **`PageHero`** (**`titleStyle`** для крупного **h1**); CTA + фото в **`children`** в сетке **1:1** на `lg`; все секционные подписи **`--color-cherry`** вместо **`text-paloma-cherry`**.
- **`CoffeeMenuClient`**: eyebrow секций на **`--color-cherry`**.
- **`/wedding`**: **`PageHero`** + три CTA в **`children`** (логика и ссылки без изменений).
- **`/wedding-piggybank`**: **`PageHero`**; ссылка на **`/wedding`** в брендовых ссылочных стилях; шаги процесса — цифры **`--paloma-burgundy`**; **`WeddingPiggybankClient`** — акценты через токены и **`color-mix`** на иконке успеха.
- **`/blog/[slug]`**: градиент оверлея на **`paloma-coal` + color-mix**; рубрика на **`--paloma-orange`**; крошки и «в блог» — **orange/burgundy** на hover.

---

## Этап 21 — контакты, доставка, мероприятия

- **`/contacts`**: **`definePageMeta`** (**canonical** / OG); **`PageHero`** с eyebrow (**`legalName`**) и **lead**; ссылки и треки — hover **burgundy**; убран неиспользуемый **`Link`** import.
- **`/delivery`**: **`definePageMeta`**; **`PageHero`** с eyebrow (**город · побережье**) и lead про **день-в-день** и порог бесплатной доставки; сетка преимуществ и слоты времени — **`--space-*`**, **`radius-md`**, лёгкая **тень**/hover на карточках интервалов; таблица зон и блок «Важно» в **панелях** **`shadow-soft`**.
- **`/events`**: **`definePageMeta`**; полноэкранный hero — оверлей **`paloma-coal` + color-mix**, крошки и eyebrow в палитре (**orange** на hover/акцент); портфолио — **`dur-slow`** и **`radius-md`**; граница секции квиза — **`--color-line`**.

---

## Этап 22 — FAQ, подарки, подписка, уход за букетом

- **`/faq`**: **`definePageMeta`** (**`/faq`**); **`PageHero`** с eyebrow (**`legalName`**) и lead; блок «Не нашли ответ?» — граница **`--color-line`**.
- **`/gifts`**: eyebrow **`siteConfig.name`** под общий ритм hero; мета уже была на **`definePageMeta`**.
- **`/subscription`**: **`definePageMeta`**; заголовок через **`siteConfig.name`**; тарифы — **`radius-md`**, **`shadow-soft`** / **`shadow-card`**, сетка на **`--space-lg`**, **`color-line`**, плавный hover тени; тёмная карточка — **`color-mix`** вместо **`white/xx`**; FAQ внизу — панели **`radius-md` + `shadow-soft` + `color-line`**.
- **`/care`**: **`definePageMeta`**; hero — eyebrow бренда и короткий lead; карточки советов и виды цветов — **`radius-md`**, **`color-line`**, **`shadow-soft`** (у советов — hover **`shadow-card`**).

---

## Изменённые / созданные файлы

### Дизайн-система

- `src/styles/tokens.css` — создан: `--paloma-*`, spacing, radius, shadows, easing, breakpoints.
- `src/app/globals.css` — добавлен `@import "../styles/tokens.css"` перед Tailwind.
- `src/styles/globals.css` — переработаны `@theme`, `:root` (семантика под палитру), `.container`, кнопки, скроллбар, сетка каталога **4→3→2→1 колонки**, утилиты `.hero-title`, `.section-title`, `.body-large`, `.body-text`, `.typo-caption`, `.fluid-*`, `.btn-outline`, **`.legal-doc`** (типографика юридических страниц), тёмная тема на основе `--paloma-coal`.
- `src/components/layout/LegalArticle.tsx` — семантический контейнер статей (оферта, политика, согласие, короткие тексты).

### Главная страница

- `src/components/home/Preloader.tsx` — ~2 с удержание, фон `--paloma-burgundy`, штора `translateY(100%)`, подпись с letter-spacing; `sessionStorage` как прежде.
- `src/components/home/HeroSection.tsx` — только фон и `PALOMA`, `100svh` + блок скролла `125vh` на desktop, GSAP scrub (title вниз и opacity; на desktop фон scale 1→1.1).
- `src/components/home/AboutOverlapSections.tsx` — новый: два sticky-блока `100svh`, тексты из ТЗ, CTA каталога.
- `src/components/home/ScrollCoffeeGrain.tsx` — новый: SVG «зерно», вращение по скроллу (GSAP).
- `src/components/home/HomeCoffeeGrainSection.tsx` — новый: светлый блок кофе + CTA `/coffee`.
- `src/components/home/FlowersGalleryUsp.tsx` — новый: cross-fade слева, sticky УТП справа, CTA `/events`, список УТП.
- `src/components/home/WeddingGallery.tsx` — плейсхолдеры картинок заменены на Unsplash URLs (нет сломанных `/images/…`).
- `src/app/(site)/page.tsx` — порядок секций после hero обновлён под ТЗ.

### Глобальные UI

- `src/components/ui/CustomCursor.tsx` — след из 4 точек + основной круг, палитра orange/burgundy, условие `pointer: fine` и `≥768px`, hover/view размеры.
- `src/components/layout/Header.tsx` — скролл-фон в `paloma-white` с blur вместо старого масляного tint.
- `src/components/layout/PageHero.tsx` — единый hero; крошки; eyebrow на **`--color-cherry`** и линейка **`color-mix(orange)`**; опционально **`titleStyle`** для **h1** (например PDP).
- `src/components/catalog/ProductQuickViewModal.tsx` — оверлей и панель через токены; чип размеров; мессенджеры с переходом hover **burgundy**.
- `src/components/layout/MobileBottomNav.tsx` — полупрозрачный фон и верхняя тень без «голого» тёмного блока.

### Кофейня

- `src/app/(site)/coffee/page.tsx` — hero через **`PageHero`**, секционные акценты на **`--color-cherry`**.

---

## Новые зависимости

Не добавлялись. Используются существующие **GSAP** и Tailwind/framer уже в проекте. Three.js / R3F в `package.json` по-прежнему не использованы под зерно — выбран SVG.

---

## Расположение ключевых блоков

| Блок           | Компонент / маршрут |
|----------------|---------------------|
| Preloader      | `src/components/home/Preloader.tsx` |
| Hero           | `src/components/home/HeroSection.tsx` |
| Overlap «О нас» | `AboutOverlapSections.tsx`, в `/` после hero |
| Курсор         | `CustomCursor.tsx`, `(site)/layout.tsx` |
| Кофе + зерно   | `HomeCoffeeGrainSection` + `ScrollCoffeeGrain`, `/` |
| Галерея УТП    | `FlowersGalleryUsp.tsx`, `/` |
| Кофейня        | маршрут `/coffee` |

---

## Что заменить вручную (TODO)

- **Hero, overlap, главная галерея** — свой фото-контент вместо Unsplash (`HeroSection.tsx`, `AboutOverlapSections.tsx`, `FlowersGalleryUsp.tsx`).
- **Свадебная галерея** на `/wedding` — заменить 3 placeholder-кейса на студийные материалы.
- **SVG-зерно** при желании — на 3D или более выразительный локальный SVG в `ScrollCoffeeGrain.tsx`.

---

## Проверки

- Выполнен `npm run build` — успешно (этапы 13–22).

---

## Known issues / TODO

1. Первая отрисовка **Preloader**: до выполнения `useLayoutEffect` возможна очень короткая вспышка контента у первых визитов (ограничения SSR клиентского блока).
2. **Длинная колонка УТП** в `FlowersGalleryUsp` на низком viewport — блок рассчитан на вертикальную историю при скролле.
3. Прочие длинные текстовые маршруты при появлении контента можно обернуть в **`LegalArticle`** так же, как оферту и политику.

---

*Отчёт сформирован по этапам 2–22 брифа Paloma.*
