import { useState } from 'react';
import { useGame } from '../engine/store';
import { PetArt } from '../components/art/Pet';
import { INK } from '../components/art/Character';
import { DragChip } from '../ui/DragChip';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback, Stars } from './MissionShell';
import { sfx } from '../engine/sfx';

const STEPS = ['Hello', 'Heartbeat', 'Paws', 'Fur', 'Ear', 'Needs', 'Food', 'Done'];
type Tool = 'stethoscope' | 'soap' | 'brush' | 'bandage';
const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: 'stethoscope', icon: '🩺', label: 'Stethoscope' },
  { id: 'soap', icon: '🧼', label: 'Warm water' },
  { id: 'brush', icon: '🪮', label: 'Soft brush' },
  { id: 'bandage', icon: '🩹', label: 'Bandage' },
];
// zone positions are % of the 110x100 pet artwork
const PAWS = [[33, 87], [45.5, 87], [60, 87], [72.7, 87]];
const TANGLES = [[38, 63], [50, 58], [62, 61], [73, 68], [52, 74]];
const NEEDS = [
  { t: 'Fresh water', ok: true, i: '💧' }, { t: 'Hay and veggies', ok: true, i: '🥬' },
  { t: 'Chocolate treats', ok: false, i: '🍫' }, { t: 'Space to hop', ok: true, i: '🏃' },
  { t: 'Loud music all day', ok: false, i: '📢' }, { t: 'Gentle cuddles', ok: true, i: '🤗' },
];
const FOODS = [
  { id: 'carrot', icon: '🥕', label: 'Carrot', animal: 'bunny' },
  { id: 'fish', icon: '🐟', label: 'Fish', animal: 'kitten' },
  { id: 'bone', icon: '🦴', label: 'Dog food', animal: 'puppy' },
];

export function VetMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [armed, setArmed] = useState<Tool | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [beats, setBeats] = useState<'idle' | 'playing' | 'ask'>('idle');
  const [mud, setMud] = useState([true, true, true, true]);
  const [tangles, setTangles] = useState([true, true, true, true, true]);
  const [ear, setEar] = useState(false);
  const [needs, setNeeds] = useState<number[]>([]);
  const [fed, setFed] = useState<string[]>([]);
  const [armedFood, setArmedFood] = useState<string | null>(null);
  const [hop, setHop] = useState(false);

  const oops = (text: string) => { setMistakes((m) => m + 1); setMsg({ ok: false, text }); sfx('fail'); };
  const good = (text: string) => { setMsg({ ok: true, text }); sfx('success'); setHop(true); window.setTimeout(() => setHop(false), 900); };
  const next = () => { setMsg(null); setArmed(null); setStep((s) => s + 1); sfx('pop'); };

  const NEED: Record<number, Tool> = { 1: 'stethoscope', 2: 'soap', 3: 'brush', 4: 'bandage' };
  const apply = (tool: Tool, zone: string | null) => {
    setArmed(null);
    if (!zone) return;
    const need = NEED[step];
    if (tool !== need) return oops(`Clover doesn’t need the ${TOOLS.find((t) => t.id === tool)!.label.toLowerCase()} right now. Which tool fits this job?`);
    if (step === 1) {
      if (zone !== 'chest') return oops('Listen to the heart. Try Clover’s chest.');
      setBeats('playing'); setMsg(null);
      for (let i = 0; i < 6; i++) window.setTimeout(() => sfx('heartbeat'), 250 + i * 330);
      window.setTimeout(() => setBeats('ask'), 2500);
    } else if (step === 2) {
      const i = Number(zone.split('-')[1]);
      if (!zone.startsWith('paw') || !mud[i]) return oops('Look for a muddy paw.');
      const m = mud.map((v, k) => (k === i ? false : v)); setMud(m); sfx('splash');
      if (m.every((v) => !v)) good('Squeaky clean paws! Vets keep paws clean so cuts don’t get germs.');
    } else if (step === 3) {
      const i = Number(zone.split('-')[1]);
      if (!zone.startsWith('tangle') || !tangles[i]) return oops('Brush the tangled tufts of fur.');
      const t = tangles.map((v, k) => (k === i ? false : v)); setTangles(t); sfx('sparkle');
      if (t.every((v) => !v)) good('So soft! Brushing keeps fur clean and helps us spot bumps or scratches.');
    } else if (step === 4) {
      if (zone !== 'ear') return oops('The little scratch is on Clover’s ear.');
      setEar(true); sfx('pop');
      good('All better! Animals can’t say where it hurts, so vets look very carefully.');
    }
  };
  const feed = (food: string, zone: string | null) => {
    setArmedFood(null);
    if (!zone) return;
    const f = FOODS.find((x) => x.id === food)!;
    if (zone !== f.animal) return oops(`Hmm, a ${zone} doesn’t usually eat that. Try another animal.`);
    sfx('munch'); const nf = [...fed, food]; setFed(nf); setMsg(null);
    if (nf.length === FOODS.length) good('Everyone’s fed! Different animals need different food.');
  };
  const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;
  const zoneClick = (z: string) => armed && apply(armed, z);

  const patient = (
    <div className="relative mx-auto w-[min(70vw,330px)] aspect-[110/100] mt-12">
      <div className={`absolute inset-0 ${hop ? 'anim-hop' : 'idle-bob'}`}><PetArt species="bunny" /></div>
      {mud.map((m, i) => m && <div key={i} className="absolute rounded-full" style={{ left: `${PAWS[i][0] - 5}%`, top: `${PAWS[i][1] - 6}%`, width: '10%', height: '10%', background: '#8E5B3F', border: `2px solid ${INK}` }} />)}
      {tangles.map((t, i) => t && <div key={i} className="absolute text-[clamp(16px,4vw,26px)] leading-none" style={{ left: `${TANGLES[i][0] - 4}%`, top: `${TANGLES[i][1] - 6}%` }}>〰️</div>)}
      {!ear && step >= 1 && <div className="absolute rounded" style={{ left: '60%', top: '-4%', width: '6%', height: '10%', background: '#E2475D', border: `2px solid ${INK}` }} />}
      {ear && <div className="absolute rounded" style={{ left: '57%', top: '-5%', width: '12%', height: '9%', background: '#FFD6A5', border: `3px solid ${INK}` }} />}
      {beats === 'playing' && <div className="absolute left-[44%] top-[56%] text-4xl heartbeat-big">❤️</div>}
      <Zone id="chest" l={38} t={52} w={36} h={28} armed={!!armed} onTap={zoneClick} />
      <Zone id="ear" l={50} t={-22} w={26} h={34} armed={!!armed} onTap={zoneClick} />
      {PAWS.map(([x, y], i) => <Zone key={i} id={`paw-${i}`} l={x - 6} t={y - 8} w={12} h={14} armed={!!armed} onTap={zoneClick} />)}
      {step === 3 && TANGLES.map(([x, y], i) => <Zone key={i} id={`tangle-${i}`} l={x - 6} t={y - 8} w={12} h={14} armed={!!armed} onTap={zoneClick} />)}
    </div>
  );

  return (
    <MissionShell id="vet-checkup" step={step} steps={STEPS} onExit={onExit} color="#5FE0B7">
      <div className="mx-auto max-w-5xl grid md:grid-cols-[1fr_1.1fr] gap-4 items-start">
        <Panel tone="bg-[#D4F7E8]" className="relative">
          <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[#FFE3B3] border-t-[3px] border-ink rounded-b-[22px]" />
          <div className="relative pb-6">{patient}</div>
        </Panel>
        <Panel>
          {step === 0 && <>
            <h2 className="font-display text-3xl font-extrabold text-ink">Hi, Vet!</h2>
            <p className="font-body text-ink text-lg mt-2">This is Clover the bunny. She hopped through a muddy garden, her fur got tangled, and she has a little scratch on her ear.</p>
            <p className="font-body text-ink/70 mt-3 text-sm">This is pretend play. If a real pet seems hurt or sick, a grown-up can call a real vet.</p>
            <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Start check-up</Btn>
          </>}
          {step >= 1 && step <= 4 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
              {step === 1 && 'Listen to Clover’s heartbeat'}{step === 2 && 'Clean all four muddy paws'}{step === 3 && 'Brush out the tangles'}{step === 4 && 'Bandage the ear scratch'}
            </h2>
            <p className="font-body text-ink mt-1">Drag a tool onto Clover, or tap a tool and then tap Clover.</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {TOOLS.map((t) => (
                <DragChip key={t.id} selected={armed === t.id} onTap={() => setArmed(armed === t.id ? null : t.id)} onDrop={(z) => apply(t.id, z)}
                  className="rounded-2xl border-[3px] border-ink bg-white shadow-chunkysm px-3 py-2 flex items-center gap-2 font-display font-bold text-ink">
                  <span className="text-3xl">{t.icon}</span><span className="text-sm sm:text-base">{t.label}</span>
                </DragChip>
              ))}
            </div>
            {step === 1 && beats === 'ask' && (
              <div className="mt-4">
                <p className="font-display text-xl text-ink">How many beats did you hear?</p>
                <div className="flex gap-2 mt-2">{[5, 6, 7].map((n) => <Btn key={n} tone="white" className="text-2xl w-16" onClick={() => (n === 6 ? (good('Yes, 6! Bunny hearts beat much faster than people hearts.'), setBeats('idle')) : oops('They’re quick! Listen again and count carefully.'))}>{n}</Btn>)}</div>
                <button className="mt-2 font-body text-ink underline" onClick={() => apply('stethoscope', 'chest')}>Listen again</button>
              </div>
            )}
            {step === 2 && <p className="font-body text-ink mt-2">Paws left: {mud.filter(Boolean).length}</p>}
            {step === 3 && <p className="font-body text-ink mt-2">Tangles left: {tangles.filter(Boolean).length}</p>}
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {msg?.ok && beats !== 'ask' && <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Next</Btn>}
          </>}
          {step === 5 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">What does a bunny need?</h2>
            <p className="font-body text-ink mt-1">Pick everything that keeps a bunny healthy and happy.</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {NEEDS.map((h, i) => (
                <button key={h.t} onClick={() => { sfx('tap'); setNeeds(needs.includes(i) ? needs.filter((x) => x !== i) : [...needs, i]); setMsg(null); }}
                  className={`rounded-2xl border-[3px] border-ink p-3 text-left font-body text-ink flex items-center gap-2 ${needs.includes(i) ? 'bg-sun' : 'bg-white'}`}>
                  <span className="text-2xl">{h.i}</span>{h.t}
                </button>
              ))}
            </div>
            <Btn tone="berry" className="mt-3" onClick={() => (NEEDS.every((h, i) => h.ok === needs.includes(i))
              ? good('Perfect! Chocolate is unsafe for many pets, and loud noise scares bunnies.')
              : oops('Almost! Choose every healthy need and none of the others.'))}>Check</Btn>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {msg?.ok && <Btn tone="mint" className="mt-4 ml-2 text-lg" onClick={next}>Next</Btn>}
          </>}
          {step === 6 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Lunch time at the clinic</h2>
            <p className="font-body text-ink mt-1">Give each animal the right food. Drag it, or tap the food and then the animal.</p>
            <div className="flex flex-wrap gap-2 mt-3 min-h-[56px]">
              {FOODS.filter((f) => !fed.includes(f.id)).map((f) => (
                <DragChip key={f.id} selected={armedFood === f.id} onTap={() => setArmedFood(armedFood === f.id ? null : f.id)} onDrop={(z) => feed(f.id, z)}
                  className="rounded-2xl border-[3px] border-ink bg-sun shadow-chunkysm px-3 py-2 font-display font-bold text-ink flex items-center gap-2">
                  <span className="text-3xl">{f.icon}</span>{f.label}
                </DragChip>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(['bunny', 'kitten', 'puppy'] as const).map((a) => {
                const done = FOODS.find((f) => f.animal === a && fed.includes(f.id));
                return (
                  <div key={a} data-drop={a} onClick={() => armedFood && feed(armedFood, a)}
                    className={`rounded-2xl border-[3px] border-ink p-2 text-center ${done ? 'bg-mint/50' : 'bg-white'} ${armedFood ? 'drop-zone-armed' : ''}`}>
                    <div className="w-full aspect-[110/100]"><PetArt species={a} /></div>
                    <div className="font-display font-bold text-ink capitalize">{a} {done && done.icon}</div>
                  </div>
                );
              })}
            </div>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {fed.length === FOODS.length && <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Finish</Btn>}
          </>}
          {step === 7 && <>
            <h2 className="font-display text-3xl font-extrabold text-ink">Clover is happy and healthy!</h2>
            <Stars n={stars} />
            <p className="font-body text-ink text-lg mt-2">You listened to her heart, cleaned her paws, brushed her fur, cared for her ear and learned what animals need. That’s what vets do every day!</p>
            <Btn tone="berry" className="mt-4 text-lg" onClick={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'vet-checkup' }); onExit(); }}>Collect rewards</Btn>
          </>}
        </Panel>
      </div>
    </MissionShell>
  );
}

function Zone({ id, l, t, w, h, armed, onTap }: { id: string; l: number; t: number; w: number; h: number; armed: boolean; onTap: (z: string) => void }) {
  return <div data-drop={id} aria-label={id} onClick={() => onTap(id)} className={`absolute rounded-3xl ${armed ? 'drop-zone-armed' : ''}`} style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }} />;
}
