import React, { useState } from 'react';
import Tilt3D from './Tilt3D.jsx';
import { getSharedAudioContext } from './soundHelper.js';

export const NIGHTLIGHT_MOODS = [
  {
    id: 'rest',
    name: 'REST',
    step: '01',
    temp: '2200K',
    glowName: 'amber glow',
    status: 'REST · 2200K',
    note: 'soft ember · click to cycle',
    toast: 'Lantern set to Rest. Soft pilot amber ambient active.',
    freq: 440,
  },
  {
    id: 'dream',
    name: 'DREAM',
    step: '02',
    temp: '1900K',
    glowName: 'golden bedtime light',
    status: 'DREAM · 1900K GOLDEN LIGHT',
    note: 'golden glow · shadows turn friendly',
    toast: 'Lantern set to Dream. Warm golden light fills PipCity.',
    freq: 554.37,
  },
  {
    id: 'deep-sleep',
    name: 'DEEP SLEEP',
    step: '03',
    temp: '1600K',
    glowName: 'twilight bedtime ember',
    status: 'DEEP SLEEP · 1600K TWILIGHT EMBER',
    note: 'deep ember · eyelids feel heavy',
    toast: 'Lantern set to Deep Sleep. Bedtime ember glowing softly.',
    freq: 330,
  },
  {
    id: 'starlight',
    name: 'STARLIGHT',
    step: '04',
    temp: '1400K',
    glowName: 'celestial lavender dust',
    status: 'STARLIGHT · 1400K CELESTIAL DUST',
    note: 'violet starlight · quiet celestial calm',
    toast: 'Lantern set to Starlight. Ethereal stardust glowing gently.',
    freq: 659.25,
  },
];

function playLanternClickTone(freq, muted) {
  if (muted) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const play = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  };

  if (ctx.state === 'suspended') {
    ctx.resume().then(play).catch(() => {});
  } else {
    play();
  }
}

export default function NightlightCard({
  project,
  muted,
  onToast,
  currentMood = 'rest',
  onMoodChange
}) {
  const currentIndex = Math.max(
    0,
    NIGHTLIGHT_MOODS.findIndex((m) => m.id === currentMood)
  );
  const currentState = NIGHTLIGHT_MOODS[currentIndex] || NIGHTLIGHT_MOODS[0];
  const nextState = NIGHTLIGHT_MOODS[(currentIndex + 1) % NIGHTLIGHT_MOODS.length];

  const handleSelectMood = (mood) => {
    playLanternClickTone(mood.freq, muted);
    if (onMoodChange) {
      onMoodChange(mood.id);
    }
    if (onToast) {
      onToast(mood.toast);
    }
  };

  const handleCycle = () => {
    handleSelectMood(nextState);
  };

  const Icon = project.icon;

  return (
    <article
      className={`project-card project-lantern state-${currentState.id}`}
      data-nightlight={currentState.id}
    >
      {/* Subtle ambient glow that spreads beyond the card into the nursery */}
      <div className={`lantern-ambient-atmosphere glow-${currentState.id}`} aria-hidden="true" />

      <div className="project-topline">
        <span>{project.number}</span>
        <div className="lantern-topline-status">
          <span className={`lantern-status-dot dot-${currentState.id}`} aria-hidden="true" />
          <span>{currentState.status}</span>
        </div>
      </div>

      <div className="project-content">
        <div className="project-copy">
          <div className="project-icon"><Icon size={18} /></div>
          <h3>{project.title}</h3>
          <p>{project.text}</p>

          <div className="lantern-controls-area">
            {/* Tiny editorial status indicator */}
            <div className="lantern-editorial-indicator" role="status" aria-live="polite">
              <span className="indicator-tag">[ LEVEL {currentState.step}/04 ]</span>
              <span className="indicator-mode">{currentState.name}</span>
              <span className="indicator-sep">·</span>
              <span className="indicator-desc">{currentState.glowName}</span>
            </div>

            {/* Direct 4-mood selection pills */}
            <div className="nightlight-mood-pills" role="radiogroup" aria-label="Select nightlight ambient mood">
              {NIGHTLIGHT_MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={m.id === currentState.id}
                  className={`nightlight-pill ${m.id === currentState.id ? 'active' : ''}`}
                  onClick={() => handleSelectMood(m)}
                >
                  {m.step} {m.name}
                </button>
              ))}
            </div>

            {/* Accessible interaction cycle button */}
            <button
              type="button"
              className="project-link lantern-cycle-trigger"
              onClick={handleCycle}
              aria-label={`${currentState.note}. Current ambient mood: ${currentState.name}. Tap to cycle to ${nextState.name}.`}
            >
              <span>{currentState.note}</span>
              <span className="cycle-arrow">↗</span>
            </button>
          </div>
        </div>

        <div className="project-art lantern-art-panel">
          {/* Interactive lamp button wrapped in 3D tilt */}
          <Tilt3D
            className="tilt3d-lantern"
            glowColor="rgba(255, 200, 100, 0.4)"
            glowIntensity={0.5}
            maskUrl={project.image}
          >
            <button
              type="button"
              className="lantern-interactive-stage"
              onClick={handleCycle}
              aria-label={`Pip's dream lantern. Currently glowing in ${currentState.name} mode (${currentState.temp}). Tap to cycle ambient lighting.`}
              title="Click or tap the lamp to adjust the nursery ambient mood"
            >
              {/* Core warm illumination behind the lantern bulb */}
              <div className={`lantern-core-aura aura-${currentState.id}`} aria-hidden="true" />

              <img
                className={`lantern-image state-${currentState.id}`}
                src={project.image}
                alt="Pip's hand-crafted brass dream lantern"
                width="1024"
                height="914"
              />

              {/* Subtle discovery hint */}
              <span className="lantern-touch-hint" aria-hidden="true">
                ✦ tap to cycle
              </span>
            </button>
          </Tilt3D>
        </div>
      </div>
    </article>
  );
}
