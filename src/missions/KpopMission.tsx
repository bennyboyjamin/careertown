import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback, Stars } from './MissionShell';
import { sfx, drum, note } from '../engine/sfx';
import { Person } from '../components/Person';
import { KPOP_PROPS } from '../data/kpopProps';
import danceRoom from '../assets/places/kpop-studio.webp';

const STEPS = ['Dance', 'Song', 'Show'];

/* ───────────── 1. Dance practice: tap the pad when a heart reaches the line ───────────── */
const LANES = [
  { icon: '💖', color: '#FF7FB5', key: ['ArrowLeft', 'd'] },
  { icon: '⭐', color: '#FFC93C', key: ['ArrowDown', 'f'] },
  { icon: '🎵', color: '#7FB8FF', key: ['ArrowUp', 'j'] },
  { icon: '💜', color: '#B48CFF', key: ['ArrowRight', 'k'] },
];
const BPM = 92, BEAT = 60000 / BPM, FALL = BEAT * 2.2, LEAD = BEAT * 4;
// lane per beat (-1 = rest): a little routine that speeds up near the end
const ROUTINE = [0, -1, 1, -1, 2, -1, 3, -1, 0, 1, 2, 3, -1, 3, -1, 0, 1, -1, 2, -1, 0, 2, 1, 3, -1, 0, -1, 3];
const PERFECT = 130, GOOD = 260;
type Hit = 'perfect' | 'good' | 'miss';

function DanceGame({ onDone }: { onDone: (stars: number) => void }) {
  const notes = useMemo(() => ROUTINE.flatMap((lane, b) => (lane < 0 ? [] : [{ lane, at: LEAD + b * BEAT }])), []);
  const [phase, setPhase] = useState<'ready' | 'play' | 'end'>('ready');
  const [now, setNow] = useState(0);
  const [hits, setHits] = useState<(Hit | null)[]>(() => notes.map(() => null));
  const [flash, setFlash] = useState<{ lane: number; text: string; id: number } | null>(null);
  const t0 = useRef(0); const raf = useRef(0); const lastBeat = useRef(-1);
  const hitsRef = useRef(hits); hitsRef.current = hits;
  const end = LEAD + ROUTINE.length * BEAT + BEAT;

  const start = () => { setHits(notes.map(() => null)); lastBeat.current = -1; t0.current = performance.now(); setPhase('play'); sfx('pop'); };
  useEffect(() => {
    if (phase !== 'play') return;
    const tick = () => {
      const t = performance.now() - t0.current; setNow(t);
      const beat = Math.floor(t / BEAT);
      if (beat !== lastBeat.current) { lastBeat.current = beat; drum(beat % 2 ? 'hat' : 'kick'); if (beat < 4) sfx('tick'); }
      // notes that slipped past count as misses
      const h = hitsRef.current; let changed = false; const next = [...h];
      notes.forEach((n, i) => { if (!next[i] && t - n.at > GOOD) { next[i] = 'miss'; changed = true; } });
      if (changed) setHits(next);
      if (t > end) { setPhase('end'); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, notes, end]);

  const press = useCallback((lane: number) => {
    if (phase !== 'play') return;
    const t = performance.now() - t0.current;
    let best = -1, bestD = Infinity;
    notes.forEach((n, i) => { if (n.lane === lane && !hitsRef.current[i]) { const d = Math.abs(t - n.at); if (d < bestD) { bestD = d; best = i; } } });
    if (best < 0 || bestD > GOOD) { setFlash({ lane, text: '·', id: t }); return; }
    const r: Hit = bestD <= PERFECT ? 'perfect' : 'good';
    const next = [...hitsRef.current]; next[best] = r; setHits(next);
    note([523, 587, 659, 784][lane] * (r === 'perfect' ? 2 : 1), 0.12, 0, 'bell');
    setFlash({ lane, text: r === 'perfect' ? 'Perfect!' : 'Good!', id: t });
  }, [phase, notes]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { const i = LANES.findIndex((l) => l.key.includes(e.key)); if (i >= 0) { e.preventDefault(); press(i); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [press]);

  const scored = hits.filter((h) => h === 'perfect').length + hits.filter((h) => h === 'good').length * 0.7;
  const pct = scored / notes.length;
  const stars = pct >= 0.85 ? 3 : pct >= 0.65 ? 2 : pct >= 0.4 ? 1 : 0;

  if (phase === 'ready' || phase === 'end') return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">{phase === 'ready' ? 'Dance practice with Luna' : stars ? 'Great dancing!' : 'Nice try!'}</h2>
      {phase === 'ready'
        ? <p className="font-body text-ink text-lg mt-1">Dancers learn moves by practising to the beat. When a shape reaches the line, tap its pad. Listen for the drum!</p>
        : <>
            <Stars n={stars} />
            <p className="font-body text-ink text-lg mt-1">You hit {hits.filter((h) => h && h !== 'miss').length} of {notes.length} moves. {stars ? 'Luna gives you a big thumbs up! 👍' : 'Practice makes progress. Want to try again?'}</p>
          </>}
      <div className="flex flex-wrap gap-2 mt-3">
        <Btn tone={phase === 'ready' ? 'berry' : 'white'} onClick={start}>{phase === 'ready' ? '▶ Start dancing' : '🔁 Practise again'}</Btn>
        {phase === 'end' && stars > 0 && <Btn tone="mint" onClick={() => onDone(stars)}>Next: make a song →</Btn>}
      </div>
    </Panel>
  );

  return (
    <div className="kpop-dance rounded-[28px] border-[4px] border-ink overflow-hidden relative" style={{ backgroundImage: `url(${danceRoom})`, backgroundSize: 'cover', backgroundPosition: 'left center' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(40,20,70,.45)' }} />
      <div className="kpop-lanes relative grid grid-cols-4">
        {LANES.map((l, li) => (
          <div key={li} className="relative" style={{ borderLeft: li ? '2px dashed rgba(255,255,255,.25)' : undefined }}>
            {notes.map((n, i) => {
              if (n.lane !== li || hits[i]) return null;
              const y = 1 - (n.at - now) / FALL;   // 0 = top, 1 = hit line
              if (y < -0.1 || y > 1.25) return null;
              return <div key={i} className="kpop-note" style={{ top: `calc(${y * 78}% - 28px)`, background: l.color }}>{l.icon}</div>;
            })}
            {flash?.lane === li && <div key={flash.id} className="kpop-flash">{flash.text}</div>}
          </div>
        ))}
        <div className="kpop-line" />
      </div>
      <div className="relative grid grid-cols-4 gap-2 p-2">
        {LANES.map((l, li) => (
          <button key={li} aria-label={`Pad ${li + 1}`} onPointerDown={(e) => { e.preventDefault(); press(li); }}
            className="kpop-pad rounded-2xl border-[4px] border-ink font-display text-3xl" style={{ background: l.color }}>{l.icon}</button>
        ))}
      </div>
    </div>
  );
}

/* ───────────── 2. Recording booth: build a beat on an 8-step grid ───────────── */
const ROWS = [
  { name: 'Sparkle', icon: '✨', play: (i: number, w: number) => note([1047, 1175, 1319, 1568, 1760, 1568, 1319, 1175][i], 0.18, w, 'bell') },
  { name: 'Sing', icon: '🎤', play: (i: number, w: number) => note([523, 587, 659, 784, 880, 784, 659, 587][i], 0.22, w, 'sing') },
  { name: 'Bass', icon: '🎸', play: (i: number, w: number) => note([131, 131, 165, 165, 196, 196, 147, 147][i], 0.24, w, 'bass') },
  { name: 'Clap', icon: '👏', play: (_: number, w: number) => drum('clap', w) },
  { name: 'Drum', icon: '🥁', play: (_: number, w: number) => drum('kick', w) },
];
type Grid = boolean[][];
const STEP_MS = 60000 / 112 / 2;
const STARTER: Grid = ROWS.map((_, r) => Array.from({ length: 8 }, (_, i) => (r === 4 ? i % 4 === 0 : r === 3 ? i % 4 === 2 : false)));

function usePlayer(grid: Grid, playing: boolean, loops = Infinity, onEnd?: () => void) {
  const [step, setStep] = useState(-1);
  const g = useRef(grid); g.current = grid;
  useEffect(() => {
    if (!playing) { setStep(-1); return; }
    let i = 0;
    const id = window.setInterval(() => {
      const s = i % 8;
      if (i >= loops * 8) { window.clearInterval(id); setStep(-1); onEnd?.(); return; }
      g.current.forEach((row, r) => { if (row[s]) ROWS[r].play(s, 0); });
      setStep(s); i++;
    }, STEP_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, loops]);
  return step;
}

const NAMES = ['Starlight Dream', 'Rainbow Beat', 'Sparkle Heart', 'Dance Together'];

function SongMaker({ onDone }: { onDone: (grid: Grid, name: string) => void }) {
  const [grid, setGrid] = useState<Grid>(STARTER);
  const [playing, setPlaying] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const step = usePlayer(grid, playing);
  const toggle = (r: number, i: number) => {
    const next = grid.map((row) => [...row]); next[r][i] = !next[r][i]; setGrid(next);
    if (next[r][i]) ROWS[r].play(i, 0); setMsg(null);
  };
  const melody = grid.slice(0, 3).flat().filter(Boolean).length;
  const finish = () => {
    if (melody < 3) { sfx('fail'); setMsg({ ok: false, text: 'Your song needs a tune! Add at least 3 notes in the ✨ Sparkle, 🎤 Sing or 🎸 Bass rows.' }); return; }
    if (!name) { sfx('fail'); setMsg({ ok: false, text: 'Pick a name for your song first.' }); return; }
    setPlaying(false); sfx('success'); onDone(grid, name);
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Make your song in the studio</h2>
      <p className="font-body text-ink text-lg mt-1">Music producers build songs out of beats and notes. The drum and clap are already going. Tap squares to add notes, then press Play to hear it.</p>
      <div className="kpop-grid mt-3">
        {ROWS.map((row, r) => (
          <div key={row.name} className="flex items-center gap-1 mb-1">
            <div className="kpop-row-name font-display font-bold text-ink"><span className="mr-1">{row.icon}</span>{row.name}</div>
            {grid[r].map((on, i) => (
              <button key={i} aria-label={`${row.name} step ${i + 1}${on ? ' on' : ''}`} aria-pressed={on} onClick={() => toggle(r, i)}
                className={`kpop-cell rounded-xl border-[3px] border-ink ${on ? 'on' : ''} ${step === i ? 'now' : ''} ${i % 4 === 0 ? 'bar' : ''}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Btn tone={playing ? 'white' : 'sky'} onClick={() => setPlaying(!playing)}>{playing ? '⏹ Stop' : '▶ Play'}</Btn>
        <Btn tone="white" onClick={() => { setGrid(STARTER); setMsg(null); }}>Start over</Btn>
      </div>
      <div className="font-display font-bold text-ink mt-3">Name your song</div>
      <div className="flex flex-wrap gap-2 mt-1">
        {NAMES.map((n) => (
          <button key={n} onClick={() => { sfx('pop'); setName(n); setMsg(null); }}
            className={`rounded-2xl border-[3px] border-ink px-3 h-11 font-display font-bold text-ink ${name === n ? 'bg-sun' : 'bg-white'}`}>{n}</button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      <div className="mt-3"><Btn tone="mint" onClick={finish}>Next: the big show →</Btn></div>
    </Panel>
  );
}

/* ───────────── 3. The show: your group dances to your song ───────────── */
function Show({ grid, name, stars, onDone }: { grid: Grid; name: string; stars: number; onDone: () => void }) {
  const { game } = useGame();
  const [on, setOn] = useState(false);
  const [over, setOver] = useState(false);
  const step = usePlayer(grid, on, 4, () => { setOver(true); sfx('success'); });
  const active = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];
  const group = [active, ...game.characters.filter((c) => c.id !== active?.id && c.age !== 'adult').slice(0, 3)].filter(Boolean);
  const props = [KPOP_PROPS[1], KPOP_PROPS[1]];   // lightsticks waving at both sides of the stage
  return (
    <div>
      <div className="kpop-stage rounded-[28px] border-[4px] border-ink overflow-hidden relative" style={{ backgroundImage: `url(${danceRoom})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className={`kpop-lights ${on ? 'on' : ''}`} />
        <div className="kpop-group">
          {group.map((c, i) => (
            <div key={c.id} className={`kpop-dancer ${on && !over ? 'dance' : ''}`} style={{ animationDelay: `${i * 0.12}s`, ...(step >= 0 && step % 2 === i % 2 ? { translate: '0 -4%' } : {}) }}>
              <Person c={c} mood={on || over ? 'happy' : 'normal'} />
            </div>
          ))}
        </div>
        {(on || over) && props.map((src, i) => <img key={i} src={src} alt="" className="kpop-wave" style={{ left: i ? '89%' : '3%', animationDelay: `${i * 0.3}s` }} />)}
      </div>
      <Panel className="mt-3">
        <h2 className="font-display text-2xl font-bold text-ink">{over ? 'Encore! The crowd loves it! 🎉' : `Showtime: “${name}”`}</h2>
        <p className="font-body text-ink text-lg mt-1">
          {over ? 'Performers practise for a long time so they can share something special. You learned a dance, made a song and performed it with your friends!'
            : 'Your group is ready on stage. Press start to perform your song!'}
        </p>
        {over && <Stars n={stars} />}
        <div className="flex flex-wrap gap-2 mt-3">
          {!on && !over && <Btn tone="berry" onClick={() => { sfx('sparkle'); setOn(true); }}>🎤 Start the show</Btn>}
          {over && <Btn tone="mint" onClick={onDone}>Take a bow 🙇</Btn>}
        </div>
      </Panel>
    </div>
  );
}

export function KpopMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [song, setSong] = useState<{ grid: Grid; name: string } | null>(null);
  return (
    <MissionShell id="kpop-star" step={step} steps={STEPS} onExit={onExit} color="#E7C6FF">
      {step === 0 && <DanceGame onDone={(s) => { setStars(s); setStep(1); }} />}
      {step === 1 && <SongMaker onDone={(grid, name) => { setSong({ grid, name }); setStep(2); }} />}
      {step === 2 && song && <Show grid={song.grid} name={song.name} stars={stars} onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'kpop-star' }); onExit(); }} />}
    </MissionShell>
  );
}
