import { useMemo, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { QuizStep, YES_NO } from './QuizStep';
import { sfx } from '../engine/sfx';

const STEPS = ['Spot', 'Tracks', 'Care'];

/* 1. Spot the animals hiding on the trail (they're small and blend in). */
const ANIMALS = [
  { icon: '🦉', name: 'Owl', fact: 'Owls sleep in the day and hunt at night. They can turn their heads really far!', x: 18, y: 18 },
  { icon: '🐿️', name: 'Squirrel', fact: 'Squirrels bury nuts to eat in winter, and forget some, which grow into new trees.', x: 70, y: 52 },
  { icon: '🦌', name: 'Deer', fact: 'Deer have big ears that turn to listen for danger.', x: 44, y: 66 },
  { icon: '🐸', name: 'Frog', fact: 'Frogs start life as tadpoles that swim with tails.', x: 84, y: 80 },
  { icon: '🦋', name: 'Butterfly', fact: 'Butterflies taste with their feet!', x: 30, y: 44 },
];
function SpotStep({ onDone }: { onDone: () => void }) {
  const [found, setFound] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const trees = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x: (i * 41) % 96, y: (i * 29) % 88, e: ['🌲', '🌳', '🌿', '🪨', '🍂'][i % 5] })), []);
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Spot the animals ({found.length} of {ANIMALS.length})</h2>
      <p className="font-body text-ink text-lg mt-1">Park rangers count animals to see how they’re doing. Animals hide to stay safe, so look closely and tap each one you find.</p>
      <div className="trail-woods mt-3 rounded-2xl border-[3px] border-ink relative overflow-hidden">
        {trees.map((t, i) => <span key={i} className="trail-tree" style={{ left: `${t.x}%`, top: `${t.y}%` }}>{t.e}</span>)}
        {ANIMALS.map((a, i) => (
          <button key={a.name} aria-label={found.includes(i) ? a.name : 'Something hiding'} onClick={() => { if (found.includes(i)) return; sfx('sparkle'); setFound([...found, i]); setMsg({ ok: true, text: `${a.icon} A ${a.name.toLowerCase()}! ${a.fact}` }); }}
            className={`trail-animal ${found.includes(i) ? 'found' : ''}`} style={{ left: `${a.x}%`, top: `${a.y}%` }}>{a.icon}</button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {found.length === ANIMALS.length && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Next: animal tracks →</Btn></div>}
    </Panel>
  );
}

/* 2. Whose tracks are these? */
const TRACKS = [
  { track: '🐾', clue: 'Four round toes and a pad, no claw marks', options: ['🐱 Cat', '🦆 Duck', '🐍 Snake'], answer: 0, why: 'Cats pull their claws in when they walk, so their prints have no claw marks.' },
  { track: '🦶', clue: 'Webbed feet with three toes, near the pond', options: ['🦌 Deer', '🦆 Duck', '🐿️ Squirrel'], answer: 1, why: 'Ducks have webbed feet to paddle in water.' },
  { track: '〰️', clue: 'A wiggly line, no feet at all', options: ['🐸 Frog', '🐍 Snake', '🦉 Owl'], answer: 1, why: 'Snakes slide on their bellies and leave wavy lines.' },
  { track: '🫘', clue: 'Two pointy halves, like a split heart', options: ['🦌 Deer', '🐱 Cat', '🦆 Duck'], answer: 0, why: 'Deer have hooves split in two, so their tracks look like an upside-down heart.' },
];

/* 3. Leave no trace. */
const CARE = [
  { icon: '🥾', text: 'Stay on the trail', yes: true, why: 'Walking on the trail protects plants and animal homes.' },
  { icon: '🍞', text: 'Feed bread to the ducks', yes: false, why: 'Bread can make wild animals sick. Let them find their own food.' },
  { icon: '🎒', text: 'Take your trash home', yes: true, why: '“Pack it in, pack it out.” Leave the trail cleaner than you found it.' },
  { icon: '🌸', text: 'Pick the wildflowers', yes: false, why: 'Leave flowers for bees, butterflies and the next hikers to enjoy.' },
  { icon: '🔭', text: 'Watch animals from far away', yes: true, why: 'Giving animals space keeps them, and you, safe.' },
];

export function TrailMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  return (
    <MissionShell id="trail-ranger" step={step} steps={STEPS} onExit={onExit} color="#B8E6C9">
      {step === 0 && <SpotStep onDone={() => setStep(1)} />}
      {step === 1 && <QuizStep title="Whose tracks?" intro="Rangers can tell which animals passed by from their tracks. Read the clue and pick the animal."
        items={TRACKS.map((t) => ({ icon: t.track, text: t.clue, options: t.options.map((o, k) => ({ label: o, ok: k === t.answer })), why: t.why }))} finish="Next: care for the trail" onDone={() => setStep(2)} />}
      {step === 2 && <QuizStep title="Care for the trail" intro="Help Willow teach hikers. Is this a good thing to do on the trail?" finish="Finish"
        items={CARE.map((c) => ({ icon: c.icon, text: c.text, options: YES_NO('👍 Good idea', '✋ Not a good idea', c.yes), why: c.why }))}
        onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'trail-ranger' }); onExit(); }} />}
    </MissionShell>
  );
}
