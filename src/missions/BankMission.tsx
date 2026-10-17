import { useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { sfx } from '../engine/sfx';

const STEPS = ['Count', 'Save'];
const COINS = [1, 5, 10] as const;
const COIN_STYLE: Record<number, string> = { 1: 'bank-coin c1', 5: 'bank-coin c5', 10: 'bank-coin c10' };

/* 1. Count it out: a customer wants exactly this many coins. */
const ORDERS = [
  { who: '👵 Grandma Rose', want: 7 },
  { who: '🧒 Leo', want: 16 },
  { who: '👨 Mr. Kim', want: 25 },
  { who: '👧 Mia', want: 33 },
];
function CountStep({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [tray, setTray] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const o = ORDERS[i]; const sum = tray.reduce((a, b) => a + b, 0);
  const add = (c: number) => { if (msg?.ok) return; sfx('coin'); setTray([...tray, c]); setMsg(null); };
  const check = () => {
    if (sum === o.want) { sfx('success'); setMsg({ ok: true, text: `Perfect! ${tray.length} coins make exactly ${o.want}. ${tray.length <= Math.ceil(o.want / 10) + 1 ? 'And you used big coins to keep it quick!' : ''}` }); }
    else { sfx('fail'); setMsg({ ok: false, text: sum > o.want ? `That’s ${sum}, which is ${sum - o.want} too many. Tap a coin in the tray to take it back.` : `That’s ${sum}. You need ${o.want - sum} more.` }); }
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Count it out ({i + 1} of {ORDERS.length})</h2>
      <p className="font-body text-ink text-lg mt-1">Bank tellers count money carefully. {o.who} would like <b>{o.want} coins</b>. Tap coins to put them in the tray, then press Check.</p>
      <div className="flex flex-wrap gap-3 mt-3">
        {COINS.map((c) => <button key={c} aria-label={`${c} coin`} onClick={() => add(c)} className={COIN_STYLE[c]}>{c}</button>)}
      </div>
      <div className="bank-tray mt-3 rounded-2xl border-[3px] border-ink">
        <div className="font-display font-bold text-ink mb-1">Tray: {sum} {sum === 1 ? 'coin' : 'coins'}</div>
        <div className="flex flex-wrap gap-1">
          {tray.map((c, k) => <button key={k} aria-label={`Take back ${c}`} onClick={() => { if (msg?.ok) return; sfx('tap'); setTray(tray.filter((_, j) => j !== k)); setMsg(null); }} className={`${COIN_STYLE[c]} small`}>{c}</button>)}
          {!tray.length && <span className="font-body text-ink/70">Empty</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {!msg?.ok && <Btn tone="sun" onClick={check}>✔ Check</Btn>}
        {msg?.ok && <Btn tone="mint" onClick={() => { setTray([]); setMsg(null); if (i + 1 < ORDERS.length) setI(i + 1); else onDone(); }}>{i + 1 < ORDERS.length ? 'Next customer →' : 'Next: save up →'}</Btn>}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
    </Panel>
  );
}

/* 2. Save up: 10 coins of pocket money a week; can you afford the scooter by week 5? */
const GOAL = { name: 'scooter', icon: '🛴', price: 40 };
const WEEKS = 5, POCKET = 10;
const TREATS = [{ icon: '🍭', name: 'a lollipop', price: 3 }, { icon: '🧸', name: 'a little toy', price: 6 }, { icon: '🍦', name: 'ice cream', price: 4 }, { icon: '🎈', name: 'a balloon', price: 2 }, { icon: '🍪', name: 'cookies', price: 3 }];
function SaveStep({ onDone }: { onDone: () => void }) {
  const [week, setWeek] = useState(1);
  const [saved, setSaved] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [end, setEnd] = useState<null | boolean>(null);
  const treat = TREATS[(week - 1) % TREATS.length];
  const choose = (spend: boolean) => {
    const got = saved + POCKET - (spend ? treat.price : 0);
    sfx(spend ? 'munch' : 'coin');
    setLog([...log, `Week ${week}: ${spend ? `bought ${treat.name} (${treat.price}), saved ${POCKET - treat.price}` : `saved all ${POCKET}`}`]);
    setSaved(got);
    if (week === WEEKS) { const ok = got >= GOAL.price; setEnd(ok); sfx(ok ? 'success' : 'fail'); }
    else setWeek(week + 1);
  };
  const restart = () => { setWeek(1); setSaved(0); setLog([]); setEnd(null); };
  const pct = Math.min(1, saved / GOAL.price);
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Save up for a {GOAL.name} {GOAL.icon}</h2>
      <p className="font-body text-ink text-lg mt-1">The {GOAL.name} costs <b>{GOAL.price} coins</b>. You get {POCKET} coins of pocket money each week for {WEEKS} weeks. Saving means keeping money for something you want later. Can you buy it by week {WEEKS}?</p>
      <div className="bank-goal mt-3 rounded-2xl border-[3px] border-ink">
        <div className="flex items-center gap-2 font-display font-bold text-ink"><span style={{ fontSize: 36 }}>🐷</span> Piggy bank: {saved} / {GOAL.price}</div>
        <div className="bank-bar mt-2 rounded-full border-[3px] border-ink overflow-hidden"><div style={{ width: `${pct * 100}%` }} /></div>
      </div>
      {end === null && (
        <div className="mt-3">
          <p className="font-body text-ink text-lg"><b>Week {week}:</b> you get {POCKET} coins. You walk past a shop selling {treat.icon} {treat.name} for {treat.price}.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Btn tone="mint" onClick={() => choose(false)}>🐷 Save all {POCKET}</Btn>
            <Btn tone="white" onClick={() => choose(true)}>{treat.icon} Buy it ({treat.price})</Btn>
          </div>
        </div>
      )}
      {log.length > 0 && <ul className="mt-3 font-body text-ink/80">{log.map((l) => <li key={l}>• {l}</li>)}</ul>}
      {end === true && <Feedback ok>You saved {saved} coins and bought the {GOAL.name}! {saved > GOAL.price ? `You even have ${saved - GOAL.price} left over.` : ''} Saving a little each week adds up.</Feedback>}
      {end === false && <Feedback ok={false}>You saved {saved}, which is {GOAL.price - saved} short. Treats are fun, but you can only buy a few if you want the {GOAL.name}. Try again?</Feedback>}
      <div className="flex flex-wrap gap-2 mt-3">
        {end === false && <Btn tone="sun" onClick={restart}>🔁 Try again</Btn>}
        {end === true && <Btn tone="mint" onClick={onDone}>Finish →</Btn>}
      </div>
    </Panel>
  );
}

export function BankMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  return (
    <MissionShell id="bank-saver" step={step} steps={STEPS} onExit={onExit} color="#FFE08A">
      {step === 0 && <CountStep onDone={() => setStep(1)} />}
      {step === 1 && <SaveStep onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'bank-saver' }); onExit(); }} />}
    </MissionShell>
  );
}
