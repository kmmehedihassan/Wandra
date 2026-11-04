// Generate responsive WebP copies of every photo in public/images.
//
//   npm run optimize-images
//
// Writes public/images/opt/<name>-<width>.webp (480, 960 and 1600 px wide,
// never larger than the original) and src/imageManifest.json with each
// photo's size and average colour, used by the <Img> component for srcset,
// layout-stable width/height and a colour placeholder while loading.
// Re-run after adding or replacing photos; unchanged photos are skipped.
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import { dirname, extname, join, parse, resolve } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, "../public/images");
const outDir = join(srcDir, "opt");
const manifestPath = resolve(here, "../src/imageManifest.json");
const WIDTHS = [480, 960, 1600];
const PHOTO = /\.(jpe?g|png)$/i;

mkdirSync(outDir, { recursive: true });
const manifest = {};
let written = 0;
let before = 0;
let after = 0;

for (const file of readdirSync(srcDir).sort()) {
  const path = join(srcDir, file);
  if (!PHOTO.test(file) || !statSync(path).isFile()) continue;
  const image = sharp(path).rotate();
  const { width, height } = await image.metadata();
  const { dominant } = await image.stats();
  const color = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  const base = parse(file).name.replace(/[^\w-]+/g, "_");
  const widths = WIDTHS.filter((w) => w < width).concat(width <= WIDTHS[WIDTHS.length - 1] ? [width] : []);
  const unique = [...new Set(widths.map((w) => Math.min(w, WIDTHS[WIDTHS.length - 1])))];
  before += statSync(path).size;
  for (const w of unique) {
    const out = join(outDir, `${base}-${w}.webp`);
    if (!existsSync(out) || statSync(out).mtimeMs < statSync(path).mtimeMs) {
      await sharp(path).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72, effort: 5 }).toFile(out);
      written += 1;
    }
    if (w === unique[unique.length - 1]) after += statSync(out).size;
  }
  manifest[`/images/${file}`] = {
    w: width,
    h: height,
    color,
    srcset: unique.map((w) => [`/images/opt/${base}-${w}.webp`, w]),
  };
}

writeFileSync(manifestPath, JSON.stringify(manifest) + "\n");
const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(
  `${Object.keys(manifest).length} photos, ${written} files written. ` +
    `Largest versions: ${mb(after)} MB WebP vs ${mb(before)} MB originals.`
);
