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
    desc: "Конфета пралине в молочном шоколаде с фисташкой и базиликом. Шоколадная фабрика «Счастье», Санкт-Петербург.",
    image: "images/paloma/catalog/schaste-fistashka-bazilik.jpg", price: 440, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000013", name: "Конфета «Счастье» пралине с грецким орехом и карамелью", categories: ["vases"],
    composition: "",
    desc: "Конфета пралине с грецкими орехами и карамелью в молочном шоколаде. Шоколадная фабрика «Счастье».",
    image: "images/paloma/catalog/schaste-gretskiy-karamel.jpg", price: 440, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000014", name: "Конфета «Счастье» пралине с черносливом и грецким орехом", categories: ["vases"],
    composition: "",
    desc: "Конфета пралине с черносливом и грецкими орехами в горьком шоколаде. Шоколадная фабрика «Счастье».",
    image: "images/paloma/catalog/schaste-chernosliv.jpg", price: 440, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000015", name: "Конфета «Счастье» пралине с кунжутом и морской солью", categories: ["vases"],
    composition: "",
    desc: "Конфета пралине с кунжутом и морской солью в горьком шоколаде. Шоколадная фабрика «Счастье».",
    image: "images/paloma/catalog/schaste-kunzhut-sol.jpg", price: 440, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000016", name: "Конфеты «Счастье» пралине, 4 шт. № 3", categories: ["vases"],
    composition: "",
    desc: "Подарочная коробка из четырёх конфет пралине «Счастье» — набор № 3.",
    image: "images/paloma/catalog/schaste-praline-4-n3.jpg", price: 1520, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000017", name: "Конфеты «Счастье» пралине, 4 шт. № 4", categories: ["vases"],
    composition: "",
    desc: "Подарочная коробка из четырёх конфет пралине «Счастье» — набор № 4.",
    image: "images/paloma/catalog/schaste-praline-4-n4.jpg", price: 1640, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000018", name: "Мини-пралине «Счастье», 10 шт. Ассорти", categories: ["vases"],
    composition: "",
    desc: "Коллекция мини-пралине «Счастье» — 10 конфет ассорти в длинной подарочной коробке.",
    image: "images/paloma/catalog/schaste-mini-10.jpg", price: 1100, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000019", name: "Мини-пралине «Счастье», 20 шт. Ассорти", categories: ["vases"],
    composition: "",
    desc: "Коллекция мини-пралине «Счастье» — 20 конфет ассорти в подарочной коробке.",
    image: "images/paloma/catalog/schaste-mini-20.jpg", price: 2200, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000020", name: "Мини-пралине «Счастье», 36 шт. Ассорти", categories: ["vases"],
    composition: "",
    desc: "Коллекция мини-пралине «Счастье» — 36 конфет ассорти в большой подарочной коробке.",
    image: "images/paloma/catalog/schaste-mini-36.jpg", price: 3800, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000021", name: "Ириски «Счастье» — коллекция № 1", categories: ["vases"],
    composition: "",
    desc: "Коллекция оригинальных сливочно-карамельных ирисок «Счастье» в шоколаде. Масса 140 г.",
    image: "images/paloma/catalog/schaste-iriski-1.jpg", price: 1020, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000022", name: "Печенье «Ангел счастья»", categories: ["vases"],
    composition: "",
    desc: "Кунжутное печенье с морской солью и ганашем из молочного шоколада. Biscuit Maison от фабрики «Счастье».",
    image: "images/paloma/catalog/schaste-angel.jpg", price: 630, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000023", name: "Печенье «Сердце счастья»", categories: ["vases"],
    composition: "",
    desc: "Домашнее печенье в форме сердца в подарочной коробке. Biscuit Maison от фабрики «Счастье».",
    image: "images/paloma/catalog/schaste-serdce.jpg", price: 630, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000024", name: "Печенье «Шоколадный Мишка»", categories: ["vases"],
    composition: "",
    desc: "Домашнее шоколадное печенье с ганашем из белого шоколада. Biscuit Maison от фабрики «Счастье».",
    image: "images/paloma/catalog/schaste-mishka.jpg", price: 630, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
  Object.assign({}, NEW, {
    id: "p1791800000025", name: "Молочный шоколад «Счастье» Kids", categories: ["vases"],
    composition: "",
    desc: "Молочный шоколад «Счастье» для детей — les petits Chocolats.",
    image: "images/paloma/catalog/schaste-kids-shokolad.jpg", price: 380, priceFrom: false,
    sizes: [{ code: "one", label: "Один размер", priceDelta: 0 }],
  }),
];
