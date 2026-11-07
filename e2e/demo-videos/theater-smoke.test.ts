/**
 * Local theater smoke — pages serve + caption cues exist.
 * Does not claim signing video; pack remains pending.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { parseSimpleVtt } from "@asl/sync";
import { ASSIST_HONESTY_LINE, ASSIST_LABEL } from "@asl/shared-types";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const dist = join(root, "apps/demo-player/dist");
const fixtures = join(root, "fixtures/demo-videos");

describe("local theater smoke", () => {
  beforeAll(() => {
    execSync("npm run build -w @asl/demo-player", {
      cwd: root,
      stdio: "pipe",
      env: process.env,
    });
  }, 120_000);

  it("builds library + watch pages with honest copy", () => {
    const index = readFileSync(join(dist, "index.html"), "utf8");
    const watch = readFileSync(join(dist, "watch.html"), "utf8");
    expect(index).toContain('data-asl-theater="library"');
    expect(index.toLowerCase()).toContain("local theater");
    expect(index.toLowerCase()).toContain("not an interpreter");
    expect(watch).toContain('data-asl-theater="watch"');
    expect(watch).toContain("data-asl-demo-video");
    expect(watch).toContain('id="asl-demo-track"');
    expect(watch).toContain('kind="captions"');
    expect(watch).toContain("default");
    expect(existsSync(join(dist, "library.js"))).toBe(true);
    expect(existsSync(join(dist, "watch.js"))).toBe(true);
    expect(existsSync(join(dist, "styles.css"))).toBe(true);
    // Clean `/watch?v=` links — serve drops query on `.html` → `/watch` redirects.
    const catalog = readFileSync(join(dist, "library.js"), "utf8");
    expect(catalog).toContain("./watch?v=");
    expect(catalog).not.toContain("watch.html?v=");
  });

  it("ships demo MP4 + VTT into dist/media with parseable cues", () => {
    const manifest = JSON.parse(
      readFileSync(join(fixtures, "manifest.json"), "utf8"),
    ) as { demos: Array<{ id: string; captions: string }> };
    expect(manifest.demos.length).toBeGreaterThanOrEqual(5);
    for (const demo of manifest.demos) {
      const mp4 = join(dist, "media", `${demo.id}.mp4`);
      const vttPath = join(dist, "media", demo.captions);
      expect(existsSync(mp4), mp4).toBe(true);
      expect(existsSync(vttPath), vttPath).toBe(true);
      const cues = parseSimpleVtt(readFileSync(vttPath, "utf8"));
      expect(cues.length, demo.id).toBeGreaterThan(0);
      expect(cues[0]!.text.length).toBeGreaterThan(0);
      expect(cues[0]!.endMs).toBeGreaterThan(cues[0]!.startMs);
    }
  });

  it("keeps assist/partial honesty constants for theater chrome", () => {
    expect(ASSIST_LABEL.toLowerCase()).toContain("assist");
    expect(ASSIST_HONESTY_LINE.toLowerCase()).toContain("partial");
    expect(ASSIST_HONESTY_LINE.toLowerCase()).toContain("pack pending");
    expect(ASSIST_LABEL.toLowerCase()).not.toContain("interpreter");
  });

  it("demo scripts bind 127.0.0.1:4173 (matches host_permissions)", () => {
    const rootPkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const demoPkg = JSON.parse(
      readFileSync(join(root, "apps/demo-player/package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    const serveScript = readFileSync(join(root, "scripts/serve-demo-player.mjs"), "utf8");
    for (const script of [rootPkg.scripts.demo, demoPkg.scripts.demo]) {
      expect(script).toContain("scripts/serve-demo-player.mjs");
      expect(script.toLowerCase()).not.toContain("localhost");
      expect(script).not.toMatch(/\bnpx\b/);
      expect(script).not.toContain("tcp://");
    }
    expect(serveScript).toContain('HOST = "127.0.0.1"');
    expect(serveScript).toContain("PORT = 4173");
    expect(serveScript).toMatch(
      /http:\/\/\$\{HOST\}:\$\{PORT\}|http:\/\/127\.0\.0\.1:4173/,
    );
    // Must not bind the loopback alias Chrome treats as a different origin
    expect(serveScript).not.toMatch(/HOST\s*=\s*["']localhost["']/);
    expect(serveScript).not.toMatch(/\.listen\(\s*PORT\s*,\s*["']localhost["']/);
    const manifest = JSON.parse(
      readFileSync(join(root, "apps/extension/public/manifest.json"), "utf8"),
    ) as { host_permissions: string[] };
    expect(manifest.host_permissions).toContain("http://127.0.0.1:4173/*");
    expect(manifest.host_permissions.some((h) => /localhost/i.test(h))).toBe(false);
  });

  afterAll(() => {
    // dist is gitignored; leave for local `npm run demo` convenience
  });
});
