import { useState } from 'react';
import { DAILY_STICKERS, SPECIAL_STICKERS } from '../data/stickers';
import { useGame } from '../engine/store';
import { sfx } from '../engine/sfx';

/** Sticker book page in the Career Passport. Tap a sticker to see what it is. */
export function StickerBook() {
  const { game } = useGame();
  const have = new Set(game.stickers ?? []);
  const [info, setInfo] = useState<string | null>(null);
  const days = DAILY_STICKERS.filter((s) => have.has(s.id)).length;
  const sticker = (id: string, icon: string, name: string, how: string | undefined, got: boolean, i: number) => (
    <button key={id} aria-label={got ? name : `Locked: ${how ?? 'play another day'}`} onClick={() => { sfx(got ? 'sparkle' : 'tap'); setInfo(got ? `${icon} ${name}` : `🔒 ${how ?? 'Come back another day for a new sticker!'}`); }}
      className={`sticker ${got ? 'got' : ''}`} style={{ rotate: `${((i * 37) % 13) - 6}deg` }}>
      {got ? icon : '?'}
    </button>
  );
  return (
    <section className="rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-4 sm:p-6 sticker-book">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-display text-2xl font-extrabold text-ink">📒 Sticker book</h2>
        <span className="font-body text-ink/80">{have.size} of {DAILY_STICKERS.length + SPECIAL_STICKERS.length} stickers</span>
      </div>
      <p className="font-body text-ink/80 mt-1">Play each day to get a new sticker. Special stickers are for things you do around town.</p>
      <h3 className="font-display font-bold text-ink mt-3">Daily stickers ({days} days)</h3>
      <div className="sticker-grid mt-1">{DAILY_STICKERS.map((s, i) => sticker(s.id, s.icon, s.name, undefined, have.has(s.id), i))}</div>
      <h3 className="font-display font-bold text-ink mt-3">Special stickers</h3>
      <div className="sticker-grid mt-1">{SPECIAL_STICKERS.map((s, i) => sticker(s.id, s.icon, s.name, s.how, have.has(s.id), i + 3))}</div>
      {info && <div className="mt-3 rounded-2xl border-[3px] border-ink px-3 py-2 font-display font-bold text-ink" style={{ background: "#FFEBA8" }}>{info}</div>}
    </section>
  );
}
