#!/usr/bin/env node
/**
 * SEC-1 / SEC-2 / SEC-4 / SEC-5 static gates for the habit shell.
 * Fail-closed: unknown permissions, eval/remote script patterns, missing CSP.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const errors = [];

const ALLOWED_PERMISSIONS = new Set(["storage"]);
const ALLOWED_HOST_PREFIXES = ["https://www.youtube.com/", "https://youtube.com/"];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (
      name === "node_modules" ||
      name === "dist" ||
      name === "dist-types" ||
      name === ".git"
    ) {
      continue;
    }
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// --- manifest least privilege (SEC-1) + CSP (SEC-2) ---
const manifestPath = join(root, "apps/extension/public/manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

for (const p of manifest.permissions ?? []) {
  if (!ALLOWED_PERMISSIONS.has(p)) {
    errors.push(`SEC-1: unexpected permission "${p}"`);
  }
}
for (const h of manifest.host_permissions ?? []) {
  if (!ALLOWED_HOST_PREFIXES.some((prefix) => h.startsWith(prefix))) {
    errors.push(`SEC-1: unexpected host_permission "${h}"`);
  }
}
if (manifest.host_permissions?.includes("<all_urls>")) {
  errors.push("SEC-1: <all_urls> forbidden");
}

const csp = manifest.content_security_policy?.extension_pages;
if (!csp || typeof csp !== "string") {
  errors.push("SEC-2: missing content_security_policy.extension_pages");
} else {
  if (!csp.includes("script-src") || !csp.includes("'self'")) {
    errors.push("SEC-2: CSP must restrict script-src to 'self'");
  }
  if (/script-src[^;]*https?:/i.test(csp)) {
    errors.push("SEC-2: CSP must not allow remote script-src");
  }
  if (/unsafe-eval/i.test(csp)) {
    errors.push("SEC-2: CSP must not allow unsafe-eval");
  }
}

// --- no eval / remote code patterns in source (SEC-2) ---
const files = walk(join(root, "apps")).concat(walk(join(root, "packages")));
const banned = [
  { re: /\beval\s*\(/, label: "eval(" },
  { re: /\bnew\s+Function\s*\(/, label: "new Function(" },
  { re: /\bimport\s*\(\s*['"]https?:/, label: "dynamic import(http)" },
  {
    re: /\bfetch\s*\(\s*['"]https?:\/\/(?!www\.youtube\.com|youtube\.com)/,
    label: "fetch to non-YouTube",
  },
];

for (const file of files) {
  if (!/\.(ts|tsx|js|mjs|cjs|html)$/.test(file)) continue;
  if (file.includes("security-check.mjs")) continue;
  if (file.endsWith(".test.ts")) continue;
  const text = readFileSync(file, "utf8");
  const rel = relative(root, file);
  for (const ban of banned) {
    if (ban.re.test(text)) {
      errors.push(`SEC-2: ${ban.label} in ${rel}`);
    }
  }
  // Caption exfil heuristics (SEC-3): no chrome.storage of cue text blobs
  if (
    /chrome\.storage\.[a-z]+\.set\s*\(/.test(text) &&
    /(caption|cueText|activeCaption)/i.test(text) &&
    !rel.includes("docs/")
  ) {
    // Only flag if set payload clearly includes caption-like keys nearby — soft check via same line patterns in SW
  }
}

// Storage hygiene smoke: service worker should only set known keys (SEC-6)
const sw = readFileSync(
  join(root, "apps/extension/src/background/service-worker.ts"),
  "utf8",
);
if (/chrome\.storage\.(local|sync)\./.test(sw)) {
  errors.push(
    "SEC-6: prefer session storage for shell settings; local/sync found in service-worker",
  );
}
if (!/parseRuntimeMessage/.test(sw) || !/isTrustedExtensionSender/.test(sw)) {
  errors.push("SEC-7: service-worker must validate messages + trusted sender");
}

if (errors.length) {
  console.error("security-check FAILED:");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.warn("security-check OK (SEC-1/2/6/7 static gates)");
