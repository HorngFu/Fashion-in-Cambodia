// Measures the gzipped size of the Cloudflare Worker that `pnpm cf:build`
// produced, using Wrangler's dry run, and fails if it is over the budget.
//
// Usage: node scripts/check-worker-size.mjs [budgetKiB]
// Default budget: 2900 KiB, a little under the 3 MiB free-plan limit.
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FREE_PLAN_LIMIT_KIB = 3072;
const budgetKiB = Number(process.argv[2] ?? 2900);

const outdir = mkdtempSync(join(tmpdir(), "worker-size-"));
const output = execFileSync(
  "pnpm",
  ["exec", "wrangler", "deploy", "--dry-run", "--outdir", outdir],
  {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  },
);

// Wrangler prints e.g. "Total Upload: 9876.54 KiB / gzip: 1234.56 KiB"
const match = output.match(
  /Total Upload:\s*([\d.]+)\s*KiB\s*\/\s*gzip:\s*([\d.]+)\s*KiB/,
);
if (!match) {
  console.error(output);
  console.error("Could not find the Worker size in Wrangler's output.");
  process.exit(1);
}

const rawKiB = Number(match[1]);
const gzipKiB = Number(match[2]);
const percent = ((gzipKiB / FREE_PLAN_LIMIT_KIB) * 100).toFixed(0);

console.log(
  `Worker size: ${rawKiB.toFixed(0)} KiB raw, ${gzipKiB.toFixed(0)} KiB gzipped`,
);
console.log(
  `Free plan limit: ${FREE_PLAN_LIMIT_KIB} KiB gzipped (${percent}% used)`,
);

if (gzipKiB > budgetKiB) {
  console.error(
    `Worker is over the ${budgetKiB} KiB budget. See docs/decisions/0001-hosting.md for options.`,
  );
  process.exit(1);
}
