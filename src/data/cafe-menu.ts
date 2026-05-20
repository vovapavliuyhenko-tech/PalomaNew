/** Меню кофейни — PRD §10 (`docs/PRD.md`): 20–30 позиций, категории Кофе · Какао · Чай · Выпечка · Десерты. */

export type CafeMenuCategorySlug = "coffee" | "cocoa" | "tea" | "bakery" | "desserts";

export type CafeMenuItem = {
  id: string;
  category: CafeMenuCategorySlug;
  title: string;
  description?: string;
  price: number;
  image?: string;
};

export const PRD_CAFE_MENU_CATEGORIES: { slug: CafeMenuCategorySlug; title: string }[] = [
  { slug: "coffee", title: "Кофе" },
  { slug: "cocoa", title: "Какао" },
  { slug: "tea", title: "Чай" },
  { slug: "bakery", title: "Выпечка" },
  { slug: "desserts", title: "Десерты" },
];

const U = {
  espresso: "https://images.unsplash.com/photo-1510591509088-bb2926ab261d?w=800&q=80",
  latte: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80",
  cap: "https://images.unsplash.com/photo-1572442388796-9aca77200244?w=800&q=80",
  cocoa: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80",
  tea: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
  croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
  cake: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
  raf: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&q=80",
  mocha: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80",
  flat: "https://images.unsplash.com/photo-1570968915866-41b7ae3d0883?w=800&q=80",
  herbal: "https://images.unsplash.com/photo-1564890369479-c89ca6d9cde9?w=800&q=80",
  cinnamon: "https://images.unsplash.com/photo-1626082927789-62f9453140b2?w=800&q=80",
} as const;

export const PRD_CAFE_MENU_ITEMS: CafeMenuItem[] = [
  { id: "cafe-001", category: "coffee", title: "Эспрессо", description: "Двойной шот, классическая обжарка.", price: 150, image: U.espresso },
  { id: "cafe-002", category: "coffee", title: "Доппио", description: "Два эспрессо в одной чашке.", price: 180, image: U.espresso },
  { id: "cafe-003", category: "coffee", title: "Американо", description: "Эспрессо и горячая вода.", price: 170, image: U.espresso },
  { id: "cafe-004", category: "coffee", title: "Капучино", description: "Эспрессо, молоко, молочная пена.", price: 220, image: U.cap },
  { id: "cafe-005", category: "coffee", title: "Латте Paloma", description: "Нежное молоко и эспрессо средней обжарки.", price: 250, image: U.latte },
  { id: "cafe-006", category: "coffee", title: "Раф классический", description: "Эспрессо, сливки, ванильный сахар.", price: 270, image: U.raf },
  { id: "cafe-007", category: "coffee", title: "Флэт уайт", description: "Двойной ристретто и бархатное молоко.", price: 240, image: U.flat },
  { id: "cafe-008", category: "coffee", title: "Мокко", description: "Эспрессо, какао, молоко, лёгкая пена.", price: 280, image: U.mocha },
  { id: "cafe-009", category: "cocoa", title: "Какао на молоке", description: "Тёмное какао и обжаренное молоко.", price: 220, image: U.cocoa },
  { id: "cafe-010", category: "cocoa", title: "Горячий шоколад", description: "Бельгийский шоколад 54%, сливки.", price: 290, image: U.cocoa },
  { id: "cafe-011", category: "cocoa", title: "Какао с маршмеллоу", description: "Соло с зефиром — как в детстве.", price: 250, image: U.cocoa },
  { id: "cafe-012", category: "tea", title: "Сенча", description: "Японский зелёный чай, лёгкая терпкость.", price: 180, image: U.tea },
  { id: "cafe-013", category: "tea", title: "Эрл Грей", description: "Чёрный чай с бергамотом.", price: 180, image: U.tea },
  { id: "cafe-014", category: "tea", title: "Облепиха-апельсин", description: "Травяной купаж, мёд по желанию.", price: 220, image: U.herbal },
  { id: "cafe-015", category: "tea", title: "Малина и имбирь", description: "Тёплый ягодный напиток без кофеина.", price: 230, image: U.herbal },
  { id: "cafe-016", category: "tea", title: "Сбор Paloma", description: "Ромашка, лемонграсс, липа.", price: 200, image: U.herbal },
  { id: "cafe-017", category: "bakery", title: "Круассан классический", description: "Сливочное масло, хрустящие слои.", price: 160, image: U.croissant },
  { id: "cafe-018", category: "bakery", title: "Круассан миндальный", description: "С миндальным кремом и миндалём.", price: 220, image: U.croissant },
  { id: "cafe-019", category: "bakery", title: "Синнабон", description: "С корицей и сырной глазурью.", price: 200, image: U.cinnamon },
  { id: "cafe-020", category: "bakery", title: "Скона с изюмом", description: "Английская выпечка, чайная пара.", price: 150, image: U.croissant },
  { id: "cafe-021", category: "desserts", title: "Чизкейк нью-йорк", description: "Нежный сливочный с джемом ягод.", price: 320, image: U.cake },
  { id: "cafe-022", category: "desserts", title: "Тирамису", description: "Маскарпоне, кофе, какао.", price: 290, image: U.cake },
  { id: "cafe-023", category: "desserts", title: "Брауни", description: "Шоколадный брауни с грецким орехом.", price: 240, image: U.cake },
  { id: "cafe-024", category: "desserts", title: "Пирожное «картошка»", description: "Классика: печенье, какао, сгущёнка.", price: 140, image: U.cake },
];
