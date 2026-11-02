// Keeps photos small enough for phones on slow connections.
//
//   pnpm images          Convert images in public/images to WebP, at most
//                        1600px wide, and update the paths in /content.
//   pnpm images:check    Only report images that need converting (used in CI).
//
// Rules: WebP format, at most 1600px wide, at most 500 KB.
import {
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { extname, join, relative, sep } from "node:path";
import sharp from "sharp";

const IMAGE_DIR = join("public", "images");
const CONTENT_DIR = "content";
const MAX_WIDTH = 1600;
const MAX_BYTES = 500 * 1024;
const QUALITY = 80;
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".heic",
]);

const checkOnly = process.argv.includes("--check");

function walk(dir, filter) {
  let files = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(path, filter));
    else if (filter(path)) files.push(path);
  }
  return files;
}

// "public/images/shops/x.jpg" -> "/images/shops/x.jpg", as stored in /content.
const publicPath = (file) =>
  "/" + relative("public", file).split(sep).join("/");

const images = walk(IMAGE_DIR, (f) =>
  IMAGE_EXTENSIONS.has(extname(f).toLowerCase()),
);
const problems = [];
const renames = new Map();

for (const file of images) {
  const { width = 0 } = await sharp(file).metadata();
  const bytes = statSync(file).size;
  const isWebp = extname(file).toLowerCase() === ".webp";
  const reasons = [];
  if (!isWebp) reasons.push("not WebP");
  if (width > MAX_WIDTH) reasons.push(`${width}px wide`);
  if (bytes > MAX_BYTES) reasons.push(`${Math.round(bytes / 1024)} KB`);
  if (!reasons.length) continue;

  if (checkOnly) {
    problems.push(`${file}: ${reasons.join(", ")}`);
    continue;
  }

  const target = file.slice(0, -extname(file).length) + ".webp";
  const output = await sharp(file)
    .rotate() // apply the camera's orientation before EXIF data is dropped
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();
  writeFileSync(target, output);
  if (target !== file) {
    unlinkSync(file);
    renames.set(publicPath(file), publicPath(target));
  }
  console.log(
    `${file} -> ${target} (${Math.round(bytes / 1024)} KB -> ${Math.round(output.length / 1024)} KB)`,
  );
}

// Point content entries at the new .webp files.
if (renames.size) {
  for (const file of walk(CONTENT_DIR, (f) => /\.(ya?ml|mdx?)$/.test(f))) {
    const before = readFileSync(file, "utf8");
    let after = before;
    for (const [from, to] of renames) after = after.split(from).join(to);
    if (after !== before) {
      writeFileSync(file, after);
      console.log(`updated ${file}`);
    }
  }
}

if (problems.length) {
  for (const problem of problems) console.error(problem);
  console.error(
    `\n${problems.length} image(s) need converting. Run: pnpm images`,
  );
  process.exit(1);
}
console.log(
  checkOnly
    ? `All ${images.length} image(s) are WebP, ≤ ${MAX_WIDTH}px wide and ≤ 500 KB.`
    : `Done. ${images.length} image(s) checked.`,
);
