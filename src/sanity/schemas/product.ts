export default {
  name: "product",
  title: "Товар",
  type: "document",
  fields: [
    { name: "title", type: "string", title: "Название" },
    { name: "slug", type: "slug", title: "Slug", options: { source: "title" } },
    {
      name: "category",
      type: "string",
      title: "Категория",
      options: {
        list: [
          { title: "Бестселлеры", value: "bestsellers" },
          { title: "Сезонные", value: "seasonal" },
          { title: "Композиции", value: "compositions" },
          { title: "Моно и дуобукеты", value: "mono" },
          { title: "Свадебные", value: "wedding" },
          { title: "Вазы и подарки", value: "vases" },
          { title: "Подписка", value: "subscription" },
          { title: "Оформление", value: "events" },
          { title: "Сертификаты", value: "certificates" },
        ],
      },
    },
    { name: "price", type: "number", title: "Базовая цена (₽)" },
    {
      name: "sizes",
      type: "array",
      title: "Размеры",
      of: [
        {
          type: "object",
          fields: [
            { name: "size", type: "string", title: "Размер" },
            { name: "price", type: "number", title: "Цена" },
          ],
        },
      ],
    },
    { name: "composition", type: "text", title: "Состав" },
    { name: "origin", type: "string", title: "Происхождение" },
    { name: "description", type: "text", title: "Описание" },
    {
      name: "images",
      type: "array",
      title: "Фотографии",
      of: [{ type: "image", options: { hotspot: true } }],
    },
    {
      name: "inStock",
      type: "boolean",
      title: "В наличии",
      initialValue: true,
    },
    { name: "isBestseller", type: "boolean", title: "Хит продаж" },
    { name: "isSeasonal", type: "boolean", title: "Сезонный" },
  ],
  preview: {
    select: {
      title: "title",
      media: "images.0",
      subtitle: "price",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(value: any) {
      return { title: value.title as string, media: value.media, subtitle: `${value.subtitle} ₽` };
    },
  },
};
