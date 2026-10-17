import { useEffect, useState } from 'react';
import { STYLE_PACK, STYLE_PACK_FRIENDS } from '../data/stylePack';
import { buy, canBuy, priceOf, restore, useOwned } from '../engine/iap';
import { useGame } from '../engine/store';
import { sfx } from '../engine/sfx';
import { Btn, Modal } from '../ui/kit';
import { PaperArt } from './Paper';

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** Grown-ups check before anything that costs real money (required for apps made for kids). */
function GrownUpGate({ onPass, onClose }: { onPass: () => void; onClose: () => void }) {
  const [q] = useState(() => { const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7); return { a, b }; });
  const [typed, setTyped] = useState('');
  const [wrong, setWrong] = useState(false);
  const press = (d: string) => {
    const t = (typed + d).slice(0, 3); setTyped(t); setWrong(false);
    if (t.length >= String(q.a * q.b).length) {
      if (Number(t) === q.a * q.b) onPass(); else { setWrong(true); setTyped(''); }
    }
  };
  return (
    <Modal title="Grown-ups only" onClose={onClose}>
      <p className="font-body text-ink">Please ask a grown-up to answer:</p>
      <p className="font-display text-2xl font-bold text-ink mt-1">What is {WORDS[q.a]} times {WORDS[q.b]}?</p>
      <div className="font-display text-3xl text-ink text-center h-12 mt-2 rounded-xl border-[3px] border-ink bg-white grid place-items-center">{typed || ' '}</div>
      {wrong && <p className="font-body mt-1" style={{ color: '#E5476F' }}>Not quite. Try again.</p>}
      <div className="gap-2 mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
          <button key={d} onClick={() => press(d)} className="h-12 rounded-xl border-[3px] border-ink bg-sky/30 font-display text-xl font-bold text-ink">{d}</button>
        ))}
      </div>
    </Modal>
  );
}

/** The Style Pack card in the shop: preview, price, buy and restore (both behind the grown-ups check). */
export function StylePackCard() {
  const { dispatch } = useGame();
  const owned = useOwned(STYLE_PACK.productId);
  const [price, setPrice] = useState<string>(STYLE_PACK.fallbackPrice);
  const [gate, setGate] = useState<null | 'buy' | 'restore'>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (canBuy()) priceOf(STYLE_PACK.productId).then((p) => p && setPrice(p)); }, []);
  const go = async (what: 'buy' | 'restore') => {
    setGate(null); setBusy(true);
    const r = what === 'buy' ? await buy(STYLE_PACK.productId) : await restore();
    setBusy(false);
    if (what === 'buy' && r.ok) { sfx('success'); dispatch({ type: 'TOAST', text: 'Style Pack unlocked! Meet your 5 new friends in Characters.' }); }
    else if (what === 'restore') dispatch({ type: 'TOAST', text: r.owned?.includes(STYLE_PACK.productId) ? 'Style Pack restored!' : r.error ?? 'Nothing to restore on this Apple ID.' });
    else if (r.pending) dispatch({ type: 'TOAST', text: 'Waiting for a grown-up to approve it.' });
    else if (r.error) dispatch({ type: 'TOAST', text: r.error });
  };
  return (
    <div className="rounded-[28px] border-[4px] border-ink p-3" style={{ marginBottom: 16, background: 'linear-gradient(135deg,#FFE3F0,#E6F0FF)' }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="font-display text-xl font-bold text-ink">✨ {STYLE_PACK.name}</div>
          <div className="font-body text-ink/80 text-sm">5 new friends plus new tops, bottoms and shoes for every kid.</div>
        </div>
        {owned ? <div className="font-display font-bold text-ink">✓ Yours</div>
          : canBuy() ? <Btn tone="berry" disabled={busy} onClick={() => { sfx('tap'); setGate('buy'); }}>{busy ? '…' : `Get it · ${price}`}</Btn>
          : <div className="font-body text-sm text-ink/80" style={{ maxWidth: 220 }}>Available in the CareerTown app for iPhone and iPad.</div>}
      </div>
      <div className="flex gap-1 mt-2 overflow-x-auto">
        {STYLE_PACK_FRIENDS.map((f) => (
          <div key={f.id} className="shrink-0 text-center" style={{ width: 78 }}>
            <div style={{ width: 78, height: 120 }}><PaperArt p={f.paper!} /></div>
            <div className="font-display text-xs font-bold text-ink">{f.name}</div>
          </div>
        ))}
      </div>
      {canBuy() && !owned && <button className="mt-1 font-body text-xs text-ink/70 underline" onClick={() => setGate('restore')}>Restore purchase</button>}
      {gate && <GrownUpGate onClose={() => setGate(null)} onPass={() => go(gate)} />}
    </div>
  );
}
