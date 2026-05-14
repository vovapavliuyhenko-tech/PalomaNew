/**
 * Единая конфигурация сайта. Секреты и ключи — только в .env (не дублировать сюда).
 */
export const siteConfig = {
  name: "PALOMA",
  legalName: "Paloma Flowers",
  tagline: "flowers · coffee · you",
  city: "Новороссийск",
  address: "ул. Советов, 51, Новороссийск, 353900",
  phone: "+7 (861) 200-00-00",
  phoneTel: "+78612000000",
  email: "hello@paloma-flowers.ru",
  whatsapp: "https://wa.me/78612000000",
  telegram: "https://t.me/palomaflowers",
  instagram: "https://instagram.com/palomaflowers",
  instagramHandle: "@palomaflowers",
  maps:
    process.env.NEXT_PUBLIC_YANDEX_MAPS_QUERY_URL ??
    "https://yandex.ru/maps/?text=%D0%BD%D0%BE%D0%B2%D0%BE%D1%80%D0%BE%D1%81%D1%81%D0%B8%D0%B9%D1%81%D0%BA%20%D0%A1%D0%BE%D0%B2%D0%B5%D1%82%D0%BE%D0%B2%2051",
  workingHours: "Ежедневно с 8:00 до 22:00",
  minOrderFreeDelivery: 5000,
  currency: "₽",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://paloma-flowers.ru",
} as const;

export type SiteConfig = typeof siteConfig;
