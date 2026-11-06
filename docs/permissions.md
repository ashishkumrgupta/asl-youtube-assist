# Extension permissions (Phase 0)

| Permission                                  | Why                                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `storage`                                   | Persist overlay toggle in `chrome.storage.session` across SW restarts                          |
| Host `https://www.youtube.com/*`            | Content script on YouTube watch / SPA navigation                                               |
| Host `https://youtube.com/*`                | Same site without `www`                                                                        |
| `web_accessible_resources` → `lexical/**/*` | Reserved for approved clip/fingerspell media once a pack is bound; harmless while pack pending |

No broader `<all_urls>`, no remote code execution, no clipboard, no identity APIs. No AI-persona CDN hosts until coordinator-approved source.
