# Build and reload the extension

Use this after code is on `main` (or whenever you just want a fresh local build). You do not need other git branches for day-to-day testing.

## One-time: get a clean copy of main

In Terminal, from your clone folder (example `~/Downloads/asl-youtube-assist`):

```bash
cd ~/Downloads/asl-youtube-assist
git fetch origin
git checkout -f main
git reset --hard origin/main
```

(`-f` / `--hard` discards local edits so git won’t block you.)

## Every time you want a fresh build

```bash
cd ~/Downloads/asl-youtube-assist
git pull
npm install
npm run build
```

## Reload in Chrome

1. Open `chrome://extensions`
2. Find **ASL YouTube Assist** → click **Reload**
3. Hard-refresh your YouTube tab (Cmd+R)
4. Confirm YouTube site access is ON for both youtube hosts
5. Enable **Show ASL assist overlay** in the popup

Built files live in `apps/extension/dist` — only reload; you usually do not need to “Load unpacked” again unless you removed the extension.

See also [`sideload-checklist.md`](sideload-checklist.md) for the first-time load and honesty checks.
