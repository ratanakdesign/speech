# SpeechSprout — Visual Design Specification

---

## Overall Design Direction

SpeechSprout should feel like a **children's storybook crossed with a mobile game** — warm, playful, and tactile. It is not a clinical dashboard. It is not an adult app with emojis added. Every visual decision should ask: "Would a 6-year-old find this delightful?"

The closest references: early-Duolingo game worlds, Toca Boca color use, Picnic app (playful app metaphors), Lunchclub warmth.

**The opposite of:** Flat clinical dashboards, Material Design defaults, generic "education app" blue-and-white, AI-generated grid layouts.

---

## Layout Principles

### Mobile-first, app-frame on desktop
```css
/* Outer container */
min-h-screen bg-amber-100/70 flex justify-center

/* Inner app frame */
w-full max-w-[430px] min-h-screen bg-white shadow-2xl shadow-amber-200/50
```
On desktop: warm amber background visible outside the 430px frame.
On mobile: fills screen, no frame visible.

### Spacing and rhythm
- Base spacing unit: multiples of 4px (Tailwind default)
- Cards: `p-5` (20px) for standard, `p-6` (24px) for hero cards
- Screen padding: `px-5` (20px horizontal)
- Gap between sections: `gap-4` to `gap-6`
- `py-8` to `py-10` for top-level page padding

### Max content width
- All content inside pages: `max-w-sm` (384px) or `w-full max-w-[430px]`
- Map nodes extend to edges with `ml-[10%]` / `mr-[10%]`

---

## Mobile App Shell

```tsx
<div className="min-h-screen bg-amber-100/70 flex justify-center">
  <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl shadow-amber-200/50 relative overflow-hidden">
    {/* pages */}
  </div>
</div>
```

This is the only architectural change needed vs. a full-screen app. The `overflow-hidden` contains any animated elements. The `shadow-2xl` gives the phone-frame depth on desktop.

---

## Colour Palette

### Page backgrounds
- Main: `bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50` (warm cream)
- Map: `bg-gradient-to-b from-sky-100 via-green-50 to-amber-50` (sky to earth)
- App shell outer: `bg-amber-100/70`

### Brand colours
| Use | Colour | Tailwind |
|-----|--------|---------|
| Primary action | Orange 500 | `#F97316` |
| Hover/active | Orange 600 | `#EA580C` |
| Brand "Speech" | Orange 500 | `text-orange-500` |
| Brand "Sprout" | Green 600 | `text-green-600` |
| Body text | Slate 800 | `text-slate-800` |
| Secondary text | Slate 500/600 | `text-slate-500` |
| Muted/hint | Slate 400 | `text-slate-400` |
| Borders | Orange 100 / Slate 200 | `border-orange-100` / `border-slate-200` |
| Success/completion | Green 500 | `#22C55E` |
| Warning | Amber 500 | `#F59E0B` |
| Clinical/parent | Blue 500 | `#3B82F6` |

### Module colours (each module has its own theme)
| Module | Color | bgColor | borderColor |
|--------|-------|---------|-------------|
| Lip Pop Garden | `#EA580C` | bg-orange-100 | border-orange-300 |
| Round Lips Pond | `#7C3AED` | bg-purple-100 | border-purple-300 |
| Tooth Breeze Trail | `#16A34A` | bg-green-100 | border-green-300 |
| Snake Sound Meadow | `#CA8A04` | bg-yellow-100 | border-yellow-300 |
| Cave Sound Path | `#DC2626` | bg-red-100 | border-red-300 |

---

## Typography Feel

No external fonts. Uses system font stack via Tailwind defaults.

| Use | Classes |
|-----|---------|
| Hero word (practice) | `text-5xl font-black text-slate-800 tracking-tight` |
| Page title | `text-3xl font-black text-slate-800 tracking-tight` |
| Section heading | `text-2xl font-black text-slate-800` |
| Card heading | `text-xl font-black text-slate-800` |
| Module name | `text-sm font-black text-slate-800` |
| Body | `text-sm font-semibold text-slate-600` |
| Small label | `text-xs font-bold text-slate-500` |
| Tiny/legal | `text-[10px] text-slate-400` |
| Number stat | `text-4xl font-black text-orange-500` |

**Principle:** Use `font-black` for anything the child reads. Use `font-semibold` for secondary information. Use `font-bold` for parent/action elements.

---

## Card Styles

### Hero card (landing, session complete)
```
bg-white rounded-3xl shadow-xl shadow-orange-100/60 p-6 border border-orange-100
```

### Standard card (practice components)
```
bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-100/50 p-5
```

### Info/meta card (parent view)
```
bg-white rounded-3xl shadow-md p-4 border border-slate-100
```

### Soft tinted card (stat chips)
```
bg-orange-50 rounded-2xl py-3.5 px-1
bg-amber-50 rounded-2xl ...
bg-green-50 rounded-2xl ...
```

### Bottom sheet
```
bg-white rounded-t-3xl shadow-2xl
```

---

## Map Design

### Philosophy
The map is a game world, not a navigation menu. Nodes should feel like islands or locations you visit, not cards you tap.

### Node anatomy
```
[88px circle, rounded-full]
  Module emoji (text-4xl) centered
  Colored background (module.bgColor)
  Colored border (module.borderColor)
  Box-shadow: 0 6px 20px [module.color]22

[Below circle, centered]
  Module name (text-[10px] font-black, max 80px wide)
  3 star icons (⭐⭐⭐, unearned at opacity 0.18)
```

### Current module indicator
Two rings expanding outward:
```
Ring 1: border-color=module.color, animate scale [1→1.4], opacity [0.7→0], 1.6s infinite
Ring 2: border-color=module.color, animate scale [1→1.7], opacity [0.4→0], 1.6s infinite, delay 0.5s
```

### Completed module badge
```
Absolute top-right: w-6 h-6, bg-green-500, rounded-full, border-2 border-white
Content: "✓" (text-[9px] font-black text-white)
```

### Locked module
```
Opacity 50%, filter grayscale
No tap interaction
🔒 emoji below module emoji
```

### Path connectors
```
SVG, full-width, h-14 (56px)
viewBox="0 0 100 52", preserveAspectRatio="none"
stroke: #FCD34D (amber-300)
strokeWidth: 4
strokeDasharray: "7 5" (dashed)
strokeLinecap: round
opacity: 0.75
```

### Environment elements
Decorative emoji scattered around the map at absolute positions. Low opacity (0.5–0.85), pointer-events-none, select-none. Examples: ☁️🌻🐸🍄🌿⭐. These should feel like part of the world, not UI.

---

## Plant Reward Animation

### PlantIllustration (SVG, 120×120 viewBox)

Stage progression:
- **0 (seed):** Brown ellipse in soil, subtle highlight
- **1 (sprout):** Green stem, 2 small angled leaves
- **2 (small plant):** Taller stem, 4 leaves
- **3 (bud):** Full stem + leaves, orange bud at top with sepals
- **4 (bloom):** 8 orange/amber petals, yellow center, sparkles ✨⭐

Framer Motion wrapper in PracticePage:
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

On rep complete: the plant card flashes a green ring:
```tsx
className={`... transition-all duration-300 ${
  repFlash ? "ring-4 ring-green-400 ring-offset-2 shadow-green-100" : ""
}`}
```

---

## Audio Visualisation Style

### Waveform bars
- 24 bars, `w-[3px]`, `rounded-full`
- Minimal container (`h-10`, items-end, gap `[3px]`)
- Colors: `#CBD5E1` (idle) → `#F97316` (active) → `#22C55E` (attempt)

### Mic circle
- 84px circle, `rounded-full`
- Orange-500 by default → orange-400 on loud → green-400 on attempt
- Inner emoji: 🎤 (default) → 💧 (attempt detected)
- Pulse rings: two concentric animated borders

### Water drops
- 💧 emoji particles (5 per burst)
- Random x offsets (±64px spread from center)
- Random scale (0.7×–1.2×)
- Float upward: y 0 → -110px
- Fade out: opacity 1 → 0
- Duration: 1.1s, ease-out

---

## What to Avoid

### Layout anti-patterns
- ❌ Full-width flat cards stacked vertically (looks like a settings screen)
- ❌ Tables for data display in child-facing screens
- ❌ Large empty white space with tiny centered content
- ❌ Dark mode (app is light/warm only)
- ❌ Sidebar or bottom navigation bar (single-flow, no persistent nav)

### Visual anti-patterns
- ❌ Generic blue-white "edtech" color schemes
- ❌ Flat line-art illustrations without personality
- ❌ Stock photography
- ❌ Material Design outlined buttons
- ❌ Grey-on-grey text
- ❌ Animated confetti (cliché, childish in the wrong way)
- ❌ Progress bars with percentage labels (clinical feel)

### Copy anti-patterns
- ❌ "Score: 87%" or any score display to children
- ❌ Long paragraphs of instructions on child-facing screens
- ❌ "Try again" (implies failure)
- ❌ "Incorrect" or "Wrong"
- ❌ Bullet-pointed instruction lists on child screens

### Interaction anti-patterns
- ❌ Hover states that require desktop mouse (design mobile-first)
- ❌ Small tap targets (min 44px for interactive elements)
- ❌ Transitions that pause the session (> 300ms perceived delay)
- ❌ Jarring abrupt state changes (always use spring or ease transitions)

---

## How to Avoid AI-Slop

"AI-slop" in UI typically manifests as:
- Generic, symmetric grid layouts
- Over-use of the same card pattern everywhere
- Identical spacing and sizing on every element
- Copy that sounds informative but is emotionally flat
- Interactions that are technically present but physically dead

**Antidotes used in SpeechSprout:**

1. **Asymmetric layout in the map:** Nodes alternate left/right on the winding path. This mirrors the irregular feel of a real adventure path.

2. **Spring physics everywhere:** Every interaction uses `type: "spring"` with tuned `stiffness` and `damping`. The numbers matter:
   - Fast, snappy: stiffness 520, damping 32
   - Organic entrance: stiffness 260, damping 18
   - Soft, elastic: stiffness 380, damping 24

3. **Different animation on each plant stage:** AnimatePresence with `mode="wait"` creates a distinct entrance per stage (scale + opacity spring).

4. **Unique per-bar idle breathing:** Each of the 24 waveform bars breathes at a different rate and phase — they never look synchronized.

5. **Decorative details:** The environment elements on the map (frogs, clouds, mushrooms) aren't UI — they're world. They make the space feel inhabited rather than generated.

6. **Child-first hierarchy:** The session complete screen leads with the plant and celebration. The parent check-in is deliberately buried in an accordion. This is a product decision, not just a layout one.

7. **Word as hero:** In the practice screen, the practice word is the biggest thing on the screen. Not the camera. Not a toolbar. The word.

---

## Motion Design Principles

### Spring parameters (Framer Motion)

| Animation | stiffness | damping | Notes |
|-----------|-----------|---------|-------|
| Button tap | 520 | 32 | Fast, satisfying |
| Card entrance | 300 | 24 | Smooth, weighted |
| Plant stage change | 260 | 18 | Bouncy, playful |
| Bottom sheet | 380 | 38 | Heavy, feels real |
| Star pop-in | 380 | 22 | Energetic stagger |
| Mic bounce | 420 | 24 | Celebratory |
| Node entrance | 320 | 24 | Staggered game entrance |

### AnimatePresence usage
- `mode="wait"`: word bubble (prevents two words showing simultaneously)
- `mode="wait"`: plant stage (prevents ghost stages)
- Default (simultaneous): water drops, feedback bubble, bottom sheet

### Stagger children
Use Framer Motion variants with `staggerChildren` for:
- Landing page sections: `staggerChildren: 0.1`
- Session complete stats: `staggerChildren: 0.09, delayChildren: 0.3`
- Stars: `staggerChildren: 0.09, delayChildren: 0.3`
- Map nodes: manual `delay: index * 0.08` on each node

### Things that should NOT animate
- Text color changes (use CSS `transition-colors` instead)
- Disabled/enabled button states (too distracting)
- Page backgrounds
- Static data in lists
