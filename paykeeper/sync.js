/* Копирует прайс-листы сайта в папку функции, чтобы сервер считал цены
   по тем же данным, что и витрина.

   Запускать перед каждой загрузкой функции в Яндекс Облако:
       node paykeeper/sync.js
   и обязательно — после любого изменения цен. */
"use strict";

const fs = require("fs");
const path = require("path");

const FILES = ["paloma-products.js", "coffee-menu-data.js"];
const root = path.join(__dirname, "..");

FILES.forEach((f) => {
  fs.copyFileSync(path.join(root, f), path.join(__dirname, f));
  console.log("скопирован:", f);
});
