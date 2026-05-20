export default {
  name: "settings",
  title: "Настройки сайта",
  type: "document",
  __experimental_actions: ["update", "publish"],
  fields: [
    { name: "siteName", type: "string", title: "Название сайта" },
    { name: "siteDescription", type: "text", title: "Описание сайта" },
    { name: "phone", type: "string", title: "Телефон" },
    { name: "email", type: "string", title: "Email" },
    { name: "address", type: "string", title: "Адрес" },
    { name: "workingHours", type: "string", title: "Часы работы" },
    {
      name: "socialLinks",
      type: "object",
      title: "Социальные сети",
      fields: [
        { name: "instagram", type: "string", title: "Instagram" },
        { name: "telegram", type: "string", title: "Telegram" },
        { name: "vk", type: "string", title: "ВКонтакте" },
      ],
    },
    {
      name: "logo",
      type: "image",
      title: "Логотип",
      options: { hotspot: true },
    },
    {
      name: "freeDeliveryFrom",
      type: "number",
      title: "Бесплатная доставка от (₽)",
      initialValue: 5000,
    },
  ],
};
