import { useState } from 'react';
import { useGame } from '../engine/store';
import type { Look } from '../engine/types';
import { CharacterArt, INK } from '../components/art/Character';
import { DragChip } from '../ui/DragChip';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback, Stars } from './MissionShell';
import { sfx } from '../engine/sfx';

const PIP: Look = { skin: '#F6CBA5', face: 'round', eyes: 'big', hair: 'buns', hairColor: '#C9473A', top: 'stripes', topColor: '#7FD3F7', bottom: 'shorts', bottomColor: '#A98BFF', shoes: '#FFC93C', glasses: 'none', hat: 'none', accessory: 'none' };
const STEPS = ['Hello', 'Temperature', 'Heartbeat', 'Knee', 'Body', 'Habits', 'Done'];
type Tool = 'thermometer' | 'stethoscope' | 'soap' | 'bandage';
const TOOLS: { id: Tool; icon: string; label: string; zone: string }[] = [
  { id: 'thermometer', icon: '🌡️', label: 'Thermometer', zone: 'mouth' },
  { id: 'stethoscope', icon: '🩺', label: 'Stethoscope', zone: 'chest' },
  { id: 'soap', icon: '🧼', label: 'Soap & water', zone: 'knee' },
  { id: 'bandage', icon: '🩹', label: 'Bandage', zone: 'knee' },
];
const NEED: Record<number, Tool> = { 1: 'thermometer', 2: 'stethoscope' };

const HABITS = [
  { t: 'Drink water', ok: true, i: '💧' }, { t: 'Wear a helmet', ok: true, i: '⛑️' },
  { t: 'Candy for dinner', ok: false, i: '🍬' }, { t: 'Sleep 10 hours', ok: true, i: '😴' },
  { t: 'Stay up all night', ok: false, i: '🌙' }, { t: 'Wash your hands', ok: true, i: '🧼' },
];
const ORGANS = [
  { id: 'brain', ask: 'Tap the brain', fact: 'Your brain is the boss. It helps you think, remember and move!' },
  { id: 'heart', ask: 'Tap the heart', fact: 'Your heart is a muscle that pumps blood all around your body.' },
  { id: 'lungs', ask: 'Tap the lungs', fact: 'Your lungs fill with air every time you breathe in.' },
  { id: 'stomach', ask: 'Tap the stomach', fact: 'Your stomach squishes food so your body can use it.' },
];

export function DoctorMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [armed, setArmed] = useState<Tool | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [beats, setBeats] = useState<'idle' | 'playing' | 'ask'>('idle');
  const [knee, setKnee] = useState<'scraped' | 'clean' | 'bandaged'>('scraped');
  const [organ, setOrgan] = useState(0);
  const [habits, setHabits] = useState<number[]>([]);
  const [mood, setMood] = useState<'normal' | 'happy'>('normal');

  const oops = (text: string) => { setMistakes((m) => m + 1); setMsg({ ok: false, text }); sfx('fail'); };
  const good = (text: string) => { setMsg({ ok: true, text }); sfx('success'); setMood('happy'); window.setTimeout(() => setMood('normal'), 1200); };
  const next = () => { setMsg(null); setArmed(null); setStep((s) => s + 1); sfx('pop'); };

  const applyTool = (tool: Tool, zone: string | null) => {
    setArmed(null);
    if (!zone) return;
    const t = TOOLS.find((x) => x.id === tool)!;
    if (step === 3) {
      if (zone !== 'knee') return oops('The scrape is on Pip’s knee.');
      if (tool === 'soap' && knee === 'scraped') { setKnee('clean'); sfx('splash'); return good('Nice! Cleaning a scrape first washes away germs.'); }
      if (tool === 'bandage' && knee === 'scraped') return oops('Wait! We should clean the scrape before covering it.');
      if (tool === 'bandage' && knee === 'clean') { setKnee('bandaged'); sfx('pop'); return good('All covered! The bandage keeps it clean while it heals.'); }
      return oops(`The ${t.label.toLowerCase()} isn’t needed for a scrape.`);
    }
    const need = NEED[step];
    if (!need) return;
    if (tool !== need) return oops(`The ${t.label.toLowerCase()} is for something else. Which tool checks ${step === 1 ? 'temperature' : 'a heartbeat'}?`);
    if (zone !== t.zone) return oops(step === 1 ? 'A thermometer goes under the tongue. Try Pip’s mouth.' : 'Listen to the heart. Try Pip’s chest.');
    if (step === 1) { sfx('beep'); good('37.0°C. That’s a normal temperature, so Pip has no fever.'); }
    if (step === 2) {
      setBeats('playing'); setMsg(null);
      [0, 1, 2, 3].forEach((i) => window.setTimeout(() => sfx('heartbeat'), 300 + i * 750));
      window.setTimeout(() => setBeats('ask'), 3400);
    }
  };

  const zoneClick = (zone: string) => armed && applyTool(armed, zone);
  const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;

  const patient = (
    <div className="relative mx-auto w-[min(62vw,240px)] aspect-[120/154]">
      <div className={`absolute inset-0 ${beats === 'playing' ? '' : 'idle-bob'}`}><CharacterArt look={PIP} mood={mood} /></div>
      {knee !== 'bandaged' && <div className="absolute rounded-full" style={{ left: '35%', top: '80%', width: '14%', height: '5%', background: knee === 'scraped' ? '#E2475D' : '#FFB0C8', border: `2px solid ${INK}` }} />}
      {knee === 'bandaged' && <div className="absolute rounded" style={{ left: '34%', top: '79.5%', width: '16%', height: '6%', background: '#FFD6A5', border: `3px solid ${INK}` }} />}
      {beats === 'playing' && <div className="absolute left-[38%] top-[56%] text-5xl heartbeat-big">❤️</div>}
      {[['mouth', 24, 24, 52, 32], ['chest', 26, 57, 48, 18], ['knee', 26, 76, 30, 14]].map(([z, l, t, w, h]) => (
        <div key={z as string} data-drop={z} onClick={() => zoneClick(z as string)}
          className={`absolute rounded-3xl ${armed ? 'drop-zone-armed' : ''}`} style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }} />
      ))}
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap justify-center gap-2 mt-3">
      {TOOLS.map((t) => (
        <DragChip key={t.id} selected={armed === t.id} onTap={() => setArmed(armed === t.id ? null : t.id)} onDrop={(z) => applyTool(t.id, z)}
          className="rounded-2xl border-[3px] border-ink bg-white shadow-chunkysm px-3 py-2 flex items-center gap-2 font-display font-bold text-ink">
          <span className="text-3xl">{t.icon}</span><span className="text-sm sm:text-base">{t.label}</span>
        </DragChip>
      ))}
    </div>
  );

  return (
    <MissionShell id="doctor-checkup" step={step} steps={STEPS} onExit={onExit} color="#FF5D8F">
      <div className="mx-auto max-w-5xl grid md:grid-cols-[1fr_1.1fr] gap-4 items-start">
        <Panel tone="bg-[#E3F6F1]" className="relative">
          <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[#BFE3EA] border-t-[3px] border-ink rounded-b-[22px]" />
          <div className="relative">{patient}</div>
        </Panel>
        <Panel>
          {step === 0 && <>
            <h2 className="font-display text-3xl font-extrabold text-ink">Hi, Doctor!</h2>
            <p className="font-body text-ink text-lg mt-2">This is Pip. Pip fell off a scooter and feels a little wobbly. Let’s give Pip a friendly check-up.</p>
            <p className="font-body text-ink/70 mt-3 text-sm">This is pretend play. If someone is really hurt or sick, tell a grown-up so they can get help from a real doctor.</p>
            <Btn tone="berry" className="mt-4 text-lg" onClick={next}>Start check-up</Btn>
          </>}
          {(step === 1 || step === 2 || step === 3) && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">
              {step === 1 && 'Check Pip’s temperature'}{step === 2 && 'Listen to Pip’s heartbeat'}{step === 3 && 'Take care of the scraped knee'}
            </h2>
            <p className="font-body text-ink mt-1">Drag a tool onto Pip, or tap a tool and then tap Pip.</p>
            {toolbar}
            {step === 2 && beats === 'ask' && (
              <div className="mt-4">
                <p className="font-display text-xl text-ink">How many beats did you hear?</p>
                <div className="flex gap-2 mt-2">{[3, 4, 5].map((n) => <Btn key={n} tone="white" className="text-2xl w-16" onClick={() => (n === 4 ? (good('Yes, 4 beats! Hearts beat faster when we run and slower when we rest.'), setBeats('idle')) : oops('Listen again and count each ba-dum.'))}>{n}</Btn>)}</div>
                <button className="mt-2 font-body text-ink underline" onClick={() => applyTool('stethoscope', 'chest')}>Listen again</button>
              </div>
            )}
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {((step === 1 && msg?.ok) || (step === 2 && msg?.ok && beats === 'idle') || (step === 3 && knee === 'bandaged')) && <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Next</Btn>}
          </>}
          {step === 4 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Inside our bodies</h2>
            <p className="font-display text-xl text-ink mt-1">{organ < ORGANS.length ? ORGANS[organ].ask : 'You know your body parts!'}</p>
            <BodyMap onPick={(id) => {
              if (organ >= ORGANS.length) return;
              if (id === ORGANS[organ].id) { good(ORGANS[organ].fact); setOrgan(organ + 1); } else oops('Not quite. Look again!');
            }} found={ORGANS.slice(0, organ).map((o) => o.id)} />
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {organ >= ORGANS.length && <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Next</Btn>}
          </>}
          {step === 5 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Help Pip stay healthy</h2>
            <p className="font-body text-ink mt-1">Pick all the healthy habits.</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {HABITS.map((h, i) => (
                <button key={h.t} onClick={() => { sfx('tap'); setHabits(habits.includes(i) ? habits.filter((x) => x !== i) : [...habits, i]); setMsg(null); }}
                  className={`rounded-2xl border-[3px] border-ink p-3 text-left font-body text-ink flex items-center gap-2 ${habits.includes(i) ? 'bg-sun' : 'bg-white'}`}>
                  <span className="text-2xl">{h.i}</span>{h.t}
                </button>
              ))}
            </div>
            <Btn tone="berry" className="mt-3" onClick={() => {
              const right = HABITS.every((h, i) => h.ok === habits.includes(i));
              if (right) good('Perfect! Water, sleep, helmets and clean hands keep us healthy.'); else oops('Almost! Choose every healthy habit and none of the others.');
            }}>Check</Btn>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {msg?.ok && <Btn tone="mint" className="mt-4 ml-2 text-lg" onClick={next}>Finish</Btn>}
          </>}
          {step === 6 && <>
            <h2 className="font-display text-3xl font-extrabold text-ink">Pip feels better!</h2>
            <Stars n={stars} />
            <p className="font-body text-ink text-lg mt-2">You checked temperature, listened to a heartbeat, cared for a scrape and taught healthy habits. That’s what caring doctors do!</p>
            <Btn tone="berry" className="mt-4 text-lg" onClick={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'doctor-checkup' }); onExit(); }}>Collect rewards</Btn>
          </>}
        </Panel>
      </div>
    </MissionShell>
  );
}

function BodyMap({ onPick, found }: { onPick: (id: string) => void; found: string[] }) {
  const f = (id: string, c: string) => (found.includes(id) ? c : '#FFFFFF');
  const st = { stroke: INK, strokeWidth: 3, cursor: 'pointer' };
  return (
    <svg viewBox="0 0 200 260" className="w-full max-w-[260px] mx-auto mt-2" role="group" aria-label="Body map">
      <circle cx="100" cy="42" r="34" fill="#F6CBA5" {...st} cursor="default" />
      <rect x="56" y="80" width="88" height="130" rx="34" fill="#F6CBA5" {...st} cursor="default" />
      <path d="M78 34 Q100 12 122 34 Q126 54 100 56 Q74 54 78 34Z" fill={f('brain', '#FFB0C8')} {...st} onClick={() => onPick('brain')} aria-label="brain" />
      <ellipse cx="80" cy="122" rx="15" ry="26" fill={f('lungs', '#7FD3F7')} {...st} onClick={() => onPick('lungs')} aria-label="left lung" />
      <ellipse cx="122" cy="122" rx="15" ry="26" fill={f('lungs', '#7FD3F7')} {...st} onClick={() => onPick('lungs')} aria-label="right lung" />
      <path d="M100 140 C86 128 88 112 98 114 C102 114 102 118 103 120 C104 117 108 112 112 114 C120 118 114 130 100 140Z" fill={f('heart', '#FF5D8F')} {...st} onClick={() => onPick('heart')} aria-label="heart" />
      <path d="M86 160 Q110 150 120 168 Q122 188 98 186 Q82 182 86 160Z" fill={f('stomach', '#FFC93C')} {...st} onClick={() => onPick('stomach')} aria-label="stomach" />
    </svg>
  );
}
