import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

const LIMIT_BYTES = 3 * 1024 * 1024;

const targets = [
  ".open-next/server-functions/default/handler.mjs",
  ".open-next/middleware/handler.mjs",
  ".open-next/worker.js",
];

let totalGzip = 0;

for (const relativePath of targets) {
  const filePath = path.join(process.cwd(), relativePath);
  try {
    const bytes = readFileSync(filePath);
    const gzipBytes = gzipSync(bytes);
    totalGzip += gzipBytes.length;
    console.log(
      `${relativePath}: ${(bytes.length / 1024 / 1024).toFixed(2)} MiB raw, ${(gzipBytes.length / 1024).toFixed(1)} KiB gzip`
    );
  } catch {
    console.log(`${relativePath}: (missing)`);
  }
}

console.log(
  `Estimated worker script gzip total: ${(totalGzip / 1024).toFixed(1)} KiB (free plan limit: ${(LIMIT_BYTES / 1024).toFixed(0)} KiB)`
);

if (totalGzip > LIMIT_BYTES) {
  console.warn("WARNING: bundle likely exceeds Cloudflare Workers free plan limit.");
  process.exitCode = 1;
}
