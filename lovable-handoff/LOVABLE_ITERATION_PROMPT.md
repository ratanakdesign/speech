# SpeechSprout — Lovable Iteration Prompt (Post-First-Build)

Use this prompt AFTER the initial build from `LOVABLE_BUILD_PROMPT.md` is complete. This prompt focuses on quality improvement across 6 areas.

---

## Context

You have already built SpeechSprout — a speech therapy home-practice app for children. The initial build is functional. This iteration prompt focuses on making it genuinely great, not just functional. The goal is to transform a "working prototype" into an app that feels like it was designed by someone who cares deeply about the experience of a 5-year-old using it.

Do not change the data model, the audio/webcam logic, or the clinical safety rules. Only improve the UI, UX, and product feel.

---

## 1. Mobile-First Learning Map

**Current problem:** The map probably looks too much like a list of cards. It should feel like a game world.

**Required improvements:**

### Node design
- Each node should be a **circle** — not a card, not a rectangle, not a rectangle with rounded corners. A circle. 88px × 88px (`rounded-full`).
- The emoji is the node. It fills the circle. There is no title inside the circle — only the emoji.
- The module name appears **below** the circle in small text (`text-[10px] font-black text-slate-600`)
- Stars (⭐⭐⭐) appear below the name, with unearned stars at 0.18 opacity

### Path design
- The winding path between nodes should be a dashed yellow line, not an arrow or a solid line
- SVG path using cubic beziers: left-to-right curve, then right-to-left, alternating
- `stroke: #FCD34D, strokeWidth: 4, strokeDasharray: "7 5", strokeLinecap: round`

### Node positioning (zigzag)
```
Node 0: self-start ml-[10%]    (left)
Node 1: self-end mr-[10%]      (right)
Node 2: self-start ml-[10%]    (left)
Node 3: self-end mr-[10%]      (right)
Node 4: self-center            (center)
```

### Current module pulse
The current module (first incomplete unlocked one) should pulse:
- Two concentric rings expanding outward from the node circle
- Ring 1: scale 1→1.4, opacity 0.7→0, 1.6s infinite
- Ring 2: scale 1→1.7, opacity 0.4→0, 1.6s infinite, delay 0.5s

### Module tap → bottom sheet (NOT page navigation)
- Tapping a node opens a bottom sheet FROM THE BOTTOM with AnimatePresence
- Spring physics: stiffness 380, damping 38
- Sheet has: emoji tile, module name, word chips, "Let's go!" CTA, collapsed "Grown-up details" accordion
- Semi-transparent backdrop behind the sheet
- **"Let's go!" navigates directly to practice (skip module intro page)**

### Environment decorations
Add non-interactive emoji decorations scattered around the map:
- ☁️ at top right (opacity 0.55)
- 🌻 right side (opacity 0.75)
- 🐸 left side (opacity 0.8)
- 🍄 right side (opacity 0.8)
- 🌿 right side (opacity 0.7)
- ⭐ left side (opacity 0.85)
Use `pointer-events-none select-none` on all decorations.

---

## 2. Child-First Practice Game

**Current problem:** The practice screen shows the camera too prominently. Children shouldn't see a webcam feed as the main element — they should see the word and the plant.

**Required improvements:**

### Layout (strict order, top to bottom):
1. **Word bubble — HERO** (must be the biggest thing)
   - White pill/bubble: `rounded-[2.5rem] bg-white shadow-lg px-10 py-4 border border-orange-100`
   - Word text: `text-5xl font-black text-slate-800 tracking-tight`
   - AnimatePresence spring entrance on word change (scale 0.8→1, y 12→0)

2. **Plant + WaterDrops** (progress reward)
   - White card, always visible
   - PlantIllustration 80px, AnimatePresence spring on stage change
   - WaterDrops below the plant (5 💧, filled = completed attempts)
   - Card flashes green ring on rep complete

3. **Voice interaction** (the game action)
   - For audio targets: VoiceWateringInteraction component (big mic, drops, waveform)
   - For visual targets: compact camera (16:9 aspect, NOT 4:3), ScoreRing "shape", feedback text

4. **Camera placement** (visual targets only)
   - Camera goes BELOW the score ring, in a compact `aspect-ratio: 16/9` container
   - NOT the hero. Not the biggest element.
   - Maximum width: same as content (max-w-sm)

### Child feedback messages (rep complete)
Green card with:
- "Great try! 🌟"
- "Nice one! Keep going! 💧"
- "You did it! 🌱"
- "Brilliant! ⭐"
- "Amazing! Your plant loves it! 🌸"
Rotating through these with `CHILD_FEEDBACK[(attemptNum - 1) % 5]`.

### Remove from child view:
- ❌ "Attempt X of Y" counter
- ❌ Any percentage numbers
- ❌ Technical terms (score, rating, threshold)

---

## 3. Voice-to-Water Audio Interaction

**Current problem:** The audio interaction may feel too technical or not playful enough.

**Required improvements to VoiceWateringInteraction:**

### Mic circle
- 84px circle, `rounded-full`
- Orange-500 by default
- Turns orange-400 with scale pulse when loud (volume > 25)
- Turns green-400 with a bounce when attempt detected
- Emoji inside: 🎤 → 💧 on attempt detected

### Pulse rings (while active/listening)
```tsx
// Ring 1
animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}

// Ring 2 (offset by 0.5s)
animate={{ scale: [1, 1.9], opacity: [0.35, 0] }}
transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
```

### Water drop burst
When `isAttemptDetected` transitions from false → true:
- Spawn 5 water drops (`💧`)
- Each with random x offset (±64px) and random scale (0.7×–1.2×)
- AnimatePresence: y 0 → -110px, opacity 1 → 0, duration 1.1s
- Remove drops from state after 1400ms

### Status text (key-switched with AnimatePresence)
- Idle: "Get ready…" (slate-400)
- Active: `"Say '${currentWord}' out loud!"` (orange-500, font-black)
- Attempt: "Your voice watered the sprout! 💧" (green-600, font-black)

### Waveform (WaveformViz)
- 24 bars
- Idle: each bar breathes at unique rate (period 1.25–2.09s, delay i×0.068s)
- Active: spring height from audio data (stiffness 380, damping 26)
- Colors: slate-200 idle → #F97316 active → #22C55E attempt

---

## 4. Plant Growth Reward Loop

**Current problem:** Plant growth may not feel rewarding enough if it just snaps to the new stage.

**Required improvements:**

### Stage transition animation
Every plant stage change should feel like a moment:
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={plantStage}
    initial={{ scale: 0.6, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.75, opacity: 0 }}
    transition={{ type: "spring", stiffness: 260, damping: 18 }}
  >
    <PlantIllustration stage={plantStage} size={80} />
  </motion.div>
</AnimatePresence>
```

### Card flash on rep complete
The plant card should flash green when a rep completes:
```tsx
const [repFlash, setRepFlash] = useState(false);
// On rep complete:
setRepFlash(true);
setTimeout(() => setRepFlash(false), 900);

// Apply to card:
className={`... ${repFlash ? "ring-4 ring-green-400 ring-offset-2 shadow-green-100" : ""}`}
```

### WaterDrops progress
Each completed attempt fills one drop. Empty drops are grayscale + 25% opacity.
The fills happening should be visible — the `transition-all duration-300` on opacity/scale makes each fill feel satisfying.

---

## 5. Separating Parent/Clinician Views

**Current problem:** Parent and clinician information may be bleeding into child-facing screens.

**Required changes:**

### Session Complete screen (most important)
The screen should be structured as:

**Always visible (child):**
- Animated plant (stage 4, 130px, spring entrance)
- "Your plant grew! 🌱" heading
- Stars (3 ⭐, staggered spring pop-in)
- Attempt count: large orange number + "great tries today!"
- **"Back to Adventure Map 🗺️"** — ONLY primary CTA

**Collapsed by default (parent):**
- Toggle button: "👨‍👩‍👧 Grown-up summary ▼"
- AnimatePresence accordion revealing:
  - Session meta (target name + IPA, attempts, words)
  - Difficulty rating buttons
  - Optional parent note textarea
  - "Save parent note" button
  - "View full progress →" link

**Never show on this screen:**
- ❌ "View Progress 📊" as primary CTA
- ❌ Clinical metrics to child
- ❌ Any score numbers to child

### Adventure Map
- "👨‍👩‍👧 Grown-ups" button (top right, white rounded-full, small)
- Navigates to Parent Dashboard
- Should feel like an "exit" from the child world, not a tab or footer link

### Module bottom sheet
- Child section: just the words and CTA
- Parent section: behind "👨‍👩‍👧 Grown-up details ▼" collapsed accordion
- What's in the accordion: IPA target, feedback mode, mouth tip, disclaimer

---

## 6. Reducing Text and Improving Information Architecture

**Current problem:** Too much text on child-facing screens. Children 3–8 shouldn't need to read much.

**Text reduction rules:**

### Adventure Map
- ✅ Module emoji (text-4xl) — the whole identity of the module
- ✅ Module name (text-[10px]) — short: "Lip Pop Garden"
- ✅ Stars (⭐⭐⭐)
- ❌ Remove module subtitle from node (not needed — it's in the bottom sheet)
- ❌ Remove session count badges from header (clutter)

### Practice screen
- ✅ One word (HERO)
- ✅ Cue text (1 line max): "say it out loud! 🎤"
- ✅ Status: "Your voice watered the sprout! 💧"
- ❌ Remove "Attempt X of Y"
- ❌ Remove score label if possible (or use "shape" not "score")

### Bottom sheet
- ✅ Module name + emoji
- ✅ Word chips (visual, scannable)
- ✅ Big "Let's go!" button
- ✅ Collapsed parent section
- ❌ Long explanatory text in child section

### Session complete (child view)
- ✅ "Your plant grew! 🌱"
- ✅ "Great practice, [target]!"
- ✅ Stars
- ✅ Attempt count + "great tries"
- ❌ "Practice complete" subtitle (redundant)
- ❌ Technical target labels (leave for parent accordion)

---

## Quality Check Questions (before submitting)

For each child-facing screen, ask:
1. Can a 5-year-old understand the main action without reading?
2. Is the most important element visually the biggest?
3. Is there any clinical language visible to the child?
4. Are all interactions spring-physics (not ease/linear)?
5. Does the plant grow in response to voice? Is that connection obvious?
6. Is the camera smaller/less prominent than the voice interaction?
7. Is the parent information hidden by default?
8. Does the map look like a game world, not a menu?
