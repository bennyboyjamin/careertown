import { useEffect, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { QuizStep } from './QuizStep';
import { sfx } from '../engine/sfx';

const STEPS = ['Warm-up', 'Team'];
const MOVES = [
  { id: 'jump', icon: '🦘', label: 'Jump', color: '#FFC93C' },
  { id: 'clap', icon: '👏', label: 'Clap', color: '#FF7FB5' },
  { id: 'spin', icon: '🌀', label: 'Spin', color: '#7FB8FF' },
  { id: 'stretch', icon: '🙆', label: 'Stretch', color: '#8BD46E' },
];
const ROUNDS = [3, 4, 5];

/* 1. Copy Coach Jay: watch the moves, then do them in the same order. */
function WarmUp({ onDone }: { onDone: () => void }) {
  const [round, setRound] = useState(0);
  const [seq, setSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(-1);   // index being shown, -1 = your turn
  const [input, setInput] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [lit, setLit] = useState<number | null>(null);
  const play = (n: number) => {
    const s = Array.from({ length: ROUNDS[n] }, () => Math.floor(Math.random() * MOVES.length));
    setSeq(s); setInput([]); setMsg(null); setShowing(0);
  };
  useEffect(() => {
    if (showing < 0 || !seq.length) return;
    if (showing >= seq.length) { const id = window.setTimeout(() => { setLit(null); setShowing(-1); }, 250); return () => window.clearTimeout(id); }
    setLit(seq[showing]); sfx('pop');
    const id = window.setTimeout(() => { setLit(null); window.setTimeout(() => setShowing((v) => v + 1), 180); }, 650);
    return () => window.clearTimeout(id);
  }, [showing, seq]);
  const tap = (m: number) => {
    if (showing >= 0 || !seq.length || msg?.ok) return;
    const next = [...input, m]; setInput(next); setLit(m); window.setTimeout(() => setLit(null), 200);
    if (seq[next.length - 1] !== m) { sfx('fail'); setMsg({ ok: false, text: 'Oops, that move was different. Watch again!' }); window.setTimeout(() => { setInput([]); setShowing(0); setMsg(null); }, 1300); return; }
    sfx('tap');
    if (next.length === seq.length) { sfx('success'); setMsg({ ok: true, text: round + 1 < ROUNDS.length ? 'Great copying! Next round has one more move.' : 'You copied every move! Coaches show, players watch and try.' }); }
  };
  const started = seq.length > 0;
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Warm-up: copy Coach Jay ({round + 1} of {ROUNDS.length})</h2>
      <p className="font-body text-ink text-lg mt-1">Watch which moves light up, then tap them in the same order. {started && (showing >= 0 ? 'Watch…' : 'Your turn!')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        {MOVES.map((m, i) => (
          <button key={m.id} onClick={() => tap(i)} className={`coach-move ${lit === i ? 'lit' : ''}`} style={{ background: m.color }} aria-label={m.label}>
            <span style={{ fontSize: 40 }}>{m.icon}</span><span className="font-display font-bold text-ink">{m.label}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {!started && <Btn tone="berry" onClick={() => play(round)}>▶ Show me</Btn>}
        {msg?.ok && round + 1 < ROUNDS.length && <Btn tone="mint" onClick={() => { const r = round + 1; setRound(r); play(r); }}>Next round →</Btn>}
        {msg?.ok && round + 1 === ROUNDS.length && <Btn tone="mint" onClick={onDone}>Next: be a good teammate →</Btn>}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
    </Panel>
  );
}

const TEAM = [
  { icon: '🛝', text: 'Lots of kids are waiting for the slide.', options: [{ label: 'Take turns in a line', ok: true }, { label: 'Push to the front', ok: false }], why: 'Taking turns means everyone gets a go, and nobody gets hurt.' },
  { icon: '🤕', text: 'A kid on the other team falls down.', options: [{ label: 'Help them up and check they’re OK', ok: true }, { label: 'Keep playing to win', ok: false }], why: 'Good players care about everyone, even the other team.' },
  { icon: '⚽', text: 'Your team lost the game.', options: [{ label: 'Say “good game!”', ok: true }, { label: 'Stomp off grumpy', ok: false }], why: 'Being a good sport makes games fun for everyone. You can try again next time!' },
  { icon: '🙋', text: 'Someone new wants to play.', options: [{ label: 'Invite them to join', ok: true }, { label: 'Say the team is full', ok: false }], why: 'Including others is what great teammates do.' },
  { icon: '💧', text: 'It’s hot and you feel tired.', options: [{ label: 'Take a break and drink water', ok: true }, { label: 'Keep running without stopping', ok: false }], why: 'Coaches make sure players rest and drink water to stay healthy.' },
];

export function PlaygroundMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  return (
    <MissionShell id="playground-coach" step={step} steps={STEPS} onExit={onExit} color="#FFE08A">
      {step === 0 && <WarmUp onDone={() => setStep(1)} />}
      {step === 1 && <QuizStep title="Be a good teammate" intro="Coach Jay wants everyone to play fair and stay safe. What should you do?" items={TEAM} finish="Finish"
        onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'playground-coach' }); onExit(); }} />}
    </MissionShell>
  );
}
