// Fails if messages/*.json files do not all have the same keys as en.json,
// so a missing Khmer (or English) translation is caught in CI.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "messages";
const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

const read = (file) =>
  new Set(flatten(JSON.parse(readFileSync(join(dir, file), "utf8"))));

const reference = read("en.json");
let failed = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  if (file === "en.json") continue;
  const keys = read(file);
  const missing = [...reference].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !reference.has(k));
  if (missing.length || extra.length) {
    failed = true;
    if (missing.length)
      console.error(`${file} is missing: ${missing.join(", ")}`);
    if (extra.length)
      console.error(`${file} has extra keys: ${extra.join(", ")}`);
  }
}

if (failed) process.exit(1);
console.log(`All message files match en.json (${reference.size} keys).`);
