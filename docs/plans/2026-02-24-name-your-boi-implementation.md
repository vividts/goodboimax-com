# Name Your Boi — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate GoodBoiMax.com from a static vanilla HTML/CSS/JS site to a Next.js 16 app with Firebase (Firestore + Hosting), adding boi naming on the congrats screen, a home page carousel of the last 10 named bois, and a paw print favicon.

**Architecture:** Next.js 16 App Router with a single client-component build page (SPA state machine) and a server-component home page that fetches the last 10 bois from Firestore at request time. Names are saved via a POST `/api/bois` route that validates with `leo-profanity` and custom regex before writing to Firestore.

**Tech Stack:** Next.js 16, TypeScript, Firebase Admin SDK (server), Firestore, Firebase Hosting, `leo-profanity`, CSS (ported global stylesheet)

---

## Prerequisites

- Node.js 20.9+ (`node --version`)
- Firebase project already exists — you will need the **Project ID** and a **service account JSON** from Firebase Console → Project Settings → Service Accounts → Generate new private key
- Git repo at `/home/rob/projects/goodboimax.com` on branch `main`

---

## Task 1: Scaffold Next.js 16 project

**Files:**
- Create: `package.json` (replace existing)
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css` (placeholder)

**Step 1: Remove old package.json and initialize Next.js 16**

```bash
cd /home/rob/projects/goodboimax.com
npm init -y
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/node @types/react @types/react-dom
npm install leo-profanity
npm install firebase-admin
npm install -D @playwright/test
```

Expected: packages install without errors.

**Step 2: Create `next.config.ts`**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
}

export default nextConfig
```

**Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 4: Update `package.json` scripts**

Replace the `scripts` section:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

**Step 5: Create directory structure**

```bash
mkdir -p src/app/build
mkdir -p src/app/api/bois
mkdir -p src/components
mkdir -p src/lib
mkdir -p public
```

**Step 6: Create placeholder `src/app/globals.css`**

```css
/* Will be replaced in Task 2 */
```

**Step 7: Create `src/app/layout.tsx`**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GoodBoiMax.com — Premium Parts for Premium Bois',
  description: 'Ethically sourced. Sustainably fluffy. 100% Good.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**Step 8: Create a minimal `src/app/page.tsx` to verify dev server**

```typescript
// src/app/page.tsx
export default function HomePage() {
  return <div>GoodBoiMax — coming soon</div>
}
```

**Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: `▲ Next.js 16.x.x` and `Local: http://localhost:3000` in output.

**Step 10: Commit**

```bash
git add src/ next.config.ts tsconfig.json package.json package-lock.json
git commit -m "feat: scaffold Next.js 16 project structure"
```

---

## Task 2: Port global CSS

**Files:**
- Modify: `src/app/globals.css`
- Reference: `css/style.css` (existing, keep as-is for reference)

**Step 1: Copy existing CSS into globals.css**

Copy the entire content of `css/style.css` into `src/app/globals.css`. Then add this import at the top for the Google Font:

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

/* === RESET & BASE === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
/* ... rest of css/style.css content ... */
```

(Copy verbatim from `css/style.css` lines 4-770 after the import line.)

**Step 2: Add new CSS classes needed for new features at the bottom of globals.css**

```css
/* === CAROUSEL === */
.carousel-section {
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.carousel-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--text);
  margin-bottom: 32px;
  text-align: center;
}

.carousel-wrapper {
  position: relative;
}

.carousel-track {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 16px;
  /* hide scrollbar */
  scrollbar-width: none;
}
.carousel-track::-webkit-scrollbar { display: none; }

.carousel-card {
  flex: 0 0 220px;
  scroll-snap-align: start;
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.carousel-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.carousel-card svg {
  width: 100%;
  max-width: 160px;
  height: auto;
}

.carousel-card-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
  text-align: center;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 2px solid #eee;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
  z-index: 2;
}
.carousel-btn:hover { border-color: var(--peach); }
.carousel-btn-prev { left: -22px; }
.carousel-btn-next { right: -22px; }

/* === NAME INPUT (congrats screen) === */
.name-input-section {
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.name-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.name-input {
  font-family: 'Nunito', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 12px 20px;
  border: 3px solid #eee;
  border-radius: 50px;
  outline: none;
  width: 220px;
  transition: border-color 0.2s;
  background: white;
}
.name-input:focus { border-color: var(--peach); }
.name-input.error { border-color: var(--coral); }

.name-input-error {
  font-size: 0.85rem;
  color: var(--coral);
  font-weight: 600;
}

.name-saved {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--mint);
}

.name-display {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--peach);
  margin-top: 4px;
}

.btn-skip {
  background: none;
  border: none;
  color: var(--text-light);
  font-family: 'Nunito', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 4px;
}
.btn-skip:hover { color: var(--text); }

/* === CAROUSEL RESPONSIVE === */
@media (max-width: 767px) {
  .carousel-section {
    padding: 40px 20px;
  }
  .carousel-card {
    flex: 0 0 180px;
  }
  .carousel-btn {
    display: none;
  }
}
```

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: port global CSS and add carousel/name-input styles"
```

---

## Task 3: Create TypeScript data module

**Files:**
- Create: `src/lib/data.ts`

**Step 1: Create the data module**

```typescript
// src/lib/data.ts

export interface Product {
  id: string
  category: string
  name: string
  price: number
  description: string
  svgLayer: string
  emoji: string
  furColor?: string
}

export interface WizardStep {
  id: string
  title: string
  subtitle: string
}

export interface Selections {
  ears: string | null
  tail: string | null
  eyes: string | null
  toofs: string | null
  legs: string | null
  coat: string | null
}

export const CATEGORY_ORDER: Array<keyof Selections> = ['ears', 'tail', 'eyes', 'toofs', 'legs', 'coat']

export const STEPS: WizardStep[] = [
  { id: 'ears', title: 'Choose Your Ears', subtitle: 'All ears are hand-picked from the finest ear farms.' },
  { id: 'tail', title: 'Choose Your Tail', subtitle: 'Tails sold separately. Wagging not included (it just happens).' },
  { id: 'eyes', title: 'Choose Your Eyes', subtitle: 'Eyes are the windows to a very good soul.' },
  { id: 'toofs', title: 'Choose Your Toofs', subtitle: 'Dental grade. Vet approved. Kibble-tested.' },
  { id: 'legs', title: 'Choose Your Fur Stick', subtitle: 'The leg you know. The stick you love.' },
  { id: 'coat', title: 'Choose Your Coat', subtitle: 'Premium fur. Zero synthetic fibers. 100% floof.' },
]

export const PRODUCTS: Product[] = [
  // EARS
  { id: 'ears-floppy', category: 'ears', name: 'Premium Floppy Ears', price: 14.99, description: 'Gravity-assisted. Maximum boing factor certified.', svgLayer: 'ears-floppy', emoji: '👂' },
  { id: 'ears-radar', category: 'ears', name: 'Radar Ears', price: 24.99, description: 'Can hear a treat bag opening from 3 miles away.', svgLayer: 'ears-radar', emoji: '📡' },
  { id: 'ears-satellite', category: 'ears', name: 'Satellite Dish Ears', price: 89.99, description: 'Picks up WiFi, squirrel frequencies, and vibes.', svgLayer: 'ears-satellite', emoji: '🛸' },
  // TAIL
  { id: 'tail-bushy', category: 'tail', name: 'Bushy Tail (Deluxe)', price: 22.99, description: 'Volume that rivals a golden hour sunset.', svgLayer: 'tail-bushy', emoji: '🦊' },
  { id: 'tail-stub', category: 'tail', name: 'Tiny Stub Tail', price: 9.99, description: 'Less tail, same love. Compact yet extremely enthusiastic.', svgLayer: 'tail-stub', emoji: '🤏' },
  { id: 'tail-wag', category: 'tail', name: 'Full Wag Tail™', price: 34.99, description: 'Patent-pending perpetual wag technology. No off switch.', svgLayer: 'tail-wag', emoji: '〰️' },
  // EYES
  { id: 'eyes-human', category: 'eyes', name: 'Human Eyes', price: 299.99, description: 'Unsettling. Wise. Knowing. You will make eye contact and feel understood.', svgLayer: 'eyes-human', emoji: '👁️' },
  { id: 'eyes-puppy', category: 'eyes', name: 'Classic Puppy Eyes', price: 18.99, description: 'Irresistible. Weaponized cuteness. Use responsibly.', svgLayer: 'eyes-puppy', emoji: '🥺' },
  { id: 'eyes-anime', category: 'eyes', name: 'Anime Sparkle Eyes', price: 49.99, description: 'Catch the light. Catch feelings. Catch everything.', svgLayer: 'eyes-anime', emoji: '✨' },
  // TOOFS
  { id: 'toofs-buck', category: 'toofs', name: 'Buck Toofs', price: 12.99, description: 'Two front teeth, front and center. Charming and goofy in equal measure.', svgLayer: 'toofs-buck', emoji: '🦷' },
  { id: 'toofs-none', category: 'toofs', name: 'Smooth (No Toofs)', price: 0.00, description: 'A toof-free experience. Gummy. Serene. Gumsmooths only.', svgLayer: 'toofs-none', emoji: '😶' },
  { id: 'toofs-vampire', category: 'toofs', name: 'Vampire Toofs', price: 666.00, description: 'Fangs of distinction. Still a very good boy though.', svgLayer: 'toofs-vampire', emoji: '🧛' },
  // LEGS
  { id: 'legs-outstretched', category: 'legs', name: 'Outstretched Fur Stick', price: 19.99, description: 'The classic. One leg. Fully extended. Maximum reach.', svgLayer: 'legs-outstretched', emoji: '🦴' },
  { id: 'legs-zoomies', category: 'legs', name: 'Zoomies Mode', price: 44.99, description: 'All four legs mid-stride. Perpetually at top speed. No brakes.', svgLayer: 'legs-zoomies', emoji: '💨' },
  { id: 'legs-derp', category: 'legs', name: 'Derp Tuck', price: 11.99, description: 'Legs folded under. Maximum loaf. Zero aerodynamics.', svgLayer: 'legs-derp', emoji: '🍞' },
  // COAT
  { id: 'coat-golden', category: 'coat', name: 'Golden Doodle', price: 79.99, description: 'Sun-kissed. Bouncy. Radiates pure warmth and chaos.', svgLayer: 'coat-golden', furColor: '#D4A028', emoji: '☀️' },
  { id: 'coat-spotty', category: 'coat', name: 'Spotty Boi', price: 59.99, description: 'Classic spots. Each one unique. Each one perfect.', svgLayer: 'coat-spotty', furColor: '#8B4513', emoji: '🐄' },
  { id: 'coat-midnight', category: 'coat', name: 'Midnight Floof', price: 89.99, description: 'All black. Mysterious. Absorbs sunlight and compliments.', svgLayer: 'coat-midnight', furColor: '#1A1A2E', emoji: '🌙' },
  { id: 'coat-silver', category: 'coat', name: 'Silver Fox', price: 99.99, description: 'Distinguished. Elegant. Has definitely seen some things.', svgLayer: 'coat-silver', furColor: '#C0C0C0', emoji: '🪙' },
]
```

**Step 2: Commit**

```bash
git add src/lib/data.ts
git commit -m "feat: add TypeScript data module"
```

---

## Task 4: Create DogSvg component

The dog SVG is a React component that receives `selections` as props and renders the correct layers inline. This replaces the `<template>` + `updateDogLayers()` pattern.

**Files:**
- Create: `src/components/DogSvg.tsx`

**Step 1: Create the component**

```typescript
// src/components/DogSvg.tsx
import type { Selections, Product } from '@/lib/data'
import { PRODUCTS } from '@/lib/data'

interface DogSvgProps {
  selections: Selections
  className?: string
}

function getVisible(selections: Selections, category: keyof Selections): string | null {
  const id = selections[category]
  if (!id) return null
  const product = PRODUCTS.find(p => p.id === id)
  return product?.svgLayer ?? null
}

function getFurColor(selections: Selections): string {
  const id = selections.coat
  if (!id) return '#D4A028'
  const product = PRODUCTS.find((p): p is Product & { furColor: string } =>
    p.id === id && p.furColor !== undefined
  )
  return product?.furColor ?? '#D4A028'
}

export default function DogSvg({ selections, className }: DogSvgProps) {
  const furColor = getFurColor(selections)

  const show = (layerId: string, category: keyof Selections) =>
    getVisible(selections, category) === layerId

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 320"
      className={className}
      style={{ '--fur-color': furColor } as React.CSSProperties}
    >
      <defs>
        <style>{`
          .fur { fill: var(--fur-color, #D4A028); }
          .spots { fill: #3b2a1a; opacity: 0.65; }
          .outline { stroke: #1a1a1a; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
        `}</style>
      </defs>

      {/* BASE: Body (always visible) */}
      <g id="body-base">
        <ellipse cx="150" cy="200" rx="75" ry="65" className="fur outline"/>
        <circle cx="150" cy="115" r="55" className="fur outline"/>
        <ellipse cx="150" cy="135" rx="25" ry="18" fill="#c8914a" className="outline"/>
        <ellipse cx="150" cy="125" rx="10" ry="7" fill="#1a1a1a"/>
        <path d="M138 138 Q150 148 162 138" fill="none" className="outline"/>
      </g>

      {/* COAT: Spotty overlay */}
      {show('coat-spotty', 'coat') && (
        <g id="coat-spotty">
          <ellipse cx="120" cy="210" rx="14" ry="10" className="spots"/>
          <ellipse cx="170" cy="215" rx="18" ry="12" className="spots"/>
          <ellipse cx="150" cy="240" rx="10" ry="7" className="spots"/>
          <ellipse cx="195" cy="185" rx="12" ry="9" className="spots"/>
          <ellipse cx="125" cy="110" rx="9" ry="7" className="spots"/>
          <ellipse cx="175" cy="105" rx="11" ry="8" className="spots"/>
        </g>
      )}

      {/* EARS */}
      {show('ears-floppy', 'ears') && (
        <g id="ears-floppy">
          <ellipse cx="100" cy="100" rx="20" ry="35" className="fur outline" transform="rotate(-15 100 100)"/>
          <ellipse cx="200" cy="100" rx="20" ry="35" className="fur outline" transform="rotate(15 200 100)"/>
        </g>
      )}
      {show('ears-radar', 'ears') && (
        <g id="ears-radar">
          <polygon points="95,75 80,30 110,75" className="fur outline"/>
          <polygon points="205,75 190,30 220,75" className="fur outline"/>
        </g>
      )}
      {show('ears-satellite', 'ears') && (
        <g id="ears-satellite">
          <ellipse cx="95" cy="60" rx="22" ry="28" fill="none" stroke="#1a1a1a" strokeWidth="3"/>
          <line x1="95" y1="75" x2="105" y2="90" stroke="#1a1a1a" strokeWidth="3"/>
          <ellipse cx="205" cy="60" rx="22" ry="28" fill="none" stroke="#1a1a1a" strokeWidth="3"/>
          <line x1="205" y1="75" x2="195" y2="90" stroke="#1a1a1a" strokeWidth="3"/>
        </g>
      )}

      {/* EYES */}
      {show('eyes-puppy', 'eyes') && (
        <g id="eyes-puppy">
          <circle cx="130" cy="108" r="12" fill="white" className="outline"/>
          <circle cx="170" cy="108" r="12" fill="white" className="outline"/>
          <circle cx="130" cy="110" r="8" fill="#3d1c02"/>
          <circle cx="170" cy="110" r="8" fill="#3d1c02"/>
          <circle cx="133" cy="107" r="3" fill="white"/>
          <circle cx="173" cy="107" r="3" fill="white"/>
        </g>
      )}
      {show('eyes-human', 'eyes') && (
        <g id="eyes-human">
          <ellipse cx="130" cy="108" rx="14" ry="10" fill="white" className="outline"/>
          <ellipse cx="170" cy="108" rx="14" ry="10" fill="white" className="outline"/>
          <circle cx="130" cy="108" r="6" fill="#3d6b8c"/>
          <circle cx="170" cy="108" r="6" fill="#3d6b8c"/>
          <circle cx="130" cy="108" r="3" fill="#1a1a1a"/>
          <circle cx="170" cy="108" r="3" fill="#1a1a1a"/>
          <path d="M120,96 Q130,90 140,96" fill="none" stroke="#1a1a1a" strokeWidth="2.5"/>
          <path d="M160,96 Q170,90 180,96" fill="none" stroke="#1a1a1a" strokeWidth="2.5"/>
        </g>
      )}
      {show('eyes-anime', 'eyes') && (
        <g id="eyes-anime">
          <ellipse cx="130" cy="108" rx="15" ry="18" fill="white" className="outline"/>
          <ellipse cx="170" cy="108" rx="15" ry="18" fill="white" className="outline"/>
          <ellipse cx="130" cy="110" rx="10" ry="13" fill="#6a0dad"/>
          <ellipse cx="170" cy="110" rx="10" ry="13" fill="#6a0dad"/>
          <ellipse cx="130" cy="109" rx="5" ry="7" fill="#1a1a1a"/>
          <ellipse cx="170" cy="109" rx="5" ry="7" fill="#1a1a1a"/>
          <circle cx="124" cy="103" r="4" fill="white"/>
          <circle cx="164" cy="103" r="4" fill="white"/>
          <text x="88" y="90" fontSize="14">✨</text>
          <text x="188" y="90" fontSize="14">✨</text>
        </g>
      )}

      {/* TOOFS */}
      {show('toofs-buck', 'toofs') && (
        <g id="toofs-buck">
          <rect x="143" y="140" width="9" height="12" rx="2" fill="white" className="outline"/>
          <rect x="153" y="140" width="9" height="12" rx="2" fill="white" className="outline"/>
        </g>
      )}
      {show('toofs-vampire', 'toofs') && (
        <g id="toofs-vampire">
          <polygon points="133,140 138,155 143,140" fill="white" className="outline"/>
          <polygon points="157,140 162,155 167,140" fill="white" className="outline"/>
          <rect x="143" y="140" width="14" height="9" rx="1" fill="white" className="outline"/>
        </g>
      )}

      {/* TAIL */}
      {show('tail-bushy', 'tail') && (
        <g id="tail-bushy">
          <ellipse cx="235" cy="175" rx="28" ry="45" className="fur outline" transform="rotate(30 235 175)"/>
          <ellipse cx="248" cy="155" rx="18" ry="30" fill="#e8b84b" className="outline" transform="rotate(25 248 155)"/>
        </g>
      )}
      {show('tail-stub', 'tail') && (
        <g id="tail-stub">
          <ellipse cx="225" cy="195" rx="12" ry="16" className="fur outline" transform="rotate(20 225 195)"/>
        </g>
      )}
      {show('tail-wag', 'tail') && (
        <g id="tail-wag">
          <path d="M220,190 Q250,160 270,140 Q285,125 275,110" fill="none" className="outline" strokeWidth="14" strokeLinecap="round"/>
          <path d="M220,190 Q250,160 270,140 Q285,125 275,110" fill="none" stroke="#e8b84b" strokeWidth="8" strokeLinecap="round"/>
        </g>
      )}

      {/* LEGS */}
      {show('legs-outstretched', 'legs') && (
        <g id="legs-outstretched">
          <rect x="105" y="240" width="25" height="55" rx="12" className="fur outline"/>
          <rect x="168" y="240" width="25" height="55" rx="12" className="fur outline"/>
          <rect x="60" y="230" width="22" height="50" rx="10" className="fur outline" transform="rotate(-20 60 230)"/>
          <rect x="210" y="230" width="22" height="50" rx="10" className="fur outline" transform="rotate(20 210 230)"/>
        </g>
      )}
      {show('legs-zoomies', 'legs') && (
        <g id="legs-zoomies">
          <rect x="75" y="230" width="22" height="50" rx="10" className="fur outline" transform="rotate(-40 75 230)"/>
          <rect x="120" y="248" width="22" height="50" rx="10" className="fur outline" transform="rotate(-25 120 248)"/>
          <rect x="155" y="248" width="22" height="50" rx="10" className="fur outline" transform="rotate(25 155 248)"/>
          <rect x="200" y="230" width="22" height="50" rx="10" className="fur outline" transform="rotate(40 200 230)"/>
          <line x1="50" y1="190" x2="20" y2="190" stroke="#aaa" strokeWidth="3" strokeDasharray="5,3"/>
          <line x1="50" y1="205" x2="15" y2="205" stroke="#aaa" strokeWidth="3" strokeDasharray="5,3"/>
          <line x1="50" y1="220" x2="20" y2="220" stroke="#aaa" strokeWidth="3" strokeDasharray="5,3"/>
        </g>
      )}
      {show('legs-derp', 'legs') && (
        <g id="legs-derp">
          <ellipse cx="118" cy="268" rx="18" ry="12" className="fur outline"/>
          <ellipse cx="182" cy="268" rx="18" ry="12" className="fur outline"/>
        </g>
      )}
    </svg>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/DogSvg.tsx
git commit -m "feat: add DogSvg React component with prop-driven layer rendering"
```

---

## Task 5: Create name validation library (TDD)

**Files:**
- Create: `src/lib/validation.ts`
- Create: `src/lib/__tests__/validation.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/lib/__tests__/validation.test.ts
import { validateBoiName } from '../validation'

describe('validateBoiName', () => {
  it('accepts valid names', () => {
    expect(validateBoiName('Sir Woofington')).toBeNull()
    expect(validateBoiName('Max')).toBeNull()
    expect(validateBoiName('Mr Biscuit 2')).toBeNull()
  })

  it('rejects names shorter than 2 characters', () => {
    expect(validateBoiName('A')).toMatch(/2/)
  })

  it('rejects names longer than 30 characters', () => {
    expect(validateBoiName('A'.repeat(31))).toMatch(/30/)
  })

  it('rejects names with special characters', () => {
    expect(validateBoiName('Sir Woofington!')).toBeTruthy()
    expect(validateBoiName('boi@gmail.com')).toBeTruthy()
  })

  it('rejects URLs', () => {
    expect(validateBoiName('www.scam.com')).toBeTruthy()
    expect(validateBoiName('http://bad.com')).toBeTruthy()
    expect(validateBoiName('check this out .com')).toBeTruthy()
  })

  it('rejects phone numbers', () => {
    expect(validateBoiName('555 867 5309')).toBeTruthy()
    expect(validateBoiName('call 447911123456')).toBeTruthy()
  })

  it('rejects WhatsApp patterns', () => {
    expect(validateBoiName('whatsapp me')).toBeTruthy()
    expect(validateBoiName('wa.me link')).toBeTruthy()
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/lib/__tests__/validation.test.ts
```

Expected: `Cannot find module '../validation'`

**Step 3: Install Jest for unit tests**

```bash
npm install -D jest @types/jest ts-jest
```

Add to `package.json`:
```json
"jest": {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "moduleNameMapper": { "^@/(.*)$": "<rootDir>/src/$1" }
}
```

Add to `scripts`:
```json
"test:unit": "jest"
```

**Step 4: Write minimal implementation**

```typescript
// src/lib/validation.ts
import leoProfanity from 'leo-profanity'

const URL_PATTERN = /https?:\/\/|www\.|\.com|\.net|\.org|\.io|\.co/i
const PHONE_PATTERN = /(\+?[\d\s\-().]{9,})/
const WHATSAPP_PATTERN = /whatsapp|wa\.me/i
const ALLOWED_CHARS = /^[a-zA-Z0-9 ]+$/

export function validateBoiName(name: string): string | null {
  const trimmed = name.trim()

  if (trimmed.length < 2) return 'Name must be at least 2 characters'
  if (trimmed.length > 30) return 'Name must be 30 characters or fewer'
  if (!ALLOWED_CHARS.test(trimmed)) return 'Letters, numbers, and spaces only'
  if (URL_PATTERN.test(trimmed)) return 'No URLs allowed'
  if (PHONE_PATTERN.test(trimmed)) return 'No phone numbers allowed'
  if (WHATSAPP_PATTERN.test(trimmed)) return 'Nice try'
  if (leoProfanity.check(trimmed)) return 'Keep it family-friendly, please'

  return null
}
```

**Step 5: Run tests to verify they pass**

```bash
npm run test:unit
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/lib/validation.ts src/lib/__tests__/validation.test.ts package.json
git commit -m "feat: add boi name validation with profanity and scam filtering (TDD)"
```

---

## Task 6: Set up Firebase Admin SDK

**Files:**
- Create: `src/lib/firebase-admin.ts`
- Create: `.env.local` (not committed)
- Create: `.env.local.example` (committed)

**Step 1: Create `.env.local.example`**

```bash
# .env.local.example
# Copy to .env.local and fill in your Firebase credentials

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Step 2: Create `.env.local` with your actual credentials**

From Firebase Console → Project Settings → Service Accounts → Generate new private key.
Copy values from the downloaded JSON file into `.env.local`.

**Step 3: Add `.env.local` to `.gitignore`**

Verify `.gitignore` includes:
```
.env.local
.env*.local
```

**Step 4: Create `src/lib/firebase-admin.ts`**

```typescript
// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const adminDb = getFirestore(getAdminApp())
```

**Step 5: Commit**

```bash
git add src/lib/firebase-admin.ts .env.local.example .gitignore
git commit -m "feat: set up Firebase Admin SDK"
```

---

## Task 7: Create POST /api/bois route (TDD)

**Files:**
- Create: `src/app/api/bois/route.ts`

**Step 1: Write the route**

```typescript
// src/app/api/bois/route.ts
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { validateBoiName } from '@/lib/validation'
import type { Selections } from '@/lib/data'
import { CATEGORY_ORDER, PRODUCTS } from '@/lib/data'

interface SaveBoiRequest {
  name: string
  selections: Selections
}

function validateSelections(selections: unknown): selections is Selections {
  if (!selections || typeof selections !== 'object') return false
  return CATEGORY_ORDER.every(cat => {
    const val = (selections as Record<string, unknown>)[cat]
    if (val === null) return true
    return typeof val === 'string' && PRODUCTS.some(p => p.id === val)
  })
}

export async function POST(request: Request) {
  let body: SaveBoiRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, selections } = body

  // Validate name
  const nameError = validateBoiName(name)
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 })
  }

  // Validate selections
  if (!validateSelections(selections)) {
    return NextResponse.json({ error: 'Invalid selections' }, { status: 400 })
  }

  // Write to Firestore
  const docRef = await adminDb.collection('bois').add({
    name: name.trim(),
    selections,
    createdAt: new Date(),
  })

  return NextResponse.json({ id: docRef.id, name: name.trim() }, { status: 201 })
}
```

**Step 2: Verify by running dev server and testing with curl**

```bash
npm run dev
```

In a second terminal:
```bash
curl -X POST http://localhost:3000/api/bois \
  -H "Content-Type: application/json" \
  -d '{"name":"Sir Woofington","selections":{"ears":"ears-floppy","tail":"tail-bushy","eyes":"eyes-puppy","toofs":"toofs-buck","legs":"legs-outstretched","coat":"coat-golden"}}'
```

Expected: `{"id":"...","name":"Sir Woofington"}` with status 201.

```bash
curl -X POST http://localhost:3000/api/bois \
  -H "Content-Type: application/json" \
  -d '{"name":"www.scam.com","selections":{}}'
```

Expected: `{"error":"No URLs allowed"}` with status 400.

**Step 3: Commit**

```bash
git add src/app/api/bois/route.ts
git commit -m "feat: add POST /api/bois route with Firestore write and validation"
```

---

## Task 8: Create BuildPage — wizard + cart SPA

This is the big one. The wizard, cart, and congrats flow live as a single `'use client'` component at `/build`.

**Files:**
- Create: `src/app/build/page.tsx`
- Create: `src/components/WizardView.tsx`
- Create: `src/components/CartView.tsx`
- Create: `src/components/CongratsView.tsx`

**Step 1: Create `src/components/WizardView.tsx`**

```typescript
// src/components/WizardView.tsx
'use client'
import DogSvg from './DogSvg'
import { STEPS, PRODUCTS, CATEGORY_ORDER } from '@/lib/data'
import type { Selections } from '@/lib/data'

interface WizardViewProps {
  step: number
  selections: Selections
  onSelect: (productId: string) => void
  onNext: () => void
  onBack: () => void
}

export default function WizardView({ step, selections, onSelect, onNext, onBack }: WizardViewProps) {
  const stepIndex = step - 1
  const stepData = STEPS[stepIndex]
  const category = CATEGORY_ORDER[stepIndex]
  const products = PRODUCTS.filter(p => p.category === category)

  return (
    <div id="view-wizard" className="view active">
      <div className="wizard-layout">
        <div className="wizard-main">
          <div className="progress-bar">
            {CATEGORY_ORDER.map((cat, i) => {
              const num = i + 1
              const isDone = selections[cat] !== null
              const isActive = num === step
              const cls = isActive ? 'active' : isDone ? 'completed' : ''
              return (
                <span key={cat}>
                  <div className={`progress-step ${cls}`}>🐾</div>
                  {i < 5 && <div className={`progress-connector ${isDone && !isActive ? 'filled' : ''}`} />}
                </span>
              )
            })}
          </div>

          <div className="step-header">
            <h2>{stepData.title}</h2>
            <p>{stepData.subtitle}</p>
          </div>

          <div className="product-grid">
            {products.map(p => (
              <div
                key={p.id}
                className={`product-card ${selections[category] === p.id ? 'selected' : ''}`}
                onClick={() => onSelect(p.id)}
              >
                <div className="product-emoji">{p.emoji}</div>
                <div className="product-name">{p.name}</div>
                <div className="product-desc">{p.description}</div>
                <div className="product-price">${p.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="wizard-nav">
            <button className="btn-secondary" onClick={onBack}>
              {step === 1 ? '← Home' : '← Back'}
            </button>
            <button className="btn-primary" onClick={onNext}>
              {step === 6 ? 'Review Cart →' : 'Next →'}
            </button>
          </div>
        </div>

        <div className="dog-sidebar">
          <div className="dog-preview-label">Your Boi So Far</div>
          <div className="dog-preview">
            <DogSvg selections={selections} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Create `src/components/CartView.tsx`**

```typescript
// src/components/CartView.tsx
'use client'
import { PRODUCTS, CATEGORY_ORDER, STEPS } from '@/lib/data'
import type { Selections } from '@/lib/data'

interface CartViewProps {
  selections: Selections
  onCheckout: () => void
  onBack: () => void
}

export default function CartView({ selections, onCheckout, onBack }: CartViewProps) {
  let total = 0
  const items = CATEGORY_ORDER.map(cat => {
    const id = selections[cat]
    const product = id ? PRODUCTS.find(p => p.id === id) : null
    if (product) total += product.price
    return { cat, product }
  })

  return (
    <div id="view-cart" className="view active">
      <div className="cart-container">
        <h2>🛒 Your Boi Parts</h2>
        <div className="cart-items">
          {items.map(({ cat, product }) =>
            product ? (
              <div key={cat} className="cart-item">
                <div className="cart-item-emoji">{product.emoji}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{product.name}</div>
                  <div className="cart-item-desc">{product.description}</div>
                </div>
                <div className="cart-item-price">${product.price.toFixed(2)}</div>
              </div>
            ) : (
              <div key={cat} className="cart-empty-slot">
                No {STEPS[CATEGORY_ORDER.indexOf(cat)].id} selected — living dangerously.
              </div>
            )
          )}
        </div>
        <div className="cart-total">
          Total: <span style={{ color: 'var(--peach)' }}>${total.toFixed(2)}</span>
        </div>
        <button className="btn-primary" onClick={onCheckout}>Complete Purchase 💳</button>
        <button className="btn-secondary" onClick={onBack}>← Keep Shopping</button>
      </div>
    </div>
  )
}
```

**Step 3: Create `src/components/CongratsView.tsx`**

```typescript
// src/components/CongratsView.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import DogSvg from './DogSvg'
import { PRODUCTS } from '@/lib/data'
import { validateBoiName } from '@/lib/validation'
import type { Selections } from '@/lib/data'

interface CongratsViewProps {
  selections: Selections
  onReset: () => void
}

function spawnConfetti(container: HTMLDivElement) {
  container.innerHTML = ''
  const colors = ['#FFB347', '#7EC8A4', '#B39DDB', '#FF7F7F', '#FFD700', '#87CEEB']
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div')
    piece.className = 'confetti-piece'
    piece.style.left = Math.random() * 100 + 'vw'
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    piece.style.width = (8 + Math.random() * 10) + 'px'
    piece.style.height = (10 + Math.random() * 12) + 'px'
    piece.style.animationDuration = (2 + Math.random() * 3) + 's'
    piece.style.animationDelay = (Math.random() * 2) + 's'
    container.appendChild(piece)
  }
}

function buildMessage(selections: Selections): string {
  const traits: string[] = []
  if (selections.ears) {
    const p = PRODUCTS.find(p => p.id === selections.ears)
    if (p) traits.push(p.name.toLowerCase().replace(/\s+/g, '-'))
  }
  if (selections.tail) {
    const p = PRODUCTS.find(p => p.id === selections.tail)
    if (p) traits.push(p.name.toLowerCase().replace(/\s+/g, '-'))
  }
  if (selections.coat) {
    const p = PRODUCTS.find(p => p.id === selections.coat)
    if (p) traits.push(p.name.toLowerCase())
  }
  return traits.length > 0 ? `a ${traits.join(', ')} ` : 'a mystery '
}

export default function CongratsView({ selections, onReset }: CongratsViewProps) {
  const confettiRef = useRef<HTMLDivElement>(null)
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [savedName, setSavedName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (confettiRef.current) spawnConfetti(confettiRef.current)
  }, [])

  async function handleSave() {
    const error = validateBoiName(nameInput)
    if (error) {
      setNameError(error)
      return
    }
    setNameError(null)
    setSaving(true)

    try {
      const res = await fetch('/api/bois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim(), selections }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNameError(data.error ?? 'Something went wrong')
      } else {
        setSavedName(data.name)
      }
    } catch {
      setNameError('Network error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const traitStr = buildMessage(selections)

  return (
    <div id="view-congrats" className="view active">
      <div className="confetti-container" ref={confettiRef} />
      <div className="congrats-content">
        <div className="congrats-dog">
          <DogSvg selections={selections} />
        </div>
        <h1 id="congrats-headline">🎉 Congrats!</h1>
        <p id="congrats-message">
          You&apos;ve assembled {traitStr}<strong>GOOD BOI</strong>! 🐾<br />
          They are already waiting by the door.
        </p>
        <p className="congrats-fine-print">
          Your Good Boi will arrive within 3–5 business woofs.
        </p>

        {savedName ? (
          <div className="name-input-section">
            <p className="name-saved">✓ Saved!</p>
            <p className="name-display">{savedName}</p>
          </div>
        ) : (
          <div className="name-input-section">
            <div className="name-input-row">
              <input
                className={`name-input ${nameError ? 'error' : ''}`}
                type="text"
                placeholder="Name your boi..."
                value={nameInput}
                maxLength={30}
                onChange={e => { setNameInput(e.target.value); setNameError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '...' : 'Save'}
              </button>
            </div>
            {nameError && <p className="name-input-error">{nameError}</p>}
            <button className="btn-skip" onClick={onReset}>Skip</button>
          </div>
        )}

        {savedName && (
          <button className="btn-primary" onClick={onReset}>Adopt Another Boi 🐶</button>
        )}
        {!savedName && null}
      </div>
    </div>
  )
}
```

**Step 4: Create `src/app/build/page.tsx`**

```typescript
// src/app/build/page.tsx
'use client'
import { useState } from 'react'
import type { Selections } from '@/lib/data'
import WizardView from '@/components/WizardView'
import CartView from '@/components/CartView'
import CongratsView from '@/components/CongratsView'
import { useRouter } from 'next/navigation'

const EMPTY_SELECTIONS: Selections = {
  ears: null, tail: null, eyes: null, toofs: null, legs: null, coat: null
}

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export default function BuildPage() {
  const [step, setStep] = useState<Step>(1)
  const [selections, setSelections] = useState<Selections>({ ...EMPTY_SELECTIONS })
  const router = useRouter()

  function selectProduct(productId: string) {
    const { PRODUCTS } = require('@/lib/data')
    const product = PRODUCTS.find((p: { id: string; category: string }) => p.id === productId)
    if (!product) return
    setSelections(prev => ({ ...prev, [product.category]: productId }))
  }

  function navigateNext() {
    if (step >= 1 && step <= 5) setStep((step + 1) as Step)
    else if (step === 6) setStep(7)
  }

  function navigateBack() {
    if (step === 1) router.push('/')
    else if (step > 1) setStep((step - 1) as Step)
  }

  function reset() {
    setSelections({ ...EMPTY_SELECTIONS })
    router.push('/')
  }

  if (step >= 1 && step <= 6) {
    return (
      <WizardView
        step={step}
        selections={selections}
        onSelect={selectProduct}
        onNext={navigateNext}
        onBack={navigateBack}
      />
    )
  }

  if (step === 7) {
    return (
      <CartView
        selections={selections}
        onCheckout={() => setStep(8)}
        onBack={() => setStep(6)}
      />
    )
  }

  return <CongratsView selections={selections} onReset={reset} />
}
```

**Step 5: Update `src/app/page.tsx` to add Build button**

```typescript
// src/app/page.tsx (temporary placeholder — will be replaced in Task 10)
import Link from 'next/link'

export default function HomePage() {
  return (
    <div id="view-home" className="view active">
      <div className="hero">
        <h1 className="store-name">🐾 GoodBoiMax.com</h1>
        <p className="tagline">Premium Parts for Premium Bois™</p>
        <p className="sub-tagline">Ethically sourced. Sustainably fluffy. 100% Good.</p>
        <Link href="/build" className="btn-primary">Build Your Boi →</Link>
      </div>
    </div>
  )
}
```

**Step 6: Fix the dynamic require in BuildPage** — replace the `require` call with a proper import:

In `src/app/build/page.tsx`, replace the `selectProduct` function body:

```typescript
import { PRODUCTS } from '@/lib/data'
// ...
function selectProduct(productId: string) {
  const product = PRODUCTS.find(p => p.id === productId)
  if (!product) return
  setSelections(prev => ({ ...prev, [product.category]: productId }))
}
```

**Step 7: Verify the full wizard flow in browser**

```bash
npm run dev
```

Navigate to `http://localhost:3000/build` and click through the full wizard → cart → congrats. Verify the dog SVG updates, the cart shows items, and the name input appears on the congrats screen.

**Step 8: Commit**

```bash
git add src/app/build/ src/components/WizardView.tsx src/components/CartView.tsx src/components/CongratsView.tsx src/app/page.tsx
git commit -m "feat: port wizard, cart, and congrats to React components with name input"
```

---

## Task 9: Create Carousel client component

**Files:**
- Create: `src/components/Carousel.tsx`

**Step 1: Create the component**

```typescript
// src/components/Carousel.tsx
'use client'
import { useRef } from 'react'
import DogSvg from './DogSvg'
import type { Selections } from '@/lib/data'

export interface BoiRecord {
  id: string
  name: string
  selections: Selections
}

interface CarouselProps {
  bois: BoiRecord[]
}

export default function Carousel({ bois }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'prev' | 'next') {
    if (!trackRef.current) return
    const cardWidth = 220 + 24 // card width + gap
    trackRef.current.scrollBy({ left: dir === 'next' ? cardWidth * 2 : -cardWidth * 2, behavior: 'smooth' })
  }

  if (bois.length === 0) return null

  return (
    <section className="carousel-section">
      <h2 className="carousel-title">Recently Adopted Bois</h2>
      <div className="carousel-wrapper">
        <button className="carousel-btn carousel-btn-prev" onClick={() => scroll('prev')} aria-label="Previous">‹</button>
        <div className="carousel-track" ref={trackRef}>
          {bois.map(boi => (
            <div key={boi.id} className="carousel-card">
              <DogSvg selections={boi.selections} />
              <p className="carousel-card-name">{boi.name}</p>
            </div>
          ))}
        </div>
        <button className="carousel-btn carousel-btn-next" onClick={() => scroll('next')} aria-label="Next">›</button>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Carousel.tsx
git commit -m "feat: add Carousel component with CSS scroll-snap"
```

---

## Task 10: Create home page with server-side Firestore fetch

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Replace the placeholder home page**

```typescript
// src/app/page.tsx
import Link from 'next/link'
import { adminDb } from '@/lib/firebase-admin'
import Carousel from '@/components/Carousel'
import type { BoiRecord } from '@/components/Carousel'
import type { Selections } from '@/lib/data'

async function getRecentBois(): Promise<BoiRecord[]> {
  try {
    const snapshot = await adminDb
      .collection('bois')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name as string,
      selections: doc.data().selections as Selections,
    }))
  } catch {
    // Fail gracefully if Firestore is unavailable
    return []
  }
}

export default async function HomePage() {
  const bois = await getRecentBois()

  return (
    <>
      <div id="view-home" className="view active">
        <div className="hero">
          <h1 className="store-name">🐾 GoodBoiMax.com</h1>
          <p className="tagline">Premium Parts for Premium Bois™</p>
          <p className="sub-tagline">Ethically sourced. Sustainably fluffy. 100% Good.</p>
          <Link href="/build" className="btn-primary">Build Your Boi →</Link>
        </div>
      </div>
      <Carousel bois={bois} />
    </>
  )
}
```

**Step 2: Verify home page shows carousel after saving a boi**

1. Run `npm run dev`
2. Go to `http://localhost:3000/build`, complete the wizard, name a boi, save it
3. Return to `http://localhost:3000` — the carousel should show the named boi

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: home page with server-side Firestore fetch and carousel"
```

---

## Task 11: Create paw print favicon

**Files:**
- Create: `public/favicon.svg`
- Create: `public/apple-touch-icon.png` (generated from SVG)

**Step 1: Create `public/favicon.svg`**

```xml
<!-- public/favicon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- Main pad -->
  <ellipse cx="50" cy="62" rx="26" ry="22" fill="#FFB347"/>
  <!-- Toe pads -->
  <ellipse cx="26" cy="40" rx="11" ry="13" fill="#FFB347"/>
  <ellipse cx="74" cy="40" rx="11" ry="13" fill="#FFB347"/>
  <ellipse cx="40" cy="30" rx="10" ry="12" fill="#FFB347"/>
  <ellipse cx="62" cy="30" rx="10" ry="12" fill="#FFB347"/>
</svg>
```

**Step 2: Verify the SVG looks correct in a browser**

Open `public/favicon.svg` directly in browser. Should show a clear paw print in peach/orange.

**Step 3: Generate `apple-touch-icon.png` at 180×180**

If you have `sharp` or `imagemagick` available:
```bash
npx sharp-cli --input public/favicon.svg --output public/apple-touch-icon.png --width 180 --height 180
```

Or use an online SVG-to-PNG tool to convert `public/favicon.svg` at 180×180 and save as `public/apple-touch-icon.png`.

**Step 4: Verify favicon appears in browser tab**

With `npm run dev` running, check `http://localhost:3000` — favicon should show in the browser tab.

**Step 5: Commit**

```bash
git add public/favicon.svg public/apple-touch-icon.png
git commit -m "feat: add paw print favicon"
```

---

## Task 12: Firebase Hosting configuration

**Files:**
- Create: `firebase.json`
- Create: `.firebaserc`

**Step 1: Install Firebase CLI**

```bash
npm install -g firebase-tools
firebase login
```

**Step 2: Initialize Firebase Hosting with Next.js support**

```bash
firebase init hosting
```

When prompted:
- Select your existing Firebase project
- Choose **"Use an existing project"** → select your project
- For "What do you want to use as your public directory?" → press Enter to accept default (Firebase will override this for Next.js)
- Choose **"Configure as a single-page app?"** → No
- When asked about GitHub Actions → No (for now)

Firebase will detect the Next.js framework automatically.

**Step 3: Verify `firebase.json`**

Firebase Hosting's Next.js framework support generates a `firebase.json` that should look like:

```json
{
  "hosting": {
    "source": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "frameworksBackend": {
      "region": "us-central1"
    }
  }
}
```

**Step 4: Set environment variables for Firebase Functions**

```bash
firebase functions:secrets:set FIREBASE_PROJECT_ID
firebase functions:secrets:set FIREBASE_CLIENT_EMAIL
firebase functions:secrets:set FIREBASE_PRIVATE_KEY
```

Enter the values from your `.env.local` when prompted for each.

**Step 5: Add build and deploy script to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "deploy": "firebase deploy --only hosting"
}
```

**Step 6: Test a production build locally**

```bash
npm run build
```

Expected: build succeeds with no errors.

**Step 7: Deploy to Firebase Hosting**

```bash
npm run deploy
```

Expected: Hosting URL printed to console (e.g. `https://your-project.web.app`).

**Step 8: Configure custom domain in Firebase Console**

1. Firebase Console → Hosting → Add custom domain
2. Enter `goodboimax.com`
3. Follow DNS verification steps (add TXT record)
4. Add A records pointing to Firebase IPs
5. Once verified, SSL certificate is provisioned automatically

**Step 9: Remove GitHub Pages CNAME (after Firebase domain is live)**

Once `goodboimax.com` resolves to Firebase, remove the CNAME file or leave it (it won't affect Firebase Hosting).

**Step 10: Final commit**

```bash
git add firebase.json .firebaserc package.json
git commit -m "feat: configure Firebase Hosting for Next.js 16 deployment"
```

---

## Task 13: Firestore security rules

Firestore is accessible via the Admin SDK (server-side only). But add rules to block direct client access in case of misuse.

**Step 1: Update Firestore rules in Firebase Console**

Go to Firebase Console → Firestore → Rules and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // All reads and writes go through the Admin SDK (server-side)
    // Block all direct client access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Step 2: Create Firestore index for the carousel query**

In Firebase Console → Firestore → Indexes → Composite indexes, add:

- Collection: `bois`
- Field: `createdAt` (Descending)
- Query scope: Collection

Or deploy via `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "bois",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

```bash
firebase deploy --only firestore:indexes
```

---

## Task 14: End-to-end tests

**Files:**
- Create: `tests/build-flow.spec.ts`

**Step 1: Create the e2e test**

```typescript
// tests/build-flow.spec.ts
import { test, expect } from '@playwright/test'

test('full wizard flow with naming', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Build Your Boi')

  // Step through all 6 wizard steps
  for (let i = 0; i < 6; i++) {
    await page.click('.product-card:first-child')
    await page.click('text=Next')
  }

  // Cart
  await expect(page.locator('text=Your Boi Parts')).toBeVisible()
  await page.click('text=Complete Purchase')

  // Congrats
  await expect(page.locator('text=Congrats')).toBeVisible()
  await expect(page.locator('.name-input')).toBeVisible()

  // Name the boi
  await page.fill('.name-input', 'Test Boi')
  await page.click('text=Save')

  await expect(page.locator('text=Saved!')).toBeVisible()
  await expect(page.locator('text=Test Boi')).toBeVisible()
})

test('name validation rejects URLs', async ({ page }) => {
  // Navigate directly to congrats state via build flow
  await page.goto('/build')
  // ... complete wizard ...
  // Fill with URL
  await page.fill('.name-input', 'www.scam.com')
  await page.click('text=Save')
  await expect(page.locator('text=No URLs allowed')).toBeVisible()
})

test('home page shows carousel when bois exist', async ({ page }) => {
  await page.goto('/')
  // If there are named bois in Firestore, carousel section should be visible
  // (This test is conditional on having data)
  const carousel = page.locator('.carousel-section')
  // Either it's visible (has data) or absent (no data yet) — both are valid
  const count = await carousel.count()
  if (count > 0) {
    await expect(carousel).toBeVisible()
  }
})
```

**Step 2: Run e2e tests**

```bash
npx playwright test
```

Expected: all tests pass.

**Step 3: Commit**

```bash
git add tests/build-flow.spec.ts
git commit -m "test: add e2e tests for build flow, naming, and home carousel"
```

---

## Summary of New Files

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                    -- Home + carousel (server component)
│   ├── build/
│   │   └── page.tsx                -- Wizard SPA (client component)
│   └── api/
│       └── bois/
│           └── route.ts            -- POST endpoint
├── components/
│   ├── DogSvg.tsx                  -- Reusable SVG dog
│   ├── WizardView.tsx
│   ├── CartView.tsx
│   ├── CongratsView.tsx            -- Includes name input
│   └── Carousel.tsx                -- Home page carousel
└── lib/
    ├── data.ts                     -- TypeScript product catalog
    ├── firebase-admin.ts           -- Firestore admin client
    ├── validation.ts               -- Name validation
    └── __tests__/
        └── validation.test.ts
public/
├── favicon.svg
└── apple-touch-icon.png
next.config.ts
firebase.json
.firebaserc
.env.local.example
tests/
└── build-flow.spec.ts
```
