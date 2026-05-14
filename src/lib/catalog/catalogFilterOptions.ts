import { PRD_CATEGORIES } from "@/data/categories";

/** Опции `?category=` при работе без Supabase или при fallback на mock. */
export const LEGACY_CATALOG_CATEGORY_OPTIONS = [
  { value: "", label: "Все" },
  { value: "bestsellers", label: "Бестселлеры" },
  { value: "seasonal", label: "Сезонные" },
  { value: "compositions", label: "Композиции" },
  { value: "mono", label: "Моно и дуобукеты" },
  { value: "wedding", label: "Свадебные" },
  { value: "vases", label: "Вазы и подарки" },
  { value: "coffee", label: "Кофейня" },
] as const;

/** Целевой список категорий по PRD — для фильтров на витрине (пути `/catalog/[slug]`). */
export const PRD_CATALOG_CATEGORY_OPTIONS = [
  { value: "", label: "Все" },
  ...[...PRD_CATEGORIES].sort((a, b) => a.order - b.order).map((c) => ({
    value: c.slug,
    label: c.title,
  })),
];