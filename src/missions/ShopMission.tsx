import { useMemo, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { sfx } from '../engine/sfx';

const STEPS = ['Prices', 'Customers'];

/* 1. Set prices: more than it cost you (so you earn), but not so much that nobody buys. */
const STOCK = [
  { id: 'hat', icon: '👒', name: 'Sun hat', cost: 4, max: 9 },
  { id: 'socks', icon: '🧦', name: 'Fun socks', cost: 2, max: 5 },
  { id: 'bag', icon: '👜', name: 'Cute bag', cost: 6, max: 12 },
];
function PriceStep({ onDone }: { onDone: (prices: Record<string, number>) => void }) {
  const [prices, setPrices] = useState<Record<string, number>>({ hat: 2, socks: 8, bag: 6 });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const bump = (id: string, d: number) => { sfx('click'); setPrices({ ...prices, [id]: Math.max(1, Math.min(20, prices[id] + d)) }); setMsg(null); };
  const check = () => {
    const low = STOCK.find((s) => prices[s.id] <= s.cost);
    const high = STOCK.find((s) => prices[s.id] > s.max);
    if (low) { sfx('fail'); setMsg({ ok: false, text: `The ${low.name.toLowerCase()} cost you ${low.cost} coins to buy. If you sell it for ${prices[low.id]}, you lose money! Make the price higher than ${low.cost}.` }); return; }
    if (high) { sfx('fail'); setMsg({ ok: false, text: `Customers think ${prices[high.id]} is too much for ${high.name.toLowerCase()}. Shoppers compare prices, so try ${high.max} or less.` }); return; }
    sfx('success'); setMsg({ ok: true, text: 'Great prices! Each one is more than it cost you, so you make a profit, and not so high that customers walk away.' });
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Set your prices</h2>
      <p className="font-body text-ink text-lg mt-1">Nia buys things for her shop, then sells them for a bit more. The extra is called <b>profit</b>. Someone set silly prices! Fix each one so it’s more than it cost, but still fair for shoppers.</p>
      <div className="grid gap-2 mt-3">
        {STOCK.map((s) => (
          <div key={s.id} className="shop-row rounded-2xl border-[3px] border-ink bg-white flex items-center gap-2">
            <span style={{ fontSize: 40 }}>{s.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-ink">{s.name}</div>
              <div className="font-body text-ink/70" style={{ fontSize: 14 }}>Cost you {s.cost} · profit {prices[s.id] - s.cost}</div>
            </div>
            <button aria-label={`Lower ${s.name} price`} onClick={() => bump(s.id, -1)} className="shop-btn">−</button>
            <div className="font-display font-bold text-ink text-2xl text-center" style={{ width: 48 }}>{prices[s.id]}</div>
            <button aria-label={`Raise ${s.name} price`} onClick={() => bump(s.id, 1)} className="shop-btn">+</button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {!msg?.ok && <Btn tone="sun" onClick={check}>✔ Open the shop</Btn>}
        {msg?.ok && <Btn tone="mint" onClick={() => onDone(prices)}>Next: customers →</Btn>}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
    </Panel>
  );
}

/* 2. Customers: give them what they asked for, then the right change. */
function CustomerStep({ prices, onDone }: { prices: Record<string, number>; onDone: (earned: number) => void }) {
  const queue = useMemo(() => {
    const who = ['🧒', '👩', '👴', '👧'];
    return who.map((w, i) => { const s = STOCK[i % STOCK.length]; const p = prices[s.id]; const pay = p <= 5 ? (p === 5 ? 10 : 5) : p <= 10 ? 10 : 20; return { who: w, item: s, price: p, pay }; });
  }, [prices]);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'item' | 'change' | 'done'>('item');
  const [change, setChange] = useState(0);
  const [earned, setEarned] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const c = queue[i]; const owed = c.pay - c.price;
  const giveItem = (id: string) => {
    if (id !== c.item.id) { sfx('fail'); setMsg({ ok: false, text: `Oops, they asked for the ${c.item.name.toLowerCase()}.` }); return; }
    sfx('pop'); setPhase(owed ? 'change' : 'done'); setMsg(owed ? null : { ok: true, text: 'They paid the exact amount, no change needed!' }); if (!owed) setEarned(earned + c.price);
  };
  const giveChange = () => {
    if (change === owed) { sfx('coin'); setPhase('done'); setEarned(earned + c.price); setMsg({ ok: true, text: `Right! ${c.pay} take away ${c.price} is ${owed}. Happy customer! 😊` }); }
    else { sfx('fail'); setMsg({ ok: false, text: change > owed ? `That’s too much change. Count up from ${c.price} to ${c.pay}.` : `Not quite enough. Count up from ${c.price} to ${c.pay}.` }); }
  };
  const next = () => { setMsg(null); setChange(0); setPhase('item'); if (i + 1 < queue.length) setI(i + 1); else onDone(earned); };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Customer {i + 1} of {queue.length}</h2>
      <p className="font-body text-ink text-lg mt-1"><span style={{ fontSize: 32 }}>{c.who}</span> “Hi! May I have the <b>{c.item.name.toLowerCase()}</b>, please?” It costs {c.price}. They pay with <b>{c.pay} coins</b>.</p>
      {phase === 'item' && (
        <div className="flex flex-wrap gap-2 mt-3">
          {STOCK.map((s) => <button key={s.id} onClick={() => giveItem(s.id)} className="shop-item rounded-2xl border-[3px] border-ink bg-white"><span style={{ fontSize: 40 }}>{s.icon}</span><span className="font-display font-bold text-ink">{s.name}</span></button>)}
        </div>
      )}
      {phase === 'change' && (
        <div className="mt-3">
          <p className="font-body text-ink text-lg">How much change do they get back? Tap coins to count it out.</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <button aria-label="Add 1 coin" onClick={() => { sfx('coin'); setChange(change + 1); setMsg(null); }} className="bank-coin c1">1</button>
            <button aria-label="Add 5 coins" onClick={() => { sfx('coin'); setChange(change + 5); setMsg(null); }} className="bank-coin c5">5</button>
            <div className="font-display font-bold text-ink text-2xl" style={{ minWidth: 120 }}>Change: {change}</div>
            <Btn tone="white" onClick={() => { setChange(0); setMsg(null); }}>Clear</Btn>
            <Btn tone="sun" onClick={giveChange}>Give change</Btn>
          </div>
        </div>
      )}
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {phase === 'done' && <div className="mt-3"><Btn tone="mint" onClick={next}>{i + 1 < queue.length ? 'Next customer →' : `Close the shop (${earned} coins sold) →`}</Btn></div>}
    </Panel>
  );
}

export function ShopMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [prices, setPrices] = useState<Record<string, number> | null>(null);
  return (
    <MissionShell id="shop-owner" step={step} steps={STEPS} onExit={onExit} color="#FFB3D9">
      {step === 0 && <PriceStep onDone={(p) => { setPrices(p); setStep(1); }} />}
      {step === 1 && prices && <CustomerStep prices={prices} onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'shop-owner' }); onExit(); }} />}
    </MissionShell>
  );
}
