import { useEffect, useState } from 'react';
import type { BuildingId } from '../engine/types';
import { WORKERS } from '../data/workers';
import { TOWNFOLK } from '../data/townfolk';
import { PAPER_BASES } from '../data/paperArt';
import { PaperArt } from './Paper';
import { useGame } from '../engine/store';
import { sfx } from '../engine/sfx';

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** The person who works in this building: stands in the room; tap to hear about their job (one line per tap). */
export function Worker({ building }: { building: BuildingId }) {
  const t = TOWNFOLK[building];
  // places without a worker use their town person (hello + what the job is like)
  const w = WORKERS[building] ?? (t ? { name: t.name, job: t.job, look: t.look, lines: [t.hello, t.fact, 'Try it: bring your friends in and play! Tap things to see what they do.'] } : undefined);
  const { game, dispatch } = useGame();
  const [line, setLine] = useState<number | null>(null);
  useEffect(() => () => { if (canSpeak()) window.speechSynthesis.cancel(); }, []);
  if (!w) return null;
  const aspect = PAPER_BASES[w.look.base].canvas[2] / PAPER_BASES[w.look.base].canvas[3];
  const tap = () => {
    sfx('pop');
    if (line === w.lines.length - 1) { setLine(null); return; }   // “Bye!”
    const next = line === null ? 0 : line + 1;
    setLine(next);
    // listened to everything: a small thank-you, once per building
    if (next === w.lines.length - 1 && !game.owned.includes(`talk:${building}`)) {
      dispatch({ type: 'OWN', id: `talk:${building}` });
      dispatch({ type: 'REWARD', reward: { coins: 10, xp: 5, title: `You learned about being a ${w.job.toLowerCase()}!` } });
    }
  };
  const read = () => {
    if (!canSpeak() || line === null) return;
    const s = window.speechSynthesis; s.cancel();
    const u = new SpeechSynthesisUtterance(w.lines[line]); u.lang = 'en-US'; u.rate = 0.92; u.pitch = 1.05; s.speak(u);
  };
  return (
    <div className="worker absolute" style={{ right: '1.5%', bottom: '10%', height: '58%', aspectRatio: String(aspect), zIndex: 25 }}>
      <button aria-label={`Talk to ${w.name}`} onClick={tap} className="worker-btn w-full h-full">
        <PaperArt p={w.look} face={line === null ? 'happy' : line % 2 ? 'giggle' : 'laughing'} />
      </button>
      {line === null
        ? <span className="worker-tag">💬 {w.name}</span>
        : (
          <div className="worker-bubble rounded-[28px] border-[3px] border-ink bg-white p-3 shadow-chunkysm">
            <div className="font-display font-bold text-ink text-sm">{w.name} · {w.job}</div>
            <p className="font-body text-ink mt-1" style={{ lineHeight: 1.35 }}>{w.lines[line]}</p>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={tap} className="rounded-xl border-[3px] border-ink bg-sun px-3 h-9 font-display font-bold text-ink text-sm">
                {line === w.lines.length - 1 ? 'Bye!' : 'Tell me more'}
              </button>
              {canSpeak() && <button aria-label="Read to me" onClick={read} className="rounded-xl border-[3px] border-ink bg-white h-9 w-9">🔊</button>}
              <span className="font-body text-ink/70" style={{ marginLeft: 'auto', fontSize: 12 }}>{line + 1}/{w.lines.length}</span>
            </div>
          </div>
        )}
    </div>
  );
}
