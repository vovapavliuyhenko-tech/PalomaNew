import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const partial = fs.readFileSync(
  path.join(root, "partials", "blog-main.html"),
  "utf8",
);

let blogHtml = fs.readFileSync(path.join(root, "blog.html"), "utf8");
blogHtml = blogHtml.replace(
  /<main class="blog-page"[\s\S]*?<\/main>/,
  partial.trim(),
);
blogHtml = blogHtml.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>Блог PALOMA — цветы, кофе и вдохновение</title>",
);
blogHtml = blogHtml.replace(
  /<meta name="description" content="[^"]*">/,
  '<meta name="description" content="Блог PALOMA: выбор букета, уход за цветами, подарки, подписка и оформление событий.">',
);
if (!blogHtml.includes("clients.css")) {
  blogHtml = blogHtml.replace(
    '<link rel="stylesheet" href="cart.css">',
    '<link rel="stylesheet" href="cart.css">\n  <link rel="stylesheet" href="clients.css">',
  );
}
fs.writeFileSync(path.join(root, "blog.html"), blogHtml, "utf8");

let articleHtml = fs.readFileSync(
  path.join(root, "blog-article.html"),
  "utf8",
);
articleHtml = articleHtml.replace(
  /<title>[\s\S]*?<\/title>/,
  "<title>Статья — Блог PALOMA</title>",
);
articleHtml = articleHtml.replace(
  /<li><a href="blog\.html">Журнал<\/a><\/li>/g,
  '<li><a href="blog.html">Блог</a></li>',
);
articleHtml = articleHtml.replace(/Журнал/g, (m, offset, str) => {
  const before = str.slice(Math.max(0, offset - 80), offset);
  if (before.includes("article-breadcrumbs")) return "Блог";
  return m;
});
articleHtml = articleHtml.replace(
  "Вернитесь в журнал",
  "Вернитесь в блог",
);
articleHtml = articleHtml.replace(
  "Вернуться в журнал",
  "Вернуться в блог",
);
if (!articleHtml.includes("clients.css")) {
  articleHtml = articleHtml.replace(
    '<link rel="stylesheet" href="cart.css">',
    '<link rel="stylesheet" href="cart.css">\n  <link rel="stylesheet" href="clients.css">',
  );
}
fs.writeFileSync(path.join(root, "blog-article.html"), articleHtml, "utf8");

console.log("patched blog.html and blog-article.html");
