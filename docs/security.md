# Security-by-design (habit shell)

**Business bars:** Project `internal/business/scale-security-scope.md` **SEC-1…SEC-7**.  
Static gate: `npm run security-check` (`scripts/security-check.mjs`).

## SEC-1 — Least privilege

| Permission                                                               | Why                                          |
| ------------------------------------------------------------------------ | -------------------------------------------- |
| `storage`                                                                | Session toggle + language pair id only       |
| `host_permissions`: `https://www.youtube.com/*`, `https://youtube.com/*` | Inject content script + message YouTube tabs |

No `<all_urls>`, no tabs/history/cookies. Changelog/PR must list any permission change.

## SEC-2 — No remote code + CSP

- Manifest `content_security_policy.extension_pages`: `script-src 'self'; object-src 'self'; frame-ancestors 'none'`
- CI forbids `eval(`, `new Function(`, remote `import()`, `unsafe-eval` in CSP
- Extension pages load only packaged scripts (esbuild bundle)

## SEC-3 — Privacy (captions / watch context)

- Captions, titles, DOM text are **sensitive by default**
- Processed **locally** in the content script
- **No** default network egress of captions to Project servers (none exist)
- Logs: version/sha only — never full caption streams
- Any future network path requires disclosure + minimize + Deaf-user/Business review

## SEC-4 — Secrets

No API keys or tokens in repo / extension package. Client has no secret surface today.

## SEC-5 — Supply chain

- Lockfile committed; `npm run audit` (`--audit-level=high`) in `npm run ci`
- Extension-loaded clip assets are packaged under `lexical/` (when bound); no unsigned remote script

## SEC-6 — Storage hygiene

- `chrome.storage.session` keys only: overlay enabled flag, language pair id
- **No** durable caption archive
- Fail CI if service worker uses `storage.local` / `storage.sync` for shell settings without review

## SEC-7 — Message validation

- `parseRuntimeMessage()` fail-closed shape checks (`@asl/shared-types`)
- Service worker rejects senders where `sender.id !== chrome.runtime.id`
- Pair ids must match `^[a-z]{2}-[a-z]{3}$`
- Overlay assigns caption/UI strings via **`textContent`** (not HTML); captions sanitized (tags/controls stripped, max 500 chars)

## Stop-ship (Business-backed)

SEC-2 / SEC-3 / SEC-4 failures; unexplained broad permissions; silent caption upload; shipping with known critical advisories and no written waiver.

## Claims we refuse

“Bank-grade / certified secure,” “we never touch your data” if a network path later sends captions without disclosure, equating install count with proven capacity.
