/** Маркетинговая навигация и публичные маршруты (контракт этапа 1 / ТЗ PALOMA) */

/** Адрес бутика и доставки по `docs/PRD.md` / `docs/PROJECT_RULES.md`. */
export const ADDRESS = "Новороссийск, ул. Энгельса, 74";

/** Порог бесплатной доставки (₽), синхрон с `siteConfig.minOrderFreeDelivery`. */
export const FREE_DELIVERY_THRESHOLD = 5000 as const;

export const CITIES = [
  "Новороссийск",
  "Кабардинка",
  "Геленджик",
  "Анапа",
  "Краснодар",
] as const;

export type DeliveryCity = (typeof CITIES)[number];

/** Интервалы доставки — PRD / checkout. */
export const DELIVERY_INTERVALS = [
  { id: "10-14", label: "10:00–14:00" },
  { id: "14-18", label: "14:00–18:00" },
  { id: "18-21", label: "18:00–21:00" },
  { id: "call", label: "Согласовать с менеджером" },
] as const;

/** Надбавки к доставке, PRD §9. */
export const DELIVERY_SURCHARGE_URGENCY = 500 as const;
export const DELIVERY_SURCHARGE_EXACT_TIME = 1000 as const;

export type DeliveryIntervalId = (typeof DELIVERY_INTERVALS)[number]["id"];

export const PRIMARY_NAV_PUBLIC = [
  { label: "Каталог", href: "/catalog" as const },
  { label: "Свадьбы", href: "/wedding" as const },
  { label: "Мероприятия", href: "/events" as const },
  { label: "Кофейня", href: "/coffee" as const },
] as const;

export const CLIENT_NAV_LINKS = [
  { label: "Доставка", href: "/delivery" as const },
  { label: "Оплата", href: "/payment" as const },
  { label: "Уход за букетом", href: "/care" as const },
  { label: "Вопрос-ответ", href: "/faq" as const },
] as const;

export const MOBILE_MENU_LINKS = [
  { label: "Каталог", href: "/catalog" },
  { label: "Свадебная флористика", href: "/wedding" },
  { label: "Оформление мероприятий", href: "/events" },
  { label: "Кофейня", href: "/coffee" },
  { label: "Подписка на цветы", href: "/subscription" },
  { label: "Вазы и подарки", href: "/gifts" },
  { label: "Свадебная копилка", href: "/wedding-piggybank" },
  { label: "Блог", href: "/blog" },
  { label: "Доставка", href: "/delivery" },
  { label: "Оплата", href: "/payment" },
  { label: "Уход за букетом", href: "/care" },
  { label: "Вопрос-ответ", href: "/faq" },
  { label: "О нас", href: "/about" },
  { label: "Контакты", href: "/contacts" },
  { label: "Корзина", href: "/cart" },
] as const;

/** Карточка товара — `docs/PRD.md` §4: `/product/[slug]`. */
export function productPath(slug: string): string {
  return `/product/${slug}`;
}
