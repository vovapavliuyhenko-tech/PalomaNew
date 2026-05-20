import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fp = path.join(root, "contacts.html");
const partial = fs.readFileSync(
  path.join(root, "partials", "contacts-main.html"),
  "utf8",
);

let html = fs.readFileSync(fp, "utf8");
html = html.replace(/<main class="contacts-page"[\s\S]*?<\/main>/, partial.trim());

if (!html.includes("contacts.css")) {
  html = html.replace(
    '<link rel="stylesheet" href="clients.css">',
    '<link rel="stylesheet" href="clients.css">\n  <link rel="stylesheet" href="contacts.css">',
  );
}

if (!html.includes("contacts.js")) {
  html = html.replace(
    '<script src="clients.js"></script>',
    '<script src="clients.js"></script>\n  <script src="contacts.js"></script>',
  );
}

fs.writeFileSync(fp, html, "utf8");
console.log("patched contacts.html");
