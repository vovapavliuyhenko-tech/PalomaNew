import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* Метрика: базовая статистика с первого визита, полный режим — после «Принять».
   Заменяет opt-in сниппет (счётчик только после согласия) на lite-режим:
   до согласия визиты/источники/цели считаются без вебвизора, карты кликов
   и точного отказа; «Только необходимые» — счётчик не подключается вообще.
   20.11.2026: стратегия Директа теряла ~80% визитов из-за opt-in. */

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const OLD_GATE =
  'm.palomaMetrikaSrc=r; try { if (localStorage.getItem("paloma-cookie-consent") !== "accepted") return; } catch (x) { return; } /* Метрика — только после согласия на cookie */';
const NEW_GATE =
  'm.palomaMetrikaSrc=r; var palomaConsent = null; try { palomaConsent = localStorage.getItem("paloma-cookie-consent"); } catch (x) { palomaConsent = "accepted"; } /* Метрика — с первого визита в lite-режиме (без вебвизора/кликмапа); «Только необходимые» — не подключаем */ if (palomaConsent === "necessary") return; m.palomaMetrikaLite = (palomaConsent !== "accepted");';

const OLD_INIT =
  "ym(110912456, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:\"dataLayer\", accurateTrackBounce:true, trackLinks:true});";
const NEW_INIT =
  "ym(110912456, 'init', (function(){var lite = window.palomaMetrikaLite === true; return {ssr:true, webvisor:!lite, clickmap:!lite, ecommerce:\"dataLayer\", accurateTrackBounce:!lite, trackLinks:true};})());";

function* walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === ".git" || ent.name === "node_modules") continue;
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(fp);
    else if (ent.name.endsWith(".html")) yield fp;
  }
}

let patched = 0;
let skipped = [];

for (const fp of walk(root)) {
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes(OLD_GATE)) {
    if (html.includes("Yandex.Metrika counter")) skipped.push(path.relative(root, fp));
    continue;
  }
  if (!html.includes(OLD_INIT)) {
    skipped.push(path.relative(root, fp) + " (init не совпал)");
    continue;
  }
  html = html.replace(OLD_GATE, NEW_GATE).replace(OLD_INIT, NEW_INIT);
  fs.writeFileSync(fp, html, "utf8");
  patched++;
}

console.log(`patched ${patched} files`);
if (skipped.length) console.log("пропущены:\n" + skipped.join("\n"));
