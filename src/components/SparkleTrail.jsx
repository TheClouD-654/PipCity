import React, { useEffect, useRef, useState } from 'react';
import '../styles/sparkle-trail.css';

const GLYPHS = ['✦', '✧', '⋆'];
const WARM_GOLDS = ['#ffd978', '#f6c445', '#e5a93c', '#ffe49e', '#f3b844'];

export default function SparkleTrail() {
  const [sparkles, setSparkles] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const lastTimeRef = useRef(0);
  const idCounterRef = useRef(0);
  const timersRef = useRef(new Map());

  useEffect(() => {
    // Check fine pointer and prefers-reduced-motion
    const checkSupport = () => {
      const finePointer = window.matchMedia('(pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsEnabled(finePointer && !reducedMotion);
    };

    checkSupport();

    const fineQuery = window.matchMedia('(pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleQueryChange = () => checkSupport();
    fineQuery.addEventListener?.('change', handleQueryChange);
    motionQuery.addEventListener?.('change', handleQueryChange);

    return () => {
      fineQuery.removeEventListener?.('change', handleQueryChange);
      motionQuery.removeEventListener?.('change', handleQueryChange);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setSparkles([]);
      return;
    }

    const currentTimers = timersRef.current;

    const handlePointerMove = (e) => {
      const now = performance.now();
      // Throttle to about 45ms
      if (now - lastTimeRef.current < 45) {
        return;
      }
      lastTimeRef.current = now;

      const id = ++idCounterRef.current;
      const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const color = WARM_GOLDS[Math.floor(Math.random() * WARM_GOLDS.length)];
      const size = Math.floor(Math.random() * 6) + 11; // 11px - 16px
      const driftX = (Math.random() * 24 - 12).toFixed(1) + 'px';
      const driftY = (Math.random() * 18 - 4).toFixed(1) + 'px';
      const rot = (Math.random() * 40 - 20).toFixed(1) + 'deg';

      const newSparkle = {
        id,
        x: e.clientX,
        y: e.clientY,
        glyph,
        color,
        size,
        driftX,
        driftY,
        rot,
      };

      setSparkles((prev) => [...prev.slice(-24), newSparkle]);

      // Auto-remove strictly after 700ms
      const timer = setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
        currentTimers.delete(id);
      }, 700);

      currentTimers.set(id, timer);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      currentTimers.forEach((t) => clearTimeout(t));
      currentTimers.clear();
    };
  }, [isEnabled]);

  if (!isEnabled || sparkles.length === 0) {
    return null;
  }

  return (
    <div className="sparkle-trail-container" aria-hidden="true">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="sparkle-trail-item"
          style={{
            left: `${s.x}px`,
            top: `${s.y}px`,
            color: s.color,
            fontSize: `${s.size}px`,
            '--drift-x': s.driftX,
            '--drift-y': s.driftY,
            '--rot': s.rot,
          }}
        >
          {s.glyph}
        </span>
      ))}
    </div>
  );
}
