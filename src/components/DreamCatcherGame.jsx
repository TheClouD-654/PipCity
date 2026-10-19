import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Moon, Star, RefreshCw } from 'lucide-react';

const CELESTIAL_NOTES = [
  523.25, // C5 - Cloud
  587.33, // D5 - Dusk
  659.25, // E5 - Star
  783.99, // G5 - Moon
  880.00, // A5 - Dream
  1046.50, // C6 - Dawn
  1174.66, // D6 - Morning Star
];

const DREAM_SPECIES = [
  { id: 'star', glyph: '✦', name: 'Star Ember', color: '#ffd978', noteIdx: 0 },
  { id: 'moon', glyph: '☾', name: 'Moon Wisp', color: '#fff0c2', noteIdx: 1 },
  { id: 'spark', glyph: '✧', name: 'Starlight Sparkle', color: '#f8d2de', noteIdx: 2 },
  { id: 'melody', glyph: '♫', name: 'Lullaby Note', color: '#e4c4df', noteIdx: 3 },
  { id: 'dawn', glyph: '⋆', name: 'Dawn Whisper', color: '#ffeaa7', noteIdx: 4 },
];

export default function DreamCatcherSection({ muted, onToast, onPlayChime }) {
  const [caughtCount, setCaughtCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [lastCaughtName, setLastCaughtName] = useState('');
  const [activeSparkles, setActiveSparkles] = useState([]);

  const stageRef = useRef(null);
  const catcherElRef = useRef(null);
  const dreamsContainerRef = useRef(null);

  const catcherXRef = useRef(50);
  const targetXRef = useRef(50);
  const dreamsRef = useRef([]);
  const caughtCountRef = useRef(0);
  const isCompleteRef = useRef(false);
  const isMountedRef = useRef(true);
  const rafIdRef = useRef(null);
  const lastTimeRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const isVisibleRef = useRef(false);
  const hasInteractedRef = useRef(false);

  // Synchronize state to refs for high-speed RAF loop
  caughtCountRef.current = caughtCount;
  isCompleteRef.current = isComplete;

  const playChimeNote = useCallback((freq) => {
    if (muted) return;
    if (typeof onPlayChime === 'function') {
      onPlayChime(freq);
    }
  }, [muted, onPlayChime]);

  // Spawns a soft floating sparkle at the catch position
  const triggerCatchSparkle = useCallback((xPercent, glyph) => {
    const id = Date.now() + Math.random();
    setActiveSparkles((prev) => [...prev.slice(-4), { id, x: xPercent, glyph }]);
    setTimeout(() => {
      setActiveSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 900);
  }, []);

  // Catch logic shared between collision, direct click, and accessible buttons
  const handleCatchDream = useCallback((dreamId) => {
    if (isCompleteRef.current) return;

    const dream = dreamsRef.current.find((d) => d.id === dreamId);
    if (!dream || dream.caught) return;

    // Mark it here, but let the RAF loop remove it from the live array.
    // Mutating dreamsRef.current while iterating over it can orphan a dream
    // DOM node, leaving a frozen, non-catchable symbol on screen.
    dream.caught = true;

    // Immediately fade out the DOM node
    if (dream.el) {
      dream.el.style.opacity = '0';
      dream.el.style.transform = `${dream.el.style.transform} scale(1.4)`;
      setTimeout(() => {
        if (dream.el && dream.el.parentNode) {
          dream.el.parentNode.removeChild(dream.el);
        }
      }, 250);
    }

    const nextCount = caughtCountRef.current + 1;
    setCaughtCount(nextCount);
    setLastCaughtName(dream.species.name);
    triggerCatchSparkle(dream.x, dream.species.glyph);

    // Play harmonious celestial chime
    const noteFreq = CELESTIAL_NOTES[(nextCount - 1) % CELESTIAL_NOTES.length];
    playChimeNote(noteFreq);

    if (nextCount >= 7) {
      setIsComplete(true);
      isCompleteRef.current = true;

      // Soft arpeggio celebration for the 7th dream
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        setTimeout(() => playChimeNote(freq), (idx + 1) * 130);
      });

      if (onToast) {
        onToast("7 dreams gathered. Pip's delivery jar is packed. ✦");
      }
    }
  }, [playChimeNote, triggerCatchSparkle, onToast]);

  // Reset the batch to play again
  const handleResetBatch = useCallback(() => {
    hasInteractedRef.current = false;
    // Clear all existing dream elements from DOM
    dreamsRef.current.forEach((d) => {
      if (d.el && d.el.parentNode) {
        d.el.parentNode.removeChild(d.el);
      }
    });
    dreamsRef.current = [];
    setCaughtCount(0);
    setIsComplete(false);
    isCompleteRef.current = false;
    setLastCaughtName('');
    lastSpawnRef.current = performance.now();
    targetXRef.current = 50;
    catcherXRef.current = 50;
    if (catcherElRef.current) {
      catcherElRef.current.style.left = '50%';
    }
  }, []);

  // Accessible keyboard scoop & direction controls
  const handleScoopLeft = useCallback(() => {
    hasInteractedRef.current = true;
    targetXRef.current = Math.max(12, targetXRef.current - 14);
  }, []);

  const handleScoopRight = useCallback(() => {
    hasInteractedRef.current = true;
    targetXRef.current = Math.min(88, targetXRef.current + 14);
  }, []);

  const handleScoopNearest = useCallback(() => {
    hasInteractedRef.current = true;
    if (isCompleteRef.current) return;
    if (dreamsRef.current.length === 0) return;

    // Find the dream lowest on the stage (closest to catcher)
    let lowestDream = dreamsRef.current[0];
    for (let i = 1; i < dreamsRef.current.length; i++) {
      if (dreamsRef.current[i].y > lowestDream.y) {
        lowestDream = dreamsRef.current[i];
      }
    }
    if (lowestDream) {
      // Guide catcher toward it and catch
      targetXRef.current = lowestDream.x;
      handleCatchDream(lowestDream.id);
    }
  }, [handleCatchDream]);

  // Main animation and physics loop
  useEffect(() => {
    isMountedRef.current = true;
    const stage = stageRef.current;
    if (!stage) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Only run the game while it is on screen, so it never finishes itself
    // while the visitor is still reading the sections above.
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.2 }
    );
    visibilityObserver.observe(stage);

    // Spawn a new falling dream into the DOM
    const spawnDream = (timestamp) => {
      if (!dreamsContainerRef.current) return;
      if (dreamsRef.current.length >= 3) return;
      if (isCompleteRef.current) return;

      const id = 'dream-' + timestamp + '-' + Math.floor(Math.random() * 1000);
      const species = DREAM_SPECIES[Math.floor(Math.random() * DREAM_SPECIES.length)];
      // Keep dreams comfortably inside the playable stage width (14% - 86%)
      const x = Math.floor(Math.random() * 72) + 14;
      // Gentle bedtime drift speed (reduced motion falls even gentler)
      const speed = prefersReducedMotion
        ? 0.05 + Math.random() * 0.02
        : 0.09 + Math.random() * 0.04;

      const el = document.createElement('button');
      el.type = 'button';
      el.className = `falling-dream species-${species.id}`;
      el.setAttribute('aria-label', `Catch falling ${species.name}`);
      el.style.left = `${x}%`;
      el.style.top = '0px';
      el.innerHTML = `
        <span class="dream-halo" aria-hidden="true"></span>
        <span class="dream-glyph" aria-hidden="true" style="color: ${species.color}">${species.glyph}</span>
      `;

      el.onclick = (e) => {
        e.stopPropagation();
        handleCatchDream(id);
      };

      dreamsContainerRef.current.appendChild(el);

      dreamsRef.current.push({
        id,
        x,
        y: 0,
        speed,
        species,
        el,
        caught: false,
      });

      lastSpawnRef.current = timestamp;
    };

    const tick = (timestamp) => {
      if (!isMountedRef.current) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(64, timestamp - lastTimeRef.current);
      lastTimeRef.current = timestamp;

      if (!isVisibleRef.current) {
        lastSpawnRef.current = timestamp;
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const stageRect = stage.getBoundingClientRect();
      const stageWidth = stageRect.width || 400;
      const stageHeight = stageRect.height || 420;

      // 1. Smoothly interpolate catcher position (lerp)
      const lerpSpeed = prefersReducedMotion ? 0.35 : 0.18;
      catcherXRef.current += (targetXRef.current - catcherXRef.current) * lerpSpeed;
      if (catcherElRef.current) {
        catcherElRef.current.style.left = `${catcherXRef.current.toFixed(2)}%`;
      }

      // 2. Spawn new dreams gently (every 1.7 - 2.2 seconds)
      if (timestamp - lastSpawnRef.current > (prefersReducedMotion ? 2600 : 1900)) {
        spawnDream(timestamp);
      }

      // 3. Update falling dream positions & check collisions
      const catcherXPx = (catcherXRef.current / 100) * stageWidth;
      const catcherYPx = stageHeight - 48; // Catching zone near bottom
      const catchRadiusX = Math.max(46, stageWidth * 0.11); // Cozy generous catch box

      const remainingDreams = [];

      for (let i = 0; i < dreamsRef.current.length; i++) {
        const dream = dreamsRef.current[i];
        if (dream.caught) continue;

        dream.y += dream.speed * dt;

        // Direct DOM update for smooth 60fps without React re-renders
        if (dream.el) {
          dream.el.style.top = `${dream.y.toFixed(1)}px`;
        }

        const dreamXPx = (dream.x / 100) * stageWidth;
        const inCatchY = dream.y >= catcherYPx - 26 && dream.y <= catcherYPx + 34;
        const inCatchX = Math.abs(dreamXPx - catcherXPx) <= catchRadiusX;

        if (hasInteractedRef.current && inCatchY && inCatchX && !isCompleteRef.current) {
          // Caught by cloud catcher!
          handleCatchDream(dream.id);
          continue;
        }

        // Check if dream drifted past the bottom (zero penalty: dissolves into stardust)
        if (dream.y > stageHeight + 15) {
          if (dream.el && dream.el.parentNode) {
            dream.el.parentNode.removeChild(dream.el);
          }
          continue;
        }

        remainingDreams.push(dream);
      }

      dreamsRef.current = remainingDreams;

      rafIdRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now() - 1000;
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      isMountedRef.current = false;
      visibilityObserver.disconnect();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Remove all dynamically spawned dreams
      dreamsRef.current.forEach((d) => {
        if (d.el && d.el.parentNode) {
          d.el.parentNode.removeChild(d.el);
        }
      });
      dreamsRef.current = [];
    };
  }, [handleCatchDream]);

  // Pointer & Touch handlers on the interactive stage
  const handlePointerMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (!rect.width) return;
    hasInteractedRef.current = true;
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    if (clientX === undefined) return;
    const rawPercent = ((clientX - rect.left) / rect.width) * 100;
    targetXRef.current = Math.max(12, Math.min(88, rawPercent));
  };

  const handleTouchMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (!rect.width) return;
    hasInteractedRef.current = true;
    const touch = e.touches[0];
    if (!touch) return;
    const rawPercent = ((touch.clientX - rect.left) / rect.width) * 100;
    targetXRef.current = Math.max(12, Math.min(88, rawPercent));
  };

  // Keyboard navigation on stage container
  const handleKeyDown = (e) => {
    hasInteractedRef.current = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      handleScoopLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      handleScoopRight();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleScoopNearest();
    }
  };

  return (
    <section className="dream-catcher-section section-shell" id="dream-catcher">
      <div className="section-label">04 / THE NIGHT SHIFT</div>

      <div className="section-heading-row">
        <div>
          <h2>Catch the Falling Dreams.</h2>
        </div>
        <p className="section-side-note">
          Gather 7 dreams before sunrise.<br />Pip will deliver them tonight.
        </p>
      </div>

      <article className="project-card dream-catcher-card">
        {/* Card Topline */}
        <div className="project-topline">
          <span>04 / DREAM CATCHING</span>
          <div className="dream-topline-status" role="status" aria-live="polite">
            <span className={`dream-status-dot ${isComplete ? 'complete' : 'active'}`} aria-hidden="true" />
            <span className="dream-status-label">
              {isComplete ? 'DREAM JAR FULL ✦' : `DREAMS: ${caughtCount} / 7`}
            </span>
          </div>
        </div>

        {/* Card Content: Split Layout */}
        <div className="project-content">
          {/* Left Column: Editorial Copy, Jar Slots & Accessible Controls */}
          <div className="project-copy dream-catcher-copy">
            <div className="project-icon" aria-hidden="true">
              <Sparkles size={18} />
            </div>

            <h3>The Dream Catcher</h3>
            <p>
              Little dreams are drifting over the rooftops.
              Guide Pip's cloud into them and gather 7 before sunrise.
            </p>

            {/* Visual 7-Slot Dream Delivery Jar */}
            <div className="dream-jar-container">
              <div className="dream-jar-label">
                <span className="jar-tag">[ DREAM JAR ]</span>
                <span className="jar-count">{caughtCount} / 7 gathered</span>
              </div>

              <div
                className="dream-jar-slots"
                role="img"
                aria-label={`Pip's delivery jar containing ${caughtCount} of 7 dreams.`}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((idx) => {
                  const isFilled = idx < caughtCount;
                  return (
                    <div
                      key={idx}
                      className={`dream-slot ${isFilled ? 'filled' : 'empty'}`}
                      title={isFilled ? `Dream #${idx + 1} collected` : `Empty slot #${idx + 1}`}
                    >
                      <span className="slot-glyph">{isFilled ? '✦' : '·'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editorial Status & Accessible Buttons */}
            <div className="dream-controls-area">
              <div className="dream-editorial-guide">
                <span className="guide-key">✦ MOVE PIP</span>
                <span className="guide-desc">drag the cloud or use ← →</span>
              </div>

              {/* Accessible Touch / Keyboard Actions */}
              <div
                className="dream-accessible-buttons"
                role="group"
                aria-label="Accessible dream catcher controls"
              >
                <button
                  type="button"
                  className="dream-act-btn"
                  onClick={handleScoopLeft}
                  aria-label="Left — scoop cloud left"
                >
                  ← Left
                </button>
                <button
                  type="button"
                  className="dream-act-btn btn-scoop"
                  onClick={handleScoopNearest}
                  aria-label="Scoop Dream — catch the nearest falling dream wisp"
                >
                  ✦ Scoop Dream
                </button>
                <button
                  type="button"
                  className="dream-act-btn"
                  onClick={handleScoopRight}
                  aria-label="Right — scoop cloud right"
                >
                  Right →
                </button>
              </div>

              {lastCaughtName && !isComplete && (
                <div className="dream-recent-log" role="status" aria-live="polite">
                  <span className="log-star">✦</span>
                  <span>gathered {lastCaughtName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Midnight Rooftop Sky Stage */}
          <div className="project-art dream-catcher-art-panel">
            <div
              ref={stageRef}
              className="dream-stage"
              tabIndex={0}
              role="region"
              aria-label="Catch the Falling Dreams play area. Use left and right arrow keys to glide the cloud basket."
              onPointerMove={handlePointerMove}
              onTouchMove={handleTouchMove}
              onKeyDown={handleKeyDown}
            >
              {/* Sky Background with Moon & Stars */}
              <div className="stage-sky" aria-hidden="true" />
              <div className="stage-moon" aria-hidden="true">☾</div>
              <div className="stage-constellation" aria-hidden="true">
                <span className="star-a">✦</span>
                <span className="star-b">✧</span>
                <span className="star-c">⋆</span>
              </div>

              {/* Rooftop Silhouette at Bottom */}
              <div className="stage-rooftop-silhouettes" aria-hidden="true">
                <div className="stage-roof roof-left" />
                <div className="stage-roof roof-center" />
                <div className="stage-roof roof-right" />
              </div>

              {/* Container for Dynamic Falling Dreams */}
              <div ref={dreamsContainerRef} className="dreams-layer" aria-hidden="false" />

              {/* Sparkle Particles on Catch */}
              {activeSparkles.map((s) => (
                <span
                  key={s.id}
                  className="dream-catch-sparkle"
                  style={{ left: `${s.x}%`, bottom: '68px' }}
                  aria-hidden="true"
                >
                  {s.glyph}
                </span>
              ))}

              {/* Pip's Handcrafted Cloud Catcher Basket */}
              <div
                ref={catcherElRef}
                className="dream-cloud-catcher"
                style={{ left: '50%' }}
                aria-hidden="true"
              >
                <div className="catcher-glow" />
                <svg
                  className="catcher-svg"
                  viewBox="0 0 100 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Fluffy Bedtime Cloud Base */}
                  <path
                    d="M16 38 C9 38 4 33 4 26 C4 20 8 15 15 14 C17 8 24 3 34 3 C42 3 48 7 52 12 C56 7 64 4 72 4 C83 4 92 12 92 23 C92 32 85 38 76 38 Z"
                    className="cloud-body"
                  />
                  {/* Pip's Golden Dream Emblem in center */}
                  <circle cx="50" cy="24" r="8" className="cloud-core" />
                  <text x="50" y="27.5" textAnchor="middle" className="cloud-glyph">✦</text>
                </svg>
                <span className="catcher-label">Pip's dream cloud</span>
              </div>

              {/* Celebratory Completion Overlay */}
              {isComplete && (
                <div className="dream-completion-card" role="status" aria-live="assertive">
                  <div className="completion-stars" aria-hidden="true">✦ · ☾ · ✦</div>
                  <h4>7 dreams gathered.</h4>
                  <p className="completion-copy">
                    Pip's delivery jar is packed. ✦<br />
                    Ready for tonight's delivery.
                  </p>
                  <button
                    type="button"
                    className="button button-primary completion-btn"
                    onClick={handleResetBatch}
                  >
                    <RefreshCw size={14} className="completion-btn-icon" />
                    <span>Pack another dream jar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
