import React from 'react';
import '../styles/credits.css';

export default function Credits() {
  return (
    <div className="credits-block" aria-label="Site credits and acknowledgements">
      <div className="credits-header">
        <span className="credits-badge">Credits &amp; Colophon</span>
      </div>
      <ul className="credits-grid">
        <li className="credits-item">
          <span className="credits-label">Pip Artwork</span>
          <span className="credits-detail">Official haX.baby Track 1 asset pack</span>
        </li>
        <li className="credits-item">
          <span className="credits-label">Core Tech &amp; Libraries</span>
          <span className="credits-detail">Built with React, Vite, and Lucide React</span>
        </li>
        <li className="credits-item">
          <span className="credits-label">Typography</span>
          <span className="credits-detail">DM Sans, DM Mono, Fraunces, and Fredoka (Google Fonts)</span>
        </li>
        <li className="credits-item">
          <span className="credits-label">Sound Synthesis</span>
          <span className="credits-detail">All sounds are synthesized live with the Web Audio API</span>
        </li>
        <li className="credits-item">
          <span className="credits-label">Hackathon</span>
          <span className="credits-detail">Made for haX.baby Baby&rsquo;s First Website (Track 1)</span>
        </li>
        <li className="credits-item">
          <span className="credits-label">AI Collaboration</span>
          <span className="credits-detail">Built with help from AI coding tools</span>
        </li>
        <li className="credits-item">
          <span className="credits-label">Sleeping Pose</span>
          <span className="credits-detail">Pip&rsquo;s sleeping pose is a small edit of the official asset (raised hand lowered)</span>
        </li>
        <li className="credits-item">
          <span className="credits-label">Asset Edits</span>
          <span className="credits-detail">Backgrounds removed from the official lantern and music box assets</span>
        </li>
      </ul>
    </div>
  );
}
