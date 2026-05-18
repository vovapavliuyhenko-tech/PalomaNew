import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".html")) continue;
  const fp = path.join(dir, f);
  let s = fs.readFileSync(fp, "utf8");
  const n = s.replace(
    /(<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*){2}/g,
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n',
  );
  if (s !== n) fs.writeFileSync(fp, n);
}
