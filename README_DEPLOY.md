# Deploying MouthMetrics to GitHub (`speech` repo) and Vercel

---

## Step 1 — Add files to the `speech` GitHub repo

### Option A: Local git (recommended)

```bash
# Unzip the export somewhere on your machine
unzip mouthmetrics-clean-export.zip -d mouthmetrics

cd mouthmetrics

# Initialise a fresh git repo
git init
git add .
git commit -m "Add MouthMetrics prototype"

# Point it at your speech repo (already created on GitHub)
git remote add origin https://github.com/ratanakdesign/speech.git

# Push as main
git push -u origin main
```

> If GitHub says "refusing to merge unrelated histories" (because the repo was
> created with a README), run this first:
> ```bash
> git pull origin main --allow-unrelated-histories
> # Resolve any conflicts (usually just the README), then:
> git push origin main
> ```

---

### Option B: GitHub web UI (no terminal needed)

1. Go to https://github.com/ratanakdesign/speech
2. Click **"uploading an existing file"** (or drag-and-drop)
3. Unzip `mouthmetrics-clean-export.zip` on your machine
4. Drag the entire unzipped folder's contents into the GitHub uploader
5. Commit with message: `Add MouthMetrics prototype`

> **Limitation:** GitHub's web uploader skips hidden files like `.gitignore`.
> After uploading, create `.gitignore` manually via the web editor using the
> content from the included `.gitignore` file.

---

## Step 2 — Install dependencies and verify locally

```bash
cd speech          # or whatever you named the folder
npm install
npm run build      # should complete with no errors
npm run dev        # open http://localhost:5173 to verify
```

---

## Step 3 — Deploy on Vercel

### First deploy

1. Go to https://vercel.com and sign in with your GitHub account
2. Click **"Add New Project"**
3. Import your `speech` repository from the list
4. Vercel auto-detects Vite — confirm these settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**

### Environment variables

None required. MouthMetrics has no backend and loads MediaPipe from CDN.

### Subsequent deploys

Every push to `main` triggers an automatic redeploy. No manual steps needed.

---

## Step 4 — Browser requirements for live tracking

| Browser | Status |
|---|---|
| Chrome / Edge (desktop) | ✅ Full GPU-accelerated tracking |
| Firefox (desktop) | ✅ Works (CPU fallback, slightly slower) |
| Safari 16.4+ (macOS) | ✅ Works |
| Mobile browsers | ⚠️ Camera may work; GPU delegate may fall back to CPU |

The app automatically falls back to **Demo Mode** if:
- Camera permission is denied
- The MediaPipe model fails to download (e.g. offline or CDN blocked)

---

## Notes

- `package-lock.json` is **not included** in this export. Run `npm install`
  to generate a fresh one from `package.json`.
- The `node_modules/` folder is excluded — `npm install` will recreate it.
- No `.env` file is needed.
