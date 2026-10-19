import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import '../styles/back-to-top.css';

/**
 * BackToTop — a small, animated "return to the top" control.
 * Appears once the reader is a viewport deep. The ring around the arrow
 * doubles as a reading-progress indicator, so it earns its place on screen.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(next);
      setVisible(window.scrollY > Math.max(520, window.innerHeight * 0.65));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleClick = () => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });

    // Move keyboard focus back to the start of the page without a second scroll.
    const brand = document.querySelector('.brand');
    if (brand) {
      window.setTimeout(() => brand.focus({ preventScroll: true }), reduced ? 0 : 600);
    }
  };

  const radius = 23;
  const circumference = 2 * Math.PI * radius;

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? 'is-visible' : ''}`}
      onClick={handleClick}
      aria-label="Back to the top of the page"
      title="Back to the top"
      tabIndex={visible ? 0 : -1}
    >
      <svg className="back-to-top__ring" viewBox="0 0 52 52" aria-hidden="true">
        <circle className="back-to-top__track" cx="26" cy="26" r={radius} />
        <circle
          className="back-to-top__meter"
          cx="26"
          cy="26"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <span className="back-to-top__arrow">
        <ArrowUp size={17} strokeWidth={2.2} />
      </span>
      <span className="back-to-top__orbit" aria-hidden="true">✦</span>
    </button>
  );
}
