/* ═══════════════════════════════════════════════════════
   COFFEE PRODUCTS — PALOMA
   Объединяет PALOMA_COFFEE (editorial) + PALOMA_COFFEE_MENU
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CATEGORY_LABELS = {
    coffee: "Кофе",
    cold: "Холодные",
    bakery: "Выпечка",
    dessert: "Десерты",
    tea: "Чай",
  };

  var LEGACY_CAT = {
    pastry: "bakery",
    desserts: "dessert",
    lemonades: "cold",
  };

  /** @type {Array<object>} */
  var FEATURED = [
    {
      id: "coffee-cappuccino",
      num: "001",
      title: "Капучино",
      titleEn: "Cappuccino",
      category: "coffee",
      categoryLabel: "Кофе",
      price: 220,
      priceFrom: 220,
      volumes: [
        { label: "250 мл", price: 220 },
        { label: "350 мл", price: 260 },
        { label: "450 мл", price: 300 },
      ],
      description: "Мягкий молочный эспрессо с нежной пенкой.",
      image: "",
      placeholderBg: "linear-gradient(160deg,#e4d0b8 0%,#c4a882 50%,#8a6248 100%)",
      slug: "cappuccino",
    },
    {
      id: "coffee-latte",
      num: "002",
      title: "Латте",
      titleEn: "Latte",
      category: "coffee",
      categoryLabel: "Кофе",
      price: 230,
      priceFrom: 230,
      volumes: [
        { label: "250 мл", price: 230 },
        { label: "350 мл", price: 270 },
        { label: "450 мл", price: 310 },
      ],
      description: "Классический латте — двойной эспрессо и много мягкого молока.",
      image: "",
      placeholderBg: "linear-gradient(160deg,#e8d8c0 0%,#d4b898 50%,#9a7258 100%)",
      slug: "latte",
    },
    {
      id: "coffee-raf",
      num: "003",
      title: "Раф PALOMA",
      titleEn: "Raf Paloma",
      category: "coffee",
      categoryLabel: "Кофе",
      price: 290,
      priceFrom: 290,
      volumes: [
        { label: "250 мл", price: 290 },
        { label: "350 мл", price: 330 },
        { label: "450 мл", price: 370 },
      ],
      description: "Авторский раф на сливках — мягкий, цветочный, без горечи.",
      image: "",
      placeholderBg: "linear-gradient(160deg,#f0e4c8 0%,#e4c8a0 50%,#a87858 100%)",
      slug: "raf-paloma",
    },
    {
      id: "coffee-americano",
      num: "004",
      title: "Американо",
      titleEn: "Americano",
      category: "coffee",
      categoryLabel: "Кофе",
      price: 180,
      priceFrom: 180,
      volumes: [
        { label: "200 мл", price: 180 },
        { label: "300 мл", price: 210 },
      ],
      description: "Чистый вкус эспрессо, разбавленный горячей водой.",
      image: "",
      placeholderBg: "linear-gradient(160deg,#5c4030 0%,#3a2018 50%,#1a0c04 100%)",
      slug: "americano",
    },
    {
      id: "coffee-flatwhite",
      num: "005",
      title: "Флэт уайт",
      titleEn: "Flat White",
      category: "coffee",
      categoryLabel: "Кофе",
      price: 250,
      priceFrom: 250,
      volumes: [{ label: "200 мл", price: 250 }],
      description: "Двойной эспрессо с небольшим количеством бархатистого молока.",
      image: "",
      placeholderBg: "linear-gradient(160deg,#9a7858 0%,#6a4830 50%,#2a1008 100%)",
      slug: "flat-white",
    },
    {
      id: "coffee-croissant",
      num: "006",
      title: "Круассан",
      titleEn: "Croissant",
      category: "bakery",
      categoryLabel: "Выпечка",
      price: 190,
      priceFrom: 190,
      volumes: [{ label: "1 шт", price: 190 }],
      description: "Хрустящий, слоёный, с нежной начинкой.",
      image: "",
      placeholderBg: "linear-gradient(160deg,#f0dca8 0%,#e0c478 50%,#c0a040 100%)",
      slug: "croissant",
    },
    {
      id: "coffee-dessert",
      num: "007",
      title: "Десерт дня",
      titleEn: "Dessert of the day",
      category: "dessert",
      categoryLabel: "Десерты",
      price: 320,
      priceFrom: 320,
      volumes: [{ label: "1 шт", price: 320 }],
      description: "Каждый день — новый десерт от нашего кондитера.",
      image: "",
      placeholderBg: "linear-gradient(160deg,#e4c8b8 0%,#c8a890 50%,#a07858 100%)",
      slug: "dessert",
    },
    {
      id: "coffee-lemonade",
      num: "008",
      title: "Цветочный лимонад",
      titleEn: "Floral Lemonade",
      category: "cold",
      categoryLabel: "Холодные",
      price: 240,
      priceFrom: 240,
      volumes: [
        { label: "300 мл", price: 240 },
        { label: "500 мл", price: 320 },
      ],
      description: "Авторский лимонад на основе сезонных цветочных сиропов.",
      image: "",
      placeholderBg: "linear-gradient(160deg,#e8f0d0 0%,#c8e0a0 50%,#88b858 100%)",
      slug: "lemonade",
    },
  ];

  var SLUGS = {};
  FEATURED.forEach(function (p) {
    SLUGS[p.slug] = true;
  });

  function fromLegacy(item, index) {
    var cat = LEGACY_CAT[item.category] || item.category;
    var slug = item.id;
    if (SLUGS[slug]) return null;
    SLUGS[slug] = true;

    return {
      id: "cafe-" + item.id,
      num: String(index + 1).padStart(3, "0"),
      title: item.name,
      category: cat,
      categoryLabel: CATEGORY_LABELS[cat] || item.category,
      price: item.price,
      volumes: [{ label: item.volume || "—", price: item.price }],
      description: item.desc || "",
      image: "",
      placeholderBg: item.bg || "linear-gradient(135deg,#5c3d28,#8a6248)",
      slug: slug,
    };
  }

  var merged = FEATURED.slice();
  var legacy = window.PALOMA_COFFEE_MENU || [];
  var isEditorialMenu = legacy.length && legacy[0].num;

  if (!isEditorialMenu) {
    legacy.forEach(function (item, i) {
      var converted = fromLegacy(item, merged.length + i);
      if (converted) merged.push(converted);
    });
  }

  merged.forEach(function (p, i) {
    if (!p.num) p.num = String(i + 1).padStart(3, "0");
    if (!p.categoryLabel) {
      p.categoryLabel = CATEGORY_LABELS[p.category] || p.category;
    }
  });

  window.PALOMA_COFFEE = merged;
})();
