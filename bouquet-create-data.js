/* ════════════════════════════════════════════════════════
   bouquet-create-data.js — витрина конструктора «Соберите букет»
   (bouquet-create.html). Здесь меняют цены, цвета и наличие.

   price — цена за 1 цветок (₽). ЦЕНЫ ОРИЕНТИРОВОЧНЫЕ — сверить
   с владельцем перед запуском. Убрать цветок из наличия: inStock: false.
   kind — как он рисуется (см. flower-art.js).
   ════════════════════════════════════════════════════════ */
window.PALOMA_CREATE_DATA = {
  minStems: 3,
  maxStems: 51,

  flowers: [
    { id: "rose", name: "Роза", kind: "rose", price: 250, size: 34, colors: [
      ["Красная", "#C8243C"], ["Розовая", "#F08AA0"], ["Белая", "#F5EEE6"], ["Персиковая", "#F6B08A"], ["Кремовая", "#F3E2B8"] ] },
    { id: "gardenrose", name: "Пионовидная роза", kind: "gardenrose", price: 450, size: 40, colors: [
      ["Пудровая", "#F4C1C6"], ["Малиновая", "#D9466B"], ["Кремовая", "#F4E6CC"], ["Персиковая", "#F6BE9A"] ] },
    { id: "peony", name: "Пион", kind: "peony", price: 700, size: 46, colors: [
      ["Розовый", "#F2A6B8"], ["Белый", "#F8F0EE"], ["Коралловый", "#F28B7A"] ] },
    { id: "hydrangea", name: "Гортензия", kind: "hydrangea", price: 650, size: 50, colors: [
      ["Голубая", "#9DB7E8"], ["Белая", "#F1EEE4"], ["Розовая", "#F2B3C8"], ["Сиреневая", "#C8A8E0"], ["Зелёная", "#CFE3B0"] ] },
    { id: "tulip", name: "Тюльпан", kind: "tulip", price: 180, size: 30, colors: [
      ["Розовый", "#F08AA0"], ["Красный", "#D23A3A"], ["Жёлтый", "#F5C842"], ["Белый", "#F7F2EA"] ] },
    { id: "eustoma", name: "Эустома", kind: "eustoma", price: 350, size: 32, colors: [
      ["Белая", "#F7F3EE"], ["Сиреневая", "#B898D8"], ["Розовая", "#F2A9C0"] ] },
    { id: "chrys", name: "Хризантема", kind: "chrys", price: 300, size: 33, colors: [
      ["Белая", "#F5F0E6"], ["Жёлтая", "#F3D35A"], ["Розовая", "#F2A9C0"], ["Бордовая", "#8E2A45"] ] },
    { id: "dahlia", name: "Георгин", kind: "dahlia", price: 550, size: 42, colors: [
      ["Оранжевый", "#F08A3C"], ["Персиковый", "#F6B08A"], ["Бордовый", "#8E2A45"], ["Розовый", "#F08AA0"] ] },
    { id: "ranunculus", name: "Ранункулюс", kind: "ranunculus", price: 350, size: 30, colors: [
      ["Персиковый", "#F6B08A"], ["Розовый", "#F2A6B8"], ["Белый", "#F6F1E8"], ["Жёлтый", "#F5D35E"] ] },
    { id: "carnation", name: "Диантус", kind: "carnation", price: 200, size: 28, colors: [
      ["Розовый", "#E9718F"], ["Красный", "#C8243C"], ["Белый", "#F5F0EA"], ["Бордовый", "#8E2A45"] ] },
    { id: "daisy", name: "Ромашка", kind: "daisy", price: 150, size: 30, colors: [["Белая", "#FFFFFF"]] },
    { id: "sunflower", name: "Подсолнух", kind: "sunflower", price: 350, size: 42, colors: [["Жёлтый", "#F4B83A"]] },
    { id: "calla", name: "Калла", kind: "calla", price: 500, size: 32, colors: [
      ["Белая", "#F7F1EA"], ["Бордовая", "#7A1F3A"], ["Жёлтая", "#F5C842"] ] },
    { id: "orchid", name: "Орхидея", kind: "orchid", price: 900, size: 36, colors: [
      ["Белая", "#F7F4F2"], ["Сиреневая", "#C8A8E0"] ] },
    { id: "anemone", name: "Анемон", kind: "anemone", price: 400, size: 32, colors: [
      ["Красный", "#C8243C"], ["Белый", "#F7F4F0"], ["Фиолетовый", "#7A5BB0"] ] },
    { id: "lily", name: "Лилия", kind: "lily", price: 450, size: 42, colors: [
      ["Белая", "#F7F3EE"], ["Розовая", "#F2B3C8"] ] },
    { id: "anthurium", name: "Антуриум", kind: "anthurium", price: 600, size: 32, colors: [
      ["Красный", "#C8243C"], ["Розовый", "#F08AA0"], ["Белый", "#F5F0EA"] ] },
    { id: "alstro", name: "Альстромерия", kind: "alstro", price: 250, size: 32, colors: [
      ["Розовая", "#F08AA0"], ["Персиковая", "#F6B08A"], ["Белая", "#F7F2EA"] ] },
    { id: "matthiola", name: "Маттиола", kind: "spike", spike: "delphinium", price: 350, size: 30, colors: [
      ["Сиреневая", "#B898D8"], ["Белая", "#F5F0EA"], ["Розовая", "#F2A9C0"] ] },
    { id: "delphinium", name: "Дельфиниум", kind: "spike", spike: "delphinium", price: 450, size: 30, colors: [
      ["Синий", "#4F6FD0"], ["Голубой", "#8FB0EA"], ["Белый", "#F5F3EE"] ] },
  ],

  /* Готовые идеи — список [id цветка, номер цвета, количество] */
  presets: [
    { name: "Нежность", items: [["gardenrose", 0, 3], ["hydrangea", 1, 1], ["eustoma", 0, 2], ["rose", 1, 2]] },
    { name: "Классика", items: [["rose", 0, 9]] },
    { name: "Голубая дымка", items: [["hydrangea", 0, 2], ["delphinium", 1, 2], ["rose", 2, 3], ["eustoma", 1, 2]] },
    { name: "Осень", items: [["dahlia", 0, 2], ["chrys", 3, 2], ["ranunculus", 0, 3], ["rose", 3, 2]] },
    { name: "Солнечный", items: [["sunflower", 0, 3], ["daisy", 0, 4], ["tulip", 2, 3]] },
    { name: "Пионы", items: [["peony", 0, 5], ["peony", 1, 2]] },
  ],

  /* Добавки на шаге 2 — тоже живые цветы, считаются в цену */
  fillers: [
    { id: "gyps", name: "Гипсофила", kind: "gyps", color: "#FFFFFF", price: 250 },
    { id: "lavender", name: "Лаванда", kind: "spike", spike: "lavender", color: "#9C86D0", price: 200 },
    { id: "snapdragon", name: "Львиный зев", kind: "spike", spike: "snapdragon", color: "#F2A9C0", price: 300 },
    { id: "veronica", name: "Вероника", kind: "spike", spike: "lavender", color: "#6F82D6", price: 250 },
    { id: "hydr-white", name: "Гортензия белая", kind: "hydrangea", color: "#F1EEE4", price: 650 },
    { id: "hydr-blue", name: "Гортензия голубая", kind: "hydrangea", color: "#9DB7E8", price: 650 },
  ],

  /* Зелень — одна на букет, цена за весь букет */
  greens: [
    { id: "none", name: "Без зелени", price: 0 },
    { id: "eucalyptus", name: "Эвкалипт", price: 350 },
    { id: "fern", name: "Папоротник", price: 250 },
    { id: "ruscus", name: "Рускус", price: 250 },
    { id: "pistachio", name: "Фисташка", price: 250 },
    { id: "olive", name: "Олива", price: 300 },
    { id: "ivy", name: "Плющ", price: 250 },
    { id: "bluegum", name: "Эвкалипт сизый", price: 350 },
  ],

  /* Фон картинки (только для превью и скачивания) */
  backdrops: [
    { id: "white", name: "Белый", css: "#FFFFFF" },
    { id: "pastel", name: "Пастель", css: "linear-gradient(160deg,#FDF1F4,#F4EEFB)" },
    { id: "blush", name: "Пудра", css: "linear-gradient(160deg,#FFE9EC,#FBD5DC)" },
    { id: "golden", name: "Золотой час", css: "linear-gradient(160deg,#FFF6E4,#FBE3C2)" },
    { id: "sky", name: "Небо", css: "linear-gradient(160deg,#EEF5FF,#DCE8FA)" },
    { id: "sage", name: "Шалфей", css: "linear-gradient(160deg,#F1F6EE,#DDE9D6)" },
  ],

  wraps: [
    { id: "film-blush", name: "Плёнка пудровая", color: "#F6D9DE", price: 300 },
    { id: "film-white", name: "Плёнка белая", color: "#F4F2EE", price: 300 },
    { id: "film-black", name: "Плёнка чёрная", color: "#2A2A2E", price: 300 },
    { id: "film-sage", name: "Плёнка шалфей", color: "#CFDCC8", price: 300 },
    { id: "kraft", name: "Крафт", color: "#C9A27A", price: 250 },
    { id: "none", name: "Без упаковки", color: "", price: 0 },
  ],
  ribbons: [
    { id: "pink", name: "Розовая PALOMA", color: "#E7385A" },
    { id: "white", name: "Белая", color: "#F7F4EE" },
    { id: "black", name: "Чёрная", color: "#1B1A18" },
    { id: "none", name: "Без ленты", color: "" },
  ],

  cardPrice: 0, /* открытка с текстом — бесплатно */

  suggestions: {
    "День рождения": [
      "С днём рождения! Пусть этот год будет таким же ярким, как эти цветы.",
      "Пусть каждый день нового года жизни приносит повод улыбнуться.",
      "С праздником! Желаю тепла, любви и самых смелых мечт.",
    ],
    "Люблю": [
      "Каждый цветок здесь — маленькое «я тебя люблю».",
      "Просто хочу, чтобы ты знала: ты делаешь мой мир красивее.",
      "Ты — моя самая красивая история.",
    ],
    "Спасибо": [
      "Спасибо, что ты есть. Эти цветы — моя благодарность.",
      "Огромное спасибо за заботу и тепло!",
      "Благодарю — от всего сердца.",
    ],
    "Прости": [
      "Прости меня. Я очень дорожу тобой.",
      "Пусть эти цветы скажут то, что сложно сказать словами.",
    ],
    "Просто так": [
      "Без повода — просто чтобы ты улыбнулась.",
      "Немного весны в любой день.",
      "Думаю о тебе.",
    ],
  },
};
