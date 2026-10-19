/**
 * Pip — PipCity Shared Sound Helper
 * Single Web Audio context with persistent mute in localStorage ("pip-muted")
 * Synthesized soft audio: pop, chime, and tiny giggle-like blip
 */

let sharedAudioCtx = null;
let hasUserGesture = false;

// Register user gesture (required before audio can play)
export function markUserGesture() {
  hasUserGesture = true;
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
}

// Global listener to register user gesture on first interaction
if (typeof window !== 'undefined') {
  const onFirstGesture = () => {
    markUserGesture();
    window.removeEventListener('pointerdown', onFirstGesture);
    window.removeEventListener('keydown', onFirstGesture);
  };
  window.addEventListener('pointerdown', onFirstGesture, { passive: true });
  window.addEventListener('keydown', onFirstGesture, { passive: true });
}

// Get or initialize the single shared AudioContext
export function getSharedAudioContext() {
  if (!hasUserGesture) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioContextClass();
  }

  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }

  return sharedAudioCtx;
}

// Persistent mute state management in localStorage ("pip-muted")
export function getMuteState() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('pip-muted') === 'true';
  } catch {
    return false;
  }
}

export function setMuteState(muted) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('pip-muted', String(muted));
  } catch {}
  window.dispatchEvent(new CustomEvent('pip:mute-changed', { detail: muted }));
}

/**
 * Synthesizes a soft, rounded bubble/wooden pop
 */
export function playPop(startFreq = 360) {
  if (getMuteState() || !hasUserGesture) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.11, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Synthesizes a crystalline bedtime chime with a soft harmonic overtone
 */
export function playChime(freq = 659.25) {
  if (getMuteState() || !hasUserGesture) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Fundamental music box tine
  const oscFundamental = ctx.createOscillator();
  const gainFundamental = ctx.createGain();

  // Overtone shimmer (mimicking physical tine overtone mode)
  const oscOvertone = ctx.createOscillator();
  const gainOvertone = ctx.createGain();

  oscFundamental.type = 'sine';
  oscFundamental.frequency.setValueAtTime(freq, now);

  oscOvertone.type = 'triangle';
  oscOvertone.frequency.setValueAtTime(freq * 2.76, now);

  gainFundamental.gain.setValueAtTime(0.0001, now);
  gainFundamental.gain.linearRampToValueAtTime(0.16, now + 0.008);
  gainFundamental.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

  gainOvertone.gain.setValueAtTime(0.0001, now);
  gainOvertone.gain.linearRampToValueAtTime(0.06, now + 0.004);
  gainOvertone.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  oscFundamental.connect(gainFundamental);
  oscOvertone.connect(gainOvertone);
  gainFundamental.connect(ctx.destination);
  gainOvertone.connect(ctx.destination);

  oscFundamental.start(now);
  oscOvertone.start(now);
  oscFundamental.stop(now + 0.45);
  oscOvertone.stop(now + 0.24);
}

/**
 * Synthesizes a playful, tiny giggle-like blip
 * Two sweet rapid ascending chirps in succession
 */
export function playBlip() {
  if (getMuteState() || !hasUserGesture) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 783.99]; // C5 -> G5 soft chirp

  notes.forEach((freq, idx) => {
    const startTime = now + idx * 0.042;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.14, startTime + 0.038);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.048);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.052);
  });
}

/**
 * Attaches soft synthesized sounds to every button and interactive card
 * Delegated globally so dynamic elements are automatically covered
 */
export function initInteractiveSounds() {
  if (typeof window === 'undefined') return () => {};

  const handleClick = (e) => {
    markUserGesture();
    if (getMuteState()) return;

    // Avoid double chiming on music box tines which have their own pitched notes
    if (e.target.closest('.music-box-tine')) {
      return;
    }

    const btn = e.target.closest('button, a[href], [role="button"]');
    const card = e.target.closest(
      '.project-card, .intro-card, .finale-card, .story-scene, .dream-stage, .falling-dream, .dream-map'
    );

    if (btn) {
      if (btn.classList.contains('secret-star') || btn.classList.contains('final-star')) {
        playChime(880);
      } else if (
        btn.classList.contains('project-link') ||
        btn.classList.contains('button-primary') ||
        btn.classList.contains('button-quiet')
      ) {
        playBlip();
      } else {
        playPop();
      }
      return;
    }

    if (card) {
      playBlip();
    }
  };

  document.addEventListener('click', handleClick, { capture: true });
  return () => {
    document.removeEventListener('click', handleClick, { capture: true });
  };
}
