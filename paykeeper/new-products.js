/* ════════════════════════════════════════════════════════
   new-products.js — товары, которые владелец прислал, пока админка
   каталога не работала (сбой Яндекс Облака, 10–12.10.2026).

   server.js при запуске добавляет в базу те из них, которых там ещё
   нет (по id). Уже существующие НЕ трогает — значит, правки из админки
   (цена, фото, скрытие) не затираются при следующем перезапуске.
   Фото лежат в репозитории сайта: images/paloma/catalog/.
   ════════════════════════════════════════════════════════ */
"use strict";

const NEW = { badge: "Новинка" };
const one = [{ code: "base", label: "Базовый", priceDelta: 0 }];

module.exports = [
  Object.assign({}, NEW, {
    id: "p1791800000001", name: "Георгин", categories: ["online", "mono"],
    composition: "Георгин",
    desc: "Моно-букет из пышных георгинов. На фото — 11 шт.",
    image: "images/paloma/catalog/mono-georgin.jpg", price: 5870, priceFrom: false,
    sizes: [
      { code: "S", label: "S · 9 шт", priceDelta: 0 },
      { code: "M", label: "M · 11 шт", priceDelta: 1220 },
      { code: "L", label: "L · 15 шт", priceDelta: 3660 },
      { code: "XL", label: "XL · 21 шт", priceDelta: 7320 },
    ],
    photoSize: "M",
  }),
  Object.assign({}, NEW, {
    id: "p1791800000002", name: "Хризантема", categories: ["online", "mono"],
    composition: "Хризантема",
    desc: "Моно-букет из хризантем. На фото — 21 шт.",
    image: "images/paloma/catalog/mono-xrizantema.jpg", price: 5060, priceFrom: false,
    sizes: [
      { code: "S", label: "S · 9 шт", priceDelta: 0 },
      { code: "M", label: "M · 15 шт", priceDelta: 3120 },
      { code: "L", label: "L · 21 шт", priceDelta: 6240 },
      { code: "XL", label: "XL · 31 шт", priceDelta: 11440 },
    ],
    photoSize: "L",
  }),
  Object.assign({}, NEW, {
    id: "p1791800000003", name: "Солнечная осень", categories: ["authors", "autumn"],
    composition: "Хризантема, амариллис, горец, маттиола, стабилизированный бук",
    desc: "Авторский букет в тёплой осенней гамме: хризантема, амариллис, горец, маттиола и стабилизированный бук.",
    image: "images/paloma/catalog/author-xrizantema-amarillis.jpg", price: 4560, priceFrom: true, sizes: one,
  }),
  Object.assign({}, NEW, {
    id: "p1791800000004", name: "Осенняя палитра", categories: ["authors", "autumn"],
    composition: "Гортензия, каллы, роза пионовидная, дельфиниум, амариллис, хризантема, стабилизированный бук, сангисорба, антуриум",
    desc: "Большой авторский букет: гортензия, каллы, пионовидная роза, дельфиниум, амариллис, хризантема, сангисорба, антуриум и стабилизированный бук.",
    image: "images/paloma/catalog/author-osennyaya-palitra.jpg", price: 20085, priceFrom: true, sizes: one,
  }),
  Object.assign({}, NEW, {
    id: "p1791800000005", name: "Георгин и целозия", categories: ["authors", "autumn"],
    composition: "Хризантема, георгин, целозия, шиповник, стабилизированный эвкалипт",
    desc: "Авторский букет с георгином, целозией и ягодами шиповника, хризантемой и стабилизированным эвкалиптом.",
    image: "images/paloma/catalog/author-georgin-celoziya.jpg", price: 7890, priceFrom: true, sizes: one,
  }),
  Object.assign({}, NEW, {
    id: "p1791800000006", name: "Белая орхидея", categories: ["wedding"],
    composition: "Эустома, орхидея фаленопсис, стабилизированный амарант",
    desc: "Свадебный букет: эустома, орхидея фаленопсис и каскад стабилизированного амаранта.",
    image: "images/paloma/catalog/wed-eustoma-orhideya.jpg", price: 8820, priceFrom: true, sizes: one,
  }),
  Object.assign({}, NEW, {
    id: "p1791800000007", name: "Каллы", categories: ["wedding"],
    composition: "Каллы",
    desc: "Свадебный букет из калл — лаконичный и элегантный.",
    image: "images/paloma/catalog/wed-kally.jpg", price: 9200, priceFrom: false,
    sizes: [
      { code: "S", label: "S · 11 шт", priceDelta: 0 },
      { code: "M", label: "M · 13 шт", priceDelta: 1600 },
      { code: "L", label: "L · 15 шт", priceDelta: 3200 },
    ],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000008", name: "Пионовидная нежность", categories: ["duo"],
    composition: "Гортензия, пионовидная роза, пионовидная кустовая роза",
    desc: "Дуо-букет из гортензии, пионовидной и кустовой пионовидной розы.",
    image: "images/paloma/catalog/duo-gortenziya-kustovaya.jpg", price: 26800, priceFrom: true, sizes: one,
  }),
  Object.assign({}, NEW, {
    id: "p1791800000009", name: "Гортензия и роза", categories: ["duo"],
    composition: "Гортензия, пионовидная роза",
    desc: "Дуо-букет из гортензии и пионовидной розы.",
    image: "images/paloma/catalog/duo-gortenziya-roza.jpg", price: 14170, priceFrom: true, sizes: one,
  }),
  Object.assign({}, NEW, {
    id: "p1791800000010", name: "Осенняя корзина", categories: ["compositions", "autumn"],
    composition: "Амариллис, хризантема, шиповник, георгин, стабилизированный бук, стабилизированный эвкалипт, целозия, мискантус",
    desc: "Осенняя композиция в корзине: амариллис, хризантема, георгин, целозия, шиповник, мискантус, стабилизированные бук и эвкалипт.",
    image: "images/paloma/catalog/basket-osennyaya.jpg", price: 19080, priceFrom: true, sizes: one,
  }),
  Object.assign({}, NEW, {
    id: "p1791800000011", name: "Большая корзина", categories: ["compositions", "autumn"],
    composition: "Гортензия, георгин, кустовая пионовидная роза, пионовидная роза, стабилизированный эвкалипт",
    desc: "Большая корзина: голубая гортензия, георгины-помпоны, пионовидные и кустовые пионовидные розы, стабилизированный эвкалипт.",
    image: "images/paloma/catalog/basket-gortenziya-georgin.jpg", price: 60260, priceFrom: true, sizes: one,
  }),
  /* Шоколад и печенье фабрики «Счастье» (21.10.2026) */
  Object.assign({}, NEW, {
    id: "p1791800000012", name: "Конфета «Счастье» пралине с фисташкой и базиликом", categories: ["vases"],
    composition: "",
    desc: "Французское пралине с эссенцией базилика на масле виноградной косточки и кусочками фисташки в молочном шоколаде 30%. Ручная работа фабрики «Счастье». Масса 50 г, 566 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-fistashka-bazilik.jpg", price: 440, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000013", name: "Конфета «Счастье» пралине с грецким орехом и карамелью", categories: ["vases"],
    composition: "",
    desc: "Пралине с обжаренными вручную грецкими орехами и домашней сливочной карамелью в молочном шоколаде. Масса 50 г, 546 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-gretskiy-karamel.jpg", price: 440, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000014", name: "Конфета «Счастье» пралине с черносливом и грецким орехом", categories: ["vases"],
    composition: "",
    desc: "Пралине с отборным черносливом и обжаренными грецкими орехами в горьком шоколаде. Масса 50 г, 470 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-chernosliv.jpg", price: 440, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000015", name: "Конфета «Счастье» пралине с кунжутом и морской солью", categories: ["vases"],
    composition: "",
    desc: "Фундучно-арахисовое пралине с чёрным и белым кунжутом, морской солью и хрустящей вафельной крошкой в горьком шоколаде. Яркий сладко-солёный вкус. Масса 50 г, 533 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-kunzhut-sol.jpg", price: 440, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000016", name: "Конфеты «Счастье» пралине, 4 шт. № 3", categories: ["vases"],
    composition: "",
    desc: "Подарочная коробка из четырёх кубиков пралине «Счастье» разных вкусов — набор № 3. Ручная работа по рецептам французской школы. Масса 200 г.",
    image: "images/paloma/catalog/schaste-praline-4-n3.jpg", price: 1520, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000017", name: "Конфеты «Счастье» пралине, 4 шт. № 4", categories: ["vases"],
    composition: "",
    desc: "Подарочная коробка из четырёх кубиков пралине «Счастье» разных вкусов — набор № 4. Ручная работа по рецептам французской школы. Масса 200 г.",
    image: "images/paloma/catalog/schaste-praline-4-n4.jpg", price: 1640, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000018", name: "Мини-пралине «Счастье», 10 шт. Ассорти", categories: ["vases"],
    composition: "",
    desc: "10 мини-пралине разных вкусов: фундук, грецкий орех с карамелью, кокос, имбирь с семенами чиа, малина с розовым перцем и другие — в молочном шоколаде. Масса 85 г, 548 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-mini-10.jpg", price: 1100, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000019", name: "Мини-пралине «Счастье», 20 шт. Ассорти", categories: ["vases"],
    composition: "",
    desc: "20 мини-пралине разных вкусов: фундук, грецкий орех с карамелью, кокос, имбирь с семенами чиа, малина с розовым перцем и другие — в молочном шоколаде. Масса 170 г, 548 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-mini-20.jpg", price: 2200, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000020", name: "Мини-пралине «Счастье», 36 шт. Ассорти", categories: ["vases"],
    composition: "",
    desc: "36 мини-пралине 14 вкусов в молочном и горьком шоколаде: ваниль с фундуком, кофе, карамель с грецким орехом, грильяж, кунжут с морской солью, фисташка с базиликом, вишня с миндалём, лаванда и другие. Масса 306 г, 540 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-mini-36.jpg", price: 3800, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000021", name: "Ириски «Счастье» — коллекция № 1", categories: ["vases"],
    composition: "",
    desc: "Сливочно-карамельные ириски ручной работы: карамель варят на натуральных сливках 33%, режут небольшими кубиками и покрывают шоколадом. Масса 140 г.",
    image: "images/paloma/catalog/schaste-iriski-1.jpg", price: 1020, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000022", name: "Печенье «Ангел счастья»", categories: ["vases"],
    composition: "",
    desc: "Домашнее кунжутное печенье в форме ангела с морской солью и ганашем из молочного шоколада. Печётся по рецептам, которые фабрика «Счастье» хранит больше десяти лет. Масса 100 г, 449 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-angel.jpg", price: 630, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000023", name: "Печенье «Сердце счастья»", categories: ["vases"],
    composition: "",
    desc: "Имбирное печенье в форме сердца с начинкой из клюквы и белого шоколада с розовым перцем. Из коллекции печенья Friends фабрики «Счастье». Масса 90 г, 310 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-serdce.jpg", price: 630, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000024", name: "Печенье «Шоколадный Мишка»", categories: ["vases"],
    composition: "",
    desc: "Домашнее шоколадное печенье в форме мишки с ганашем из белого шоколада. Из коллекции печенья Friends фабрики «Счастье».",
    image: "images/paloma/catalog/schaste-mishka.jpg", price: 630, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000025", name: "Молочный шоколад «Счастье» Kids", categories: ["vases"],
    composition: "",
    desc: "Молочный шоколад из детской коллекции «Счастье» KIDS — в сказочной коробочке les petits Chocolats.",
    image: "images/paloma/catalog/schaste-kids-shokolad.jpg", price: 380, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000026", name: "Набор конфет «Счастье» KIDS", categories: ["vases"],
    composition: "",
    desc: "Детская коллекция «Счастье»: 6 мини-пралине в молочном шоколаде с любимыми детскими вкусами — малина, клубника, кокос, ваниль и печенье. В сказочной коробочке KIDS. Масса 51 г, 558 ккал / 100 г.",
    image: "images/paloma/catalog/schaste-kids-nabor.jpg", price: 690, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  /* Свадебный (23.10.2026) */
  Object.assign({}, NEW, {
    id: "p1791800000027", name: "Белый жемчуг", categories: ["wedding"],
    composition: "Эустома, георгин, калла, львиный зев",
    desc: "Свадебный букет в белом: эустома, георгины-помпоны, каллы и львиный зев. Ручка обвита атласной лентой с нитями жемчуга.",
    image: "images/paloma/catalog/wed-belyj-zhemchug.jpg", price: 8030, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  /* Бордовые хризантемы (24.10.2026): фото под каждый размер — product.js SIZE_PHOTOS */
  Object.assign({}, NEW, {
    id: "p1791800000028", name: "Бордовые хризантемы", categories: ["mono", "season", "autumn"],
    composition: "Хризантема одноголовая",
    desc: "Моно-букет из крупных бордовых хризантем в матовой упаковке PALOMA. Глубокий винный цвет и пышные головки — самый осенний букет сезона.",
    image: "images/paloma/catalog/mono-xrizantema-bordo-m.jpg", price: 2680, priceFrom: false,
    sizes: [
      { code: "S", label: "S · 5 шт", priceDelta: 0 },
      { code: "M", label: "M · 7 шт", priceDelta: 920 },
      { code: "L", label: "L · 11 шт", priceDelta: 2760 },
    ],
    photoSize: "M",
  }),
  /* 24.10.2026 */
  Object.assign({}, NEW, {
    id: "p1791800000029", name: "Пудровые французские розы", categories: ["online", "mono"],
    composition: "Французская роза",
    desc: "Моно-букет из нежно-розовых французских роз с волнистыми, будто кружевными лепестками. В матовой упаковке PALOMA.",
    image: "images/paloma/catalog/mono-french-pudra.jpg", price: 3145, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
];
