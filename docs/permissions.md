# Extension permissions (SEC-1)

| Permission                                  | Why                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `storage`                                   | Session keys only: overlay toggle + language pair id (`chrome.storage.session`) |
| Host `https://www.youtube.com/*`            | Content script + tab messaging on YouTube                                       |
| Host `https://youtube.com/*`                | Same site without `www`                                                         |
| `web_accessible_resources` → `lexical/**/*` | Packaged clip/fingerspell media for page context when pack bound                |

No `<all_urls>`, no remote code, no clipboard/identity APIs, no caption exfil endpoints.

See also: [`security.md`](security.md), [`performance.md`](performance.md).
