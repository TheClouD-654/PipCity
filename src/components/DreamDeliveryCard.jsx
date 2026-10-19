import React, { useEffect, useRef, useState } from 'react';
import { incrementDreamsCount } from './Odometer.jsx';

function getRouteStatus(progress) {
  if (progress < 0.2) {
    return {
      id: 'departing',
      label: 'DEPARTING',
      location: "Pip's Room",
      detail: 'route 07 clear',
    };
  }
  if (progress < 0.85) {
    return {
      id: 'in-transit',
      label: 'IN TRANSIT',
      location: 'Rooftop 07',
      detail: 'quiet corridor · crossing chimneys',
    };
  }
  return {
    id: 'delivery-complete',
    label: 'DELIVERY COMPLETE',
    location: 'Moon Window',
    detail: 'dream safely delivered · sleep tight',
  };
}

export default function DreamDeliveryCard({ project, onPlay, onToast }) {
  const cardRef = useRef(null);
  const mapRef = useRef(null);
  const pathRef = useRef(null);
  const manualOverrideRef = useRef(false);

  // Check prefers-reduced-motion once at initialization
  const isReducedMotion = () => {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const [progress, setProgress] = useState(() => (isReducedMotion() ? 1.0 : 0));
  const [totalLength, setTotalLength] = useState(360);
  const [markerType, setMarkerType] = useState('plane'); // 'plane' | 'moon'

  // Measure path total length on mount
  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len && !isNaN(len)) {
          setTotalLength(len);
        }
      } catch (e) {
        // Fallback length 360
      }
    }
  }, []);

  // Passive scroll progress listener using the map's viewport position.
  // The card is tall on mobile, so card-based progress lit the map before
  // the map itself was on screen.
  useEffect(() => {
    if (isReducedMotion()) {
      setProgress(1.0);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!mapRef.current) return;
      if (manualOverrideRef.current) {
        manualOverrideRef.current = false;
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!mapRef.current) {
            ticking = false;
            return;
          }
          const rect = mapRef.current.getBoundingClientRect();
          const winHeight = window.innerHeight || 800;
          const mapCenter = rect.top + rect.height / 2;

          // Wait until the whole map is on screen, then finish when it sits
          // near the middle of the viewport. This prevents the route from
          // starting or glowing while the card is still entering.
          const start = winHeight - rect.height / 2;
          const end = winHeight * 0.45;
          const span = Math.max(120, start - end);
          const raw = (start - mapCenter) / span;
          const clamped = Math.max(0, Math.min(1, raw));

          setProgress((prev) => {
            if (Math.abs(prev - clamped) > 0.004) {
              return clamped;
            }
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const clampedProgress = isReducedMotion() ? 1.0 : Math.max(0, Math.min(1, progress));

  // Compute markerPos and tangent angle synchronously along SVG path via getPointAtLength
  let markerPos = { x: 49, y: 188 };
  let markerAngle = -35;

  if (pathRef.current && totalLength) {
    try {
      const currentDist = clampedProgress * totalLength;
      const pt = pathRef.current.getPointAtLength(currentDist);
      if (pt && !isNaN(pt.x) && !isNaN(pt.y)) {
        markerPos = { x: pt.x, y: pt.y };

        // Sample slightly ahead for the tangent angle. At the very end there
        // is nothing ahead, so sample behind and reverse the vector. Without
        // this fallback the plane snaps to 0° at 100% progress.
        const lookahead = 8;
        const aheadDist = Math.min(totalLength, currentDist + lookahead);
        const ptAhead = pathRef.current.getPointAtLength(aheadDist);
        const aheadDx = ptAhead ? ptAhead.x - pt.x : 0;
        const aheadDy = ptAhead ? ptAhead.y - pt.y : 0;

        if (Math.hypot(aheadDx, aheadDy) > 0.01) {
          markerAngle = Math.atan2(aheadDy, aheadDx) * (180 / Math.PI);
        } else {
          const behindDist = Math.max(0, currentDist - lookahead);
          const ptBehind = pathRef.current.getPointAtLength(behindDist);
          if (ptBehind) {
            const dx = pt.x - ptBehind.x;
            const dy = pt.y - ptBehind.y;
            if (Math.hypot(dx, dy) > 0.01) {
              markerAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            }
          }
        }
      }
    } catch (e) {
      // SVG geometry fallback
    }
  }

  const status = getRouteStatus(clampedProgress);
  const reachedDestination = clampedProgress >= 0.85;

  const handleManualStep = () => {
    manualOverrideRef.current = true;
    incrementDreamsCount();
    let nextProgress;
    if (progress < 0.25) {
      nextProgress = 0.55;
    } else if (progress < 0.85) {
      nextProgress = 1.0;
    } else {
      nextProgress = 0;
    }
    setProgress(nextProgress);
    const nextStatus = getRouteStatus(nextProgress);
    if (onToast) {
      onToast(`Route 07: ${nextStatus.label} · ${nextStatus.location}`);
    } else {
      onPlay?.('routes');
    }
  };

  const toggleMarkerType = (e) => {
    e.stopPropagation();
    setMarkerType((prev) => (prev === 'plane' ? 'moon' : 'plane'));
    if (onToast) {
      onToast(`Courier marker switched to ${markerType === 'plane' ? 'crescent moon ☾' : 'paper-plane ✈'}`);
    }
  };

  const Icon = project.icon;

  return (
    <article
      ref={cardRef}
      className={`project-card project-routes ${reachedDestination ? 'destination-reached' : ''}`}
      id="project-routes"
    >
      <div className="project-topline">
        <span>{project.number}</span>
        <span>{project.eyebrow}</span>
        <div className="route-topline-status" role="status" aria-live="off">
          <span className={`route-status-dot dot-${status.id}`} />
          <span className="route-status-text">{status.label}</span>
        </div>
      </div>

      <div className="project-content">
        <div className="project-copy">
          <div className="project-icon"><Icon size={18} /></div>
          <h3>{project.title}</h3>
          <p>{project.text}</p>

          <div className="route-controls-area">
            <div className="route-editorial-indicator" role="status" aria-live="polite">
              <span className="route-indicator-tag">DISPATCH #07</span>
              <span className="route-indicator-mode">{status.label}</span>
              <span className="route-indicator-sep">·</span>
              <span className="route-indicator-desc">{status.detail}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="project-link route-step-trigger"
                onClick={handleManualStep}
                aria-label={`${project.note}. Current delivery status: ${status.label} at ${status.location}. Click to cycle route preview.`}
                title="Click or press enter to preview waypoints along Route 07"
              >
                <span>{project.note}</span>
                <span className="cycle-arrow">↗</span>
              </button>

              <button
                type="button"
                onClick={toggleMarkerType}
                className="marker-toggle-pill"
                style={{
                  font: '10px "DM Mono", monospace',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  color: 'var(--brown)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Toggle marker between paper-plane and moon courier"
                aria-label={`marker: ${markerType === 'plane' ? 'paper-plane ✈' : 'moon ☾'} — currently the ${markerType} marker. Tap to switch.`}
              >
                <span>marker: {markerType === 'plane' ? 'paper-plane ✈' : 'moon ☾'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="project-art route-art-panel">
          <div
            ref={mapRef}
            className="dream-map"
            aria-label="Illustrated dream delivery route from Pip's Room across Rooftop 07 to Moon Window"
            onClick={handleManualStep}
            role="img"
            title="Scroll through or tap to inspect delivery waypoints"
          >
            <div className="map-sky" />
            <div
              className={`map-moon ${reachedDestination ? 'destination-reached' : ''}`}
              aria-hidden="true"
            >
              ☾
            </div>
            <div
              className={`map-house house-a ${clampedProgress < 0.25 ? 'window-lit' : ''}`}
              aria-hidden="true"
            >
              <div className="house-a-window" />
            </div>
            <div className="map-house house-b" aria-hidden="true" />
            <div
              className={`map-house house-c ${reachedDestination ? 'window-lit' : ''}`}
              aria-hidden="true"
            >
              <div className="house-c-window" />
            </div>

            <svg viewBox="0 0 360 250" className="route-svg" aria-hidden="true">
              {/* Base guide dashed path */}
              <path
                ref={pathRef}
                d="M49 188 C92 125 98 205 158 130 S252 100 306 34"
                className="route-path-guide"
              />

              {/* Subtly illuminated travelled route portion */}
              <path
                d="M49 188 C92 125 98 205 158 130 S252 100 306 34"
                className="route-path-travelled"
                style={{
                  strokeDasharray: totalLength || 360,
                  strokeDashoffset: (totalLength || 360) * (1 - clampedProgress),
                }}
              />

              {/* Small marker (paper-plane or moon) traveling along SVG path via getPointAtLength */}
              <g
                className="route-delivery-marker"
                transform={`translate(${markerPos.x}, ${markerPos.y}) rotate(${markerType === 'plane' ? markerAngle : 0})`}
              >
                <circle r="14" className="marker-halo" />

                {markerType === 'plane' ? (
                  <g className="marker-plane-group">
                    {/* Shadow / bottom fold */}
                    <path
                      d="M -11 -7 L 13 0 L -11 7 L -4 0 Z"
                      className="marker-plane-base"
                    />
                    {/* Upper wing highlight */}
                    <path
                      d="M -11 -7 L 13 0 L -4 0 Z"
                      className="marker-plane-top"
                    />
                    {/* Origami spine */}
                    <line
                      x1="-4"
                      y1="0"
                      x2="13"
                      y2="0"
                      className="marker-plane-spine"
                    />
                    {/* Tiny sparkle nose */}
                    <circle cx="13" cy="0" r="1.8" className="marker-plane-sparkle" />
                  </g>
                ) : (
                  <g className="marker-moon-group">
                    <path
                      d="M -3 -8 A 8 8 0 0 0 5 8 A 7 7 0 0 1 -3 -8 Z"
                      className="marker-moon-path"
                    />
                    <circle cx="4" cy="-2" r="1.6" className="marker-plane-sparkle" />
                  </g>
                )}
              </g>
            </svg>

            <span className={`route-label label-a ${clampedProgress < 0.25 ? 'active' : ''}`}>PIP'S ROOM</span>
            <span className={`route-label label-b ${clampedProgress >= 0.25 && clampedProgress < 0.8 ? 'active' : ''}`}>ROOFTOP 07</span>
            <span className={`route-label label-c ${clampedProgress >= 0.8 ? 'active' : ''}`}>MOON WINDOW</span>
          </div>
        </div>
      </div>
    </article>
  );
}
