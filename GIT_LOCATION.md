# Git location

Project store mount (`/cursor/stores/self/workspace/asl-youtube-assist`) cannot host `.git` objects (`EPERM` / `ENOSYS` on this environment).

**Canonical local git repo (init + commits on `main`):**

```
/agent/asl-youtube-assist
```

Use that path for day-to-day git and npm. The store path mirrors source for Project browsing.

```sh
cd /agent/asl-youtube-assist
git log -1
npm test
npm run build
```
