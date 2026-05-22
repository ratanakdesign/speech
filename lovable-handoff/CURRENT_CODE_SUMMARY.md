# SpeechSprout — Current Code Summary

Status as of: May 2025 (post-redesign build)

---

## What Works

### Core user flow
- ✅ Landing page → child setup → adventure map (full navigation)
- ✅ Returning user routing: loads from localStorage, opens map directly
- ✅ Module bottom sheet: tap node → sheet slides up → "Let's go!" → practice
- ✅ Practice game: 5-attempt loop with word cycling
- ✅ Session complete: celebration → parent accordion → back to map
- ✅ Parent dashboard: session stats, completion rate, day streak
- ✅ Clinician summary: formatted report, copy to clipboard
- ✅ See the Sound: 3D mouth guide with orbit controls

### Audio
- ✅ Real microphone via Web Audio API
- ✅ Volume measurement and 32-bin waveform
- ✅ Attempt detection (sustained volume threshold 22 for 400ms)
- ✅ Spectral centroid and HF energy computation (stored, not displayed)
- ✅ Demo simulation mode (sine wave, auto-fires at 2400ms)
- ✅ VoiceWateringInteraction: pulsing mic, ring animations, water drop burst
- ✅ Permission denied error state

### Visual/webcam
- ✅ MediaPipe Face Landmarker (dynamic import, GPU delegate)
- ✅ Lip rounding score computation (roundness + stability + symmetry)
- ✅ Hold duration detection (2000ms above threshold)
- ✅ Canvas overlay (orange dots and outline on mouth region)
- ✅ Demo mode simulation (useDemoMode oscillation)
- ✅ Camera error/no-face handling

### Persistence
- ✅ Child profile saved to localStorage
- ✅ Sessions array saved to localStorage
- ✅ Sessions accumulate across visits
- ✅ Clear practice data button works

### Design
- ✅ Mobile-first container (max-w-[430px], phone frame on desktop)
- ✅ Framer Motion spring physics on all interactions
- ✅ Adventure map: circular nodes, winding path, zigzag positioning
- ✅ Bottom sheet with module preview and grown-up accordion
- ✅ AnimatePresence on word transitions
- ✅ AnimatePresence on plant stage transitions
- ✅ WaveformViz with staggered idle breathing per bar
- ✅ Water drop burst on voice attempt
- ✅ Session complete: stars stagger in, parent content collapsed

### Safety
- ✅ Audio-only targets (/s/, /k/) never show webcam
- ✅ Disclaimer banners on landing, map, session complete, SeeTheSound
- ✅ Clinician summary framed as "home practice behaviour only"
- ✅ No clinical scoring language in child-facing UI
- ✅ "shape" (not "accuracy/score") as the visual metric label

---

## What Is Incomplete

### Known functional gaps

1. **No multi-child support:** Single child profile per device. If a family has multiple children with different targets, they must clear data and start over. There is no profile-switching.

2. **No module unlocking logic:** Modules 3–5 are hardcoded as `unlocked: false, comingSoon: true`. There is no mechanism to unlock them. A parent/clinician would need code changes to enable them.

3. **Stars computation is per-session, not cumulative best:** `computeModuleProgress()` takes the max starsEarned across sessions. But stars per session are based on `rewardsEarned` (completed attempts). A child who always completes 5/5 will always show 3 stars, but the logic is simplistic.

4. **No offline PWA support:** The app requires network for MediaPipe model loading from CDN. No service worker or local model caching.

5. **No export/share of clinician summary:** The summary is copy-to-clipboard only. No email integration, no PDF, no shareable link.

6. **Audio-only targets have no hold requirement:** Visual targets require the mouth shape to be held for 2000ms. Audio targets just require volume above threshold for 400ms. This is much easier. A child who just makes any loud noise will complete audio-only reps.

7. **See the Sound returns to a fresh Practice:** If a child goes to the 3D guide mid-practice and comes back, the practice page remounts from scratch (attempt 1, stage 0). This is because navigating away unmounts the component.

8. **useDemoMode is standalone from useAudioAnalysis:** The visual demo simulation (useDemoMode) and audio demo simulation (useAudioAnalysis with simulateAttempts=true) are separate hooks. They don't synchronize. In demo mode for visual targets, both run independently.

---

## What Is Mocked

1. **MediaPipe model:** Loaded from Google's public CDN. In production, this should be bundled or hosted locally. Currently depends on external network access.

2. **Demo face tracking:** The `useDemoMode` hook simulates realistic-ish mouth metrics with sine waves, but it's entirely synthetic. No real facial geometry.

3. **Demo audio:** The `useAudioAnalysis(enabled, true)` simulation uses sine waves and random noise. It's designed to look like a real waveform but isn't capturing audio.

4. **Clinician summary observation language:** The paragraph in the clinician summary (e.g., "Ava completed most attempts and demonstrated consistent effort") is formula-generated from completion rate. It is not reviewed by a clinician and should not be mistaken for clinical observation.

5. **Day streak logic:** The streak counts calendar days with sessions, with a ±1.5× day tolerance for off-by-one timezone issues. Not rigorously tested across all timezones.

6. **Plant stages:** The 5-stage plant is a simplified SVG illustration. It's charming and purposeful but not a botanically accurate growth sequence.

---

## What Is Real

- Web Audio API microphone capture (production-grade)
- MediaPipe Face Landmarker (production-grade ML model, Google)
- Framer Motion spring physics (real physics parameters)
- localStorage persistence (works across sessions, no server)
- Attempt detection algorithm (volume threshold + duration gate)
- Lip rounding scoring (real geometry from face landmarks)

---

## Known Bugs / Issues

### Bug 1: /p/ target uses wrong visual scoring
**Severity:** Medium  
**Description:** The Lip Pop Garden module (targetId: "p") uses `computeLipRoundingScore()` which was designed for lip rounding (/oo/). For /p/, the correct metric is lip closure (mouthOpening ≈ 0, not high roundnessRatio). Currently, a child making the /p/ mouth shape (lips pressed together) would score low or zero because the lips are closed (mouthOpening → 0) and the function penalizes this.  
**Workaround:** Demo mode still works. Real webcam mode for /p/ gives poor/random feedback.  
**Fix needed:** Add a `computeLipClosureScore()` function for bilabial stops.

### Bug 2: See the Sound back button starts practice fresh
**Severity:** Low  
**Description:** If a child is in mid-practice (say, attempt 3), taps "👁 Guide", views the 3D guide, then taps "Back", the practice page remounts at attempt 1. All previous attempt state is lost.  
**Workaround:** `SeeTheSoundPage.onBack()` navigates to "practice" page, which remounts PracticePage with the same key. The session is lost.  
**Fix needed:** Either (a) persist practice state in App.tsx state (not just local component state), or (b) make SeeTheSound an overlay within Practice rather than a separate page.

### Bug 3: Demo mode audio never resets between words
**Severity:** Low  
**Description:** In audio demo mode, `isAttemptDetected` stays `true` after the first 2400ms. `resetAttempt()` sets it back to `false`, but the next trigger also fires at 2400ms from the original activation time (not reset per word). This can cause fast consecutive auto-completions.  
**Impact:** Demo mode flow can feel slightly rushed after word 1.

### Bug 4: Bottom sheet z-index on some Android browsers
**Severity:** Low  
**Description:** Fixed-position elements inside a `transform`-applying ancestor can misbehave. The `max-w-[430px]` container uses `overflow-hidden` which creates a new stacking context. The fixed bottom sheet works on modern browsers but may fail to render above on some older Androids.  
**Workaround:** Confirmed working on iOS Safari, Chrome desktop, and Chrome Android (modern).

---

## Recommended Next Changes

**Priority 1 (critical for product quality):**
1. Fix /p/ visual scoring — implement `computeLipClosureScore()` for bilabial stops
2. Make See the Sound an overlay (not navigation) to preserve practice state

**Priority 2 (UX improvement):**
3. Add a "Try again without navigating away" option if camera fails
4. Add parent ability to unlock additional modules via a settings screen
5. Persist practice state in App.tsx so navigation doesn't lose progress

**Priority 3 (product expansion):**
6. Multi-child profile support
7. PWA with offline model caching
8. Email/PDF export of clinician summary
9. More modules (Tooth Breeze Trail, Snake Sound Meadow unlock)
10. Age-differentiated word lists (simpler words for 3–5, harder for 9–12)
