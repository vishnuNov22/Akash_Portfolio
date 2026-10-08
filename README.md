# Akash — Photographer Portfolio (Next.js + WebGL)

Cinematic, 3D portfolio for **Akash** — photographer and founder of AdsWeddings (Diploma, Kaapa Institute).
Palette: Forest #10201A · Sand #EFE8DA · Terracotta #D97A4A. Fonts: Instrument Serif + Inter Tight.

## What's inside
- Preloader: 0→100 counter with flickering photo stack that expands into the site
- Hero: full-screen **WebGL** slideshow (lib/heroGL.js) — cinematic liquid wipe with light-leak edge,
  mouse ripple lens, RGB split on scroll, film grain, letterbox opening, giant AKASH title
- Velocity marquee · scroll-lit statement with photo pills
- "What I shoot" list with floating hover preview (7 categories)
- Pinned horizontal reel with **3D cover-flow** cards
- Profile: aperture-opening portrait as a layered **3D** card
- **3D archive**: draggable WebGL photo ring (lib/ring3d.js) with category filter + full-screen mode
- Custom cursor, magnetic buttons, full-screen menu, lightbox, WhatsApp booking form

## Run on your computer (Windows)
1. Install **Node.js LTS** from https://nodejs.org (one time)
2. Extract to e.g. `D:\GENAI_Project\akash-next`
3. In that folder: `npm install` then `npm run dev`
4. Open http://localhost:3000

## Edit content — data/site.js
- `SITE.whatsapp` e.g. "919876543210" (required for the booking form), phone, instagram, email
- Photos are free Unsplash **samples** grouped by category (Weddings, Portraits, Street, Travel, Nature,
  Events, Fashion). Replace with Akash's own work: put files in `public/images/work/`, use
  `{ src: "/images/work/xyz.jpg", title: "…" }` inside the right category, then set `SAMPLE_PHOTOS = false`.
- Akash's portrait: `public/images/akash.jpg`

## Deploy free on Vercel
Push to GitHub → vercel.com → Add New → Project → import repo → keep preset **Next.js** → Deploy.
