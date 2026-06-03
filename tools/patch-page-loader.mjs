import fs from "fs";
import path from "path";

const NEW_LOADER = `  <!-- PALOMA PAGE LOADER — premium curtain transition -->
  <div class="paloma-page-loader" id="palomaPageLoader" aria-hidden="true">
    <div class="paloma-page-loader__logo" aria-label="PALOMA">
      <span class="paloma-page-loader__logo-base">PALOMA</span>
      <span class="paloma-page-loader__logo-fill">PALOMA</span>
    </div>
  </div>`;

const legacyRe =
  /\s*<div id="palomaLoader"[\s\S]*?<\/div>\s*\n\s*<div id="palomaTransition"[\s\S]*?<\/div>/g;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (["node_modules", ".git", "tools", "internals"].includes(name)) continue;
      walk(filePath);
      continue;
    }

    if (!name.endsWith(".html")) continue;

    const source = fs.readFileSync(filePath, "utf8");
    if (!source.includes("palomaLoader") && !source.includes("preloader.css")) continue;

    const next = source
      .replace(legacyRe, `\n${NEW_LOADER}`)
      .replace(/preloader\.css(\?v=[^"']*)?/g, "preloader.css?v=8")
      .replace(/preloader\.js(\?v=[^"']*)?/g, "preloader.js?v=8");

    if (next !== source) {
      fs.writeFileSync(filePath, next);
      console.log("updated", filePath);
    }
  }
}

walk(".");
