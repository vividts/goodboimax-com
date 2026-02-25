# Name Your Boi — Design Document

## Overview

Add the ability for users to name their boi after checkout, persist named bois in a database, and showcase the last 10 created bois in a carousel on the home screen. This requires migrating from a static vanilla HTML/CSS/JS site to a Next.js 16 app with Firebase services.

## Stack

- **Next.js 16** — App Router, Turbopack, React Compiler enabled
- **Firestore** — single `bois` collection for persistence
- **Firebase Hosting** — with Cloud Functions for SSR
- **leo-profanity** — profanity filtering for names
- **Custom validation** — regex rejection of URLs, phone numbers, WhatsApp patterns

## Architecture

### Route Structure

```
app/
  layout.tsx        — Root layout (fonts, global styles, metadata)
  page.tsx          — Home: hero + carousel of last 10 bois (server component)
  build/
    page.tsx        — Wizard + Cart + Congrats (client component, SPA state machine)
  api/
    bois/route.ts   — POST endpoint to save a named boi
```

### Key Decisions

- The wizard/cart/congrats flow stays as a **single client component** — the existing SPA state machine works well for this inherently interactive flow. No need for separate routes.
- The home page is a **server component** — fetches last 10 bois from Firestore at request time, no loading spinners.
- Name validation runs **both client-side** (instant feedback) and **server-side** in the API route (security).
- No user accounts or authentication. Bois are anonymous.

## Data Model

### Firestore Collection: `bois`

```json
{
  "id": "auto-generated",
  "name": "Sir Woofington",
  "selections": {
    "ears": "ears-floppy",
    "tail": "tail-bushy",
    "eyes": "eyes-puppy",
    "toofs": "toofs-buck",
    "legs": "legs-outstretched",
    "coat": "coat-golden"
  },
  "createdAt": "Timestamp"
}
```

### API: POST /api/bois

- Accepts `{ name, selections }`
- Server-side validation:
  - Profanity check via `leo-profanity`
  - Regex rejection of URLs, phone numbers, WhatsApp patterns
  - Length: 2-30 characters
  - Alphanumeric + spaces only
- On pass: writes to Firestore, returns saved doc
- On fail: returns 400 with error message

## Congrats Screen — Name Input

1. Confetti fires immediately (as today)
2. Below the dog SVG and celebration message, a name input appears:
   - Text field with placeholder "Name your boi..."
   - "Save" button
   - "Skip" link underneath
3. Client-side validation on submit:
   - 2-30 characters, alphanumeric + spaces only
   - Profanity check, URL/phone/WhatsApp pattern rejection
   - Inline error message below the field
4. On save: POST to `/api/bois`, show "Saved!" state, name displays on the dog
5. On skip: no save, proceed as today
6. No re-naming — once saved, it's final

## Home Screen Carousel

- Section title: "Recently Adopted Bois"
- Placed below the hero section
- Shows last 10 named bois fetched server-side
- Each card: small assembled dog SVG (correct parts/coat) + name label
- Auto-scrolls, pausable on hover
- Left/right arrow buttons for manual navigation
- Responsive: 1 card on mobile, 2 on tablet, 3-4 on desktop
- Built with CSS scroll-snap + a small client component (no external library)
- Hidden entirely when no bois exist

## Favicon

- Paw print icon in brand peach/orange (#FFB347)
- Inline SVG favicon
- Standard sizes: 16x16, 32x32, 180x180 (apple-touch-icon)

## Migration Strategy

### What Gets Rewritten

- Vanilla HTML/CSS/JS → React components in Next.js 16
- SVG dog template → reusable `<DogSvg />` component accepting selections as props
- `data.js` product catalog → TypeScript module
- SPA state machine in `app.js` → React state (`useState`) in build page client component

### What Carries Over As-Is

- All visual design, animations, colors, fonts
- `style.css` → global stylesheet (no CSS modules or Tailwind rewrite)
- The wizard flow and product catalog data
- The dog SVG markup and layer toggling logic
- Responsive breakpoints (480px, 768px)

### Deployment

- Firebase Hosting replaces GitHub Pages
- Custom domain (`goodboimax.com`) configured in Firebase console
- GitHub Pages decommissioned after Firebase is live

## What's New (Summary)

1. Next.js 16 project structure with App Router
2. Firebase SDK integration (Firestore)
3. Name input on congrats screen with profanity/scam filtering
4. Carousel of last 10 bois on home page
5. API route for saving bois
6. Paw print favicon
