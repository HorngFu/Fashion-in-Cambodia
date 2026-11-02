// Crawls the built site and fails if any internal link is broken.
//
// Usage: pnpm build && pnpm check:links
// Starts `next start` on a free port, follows every internal link from the
// home pages, and reports pages that do not answer 200.
import { spawn } from "node:child_process";
import { createServer } from "node:net";

const START = ["/km", "/en"];
const SKIP = [/^\/_next\//, /^\/api\//, /^\/keystatic/];

const port = await new Promise((resolve) => {
  const server = createServer().listen(0, () => {
    const { port } = server.address();
    server.close(() => resolve(port));
  });
});
const base = `http://localhost:${port}`;

const next = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
  { stdio: ["ignore", "pipe", "inherit"] },
);
const stop = () => next.kill();
process.on("exit", stop);

// Wait until the server answers.
for (let i = 0; ; i++) {
  try {
    await fetch(`${base}/km`);
    break;
  } catch {
    if (i > 60) throw new Error("next start did not come up");
    await new Promise((r) => setTimeout(r, 500));
  }
}

const seen = new Map(); // path -> page that linked to it
const queue = START.map((path) => [path, "(start)"]);
const broken = [];
let checked = 0;

while (queue.length) {
  const [path, from] = queue.shift();
  if (seen.has(path)) continue;
  seen.set(path, from);

  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  checked++;
  if (response.status !== 200) {
    broken.push(`${response.status} ${path}  (linked from ${from})`);
    continue;
  }
  if (!response.headers.get("content-type")?.includes("text/html")) continue;

  const html = await response.text();
  for (const [, href] of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const target = href.split(/[?#]/)[0] || "/";
    if (SKIP.some((re) => re.test(target)) || seen.has(target)) continue;
    queue.push([target, path]);
  }
}

stop();
if (broken.length) {
  console.error(`Broken links (${broken.length}):`);
  for (const line of broken) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`All ${checked} internal pages answer 200.`);
