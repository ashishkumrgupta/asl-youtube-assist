# Extension permissions (Slice A)

| Permission                       | Why                                                                   |
| -------------------------------- | --------------------------------------------------------------------- |
| `storage`                        | Persist overlay toggle in `chrome.storage.session` across SW restarts |
| Host `https://www.youtube.com/*` | Content script on YouTube watch / SPA navigation                      |
| Host `https://youtube.com/*`     | Same site without `www`                                               |

No broader `<all_urls>`, no remote code execution, no clipboard, no identity APIs.
