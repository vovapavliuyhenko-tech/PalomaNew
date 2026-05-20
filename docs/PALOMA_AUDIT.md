# PALOMA_AUDIT.md — аудит проекта (Этап 1)

Дата: 2026-05-13. Рабочая область: `d:\Проекты\paloma`.  
Режим: только чтение кода и инвентаризация; изменения бизнес-логики не выполнялись.

---

## 1. Стек

| Параметр | Значение |
|----------|----------|
| Фреймворк | **Next.js 16.2.5** (App Router, `src/app`) |
| React | **19.2.4** |
| Сборка / dev | стандартный `next dev` / `next build` (`package-lock.json` — npm) |
| Стили | **Tailwind CSS v4** — `src/app/globals.css` → `@import "../styles/globals.css"`; PostCSS: `@tailwindcss/postcss` |
| Дополнительно | **Sass** (`sass`, файл `src/styles/animations.scss` **не импортируется** в текущей сборке) |
| Анимации | **Framer Motion**, **GSAP** (в т.ч. динамический `ScrollTrigger` в hero), **Zustand** (корзина, UI, preloader-флаг) |
| Формы | **react-hook-form** + **zod** + `@hookform/resolvers` |
| Backend / CMS | Supabase (`@supabase/*`), Sanity (`sanity`, `next-sanity`), API routes в `src/app/api/` |
| 3D (зависимости) | **three**, **@react-three/fiber**, **@react-three/drei** установлены в `package.json`; **в `src/` использования R3F не найдено** (поиск по `Canvas`, `react-three`) |

---

## 2. Структура папок (краткое дерево)

```
src/
  app/
    layout.tsx                 # корень: metadata, шрифты, JsonLd
    globals.css                # tailwind + импорт tokens
    (site)/layout.tsx          # Header, Footer, Cart, Cursor, main
    (site)/page.tsx            # главная
    (site)/catalog/…
    (site)/coffee/…
    (site)/wedding/…
    (site)/checkout/…
    (admin)/…                  # админка (вне scope редизайна витрины)
    api/…
  components/
    layout/   # Header, Footer, MobileMenu, …
    home/     # Preloader, Hero, секции главной
    catalog/  # ProductCard, ProductGrid, фильтры
    cart/     # CartDrawer, CartItem
    checkout/ # CheckoutForm
    ui/       # CustomCursor, ScrollReveal, …
  styles/
    globals.css                # @theme, :root, .container, утилиты
    animations.scss            # не подключён к app
  lib/        # store, analytics, catalog loaders, siteConfig
  data/       # mockProducts и др.
public/       # ограниченный набор svg; hero/кофейня в основном через Unsplash CDN
docs/         # REDESIGN_AUDIT.md, REDESIGN_REPORT.md, PALOMA_AUDIT.md
```

---

## 3. Ключевые страницы (публичный сайт)

| Маршрут | Файл(ы) |
|---------|---------|
| `/` | `src/app/(site)/page.tsx` |
| `/catalog` | `src/app/(site)/catalog/page.tsx`, `CatalogContent.tsx` |
| `/catalog/[slug]` | `src/app/(site)/catalog/[slug]/page.tsx`, `ProductDetailClient.tsx` |
| `/coffee` | `src/app/(site)/coffee/page.tsx`, `CoffeeMenuClient.tsx` |
| `/wedding` | `src/app/(site)/wedding/page.tsx` |
| `/cart`, `/checkout`, `/payment/*` | соответствующие `page.tsx` в `(site)/` |
| `/blog`, `/contacts`, `/delivery`, `/events`, `/gifts`, `/subscription`, … | `src/app/(site)/<route>/page.tsx` |

Админка: `src/app/(admin)/admin/…` — отдельный layout; палитру можно не трогать или ослабленно.

---

## 4. Header / Navigation

- **Компонент:** `src/components/layout/Header.tsx` (client).
- **Особенности:** `fixed`, `z-[110]`, выпадающие «Каталог» и «Клиентам», счётчик корзины из `useCartStore`, мобильное меню `MobileMenu.tsx`, `CatalogDropdownPanel.tsx`, `ContactMenu.tsx`.
- **Стили:** Tailwind + CSS-переменные; класс `.nav-header-link` в `src/styles/globals.css` (подчёркивание `scaleX`, цвет `--color-burgundy`).
- **Соответствие ТЗ:** фиксированный header и линия меню уже есть; нужна смена токенов на палитру Paloma (оранж/бордо), hover-акцент `#F0522B` / `#7F0D0E` через переменные.

---

## 5. Каталог

- **Сетка:** `ProductGrid.tsx` → класс `.catalog-product-grid` в `globals.css` (`repeat(auto-fill, minmax(280px, 1fr))`).
- **Фильтры:** `src/components/catalog/ProductFilters.tsx` (URL query: `category`, `q`, `size`, `max`).
- **Данные:** `getCatalogBootstrap` и т.д. в `src/lib/catalog/` — **не ломать фильтрацию и загрузку**.
- **Отступы до ТЗ:** на брейкпоинтах 1440 / 1200 задать явные `grid-cols` 4→3→2→1–2 и `gap` из токенов.

---

## 6. Корзина

- **Состояние:** `src/lib/store/cartStore.ts` (zustand + `persist` на `localStorage`; **в persist не попадают** `preloaderDone` / мобильное меню — только согласие, музыка, тема).
- **UI:** `src/components/cart/CartDrawer.tsx`, `CartItem.tsx` — оверлей, upsell, переход в checkout.
- **Кофейня:** `CoffeeMenuClient.tsx` вызывает `addItem` с `type: "coffee"` и `analytics.addCoffeeToCart` — **сохранять поведение**.

---

## 7. Формы

- **Checkout:** `src/components/checkout/CheckoutForm.tsx` — два шага, Zod-схемы `step1Schema` / `step2Schema`, отправка на API (логика ниже по файлу — не менять контракт полей).
- **Прочее:** `src/app/(site)/wedding-piggybank/WeddingPiggybankClient.tsx`, лид-формы (`SubscriptionLeadForm.tsx` и др.) — те же паттерны RHF + zod.
- **Редизайн:** только классы/цвета/`border-radius` из токенов, без изменения схем валидации.

---

## 8. Глобальные стили и переменные

- **Источник истины:** `src/styles/globals.css` — блок `@theme` (Tailwind v4) + расширенный `:root`.
- **Уже есть:** `--container-max`, spacing, тени, breakpoints, `.container`, типографические clamp-переменные, семантика `--bg-primary`, `--text-primary`, тёмная тема `[data-theme="dark"]`.
- **Проблема:** палитра «cherry / oil / pink» и дубли имён (`--color-oil-dark` дважды в `@theme`), плюс второй слой «PALOMA v2» (`--color-accent-primary` и т.д.) с **жёсткими hex** (#8b4513, #e8704f …) — **расходится с обязательной палитрой ТЗ** (#F0522B, #7F0D0E, #FFFDF8, #282828).
- **Радиусы ТЗ:** `--radius-sm` сейчас `4px`, в ТЗ — `8px`; нужна унификация через новые токены без поломки всего UI за один коммит (поэтапно).

---

## 9. Подключённые шрифты

| Источник | Назначение |
|----------|------------|
| `next/font/google` **Montserrat** | `src/app/layout.tsx` → CSS variable `--font-montserrat` → `--font-accent` / `--font-body` |
| Google Fonts `<link>` в `<head>` | **Classical One**, **Cormorant Garamond**, **EB Garamond**, **Inter** |
| В токенах | `--font-display`, `--font-serif`, `--font-sans`, `--font-body` |

Тяжёлые новые шрифты не обязательны: editorial-акцент уже дают Cormorant Garamond / EB Garamond + italic Montserrat.

---

## 10. Ассеты и изображения

- **Hero / кофейня / свадьба:** много **внешних URL Unsplash** в `HeroSection.tsx`, `coffee/page.tsx`, `wedding/page.tsx` — подходят как временные **TODO: заменить на брендовые снимки**.
- **Локально в `public/`:** в основном общие svg; **нет** папки `public/images/` с файлами из кода.
- **Сломанные пути:**  
  - `WeddingGallery.tsx`: `/images/weddings.jpg`, `/images/decoration-detail.jpg` — **файлов нет в репозитории**.  
  - `animations.scss`: `/images/torn-edge.svg` — **файла нет** (и файл scss не импортируется).

---

## 11. Проблемные зоны (gap vs ТЗ нового брифа)

Указаны файлы для приоритизации; строки — по состоянию на момент аудита.

1. **`src/components/home/HeroSection.tsx` (≈88–222):** секция `lg:min-h-[170vh]` + sticky — **не ровно `100vh`/one-screen** как в ТЗ hero; присутствуют **CTA, подзаголовок, орбита УТП, жираф** — ТЗ просит **только фон + слово PALOMA** и scroll-анимацию title + scale фона до **1.1** (сейчас scrub с **1.05→1.08** на bg, title `yPercent`/opacity).
2. **`src/components/home/Preloader.tsx` (≈25–35):** при `prefers-reduced-motion: reduce` прелоадер **полностью отключается** — в ТЗ нужен **статичный** вариант на короткое время.
3. **`Preloader.tsx` (≈9–11, 38–41, 69–77):** время удержания **~1.66 с** (`MAIN_HOLD_MS`), выход — **opacity/blur/scale**, а не **шторка translateY ~0.8s**; палитра `--color-burgundy` **не #7F0D0E**.
4. **`src/components/ui/CustomCursor.tsx`:** один круг + `gsap.quickTo`, **нет следа/trail** из 3–5 точек; размеры близки к ТЗ; цвета через старые `--paloma-*`.
5. **`src/components/layout/Header.tsx` (≈102–105):** подсветка скролла привязана к **старым** `rgba(254,236,222,…)` / oil — заменить на токены `#FFFDF8` с blur.
6. **`src/styles/globals.css`:** десятки **хардкод hex** в `:root` и `@theme`; кнопки `.btn-primary`/`.btn-secondary` — **не через новую палитру**; scrollbar, torn-edge data-URI с `#ffffff`.
7. **Главная `src/app/(site)/page.tsx`:** нет блоков **overlap «О нас» (2×100vh)**, **коварного зерна со scroll-rotate**, **галереи УТП со sticky-текстом** — всё предстоит **добавить/заменить секции** без ломки `ProductQuickViewProvider`.
8. **`HomeCafeSection.tsx`:** тёмный full-bleed блок с градиентом — по ТЗ блок кофе на главной должен быть **светлый #FFFDF8**, две колонки, **зерно + текст + CTA «Зайти в кофейню»** — потребуется **перекомпоновка**.
9. **`coffee/page.tsx`:** структура близка к ТЗ (hero, атмосфера, меню, сезон, офлайн, букеты, CTA); нужны **типографика/сетка/палитра** и возможное **расширение** под «Paloma Coffee» как в брифе; **h1 текст** оставить семантически (не менять SEO-тексты без согласования — только уточнить с заказчиком).
10. **`ProductGrid` / `.catalog-product-grid`:** нет явной сетки **4/3/2** на заданных breakpoints; на мобильном `minmax(164px)` даёт **до 2 колонок** при 360px — проверить под «1–2 колонки».
11. **`Footer.tsx`:** использует `--bg-premium` (сейчас бордо-семейство) — нужно **строго `--paloma-coal`** и акценты orange/burgundy как в ТЗ.
12. **Дублирование токенов** и **конфликт имён** (`--color-orange` vs палитра Paloma) усложнят «без хардкода в компонентах» — потребуется **миграция**: сначала семантические алиасы (`--accent`, `--surface`, …), затем постепенная замена классов.
13. **`metadata` в `src/app/layout.tsx` и страницах:** **не менять** строки title/description/h1-тексты; только стили.
14. **`AmbientMusic.tsx`:** уже **без автоплея** — сохранить.
15. **`package.json`:** R3F/Three висят без использования — для зерна можно **либо** подключить Canvas **точечно** с `dynamic(..., { ssr: false })`, **либо** обойтись SVG/CSS по ТЗ«легче» — решение на Этапе 7.

---

## 12. План изменений (Этапы 2–11) — файлы и компоненты

### Этап 2 — Дизайн-система
- Добавить `src/styles/tokens.css` (или реорганизовать `globals.css`): переменные из раздела 5 ТЗ (`--paloma-orange`, `--paloma-burgundy`, `--paloma-white`, `--paloma-coal`, spacing, radius-sm/md/lg/pill, shadows, easing, breakpoints).
- Импортировать в `src/app/globals.css` или в начало `src/styles/globals.css`.
- Сопоставить семантику: `--bg-primary` → `--paloma-white`, тёмные секции → `--paloma-coal`, акценты → токены (без массовых фонов).
- Обновить `@theme` в Tailwind для utility-классов (`bg-paloma-*`), чтобы убрать хардкод из JSX постепенно.
- Utilities: классы `.hero-title`, `.section-title`, `.body-large`, `.body`, `.caption` по ТЗ (или эквивалент в globals).

### Этап 3 — Preloader
- `src/components/home/Preloader.tsx`: длительность ~2s, фон `#7F0D0E`, текст через разметку (PALOMA + подпись), exit `translateY(100%)` + `visibility`/`pointer-events`, reduced-motion ветка.
- При необходимости — `src/lib/store/uiStore.ts` только если нужен общий флаг (уже есть `setPreloaderDone`).

### Этап 4 — Hero
- `HeroSection.tsx` (возможно разбить на подкомпоненты): высота **`100svh`** на всех брейкпоинтах для «первого экрана», убрать CTA/орбиту/жирафа из первого экрана по ТЗ; фон Next/Image + placeholder; GSAP ScrollTrigger: title translateY + opacity, bg scale **1 → 1.1**; mobile simplified.
- Проверить конфликт с отступом `main` под header (`(site)/layout.tsx`).

### Этап 5 — Overlap «О нас»
- Новый модуль, напр. `src/components/home/AboutOverlapSections.tsx` (2 секции `100vh`/`100svh`, `sticky` или GSAP pin), тексты из ТЗ, CTA «Смотреть букеты» → `/catalog`.
- Подключить в `src/app/(site)/page.tsx` сразу после hero.

### Этап 6 — Кастомный курсор
- `CustomCursor.tsx`: trail (2-й div или массив точек) + `requestAnimationFrame` lerp **или** оставить GSAP но добавить след; hover 48–56px; `pointer-events: none`; coarse pointer / max-width 768px off; reduced-motion → системный курсор (уже частично есть).

### Этап 7 — Блок кофейни с зерном
- Заменить или переработать `HomeCafeSection.tsx`: светлый фон, сетка, SVG/Canvas/R3F зерно с rotation по scroll progress (ScrollTrigger).
- При R3F: клиентский компонент + `next/dynamic` с `ssr: false`.

### Этап 8 — Страница кофейни
- `coffee/page.tsx`, `CoffeeMenuClient.tsx`: привести к структуре ТЗ (нейминг секций, сетки, карточки); корзина — **как сейчас**, при несовместимости — визуальное меню без add-to-cart + TODO.
- Не трогать `getCoffeeMenuBootstrap` и типы товаров.

### Этап 9 — Галерея и УТП
- Новый компонент (например `src/components/home/FlowersGalleryUsp.tsx`): horizontal / sticky gallery + cross-fade, sticky-текст справа, CTA «Оформить событие» (маршрут уточнить: `/events` или форма — как в проекте).
- Вставить в `page.tsx` после кофейного блока.

### Этап 10 — Глобальный редизайн
- `Header.tsx`, `Footer.tsx`, `MobileMenu.tsx`, `MobileBottomNav.tsx`, `components/ui/*` (кнопки, ThemeToggle, CookieBanner).
- Каталог: `ProductCard.tsx`, `ProductFilters.tsx`, `ProductGrid.tsx`, страницы `catalog/page.tsx`, `[slug]/ProductDetailClient.tsx`.
- Корзина: `CartDrawer.tsx`, `CartItem.tsx` — только стили.
- Checkout и формы: `CheckoutForm.tsx`, остальные формы — классы и ошибки (`text-red-500` → токен статуса).
- Свадьба: `wedding/page.tsx` + исправить ассеты в `WeddingGallery.tsx`.
- Прочие страницы `(site)/*/page.tsx` — фоновые/акцентные классы.

### Этап 11 — Адаптивный QA
- Проверка 1440, 1200, 768, 375, 360; overflow-x; touch 44px; reduced-motion.

---

## 13. Acceptance — текущее состояние (кратко)

Большая часть пунктов чеклиста ТЗ (**preloader-тайминг и анимация, hero-содержание, overlap, галерея УТП, палитра, курсор-след, зерно, сетка каталога 4-колонки**) на момент аудита **не выполнены** или выполнены **частично**. Корзина, checkout, фильтры каталога, маршрут `/coffee`, аналитика и SEO-метаданные **на месте** — их нужно сохранить.

---

*Конец аудита Этапа 1. Переход к реализации — после подтверждения заказчиком.*
