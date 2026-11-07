# Extension permissions (SEC-1)

| Permission                                  | Why                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `storage`                                   | Session keys only: overlay toggle + language pair id (`chrome.storage.session`) |
| Host `https://www.youtube.com/*`            | Content script + tab messaging on YouTube                                       |
| Host `https://youtube.com/*`                | Same site without `www`                                                         |
| Host `http://127.0.0.1:4173/*`              | Local demo theater only (`npm run demo`) — same assist overlay path as YouTube  |
| `web_accessible_resources` → `lexical/**/*` | Packaged clip/fingerspell media for page context when pack bound                |

No `<all_urls>`, no remote code, no clipboard/identity APIs, no caption exfil endpoints.

## Local theater host (rationale)

- **Pinned origin:** `http://127.0.0.1:4173/*` matches the documented static server from `npm run demo` / `npm run demo:player` (`serve -l tcp://127.0.0.1:4173`).
- **Not** `http://127.0.0.1:*/*`, **not** `localhost`, **not** LAN IPs — least privilege for offline owner testing only.
- Open **`http://127.0.0.1:4173/`** only. `http://localhost:4173/` is a different Chrome origin and will **not** receive the content script.
- YouTube host permissions are **unchanged** and remain required for the live product path.
- Captions on the theater stay local in the page/content script (SEC-3); no upload.

See also: [`security.md`](security.md), [`performance.md`](performance.md), [`build-and-reload.md`](build-and-reload.md).
