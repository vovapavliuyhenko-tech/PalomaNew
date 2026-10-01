/* ════════════════════════════════════════════════════════
   builder-data.js — данные конструктора авторского букета

   Этот файл — «витрина» конструктора. Здесь меняют:
   • какие цветы сейчас в наличии (inStock: true / false);
   • цены размеров и наценки;
   • палитры, упаковку, зелень.

   Состав и палитры собраны по каталогу PALOMA (01.10.2026): цветы —
   по тому, как часто они стоят в букетах (гортензия — в 30 из 75,
   пионовидная роза — 16, эустома — 15, дельфиниум и диантус — по 13,
   львиный зев — 11, антуриум — 9, георгины, хризантема бигуди),
   палитры — по цветовым решениям реальных букетов, упаковка — как на
   фото: матовая плёнка «лепестками», джутовая корзина, коробка PALOMA.

   kind — как цветок рисуется на эскизе:
   rose, peony, spray, hydrangea, dahlia, pompon, chrysball, carnation,
   eustoma, delph, matthiola, anthurium, ranunculus, berries, cotton.
   premium — во сколько раз цветок дороже обычного (1 = как все).

   ЦЕНЫ размеров и доплаты за упаковку — ориентировочные, уточнить
   у владельца перед запуском.
   ════════════════════════════════════════════════════════ */
window.PALOMA_BUILDER_DATA = {
  /* Когда последний раз обновляли наличие — показывается клиенту */
  stockUpdated: "1 октября",
  season: "Осень",

  sizes: [
    { code: "S",  name: "Нежный",        stems: 7,  price: 5900,  hint: "комплимент без повода" },
    { code: "M",  name: "Выразительный", stems: 11, price: 8900,  hint: "самый популярный" },
    { code: "L",  name: "Пышный",        stems: 17, price: 13900, hint: "чтобы ахнули" },
    { code: "XL", name: "Роскошный",     stems: 25, price: 19900, hint: "большой жест" },
  ],

  styles: [
    { code: "dome", name: "Купол", hint: "плотный, круглый" },
    { code: "airy", name: "Воздушный", hint: "свободный, с разной высотой" },
  ],

  /* Палитры — по реальным букетам каталога */
  palettes: [
    { code: "peach-garden", name: "Персиковый сад",  colors: ["#F2B4B4", "#F4C6A8", "#F6DADD", "#E68C9A", "#C9D98C"] },
    { code: "coral",        name: "Коралловое утро", colors: ["#F28A6F", "#F6C3A6", "#CFDD9E", "#F8F3EC", "#EE9DB0"] },
    { code: "powder",       name: "Пудра",           colors: ["#F2CFCB", "#E6ADAB", "#FBEAE4", "#D38C93", "#FFFFFF"] },
    { code: "cloud",        name: "Белое облако",    colors: ["#FBF8F2", "#F1EDE3", "#E3EADB", "#FFFFFF", "#D9E3CE"] },
    { code: "haze",         name: "Голубая дымка",   colors: ["#9DB7DE", "#C9D6EE", "#7C95CF", "#F4F2EE", "#B4C6E6"] },
    { code: "tuscany",      name: "Тоскана",         colors: ["#EF7C64", "#6D86D6", "#E05C84", "#C9DB8F", "#F4E6D4"] },
    { code: "bigudi",       name: "Бигуди Перпл",    colors: ["#7B2340", "#9C3456", "#B9506F", "#5A1730", "#E9CBD0"] },
    { code: "autumn-fire",  name: "Осенний огонь",   colors: ["#E8733E", "#F39A5C", "#C2452D", "#9E2B2B", "#F6C08A"] },
  ],

  /* Цвета для «своей палитры» */
  swatches: [
    "#FFFFFF", "#F6F0E4", "#FBEAE4", "#F2CFCB", "#E6ADAB", "#EE9DB0", "#E05C84", "#E7385A",
    "#9C3456", "#7B2340", "#F6C3A6", "#F28A6F", "#E8733E", "#F39A5C", "#C2452D", "#F6C08A",
    "#E4DAEF", "#BBA5D3", "#9DB7DE", "#6D86D6", "#CFDD9E", "#C9D98C", "#8FA68A", "#2B2A28",
  ],

  flowers: [
    { id: "hydrangea", name: "Гортензия",         kind: "hydrangea", premium: 1.45, inStock: true, note: "объёмное облако" },
    { id: "pion-rose", name: "Пионовидная роза",  kind: "peony",     premium: 1.35, inStock: true, note: "звезда букетов" },
    { id: "eustoma",   name: "Эустома",           kind: "eustoma",   premium: 1.0,  inStock: true, note: "нежная, как шёлк" },
    { id: "delph",     name: "Дельфиниум",        kind: "delph",     premium: 1.2,  inStock: true, note: "высокие колосья" },
    { id: "dianthus",  name: "Диантус",           kind: "carnation", premium: 0.8,  inStock: true, note: "кружевные края" },
    { id: "snapdragon",name: "Львиный зев",       kind: "matthiola", premium: 1.0,  inStock: true, note: "свечки-колоски" },
    { id: "anthurium", name: "Антуриум",          kind: "anthurium", premium: 1.3,  inStock: true, note: "глянцевый акцент" },
    { id: "dahlia",    name: "Георгин Пичес",     kind: "dahlia",    premium: 1.2,  inStock: true, note: "только осенью" },
    { id: "pompon",    name: "Георгин помпон",    kind: "pompon",    premium: 1.2,  inStock: true, note: "шарики-помпоны" },
    { id: "bigudi",    name: "Хризантема бигуди", kind: "chrysball", premium: 1.0,  inStock: true, note: "стоит неделями" },
    { id: "spray",     name: "Кустовая роза",     kind: "spray",     premium: 1.1,  inStock: true, note: "много бутонов" },
    { id: "rose",      name: "Роза",              kind: "rose",      premium: 1.0,  inStock: true, note: "классика" },
    { id: "ranunculus",name: "Ранункулюс",        kind: "ranunculus",premium: 1.3,  inStock: false, note: "вернётся весной" },
  ],

  greens: [
    { id: "eucalyptus", name: "Эвкалипт",        kind: "eucalyptus", color: "#8FA89C" },
    { id: "raspleaf",   name: "Листья малины",   kind: "raspleaf",   color: "#6E8B4E", color2: "#B7C2A2" },
    { id: "panicum",    name: "Паникум",         kind: "panicum",    color: "#C8B57F" },
    { id: "tropic",     name: "Лист стрелиции",  kind: "tropic",     color: "#3F5E36" },
    { id: "pampas",     name: "Пампасная трава", kind: "pampas",     color: "#E6D5B5" },
    { id: "none",       name: "Без зелени",      kind: "none" },
  ],

  greenAmounts: [
    { code: "light", name: "Лёгкая",  count: 6 },
    { code: "mid",   name: "Умеренно", count: 10 },
    { code: "lush",  name: "Пышно",    count: 15 },
  ],

  /* Упаковка — как в студии. extra — доплата, уточнить у владельца */
  wraps: [
    { id: "film",   name: "Матовая плёнка",         kind: "film",   extra: 0,    colors: [["Белая", "#FAF8F5"], ["Молочная", "#F1EBE2"], ["Серая", "#D8D5D1"], ["Пудровая", "#EED6D3"]] },
    { id: "basket", name: "Джутовая корзина",       kind: "basket", extra: 2200, colors: [["Натуральная", "#B89466"]] },
    { id: "box",    name: "Коробка PALOMA",         kind: "box",    extra: 900,  colors: [["Белая", "#F8F6F2"]] },
    { id: "ribbon", name: "Без упаковки, на ленте", kind: "ribbon", extra: 0,    colors: [] },
  ],

  ribbons: [
    ["В тон букету", "auto"], ["Белая", "#FFFFFF"], ["Бежевая PALOMA", "#E6D8C3"],
    ["Голубая", "#7FB8E0"], ["Пудровая", "#EFC3C7"], ["Розовая", "#E7385A"],
  ],

  /* Настоящие цветы для эскиза: головки, вырезанные из фото каталога
     (images/paloma/builder). hsl — средний цвет снимка, по нему фото
     перекрашивается в цвет палитры. free — можно крутить на любой угол
     (снято сверху); иначе только слегка наклоняем. */
  photos: {
    peony: [
      { src: "images/paloma/builder/rose-coral.webp", w: 300, h: 182, hsl: [6, 0.839, 0.659] },
    ],
    rose: [
      { src: "images/paloma/builder/spray-peach.webp", w: 287, h: 300, hsl: [31, 0.679, 0.792] },
      { src: "images/paloma/builder/rose-white.webp", w: 257, h: 300, hsl: [40, 0.467, 0.824] },
    ],
    carnation: [
      { src: "images/paloma/builder/carnation-pink.webp", w: 300, h: 259, hsl: [355, 0.828, 0.704], free: true },
    ],
    hydrangea: [
      { src: "images/paloma/builder/hydr-blush.webp", w: 300, h: 259, hsl: [19, 0.156, 0.465], free: true },
    ],
    pompon: [
      { src: "images/paloma/builder/pompon-orange.webp", w: 300, h: 286, hsl: [9, 0.576, 0.5], free: true },
      { src: "images/paloma/builder/pompon-pink.webp", w: 300, h: 275, hsl: [351, 0.512, 0.41], free: true },
      { src: "images/paloma/builder/pompon-pink2.webp", w: 295, h: 300, hsl: [358, 0.481, 0.461], free: true },
    ],
    chrysball: [
      { src: "images/paloma/builder/chrys-bigudi.webp", w: 300, h: 282, hsl: [354, 0.51, 0.2], free: true },
    ],
    dahlia: [
      { src: "images/paloma/builder/dahlia-peaches.webp", w: 300, h: 288, hsl: [358, 0.228, 0.335], free: true },
    ],
  },

  cardPrice: 350,
};
