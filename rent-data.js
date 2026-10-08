/* ════════════════════════════════════════════════════════
   rent-data.js — аренда декора PALOMA (то, что осталось после
   свадеб и мероприятий: пуфы, свет, вазы, арки, текстиль…)

   ⚠️ ЧЕРНОВИК. Позиции, цены, количество и залог ниже — примеры,
   чтобы страница работала. Перед запуском заменить на реальный
   инвентарь студии и добавить фото (photos: ["images/paloma/rent/…"]).

   Поля позиции:
     id       — латиницей, без пробелов (для ссылки и сметы)
     cat      — код категории из categories
     name     — название
     price    — за сутки, ₽ (0 — «по запросу»)
     qty      — сколько штук есть
     deposit  — залог за 1 шт, ₽ (возвращается после возврата)
     size, material, color — характеристики (можно пусто)
     desc     — 1–2 предложения
     photos   — массив путей к фото; пусто — красивая заглушка
     hit      — true: «популярное», выше в сортировке
   ════════════════════════════════════════════════════════ */
window.PALOMA_RENT = {
  /* Вторые и следующие сутки — дешевле: доля от цены первых суток */
  extraDayFactor: 0.5,
  /* Минимальная сумма заказа аренды, ₽ (0 — без минимума) */
  minOrder: 3000,

  /* Как получить: самовывоз из студии, доставка, доставка с монтажом */
  delivery: [
    { id: "pickup",  name: "Самовывоз",           note: "ул. Энгельса, 74/82", price: 0 },
    { id: "deliver", name: "Доставка и вывоз",    note: "по Новороссийску",    price: 2500 },
    { id: "mount",   name: "Доставка с монтажом", note: "привезём, расставим, заберём", price: 6000 },
  ],

  categories: [
    { id: "furniture", name: "Пуфы и мебель" },
    { id: "light",     name: "Свет" },
    { id: "vases",     name: "Вазы и подставки" },
    { id: "arches",    name: "Арки и фотозоны" },
    { id: "textile",   name: "Текстиль" },
    { id: "table",     name: "Сервировка" },
  ],

  items: [
    { id: "puf-round-white", cat: "furniture", name: "Пуф круглый, молочный велюр", price: 600, qty: 12, deposit: 1000, size: "Ø 45 × 42 см", material: "велюр, дерево", color: "молочный", desc: "Мягкий круглый пуф для гостевой зоны, welcome и фотозоны.", hit: true, photos: [] },
    { id: "bench-velvet", cat: "furniture", name: "Банкетка бархатная", price: 1200, qty: 4, deposit: 2000, size: "120 × 40 × 45 см", material: "бархат", color: "пудровый", desc: "Длинная банкетка: для фото молодожёнов или зоны ожидания.", photos: [] },
    { id: "chair-chiavari", cat: "furniture", name: "Стул «Кьявари» прозрачный", price: 450, qty: 30, deposit: 800, size: "40 × 40 × 92 см", material: "поликарбонат", color: "прозрачный", desc: "Лёгкий прозрачный стул — растворяется в оформлении.", hit: true, photos: [] },
    { id: "sofa-photo", cat: "furniture", name: "Диванчик для фотозоны", price: 3500, qty: 1, deposit: 5000, size: "160 × 75 × 80 см", material: "букле", color: "белый", desc: "Главный акцент фотозоны или президиума.", photos: [] },

    { id: "lamp-ball", cat: "light", name: "Светильник-шар напольный", price: 900, qty: 6, deposit: 1500, size: "Ø 50 см", material: "пластик, LED", color: "тёплый белый", desc: "Мягкий рассеянный свет вдоль дорожки или у сцены.", hit: true, photos: [] },
    { id: "garland-retro", cat: "light", name: "Гирлянда с ретро-лампами, 10 м", price: 1100, qty: 5, deposit: 1500, size: "10 м, 20 ламп", material: "провод, лампы", color: "тёплый свет", desc: "Тёплые огни над столами или шатром.", photos: [] },
    { id: "candle-stand", cat: "light", name: "Подсвечники высокие, набор 3 шт", price: 800, qty: 8, deposit: 1500, size: "30 / 40 / 50 см", material: "металл", color: "золото", desc: "Набор для центра стола, вместе с цветами.", photos: [] },
    { id: "led-candles", cat: "light", name: "LED-свечи, набор 12 шт", price: 500, qty: 10, deposit: 800, size: "Ø 7.5 × 10–15 см", material: "воск, LED", color: "слоновая кость", desc: "Живой огонь без огня — безопасно для любых площадок.", photos: [] },

    { id: "vase-flask", cat: "vases", name: "Ваза-колба высокая", price: 400, qty: 20, deposit: 700, size: "60 × 15 см", material: "стекло", color: "прозрачный", desc: "Для высоких композиций на столах гостей.", photos: [] },
    { id: "stand-column", cat: "vases", name: "Стойка-колонна под цветы", price: 1000, qty: 6, deposit: 2000, size: "100 см", material: "металл", color: "белый", desc: "Поднимает композицию над гостями — для проходов и сцены.", hit: true, photos: [] },
    { id: "stand-ring", cat: "vases", name: "Подставка-кольцо настольная", price: 600, qty: 10, deposit: 1000, size: "Ø 40 см", material: "металл", color: "золото", desc: "Основа для цветочного венка на стол.", photos: [] },

    { id: "arch-round", cat: "arches", name: "Арка круглая", price: 4500, qty: 2, deposit: 5000, size: "Ø 200 см", material: "металл", color: "белый", desc: "Для выездной регистрации и фотозоны, украшаем цветами по запросу.", hit: true, photos: [] },
    { id: "arch-rect", cat: "arches", name: "Арка прямоугольная", price: 4000, qty: 2, deposit: 5000, size: "220 × 240 см", material: "металл", color: "чёрный", desc: "Строгая геометрия — под минималистичное оформление.", photos: [] },
    { id: "screen-panel", cat: "arches", name: "Ширма-панель для фотозоны", price: 3000, qty: 3, deposit: 3000, size: "200 × 180 см", material: "дерево, ткань", color: "молочный", desc: "Фон для welcome-зоны и фото гостей.", photos: [] },

    { id: "cloth-white", cat: "textile", name: "Скатерть белая, 3 м", price: 500, qty: 15, deposit: 500, size: "300 × 150 см", material: "хлопок с льном", color: "белый", desc: "Плотная скатерть на банкетный стол.", photos: [] },
    { id: "runner", cat: "textile", name: "Дорожка на стол, шифон", price: 300, qty: 20, deposit: 300, size: "500 × 70 см", material: "шифон", color: "пудровый", desc: "Воздушная дорожка поверх скатерти.", photos: [] },
    { id: "drape", cat: "textile", name: "Ткань для драпировки, 6 м", price: 700, qty: 8, deposit: 700, size: "600 × 300 см", material: "вуаль", color: "белый", desc: "Драпировка арки, стены или потолка.", photos: [] },

    { id: "charger-gold", cat: "table", name: "Подтарельник золотой", price: 120, qty: 60, deposit: 200, size: "Ø 33 см", material: "пластик", color: "золото", desc: "Праздничная сервировка без хлопот.", photos: [] },
    { id: "glass-tulip", cat: "table", name: "Бокалы для шампанского, набор 6 шт", price: 600, qty: 10, deposit: 1200, size: "200 мл", material: "стекло", color: "прозрачный", desc: "Для welcome-зоны и тостов.", photos: [] },
  ],
};
