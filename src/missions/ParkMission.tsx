import { useMemo, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { QuizStep, YES_NO } from './QuizStep';
import { sfx } from '../engine/sfx';

const STEPS = ['Plant', 'Needs', 'Water'];

/* 1. Plant a seed: put the steps in the right order. */
const PLANTING = [
  { id: 'dig', icon: '🕳️', label: 'Dig a little hole' },
  { id: 'seed', icon: '🌰', label: 'Drop in the seed' },
  { id: 'cover', icon: '🟫', label: 'Cover it with soil' },
  { id: 'water', icon: '💧', label: 'Give it water' },
];
function PlantStep({ onDone }: { onDone: () => void }) {
  const shuffled = useMemo(() => [...PLANTING].sort(() => Math.random() - 0.5), []);
  const [done, setDone] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pick = (id: string) => {
    if (done.includes(id) || done.length === PLANTING.length) return;
    if (PLANTING[done.length].id !== id) { sfx('fail'); setMsg({ ok: false, text: `Hmm, what comes first? Think about what the seed needs before “${PLANTING.find((p) => p.id === id)!.label.toLowerCase()}”.` }); return; }
    const next = [...done, id]; setDone(next); sfx('pop'); setMsg(null);
    if (next.length === PLANTING.length) { sfx('success'); setMsg({ ok: true, text: 'A little sprout pops up! 🌱 Seeds need soil to hold them, and water to wake them up.' }); }
  };
  const stage = ['🟫', '🕳️', '🌰', '🟫', '🌱'][done.length];
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Plant a seed with Rosa</h2>
      <p className="font-body text-ink text-lg mt-1">Gardeners plant seeds in the right order. Tap the steps in order, from first to last.</p>
      <div className="park-bed mt-3 rounded-2xl border-[3px] border-ink">{stage}</div>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {shuffled.map((p) => (
          <button key={p.id} onClick={() => pick(p.id)} disabled={done.includes(p.id)}
            className={`rounded-2xl border-[3px] border-ink px-3 h-14 font-display font-bold text-ink text-left flex items-center gap-2 ${done.includes(p.id) ? 'bg-mint' : 'bg-white'}`}>
            <span style={{ fontSize: 26 }}>{p.icon}</span>{p.label}{done.includes(p.id) && <span style={{ marginLeft: 'auto' }}>#{done.indexOf(p.id) + 1}</span>}
          </button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {done.length === PLANTING.length && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Next: what plants need →</Btn></div>}
    </Panel>
  );
}

/* 2. What do plants need? */
const NEEDS = [
  { icon: '☀️', text: 'Sunlight', yes: true, why: 'Plants use sunlight to make their own food.' },
  { icon: '🍬', text: 'Candy', yes: false, why: 'Plants don’t eat candy! They make food from sunlight, air and water.' },
  { icon: '💧', text: 'Water', yes: true, why: 'Water travels up from the roots to every leaf.' },
  { icon: '📺', text: 'Watching TV', yes: false, why: 'Plants don’t need TV. They do like a sunny window though!' },
  { icon: '💨', text: 'Air', yes: true, why: 'Leaves take in a gas from the air called carbon dioxide.' },
  { icon: '🪱', text: 'Healthy soil', yes: true, why: 'Soil holds the roots and gives plants nutrients. Worms help keep it healthy.' },
];

/* 3. Water the flower bed: water the droopy flowers, but not too much! */
function WaterStep({ onDone }: { onDone: () => void }) {
  const start = useMemo(() => Array.from({ length: 8 }, (_, i) => (i % 3 === 1 ? 'ok' : 'dry') as 'dry' | 'ok' | 'bloom'), []);
  const [beds, setBeds] = useState(start);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const water = (i: number) => {
    const b = beds[i];
    if (b === 'dry') { sfx('splash'); const n = [...beds]; n[i] = 'bloom'; setBeds(n); setMsg(null);
      if (!n.includes('dry')) { sfx('success'); setMsg({ ok: true, text: 'Every flower is happy! 🌷 You only watered the ones that needed it.' }); } }
    else { sfx('fail'); setMsg({ ok: false, text: b === 'ok' ? 'This one’s soil is still wet. Too much water can hurt the roots!' : 'Already watered. Look for the droopy flowers 🥀.' }); }
  };
  const left = beds.filter((b) => b === 'dry').length;
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Water the flower bed ({left} thirsty)</h2>
      <p className="font-body text-ink text-lg mt-1">Gardeners check before they water. Droopy flowers 🥀 need water. Flowers with wet, dark soil are fine. Tap only the thirsty ones.</p>
      <div className="park-pots mt-3">
        {beds.map((b, i) => (
          <button key={i} aria-label={b === 'dry' ? 'Thirsty flower' : b === 'ok' ? 'Flower with wet soil' : 'Watered flower'} onClick={() => water(i)} className={`park-pot ${b}`}>
            <span className="flower">{b === 'dry' ? '🥀' : b === 'ok' ? '🌼' : '🌷'}</span><span className="soil" />
          </button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {left === 0 && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Finish →</Btn></div>}
    </Panel>
  );
}

export function ParkMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  return (
    <MissionShell id="park-garden" step={step} steps={STEPS} onExit={onExit} color="#B8EBA0">
      {step === 0 && <PlantStep onDone={() => setStep(1)} />}
      {step === 1 && <QuizStep title="What do plants need?" intro="Help Rosa sort these. Does a plant need it to grow?" finish="Next: water the flowers"
        items={NEEDS.map((n) => ({ icon: n.icon, text: n.text, options: YES_NO('🌱 Plants need it', '🙅 Plants don’t need it', n.yes), why: n.why }))} onDone={() => setStep(2)} />}
      {step === 2 && <WaterStep onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'park-garden' }); onExit(); }} />}
    </MissionShell>
  );
}
