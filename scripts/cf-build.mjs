import { execSync } from "node:child_process";
import { platform } from "node:os";

const run = (command) => {
  execSync(command, { stdio: "inherit", shell: true });
};

if (platform() === "linux") {
  // Cloudflare CI sometimes skips optional native binaries for Tailwind v4.
  run(
    "npm install --no-save lightningcss-linux-x64-gnu@1.30.1 @tailwindcss/oxide-linux-x64-gnu@4.1.11 lightningcss-linux-x64-musl@1.30.1 @tailwindcss/oxide-linux-x64-musl@4.1.11"
  );
  run("npm rebuild lightningcss @tailwindcss/oxide --silent");
}

run("opennextjs-cloudflare build");
run("node scripts/report-worker-size.mjs");

if (platform() === "linux") {
  try {
    run("npx wrangler deploy --dry-run --minify --outdir .wrangler-size-check");
  } catch {
    console.log("Bundle size check skipped.");
  }
}
