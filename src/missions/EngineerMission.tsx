import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../engine/store';
import { INK } from '../components/art/Character';
import { Btn, Coin } from '../ui/kit';
import { MissionShell, Panel, Feedback, Stars } from './MissionShell';
import { sfx } from '../engine/sfx';

// ── Simple, explainable bridge physics ───────────────────
type Material = 'cardboard' | 'wood' | 'steel';
type Shape = 'beam' | 'arch' | 'truss' | 'suspension';
const MATERIALS: Record<Material, { label: string; icon: string; strength: number; cost: number; color: string; note: string }> = {
  cardboard: { label: 'Cardboard', icon: '📦', strength: 0.4, cost: 5, color: '#D9B98A', note: 'Cheap but weak and floppy.' },
  wood: { label: 'Wood', icon: '🪵', strength: 2, cost: 10, color: '#C98F63', note: 'Strong for its price.' },
  steel: { label: 'Steel', icon: '🔩', strength: 4, cost: 20, color: '#8E9BB0', note: 'Very strong but costs more.' },
};
const SHAPES: Record<Shape, { label: string; mult: number; cost: number; fact: string }> = {
  beam: { label: 'Beam', mult: 1, cost: 0, fact: 'A flat beam is simple. The middle bends the most.' },
  arch: { label: 'Arch', mult: 1.6, cost: 10, fact: 'An arch pushes the weight out to the ends, into the ground.' },
  truss: { label: 'Truss', mult: 1.8, cost: 15, fact: 'Triangles don’t squish easily, so trusses are stiff and strong.' },
  suspension: { label: 'Suspension', mult: 2.2, cost: 25, fact: 'Cables hang from tall towers and hold the road up.' },
};
const CAR_WEIGHT = 2, GOAL = 5, BUDGET = 100, SUPPORT_COST = 10, SUPPORT_STRENGTH = 1.5;

interface Design { material: Material; shape: Shape; supports: number; beams: number }
const strengthOf = (d: Design) => d.beams * MATERIALS[d.material].strength * SHAPES[d.shape].mult + d.supports * SUPPORT_STRENGTH;
const costOf = (d: Design) => d.beams * MATERIALS[d.material].cost + SHAPES[d.shape].cost + d.supports * SUPPORT_COST;
const capacityOf = (d: Design) => Math.floor(strengthOf(d) / CAR_WEIGHT);

const STEPS = ['Ask', 'Imagine', 'Plan', 'Build', 'Test', 'Improve'];
const CAR_COLORS = ['#FF5D8F', '#FFC93C', '#5FE0B7', '#3D7BFF', '#FF8A3D'];

function BridgeView({ d, cars = 0, broken = false, carsMoving = -1 }: { d: Design; cars?: number; broken?: boolean; carsMoving?: number }) {
  const m = MATERIALS[d.material];
  const cap = strengthOf(d);
  const load = Math.min(cars, GOAL) * CAR_WEIGHT;
  const sag = broken ? 0 : Math.min(26, (load / Math.max(cap, 0.1)) * 18);
  const L = 230, R = 770, Y = 250;
  const deckH = 6 + d.beams * 4;
  const supportsX = Array.from({ length: d.supports }, (_, i) => L + ((i + 1) * (R - L)) / (d.supports + 1));
  const deck = `M${L} ${Y} Q500 ${Y + sag * 2} ${R} ${Y}`;
  const carX = (i: number) => L + 50 + i * 95;
  return (
    <svg viewBox="0 0 1000 420" className="w-full rounded-[22px] border-[4px] border-ink bg-[#BDEBFF]" aria-label="Bridge preview">
      <rect x="0" y="300" width="1000" height="120" fill="#3D9BFF" />
      <path d="M0 300 Q60 290 120 300 T240 300 T360 300 T480 300 T600 300 T720 300 T840 300 T1000 300" fill="none" stroke="#fff" strokeWidth="4" opacity="0.6" className="waves" />
      <path d="M0 240 L230 240 L250 420 L0 420Z" fill="#8BD46E" stroke={INK} strokeWidth="4" />
      <path d="M1000 240 L770 240 L750 420 L1000 420Z" fill="#8BD46E" stroke={INK} strokeWidth="4" />
      <rect x="0" y="232" width="232" height="14" fill="#6F6A8F" stroke={INK} strokeWidth="3" />
      <rect x="768" y="232" width="232" height="14" fill="#6F6A8F" stroke={INK} strokeWidth="3" />
      {!broken && <g className={cars > 0 ? 'bridge-wobble' : ''}>
        {supportsX.map((x) => <rect key={x} x={x - 9} y={Y + sag * 1.4} width="18" height={420 - Y} fill={m.color} stroke={INK} strokeWidth="4" />)}
        {d.shape === 'arch' && <path d={`M${L} ${Y + 60} Q500 ${Y - 60 + sag} ${R} ${Y + 60}`} fill="none" stroke={m.color} strokeWidth="18" strokeLinecap="round" />}
        {d.shape === 'arch' && <path d={`M${L} ${Y + 60} Q500 ${Y - 60 + sag} ${R} ${Y + 60}`} fill="none" stroke={INK} strokeWidth="3" />}
        {d.shape === 'truss' && Array.from({ length: 8 }, (_, i) => { const x1 = L + (i * (R - L)) / 8, x2 = L + ((i + 1) * (R - L)) / 8; return <path key={i} d={`M${x1} ${Y} L${(x1 + x2) / 2} ${Y - 55} L${x2} ${Y}`} fill="none" stroke={m.color} strokeWidth="9" strokeLinejoin="round" />; })}
        {d.shape === 'truss' && <line x1={L + 34} x2={R - 34} y1={Y - 55} y2={Y - 55} stroke={m.color} strokeWidth="9" />}
        {d.shape === 'suspension' && <>
          {[L + 70, R - 70].map((x) => <rect key={x} x={x - 10} y={Y - 140} width="20" height="200" fill={m.color} stroke={INK} strokeWidth="4" />)}
          <path d={`M${L} ${Y - 10} L${L + 70} ${Y - 140} Q500 ${Y - 30 + sag} ${R - 70} ${Y - 140} L${R} ${Y - 10}`} fill="none" stroke={INK} strokeWidth="5" />
          {Array.from({ length: 7 }, (_, i) => { const x = L + 120 + i * 50; return <line key={i} x1={x} x2={x} y1={Y - 80 + Math.abs(i - 3) * -12 + sag} y2={Y} stroke={INK} strokeWidth="2.5" />; })}
        </>}
        <path d={deck} fill="none" stroke={INK} strokeWidth={deckH + 7} strokeLinecap="butt" />
        <path d={deck} fill="none" stroke={m.color} strokeWidth={deckH} strokeLinecap="butt" />
      </g>}
      {broken && <g className="bridge-break">
        <path d={`M${L} ${Y} L${L + 200} ${Y + 40}`} stroke={m.color} strokeWidth={deckH} /><path d={`M${R} ${Y} L${R - 200} ${Y + 50}`} stroke={m.color} strokeWidth={deckH} />
        <text x="500" y="200" textAnchor="middle" fontSize="54" fontFamily="Grandstander, system-ui" fill={INK}>CRACK!</text>
        <circle cx="470" cy="330" r="16" fill="#fff" opacity="0.8" className="splash-dot" /><circle cx="530" cy="320" r="12" fill="#fff" opacity="0.8" className="splash-dot" />
      </g>}
      {Array.from({ length: Math.min(cars, GOAL) }, (_, i) => {
        const parked = broken ? 60 + i * 30 : carX(i);
        const x = broken ? parked : i === carsMoving ? undefined : parked;
        const sagAt = broken ? 0 : Math.sin(((parked - L) / (R - L)) * Math.PI) * sag * 1.4;
        const moving = i === carsMoving;
        return (
          <g key={i} transform={`translate(0 ${broken ? 220 : Y - 30 + sagAt})`}>
            <g className={moving ? 'car-drive' : ''} style={moving ? ({ ['--to' as string]: `${carX(i)}px` } as React.CSSProperties) : undefined} transform={moving ? undefined : `translate(${x ?? parked} 0)`}>
              <rect x="-34" y="-6" width="68" height="22" rx="8" fill={CAR_COLORS[i]} stroke={INK} strokeWidth="3" />
              <path d="M-20 -6 Q-14 -22 2 -22 Q18 -22 22 -6Z" fill="#BFEFFF" stroke={INK} strokeWidth="3" />
              <circle cx="-18" cy="18" r="7" fill={INK} /><circle cx="18" cy="18" r="7" fill={INK} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

export function EngineerMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [learned, setLearned] = useState<Shape[]>([]);
  const [plan, setPlan] = useState<string[]>([]);
  const [d, setD] = useState<Design>({ material: 'cardboard', shape: 'beam', supports: 0, beams: 2 });
  const [test, setTest] = useState<{ cars: number; moving: number; broken: boolean; done: boolean } | null>(null);
  const [tries, setTries] = useState(0);
  const [best, setBest] = useState<{ held: number; cost: number } | null>(null);
  const timer = useRef<number[]>([]);
  useEffect(() => () => timer.current.forEach(window.clearTimeout), []);

  const next = () => { setMsg(null); setStep((s) => s + 1); sfx('pop'); };
  const cost = costOf(d), cap = capacityOf(d);
  const over = cost > BUDGET;

  const runTest = () => {
    timer.current.forEach(window.clearTimeout); timer.current = [];
    setTries((t) => t + 1);
    setTest({ cars: 0, moving: -1, broken: false, done: false });
    for (let i = 0; i < GOAL; i++) {
      timer.current.push(window.setTimeout(() => { setTest((t) => t && { ...t, cars: i + 1, moving: i }); sfx('whoosh'); }, 300 + i * 1100));
      timer.current.push(window.setTimeout(() => {
        if (i + 1 > cap) {
          setTest((t) => t && { ...t, broken: true, done: true, moving: -1 }); sfx('crack');
          timer.current.forEach(window.clearTimeout);
          finish(i, false);
        } else if (i === GOAL - 1) { setTest((t) => t && { ...t, done: true, moving: -1 }); sfx('success'); finish(GOAL, true); }
        else sfx('tap');
      }, 300 + i * 1100 + 800));
    }
  };
  const finish = (held: number, ok: boolean) => {
    void ok; setBest({ held, cost });
    window.setTimeout(() => setStep(5), 900);
  };

  const hints: string[] = [];
  if (best && best.held < GOAL) {
    if (d.material === 'cardboard') hints.push('Cardboard is weak. Try wood or steel.');
    if (d.supports < 2) hints.push('Supports under the bridge help hold the middle up.');
    if (d.shape === 'beam') hints.push('Triangles (truss) and arches spread out the weight.');
    if (d.beams < 4) hints.push('More beams make the road thicker and stronger.');
  }
  const success = best && best.held >= GOAL;
  const stars = !success ? 0 : best!.cost <= 60 ? 3 : best!.cost <= 80 ? 2 : 1;

  const Opt = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={() => { sfx('tap'); onClick(); }} className={`rounded-2xl border-[3px] border-ink px-3 py-2 font-display font-bold text-ink text-left ${on ? 'bg-sun shadow-chunkysm' : 'bg-white'}`}>{children}</button>
  );
  const Stepper = ({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) => (
    <div className="flex items-center gap-2">
      <span className="font-display font-bold text-ink w-24">{label}</span>
      <button aria-label={`Fewer ${label}`} className="w-11 h-11 rounded-full border-[3px] border-ink bg-white font-display text-2xl text-ink" onClick={() => { sfx('tap'); set(Math.max(min, value - 1)); }}>−</button>
      <span className="font-display text-2xl text-ink w-8 text-center tabular-nums">{value}</span>
      <button aria-label={`More ${label}`} className="w-11 h-11 rounded-full border-[3px] border-ink bg-white font-display text-2xl text-ink" onClick={() => { sfx('tap'); set(Math.min(max, value + 1)); }}>+</button>
    </div>
  );

  return (
    <MissionShell id="engineer-bridge" step={step} steps={STEPS} onExit={onExit} color="#FF8A3D">
      <div className="mx-auto max-w-5xl">
        {step === 0 && (
          <Panel tone="bg-[#D8EEFF]">
            <h2 className="font-display text-3xl font-extrabold text-ink">Ask: what’s the problem?</h2>
            <BridgeView d={{ material: 'wood', shape: 'beam', supports: 0, beams: 0 }} />
            <p className="font-body text-ink text-lg mt-3">The town wants to drive across Blue River. Your bridge must hold <b>{GOAL} cars at once</b> and cost no more than <b>{BUDGET} coins</b> (pretend money).</p>
            <p className="font-display text-xl text-ink mt-3">Engineers start by asking: what problem are we solving?</p>
            <div className="grid sm:grid-cols-3 gap-2 mt-2">
              {[['Cars can’t get across the river', true], ['The river is too blue', false], ['Cars need new paint', false]].map(([t, ok]) => (
                <Opt key={t as string} on={false} onClick={() => (ok ? (setMsg({ ok: true, text: 'Exactly! We need a safe way across.' }), sfx('success')) : setMsg({ ok: false, text: 'Look at the picture again. What can’t the cars do?' }))}>{t as string}</Opt>
              ))}
            </div>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {msg?.ok && <Btn tone="sun" className="mt-4 text-lg" onClick={next}>Imagine ideas</Btn>}
          </Panel>
        )}

        {step === 1 && (
          <Panel>
            <h2 className="font-display text-3xl font-extrabold text-ink">Imagine: bridge ideas</h2>
            <p className="font-body text-ink mt-1">Tap each kind of bridge to learn how it works.</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {(Object.keys(SHAPES) as Shape[]).map((s) => (
                <button key={s} onClick={() => { sfx('pop'); setLearned((l) => (l.includes(s) ? l : [...l, s])); }} className={`rounded-2xl border-[3px] border-ink p-2 text-left ${learned.includes(s) ? 'bg-white' : 'bg-sky/30 shadow-chunkysm'}`}>
                  <BridgeView d={{ material: 'wood', shape: s, supports: s === 'beam' ? 1 : 0, beams: 3 }} />
                  <div className="font-display font-extrabold text-ink text-xl mt-1">{SHAPES[s].label}</div>
                  {learned.includes(s) ? <p className="font-body text-ink">{SHAPES[s].fact}</p> : <p className="font-body text-ink/60">Tap to learn</p>}
                </button>
              ))}
            </div>
            {learned.length >= 2 && <Btn tone="sun" className="mt-4 text-lg" onClick={next}>Make a plan</Btn>}
          </Panel>
        )}

        {step === 2 && (
          <Panel>
            <h2 className="font-display text-3xl font-extrabold text-ink">Plan: what matters most?</h2>
            <p className="font-body text-ink mt-1">Pick the two most important goals for this bridge.</p>
            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              {['Hold 5 cars', 'Stay under 100 coins', 'Be painted purple', 'Be the tallest'].map((g) => (
                <Opt key={g} on={plan.includes(g)} onClick={() => { setMsg(null); setPlan(plan.includes(g) ? plan.filter((x) => x !== g) : [...plan, g].slice(-2)); }}>{g}</Opt>
              ))}
            </div>
            <Btn tone="berry" className="mt-3" disabled={plan.length < 2} onClick={() => {
              if (plan.includes('Hold 5 cars') && plan.includes('Stay under 100 coins')) { setMsg({ ok: true, text: 'Great plan! Engineers balance strength and cost.' }); sfx('success'); }
              else { setMsg({ ok: false, text: 'Check the problem again: how many cars, and how many coins?' }); sfx('fail'); }
            }}>Check my plan</Btn>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {msg?.ok && <Btn tone="sun" className="mt-4 text-lg" onClick={next}>Start building</Btn>}
          </Panel>
        )}

        {step === 3 && (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
            <Panel tone="bg-[#D8EEFF]">
              <BridgeView d={d} />
              <div className="mt-3 grid grid-cols-2 gap-2 font-display text-ink">
                <div className={`rounded-2xl border-[3px] border-ink p-2 flex items-center gap-2 ${over ? 'bg-[#FFE0E8]' : 'bg-white'}`}><Coin /> Cost: <b className="text-2xl tabular-nums">{cost}</b> / {BUDGET}</div>
                <div className="rounded-2xl border-[3px] border-ink p-2 bg-white">Goal: hold {GOAL} cars 🚗</div>
              </div>
              {over && <Feedback ok={false}>Over budget! Use fewer beams, fewer supports or a cheaper material.</Feedback>}
            </Panel>
            <Panel>
              <h2 className="font-display text-2xl font-extrabold text-ink">Build</h2>
              <div className="font-display font-bold text-ink mt-2">Material</div>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {(Object.keys(MATERIALS) as Material[]).map((k) => <Opt key={k} on={d.material === k} onClick={() => setD({ ...d, material: k })}><div className="text-3xl">{MATERIALS[k].icon}</div>{MATERIALS[k].label}<div className="font-body text-xs font-normal">{MATERIALS[k].cost} coins each</div></Opt>)}
              </div>
              <p className="font-body text-sm text-ink/80 mt-1">{MATERIALS[d.material].note}</p>
              <div className="font-display font-bold text-ink mt-3">Shape</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(Object.keys(SHAPES) as Shape[]).map((k) => <Opt key={k} on={d.shape === k} onClick={() => setD({ ...d, shape: k })}>{SHAPES[k].label}<span className="font-body text-xs font-normal ml-1">+{SHAPES[k].cost}</span></Opt>)}
              </div>
              <div className="mt-3 space-y-2">
                <Stepper label="Beams" value={d.beams} min={1} max={6} set={(beams) => setD({ ...d, beams })} />
                <Stepper label="Supports" value={d.supports} min={0} max={3} set={(supports) => setD({ ...d, supports })} />
              </div>
              <Btn tone="berry" className="mt-4 w-full text-xl" disabled={over} onClick={() => { next(); window.setTimeout(runTest, 300); }}>🚗 Test it!</Btn>
            </Panel>
          </div>
        )}

        {step === 4 && (
          <Panel tone="bg-[#D8EEFF]">
            <h2 className="font-display text-3xl font-extrabold text-ink">Test: here come the cars!</h2>
            <BridgeView d={d} cars={test?.cars ?? 0} broken={test?.broken} carsMoving={test?.moving ?? -1} />
            <p className="font-display text-2xl text-ink mt-3">Cars on the bridge: {test?.broken ? (test.cars - 1) : test?.cars ?? 0} / {GOAL}</p>
            {test?.broken && <Feedback ok={false}>The bridge cracked! Don’t worry, everyone backed up safely. Engineers learn from every test.</Feedback>}
          </Panel>
        )}

        {step === 5 && (
          <Panel>
            <h2 className="font-display text-3xl font-extrabold text-ink">{success ? 'Improve: it worked!' : 'Improve: let’s make it stronger'}</h2>
            <BridgeView d={d} cars={success ? GOAL : 0} />
            {success ? <>
              <Stars n={stars} />
              <p className="font-body text-ink text-lg mt-2">Your bridge held all {GOAL} cars for {best!.cost} coins. {stars < 3 && 'Can you build one that costs 60 coins or less? Real engineers try to save money too.'}</p>
            </> : <>
              <p className="font-body text-ink text-lg mt-2">It held {best?.held ?? 0} car{best?.held === 1 ? '' : 's'}. Ideas to try:</p>
              <ul className="mt-2 space-y-1">{hints.map((h) => <li key={h} className="rounded-xl border-2 border-ink bg-sky/30 px-3 py-1 font-body text-ink">💡 {h}</li>)}</ul>
            </>}
            <div className="flex flex-wrap gap-2 mt-4">
              <Btn tone="sun" className="text-lg" onClick={() => { setStep(3); setTest(null); }}>🔧 Change the design</Btn>
              {success && <Btn tone="berry" className="text-lg" onClick={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'engineer-bridge' }); onExit(); }}>Open the bridge & collect rewards</Btn>}
            </div>
            <p className="font-body text-ink/60 text-sm mt-3">Tests so far: {tries}</p>
          </Panel>
        )}
      </div>
    </MissionShell>
  );
}
