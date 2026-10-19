import React, { useEffect, useRef } from 'react';
import avatar from '../assets/pip_avatar_cloud.webp';
import avatarSleep from '../assets/pip_avatar_cloud_sleep.webp';

/**
 * Enhanced Eye Tracking with Touch Fallback & Gentle Idle Drift:
 * - On pointer devices: smoothly tracks cursor.
 * - On touch devices: follows the last tap point.
 * - When idle (> 2.2s without interaction): drifts gently in a slow, natural gaze.
 * - Under prefers-reduced-motion: remains stationary and centered.
 */
function usePipEyeTracking() {
  const stageRef = useRef(null);
  const targetLookRef = useRef({ x: 0, y: 0 });
  const currentLookRef = useRef({ x: 0, y: 0 });
  const lastActivityRef = useRef(Date.now());
  const isIdleRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      stage.style.setProperty('--look-x', '0px');
      stage.style.setProperty('--look-y', '0px');
      return;
    }

    let rafId = null;

    const computeTargetFromCoord = (clientX, clientY) => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);
      const eyeDist = Math.min(6.5, dist / 80);

      targetLookRef.current = {
        x: Math.cos(angle) * eyeDist,
        y: Math.sin(angle) * eyeDist,
      };
      lastActivityRef.current = performance.now();
      isIdleRef.current = false;
    };

    // 1. Mouse move tracking (desktop)
    const handlePointerMove = (e) => {
      if (e.pointerType === 'mouse') {
        computeTargetFromCoord(e.clientX, e.clientY);
      }
    };

    // 2. Touch fallback: tap anywhere to direct Pip's gaze
    const handlePointerDown = (e) => {
      computeTargetFromCoord(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      lastActivityRef.current = performance.now() - 1500; // ease into idle sooner on mouse leave
    };

    // 3. Animation loop: smooth interpolation + gentle idle drift
    const updateLoop = (time) => {
      const now = performance.now();
      const timeSinceActivity = now - lastActivityRef.current;

      // If idle for over 2.2 seconds, drift gently in a soft slumber-like figure-8
      if (timeSinceActivity > 2200) {
        isIdleRef.current = true;
        const t = now * 0.0008; // slow, gentle period ~7.8s
        const driftX = Math.sin(t * 0.85) * 2.2 + Math.cos(t * 0.35) * 0.9;
        const driftY = Math.cos(t * 0.65) * 1.6 + Math.sin(t * 0.28) * 0.6;
        targetLookRef.current = { x: driftX, y: driftY };
      }

      // Smooth interpolation (lerp) toward target
      const lerpSpeed = isIdleRef.current ? 0.035 : 0.12;
      currentLookRef.current.x += (targetLookRef.current.x - currentLookRef.current.x) * lerpSpeed;
      currentLookRef.current.y += (targetLookRef.current.y - currentLookRef.current.y) * lerpSpeed;

      if (stage) {
        stage.style.setProperty('--look-x', `${currentLookRef.current.x.toFixed(2)}px`);
        stage.style.setProperty('--look-y', `${currentLookRef.current.y.toFixed(2)}px`);
      }

      rafId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    rafId = requestAnimationFrame(updateLoop);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return stageRef;
}

export default function PipStage({ dreamMode, isAsleep = false }) {
  const pipRef = usePipEyeTracking();

  // Preload sleep image on mount so first toggle doesn't flicker
  useEffect(() => {
    const img = new Image();
    img.src = avatarSleep;
  }, []);

  const isSleepy = dreamMode || isAsleep;

  return (
    <div className={`pip-stage ${isSleepy ? 'is-sleepy' : ''} ${isAsleep ? 'is-asleep' : ''}`} ref={pipRef}>
      {/* Dual-image crossfade container — both images occupy the same grid cell */}
      <div className="pip-avatar-crossfade">
        <img
          className={`pip-avatar pip-avatar--awake ${isSleepy ? 'pip-avatar--hidden' : ''}`}
          src={avatar}
          alt="Pip, the Junior Dream Engineer, sitting comfortably on a soft cloud"
          width="896"
          height="1090"
          fetchPriority="high"
        />
        <img
          className={`pip-avatar pip-avatar--sleep ${isSleepy ? '' : 'pip-avatar--hidden'}`}
          src={avatarSleep}
          alt="Pip sleeping peacefully on a soft cloud with hands lowered"
          width="896"
          height="1090"
          decoding="async"
        />
      </div>

      {/* Pupil eye glints tracking cursor / tap / idle drift */}
      <div className="eye-glint eye-left" aria-hidden="true">
        <span className="eye-sparkle" />
      </div>
      <div className="eye-glint eye-right" aria-hidden="true">
        <span className="eye-sparkle" />
      </div>

      {/* Sleepy Expression Overlays (Tier 1 Check): CSS overlays only */}
      <div className="pip-sleepy-expression" aria-hidden="true">
        {/* Soft closed-eye curved eyelid overlays */}
        <div className="sleepy-eyelid eyelid-left">
          <svg viewBox="0 0 40 24" className="eyelid-svg">
            <path d="M 3 6 Q 20 23 37 6" className="eyelid-arc-shadow" />
            <path d="M 3 6 Q 20 23 37 6" className="eyelid-arc-line" />
            <path d="M 6 8 Q 20 21 34 8" className="eyelid-arc-highlight" />
          </svg>
        </div>
        <div className="sleepy-eyelid eyelid-right">
          <svg viewBox="0 0 40 24" className="eyelid-svg">
            <path d="M 3 6 Q 20 23 37 6" className="eyelid-arc-shadow" />
            <path d="M 3 6 Q 20 23 37 6" className="eyelid-arc-line" />
            <path d="M 6 8 Q 20 21 34 8" className="eyelid-arc-highlight" />
          </svg>
        </div>

        {/* Floating "zzz" in Dream Mode */}
        <div className="floating-zzz-group">
          <span className="zzz-char zzz-3">Z</span>
          <span className="zzz-char zzz-2">z</span>
          <span className="zzz-char zzz-1">z</span>
        </div>
      </div>
    </div>
  );
}
