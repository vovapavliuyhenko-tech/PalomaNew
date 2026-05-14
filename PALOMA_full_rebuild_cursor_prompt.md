# PALOMA — полная спецификация editorial storytelling (cursor prompt)

Документ фиксирует требования к горизонтальным **storytelling**-секциям Paloma и соответствие коду в репозитории. Исходный промпт можно отдавать ассистенту целиком для восстановления или доработки.

## Роль и уровень

Senior frontend + creative dev + editorial UI: премиальная типографика, асимметрия, «полоса журнала», плавный скролл (GSAP ScrollTrigger на desktop), вертикальная вёрстка на mobile (<768px).

## Стек проекта (факт)

- **Next.js** App Router: страницы в `app/(site)/…`, глобальные стили: `app/globals.css` → `@import "../styles/globals.css"`.
- **Tailwind CSS v4**: токены в `@theme` и `:root` внутри `styles/globals.css` (отдельного `tailwind.config.ts` с `extend` в корне нет).
- **Шрифты**: *Classical One* — Google Fonts через `<link>` в `app/layout.tsx`; **Montserrat** — `next/font/google`, CSS-переменная `--font-montserrat` на `<body>`.
- **GSAP** + **ScrollTrigger**: динамический `import()` в `HorizontalStorySection` (не в initial bundle для всей страницы).
- **Изображения**: `next/image`; в `next.config.ts` уже разрешены `images.unsplash.com` и `cdn.sanity.io`.

## Дизайн-система

### Цвета Paloma

| Токен | Значение |
|--------|----------|
| cherry | `#E296B2` |
| oil / story-bg | `#FEECDE` |
| coal | `#282828` |
| deep-cherry / heading | `#9F1523` |
| warm-brown | `#8A5A3C` |
| beige | `#A58B6A` |

### CSS-переменные

В `styles/globals.css`: палитра `--paloma-*`, storytelling `--story-*`, motion `--ease-smooth`, `--ease-out`, `--dur-base`; в `@theme` — цвета `paloma-*`, `font-display`, `font-accent`.

### Глобально для секций

- `body { overflow-x: hidden }` — важно для pin + горизонтальной ленты.
- Блок `.story-intro-panel`, `.story-step-panel` и переход для `#bouquet-story-hint`, `#wedding-story-hint`.

## Структура данных

Файл: **`data/palomaStories.ts`**

- `StoryImage`: `src`, `alt`, `role` (`hero` | `secondary` | `accent` | `float`), `aspect` (tailwind-класс aspect-*).
- `StoryStep`: `number`, `title`, `text`, `handwritten`, `images[]`, `layout` (`photo-left` | `photo-right` | `photo-top` | `photo-scattered`).
- `StorySection`: `id`, `eyebrow`, `title`, `description`, `variant` (`bouquet` | `wedding`), `steps[]`.
- Экспорты: **`bouquetStory`**, **`weddingStory`** (placeholder-фото Unsplash + комментарии TODO для замены на `/images/paloma/…`).

## Компоненты (создать/поддерживать)

| Файл | Назначение |
|------|------------|
| `components/storytelling/DecorativeArrow.tsx` | Стрелки `right` / `down-right` / `curved` + `DecorativeLine` |
| `components/storytelling/StoryIntroPanel.tsx` | Intro: eyebrow, display-заголовок, описание, floating accent images |
| `components/storytelling/StoryStepPanel.tsx` | Шаг: 4 layout-варианта, hover scale на фото |
| `components/storytelling/HorizontalStorySection.tsx` | Desktop: pin + scrub 1.2 + progress + hint; mobile: вертикальный столбец + noise |

## Подключение страниц

- **`app/(site)/page.tsx`**: после `SeasonalBouquets` — `<HorizontalStorySection story={bouquetStory} introAccentImages={…} />`.
- **`app/(site)/wedding/page.tsx`**: страница с `<HorizontalStorySection story={weddingStory} … />`.

Навигация: **Свадебная флористика** → `/wedding` (Header, MobileMenu, Footer).

## Критические требования

1. Не «карточная сетка» — editorial асимметрия, разные размеры фото.
2. Крупная типографика (`clamp` от ~2.5rem до 5.5rem+).
3. Рукописные акценты: italic `font-accent`, цвет cherry.
4. Воздух: щедрые `padding`, без тесноты.
5. GSAP: `scrub: 1.2`, корректный `end` от ширины трека.
6. Mobile: без горизонтального скролла секции.
7. Noise/paper: лёгкий SVG noise (`opacity` ~0.025–0.04).
8. Замена медиа: TODO в данных на реальные фото Paloma.

## Проверки

```bash
npx tsc --noEmit
npm run build
npm run dev
```

Чеклист: горизонталь плавный | pin корректен | нет лишнего overflow у `body` | mobile вертикально | lazy images | progress-линия | шрифты и цвета Paloma | сборка без ошибок.

## Список файлов (эталон)

**Созданы/обновлены кодом:**

- `data/palomaStories.ts`
- `components/storytelling/*.tsx` (4 файла)
- `app/(site)/page.tsx`, `app/(site)/wedding/page.tsx`
- `styles/globals.css`, `app/layout.tsx`
- `package.json` — зависимость `gsap`

**Проверить без ломки:**

- Каталог, корзина, Sanity, остальные маршруты.

---

*Версия документа: синхронизирована с реализацией storytelling в репозитории Paloma.*
