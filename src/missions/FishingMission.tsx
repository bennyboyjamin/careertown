import { useMemo, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { sfx } from '../engine/sfx';

const STEPS = ['Catch', 'Clean up'];
const KEEP_FROM = 6;   // fish this long or longer are big enough

/* 1. Catch fish, measure them, and put the little ones back. */
function CatchStep({ onDone }: { onDone: () => void }) {
  const fish = useMemo(() => [3, 7, 5, 8, 4, 6].map((len, i) => ({ id: i, len, icon: ['🐟', '🐠', '🐡'][i % 3], top: 18 + (i % 3) * 24, dur: 7 + (i % 4) * 1.5, delay: -i * 1.7 })), []);
  const [caught, setCaught] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const f = caught !== null ? fish[caught] : null;
  const decide = (keep: boolean) => {
    if (!f) return;
    const right = keep === f.len >= KEEP_FROM;
    if (!right) { sfx('fail'); setMsg({ ok: false, text: f.len >= KEEP_FROM ? `This fish is ${f.len} long. That’s big enough to keep for a photo!` : `This fish is only ${f.len} long. Little fish go back so they can grow up.` }); return; }
    sfx(keep ? 'success' : 'splash');
    setMsg({ ok: true, text: keep ? `A big ${f.len}-long fish! 📸 Leo takes a photo, then lets it swim home too.` : 'Back you go, little fish! Now it can grow big. 🌊' });
    setDone([...done, f.id]); setCaught(null);
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Catch and release ({done.length} of {fish.length})</h2>
      <p className="font-body text-ink text-lg mt-1">Tap a fish to catch it, then measure it. Leo’s rule: fish <b>{KEEP_FROM} or longer</b> are big enough. Smaller fish go back in the water to grow.</p>
      <div className="fish-water mt-3 rounded-2xl border-[3px] border-ink relative overflow-hidden">
        {fish.map((x) => !done.includes(x.id) && caught !== x.id && (
          <button key={x.id} aria-label="Fish" onClick={() => { if (caught !== null) return; sfx('splash'); setCaught(x.id); setMsg(null); }}
            className="fish-swim" style={{ top: `${x.top}%`, animationDuration: `${x.dur}s`, animationDelay: `${x.delay}s`, fontSize: 28 + x.len * 3 }}>{x.icon}</button>
        ))}
        <div className="fish-dock" />
      </div>
      {f && (
        <div className="mt-3 rounded-2xl border-[3px] border-ink bg-white p-3">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 28 + f.len * 3 }}>{f.icon}</span>
            <div className="fish-ruler" aria-label={`The fish is ${f.len} long`}>{Array.from({ length: 10 }, (_, k) => <span key={k} className={k < f.len ? 'on' : ''}>{k + 1}</span>)}</div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Btn tone="mint" onClick={() => decide(true)}>📸 Big enough</Btn>
            <Btn tone="sky" onClick={() => decide(false)}>🌊 Put it back</Btn>
          </div>
        </div>
      )}
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {done.length === fish.length && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Next: clean the lake →</Btn></div>}
    </Panel>
  );
}

/* 2. Clean the lake: scoop out the trash, leave the animals alone. */
const THINGS = [
  { icon: '🥤', trash: true }, { icon: '🦆', trash: false }, { icon: '🛍️', trash: true }, { icon: '🐢', trash: false },
  { icon: '🥫', trash: true }, { icon: '🐸', trash: false }, { icon: '🍾', trash: true }, { icon: '🪷', trash: false }, { icon: '🧃', trash: true },
];
function CleanStep({ onDone }: { onDone: () => void }) {
  const spots = useMemo(() => THINGS.map((t, i) => ({ ...t, id: i, x: 6 + (i * 37) % 84, y: 10 + (i * 23) % 70 })), []);
  const [gone, setGone] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const left = spots.filter((s) => s.trash && !gone.includes(s.id)).length;
  const tap = (s: typeof spots[number]) => {
    if (!s.trash) { sfx('pop'); setMsg({ ok: false, text: `That’s a ${s.icon === '🪷' ? 'water lily. Plants belong in the lake!' : 'lake animal. Leave it be!'}` }); return; }
    sfx('whoosh'); const g = [...gone, s.id]; setGone(g);
    setMsg(spots.filter((x) => x.trash && !g.includes(x.id)).length === 0 ? { ok: true, text: 'The lake is clean! Trash can hurt fish, ducks and turtles, so fishers always take it home.' } : null);
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Clean the lake ({left} left)</h2>
      <p className="font-body text-ink text-lg mt-1">Someone left trash in the lake. Tap the trash to scoop it out, but don’t scoop the animals and plants!</p>
      <div className="fish-water mt-3 rounded-2xl border-[3px] border-ink relative overflow-hidden">
        {spots.map((s) => !gone.includes(s.id) && <button key={s.id} aria-label={s.trash ? 'Trash' : 'Lake life'} onClick={() => tap(s)} className="fish-float" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.id * 0.3}s` }}>{s.icon}</button>)}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {left === 0 && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Finish →</Btn></div>}
    </Panel>
  );
}

export function FishingMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  return (
    <MissionShell id="fishing-release" step={step} steps={STEPS} onExit={onExit} color="#9FD8FF">
      {step === 0 && <CatchStep onDone={() => setStep(1)} />}
      {step === 1 && <CleanStep onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'fishing-release' }); onExit(); }} />}
    </MissionShell>
  );
}
