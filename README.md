# Pip — PipCity

> **haX.baby "Baby's First Website" Hackathon — Track 1: Pip the Skull Baby**  
> *A cozy, handcrafted midnight nursery portfolio for a Junior Dream Engineer.*

---

## What the Site Is

**Midnight Nursery** is an interactive character portfolio and bedtime sanctuary designed for **Pip the Skull Baby**, who works late at night as a **Junior Dream Engineer**. While the world is asleep, Pip crafts soothing music-box lullabies, tests reassuring nightlights, and maps quiet rooftop delivery routes so every dream finds its window before dawn.

Rooted in the tactile charm of early-web craft and warm editorial design, the project deliberately avoids generic SaaS layouts or cold templates. Every detail—from cursor-following eye glints to real-time Web Audio chimes and ambient illumination—is hand-tuned to create a warm, lived-in world that judges and visitors will remember.

- **Palette**: `#fff8f1` / `#f8f0e3` Cream, `#a34063` Berry, `#5c4033` Brown, `#ffd978` Gold, and `#201b28` Night
- **Typography**: Editorial serif headings (*Fraunces*), playful brand touches (*Fredoka*), readable interface body (*DM Sans*), and tactile nursery data (*DM Mono*)
- **Sound**: Fully synthesized in real time via the browser's Web Audio API (no external MP3/WAV assets) with master mute persistence

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

## Hackathon Required Elements Checklist

Below is the judge's checklist verifying the **6 core required elements** and where each one lives on the site:

- [x] **1. Interactive Character Hero with Dynamic Eye Tracking**
  - **Site Location**: Hero Section (`#top` / `<PipHero />` in [`src/main.jsx`](src/main.jsx))
  - **What to look for**: Official Pip artwork set against a warm celestial backdrop. Pip's eye glints smoothly follow your cursor/pointer across the screen in real-time (`requestAnimationFrame`). Features the header navigation, live nursery status indicator, ambient sound toggle, and the Day/Dream Mode switcher.

- [x] **2. About Pip / Junior Dream Engineer Nursery Dossier**
  - **Site Location**: About Section (`#about` / `<IntroSection />` in [`src/main.jsx`](src/main.jsx))
  - **What to look for**: Official framed Pip portrait artwork, canon-aligned biography, bedtime engineering metrics (98.4% sweet dreams delivered, 04:12 average bedtime drift), and Pip's core design philosophy for making the night gentle and welcoming.

- [x] **3. Interactive Workshop Projects Showcase**
  - **Site Location**: Workshop Section (`#work` / `<ProjectsSection />` in [`src/main.jsx`](src/main.jsx))
  - **What to look for**: Three functional project stations from Pip's nocturnal workbench:
    - **01. Lullaby Lab** (`#lullaby-lab`): Interactive 6-tine Web Audio music box. Click individual tines or hit "Wind & play lullaby" to trigger an automated melody sequence with rising note sparkles and synchronized audio chimes.
    - **02. Nightlight Collection** (`#nightlight`): Ambient lighting shelf with official lantern artwork. Click the lamp or "Cycle light mode" to cycle between *Soft Gold*, *Midnight Glow*, and *Candle Flicker*, dynamically shifting the surrounding ambient glow and page atmosphere.
    - **03. Dream Delivery Routes** (`#routes`): Hand-drawn SVG rooftop delivery map illustrating Pip's dispatch network. Scrolling down the page drives the glowing delivery marker and Pip across chimney rooftops toward window destinations.

- [x] **4. Bedtime Origin Story**
  - **Site Location**: Story Section (`#story` / `<StorySection />` in [`src/main.jsx`](src/main.jsx))
  - **What to look for**: A 4-scene illustrated scroll narrative ("The First Lullaby", "Gathering Glow", "Rooftop Constellations", "A Quiet Town Asleep") detailing how Pip started his late-night nursery shift, complete with scene badges, mood notes, and atmospheric art panels.

- [x] **5. "Catch the Falling Dreams" Interactive Mini-Game**
  - **Site Location**: Dream Catcher Section (`#dream-catcher` / [`src/components/DreamCatcherGame.jsx`](src/components/DreamCatcherGame.jsx))
  - **What to look for**: A playable bedtime arcade mini-game. Catch 7 drifting celestial dream motes (Star Embers, Moon Wisps, Lullaby Notes) into Pip's cloud basket using pointer movement, touch, or Left/Right keyboard arrow keys. Each catch triggers live Web Audio harmonic chimes and a celebratory completion state with reset capability.

- [x] **6. Bedtime Finale & Secret Star Easter Egg**
  - **Site Location**: Finale Section (`#finale` / `<Finale />` in [`src/main.jsx`](src/main.jsx)) & Site Header
  - **What to look for**: A warm closing send-off ("Until Tomorrow Night") with a return-to-top button and bedside blessing. Includes a hidden **7-click celestial star Easter egg** on the hero star glyph that unlocks a special bedtime toast message and golden particle celebration.

---

## Credits & Colophon

- **Pip Artwork**: Official **haX.baby Track 1** asset pack (`pip_avatar_cloud.png`, `pip_portrait.png`, `pip_lullaby_box.png`, `pip_dream_lantern.png`).
- **Core Framework & Build**: [React](https://react.dev/) 19 & [Vite](https://vite.dev/).
- **Iconography**: [Lucide React](https://lucide.dev/) (`Moon`, `Volume2`, `VolumeX`, `Sparkles`, `Music2`, `LampDesk`, `Map`, `Star`, `RefreshCw`).
- **Typography**: Google Fonts — *Fraunces* (display serif), *Fredoka* (brand rounded), *DM Sans* (body), and *DM Mono* (technical data/labels).
- **Sound Design**: Pure algorithmic Web Audio API synthesis (warm sine/triangle oscillators, exponential decay envelopes, custom arpeggios; no external audio files loaded).
- **Hackathon**: Created for **haX.baby "Baby's First Website" Hackathon** (Track 1: Pip the Skull Baby).
- **AI Collaboration**: Built with assistance from AI coding tools.
