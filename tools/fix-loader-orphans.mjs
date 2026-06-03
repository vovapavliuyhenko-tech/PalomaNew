import fs from "fs";
import path from "path";

const orphanRe =
  /(\s*<\/div>\s*\n)\s*<\/div>\s*\n\s*<\/div>\s*\n(\s*<div class="site-top")/g;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!["node_modules", ".git"].includes(name)) walk(filePath);
      continue;
    }

    if (!name.endsWith(".html")) continue;

    const source = fs.readFileSync(filePath, "utf8");
    const next = source.replace(orphanRe, "$1\n$2");

    if (next !== source) {
      fs.writeFileSync(filePath, next);
      console.log("fixed", filePath);
    }
  }
}

walk(".");
