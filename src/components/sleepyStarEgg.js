/**
 * 7-Tap Star Easter Egg Helper
 *
 * Requirements:
 * - Confetti of stars (canvas-confetti, if installed), skipped under prefers-reduced-motion
 * - Pip "falls asleep" for 6 seconds (dim eye glints, floating zzz)
 * - Hidden lullaby arpeggio plays using existing music-box chime code (silent if muted)
 */

let sleepTimeoutId = null;
let arpeggioTimeoutIds = [];
let cachedConfetti = null;

// Lullaby pentatonic arpeggio notes (C5 -> E5 -> G5 -> C6 -> A5 -> G5 -> E5 -> C5)
const LULLABY_ARPEGGIO_FREQUENCIES = [
  523.25, // C5
  659.25, // E5
  783.99, // G5
  1046.50, // C6
  880.00, // A5
  783.99, // G5
  659.25, // E5
  523.25, // C5
];

/**
 * Fires celestial star confetti using canvas-confetti if installed.
 * Skips entirely if user prefers reduced motion.
 */
export async function triggerStarConfetti() {
  if (typeof window === 'undefined') return;

  // Respect prefers-reduced-motion: skip confetti
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  try {
    if (!cachedConfetti) {
      const mod = await import('canvas-confetti');
      cachedConfetti = mod.default || mod;
    }

    if (typeof cachedConfetti !== 'function') return;

    // Project palette: cream #fff8f1, berry #a34063, brown #5c4033, warm gold stars #ffd978, #fcd34d
    const starColors = ['#ffd978', '#fff8f1', '#a34063', '#5c4033', '#fcd34d', '#ffecb3'];

    // Primary celebratory star shower
    cachedConfetti({
      particleCount: 45,
      spread: 75,
      origin: { y: 0.55 },
      shapes: ['star'],
      colors: starColors,
      scalar: 1.3,
      ticks: 180,
      gravity: 0.75,
      disableForReducedMotion: true,
    });

    // Flanking soft star bursts
    setTimeout(() => {
      cachedConfetti({
        particleCount: 22,
        angle: 60,
        spread: 55,
        origin: { x: 0.2, y: 0.65 },
        shapes: ['star'],
        colors: starColors,
        scalar: 1.15,
        ticks: 150,
        gravity: 0.7,
        disableForReducedMotion: true,
      });

      cachedConfetti({
        particleCount: 22,
        angle: 120,
        spread: 55,
        origin: { x: 0.8, y: 0.65 },
        shapes: ['star'],
        colors: starColors,
        scalar: 1.15,
        ticks: 150,
        gravity: 0.7,
        disableForReducedMotion: true,
      });
    }, 200);
  } catch (err) {
    // If canvas-confetti is not installed or errors, gracefully fail without breaking Easter egg
  }
}

/**
 * Main trigger for 7-tap star Easter egg.
 *
 * @param {Object} options
 * @param {boolean} options.muted - Current sound mute state
 * @param {Function} options.playMusicBoxChime - The existing music box chime synthesis function
 * @param {Function} options.onSleepChange - Callback to set Pip asleep (true) or awake (false)
 */
export function triggerSleepyStarEgg({
  muted = false,
  playMusicBoxChime,
  onSleepChange,
}) {
  // 1. Star confetti (respects reduced motion)
  triggerStarConfetti();

  // 2. Clear any running sleep or arpeggio timers
  if (sleepTimeoutId) {
    clearTimeout(sleepTimeoutId);
    sleepTimeoutId = null;
  }
  arpeggioTimeoutIds.forEach((id) => clearTimeout(id));
  arpeggioTimeoutIds = [];

  // 3. Pip falls asleep for 6 seconds
  if (typeof onSleepChange === 'function') {
    onSleepChange(true);
  }

  sleepTimeoutId = setTimeout(() => {
    if (typeof onSleepChange === 'function') {
      onSleepChange(false);
    }
    sleepTimeoutId = null;
  }, 6000);

  // 4. Hidden lullaby arpeggio using existing music box chime code (silent if muted)
  if (!muted && typeof playMusicBoxChime === 'function') {
    LULLABY_ARPEGGIO_FREQUENCIES.forEach((freq, index) => {
      const tid = setTimeout(() => {
        playMusicBoxChime(freq, false);
      }, index * 280);
      arpeggioTimeoutIds.push(tid);
    });
  }
}
