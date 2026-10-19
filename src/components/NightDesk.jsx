import React, { useEffect, useRef, useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import '../styles/night-desk.css';

const MEMORY_KEY = 'pip:night-desk-memory';
const WISH_KEY = 'pip:dream-wishes';
const MAX_WISHES = 40;

const SEED_WISHES = [
  { id: 'seed-1', name: 'Mira', text: 'That my little brother sleeps through the thunder.', when: 'night 004', glyph: '☾' },
  { id: 'seed-2', name: 'Tomas', text: 'A dream where the commute is a train made of clouds.', when: 'night 005', glyph: '✦' },
  { id: 'seed-3', name: 'Ines', text: 'Please water my plants while I dream.', when: 'night 006', glyph: '♫' },
];

function loadJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be full or disabled — the desk still works for this visit */
  }
}

function formatWhen() {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

export default function NightDesk({ onToast }) {
  const [memory, setMemory] = useState({});
  const [wishes, setWishes] = useState(SEED_WISHES);
  const [wishName, setWishName] = useState('');
  const [wishText, setWishText] = useState('');
  const [justLeft, setJustLeft] = useState(false);

  useEffect(() => {
    const stored = loadJSON(MEMORY_KEY, {});
    const visits = (Number(stored.visits) || 0) + 1;
    const next = { ...stored, visits, lastSeen: Date.now() };
    saveJSON(MEMORY_KEY, next);
    setMemory(next);
    if (stored.name) setWishName(stored.name);

    const storedWishes = loadJSON(WISH_KEY, []);
    if (Array.isArray(storedWishes) && storedWishes.length) {
      setWishes([...storedWishes, ...SEED_WISHES].slice(0, MAX_WISHES));
    }
  }, []);

  const handleWishSubmit = (event) => {
    event.preventDefault();
    const text = wishText.trim();
    if (!text) return;

    const cleanName = (wishName.trim() || memory.name || 'a sleepy stranger').slice(0, 28);
    const wish = {
      id: `wish-${Date.now()}`,
      name: cleanName,
      text: text.slice(0, 180),
      when: formatWhen(),
      glyph: ['✦', '☾', '♫', '✧'][Math.floor(Math.random() * 4)],
      mine: true,
    };

    const mine = wishes.filter((w) => w.mine);
    const nextWishes = [wish, ...mine, ...SEED_WISHES].slice(0, MAX_WISHES);
    setWishes(nextWishes);
    saveJSON(WISH_KEY, [wish, ...mine].slice(0, MAX_WISHES));

    const nextMemory = { ...memory, name: cleanName, lastWish: wish.id, wishesLeft: (memory.wishesLeft || 0) + 1 };
    saveJSON(MEMORY_KEY, nextMemory);
    setMemory(nextMemory);
    setWishName(cleanName);
    setWishText('');
    setJustLeft(true);
    window.setTimeout(() => setJustLeft(false), 2600);

    if (onToast) onToast(`Pip pinned your wish to the PipCity wall, ${cleanName}. ✦`);
  };

  return (
    <section className="night-desk section-shell" id="night-desk">
      <div className="section-heading-row night-desk__heading">
        <div>
          <div className="section-label">04 / THE NIGHT DESK</div>
          <h2>Leave a wish. Pip keeps the ledger.</h2>
        </div>
        <p className="section-side-note">one small lamp, two chairs, no queue.</p>
      </div>

      <div className="night-desk__grid">
        {/* ── Wish form ── */}
        <form className="desk-panel desk-wish" onSubmit={handleWishSubmit}>
          <div className="desk-panel__top">
            <span className="desk-panel__label"><Sparkles size={13} /> dream guestbook</span>
            <span className="desk-wish__count">{wishes.length} wishes</span>
          </div>

          <p className="desk-wish__intro">
            Tell Pip one thing you would like waiting on the other side of sleep.
            He reads every wish before he clocks out.
          </p>

          <label className="desk-field">
            <span>your name</span>
            <input
              type="text"
              value={wishName}
              onChange={(e) => setWishName(e.target.value)}
              placeholder="a sleepy stranger"
              maxLength={28}
            />
          </label>

          <label className="desk-field">
            <span>your wish</span>
            <textarea
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              placeholder="I would like a dream about…"
              rows={3}
              maxLength={180}
              required
            />
          </label>

          <button type="submit" className="desk-wish__submit" disabled={!wishText.trim()}>
            <Star size={14} /> pin it to the wall
          </button>

          <p className="desk-wish__note">
            {justLeft ? 'pinned. the lamp flickered once, which means Pip saw it.' : 'wishes stay on this device — PipCity is offline at night.'}
          </p>

          <div className="desk-wish__wall">
            {wishes.slice(0, 5).map((wish) => (
              <article key={wish.id} className={`wish-card ${wish.mine ? 'wish-card--mine' : ''}`}>
                <span className="wish-card__glyph" aria-hidden="true">{wish.glyph}</span>
                <p className="wish-card__text">{wish.text}</p>
                <div className="wish-card__meta">
                  <span className="wish-card__name">{wish.name}</span>
                  <span>{wish.when}</span>
                </div>
              </article>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
