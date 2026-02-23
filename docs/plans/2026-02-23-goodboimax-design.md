# GoodBoiMax.com — Design Document

**Date:** 2026-02-23
**Status:** Approved

---

## Overview

A whimsical, mock e-commerce static website where shoppers "buy" parts to assemble a Good Boi (inspired by Max the golden doodle). The experience ends not with a real purchase but with a joyful "Congrats, you have a Good Boi!" screen.

---

## Tech Stack

- **Plain HTML/CSS/JavaScript** — zero build step, fully static, deployable anywhere
- **Google Fonts:** Nunito (loaded via CDN link tag)
- No frameworks, no dependencies, no npm

---

## File Structure

```
goodboimax.com/
├── index.html          # SPA shell — all views swapped here
├── css/
│   └── style.css       # All styles: layout, cards, wizard, animations
├── js/
│   ├── app.js          # State machine, view rendering, dog preview logic
│   └── data.js         # Product catalog data array
└── assets/
    └── dog.svg         # Layered cartoon dog SVG
```

---

## Architecture

**Single Page Application (Vanilla JS SPA pattern)**

`index.html` is a static shell. All view changes are handled by `app.js` toggling which sections are visible. No page reloads. State is a single JS object in memory.

### State Shape

```js
const state = {
  step: 0,  // 0=home, 1–6=wizard steps, 7=cart, 8=congrats
  selections: {
    ears:  null,  // product id string or null
    tail:  null,
    eyes:  null,
    toofs: null,
    legs:  null,
    coat:  null,
  }
};
```

### Core Functions (`app.js`)

- `navigate(step)` — updates `state.step`, calls `renderView()`
- `selectProduct(id)` — updates `state.selections[category]`, calls `updateDogPreview()`
- `updateDogPreview()` — reads selections, toggles SVG layer visibility
- `renderView()` — shows/hides the correct section, renders product cards for current step
- `buildCongratsMessage()` — generates the personalized "You assembled a [adj] [adj] Good Boi!" string

---

## Views / Pages

### 1. Home
- Store hero: logo, tagline ("Premium Parts for Premium Bois"), warm illustrated background
- Single CTA button: **"Build Your Boi →"** → navigate to step 1

### 2. Wizard (Steps 1–6)
- **Layout:** main content area (product cards) + sticky right sidebar (live dog preview)
- **Header:** paw-print progress bar (6 steps)
- **Each step:** 3 product cards in a grid; click to select (highlights with thick colored border)
- **Navigation:** "← Back" and "Next →" buttons; Next enabled even if nothing selected (part is optional for fun)
- **Dog preview:** cartoon SVG that updates live as selections are made

#### Step Definitions

| Step | Category | Options |
|------|----------|---------|
| 1 | Ears  | Premium Floppy Ears · Radar Ears · Satellite Dish Ears |
| 2 | Tail  | Bushy Tail · Tiny Stub Tail · Full Wag Tail |
| 3 | Eyes  | Human Eyes · Puppy Eyes · Anime Sparkle Eyes |
| 4 | Toofs | Buck Toofs · No Toofs (smooth) · Vampire Toofs |
| 5 | Fur Stick (legs) | Outstretched Fur Stick · Zoomies Mode · Derp Tuck |
| 6 | Coat  | Golden Doodle · Spotty Boi · Midnight Floof · Silver Fox |

### 3. Cart Review
- List of selected parts with names, goofy descriptions, and absurd fake prices
- Fake subtotal (sum of selected prices)
- "Complete Purchase" button → navigate to congrats

### 4. Congrats Screen
- Full-width, larger version of the assembled dog SVG
- CSS confetti animation (keyframe-animated `<div>` pieces raining down)
- Personalized message: **"Congrats! You've assembled a [trait] Good Boi!"**
  - Trait generated from selections (e.g. "floppy-eared, bushy-tailed, human-eyed")
- "Adopt Another Boi" button → reset state, navigate to home

---

## The Dog SVG (`assets/dog.svg`)

An inline SVG (embedded in `index.html` so JS can manipulate it directly).

**Layer structure:**
- `<g id="body">` — always visible base body + head
- `<g id="ears-floppy">`, `<g id="ears-radar">`, `<g id="ears-satellite">` — one shown at a time
- `<g id="tail-bushy">`, `<g id="tail-stub">`, `<g id="tail-wag">` — one shown at a time
- `<g id="eyes-human">`, `<g id="eyes-puppy">`, `<g id="eyes-anime">` — one shown at a time
- `<g id="toofs-buck">`, `<g id="toofs-none">`, `<g id="toofs-vampire">` — one shown at a time
- `<g id="legs-outstretched">`, `<g id="legs-zoomies">`, `<g id="legs-derp">` — one shown at a time
- CSS custom property `--fur-color` on body fill for coat color (changed per coat selection)

`updateDogPreview()` hides all layers in a category then shows the selected one.

---

## Visual Style

- **Background:** warm cream (`#FFF8F0`)
- **Accent colors:** soft peach, mint, lavender for category headers and selection highlights
- **Dog outline:** bold black strokes on a friendly cartoon shape
- **Typography:** Nunito (Google Fonts) — rounded, warm, legible
- **Product cards:** white background, 16px border-radius, subtle box-shadow, 3px colored border on hover/select, slight scale transform on hover
- **Prices:** intentionally absurd (Human Eyes: $299.99, Vampire Toofs: $666.00)
- **Progress indicator:** row of 6 paw print icons at top of wizard, filled/colored as steps complete

---

## Congrats Confetti

Pure CSS animation: ~30 `<div>` elements with random colors, sizes, positions, and animation delays; `@keyframes fall` animates them from top to bottom of viewport. Triggered by adding a class to a confetti container when congrats view is shown.

---

## Non-Goals

- No real payment processing
- No backend, server, or API
- No persistence across page refreshes (intentional — state lives in memory only)
- No mobile-first responsive layout required (fun desktop experience is fine)
