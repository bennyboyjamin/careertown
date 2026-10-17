import { useState } from 'react';
import { useGame } from '../engine/store';
import { Person } from '../components/Person';
import { npc } from '../data/dollLooks';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback, Stars } from './MissionShell';
import { sfx } from '../engine/sfx';

const SUNNY = npc('sunny', 'Chef Sunny');
const STEPS = ['Hello', 'Get ready', 'Recipe', 'Orders', 'Bake', 'Share', 'Done'];

const READY = [
  { t: 'Wash your hands', ok: true, i: '🧼' }, { t: 'Tie back long hair', ok: true, i: '🎀' },
  { t: 'Put on an apron', ok: true, i: '🧑‍🍳' }, { t: 'Lick the spoon', ok: false, i: '🥄' },
  { t: 'Wipe the counter clean', ok: true, i: '🧽' }, { t: 'Sneeze on the food', ok: false, i: '🤧' },
];
const RECIPE = ['Roll out the dough', 'Spread tomato sauce', 'Sprinkle the cheese', 'Add the toppings', 'Bake in the oven', 'Slice and serve'];
const SHUFFLED = [3, 0, 5, 2, 4, 1];

type Topping = 'pepperoni' | 'mushroom' | 'pepper' | 'olive';
const TOPPINGS: { id: Topping; label: string; icon: string }[] = [
  { id: 'pepperoni', label: 'Pepperoni', icon: '🔴' }, { id: 'mushroom', label: 'Mushrooms', icon: '🍄' },
  { id: 'pepper', label: 'Peppers', icon: '🫑' }, { id: 'olive', label: 'Olives', icon: '⚫' },
];
const ORDERS: { who: string; name: string; says: string; wants: Topping[] }[] = [
  { who: 'ben', name: 'Ben', says: 'Pepperoni and olives, please!', wants: ['pepperoni', 'olive'] },
  { who: 'ava', name: 'Ava', says: 'Peppers and mushrooms. No meat for me, thank you!', wants: ['pepper', 'mushroom'] },
  { who: 'chloe', name: 'Chloe', says: 'Just cheese. Plain and simple!', wants: [] },
];

export function ChefMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [mood, setMood] = useState<'normal' | 'happy'>('normal');
  const [ready, setReady] = useState<number[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [served, setServed] = useState(0);
  const [tops, setTops] = useState<Topping[]>([]);
  const [bake, setBake] = useState<'raw' | 'baking' | 'golden' | 'out'>('raw');
  const [share, setShare] = useState<'count' | 'fraction' | 'done'>('count');

  const oops = (text: string) => { setMistakes((m) => m + 1); setMsg({ ok: false, text }); sfx('fail'); };
  const good = (text: string) => { setMsg({ ok: true, text }); sfx('success'); setMood('happy'); window.setTimeout(() => setMood('normal'), 1200); };
  const next = () => { setMsg(null); setStep((s) => s + 1); sfx('pop'); };
  const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;

  const pizza = step === 3 ? { tops, baked: false } : step >= 4 ? { tops: ['pepperoni', 'mushroom', 'pepper', 'olive'] as Topping[], baked: bake === 'golden' || bake === 'out' } : null;

  const tapRecipe = (i: number) => {
    if (order.includes(i)) return;
    if (i === order.length) {
      const nextOrder = [...order, i]; setOrder(nextOrder); sfx('pop'); setMsg(null);
      if (nextOrder.length === RECIPE.length) good('Perfect order! Recipes work best when you follow every step in order.');
    } else oops(order.length === 0 ? 'What do you need before anything else can go on? Start with the base.' : `Not yet! What comes right after “${RECIPE[order.length - 1].toLowerCase()}”?`);
  };

  const serve = () => {
    const o = ORDERS[served];
    const match = o.wants.length === tops.length && o.wants.every((t) => tops.includes(t));
    if (!match) {
      const missing = o.wants.filter((t) => !tops.includes(t)), extra = tops.filter((t) => !o.wants.includes(t));
      return oops(extra.length ? `${o.name} didn’t ask for ${TOPPINGS.find((x) => x.id === extra[0])!.label.toLowerCase()}. Listen to the order again.` : `${o.name} also wanted ${TOPPINGS.find((x) => x.id === missing[0])!.label.toLowerCase()}.`);
    }
    good(served === ORDERS.length - 1 ? 'Every order is just right. Your customers are so happy!' : `${o.name} loves it! Next customer…`);
    setTops([]);
    setServed(served + 1);
  };

  const startBake = () => {
    if (bake !== 'raw') return;
    setBake('baking'); setMsg(null); sfx('whoosh');
    window.setTimeout(() => { setBake('golden'); sfx('ring'); }, 2600);
  };

  return (
    <MissionShell id="chef-pizza" step={step} steps={STEPS} onExit={onExit} color="#FF8A3D">
      <div className="mx-auto max-w-5xl grid md:grid-cols-[1fr_1.1fr] gap-4 items-start">
        <Panel tone="bg-cafe" className="relative">
          <div style={{ height: '22%' }} className="absolute inset-x-0 bottom-0 bg-cafe-floor border-t-[3px] border-ink rounded-b-[22px]" />
          <div className="relative flex items-end justify-center gap-2">
            <div className={`relative ${mood === 'happy' ? 'idle-bob' : ''}`} style={{ width: 'min(30vw, 20vh, 170px)', aspectRatio: '384 / 881' }}>
              <Person c={SUNNY} mood={mood} />
            </div>
            {step === 3 && served < ORDERS.length && (
              <div className="relative" style={{ width: 'min(22vw, 14vh, 120px)', aspectRatio: '384 / 780' }}>
                <Person c={npc(ORDERS[served].who, ORDERS[served].name)} mood="happy" />
              </div>
            )}
          </div>
          {pizza && <div className="relative mx-auto mt-3" style={{ width: 'min(48vw, 26vh, 230px)' }}><Pizza tops={pizza.tops} baked={pizza.baked} sliced={step === 5} /></div>}
        </Panel>
        <Panel>
          {step === 0 && <>
            <h2 className="font-display text-3xl font-extrabold text-ink">Welcome to Café Sunny!</h2>
            <p className="font-body text-ink text-lg mt-2">I’m Chef Sunny. We have a pizza party today and lots of hungry customers. Will you help me cook?</p>
            <p className="font-body text-ink/70 mt-3 text-sm">This is pretend cooking. Ovens and stoves are hot, so always cook with a grown-up in a real kitchen.</p>
            <Btn tone="berry" className="mt-4 text-lg" onClick={next}>Let’s cook!</Btn>
          </>}

          {step === 1 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Get ready to cook</h2>
            <p className="font-body text-ink mt-1">Chefs keep food clean and safe. Pick everything a chef does before cooking.</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {READY.map((h, i) => (
                <button key={h.t} onClick={() => { sfx('tap'); setReady(ready.includes(i) ? ready.filter((x) => x !== i) : [...ready, i]); setMsg(null); }}
                  className={`rounded-2xl border-[3px] border-ink p-3 text-left font-body text-ink flex items-center gap-2 ${ready.includes(i) ? 'bg-sun' : 'bg-white'}`}>
                  <span className="text-2xl">{h.i}</span>{h.t}
                </button>
              ))}
            </div>
            <Btn tone="berry" className="mt-3" onClick={() => (READY.every((h, i) => h.ok === ready.includes(i))
              ? good('Clean hands, tied-back hair, an apron and a clean counter. You’re ready to cook!')
              : oops('Almost! Choose every clean-and-safe step and none of the others.'))}>Check</Btn>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {msg?.ok && <Btn tone="mint" className="mt-4 ml-2 text-lg" onClick={next}>Next</Btn>}
          </>}

          {step === 2 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Follow the recipe</h2>
            <p className="font-body text-ink mt-1">Tap the pizza steps in the right order, from first to last.</p>
            <div className="grid gap-2 mt-3">
              {SHUFFLED.map((i) => {
                const pos = order.indexOf(i);
                return (
                  <button key={i} onClick={() => tapRecipe(i)} disabled={pos >= 0}
                    className={`rounded-2xl border-[3px] border-ink px-3 py-2 text-left font-body text-ink text-lg flex items-center gap-3 ${pos >= 0 ? 'bg-mint' : 'bg-white'}`}>
                    <span className="w-9 h-9 shrink-0 rounded-full border-[3px] border-ink bg-white grid place-items-center font-display font-bold">{pos >= 0 ? pos + 1 : '?'}</span>{RECIPE[i]}
                  </button>
                );
              })}
            </div>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {order.length === RECIPE.length && <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Next</Btn>}
          </>}

          {step === 3 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Take the orders</h2>
            {served < ORDERS.length ? <>
              <p className="font-body text-ink mt-1">Customer {served + 1} of {ORDERS.length}. Make the pizza just the way they ask.</p>
              <div className="mt-3 rounded-2xl border-[3px] border-ink bg-order px-4 py-3 font-display text-xl text-ink">
                <b>{ORDERS[served].name}:</b> “{ORDERS[served].says}”
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {TOPPINGS.map((t) => (
                  <button key={t.id} aria-pressed={tops.includes(t.id)} onClick={() => { sfx('pop'); setMsg(null); setTops(tops.includes(t.id) ? tops.filter((x) => x !== t.id) : [...tops, t.id]); }}
                    className={`rounded-2xl border-[3px] border-ink shadow-chunkysm px-3 py-2 flex items-center gap-2 font-display font-bold text-ink ${tops.includes(t.id) ? 'bg-sun' : 'bg-white'}`}>
                    <span className="text-2xl">{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
              <Btn tone="berry" className="mt-3 text-lg" onClick={serve}>Serve 🍕</Btn>
            </> : <p className="font-body text-ink text-lg mt-2">All three customers got exactly what they ordered.</p>}
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {served >= ORDERS.length && <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Next</Btn>}
          </>}

          {step === 4 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Bake the big party pizza</h2>
            {bake === 'raw' && <>
              <p className="font-body text-ink mt-1">This one has every topping. Put it in the oven.</p>
              <Btn tone="berry" className="mt-3 text-lg" onClick={startBake}>Put it in the oven 🔥</Btn>
            </>}
            {bake === 'baking' && <p className="font-display text-xl text-ink mt-2">Baking… the cheese is getting bubbly! ⏳</p>}
            {bake === 'golden' && <>
              <p className="font-display text-xl text-ink mt-2">It’s golden and ready! How do you take it out of the hot oven?</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Btn tone="white" onClick={() => { setBake('out'); good('Yes! Oven mitts protect your hands from the heat.'); }}>🧤 Oven mitts</Btn>
                <Btn tone="white" onClick={() => oops('Ouch! The oven is very hot. Chefs always use oven mitts.')}>✋ Bare hands</Btn>
              </div>
            </>}
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {bake === 'out' && <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Next</Btn>}
          </>}

          {step === 5 && <>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Share it fairly</h2>
            {share === 'count' && <>
              <p className="font-body text-ink text-lg mt-1">The pizza is cut into <b>8 slices</b>. <b>4 friends</b> share it equally. How many slices does each friend get?</p>
              <div className="flex gap-2 mt-3">{[1, 2, 3, 4].map((n) => <Btn key={n} tone="white" className="text-2xl w-16" onClick={() => (n === 2 ? (good('Yes! 8 slices shared by 4 friends is 2 slices each.'), setShare('fraction')) : oops('Try sharing them out one at a time: one for each friend, then again…'))}>{n}</Btn>)}</div>
            </>}
            {share === 'fraction' && <>
              <p className="font-body text-ink text-lg mt-1">Each friend gets 2 of the 8 slices. What part of the whole pizza is that?</p>
              <div className="flex flex-wrap gap-2 mt-3">{['1/2', '1/4', '1/8'].map((f) => <Btn key={f} tone="white" className="text-2xl" onClick={() => (f === '1/4' ? (good('Right! 2 out of 8 is the same as one quarter (1/4) of the pizza.'), setShare('done')) : oops('Think: if 4 friends share the whole pizza fairly, each gets one of 4 equal parts.'))}>{f}</Btn>)}</div>
            </>}
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {share === 'done' && <Btn tone="mint" className="mt-4 text-lg" onClick={next}>Finish</Btn>}
          </>}

          {step === 6 && <>
            <h2 className="font-display text-3xl font-extrabold text-ink">Pizza party served!</h2>
            <Stars n={stars} />
            <p className="font-body text-ink text-lg mt-2">You cooked safely, followed a recipe in order, listened to every customer and shared fairly. That’s what great chefs do!</p>
            <Btn tone="berry" className="mt-4 text-lg" onClick={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'chef-pizza' }); onExit(); }}>Collect rewards</Btn>
          </>}
        </Panel>
      </div>
    </MissionShell>
  );
}

/** A pizza drawn from above: crust, sauce, cheese and the chosen toppings. */
function Pizza({ tops, baked, sliced }: { tops: Topping[]; baked: boolean; sliced: boolean }) {
  const ink = '#2B2350';
  const spots: Record<Topping, [number, number][]> = {
    pepperoni: [[-30, -34], [34, -10], [-8, 38], [44, 36], [-46, 12]],
    mushroom: [[8, -46], [-40, -6], [26, 18], [-20, 52], [50, -34]],
    pepper: [[-14, -14], [40, 52], [-52, 34], [18, -26], [-28, 66]],
    olive: [[0, 4], [-44, -40], [56, 6], [14, 58], [-4, -62]],
  };
  const draw = (t: Topping, x: number, y: number, k: number) => {
    if (t === 'pepperoni') return <circle key={k} cx={x} cy={y} r={11} fill="#C9473A" stroke="#8E2A2E" strokeWidth={2} />;
    if (t === 'mushroom') return <path key={k} d={`M${x - 10} ${y} a10 9 0 0 1 20 0 Z M${x - 4} ${y} h8 v8 h-8 Z`} fill="#E8D8C0" stroke="#8A6A4A" strokeWidth={2} />;
    if (t === 'pepper') return <path key={k} d={`M${x - 10} ${y} a10 7 0 1 0 20 0 a10 7 0 1 0 -20 0`} fill="none" stroke="#3F9A4A" strokeWidth={4} />;
    return <circle key={k} cx={x} cy={y} r={6} fill="none" stroke="#2A2A30" strokeWidth={4} />;
  };
  return (
    <svg viewBox="-110 -110 220 220" className="w-full" role="img" aria-label={`Pizza with ${tops.length ? tops.join(', ') : 'just cheese'}`}>
      <circle r={104} fill={baked ? '#D99A4E' : '#F2D3A0'} stroke={ink} strokeWidth={4} />
      <circle r={88} fill="#D9473A" />
      <circle r={84} fill={baked ? '#FFD45C' : '#FFF0B3'} />
      {[[-40, -50], [30, -60], [55, 20], [-60, 30], [10, 50], [-10, -10]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={16} ry={10} fill={baked ? '#F5B83A' : '#FFE68A'} opacity={0.8} />)}
      {tops.flatMap((t) => spots[t].map(([x, y], i) => draw(t, x, y, i + t.length * 10)))}
      {sliced && [0, 45, 90, 135].map((a) => <line key={a} x1={-104 * Math.cos((a * Math.PI) / 180)} y1={-104 * Math.sin((a * Math.PI) / 180)} x2={104 * Math.cos((a * Math.PI) / 180)} y2={104 * Math.sin((a * Math.PI) / 180)} stroke={ink} strokeWidth={3} />)}
    </svg>
  );
}
