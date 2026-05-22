# SpeechSprout — Project File Tree

```
speech/
├── index.html                     # Vite HTML entry point
├── package.json                   # Dependencies (see RUN_AND_DEPLOY.md)
├── tailwind.config.js             # Tailwind config
├── vite.config.ts                 # Vite build config
├── tsconfig.json                  # TypeScript config
├── vercel.json                    # SPA routing rewrite for Vercel

├── public/
│   └── (static assets)

└── src/
    ├── main.tsx                   # React entry point — mounts <App /> into #root
    ├── index.css                  # Tailwind directives (@base, @components, @utilities)

    ├── App.tsx                    # ⭐ Root component
    │                              # - Page routing via AppPage state
    │                              # - Mobile container (max-w-[430px])
    │                              # - Owns: page, isDemoMode, selectedModule, selectedTarget, currentSession
    │                              # - Reads/writes child+sessions via useSessions hook

    ├── types/
    │   └── index.ts               # ⭐ All TypeScript types
    │                              # AppPage, AgeRange, FeedbackMode, VisibilityLevel,
    │                              # TherapyStage, PlantStage, DifficultyRating,
    │                              # ChildProfile, SpeechTarget, MapModule,
    │                              # PracticeAttempt, PracticeSession

    ├── pages/
    │   ├── WelcomePage.tsx        # ⭐ Landing screen — brand, CTAs, disclaimer
    │   ├── ChildSetupPage.tsx     # ⭐ First-time setup — nickname + age range form
    │   ├── LearningMapPage.tsx    # ⭐ Adventure map — circular nodes, winding path,
    │   │                          #   bottom sheet on tap, module preview + CTA
    │   ├── PracticePage.tsx       # ⭐ Core game loop — word bubble, plant, voice/webcam
    │   ├── SessionCompletePage.tsx # ⭐ Post-session — child celebration, parent accordion
    │   ├── SeeTheSoundPage.tsx    # 3D articulation guide — mouth model + instructions
    │   ├── ParentDashboardPage.tsx # Parent progress view — stats, chart, target history
    │   ├── ClinicianSummaryPage.tsx # Copyable SLP report
    │   ├── ModuleIntroPage.tsx    # (Legacy) Full-page module intro — NOT in active routing
    │   └── TargetSelectionPage.tsx # (Legacy) Old target picker — NOT in active routing

    ├── components/
    │   ├── PlantIllustration.tsx  # ⭐ SVG plant at 5 stages (0=seed, 4=bloom)
    │   ├── WaterDrops.tsx         # ⭐ Row of 5 💧 progress indicators
    │   ├── WaveformViz.tsx        # ⭐ 24-bar animated audio waveform
    │   ├── VoiceWateringInteraction.tsx # ⭐ Child-facing audio UI — mic, drops, waveform
    │   ├── AudioAttemptPanel.tsx  # (Legacy) Technical audio panel — replaced by VoiceWatering
    │   ├── ScoreRing.tsx          # SVG circular progress ring (label: "shape" or "hold")
    │   ├── FeedbackBubble.tsx     # Rep-complete message card (success variant)
    │   ├── DisclaimerBanner.tsx   # Amber disclaimer banner (landing page)
    │   ├── TargetBadge.tsx        # Pill badges — feedback mode + visibility level
    │   ├── ProgressChart.tsx      # recharts LineChart for parent dashboard
    │   └── three/
    │       └── MouthScene.tsx     # ⭐ 3D mouth model — @react-three/fiber canvas
    │                              # MouthSceneCanvas (exported)
    │                              # MouthModel, RoundMesh (lips), Tongue, HighlightBump

    ├── hooks/
    │   ├── useAudioAnalysis.ts    # ⭐ Web Audio API — volume, waveform, attempt detection
    │   │                          # Real mic + demo simulation modes
    │   ├── useFaceLandmarks.ts    # ⭐ MediaPipe Face Landmarker — webcam + metrics
    │   │                          # Returns: videoRef, canvasRef, metrics, status
    │   ├── useDemoMode.ts         # ⭐ Simulated mouth metrics + visual score oscillation
    │   ├── useSessions.ts         # ⭐ Child profile + sessions state — wraps localStorage
    │   └── useAudioDetection.ts   # (Legacy) Old audio hook — replaced by useAudioAnalysis

    ├── lib/
    │   ├── geometry.ts            # ⭐ computeMouthMetrics() — landmark → MouthMetrics
    │   │                          # distance() helper
    │   ├── scoring.ts             # ⭐ computeLipRoundingScore() — visual feedback score
    │   │                          # LIP_ROUNDING_THRESHOLD=55, HOLD_DURATION_MS=2000
    │   ├── storage.ts             # ⭐ localStorage CRUD — saveChild/loadChild/saveSessions/etc
    │   ├── summaries.ts           # ⭐ generateClinicianSummary() — formatted report text
    │   └── geometry.ts            # (duplicate note — one file, listed once)

    └── data/
        ├── mapModules.ts          # ⭐ MAP_MODULES array — 5 modules with all config
        │                          # getModuleById(), getModuleByTargetId()
        ├── speechTargets.ts       # ⭐ SPEECH_TARGETS array — 6 IPA targets with full metadata
        │                          # getTargetById()
        └── articulationGuides.ts  # ⭐ ARTICULATION_GUIDES — per-target 3D scene config
                                   # + child instruction + parent cue + isInvisibleToCamera
```

---

## Key Files (highest importance for Lovable)

1. `src/types/index.ts` — all data shapes
2. `src/App.tsx` — routing and mobile container
3. `src/data/mapModules.ts` — 5 module definitions with words + colors
4. `src/data/speechTargets.ts` — 6 targets with IPA, visibility, feedbackMode
5. `src/pages/LearningMapPage.tsx` — entire map experience including bottom sheet
6. `src/pages/PracticePage.tsx` — entire game loop
7. `src/components/VoiceWateringInteraction.tsx` — audio UX
8. `src/hooks/useAudioAnalysis.ts` — Web Audio API hook
9. `src/lib/geometry.ts` + `src/lib/scoring.ts` — visual scoring pipeline

---

## Files that are legacy / not in active routing

- `src/pages/ModuleIntroPage.tsx` — replaced by bottom sheet inside LearningMapPage
- `src/pages/TargetSelectionPage.tsx` — old pre-map target picker
- `src/components/AudioAttemptPanel.tsx` — replaced by VoiceWateringInteraction
- `src/hooks/useAudioDetection.ts` — replaced by useAudioAnalysis

These files exist but are not imported anywhere in the active routing. They can be ignored or deleted in Lovable.

---

## Configuration Files

### `vercel.json`
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
Ensures SPA routing works on Vercel (all paths serve index.html).

### `vite.config.ts`
Standard `@vitejs/plugin-react` setup. No special configuration required.

### `tailwind.config.js`
Standard Tailwind v3 config. Content paths: `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`. No custom theme extensions beyond defaults.
