import React, { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Tilt3D — Gives children a 3D tilt toward the pointer.
 * Props:
 *   - className: optional extra class
 *   - glowColor: optional CSS color for radial glow behind the object
 *   - glowIntensity: 0–1, how strong the glow is (default 0.4)
 *   - enableFloat: whether the idle float animation plays (default true)
 *   - maskUrl: optional image URL used as an alpha mask for the hover sheen
 *     (pass the same art WebP so the sheen only lights the object, not a
 *     hard-edged square over dark panels)
 *   - style: optional inline styles
 *   - children
 */
export default function Tilt3D({
  children,
  className = '',
  glowColor,
  glowIntensity = 0.4,
  enableFloat = true,
  maskUrl,
  style,
  ...rest
}) {
  const wrapRef = useRef(null);
  const tiltRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const isTouchDragging = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const computeTilt = useCallback((clientX, clientY) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (clientX - cx) / (rect.width / 2);
    const dy = (clientY - cy) / (rect.height / 2);
    // Clamp to [-1, 1]
    const maxDeg = 10;
    tiltRef.current = {
      x: Math.max(-1, Math.min(1, dy)) * -maxDeg,
      y: Math.max(-1, Math.min(1, dx)) * maxDeg,
    };
  }, []);

  const resetTilt = useCallback(() => {
    tiltRef.current = { x: 0, y: 0 };
  }, []);

  // Animation loop: smooth lerp to target tilt
  useEffect(() => {
    if (reducedMotion) return;

    const animate = () => {
      const speed = 0.12;
      currentRef.current.x += (tiltRef.current.x - currentRef.current.x) * speed;
      currentRef.current.y += (tiltRef.current.y - currentRef.current.y) * speed;

      const el = wrapRef.current;
      if (el) {
        const rx = currentRef.current.x.toFixed(2);
        const ry = currentRef.current.y.toFixed(2);
        el.style.setProperty('--tilt-x', `${rx}deg`);
        el.style.setProperty('--tilt-y', `${ry}deg`);
        // Shadow shift based on tilt
        el.style.setProperty('--shadow-x', `${(currentRef.current.y * 0.6).toFixed(1)}px`);
        el.style.setProperty('--shadow-y', `${(-currentRef.current.x * 0.3 + 4).toFixed(1)}px`);
        el.style.setProperty('--shadow-blur', `${(12 + Math.abs(currentRef.current.x) + Math.abs(currentRef.current.y)).toFixed(0)}px`);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  // Pointer handlers
  const onPointerMove = useCallback((e) => {
    if (reducedMotion) return;
    if (e.pointerType === 'touch' && !isTouchDragging.current) return;
    computeTilt(e.clientX, e.clientY);
  }, [reducedMotion, computeTilt]);

  const onPointerDown = useCallback((e) => {
    if (reducedMotion) return;
    if (e.pointerType === 'touch') {
      isTouchDragging.current = true;
      computeTilt(e.clientX, e.clientY);
    }
  }, [reducedMotion, computeTilt]);

  const onPointerUp = useCallback(() => {
    isTouchDragging.current = false;
    resetTilt();
  }, [resetTilt]);

  const onPointerLeave = useCallback(() => {
    isTouchDragging.current = false;
    resetTilt();
  }, [resetTilt]);

  const floatClass = enableFloat && !reducedMotion ? 'tilt3d--float' : '';

  return (
    <div
      ref={wrapRef}
      className={`tilt3d-wrap ${floatClass} ${className}`}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      style={style}
      {...rest}
    >
      {/* Radial glow behind the object */}
      {glowColor && (
        <div
          className="tilt3d-glow"
          aria-hidden="true"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, transparent 70%)`,
            opacity: glowIntensity,
          }}
        />
      )}

      {/* Tiltable content */}
      <div className="tilt3d-content">
        {children}
      </div>

      {/* Sheen overlay */}
      <div
        className="tilt3d-sheen"
        aria-hidden="true"
        style={maskUrl ? { '--tilt3d-art-mask': `url(${maskUrl})` } : undefined}
      />

      {/* Contact shadow */}
      <div className="tilt3d-shadow" aria-hidden="true" />
    </div>
  );
}
