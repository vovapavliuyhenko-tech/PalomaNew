import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const link = '  <link rel="stylesheet" href="paloma-responsive.css">';
let count = 0;

for (const file of fs.readdirSync(root).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");

  html = html.replace(/\s*<link rel="stylesheet" href="paloma-responsive\.css">\s*/g, "\n");

  const headEnd = html.indexOf("</head>");
  if (headEnd === -1) continue;

  const head = html.slice(0, headEnd);
  const lastLink = head.lastIndexOf('<link rel="stylesheet"');
  if (lastLink === -1) continue;

  const lineEnd = head.indexOf("\n", lastLink);
  const insertAt = lineEnd === -1 ? headEnd : lineEnd + 1;
  html =
    html.slice(0, insertAt) + link + "\n" + html.slice(insertAt);

  fs.writeFileSync(fp, html, "utf8");
  count++;
}

console.log(`re-patched ${count} html files (responsive.css last)`);
