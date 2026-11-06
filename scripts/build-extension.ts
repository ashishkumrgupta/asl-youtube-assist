import * as esbuild from "esbuild";
import { execSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const extRoot = join(root, "apps/extension");
const outDir = join(extRoot, "dist");
const publicDir = join(extRoot, "public");

function gitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
  } catch {
    return "local";
  }
}

const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
  .version as string;
const sha = gitSha();
const builtAt = new Date().toISOString();

mkdirSync(outDir, { recursive: true });
mkdirSync(join(outDir, "icons"), { recursive: true });

// Copy static assets
cpSync(join(publicDir, "popup.html"), join(outDir, "popup.html"));
cpSync(join(publicDir, "popup.css"), join(outDir, "popup.css"));

const manifest = JSON.parse(readFileSync(join(publicDir, "manifest.json"), "utf8")) as {
  version: string;
};
manifest.version = version;
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

// Icons (generated PNGs)
const iconDir = join(extRoot, "assets/icons");
for (const size of [16, 32, 48, 128]) {
  const src = join(iconDir, `icon${size}.png`);
  if (existsSync(src)) {
    copyFileSync(src, join(outDir, "icons", `icon${size}.png`));
  }
}

writeFileSync(
  join(outDir, "BUILD_INFO.json"),
  JSON.stringify({ version, gitSha: sha, builtAt }, null, 2),
);

const buildInfoBanner = `const __ASL_BUILD__ = ${JSON.stringify({ version, gitSha: sha, builtAt })};`;

const sharedOptions: esbuild.BuildOptions = {
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["chrome120", "edge120"],
  sourcemap: true,
  logLevel: "info",
  banner: { js: buildInfoBanner },
};

await esbuild.build({
  ...sharedOptions,
  entryPoints: [join(extRoot, "src/background/service-worker.ts")],
  outfile: join(outDir, "service-worker.js"),
});

await esbuild.build({
  ...sharedOptions,
  entryPoints: [join(extRoot, "src/content/content-script.ts")],
  outfile: join(outDir, "content-script.js"),
});

await esbuild.build({
  ...sharedOptions,
  entryPoints: [join(extRoot, "src/ui/popup.ts")],
  outfile: join(outDir, "popup.js"),
});

console.warn(`[build-extension] wrote ${outDir} version=${version} sha=${sha}`);
