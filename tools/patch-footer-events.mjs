import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const re = /<li><a href="events\.html">Мероприятия<\/a><\/li>/;
const rep =
  '<li><a href="event-decoration.html">Оформление мероприятий</a></li>\n            <li><a href="events.html">Оформление</a></li>';

let n = 0;
for (const f of fs.readdirSync(root).filter((x) => x.endsWith(".html"))) {
  const fp = path.join(root, f);
  let h = fs.readFileSync(fp, "utf8");
  if (re.test(h)) {
    fs.writeFileSync(fp, h.replace(re, rep), "utf8");
    n++;
  }
}
console.log("footer patched", n);
