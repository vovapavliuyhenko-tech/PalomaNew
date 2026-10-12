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
];
