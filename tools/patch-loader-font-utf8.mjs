import fs from "fs";
import path from "path";

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!["node_modules", ".git", "tools", "internals"].includes(name)) walk(filePath);
      continue;
    }

    if (!name.endsWith(".html")) continue;

    let source = fs.readFileSync(filePath, "utf8");
    if (!source.includes("paloma-page-loader")) continue;

    const next = source
      .replace(/paloma-page-loader__logo-base">PALOMA/g, 'paloma-page-loader__logo-base">Paloma')
      .replace(/paloma-page-loader__logo-fill">PALOMA/g, 'paloma-page-loader__logo-fill">Paloma')
      .replace(/preloader\.css(\?v=[^"']*)?/g, "preloader.css?v=9")
      .replace(/preloader\.js(\?v=[^"']*)?/g, "preloader.js?v=9");

    if (next !== source) {
      fs.writeFileSync(filePath, next, { encoding: "utf8" });
      console.log("updated", filePath);
    }
  }
}

walk(".");
