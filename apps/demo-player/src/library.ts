/**
 * Local theater library — intentional clip list for owner extension testing.
 * Extension injects overlay on watch pages; this page is browse-only.
 * Thumbs are static (no <video>) so content-script video discovery stays clean.
 */
import { THEATER_DEMOS, brandCopy, watchHref } from "./catalog.js";

const grid = document.getElementById("demo-grid");
const brand = document.getElementById("brand-label");
const honesty = document.getElementById("brand-honesty");
const copy = brandCopy();

if (brand) brand.textContent = copy.label;
if (honesty) {
  honesty.textContent = `${copy.honesty} Captioned fixtures for offline sideload — not a YouTube replacement.`;
}

if (grid) {
  grid.innerHTML = "";
  for (const demo of THEATER_DEMOS) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.className = "demo-row";
    link.href = watchHref(demo.id);
    link.setAttribute("aria-label", `Watch ${demo.title}`);

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.dataset.demoId = demo.id;
    const index = document.createElement("span");
    index.className = "thumb-index";
    index.textContent = demo.id;
    thumb.append(index);

    const copyBlock = document.createElement("div");
    copyBlock.className = "demo-copy";
    const h2 = document.createElement("h2");
    h2.textContent = demo.title;
    const p = document.createElement("p");
    p.textContent = `${demo.blurb} · ${demo.durationSec}s · captions on`;
    copyBlock.append(h2, p);

    link.append(thumb, copyBlock);
    li.append(link);
    grid.append(li);
  }
}
