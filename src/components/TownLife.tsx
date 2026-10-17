import { useState } from 'react';
import type { CharacterData } from '../engine/types';
import { Person } from './Person';
import { sfx } from '../engine/sfx';
import { PHASE_ICON, PHASE_LABEL, nextPhase, type Phase } from '../engine/dayPhase';

/* Sidewalks on the painted town map, in % of the picture: [left end, right end, feet line]. */
const LANES: [number, number, number][] = [
  [3, 92, 37.6],    // the main road along the top row
  [46, 80, 61.8],   // the path in front of the Tech Lab and K-pop Academy
  [42, 75, 82.6],   // the plaza in front of the shops and the restaurant
  [9, 26, 86.5],    // the fishing dock
];
const PLACES = ['the Park', 'the Cafe', 'the Beach', 'the Playground', 'the K-pop Academy', 'the Shopping Center', 'School', 'the Fishing dock', 'get ice cream'];
const W = 3.2, H = 9.5;

/** Family and friends strolling around town. Tap one to say hi. */
export function TownWalkers({ people, night }: { people: CharacterData[]; night: boolean }) {
  const [said, setSaid] = useState<{ id: string; text: string } | null>(null);
  const shown = night ? [] : people.slice(0, 4);
  const hi = (c: CharacterData, i: number) => {
    sfx('pop');
    const text = `Hi! I’m ${c.name}. I’m going to ${PLACES[(i * 3 + Math.floor(Math.random() * PLACES.length)) % PLACES.length]}!`;
    setSaid({ id: c.id, text }); window.setTimeout(() => setSaid((s) => (s?.id === c.id ? null : s)), 2600);
  };
  return (
    <>
      {shown.map((c, i) => {
        const [x0, x1, feet] = LANES[i % LANES.length];
        const dur = 26 + i * 7, delay = -(i * 9);
        return (
          <div key={c.id} className="stroller absolute" style={{ top: `${feet - H}%`, width: `${W}%`, height: `${H}%`, zIndex: 11,
            ['--x0' as string]: `${x0}%`, ['--x1' as string]: `${x1}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
            <button aria-label={`Say hi to ${c.name}`} onClick={() => hi(c, i)} className="stroller-body w-full h-full" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
              <div className="w-full h-full stroller-hop"><Person c={c} mood={said?.id === c.id ? 'happy' : 'normal'} /></div>
            </button>
            {said?.id === c.id && <div className="stroller-say">{said.text}</div>}
          </div>
        );
      })}
    </>
  );
}

/* Lamps and lit windows on the painted map (px in the 1536 × 1024 picture). */
const LAMPS: [number, number][] = [[318, 352], [458, 268], [660, 292], [770, 248], [1030, 290], [1250, 300], [358, 492], [572, 506], [686, 456], [800, 378], [812, 512], [1030, 518], [1210, 522], [800, 662], [1142, 690], [1162, 728], [668, 742], [340, 740], [850, 884], [1252, 600]];
const WINDOWS: [number, number, number][] = [[175, 230, 70], [540, 215, 90], [870, 250, 100], [1150, 245, 70], [1400, 255, 60], [880, 480, 60], [1130, 470, 70], [1370, 490, 60], [210, 470, 70], [560, 690, 110], [930, 700, 80], [1260, 710, 60]];

/** Tint and lights for the time of day, drawn over the town picture. */
export function DayNight({ phase }: { phase: Phase }) {
  if (phase === 'day') return null;
  return (
    <div className={`daynight ${phase}`} aria-hidden>
      <div className="daynight-tint" />
      {phase !== 'morning' && WINDOWS.map(([x, y, r], i) => <span key={`w${i}`} className="glow window" style={{ left: `${(x / 1536) * 100}%`, top: `${(y / 1024) * 100}%`, width: `${(r / 1536) * 200}%` }} />)}
      {phase === 'night' && LAMPS.map(([x, y], i) => <span key={`l${i}`} className="glow lamp" style={{ left: `${(x / 1536) * 100}%`, top: `${(y / 1024) * 100}%` }} />)}
      {phase === 'night' && <>
        <span className="moon">🌙</span>
        {[6, 14, 23, 31, 44, 57, 66, 79, 88, 95].map((x, i) => <span key={x} className="star" style={{ left: `${x}%`, top: `${1 + (i % 3) * 2}%`, animationDelay: `${i * 0.3}s` }}>✦</span>)}
      </>}
    </div>
  );
}

/** The sun/moon button that changes the time of day. */
export function PhaseButton({ phase }: { phase: Phase }) {
  return (
    <button aria-label={`Time of day: ${PHASE_LABEL[phase]}. Tap to change`} onClick={() => { sfx('sparkle'); nextPhase(); }}
      className="phase-btn rounded-2xl border-[3px] border-ink bg-white shadow-chunkysm font-display font-bold text-ink">
      <span style={{ fontSize: 22 }}>{PHASE_ICON[phase]}</span><span className="phase-label">{PHASE_LABEL[phase]}</span>
    </button>
  );
}
