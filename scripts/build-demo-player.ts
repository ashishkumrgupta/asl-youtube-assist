import * as esbuild from "esbuild";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = join(root, "apps/demo-player");
const outDir = join(app, "dist");
const fixtures = join(root, "fixtures/demo-videos");

/** Documented static theater origin (least-privilege host match). */
export const THEATER_PORT = 4173;

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, "media"), { recursive: true });

cpSync(join(app, "index.html"), join(outDir, "index.html"));
cpSync(join(app, "watch.html"), join(outDir, "watch.html"));
cpSync(join(app, "styles.css"), join(outDir, "styles.css"));

if (existsSync(fixtures)) {
  const manifest = join(fixtures, "manifest.json");
  if (existsSync(manifest)) {
    cpSync(manifest, join(outDir, "media", "manifest.json"));
  }
  for (const name of readdirSync(fixtures)) {
    if (name.endsWith(".mp4") || name.endsWith(".vtt")) {
      cpSync(join(fixtures, name), join(outDir, "media", name));
    }
  }
}

await esbuild.build({
  entryPoints: {
    library: join(app, "src/library.ts"),
    watch: join(app, "src/watch.ts"),
  },
  outdir: outDir,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["chrome120", "edge120"],
  sourcemap: true,
  logLevel: "info",
});

console.log(`demo-player (local theater) → ${outDir} (port ${THEATER_PORT})`);
