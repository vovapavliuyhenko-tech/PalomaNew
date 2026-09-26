/* ════════════════════════════════════════════════════════
   builder-data.js — данные конструктора авторского букета

   Этот файл — «витрина» конструктора. Здесь меняют:
   • какие цветы сейчас в наличии (inStock: true / false);
   • цены размеров и наценки;
   • палитры, упаковку, зелень.

   kind — как цветок рисуется на эскизе. Допустимые значения:
   rose, spray, peony, ranunculus, carnation, chrys, dahlia,
   eustoma, hydrangea, matthiola, berries, cotton.
   premium — во сколько раз цветок дороже обычного (1 = как все).
   ════════════════════════════════════════════════════════ */
window.PALOMA_BUILDER_DATA = {
  /* Когда последний раз обновляли наличие — показывается клиенту */
  stockUpdated: "27 сентября",
  season: "Осень",

  sizes: [
    { code: "S",  name: "Нежный",     stems: 7,  price: 5900,  hint: "комплимент без повода" },
    { code: "M",  name: "Выразительный", stems: 11, price: 8900,  hint: "самый популярный" },
    { code: "L",  name: "Пышный",     stems: 17, price: 13900, hint: "чтобы ахнули" },
    { code: "XL", name: "Роскошный",  stems: 25, price: 19900, hint: "большой жест" },
  ],

  styles: [
    { code: "dome", name: "Купол", hint: "плотный, круглый" },
    { code: "airy", name: "Воздушный", hint: "свободный, с разной высотой" },
  ],

  palettes: [
    { code: "powder",  name: "Пудра",         colors: ["#F2CFCB", "#E6ADAB", "#FBEAE4", "#D38C93", "#FFFFFF"] },
    { code: "wine",    name: "Бордо и вино",  colors: ["#7A1C30", "#A8354A", "#C85C6A", "#4A1020", "#EBCFC6"] },
    { code: "autumn",  name: "Осенний сад",   colors: ["#D9822B", "#B85A2E", "#EDB54F", "#8E3D24", "#F4DDAE"] },
    { code: "cloud",   name: "Белое облако",  colors: ["#FFFFFF", "#F6F0E4", "#EEF2E6", "#FBF6EC", "#E3E9DA"] },
    { code: "lavender",name: "Лаванда",       colors: ["#BBA5D3", "#907BB8", "#E4DAEF", "#6F5C99", "#F6F0FA"] },
    { code: "peach",   name: "Персик",        colors: ["#F8BC9C", "#F29F80", "#FFDCC6", "#E7836D", "#FFF2E8"] },
    { code: "haze",    name: "Голубая дымка", colors: ["#A9C6DF", "#D5E3F0", "#7FA3C7", "#FFFFFF", "#C4D3E4"] },
    { code: "bright",  name: "Яркий микс",    colors: ["#E7385A", "#F6A623", "#9B4DB5", "#F25C9A", "#FFD23F"] },
  ],

  /* Цвета для «своей палитры» */
  swatches: [
    "#FFFFFF", "#F6F0E4", "#FBEAE4", "#F2CFCB", "#E6ADAB", "#F25C9A", "#E7385A", "#C82847",
    "#A8354A", "#7A1C30", "#F8BC9C", "#F29F80", "#EDB54F", "#D9822B", "#B85A2E", "#FFD23F",
    "#E4DAEF", "#BBA5D3", "#907BB8", "#A9C6DF", "#7FA3C7", "#C9D8B6", "#8FA68A", "#2B2A28",
  ],

  flowers: [
    { id: "pion-rose", name: "Пионовидная роза", kind: "peony",     premium: 1.35, inStock: true, note: "звезда сезона" },
    { id: "rose",      name: "Роза",             kind: "rose",      premium: 1.0,  inStock: true, note: "классика" },
    { id: "spray",     name: "Кустовая роза",    kind: "spray",     premium: 1.0,  inStock: true, note: "много мелких бутонов" },
    { id: "dahlia",    name: "Георгина",         kind: "dahlia",    premium: 1.2,  inStock: true, note: "только осенью" },
    { id: "chrys",     name: "Хризантема",       kind: "chrys",     premium: 0.9,  inStock: true, note: "стоит неделями" },
    { id: "eustoma",   name: "Эустома",          kind: "eustoma",   premium: 1.0,  inStock: true, note: "нежная, как шёлк" },
    { id: "hydrangea", name: "Гортензия",        kind: "hydrangea", premium: 1.45, inStock: true, note: "объёмное облако" },
    { id: "dianthus",  name: "Диантус",          kind: "carnation", premium: 0.8,  inStock: true, note: "кружевные края" },
    { id: "matthiola", name: "Маттиола",         kind: "matthiola", premium: 1.1,  inStock: true, note: "с ароматом" },
    { id: "hypericum", name: "Гиперикум",        kind: "berries",   premium: 0.8,  inStock: true, note: "ягодный акцент" },
    { id: "cotton",    name: "Хлопок",           kind: "cotton",    premium: 1.0,  inStock: true, note: "уютная осень" },
    { id: "ranunculus",name: "Ранункулюс",       kind: "ranunculus",premium: 1.3,  inStock: false, note: "вернётся весной" },
  ],

  greens: [
    { id: "eucalyptus", name: "Эвкалипт",  kind: "eucalyptus", color: "#8FA89C" },
    { id: "pistacia",   name: "Фисташка",  kind: "pistacia",   color: "#56703F" },
    { id: "ruscus",     name: "Рускус",    kind: "ruscus",     color: "#5F8248" },
    { id: "pampas",     name: "Пампасная трава", kind: "pampas", color: "#E6D5B5" },
    { id: "none",       name: "Без зелени", kind: "none" },
  ],

  greenAmounts: [
    { code: "light", name: "Лёгкая",  count: 6 },
    { code: "mid",   name: "Умеренно", count: 10 },
    { code: "lush",  name: "Пышно",    count: 15 },
  ],

  wraps: [
    { id: "kraft",   name: "Крафт",            kind: "kraft",  extra: 0,    colors: [["Натуральный", "#C9A27A"], ["Шоколад", "#8A6246"]] },
    { id: "film",    name: "Матовая плёнка",   kind: "film",   extra: 0,    colors: [["Молочный", "#F5F2EC"], ["Пудровый", "#F0CFCB"], ["Графит", "#35332F"], ["Шалфей", "#B7C3AB"], ["Сирень", "#D6CBE4"]] },
    { id: "hatbox",  name: "Шляпная коробка",  kind: "hatbox", extra: 1900, colors: [["Белая", "#F7F5F1"], ["Чёрная", "#262523"], ["Розовая", "#EFC3C7"]] },
    { id: "basket",  name: "Корзина",          kind: "basket", extra: 2200, colors: [["Лоза", "#B98B5B"], ["Беленая", "#E2D3BE"]] },
    { id: "ribbon",  name: "Без упаковки, на ленте", kind: "ribbon", extra: 0, colors: [] },
  ],

  ribbons: [
    ["В тон букету", "auto"], ["Белая", "#FFFFFF"], ["Пудровая", "#EFC3C7"],
    ["Розовая", "#E7385A"], ["Чёрная", "#1B1A18"], ["Золото", "#C9A45C"],
  ],

  cardPrice: 350,
};
