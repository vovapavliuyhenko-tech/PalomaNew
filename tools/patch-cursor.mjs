import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cssLink = '  <link rel="stylesheet" href="cursor.css">';
const jsScript = '  <script src="cursor.js"></script>';

let n = 0;
for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  let changed = false;

  if (!html.includes("cursor.css")) {
    const anchor = html.includes("paloma-responsive.css")
      ? '<link rel="stylesheet" href="paloma-responsive.css">'
      : html.includes("paloma-animations.css")
        ? '<link rel="stylesheet" href="paloma-animations.css">'
        : '<link rel="stylesheet" href="styles.css">';
    if (html.includes(anchor)) {
      html = html.replace(anchor, `${anchor}\n${cssLink}`);
      changed = true;
    }
  }

  if (!html.includes("cursor.js")) {
    const lastScript = html.lastIndexOf("<script");
    const bodyEnd = html.lastIndexOf("</body>");
    if (lastScript !== -1 && bodyEnd !== -1) {
      const lineEnd = html.indexOf("\n", lastScript);
      const insertAt = lineEnd === -1 ? bodyEnd : lineEnd + 1;
      html = html.slice(0, insertAt) + `${jsScript}\n` + html.slice(insertAt);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fp, html, "utf8");
    n++;
  }
}

console.log(`patched ${n} html files with cursor.css + cursor.js`);
