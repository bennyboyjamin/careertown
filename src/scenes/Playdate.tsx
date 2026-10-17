import { useEffect, useRef, useState } from 'react';
import type { CharacterData, PaperLook } from '../engine/types';
import { useGame } from '../engine/store';
import { nearby, onNearby, canNearby } from '../engine/nearby';
import { SCENES } from '../data/scenes';
import { npcAspect } from '../data/dollLooks';
import { Person } from '../components/Person';
import { GrownUpGate } from '../components/StylePack';
import { Btn, Face } from '../ui/kit';
import { sfx } from '../engine/sfx';

type Msg =
  | { t: 'hi'; name: string; paper?: PaperLook; sprite?: string }
  | { t: 'pos'; x: number; y: number }
  | { t: 'emote'; e: string }
  | { t: 'toy'; i: number; x: number; y: number };

const EMOTES = ['👋', '❤️', '⭐', '😂', '🎉', '👍'];
const TOYS = ['⚽', '🧸', '🎈', '🪀', '🏀', '🎁'];
const START_TOYS = TOYS.map((_, i) => ({ x: 14 + i * 14, y: 86 }));
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));

/** Turn a friend's "hi" into a character we can draw (only the look and a short name are used). */
function friendChar(m: Extract<Msg, { t: 'hi' }>): CharacterData {
  const p = m.paper;
  const ok = p && ['kid', 'preschool', 'adult'].includes(p.base);
  const paper: PaperLook = ok ? { base: p!.base, tone: p!.tone | 0, hair: p!.hair ?? null, hairColor: String(p!.hairColor ?? 'brown'), top: p!.top ?? null, bottom: p!.bottom ?? null, shoes: p!.shoes ?? null, acc: p!.acc ?? {} }
    : { base: 'kid', tone: 1, hair: 'wavy', hairColor: 'brown', top: 'pink-hoodie', bottom: 'baggy-jeans', shoes: 'gray-sneakers', acc: {} };
  return { id: 'friend', name: String(m.name ?? 'Friend').slice(0, 20), age: paper.base === 'adult' ? 'adult' : 'child', look: {} as CharacterData['look'], sprite: `paper-${paper.base}`, paper } as CharacterData;
}

/** Playdate: find a friend on another iPad nearby and play in a shared room. */
export function Playdate({ onBack }: { onBack: () => void }) {
  const { game, dispatch } = useGame();
  const me = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];
  const allowed = !!game.settings.playdates;
  const [gate, setGate] = useState(!allowed);
  const [found, setFound] = useState<{ id: string; name: string }[]>([]);
  const [invite, setInvite] = useState<{ id: string; name: string } | null>(null);
  const [waiting, setWaiting] = useState<string | null>(null);
  const [peer, setPeer] = useState<{ id: string; name: string } | null>(null);
  const [friend, setFriend] = useState<CharacterData | null>(null);
  const [myPos, setMyPos] = useState({ x: 30, y: 80 });
  const [hisPos, setHisPos] = useState({ x: 68, y: 80 });
  const [toys, setToys] = useState(START_TOYS);
  const [emote, setEmote] = useState<Record<'me' | 'friend', { e: string; k: number } | null>>({ me: null, friend: null });
  const room = useRef<HTMLDivElement>(null);
  const drag = useRef<{ kind: 'me' | number; dx: number; dy: number } | null>(null);
  const lastSend = useRef(0);

  // start looking for friends once a grown-up has allowed playdates
  useEffect(() => {
    if (!allowed || !canNearby() || !me) return;
    nearby.start(me.name);
    const off = onNearby((e) => {
      if (e.type === 'found') setFound((f) => (f.some((x) => x.id === e.id) ? f : [...f, { id: e.id, name: (e.name ?? 'Friend').slice(0, 20) }]));
      else if (e.type === 'lost') setFound((f) => f.filter((x) => x.id !== e.id));
      else if (e.type === 'invite') { sfx('ring'); setInvite({ id: e.id, name: (e.name ?? 'Friend').slice(0, 20) }); }
      else if (e.type === 'state') {
        if (e.state === 'connected') {
          sfx('success'); setPeer({ id: e.id, name: (e.name ?? 'Friend').slice(0, 20) }); setWaiting(null);
          nearby.send({ t: 'hi', name: me.name, paper: me.paper, sprite: me.sprite } satisfies Msg);
          if (!game.owned.includes('did:playdate')) dispatch({ type: 'OWN', id: 'did:playdate' });
        } else if (e.state === 'disconnected') {
          setPeer((p) => { if (p && p.id === e.id) { sfx('fail'); dispatch({ type: 'TOAST', text: 'Your friend left the playdate.' }); return null; } return p; });
          setWaiting((w) => (w === e.id ? null : w)); setFriend((f) => f);
        }
      } else if (e.type === 'data') {
        let m: Msg; try { m = JSON.parse(e.data); } catch { return; }
        if (m.t === 'hi') setFriend(friendChar(m));
        else if (m.t === 'pos') setHisPos({ x: clamp(100 - m.x, 4, 96), y: clamp(m.y, 40, 96) });   // mirrored: friend stands across from you
        else if (m.t === 'emote' && EMOTES.includes(m.e)) { sfx('pop'); setEmote((x) => ({ ...x, friend: { e: m.e, k: Date.now() } })); }
        else if (m.t === 'toy' && m.i >= 0 && m.i < TOYS.length) setToys((t) => t.map((p, i) => (i === m.i ? { x: clamp(100 - m.x, 3, 97), y: clamp(m.y, 30, 97) } : p)));
      }
    });
    return () => { off(); nearby.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, me?.id]);

  useEffect(() => { const ids = (['me', 'friend'] as const).filter((w) => emote[w]).map((w) => window.setTimeout(() => setEmote((x) => ({ ...x, [w]: null })), 2200)); return () => ids.forEach(window.clearTimeout); }, [emote]);

  const pct = (ev: React.PointerEvent) => { const r = room.current!.getBoundingClientRect(); return { x: ((ev.clientX - r.left) / r.width) * 100, y: ((ev.clientY - r.top) / r.height) * 100 }; };
  const down = (kind: 'me' | number) => (ev: React.PointerEvent) => {
    ev.preventDefault(); (ev.target as HTMLElement).setPointerCapture?.(ev.pointerId);
    const p = pct(ev); const at = kind === 'me' ? myPos : toys[kind];
    drag.current = { kind, dx: at.x - p.x, dy: at.y - p.y };
  };
  const move = (ev: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    const p = pct(ev); const x = clamp(p.x + d.dx, 4, 96), y = clamp(p.y + d.dy, d.kind === 'me' ? 40 : 30, 97);
    if (d.kind === 'me') setMyPos({ x, y }); else setToys((t) => t.map((q, i) => (i === d.kind ? { x, y } : q)));
    const now = performance.now();
    if (now - lastSend.current > 70) { lastSend.current = now; nearby.send(d.kind === 'me' ? { t: 'pos', x, y } : { t: 'toy', i: d.kind, x, y }); }
  };
  const up = () => {
    const d = drag.current; drag.current = null; if (!d) return;
    if (d.kind === 'me') nearby.send({ t: 'pos', ...myPos }); else nearby.send({ t: 'toy', i: d.kind, ...toys[d.kind] });
  };
  const sendEmote = (e: string) => { sfx('pop'); setEmote((x) => ({ ...x, me: { e, k: Date.now() } })); nearby.send({ t: 'emote', e }); };
  const leave = () => { nearby.stop(); onBack(); };

  if (!canNearby()) return (
    <div className="h-full grid place-items-center p-4">
      <div className="max-w-md rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-5 text-center">
        <div style={{ fontSize: 54 }}>🤝</div>
        <h2 className="font-display text-2xl font-bold text-ink">Playdates</h2>
        <p className="font-body text-ink mt-2">Play together with a friend on another iPhone or iPad in the same room. Playdates work in the CareerTown app for iPhone and iPad.</p>
        <Btn tone="sky" className="mt-4" onClick={onBack}>Back to town</Btn>
      </div>
    </div>
  );

  if (gate) return <GrownUpGate onClose={onBack} onPass={() => { dispatch({ type: 'SET_PLAYDATES', on: true }); setGate(false); }} />;

  if (!peer) return (
    <div className="h-full overflow-auto p-3 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-5">
        <div className="flex items-center gap-3">
          {me && <Face c={me} size={64} />}
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold text-ink">🤝 Playdate</h2>
            <p className="font-body text-ink/80">Ask a friend to open Playdate on their iPad too. Stay close together!</p>
          </div>
        </div>
        <h3 className="font-display font-bold text-ink mt-4">Friends nearby</h3>
        {found.length === 0 && <p className="font-body text-ink/70 mt-1 playdate-looking">Looking for friends<span>.</span><span>.</span><span>.</span></p>}
        <div className="grid gap-2 mt-2">
          {found.map((f) => (
            <div key={f.id} className="flex items-center gap-2 rounded-2xl border-[3px] border-ink bg-sky/25 p-2">
              <span style={{ fontSize: 28 }}>🙂</span><span className="font-display font-bold text-ink flex-1">{f.name}</span>
              {waiting === f.id ? <span className="font-body text-ink/80">Waiting for {f.name}…</span>
                : <Btn tone="berry" onClick={() => { sfx('tap'); setWaiting(f.id); nearby.invite(f.id); }}>Invite</Btn>}
            </div>
          ))}
        </div>
        <Btn tone="white" className="mt-4" onClick={leave}>Back to town</Btn>
      </div>
      {invite && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-3">
          <div className="max-w-sm w-full rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-5 text-center pop-in">
            <div style={{ fontSize: 48 }}>💌</div>
            <h2 className="font-display text-2xl font-bold text-ink">{invite.name} wants to play!</h2>
            <div className="flex gap-2 justify-center mt-4">
              <Btn tone="mint" onClick={() => { nearby.answer(invite.id, true); setWaiting(invite.id); setInvite(null); }}>Yes, let’s play!</Btn>
              <Btn tone="white" onClick={() => { nearby.answer(invite.id, false); setInvite(null); }}>No thanks</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const bubble = (who: 'me' | 'friend') => { const x = emote[who]; return x && <span key={x.k} className="playdate-emote">{x.e}</span>; };
  const W = 18, aspect = (c: CharacterData) => npcAspect(c);
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 pb-2 flex-wrap">
        <Btn tone="white" onClick={leave}>✕ Leave</Btn>
        <div className="font-display font-extrabold text-ink text-lg flex-1">🤝 Playdate with {friend?.name ?? peer.name}</div>
        <div className="flex gap-1">{EMOTES.map((e) => <button key={e} onClick={() => sendEmote(e)} className="playdate-emote-btn" aria-label={`Send ${e}`}>{e}</button>)}</div>
      </div>
      <div ref={room} className="playdate-room flex-1 relative overflow-hidden" onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ backgroundImage: `url(${SCENES['home-living'].art})` }}>
        {toys.map((t, i) => (
          <button key={i} aria-label={`Toy ${TOYS[i]}`} onPointerDown={down(i)} className="playdate-toy" style={{ left: `${t.x}%`, top: `${t.y}%` }}>{TOYS[i]}</button>
        ))}
        {friend && (
          <div className="playdate-char" style={{ left: `${hisPos.x}%`, top: `${hisPos.y}%`, height: `${W * 2.6}%`, aspectRatio: String(aspect(friend)), zIndex: Math.round(hisPos.y) }}>
            <Person c={friend} mood="happy" />{bubble('friend')}<span className="playdate-name">{friend.name}</span>
          </div>
        )}
        {me && (
          <div onPointerDown={down('me')} className="playdate-char mine" style={{ left: `${myPos.x}%`, top: `${myPos.y}%`, height: `${W * 2.6}%`, aspectRatio: String(aspect(me)), zIndex: Math.round(myPos.y) }}>
            <Person c={me} mood="happy" />{bubble('me')}<span className="playdate-name">{me.name} (you)</span>
          </div>
        )}
        {!friend && <div className="playdate-wait">Waiting for {peer.name}…</div>}
      </div>
    </div>
  );
}
