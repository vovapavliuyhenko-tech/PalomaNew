export default {
  name: "blogPost",
  title: "Блог — Статья",
  type: "document",
  fields: [
    { name: "title", type: "string", title: "Заголовок" },
    { name: "slug", type: "slug", title: "Slug", options: { source: "title" } },
    {
      name: "category",
      type: "string",
      title: "Категория",
      options: {
        list: [
          { title: "Уход за цветами", value: "care" },
          { title: "Флористика", value: "floristry" },
          { title: "Свадьба", value: "wedding" },
          { title: "Новости", value: "news" },
          { title: "Рецепты", value: "recipes" },
        ],
      },
    },
    { name: "excerpt", type: "text", title: "Краткое описание" },
    {
      name: "coverImage",
      type: "image",
      title: "Обложка",
      options: { hotspot: true },
    },
    {
      name: "body",
      type: "array",
      title: "Содержание",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
    },
    { name: "publishedAt", type: "datetime", title: "Дата публикации" },
    {
      name: "author",
      type: "string",
      title: "Автор",
    },
    {
      name: "seo",
      type: "object",
      title: "SEO",
      fields: [
        { name: "title", type: "string", title: "SEO заголовок" },
        { name: "description", type: "text", title: "SEO описание" },
      ],
    },
  ],
  preview: {
    select: { title: "title", media: "coverImage", subtitle: "publishedAt" },
  },
};
