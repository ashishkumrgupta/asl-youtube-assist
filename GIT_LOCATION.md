# Git location + portable restore

Project store mount (`/cursor/stores/self/workspace/asl-youtube-assist`) cannot host `.git` objects (`EPERM` / `ENOSYS`). The VM tree `/agent/asl-youtube-assist` is **ephemeral**.

## Durable artifacts (Project store)

| Artifact                      | Path                                                       |
| ----------------------------- | ---------------------------------------------------------- |
| **Git bundle (full history)** | `/cursor/stores/self/workspace/asl-youtube-assist.bundle`  |
| Source tarball (no git)       | `/cursor/stores/self/workspace/asl-youtube-assist-src.tgz` |
| Source mirror (browse)        | `/cursor/stores/self/workspace/asl-youtube-assist/`        |

## Restore

```sh
cd /cursor/stores/self/workspace
git clone asl-youtube-assist.bundle asl-youtube-assist
cd asl-youtube-assist
git log --oneline
npm install
npm test
npm run build
```

`git bundle verify` on the `.bundle` reports a complete history. Tip branch: `cursor/scale-security-harden-95ae` (v0.5.1 — security-check in GitHub Actions).
