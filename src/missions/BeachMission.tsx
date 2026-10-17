import { useEffect, useRef, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { sfx } from '../engine/sfx';

const STEPS = ['Flags', 'Watch', 'Safety'];

/* 1. Beach flags: lifeguards raise a flag so everyone knows if the water is safe today. */
const FLAGS = [
  { id: 'green', label: 'Green flag', icon: '🟩', means: 'Calm water. Swim near the lifeguard.' },
  { id: 'yellow', label: 'Yellow flag', icon: '🟨', means: 'Some waves. Be careful and stay close to shore.' },
  { id: 'red', label: 'Red flag', icon: '🟥', means: 'Big waves or strong currents. No swimming today.' },
];
const DAYS = [
  { scene: '☀️ 🌊 😎', text: 'The sea is flat and calm. The sun is shining.', flag: 'green' },
  { scene: '⛅ 🌊🌊 💨', text: 'There are some medium waves and a little wind.', flag: 'yellow' },
  { scene: '⛈️ 🌊🌊🌊 🌪️', text: 'Huge waves are crashing and a storm is coming.', flag: 'red' },
];

function FlagStep({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const d = DAYS[i];
  const pick = (id: string) => {
    const f = FLAGS.find((x) => x.id === id)!;
    if (id === d.flag) { sfx('success'); setMsg({ ok: true, text: `Yes! ${f.label}: ${f.means}` }); }
    else { sfx('fail'); setMsg({ ok: false, text: `Hmm, the ${f.label.toLowerCase()} means: ${f.means} Look at the waves again.` }); }
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Raise the right flag ({i + 1} of {DAYS.length})</h2>
      <p className="font-body text-ink text-lg mt-1">Lifeguards check the water every morning and raise a flag so swimmers know if it’s safe. {d.text} Which flag should Kai raise?</p>
      <div className="beach-scene mt-3 rounded-2xl border-[3px] border-ink text-center">{d.scene}</div>
      <div className="flex flex-wrap gap-2 mt-3">
        {FLAGS.map((f) => <Btn key={f.id} tone="white" onClick={() => pick(f.id)}>{f.icon} {f.label}</Btn>)}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {msg?.ok && <div className="mt-3"><Btn tone="mint" onClick={() => { setMsg(null); if (i + 1 < DAYS.length) setI(i + 1); else onDone(); }}>{i + 1 < DAYS.length ? 'Next day →' : 'Next: watch the water →'}</Btn></div>}
    </Panel>
  );
}

/* 2. Watch the water: most swimmers are just playing; spot the one waving for help. */
const SWIMMERS = 6, RESCUES = 3;
function WatchStep({ onDone }: { onDone: () => void }) {
  const [trouble, setTrouble] = useState<number | null>(null);
  const [saved, setSaved] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [rescuing, setRescuing] = useState<number | null>(null);
  const pos = useRef(Array.from({ length: SWIMMERS }, (_, i) => ({ x: 8 + i * 15 + Math.random() * 5, y: 18 + Math.random() * 46 })));
  useEffect(() => {
    if (trouble !== null || saved >= RESCUES) return;
    const id = window.setTimeout(() => { setTrouble(Math.floor(Math.random() * SWIMMERS)); sfx('ring'); }, 1400 + Math.random() * 1600);
    return () => window.clearTimeout(id);
  }, [trouble, saved]);
  const tap = (i: number) => {
    if (rescuing !== null) return;
    if (i === trouble) {
      sfx('splash'); setRescuing(i);
      window.setTimeout(() => {
        setRescuing(null); setTrouble(null); setSaved((s) => s + 1); sfx('success');
        setMsg({ ok: true, text: 'You threw the ring buoy and pulled them safely back to shore! 🛟' });
      }, 1100);
    } else { sfx('pop'); setMsg({ ok: false, text: 'That swimmer is just having fun. Keep watching for someone waving for help!' }); }
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Watch the water: {saved} of {RESCUES} rescues</h2>
      <p className="font-body text-ink text-lg mt-1">Lifeguards never stop watching. Someone who needs help might wave their arms and can’t swim back. When you see a swimmer waving, tap them fast!</p>
      <div className="beach-water mt-3 rounded-2xl border-[3px] border-ink relative overflow-hidden">
        {pos.current.map((p, i) => (
          <button key={i} aria-label={i === trouble ? 'Swimmer waving for help' : 'Swimmer'} onClick={() => tap(i)}
            className={`beach-swimmer ${i === trouble ? 'help' : ''} ${rescuing === i ? 'saved' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * 0.4}s` }}>
            {rescuing === i ? '🛟' : i === trouble ? '🙋' : '🏊'}
            {i === trouble && rescuing === null && <span className="beach-help">Help!</span>}
          </button>
        ))}
        <div className="beach-sand" />
        <div className="beach-chair">🪑<span>Kai</span></div>
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {saved >= RESCUES && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Next: safety tips →</Btn></div>}
    </Panel>
  );
}

/* 3. Safe or not safe? */
const TIPS = [
  { text: 'Swim near a lifeguard', safe: true, why: 'Lifeguards can see you and help quickly.' },
  { text: 'Swim alone when nobody is around', safe: false, why: 'Always swim with a buddy and a grown-up nearby.' },
  { text: 'Wear sunscreen and drink water', safe: true, why: 'Sun and heat can make you sick. Stay cool!' },
  { text: 'Swim when the red flag is up', safe: false, why: 'Red means the water is too dangerous today.' },
  { text: 'If a current pulls you out, swim sideways along the beach', safe: true, why: 'Swimming sideways gets you out of a rip current. Then swim back to shore or wave for help.' },
  { text: 'Run and dive into shallow water', safe: false, why: 'You could hit the bottom. Walk in and check how deep it is.' },
];
function SafetyStep({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [right, setRight] = useState(0);
  const t = TIPS[i];
  const answer = (safe: boolean) => {
    if (msg) return;
    const ok = safe === t.safe; if (ok) setRight(right + 1);
    sfx(ok ? 'success' : 'fail');
    setMsg({ ok, text: `${ok ? 'Right!' : t.safe ? 'Actually, that’s safe.' : 'Actually, that’s not safe.'} ${t.why}` });
  };
  const next = () => { setMsg(null); if (i + 1 < TIPS.length) setI(i + 1); else onDone(); };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Safe or not safe? ({i + 1} of {TIPS.length})</h2>
      <p className="font-body text-ink text-lg mt-1">Help Kai teach beach safety. Is this safe?</p>
      <div className="mt-3 rounded-2xl border-[3px] border-ink bg-sky/25 px-4 py-5 font-display font-bold text-ink text-2xl text-center">{t.text}</div>
      <div className="flex flex-wrap gap-2 mt-3">
        <Btn tone="mint" onClick={() => answer(true)}>👍 Safe</Btn>
        <Btn tone="berry" onClick={() => answer(false)}>✋ Not safe</Btn>
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {msg && <div className="mt-3"><Btn tone="sun" onClick={next}>{i + 1 < TIPS.length ? 'Next →' : `Finish (${right} right) →`}</Btn></div>}
    </Panel>
  );
}

export function BeachMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  return (
    <MissionShell id="lifeguard-duty" step={step} steps={STEPS} onExit={onExit} color="#7FD3F7">
      {step === 0 && <FlagStep onDone={() => setStep(1)} />}
      {step === 1 && <WatchStep onDone={() => setStep(2)} />}
      {step === 2 && <SafetyStep onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'lifeguard-duty' }); onExit(); }} />}
    </MissionShell>
  );
}
