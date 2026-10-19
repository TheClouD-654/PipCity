import React, { useEffect, useRef, useState, useCallback } from 'react';
import lullabyBox from '../assets/pip_lullaby_box.webp';
import lantern from '../assets/pip_dream_lantern.webp';
import Tilt3D from './Tilt3D.jsx';
import '../styles/story.css';

const SCENES = [
  {
    num: '01',
    kicker: 'field notes',
    title: 'Before midnight',
    text: 'Pip was once just a baby who could not sleep. He would sit on his cloud and count stars until the sky ran out of them.',
  },
  {
    num: '02',
    kicker: 'field notes',
    title: 'The first dream',
    text: 'One night, a falling star made a tiny musical note when it landed beside him. Pip listened. Then he tried to make the sound again.',
  },
  {
    num: '03',
    kicker: 'field notes',
    title: 'The workshop',
    text: 'One music box became two. Then came the lanterns, the maps and a very long list of creatures who needed help falling asleep.',
  },
  {
    num: '04',
    kicker: "tonight's shift",
    title: 'Now, every night',
    text: "Pip clocks in when the moon gets high. Somewhere below, a little window is waiting for exactly the dream he packed.",
  },
];

/* ── Night sky data ─────────────────────────────
   Laid out on a jittered grid so the sky always feels evenly covered.
   110 small stars + 7 big ones, revealed across scene 01. */

const SKY_STARS = (() => {
  let seed = 17;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const stars = [];
  const cols = 11;
  const rows = 10;
  for (let i = 0; i < cols * rows; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    stars.push({
      id: i,
      left: ((col + 0.5) / cols) * 100 + (rnd() - 0.5) * 7,
      top: ((row + 0.5) / rows) * 100 + (rnd() - 0.5) * 7,
      size: (1.8 + rnd() * 3.6).toFixed(2),
      band: Math.floor(rnd() * 7),
      depth: (0.35 + rnd() * 0.95).toFixed(2),
      delay: (rnd() * 6).toFixed(2),
      duration: (3.2 + rnd() * 4).toFixed(2),
    });
  }
  return stars;
})();

const HERO_STARS = [
  { left: '14%', top: '22%', size: 36, delay: 0 },
  { left: '54%', top: '12%', size: 52, delay: 0.4 },
  { left: '84%', top: '24%', size: 28, delay: 0.8 },
  { left: '70%', top: '46%', size: 60, delay: 1.2 },
  { left: '92%', top: '58%', size: 24, delay: 1.6 },
  { left: '58%', top: '74%', size: 44, delay: 2.0 },
  { left: '34%', top: '84%', size: 28, delay: 2.4 },
];

function StarSky() {
  return (
    <div className="story-bg" aria-hidden="true">
      <div className="story-bg__sky" />

      <div className="story-bg__stars">
        {SKY_STARS.map((star) => (
          <span
            key={star.id}
            className="story-bg__star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              '--size': `${star.size}px`,
              '--band': star.band,
              '--depth': star.depth,
              '--delay': `${star.delay}s`,
              '--duration': `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="story-bg__heroes">
        {HERO_STARS.map((star, i) => (
          <span
            key={i}
            className="story-bg__hero"
            style={{
              left: star.left,
              top: star.top,
              fontSize: `${star.size}px`,
              '--i': i,
              animationDelay: `${star.delay}s`,
            }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Scene 02 — a star falls across the whole sky and lands */}
      <div className="story-bg__fall">
        <span className="story-bg__trail" />
        <span className="story-bg__meteor" />
        <span className="story-bg__ripple story-bg__ripple--one" />
        <span className="story-bg__ripple story-bg__ripple--two" />
        <span className="story-bg__ripple story-bg__ripple--three" />
        <span className="story-bg__note">♪</span>
      </div>

      {/* Scene 03 — the workshop drifts into the background */}
      <div className="story-bg__workshop">
        <div className="story-bg__warmth" />
        <Tilt3D className="story-bg__object story-bg__object--box" maskUrl={lullabyBox}>
          <img src={lullabyBox} alt="" width="512" height="462" loading="lazy" decoding="async" />
        </Tilt3D>
        <Tilt3D className="story-bg__object story-bg__object--lantern" maskUrl={lantern}>
          <img src={lantern} alt="" width="512" height="457" loading="lazy" decoding="async" />
        </Tilt3D>
      </div>

      {/* Scene 04 — the moon rises over the rooftops */}
      <div className="story-bg__moonrise">
        <div className="story-bg__moon" />
        <div className="story-bg__roofs">
          <span className="story-bg__roof story-bg__roof--one" />
          <span className="story-bg__roof story-bg__roof--three">
            <span className="story-bg__window" />
          </span>
          <span className="story-bg__roof story-bg__roof--two" />
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────── */

export default function StoryScroll() {
  const railRef = useRef(null);
  const stageRef = useRef(null);
  const fallbackRef = useRef(null);
  const [activeScene, setActiveScene] = useState(0);
  const [useSticky, setUseSticky] = useState(true);

  // Decide sticky vs fallback
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const mqr = window.matchMedia('(prefers-reduced-motion: reduce)');
    const check = () => setUseSticky(!mql.matches && !mqr.matches);
    check();
    mql.addEventListener('change', check);
    mqr.addEventListener('change', check);
    // Some embedded browsers resize without firing MediaQueryList change.
    window.addEventListener('resize', check);
    return () => {
      mql.removeEventListener('change', check);
      mqr.removeEventListener('change', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  // Scroll-driven progress (desktop). Everything on the backdrop is CSS,
  // driven by --story-p — no React re-render per frame.
  useEffect(() => {
    if (!useSticky) return;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const rail = railRef.current;
        if (!rail) return;
        const rect = rail.getBoundingClientRect();
        const railH = rect.height;
        const scrolled = -rect.top;
        const p = Math.max(0, Math.min(1, scrolled / (railH - window.innerHeight)));

        const scene = Math.min(3, Math.floor(p * 4));
        setActiveScene(scene);

        if (stageRef.current) {
          stageRef.current.style.setProperty('--story-p', p.toFixed(4));
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [useSticky]);

  // Fallback: IntersectionObserver for reveal-on-scroll
  useEffect(() => {
    if (useSticky) return;
    const container = fallbackRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.story-scroll__fallback-card');
    if (!cards.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [useSticky]);

  // Dot click → scroll to scene
  const handleDotClick = useCallback((index) => {
    const rail = railRef.current;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    const railH = railRect.height;
    const scrollableH = railH - window.innerHeight;
    const targetScroll = rail.offsetTop + (scrollableH * index) / 4 + 10;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  // Keyboard on dots
  const handleDotKey = useCallback(
    (e, index) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDotClick(index);
      }
    },
    [handleDotClick]
  );

  return (
    <section className="story-scroll" id="story">
      {/* ── Desktop: sticky scroll-driven ── */}
      <div className="story-scroll__rail" ref={railRef}>
        <div className="story-scroll__stage" ref={stageRef}>
          <StarSky />
          <div className="story-scroll__vignette" />

          <div className="story-scroll__header">
            <p className="story-scroll__label">03 / THE BEDTIME JOURNEY</p>
            <h2 className="story-scroll__title">Every dream has to start somewhere.</h2>
          </div>

          {SCENES.map((scene, i) => {
            const isActive = activeScene === i;
            return (
              <div
                key={scene.num}
                className={`story-scroll__scene ${isActive ? 'active' : ''}`}
              >
                <div className="story-scroll__copy">
                  <p className="story-scroll__scene-num">{scene.num}</p>
                  <p className="story-scroll__scene-kicker">{scene.kicker}</p>
                  <h3 className="story-scroll__scene-title">{scene.title}</h3>
                  <p className="story-scroll__scene-text">{scene.text}</p>
                  <span className="story-scroll__scene-rule" aria-hidden="true" />
                </div>
              </div>
            );
          })}

          <div className="story-scroll__progress" aria-hidden="true">
            <span className="story-scroll__progress-track">
              <span className="story-scroll__progress-fill" />
            </span>
            <span className="story-scroll__progress-label">
              keep scrolling · {String(activeScene + 1).padStart(2, '0')} / 04
            </span>
          </div>

          <ol className="story-scroll__dots" aria-label="Story progress">
            {SCENES.map((s, i) => (
              <li key={s.num}>
                <button
                  type="button"
                  className={`story-scroll__dot ${activeScene === i ? 'active' : ''}`}
                  onClick={() => handleDotClick(i)}
                  onKeyDown={(e) => handleDotKey(e, i)}
                  aria-label={`Jump to scene ${s.num}: ${s.title}`}
                  aria-current={activeScene === i ? 'step' : undefined}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── Mobile / reduced-motion: stacked cards ── */}
      <div className="story-scroll__fallback" ref={fallbackRef}>
        <div className="story-scroll__fallback-header">
          <p className="story-scroll__label">03 / THE BEDTIME JOURNEY</p>
          <h2 className="story-scroll__title">Every dream has to start somewhere.</h2>
        </div>
        {SCENES.map((scene, i) => (
          <article key={scene.num} className="story-scroll__fallback-card">
            <span className="story-scroll__fallback-num">{scene.num}</span>
            <div>
              <p className="story-scroll__fallback-kicker">{scene.kicker}</p>
              <h3 className="story-scroll__fallback-title">{scene.title}</h3>
              <p className="story-scroll__fallback-text">{scene.text}</p>
            </div>
            <span className="story-scroll__fallback-glyph">
              {['✦', '☾', '♫', 'zzz'][i]}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
