#!/usr/bin/env node
/**
 * Local theater static server — binds ONLY 127.0.0.1:4173 and stays running.
 * Matches extension host_permissions (`http://127.0.0.1:4173/*`).
 *
 * Replaces flaky `npx serve` listen forms that can exit or silent-switch ports.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = 4173;
const ORIGIN = `http://${HOST}:${PORT}`;

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = join(root, "apps/demo-player/dist");

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
  ".vtt": "text/vtt; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0] ?? "/");
  const cleaned = decoded.replace(/\\/g, "/");
  const relative = cleaned === "/" ? "index.html" : cleaned.replace(/^\//, "");
  // Extensionless clean URLs: /watch → watch.html (query preserved by caller)
  const withExt =
    extname(relative) === "" && !relative.endsWith("/")
      ? `${relative}.html`
      : relative.endsWith("/")
        ? join(relative, "index.html")
        : relative;
  const candidate = resolve(base, withExt);
  const baseWithSep = base.endsWith(sep) ? base : base + sep;
  if (candidate !== base && !candidate.startsWith(baseWithSep)) {
    return null;
  }
  return candidate;
}

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  if (body !== undefined) res.end(body);
  else res.end();
}

function serveFile(req, res, filePath) {
  let stat;
  try {
    stat = statSync(filePath);
  } catch {
    send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
    return;
  }
  if (!stat.isFile()) {
    send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
    return;
  }

  const type = MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
  const size = stat.size;
  const range = req.headers.range;

  if (range && /^bytes=/.test(range)) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!m) {
      send(res, 416, { "Content-Range": `bytes */${size}` });
      return;
    }
    let start = m[1] === "" ? 0 : Number(m[1]);
    let end = m[2] === "" ? size - 1 : Number(m[2]);
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
      send(res, 416, { "Content-Range": `bytes */${size}` });
      return;
    }
    end = Math.min(end, size - 1);
    res.writeHead(206, {
      "Content-Type": type,
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    });
    createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Type": type,
    "Content-Length": size,
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-cache",
  });
  createReadStream(filePath).pipe(res);
}

if (!existsSync(dist)) {
  console.error(
    `demo-player dist missing: ${dist}\nRun: npm run build -w @asl/demo-player`,
  );
  process.exit(1);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", ORIGIN);
  const filePath = safeJoin(dist, normalize(url.pathname));
  if (!filePath) {
    send(res, 403, { "Content-Type": "text/plain; charset=utf-8" }, "Forbidden");
    return;
  }
  // Prefer exact file, else try .html clean URL already applied in safeJoin
  if (existsSync(filePath)) {
    serveFile(req, res, filePath);
    return;
  }
  send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
});

server.on("error", (err) => {
  if (err && /** @type {NodeJS.ErrnoException} */ (err).code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use on ${HOST}.\n` +
        `Stop the other process, then re-run: npm run demo\n` +
        `Open ONLY ${ORIGIN}/ (127.0.0.1 — required for extension injection).`,
    );
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Local theater (open this URL): ${ORIGIN}/`);
  console.log(`Serving ${dist}`);
  console.log("Server running — press Ctrl+C to stop.");
});

function shutdown() {
  server.close(() => process.exit(0));
  // Force-exit if close hangs (open keep-alive connections)
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
