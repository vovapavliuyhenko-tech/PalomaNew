export default {
  name: "banner",
  title: "Баннер",
  type: "document",
  fields: [
    { name: "title", type: "string", title: "Заголовок" },
    { name: "subtitle", type: "string", title: "Подзаголовок" },
    { name: "buttonText", type: "string", title: "Текст кнопки" },
    { name: "buttonLink", type: "string", title: "Ссылка кнопки" },
    {
      name: "image",
      type: "image",
      title: "Изображение",
      options: { hotspot: true },
    },
    {
      name: "placement",
      type: "string",
      title: "Расположение",
      options: {
        list: [
          { title: "Главная — Hero", value: "home-hero" },
          { title: "Главная — Промо", value: "home-promo" },
          { title: "Каталог — Топ", value: "catalog-top" },
        ],
      },
    },
    {
      name: "isActive",
      type: "boolean",
      title: "Активен",
      initialValue: true,
    },
  ],
  preview: {
    select: { title: "title", media: "image", subtitle: "placement" },
  },
};
