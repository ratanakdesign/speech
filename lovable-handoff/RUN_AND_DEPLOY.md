# SpeechSprout — Run and Deploy

---

## Prerequisites

- Node.js 18+ (18.x or 20.x recommended)
- npm 9+

---

## Install Dependencies

```bash
npm install
```

This installs all dependencies including:
- React 19.2.6
- TypeScript 6.0.3
- Vite 8
- Tailwind CSS 3.4
- Framer Motion 12.18.0
- @mediapipe/tasks-vision 0.10.35
- @react-three/fiber 9.6.1 + @react-three/drei + three
- recharts 3.8.1
- lucide-react (icon library, minimal use)

---

## Run Locally

```bash
npm run dev
```

Opens on `http://localhost:5173` by default.

**Browser requirements:**
- Modern Chrome, Firefox, or Safari (2022+)
- For real microphone: HTTPS or localhost (getUserMedia restriction)
- For webcam: HTTPS or localhost
- `localhost` is treated as a secure origin — both mic and webcam work

---

## Build for Production

```bash
npm run build
```

Output in `dist/`. Key files:
- `dist/index.html` — SPA entry point
- `dist/assets/index-*.js` — main bundle (~1.6MB pre-gzip, ~464KB gzip)
- `dist/assets/vision_bundle-*.js` — MediaPipe wasm bundle (~135KB gzip)

**Note on bundle size:** The large bundle is primarily Three.js + @react-three/fiber (3D mouth guide) and @mediapipe/tasks-vision. The app loads the MediaPipe `.task` model file (face_landmarker) from Google's CDN at runtime — this file (~29MB) is NOT bundled.

---

## Preview Production Build

```bash
npm run preview
```

Serves the `dist/` folder. Tests production routing.

---

## Deploy to Vercel

### Via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Via Vercel Dashboard
1. Connect GitHub repo to Vercel
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. No environment variables required

### SPA Routing
`vercel.json` in the root handles SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
This ensures all routes serve `index.html` (required for Vite SPA apps).

---

## Deploy to Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Deploy to GitHub Pages

Add to `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // required for GitHub Pages subdirectory
})
```

Then:
```bash
npm run build
# Upload dist/ to gh-pages branch
```

---

## Environment Variables

No environment variables are required. All configuration is hardcoded:
- MediaPipe model URL: `https://storage.googleapis.com/mediapipe-models/...`
- MediaPipe WASM URL: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm`
- No API keys
- No auth tokens
- No database connection strings

---

## Required Packages (full list from package.json)

### Runtime dependencies
```json
{
  "@mediapipe/tasks-vision": "^0.10.35",
  "@react-three/drei": "^10.7.7",
  "@react-three/fiber": "^9.6.1",
  "@types/three": "^0.184.1",
  "framer-motion": "^12.18.0",
  "lucide-react": "^1.14.0",
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "react-is": "^19.2.6",
  "recharts": "^3.8.1",
  "three": "^0.184.0"
}
```

### Dev dependencies
```json
{
  "@eslint/js": "^10.0.1",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.1",
  "autoprefixer": "^10.5.0",
  "eslint": "^10.3.0",
  "eslint-plugin-react-hooks": "^7.1.1",
  "eslint-plugin-react-refresh": "^0.5.2",
  "globals": "^17.6.0",
  "postcss": "^8.5.14",
  "tailwindcss": "^3.4.19",
  "typescript": "^6.0.3",
  "vite": "^8.0.12"
}
```

---

## Notes for Lovable

Lovable uses Vite + React + TypeScript + Tailwind under the hood — this project is already configured for that stack.

When importing into Lovable:
1. The project can be imported from GitHub directly
2. All dependencies in package.json will be installed automatically
3. The `vercel.json` rewrite rule ensures SPA routing works
4. No backend configuration needed — it's a fully static app
5. MediaPipe loads at runtime from CDN, not from the Lovable project files

**Important Lovable note:** The `@mediapipe/tasks-vision` package uses WebAssembly. Lovable's preview environment may have restrictions on WASM. Use **Demo Mode** (toggle on landing page) to test the app without requiring real microphone or webcam access.

---

## Microphone / Camera in Development

Both mic and webcam require a **secure context**:
- `http://localhost:*` is always a secure context ✅
- `https://` is a secure context ✅
- `http://192.168.x.x:*` (LAN) is NOT secure — webcam/mic will be blocked ❌

For LAN testing, use:
```bash
vite --host --https  # Self-signed cert for LAN HTTPS
```

Or use ngrok/localtunnel for a public HTTPS URL.
