# Pip — PipCity

> **haX.baby "Baby's First Website" Hackathon — Track 1: Pip the Skull Baby**  
> *A cozy, handcrafted PipCity portfolio for a Junior Dream Engineer.*

---

## What the Site Is

**PipCity** is an interactive character portfolio and bedtime sanctuary designed for **Pip the Skull Baby**, who works late at night as a **Junior Dream Engineer**. While the world is asleep, Pip crafts soothing music-box lullabies, tests reassuring nightlights, and maps quiet rooftop delivery routes so every dream finds its window before dawn.

Rooted in the tactile charm of early-web craft and warm editorial design, the project deliberately avoids generic SaaS layouts or cold templates. Every detail—from cursor-following eye glints to real-time Web Audio chimes, 3D WebGL starfields, and ambient illumination—is hand-tuned to create a warm, lived-in world that judges and visitors will remember.

- **Palette**: `#fff8f1` / `#f8f0e3` Cream, `#a34063` Berry, `#5c4033` Brown, `#ffd978` Gold, and `#201b28` Night
- **Typography**: Editorial serif headings (*Fraunces*), playful brand touches (*Fredoka*), readable interface body (*DM Sans*), and tactile nursery data (*DM Mono*)
- **Sound**: Fully synthesized in real time via the browser's Web Audio API (no external MP3/WAV assets) with master mute persistence
- **Visual FX & 3D**: Lazy-loaded Three.js WebGL starfield diorama, cursor sparkle trail, canvas star confetti, and dynamic day/dream lighting washes

---

## How to Run

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Development

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build & Preview

```bash
# Validate and generate the production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## Hackathon Features & Project Tour

Below is the judge's checklist verifying the core features and where each one lives on the site:

- [x] **1. Interactive Character Hero with Dynamic Eye Tracking**
  - **Site Location**: Hero Section (`#top` / `<PipHero />` in [`src/main.jsx`](src/main.jsx))
  - **What to look for**: Official Pip artwork on a soft cloud against an ambient celestial backdrop. Pip's eye glints smoothly follow your cursor/pointer across the screen in real-time (`requestAnimationFrame`) with gentle idle drift and mobile touch fallback. Features the site header, live dispatch status, master mute audio toggle, compact vintage odometer, and the Day/Dream Mode switcher.

- [x] **2. About Pip / Junior Dream Engineer Dossier & 3D Diorama**
  - **Site Location**: About Section (`#about` / `<IntroSection />` in [`src/main.jsx`](src/main.jsx))
  - **What to look for**: Canon-aligned biography and an interactive **Three.js WebGL 3D diorama** (`<Pip3D />`). Visitors can drag or swipe to orbit the camera around Pip's framed staff portrait within a drifting celestial starfield. Includes graceful static image fallback and reduced-motion adaptation.

- [x] **3. Interactive Workshop Projects Showcase**
  - **Site Location**: Workshop Section (`#work` / `<ProjectsSection />` in [`src/main.jsx`](src/main.jsx))
  - **What to look for**: Three functional project stations from Pip's nocturnal workbench:
    - **01. Lullaby Lab** (`#lullaby-lab`): Interactive 6-tine Web Audio music box. Click individual tines or hit "Play lullaby" to trigger an automated melody sequence with rising note sparkles and synchronized dual-oscillator acoustic chimes.
    - **02. Nightlight Collection** (`#nightlight`): Ambient lighting shelf with official lantern artwork and 3D parallax tilt. Click the lamp or "Cycle light mode" to cycle between *Soft Gold*, *Midnight Glow*, and *Candle Flicker*, dynamically shifting the surrounding ambient glow and page atmosphere.
    - **03. Dream Delivery Routes** (`#routes`): Hand-drawn SVG rooftop delivery map illustrating Pip's dispatch network. Scrolling down the page drives the glowing delivery marker and Pip across chimney rooftops toward window destinations.

- [x] **4. Bedtime Origin Story**
  - **Site Location**: Story Section (`#story` / `<StorySection />` & `<StoryScroll />` in [`src/main.jsx`](src/main.jsx))
  - **What to look for**: An illustrated scroll narrative ("Before Midnight", "The First Dream", "The Workshop", "Now, Every Night") detailing how Pip started his late-night nursery shift, complete with field notes, mood kickers, and tactile storybook marginalia.

- [x] **5. "Catch the Falling Dreams" Interactive Mini-Game**
  - **Site Location**: Dream Catcher Section (`#dream-catcher` / [`src/components/DreamCatcherGame.jsx`](src/components/DreamCatcherGame.jsx))
  - **What to look for**: A playable bedtime arcade mini-game. Catch 7 drifting celestial dream motes (Star Embers, Moon Wisps, Lullaby Notes) into Pip's cloud basket using mouse drag, touch controls, or Left/Right keyboard arrow keys. Each catch triggers live Web Audio harmonic chimes and a celebratory completion state with reset capability.

- [x] **6. The Night Desk / Dream Guestbook Ledger**
  - **Site Location**: Night Desk Section (`#night-desk` / [`src/components/NightDesk.jsx`](src/components/NightDesk.jsx))
  - **What to look for**: Pip's nocturnal guestbook ledger where visitors can pin a wish to the nursery wall before clocking out. Features client-side local persistence (`localStorage`), live tally, customized dream names, randomized celestial glyphs, and toast confirmation.

- [x] **7. Bedtime Finale, Vintage Odometer & Secret Star Easter Egg**
  - **Site Location**: Finale Section (`#finale` / `<Finale />` in [`src/main.jsx`](src/main.jsx)) & Site Header
  - **What to look for**: A warm closing send-off ("Until Tomorrow Night") featuring the full-size **Vintage Dreams Delivered Odometer** (records dreams caught, lullabies wound, routes explored, or stars tapped on this device) and a return-to-top button.
  - **Secret Easter Egg**: Tap the curious little star glyph (`✦`) in the hero section 7 times to trigger Pip's hidden bedtime Easter egg: celestial star confetti shower, Pip falling asleep for 6 seconds with gentle breathing and floating "zzz", and a secret 8-note lullaby arpeggio.

---

## Credits & Colophon

- **Pip Artwork**: Official **haX.baby Track 1** asset pack (`pip_avatar_cloud.webp`, `pip_portrait.webp`, `pip_lullaby_box.webp`, `pip_dream_lantern.webp`).
- **Sleeping Pose & Cutouts**: Hand-tuned asset variations (`pip_avatar_cloud_sleep.webp` with resting hands; cutouts for lantern and music box with transparent backgrounds).
- **Core Framework & Build**: [React](https://react.dev/) 19 & [Vite](https://vite.dev/).
- **3D & FX**: [Three.js](https://threejs.org/) (lazy-loaded WebGL orbit starfield) & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) (celebratory star shower).
- **Iconography**: [Lucide React](https://lucide.dev/) (`Moon`, `Volume2`, `VolumeX`, `Sparkles`, `Music2`, `LampDesk`, `Map`, `Star`, `RefreshCw`, `ArrowDown`).
- **Typography**: Google Fonts — *Fraunces* (display serif), *Fredoka* (brand rounded), *DM Sans* (body), and *DM Mono* (technical data/labels).
- **Sound Design**: Pure algorithmic Web Audio API synthesis (warm sine/triangle oscillators, exponential decay envelopes, custom arpeggios; zero external audio files loaded).
- **Hackathon**: Created for **haX.baby "Baby's First Website" Hackathon** (Track 1: Pip the Skull Baby).
- **AI Collaboration**: Built with assistance from AI coding tools.
