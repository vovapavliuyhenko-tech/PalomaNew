export default {
  name: "coffeeItem",
  title: "Кофейня — Позиция меню",
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
          { title: "Кофе", value: "coffee" },
          { title: "Чай", value: "tea" },
          { title: "Матча", value: "matcha" },
          { title: "Какао", value: "cocoa" },
          { title: "Авторские напитки", value: "signature" },
          { title: "Круассаны", value: "croissants" },
          { title: "Десерты", value: "desserts" },
          { title: "Конфеты", value: "sweets" },
        ],
      },
    },
    { name: "price", type: "number", title: "Цена (₽)" },
    { name: "volume", type: "string", title: "Объём / Вес" },
    { name: "composition", type: "text", title: "Состав" },
    { name: "description", type: "text", title: "Описание" },
    {
      name: "image",
      type: "image",
      title: "Фото",
      options: { hotspot: true },
    },
    {
      name: "inStock",
      type: "boolean",
      title: "В наличии",
      initialValue: true,
    },
  ],
  preview: {
    select: { title: "title", media: "image", subtitle: "price" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(value: any) {
      return { title: value.title as string, media: value.media, subtitle: `${value.subtitle} ₽` };
    },
  },
};
