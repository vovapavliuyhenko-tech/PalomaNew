import type { PrdProduct } from "@/types/prd";

const ph = "/images/placeholders/product-3x4.svg";

/**
 * Заготовка каталога под тип `PrdProduct` (без замены `mockProducts` / Supabase).
 * На этапе 6 расширяется и связывается с реальными данными.
 */
export const prdCatalogSeed: PrdProduct[] = [
  {
    id: "prd-seed-01",
    slug: "buket-paloma-nezhnost",
    title: "Букет Paloma «Нежность»",
    price: 4500,
    oldPrice: 5200,
    category: "bukety",
    images: [ph],
    description:
      "Пастельный букет из роз и эвкалипта — спокойное подарочное настроение у моря.",
    composition: "Розы, эвкалипт, декоративная зелень.",
    size: "M",
    care: "Меняйте воду ежедневно, срезайте стебли под углом.",
    isAvailable: true,
    isOnlineShowcase: true,
    isBestseller: true,
    isSeasonal: false,
    addOns: ["addon-card", "addon-vase"],
  },
  {
    id: "prd-seed-02",
    slug: "mono-piony-skandinaviya",
    title: "Монобукет «Скандинавия»",
    price: 6800,
    category: "mono",
    images: [ph],
    description: "Моноиз белых пионов — чистые линии и объёмная форма.",
    composition: "Белые пионы премиум-среза.",
    size: "L",
    isAvailable: true,
    isOnlineShowcase: true,
    isSeasonal: true,
    addOns: ["addon-bag"],
  },
  {
    id: "prd-seed-03",
    slug: "kompoziciya-vechem-na-beregu",
    title: "Композиция «Вечер на берегу»",
    price: 9200,
    category: "kompozicii",
    images: [ph],
    description: "Композиция в керамической вазе в тёплых бордово-оранжевых тонах.",
    composition: "Ранункулюсы, розы спрей, диантусы, зелень.",
    size: "30×40 см",
    isAvailable: true,
    isBestseller: true,
    addOns: ["addon-vase", "addon-card"],
  },
  {
    id: "prd-seed-04",
    slug: "online-vitrina-svezhiy-start",
    title: "Готовый букет «Свежий старт»",
    price: 3200,
    category: "online-vitrina",
    images: [ph],
    description: "Компактный букет для быстрого заказа — собираем в день доставки.",
    composition: "Сезонные цветы по палитре дня.",
    isAvailable: true,
    isOnlineShowcase: true,
    addOns: ["addon-latte"],
  },
  {
    id: "prd-seed-05",
    slug: "vaza-minimal-glass",
    title: "Ваза минимал",
    price: 1900,
    category: "vazy-i-podarki",
    images: [ph],
    description: "Прозрачная ваза с узким горлышком — под средние и высокие букеты.",
    isAvailable: true,
    addOns: [],
  },
  {
    id: "prd-seed-06",
    slug: "latte-s-risunkom-paloma",
    title: "Латте Paloma",
    price: 290,
    category: "coffee-desserts",
    images: [ph],
    description: "Классическое латте с молоком — дополните букет тёплым напитком.",
    isAvailable: true,
    addOns: [],
  },
  {
    id: "prd-seed-07",
    slug: "svadebnyy-buket-shyolk",
    title: "Свадебный букет «Шёлк»",
    price: 12500,
    category: "wedding-bouquets",
    images: [ph],
    description: "Каскадный свадебный букет из орхидей и розовых оттенков.",
    composition: "Фаленопсис, розы, фисташка.",
    isAvailable: true,
    isSeasonal: false,
    addOns: ["addon-card"],
  },
  {
    id: "prd-seed-08",
    slug: "korporativnyy-podium",
    title: "Оформление «Подиум»",
    price: 18500,
    category: "event-decor",
    images: [ph],
    description: "Сценическое цветочное оформление под ключ для камерного мероприятия.",
    isAvailable: true,
    addOns: [],
  },
  {
    id: "prd-seed-09",
    slug: "sertifikat-5000",
    title: "Подарочный сертификат 5 000 ₽",
    price: 5000,
    category: "gift-cards",
    images: [ph],
    description: "Электронный и бумажный сертификат на покупки в Paloma.",
    isAvailable: true,
    addOns: [],
  },
];

export function getPrdSeedProducts(): PrdProduct[] {
  return prdCatalogSeed;
}

export function getPrdSeedBySlug(slug: string): PrdProduct | undefined {
  return prdCatalogSeed.find((p) => p.slug === slug);
}
