import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Moon, Volume2, VolumeX, ArrowDown, Sparkles, Music2, LampDesk, Map, Star } from 'lucide-react';
import './styles/global.css';
import './styles/sound-controls.css';
import './styles/delivery-routes.css';
import './styles/nightlight.css';
import './styles/pip-expression.css';
import './styles/sleepy-star.css';
import './styles/qa-fixes.css';
import './styles/tilt3d.css';
import SparkleTrail from './components/SparkleTrail.jsx';
import Odometer, { incrementDreamsCount } from './components/Odometer.jsx';
import { getMuteState, setMuteState, initInteractiveSounds, getSharedAudioContext as getHelperAudioContext } from './components/soundHelper.js';
import { triggerSleepyStarEgg } from './components/sleepyStarEgg.js';
import DreamCatcherSection from './components/DreamCatcherGame.jsx';
import Credits from './components/Credits.jsx';
import StoryScroll from './components/StoryScroll.jsx';
import PipStage from './components/PipStage.jsx';
import NightlightCard from './components/NightlightCard.jsx';
import DreamDeliveryCard from './components/DreamDeliveryCard.jsx';
import NightDesk from './components/NightDesk.jsx';
import Pip3D from './components/Pip3D.jsx';
import BackToTop from './components/BackToTop.jsx';
import lullabyBox from './assets/pip_lullaby_box_cutout.webp';
import lantern from './assets/pip_dream_lantern_cutout.webp';
import Tilt3D from './components/Tilt3D.jsx';

const projects = [
  {
    id: 'lullaby',
    number: '01',
    icon: Music2,
    title: 'The Lullaby Lab',
    eyebrow: 'sound department',
    text: 'Soft chimes and music-box loops tuned for deep sleep.',
    image: lullabyBox,
    note: 'click the box — it still works',
  },
  {
    id: 'lantern',
    number: '02',
    icon: LampDesk,
    title: 'Nightlight Collection',
    eyebrow: 'prototype shelf',
    text: 'Warm lamps crafted to make unfamiliar rooms feel safe.',
    image: lantern,
    note: 'best used after midnight',
  },
  {
    id: 'routes',
    number: '03',
    icon: Map,
    title: 'Dream Delivery Routes',
    eyebrow: 'rooftop network',
    text: 'Quiet rooftop paths mapped so dreams arrive safely.',
    image: null,
    note: 'route 07 is usually the prettiest',
  },
];

function PipHero({ dreamMode, onToggleDream, onStarClick, isAsleep }) {

  return (
    <section className="hero section-shell" id="top">
      <div className="hero-orbit orbit-a" aria-hidden="true" />
      <div className="hero-orbit orbit-b" aria-hidden="true" />

      <div className="hero-copy">
        <div className="hero-eyebrow">
          <span className="eyebrow-star">✦</span>
          <span>PIPCITY · CHAPTER 01</span>
          <span className="eyebrow-sep">/</span>
          <span className="eyebrow-time">SHIFT 00:00 → 06:00</span>
        </div>

        <p className="hero-kicker">good evening, little dreamer.</p>
        <h1>Meet <em>Pip.</em></h1>
        <p className="hero-lede">I build the dreams you fall asleep inside.</p>

        {/* Floating editorial annotations - book marginalia, NOT a card UI */}
        <div className="hero-meta-annotations">
          <div className="editorial-meta-line">
            <span className="meta-tag">[ duty ]</span>
            <span className="meta-desc">Junior Dream Engineer · Cloud 09</span>
          </div>
          <div className="editorial-meta-line">
            <span className="meta-tag">[ hours ]</span>
            <span className="meta-desc">Awake while everyone sleeps</span>
          </div>
        </div>

        <div className="hero-actions">
          <a className="button button-primary" href="#work">
            <span>Enter the workshop</span>
            <ArrowDown size={15} className="button-arrow" />
          </a>
          <button className="button button-quiet" onClick={onToggleDream} aria-pressed={dreamMode}>
            <Moon size={15} />
            <span>{dreamMode ? 'Wake the nursery' : 'Midnight dream mode'}</span>
          </button>
        </div>

        <div className="hero-footnote" aria-label="site status">
          <Odometer compact />
          <span className="fn-sep">·</span>
          <span className="nursery-status-text">dispatch online</span>
        </div>
      </div>

      <div className="hero-character-wrap">
        {/* Floating storybook marginalia around Pip */}
        <div className="hero-annotation annot-dreams">
          <span className="annot-symbol">✦</span>
          <span>currently dreaming: 14</span>
        </div>

        <button
          type="button"
          className="secret-star"
          aria-label="A curious little star"
          title="A curious little star"
          onClick={onStarClick}
        >
          ✦
        </button>

        <div className="hero-annotation annot-station">
          <span className="annot-line" aria-hidden="true" />
          <span>fig. 01 — cloud station no. 09</span>
        </div>

        {/* Pip sitting naturally on the nursery page with touch fallback and dreamy expression */}
        <PipStage dreamMode={dreamMode} isAsleep={isAsleep} />

        {/* Quiet storybook footnote underneath the cloud */}
        <div className="hero-stage-caption">
          <span className="caption-label">pip's night shift</span>
          <span className="caption-dot">·</span>
          <span>dreams delivered gently</span>
        </div>
      </div>

      {/* Inviting Bedtime Scroll Cue */}
      <a className="hero-scroll-cue" href="#about">
        <span className="cue-line" />
        <span className="cue-text">descend into the nursery</span>
        <ArrowDown size={13} className="cue-arrow" />
      </a>
    </section>
  );
}

function IntroSection() {
  return (
    <section className="intro section-shell" id="about">
      <div className="section-label">01 / WHO IS PIP?</div>
      <div className="intro-grid">
        <div>
          <h2>A sleepy little engineer with a very serious bedtime job.</h2>
          <p className="large-copy">Pip is the newest Junior Dream Engineer at PipCity. He designs the things that make bedtime feel a little safer, softer and more magical.</p>
        </div>
        <div className="intro-card">
          <Pip3D />
          <div className="portrait-label">PIP / STAFF PORTRAIT / 00:17 AM / DRAG TO ORBIT</div>
        </div>
      </div>
    </section>
  );
}

const LULLABY_NOTES = [
  { id: 'c5', key: 'C', label: 'Cloud', freq: 523.25, glyph: '✦' },
  { id: 'd5', key: 'D', label: 'Dusk', freq: 587.33, glyph: '☾' },
  { id: 'e5', key: 'E', label: 'Star', freq: 659.25, glyph: '✧' },
  { id: 'g5', key: 'G', label: 'Moon', freq: 783.99, glyph: '♫' },
  { id: 'a5', key: 'A', label: 'Dream', freq: 880.00, glyph: '✦' },
  { id: 'c6', key: 'C', label: 'Dawn', freq: 1046.50, glyph: '⋆' },
];

const LULLABY_SEQUENCE = [0, 2, 3, 4, 3, 2, 1, 0];

function getSharedAudioContext() {
  return getHelperAudioContext();
}

function withAudioContext(callback) {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => callback(ctx)).catch(() => {});
  } else {
    callback(ctx);
  }
}

function playMusicBoxChime(freq, muted) {
  if (muted) return;
  withAudioContext((ctx) => {
    const now = ctx.currentTime;

    // Fundamental music box tine (pure sine)
    const oscFundamental = ctx.createOscillator();
    const gainFundamental = ctx.createGain();

    // Overtone shimmer (triangle overtone at ~2.76x frequency, mimicking physical metal tine mode)
    const oscOvertone = ctx.createOscillator();
    const gainOvertone = ctx.createGain();

    oscFundamental.type = 'sine';
    oscFundamental.frequency.setValueAtTime(freq, now);

    oscOvertone.type = 'triangle';
    oscOvertone.frequency.setValueAtTime(freq * 2.76, now);

    // Fundamental: immediate soft attack (8ms), sustained singing exponential decay (1.2s)
    gainFundamental.gain.setValueAtTime(0.0001, now);
    gainFundamental.gain.linearRampToValueAtTime(0.22, now + 0.008);
    gainFundamental.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    // Overtone: fast crystalline ping attack (4ms), quick ringing decay (0.24s)
    gainOvertone.gain.setValueAtTime(0.0001, now);
    gainOvertone.gain.linearRampToValueAtTime(0.08, now + 0.004);
    gainOvertone.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    oscFundamental.connect(gainFundamental);
    oscOvertone.connect(gainOvertone);
    gainFundamental.connect(ctx.destination);
    gainOvertone.connect(ctx.destination);

    oscFundamental.start(now);
    oscOvertone.start(now);
    oscFundamental.stop(now + 1.25);
    oscOvertone.stop(now + 0.28);
  });
}

function LullabyInteractiveCard({ project, muted, onToast }) {
  const [activeNote, setActiveNote] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusText, setStatusText] = useState('6 celestial tines');
  const [sparkles, setSparkles] = useState([]);
  const [glowActive, setGlowActive] = useState(false);
  const timersRef = useRef([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const triggerSparkle = (glyph) => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 55) + 22;
    setSparkles((prev) => [...prev.slice(-3), { id, x, glyph }]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 1100);
  };

  const playNote = (index, manual = true) => {
    const note = LULLABY_NOTES[index];
    if (!note) return;

    playMusicBoxChime(note.freq, muted);
    setActiveNote(index);
    setGlowActive(true);
    triggerSparkle(note.glyph);

    if (manual) {
      setStatusText(`chime: ${note.key} · ${note.label} (${Math.round(note.freq)} Hz)`);
    }

    setTimeout(() => {
      setActiveNote((curr) => (curr === index ? null : curr));
    }, 380);

    setTimeout(() => {
      setGlowActive(false);
    }, 450);
  };

  const handleToggleSequence = () => {
    if (isPlaying) {
      clearAllTimers();
      setIsPlaying(false);
      setActiveNote(null);
      setStatusText('music box paused');
      return;
    }

    incrementDreamsCount();

    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    clearAllTimers();
    setIsPlaying(true);
    setStatusText('winding music box · playing lullaby...');

    LULLABY_SEQUENCE.forEach((noteIdx, step) => {
      const t = setTimeout(() => {
        playNote(noteIdx, false);
        const note = LULLABY_NOTES[noteIdx];
        setStatusText(`melody: ${note.key} · ${note.label}`);

        if (step === LULLABY_SEQUENCE.length - 1) {
          const endT = setTimeout(() => {
            setIsPlaying(false);
            setActiveNote(null);
            setStatusText('lullaby complete · dream is ready ✦');
            if (onToast) onToast('Pip wound the box. lullaby complete, dream ready. ✦');
          }, 450);
          timersRef.current.push(endT);
        }
      }, step * 360);
      timersRef.current.push(t);
    });
  };

  const Icon = project.icon;

  return (
    <article className="project-card project-lullaby" id="lullaby-lab">
      <div className="project-topline">
        <span>{project.number}</span>
        <span>{project.eyebrow}</span>
      </div>
      <div className="project-content">
        <div className="project-copy">
          <div className="project-icon"><Icon size={18} /></div>
          <h3>{project.title}</h3>
          <p>{project.text}</p>

          <div className="lullaby-actions-row">
            <button
              type="button"
              className={`lullaby-wind-btn ${isPlaying ? 'playing' : ''}`}
              onClick={handleToggleSequence}
              aria-label={isPlaying ? 'Pause music box melody' : 'Wind and play lullaby sequence'}
            >
              <span className="lullaby-wind-icon">{isPlaying ? '■' : '▶'}</span>
              <span>{isPlaying ? 'Pause' : 'Play lullaby'}</span>
            </button>
            <div className="lullaby-status-badge" role="status" aria-live="polite">
              <span className={`lullaby-status-dot ${glowActive ? 'active' : ''}`} />
              <span>{statusText}</span>
            </div>
          </div>
        </div>

        <div className="project-art lullaby-art-panel">
          <div className="lullaby-interactive-wrap">
            <div className={`lullaby-ambient-glow ${glowActive ? 'glowing' : ''}`} aria-hidden="true" />

            {/* Sparkle notes floating up */}
            {sparkles.map((s) => (
              <span
                key={s.id}
                className="sparkle-particle"
                style={{ left: `${s.x}%`, bottom: '48%' }}
                aria-hidden="true"
              >
                {s.glyph}
              </span>
            ))}

            <Tilt3D className="tilt3d-lullaby" maskUrl={project.image}>
              <button
                type="button"
                className="lullaby-box-stage"
                onClick={() => playNote(Math.floor(Math.random() * LULLABY_NOTES.length))}
                title="Click the music box to chime"
                aria-label="Click the music box to sound a gentle chime"
              >
                <img
                  className="lullaby-box-img"
                  src={project.image}
                  alt="Pip's hand-crafted wooden lullaby music box"
                  width="1024"
                  height="924"
                />
              </button>
            </Tilt3D>

            {/* 6-tine interactive music box comb */}
            <div
              className="music-box-comb"
              role="group"
              aria-label="Playable 6-note music box tines"
            >
              {LULLABY_NOTES.map((note, index) => {
                const isActive = activeNote === index;
                return (
                  <button
                    key={note.id}
                    type="button"
                    className={`music-box-tine ${isActive ? 'active' : ''}`}
                    onClick={() => playNote(index, true)}
                    aria-label={`${note.key} ${note.label} — play chime at ${Math.round(note.freq)} hertz`}
                    aria-pressed={isActive}
                  >
                    <span className="tine-key">{note.key}</span>{' '}
                    <span className="tine-label">{note.label}</span>
                    <span className="tine-pin" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project, onPlay, muted, onToast, currentMood, onMoodChange }) {
  if (project.id === 'lullaby') {
    return <LullabyInteractiveCard project={project} muted={muted} onToast={onToast} />;
  }

  if (project.id === 'lantern') {
    return (
      <NightlightCard
        project={project}
        muted={muted}
        onToast={onToast}
        currentMood={currentMood}
        onMoodChange={onMoodChange}
      />
    );
  }

  if (project.id === 'routes') {
    return <DreamDeliveryCard project={project} onPlay={onPlay} onToast={onToast} />;
  }

  const Icon = project.icon;
  return (
    <article className={`project-card project-${project.id}`}>
      <div className="project-topline"><span>{project.number}</span><span>{project.eyebrow}</span></div>
      <div className="project-content">
        <div className="project-copy">
          <div className="project-icon"><Icon size={18} /></div>
          <h3>{project.title}</h3>
          <p>{project.text}</p>
          <button className="project-link" onClick={() => onPlay(project.id)}>{project.note} <span>↗</span></button>
        </div>
        <div className="project-art">
          {project.image ? <img src={project.image} alt="" /> : null}
        </div>
      </div>
    </article>
  );
}

function ProjectsSection({ onPlay, muted, onToast, currentMood, onMoodChange }) {
  return (
    <section className="work section-shell" id="work">
      <div className="section-heading-row">
        <div><div className="section-label">02 / THE WORKSHOP</div><h2>Three things Pip makes after everyone goes to bed.</h2></div>
        <p className="section-side-note">soft lights & quiet machines.</p>
      </div>
      <div className="project-stack">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onPlay={onPlay}
            muted={muted}
            onToast={onToast}
            currentMood={currentMood}
            onMoodChange={onMoodChange}
          />
        ))}
      </div>
    </section>
  );
}

function StorySection() {
  const scenes = [
    ['01', 'Before midnight', 'Pip was once just a baby who could not sleep. He would sit on his cloud and count stars until the sky ran out of them.'],
    ['02', 'The first dream', 'One night, a falling star made a tiny musical note when it landed beside him. Pip listened. Then he tried to make the sound again.'],
    ['03', 'The workshop', 'One music box became two. Then came the lanterns, the maps and a very long list of creatures who needed help falling asleep.'],
    ['04', 'Now, every night', 'Pip clocks in when the moon gets high. Somewhere below, a little window is waiting for exactly the dream he packed.'],
  ];
  return (
    <section className="story section-shell" id="story">
      <div className="section-label">03 / THE BEDTIME JOURNEY</div>
      <div className="story-intro"><h2>Every dream has to start somewhere.</h2><p>Scroll slowly. Pip does.</p></div>
      <div className="story-scenes">
        {scenes.map(([num, title, text], index) => (
          <article className="story-scene" key={num}>
            <div className="scene-number">{num}</div>
            <div className="scene-copy"><p className="scene-kicker">{index === 3 ? "tonight's shift" : 'field notes'}</p><h3>{title}</h3><p>{text}</p></div>
            <div className={`scene-doodle doodle-${index + 1}`}>{index === 0 ? '✦' : index === 1 ? '☾' : index === 2 ? '♫' : 'zzz'}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Finale({ onStarClick }) {
  return (
    <section className="finale section-shell">
      <div className="finale-card">
        <div className="finale-stars">✦ · ✦ · ✦</div>
        <h2>Goodnight, dreamer.</h2>
        <p>Pip has one more delivery to make before sunrise.</p>
        <Odometer />
        <button className="final-star" onClick={onStarClick}><Star size={16} /> leave a little sparkle</button>
        <div className="final-sign">— Pip, PipCity / shift ends at sunrise</div>
      </div>
    </section>
  );
}

function App() {
  const [dreamMode, setDreamMode] = useState(false);
  const [nightlightMood, setNightlightMood] = useState('rest');
  const [muted, setMuted] = useState(() => getMuteState());
  const [stars, setStars] = useState(0);
  const [pipAsleep, setPipAsleep] = useState(false);
  const [toast, setToast] = useState('');
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const cleanupSounds = initInteractiveSounds();
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cleanupSounds();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const playChime = () => {
    if (muted) return;
    withAudioContext((ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660 + Math.random() * 120, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  };

  const handleToggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      setMuteState(next);
      if (!next) {
        const ctx = getSharedAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
      return next;
    });
  };

  const handlePlay = (id) => {
    playChime();
    if (id === 'lullaby' || id === 'routes') {
      incrementDreamsCount();
    }
    const messages = {
      lullaby: 'Pip winds the music box. one tiny dream, coming up.',
      lantern: 'Lantern #04 is warm enough. Pip approves.',
      routes: 'Route 07 selected. Rooftop wind: gentle.'
    };
    setToast(messages[id]);
    setTimeout(() => setToast(''), 2600);
  };

  const handleStar = () => {
    incrementDreamsCount();
    setStars((count) => {
      const next = count + 1;
      if (next >= 7) {
        triggerSleepyStarEgg({
          muted,
          playMusicBoxChime,
          onSleepChange: setPipAsleep,
        });
        setToast('you found Pip\'s sleepy star. shhh. ✦');
        setTimeout(() => setToast(''), 3200);
        return 0;
      }
      playChime();
      setToast(`${7 - next} more little taps...`);
      setTimeout(() => setToast(''), 900);
      return next;
    });
  };

  return (
    <div
      className={`app ${dreamMode ? 'dream-mode' : ''} ${pipAsleep ? 'pip-asleep' : ''}`}
      data-nightlight={nightlightMood}
    >
      <div className="ambient-lighting-wash" aria-hidden="true" />
      <SparkleTrail />
      <header className={`site-nav ${navScrolled ? 'site-nav--scrolled' : ''}`}>
        <a className="brand" href="#top"><span className="brand-mark">✦</span><span>PipCity</span></a>
        <nav><a href="#about">Pip</a><a href="#work">Workshop</a><a href="#story">Story</a><a href="#night-desk">Night desk</a></nav>
        <div className="nav-controls">
          <button
            type="button"
            className={`nav-mute-pill ${muted ? 'is-muted' : 'is-audible'}`}
            onClick={handleToggleMute}
            aria-pressed={!muted}
            aria-label={muted ? 'Muted — unmute sounds' : 'Sound on — mute sounds'}
          >
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{muted ? 'Muted' : 'Sound on'}</span>
          </button>
          <div className="nav-status"><span /> PipCity online</div>
        </div>
      </header>
      <main>
        <PipHero
          dreamMode={dreamMode}
          onToggleDream={() => setDreamMode((v) => !v)}
          onStarClick={handleStar}
          isAsleep={pipAsleep}
        />
        <IntroSection />
        <ProjectsSection
          onPlay={handlePlay}
          muted={muted}
          onToast={setToast}
          currentMood={nightlightMood}
          onMoodChange={setNightlightMood}
        />
        <StoryScroll />
        <DreamCatcherSection
          muted={muted}
          onToast={setToast}
          onPlayChime={(freq) => {
            playMusicBoxChime(freq, muted);
            incrementDreamsCount();
          }}
        />
        <NightDesk onToast={setToast} />
        <Finale onStarClick={handleStar} />
      </main>
      <footer className="site-footer">
        <div className="footer-top-row">
          <span>© PipCity / Pip's little corner of the night</span>
          <span>built with soft lights & good intentions</span>
        </div>
        <Credits />
      </footer>
      <BackToTop />
      {toast && <div className="toast" role="status"><Sparkles size={15} /> {toast}</div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
