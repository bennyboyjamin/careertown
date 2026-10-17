import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { sfx } from '../engine/sfx';

const STEPS = ['Orders', 'Memory'];
const BASES = [
  { id: 'cocoa', icon: '☕', name: 'hot cocoa', color: '#8A5A3A' },
  { id: 'milk', icon: '🥛', name: 'warm milk', color: '#F7F3EA' },
  { id: 'lemon', icon: '🍋', name: 'lemonade', color: '#FFE36E' },
  { id: 'berry', icon: '🍓', name: 'berry smoothie', color: '#F27BA5' },
];
const TOPS = [
  { id: 'cream', icon: '🍦', name: 'whipped cream' },
  { id: 'marsh', icon: '🍡', name: 'marshmallows' },
  { id: 'sprinkles', icon: '🌈', name: 'sprinkles' },
  { id: 'ice', icon: '🧊', name: 'ice' },
];
type Drink = { base: string; tops: string[] };
const describe = (d: Drink) => { const b = BASES.find((x) => x.id === d.base)!.name; const t = d.tops.map((id) => TOPS.find((x) => x.id === id)!.name); return t.length ? `${b} with ${t.join(' and ')}` : `plain ${b}`; };
const same = (a: Drink, b: Drink) => a.base === b.base && a.tops.length === b.tops.length && a.tops.every((t) => b.tops.includes(t));

function Cup({ d }: { d: Drink | null }) {
  const base = d && BASES.find((x) => x.id === d.base);
  return (
    <div className="cafe-cup" aria-hidden>
      <div className="cafe-fill" style={{ background: base?.color ?? 'transparent', height: base ? '70%' : 0 }} />
      <div className="cafe-tops">{d?.tops.map((t) => TOPS.find((x) => x.id === t)!.icon).join(' ')}</div>
    </div>
  );
}

/* 1. Make each drink exactly how the customer asked. */
const ORDERS: { who: string; d: Drink }[] = [
  { who: '👧', d: { base: 'cocoa', tops: ['cream', 'marsh'] } },
  { who: '👴', d: { base: 'milk', tops: [] } },
  { who: '🧒', d: { base: 'lemon', tops: ['ice'] } },
  { who: '👩', d: { base: 'berry', tops: ['cream', 'sprinkles'] } },
];
function OrderStep({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [cup, setCup] = useState<Drink | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const o = ORDERS[i];
  const serve = () => {
    if (!cup) { sfx('fail'); setMsg({ ok: false, text: 'Pick a drink for the cup first.' }); return; }
    if (same(cup, o.d)) { sfx('success'); setMsg({ ok: true, text: 'Perfect, just how they like it! 😋' }); }
    else { sfx('fail'); setMsg({ ok: false, text: `That’s ${describe(cup)}. They asked for ${describe(o.d)}. Try again!` }); }
  };
  const toggle = (t: string) => { if (!cup || msg?.ok) return; sfx('pop'); setCup({ ...cup, tops: cup.tops.includes(t) ? cup.tops.filter((x) => x !== t) : [...cup.tops, t] }); setMsg(null); };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Order {i + 1} of {ORDERS.length}</h2>
      <p className="font-body text-ink text-lg mt-1"><span style={{ fontSize: 30 }}>{o.who}</span> “Can I have a <b>{describe(o.d)}</b>, please?”</p>
      <div className="flex flex-wrap gap-4 items-end mt-3">
        <Cup d={cup} />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-ink">Drink</div>
          <div className="flex flex-wrap gap-2 mt-1">{BASES.map((b) => <button key={b.id} onClick={() => { if (msg?.ok) return; sfx('splash'); setCup({ base: b.id, tops: cup?.tops ?? [] }); setMsg(null); }} className={`cafe-pick ${cup?.base === b.id ? 'on' : ''}`}>{b.icon} {b.name}</button>)}</div>
          <div className="font-display font-bold text-ink mt-2">Toppings</div>
          <div className="flex flex-wrap gap-2 mt-1">{TOPS.map((t) => <button key={t.id} onClick={() => toggle(t.id)} className={`cafe-pick ${cup?.tops.includes(t.id) ? 'on' : ''}`}>{t.icon} {t.name}</button>)}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {!msg?.ok && <><Btn tone="sun" onClick={serve}>🛎️ Serve</Btn><Btn tone="white" onClick={() => { setCup(null); setMsg(null); }}>New cup</Btn></>}
        {msg?.ok && <Btn tone="mint" onClick={() => { setCup(null); setMsg(null); if (i + 1 < ORDERS.length) setI(i + 1); else onDone(); }}>{i + 1 < ORDERS.length ? 'Next customer →' : 'Next: remember the orders →'}</Btn>}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
    </Panel>
  );
}

/* 2. Memory: look at three orders, then hand each customer the right drink. */
function MemoryStep({ onDone }: { onDone: () => void }) {
  const round = useMemo(() => { const who = ['🐻', '🐰', '🦊']; const pool = [...ORDERS].sort(() => Math.random() - 0.5).slice(0, 3); return who.map((w, k) => ({ who: w, d: pool[k].d })); }, []);
  const [show, setShow] = useState(true);
  const [given, setGiven] = useState<Record<string, number>>({});
  const [sel, setSel] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { if (!show) return; const id = window.setTimeout(() => setShow(false), 6000); return () => window.clearTimeout(id); }, [show]);
  const drinks = useMemo(() => round.map((r, k) => ({ k, d: r.d })).sort(() => Math.random() - 0.5), [round]);
  const give = (who: string, k: number) => {
    if (sel === null) return;
    const ok = round.findIndex((r) => r.who === who) === sel;
    if (ok) { sfx('success'); const g = { ...given, [who]: sel }; setGiven(g); setSel(null); setMsg(Object.keys(g).length === 3 ? { ok: true, text: 'You remembered every order! Great baristas have great memories.' } : null); }
    else { sfx('fail'); setMsg({ ok: false, text: 'That’s not what they ordered. Try another customer!' }); setSel(null); }
    void k;
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">{show ? 'Remember these orders!' : 'Who ordered what?'}</h2>
      <p className="font-body text-ink text-lg mt-1">{show ? 'Look carefully. They will hide in a few seconds.' : 'Tap a drink, then tap the customer who ordered it.'}</p>
      <div className="flex flex-wrap gap-3 mt-3">
        {round.map((r) => (
          <button key={r.who} onClick={() => !show && give(r.who, 0)} className="cafe-customer" aria-label={`Customer ${r.who}`}>
            <span style={{ fontSize: 44 }}>{r.who}</span>
            {show ? <><Cup d={r.d} /><small>{describe(r.d)}</small></> : given[r.who] !== undefined ? <Cup d={r.d} /> : <span className="font-display font-bold text-ink">?</span>}
          </button>
        ))}
      </div>
      {!show && (
        <div className="flex flex-wrap gap-3 mt-3">
          {drinks.filter((x) => !Object.values(given).includes(x.k)).map((x) => (
            <button key={x.k} onClick={() => { sfx('pop'); setSel(x.k); setMsg(null); }} className={`cafe-drink ${sel === x.k ? 'on' : ''}`} aria-label={describe(x.d)}><Cup d={x.d} /></button>
          ))}
        </div>
      )}
      {show && <div className="mt-3"><Btn tone="white" onClick={() => setShow(false)}>I’m ready!</Btn></div>}
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {Object.keys(given).length === 3 && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Finish →</Btn></div>}
    </Panel>
  );
}

export function CafeMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  return (
    <MissionShell id="cafe-barista" step={step} steps={STEPS} onExit={onExit} color="#FFD8B8">
      {step === 0 && <OrderStep onDone={() => setStep(1)} />}
      {step === 1 && <MemoryStep onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'cafe-barista' }); onExit(); }} />}
    </MissionShell>
  );
}
