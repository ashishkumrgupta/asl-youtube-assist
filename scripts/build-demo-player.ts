import * as esbuild from "esbuild";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = join(root, "apps/demo-player");
const outDir = join(app, "dist");
const fixtures = join(root, "fixtures/demo-videos");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, "media"), { recursive: true });

cpSync(join(app, "index.html"), join(outDir, "index.html"));
cpSync(join(app, "styles.css"), join(outDir, "styles.css"));

if (existsSync(fixtures)) {
  for (const name of [
    "01-hello.mp4",
    "01-hello.vtt",
    "02-welcome.mp4",
    "02-welcome.vtt",
    "03-oov.mp4",
    "03-oov.vtt",
    "04-wh-time.mp4",
    "04-wh-time.vtt",
    "05-gaps.mp4",
    "05-gaps.vtt",
  ]) {
    const src = join(fixtures, name);
    if (existsSync(src)) cpSync(src, join(outDir, "media", name));
  }
}

await esbuild.build({
  entryPoints: [join(app, "src/main.ts")],
  outfile: join(outDir, "main.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["chrome120", "edge120"],
  sourcemap: true,
  logLevel: "info",
});

console.log(`demo-player → ${outDir}`);
