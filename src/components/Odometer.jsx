import React, { useEffect, useState } from 'react';
import '../styles/odometer.css';

const STORAGE_KEY = 'pip-dreams-delivered';

/* ── EDIT THIS VALUE BEFORE DEPLOY ──
   INITIAL_COUNT is the starting number shown on the odometer.
   Set it to 0 for a fresh production launch; localStorage on each
   visitor's device only ever ADDS to it (never below INITIAL_COUNT).
   Changes here require a rebuild (npm run build) to take effect. */
const INITIAL_COUNT = 1204;

export function getDreamsCount() {
  if (typeof window === 'undefined') return INITIAL_COUNT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= INITIAL_COUNT) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_COUNT;
}

export function incrementDreamsCount(amount = 1) {
  if (typeof window === 'undefined') return INITIAL_COUNT;
  const current = getDreamsCount();
  const next = current + amount;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {}
  window.dispatchEvent(new CustomEvent('pip:dreams-delivered-updated', { detail: next }));
  return next;
}

export default function Odometer({ value, compact = false }) {
  const [count, setCount] = useState(() => (typeof value === 'number' ? value : getDreamsCount()));

  useEffect(() => {
    if (typeof value === 'number') {
      setCount(value);
      return;
    }

    const handleUpdate = (e) => {
      if (typeof e.detail === 'number') {
        setCount(e.detail);
      } else {
        setCount(getDreamsCount());
      }
    };

    window.addEventListener('pip:dreams-delivered-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('pip:dreams-delivered-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [value]);

  const digits = String(count).padStart(4, '0').split('');

  if (compact) {
    return (
      <div
        className="odometer-compact"
        role="status"
        aria-label={`Dreams delivered: ${count} (nursery tally on this device)`}
        title="Nursery tally on this device — tap stars, catch dreams, or play lullabies to add +1"
      >
        <span className="odometer-compact-label">dreams delivered:</span>
        <div className="odometer-compact-housing" aria-hidden="true">
          {digits.map((digitChar, idx) => {
            const digitNum = parseInt(digitChar, 10) || 0;
            return (
              <div key={idx} className="odometer-compact-wheel">
                <div
                  className="odometer-compact-strip"
                  style={{ transform: `translateY(-${digitNum * 10}%)` }}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <span key={n} className="odometer-compact-digit">{n}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <span className="odometer-compact-tag">(this device)</span>
      </div>
    );
  }

  return (
    <div
      className="vintage-odometer"
      role="status"
      aria-label={`Vintage odometer: ${count} dreams delivered (nursery tally recorded on this device)`}
    >
      <div className="rivet rivet-tl" aria-hidden="true" />
      <div className="rivet rivet-tr" aria-hidden="true" />
      <div className="rivet rivet-bl" aria-hidden="true" />
      <div className="rivet rivet-br" aria-hidden="true" />

      <div className="odometer-header">
        <span className="odometer-title">✦ Dreams Delivered ✦</span>
        <span className="odometer-subtitle">nursery tally · recorded on this device</span>
      </div>

      <div className="odometer-housing" aria-hidden="true">
        {digits.map((digitChar, idx) => {
          const digitNum = parseInt(digitChar, 10) || 0;
          return (
            <div key={idx} className="odometer-wheel">
              <div
                className="odometer-strip"
                style={{ transform: `translateY(-${digitNum * 10}%)` }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span key={n} className="odometer-digit">{n}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <span className="odometer-footnote">
        records each dream caught, lullaby wound, route mapped, or star tapped
      </span>
    </div>
  );
}
