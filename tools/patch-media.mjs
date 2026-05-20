import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const scripts = `  <script src="paloma-media-paths.js"></script>\n  <script src="paloma-media.js"></script>\n`;

let n = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  if (html.includes("paloma-media.js")) continue;
  const anchor = html.includes("paloma-animations.js")
    ? '<script src="paloma-animations.js"></script>'
    : '<script src="script.js"></script>';
  if (!html.includes(anchor)) continue;
  html = html.replace(anchor, anchor + "\n" + scripts);
  fs.writeFileSync(fp, html, "utf8");
  n++;
}
console.log(`media scripts added to ${n} pages`);
