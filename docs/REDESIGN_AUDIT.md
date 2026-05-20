# REDESIGN_AUDIT.md — Paloma / Plombir Flowers

Дата аудита: 2026-05-12. Репозиторий: `d:\Проекты\paloma`.

## 1. Стек

| Параметр | Значение |
|----------|----------|
| Фреймворк | **Next.js 16.2.5** (App Router, `src/app`) |
| React | **19.2.4** |
| Сборка | Turbopack / Next (стандарт `next dev`, `next build`) |
| Стили | **Tailwind CSS v4** (`@import "tailwindcss"` в `src/app/globals.css`), глобальные токены в **`src/styles/globals.css`** |
| Дополнительно | **Sass** (`sass`), **Framer Motion**, **GSAP** + ScrollTrigger (hero), **Zustand** (корзина/UI), Supabase/Sanity |

## 2. Структура папок

| Область | Путь |
|---------|------|
| Страницы сайта | `src/app/(site)/` |
| Layout сайта | `src/app/(site)/layout.tsx` |
| Корневой layout / шрифты | `src/app/layout.tsx` |
| Компоненты | `src/components/` (`layout/`, `catalog/`, `home/`, `ui/`) |
| Глобальные стили | `src/app/globals.css` → импорт `src/styles/globals.css` |
| Данные / конфиг | `src/lib/`, `src/data/` |

## 3. Ключевые страницы

| Страница | Маршрут | Файл |
|----------|---------|------|
| Главная | `/` | `src/app/(site)/page.tsx` |
| Каталог | `/catalog` | `src/app/(site)/catalog/page.tsx`, `CatalogContent.tsx` |
| Карточка товара | `/catalog/[slug]` | `src/app/(site)/catalog/[slug]/page.tsx` |
| Свадьба | `/wedding` | `src/app/(site)/wedding/page.tsx` |
| Кофейня | `/coffee` | `src/app/(site)/coffee/page.tsx`, `CoffeeMenuClient.tsx` |
| Блог | `/blog` | `src/app/(site)/blog/page.tsx` |
| Клиентам (разрозненно) | `/delivery`, `/payment`, `/care`, `/faq` | соответствующие `page.tsx` |
| Контакты | `/contacts` | `src/app/(site)/contacts/page.tsx` |
| Корзина | `/cart` | `src/app/(site)/cart/page.tsx` |
| Вазы и подарки | `/gifts` | `src/app/(site)/gifts/page.tsx` |
| Мероприятия | `/events` | `src/app/(site)/events/page.tsx` |

## 4. Header / Navigation

- **Компонент:** `src/components/layout/Header.tsx` (client).
- **Текущая модель:** `fixed`, `z-50`, логотип **слева** в одном flex-row с навигацией справа и иконками — **не соответствует** ТЗ (центральный логотип, три колонки).
- **Mega-menu каталога:** `CatalogMegaMenu.tsx` — **4 колонки** (Каталог / Свадьбы / Мероприятия / Клиентам), не двухколоночный dropdown только по каталогу.
- **Мобильное меню:** `MobileMenu.tsx` — fullscreen, блокировка scroll body есть; закрытие текстом «закрыть», структура пунктов ≠ ТЗ (нет аккордеона «Каталог» с 12 подпунктами); шапка mobile: бургер справа по факту в текущей разметке (иконки справа с бургером).
- **Константы:** `src/lib/constants.ts` — `PRIMARY_NAV_PUBLIC`, `MOBILE_MENU_LINKS`.

## 5. Каталог

| Элемент | Файл |
|---------|------|
| Сетка | `src/components/catalog/ProductGrid.tsx` — `grid-cols-2 md:grid-cols-3`, без `auto-fill` / minmax(280px) |
| Карточка | `src/components/catalog/ProductCard.tsx` — overlay-текст на изображении, `aspect-[3/4]`, Framer Motion подъём карточки |
| Фильтры | `src/components/catalog/ProductFilters.tsx` — десктоп sidebar + mobile bottom sheet (уже близко к ТЗ) |
| Контент страницы | `CatalogContent.tsx` — фильтрация по URL (бизнес-логика сохраняется) |

## 6. Глобальные стили и переменные

- В **`src/styles/globals.css`** уже есть палитра cherry/oil/coal/burgundy, частичные `--space-*`, `--container-max` (**1320px**, не 1440px), дублирующиеся токены (`--radius-md` в `@theme` 8px vs отдельные `--radius-*`).
- Нет единого набора из ТЗ: `--container-padding-desktop|tablet|mobile`, `--space-xxs` … `--space-xxxl` как фиксированная шкала, `--ease-soft`, `--shadow-soft` / `--shadow-card` в запрошенном виде, класс **`.container`** как единый контракт.
- **`prefers-reduced-motion`:** правило `* { transition-duration: 0.01ms !important }` — слишком агрессивное, может ломать ожидаемые микровзаимодействия.

## 7. Шрифты

- **Montserrat:** `next/font/google` в `src/app/layout.tsx` → `--font-montserrat`, начертания 300/400/500, normal + **italic**.
- **Google Fonts link:** Classical One, Cormorant Garamond, EB Garamond, Inter (`layout.tsx` `<head>`).
- **`body`** в CSS использует `var(--font-sans)` (**Inter**), не Montserrat — рассогласование с `--font-body`.
- Референсные **Classical One** + **Montserrat Italic** доступны для editorial / акцентов.

## 8. Проблемные зоны (файлы и наблюдения)

1. **`Header.tsx` (~67–76):** логотип слева, не центр; меню не разбито в grid `1fr auto 1fr`.
2. **`Header.tsx` (~78–141):** состав пунктов (Свадьбы, Мероприятия, Кофейня, Контакты) ≠ ТЗ (Каталог, Вазы, Свадебная страница | Клиентам, Блог, Контакты).
3. **`Header.tsx` (~56):** `z-50` < требуемого ≥100 для фиксированной шапки.
4. **`CatalogMegaMenu.tsx` (~82–86):** четыре колонки разделов вместо двухколоночного каталожного dropdown с 12 подпунктами.
5. **`MobileMenu.tsx` (~46–61):** нет крестика в правом верхнем углу в явном виде; нет аккордеона каталога.
6. **`(site)/layout.tsx` (~22):** основной `<main>` без системного **padding-top** под высоту fixed header — контент может уезжать под шапку (локально компенсируется `pt-24` на отдельных inner headers).
7. **`globals.css` (~233–253 vs ~139–145):** дублирующиеся шкалы заголовков (`h1`–`h3` vs `--fz-h1`), не совпадают с запрошенными `clamp()` из ТЗ §7.
8. **`globals.css` (~166–168):** `--container-max: 1320px` вместо 1440px; `--container-pad` как clamp вместо явных desktop/tablet/mobile токенов.
9. **`ProductGrid.tsx` (~47):** сетка не `repeat(auto-fill, minmax(280px, 1fr))` и gap не завязан на `--space-lg/--space-md`.
10. **`ProductCard.tsx` (~92–97, ~140–155):** маркетплейс-оверлей на фото; карточки не «фото сверху + типографика снизу» как в бутиковом ТЗ.
11. **`page.tsx` (home):** `MarqueeLine` сразу после hero — ТЗ: одна бегущая строка **перед футером**.
12. **`wedding/page.tsx`:** сильная страница, но нет явной кнопки **«Рассчитать»**; заголовки ниже запрошенных clamp §7.
13. **`coffee/page.tsx`:** нет полной структуры sjostrand (отдельные блоки «о кофейне», сезонное меню, офлайн-карта, мостик с **карточками каталога** — только текстовый CTA).
14. **`globals.css` (~457–461):** глобальное укорочение всех transitions для reduced-motion.
15. **`ThemeToggle` / `MusicToggle`:** в шапке на всех ширинах — при спецификации mobile-only иконки поиск+корзина возможен перегруз первого ряда (уточняется при вёрстке ≤768px).

## 9. План изменений по этапам

| Этап | Файлы (ориентир) |
|------|------------------|
| Дизайн-система | `src/styles/globals.css`, при необходимости `@theme` блок |
| Header | `Header.tsx`, новый модуль dropdown каталога (замена `CatalogMegaMenu`), `MobileMenu.tsx`, опционально `lib/catalogDropdownLinks.ts` |
| Layout отступ | `src/app/(site)/layout.tsx` |
| Каталог | `ProductGrid.tsx`, `ProductCard.tsx`, `ProductFilters.tsx` (визуал чипов / активного состояния) |
| Главная | `src/app/(site)/page.tsx`, `MarqueeLine` позиция |
| Свадьба | `src/app/(site)/wedding/page.tsx` |
| Кофейня | `src/app/(site)/coffee/page.tsx`, `CoffeeMenuClient.tsx` |
| Анимации | новый `ScrollReveal` (IntersectionObserver), правки `globals.css` для reduced-motion |
| Отчёт | `docs/REDESIGN_REPORT.md` |

Бизнес-логика фильтров каталога, корзины, роутинг API не изменяются по смыслу — только разметка/CSS и безопасные обёртки.
