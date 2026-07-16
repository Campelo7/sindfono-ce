/**
 * Comprime logo.png e gera logo.webp para carregamento mais rápido.
 * Uso: node scripts/optimize-logo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.join(process.cwd(), "public");
const logoPng = path.join(publicDir, "logo.png");
const logoWebp = path.join(publicDir, "logo.webp");

if (!fs.existsSync(logoPng)) {
  console.error("public/logo.png não encontrado.");
  process.exit(1);
}

const before = fs.statSync(logoPng).size;

const optimizedBuffer = await sharp(logoPng)
  .resize(256, 256, { fit: "inside", withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toBuffer();

await sharp(logoPng)
  .resize(256, 256, { fit: "inside", withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile(logoWebp);

fs.writeFileSync(logoPng, optimizedBuffer);

const after = fs.statSync(logoPng).size;
const webpSize = fs.statSync(logoWebp).size;

console.log(`logo.png: ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`);
console.log(`logo.webp: ${Math.round(webpSize / 1024)}KB`);
