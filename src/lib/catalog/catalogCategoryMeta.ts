import { getPrdCategoryBySlug } from "@/data/categories";
import { isCatalogCategorySegment, normalizeCatalogSegment } from "@/lib/catalog/prdCategoryFilter";

/** SEO для сегментов каталога, не совпадающих со slug’ами PRD (или с уточнённым копирайтом). */
const LEGACY_SEGMENT_META: Record<string, { title: string; desc: string }> = {
  bestsellers: {
    title: "Бестселлеры",
    desc: "Самые популярные букеты Paloma Flowers. Проверенные временем хиты.",
  },
  seasonal: {
    title: "Сезонные букеты",
    desc: "Свежие сезонные цветы — пионы, тюльпаны, розы. Обновляем каждую неделю.",
  },
  wedding: {
    title: "Свадебные букеты",
    desc: "Свадебные букеты невесты и бутоньерки на заказ.",
  },
  compositions: {
    title: "Цветочные композиции",
    desc: "Флористические композиции в вазах, шляпных коробках и боксах.",
  },
  mono: {
    title: "Моно и дуобукеты",
    desc: "Строгая красота монобукетов и изящество дуэтов из двух видов цветов.",
  },
  vases: {
    title: "Вазы и подарки",
    desc: "Вазы, открытки и подарки к букету.",
  },
  coffee: {
    title: "Кофейня",
    desc: "Добавьте кофе, десерты и выпечку к заказу цветов.",
  },
  monobuket: {
    title: "Монобукеты",
    desc: "Один вид цветка, чёткая форма и характер линии.",
  },
  "v-korobke": {
    title: "Цветы в коробке",
    desc: "Сборки в коробках — удобно дарить и забирать с собой.",
  },
  piony: {
    title: "Пионы",
    desc: "Сезон пионов в PALOMA — объём, аромат и мягкая палитра.",
  },
  rozy: {
    title: "Розы",
    desc: "Классические и садовые розы под ваш повод и настроение.",
  },
  sezonnie: {
    title: "Сезонные",
    desc: "То, что особенно хорошо в сезоне — подбираем флористы PALOMA.",
  },
  segodnya: {
    title: "Готовые сегодня",
    desc: "Позиции, которые уже в студии — можно забрать или доставить сегодня.",
  },
  vazy: {
    title: "Вазы",
    desc: "Керамика и стекло — к вашему букету и интерьеру.",
  },
  otkritki: {
    title: "Открытки",
    desc: "Конверты и открытки PALOMA к заказу.",
  },
  kofe: {
    title: "Кофе",
    desc: "Напитки café PALOMA — добавьте к цветочному заказу.",
  },
  vypechka: {
    title: "Выпечка",
    desc: "Десерты и выпечка из кухни PALOMA.",
  },
  subscription: {
    title: "Подписка",
    desc: "Регулярные поставки свежих цветов от PALOMA.",
  },
  events: {
    title: "Мероприятия",
    desc: "Оформление событий и пространств.",
  },
  certificates: {
    title: "Сертификаты",
    desc: "Подарочные сертификаты PALOMA.",
  },
};

export function getCatalogCategoryMeta(segment: string): { title: string; desc: string } | null {
  if (!isCatalogCategorySegment(segment)) return null;
  const prd = getPrdCategoryBySlug(segment);
  if (prd) return { title: prd.title, desc: prd.description ?? "" };
  const legacy = LEGACY_SEGMENT_META[segment];
  if (legacy) return legacy;
  const normalized = normalizeCatalogSegment(segment);
  if (normalized?.kind === "prd") {
    const fallback = getPrdCategoryBySlug(normalized.slug);
    if (fallback) return { title: fallback.title, desc: fallback.description ?? "" };
  }
  return null;
}
