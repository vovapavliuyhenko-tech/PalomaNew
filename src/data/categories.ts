import type { PrdCategory } from "@/types/prd";

/**
 * 15 категорий витрины — эталон PRD (`docs/PRD.md`).
 * Slug’и синхронизировать с URL `/catalog/[category]` после миграции маршрутов.
 */
export const PRD_CATEGORIES: PrdCategory[] = [
  {
    id: "1",
    slug: "bukety",
    title: "Букеты",
    description: "Свежие букеты на каждый повод.",
    order: 1,
  },
  {
    id: "2",
    slug: "kompozicii",
    title: "Композиции",
    description: "Композиции в вазах, коробках и корзинах.",
    order: 2,
  },
  {
    id: "3",
    slug: "mono",
    title: "Монобукеты",
    description: "Строгая красота одного вида цветов.",
    order: 3,
  },
  {
    id: "4",
    slug: "online-vitrina",
    title: "Онлайн-витрина",
    description: "Готовые букеты, как на полке — быстрый выбор онлайн.",
    order: 4,
  },
  {
    id: "5",
    slug: "vazy-i-podarki",
    title: "Вазы и подарки",
    description: "Вазы, открытки и аккуратные дополнения к цветам.",
    order: 5,
  },
  {
    id: "6",
    slug: "coffee-desserts",
    title: "Кофе и десерты",
    description: "Кофе, какао и десерты к заказу.",
    order: 6,
  },
  {
    id: "7",
    slug: "wedding-bouquets",
    title: "Свадебные букеты",
    description: "Букет невесты и акценты к образу.",
    order: 7,
  },
  {
    id: "8",
    slug: "event-decor",
    title: "Оформление мероприятий",
    description: "Декор пространств для событий.",
    order: 8,
  },
  {
    id: "9",
    slug: "gift-baskets",
    title: "Подарочные корзины",
    description: "Корзины с цветами и сопутствующими подарками.",
    order: 9,
  },
  {
    id: "10",
    slug: "indoor-plants",
    title: "Комнатные растения",
    description: "Живые растения в горшках.",
    order: 10,
  },
  {
    id: "11",
    slug: "dried-flowers",
    title: "Сухоцветы",
    description: "Стабилизированные и сухие композиции.",
    order: 11,
  },
  {
    id: "12",
    slug: "premium",
    title: "Авторские / премиум",
    description: "Флагманские авторские работы флористов.",
    order: 12,
  },
  {
    id: "13",
    slug: "corporate",
    title: "Корпоративным клиентам",
    description: "Закрытие цветочных потребностей бизнеса.",
    order: 13,
  },
  {
    id: "14",
    slug: "seasonal",
    title: "Сезонные коллекции",
    description: "Лимитированные подборки по сезону.",
    order: 14,
  },
  {
    id: "15",
    slug: "gift-cards",
    title: "Подарочные сертификаты",
    description: "Сертификаты на сумму — в бутике и онлайн.",
    order: 15,
  },
];

export function getPrdCategoryBySlug(slug: string): PrdCategory | undefined {
  return PRD_CATEGORIES.find((c) => c.slug === slug);
}
