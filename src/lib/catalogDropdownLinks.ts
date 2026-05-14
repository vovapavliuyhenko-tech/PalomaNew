/**
 * Двухколоночное меню «Каталог» в шапке (ТЗ §6).
 * URL: `/catalog/[slug]` по PRD + общие разделы.
 */
export const CATALOG_DROPDOWN_COLUMN_A = [
  { label: "Онлайн-витрина −10%", href: "/catalog/online-vitrina" },
  { label: "Распродажа", href: "/catalog/bukety" },
  { label: "Пионы", href: "/catalog?q=пион" },
  { label: "Самый сезон", href: "/catalog/seasonal" },
  { label: "Бестселлеры", href: "/catalog/bukety" },
  { label: "Цветочные композиции", href: "/catalog/kompozicii" },
] as const;

export const CATALOG_DROPDOWN_COLUMN_B = [
  { label: "Моно и дуобукеты", href: "/catalog/mono" },
  { label: "Свадебные", href: "/catalog/wedding-bouquets" },
  { label: "Вазы и подарки", href: "/catalog/vazy-i-podarki" },
  { label: "Все букеты и композиции", href: "/catalog" },
  { label: "Цветочная подписка", href: "/subscription" },
  { label: "Оформление мероприятий", href: "/events" },
] as const;
