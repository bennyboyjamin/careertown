import { useState, type ReactNode } from 'react';
import type { PaperLook } from '../engine/types';
import { PAPER_HAIR, PAPER_CLOTHES, PAPER_ACCESSORIES, PAPER_HAIR_COLOURS, PAPER_SKIN_TONES } from '../data/paperArt';
import { CAREER_OUTFITS } from '../data/dollLooks';
import { paperClothesFor, PaperFaceIcon } from './Paper';
import { useGame } from '../engine/store';
import { useOwned } from '../engine/iap';
import { STYLE_PACK, STYLE_PACK_CLOTHES } from '../data/stylePack';
import { sfx } from '../engine/sfx';

type Tab = 'look' | 'hair' | 'top' | 'bottom' | 'shoes' | 'extras';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'look', label: 'Body', icon: '🙂' }, { id: 'hair', label: 'Hair', icon: '💇' }, { id: 'top', label: 'Tops', icon: '👕' },
  { id: 'bottom', label: 'Bottoms', icon: '👖' }, { id: 'shoes', label: 'Shoes', icon: '👟' }, { id: 'extras', label: 'Extras', icon: '🎀' },
];
const HAIR_LABELS: Record<string, string> = {
  wavy: 'Long wavy', bob: 'Bob with clip', bobbangs: 'Bob with bangs', bowwaves: 'Waves with bow', braids: 'Two braids', locs: 'Locs',
  long: 'Long straight', longwaves: 'Long waves', messy: 'Messy', sideswept: 'Side-swept', spacebuns: 'Space buns', ponytail: 'High ponytail', momwaves: 'Long layers', dadshort: 'Short and swept', boyshort: 'Short and messy', sleekbob: 'Sleek bob', lowbun: 'Low side bun', scrunchieponytail: 'Ponytail with scrunchie',
};
const COLOUR_LABELS: Record<string, string> = { black: 'Black', darkbrown: 'Dark brown', brown: 'Brown', blonde: 'Blonde', ginger: 'Ginger', pink: 'Pink' };
const SKIN_LABELS = ['Light', 'Medium', 'Tan', 'Deep brown'];
const SLOT_LABELS: Record<string, string> = { head: 'Hats', eyes: 'Glasses', ears: 'Headphones', hair: 'Hair bows', bag: 'Bags' };
const nice = (id: string) => id.replace(/^mom-/, '').replace(/-/g, ' ').replace(/^\w/, (m) => m.toUpperCase());

/** Character maker for YunaVerse characters: body, skin, hair, clothes and extras. */
export function PaperEditor({ p, onChange, lockBase = false }: { p: PaperLook; onChange: (p: PaperLook) => void; lockBase?: boolean }) {
  const [tab, setTab] = useState<Tab>('look');
  const { game, dispatch } = useGame();
  const set = (patch: Partial<PaperLook>) => onChange({ ...p, ...patch });
  const hasPack = useOwned(STYLE_PACK.productId);
  const inPack = (id: string) => STYLE_PACK_CLOTHES.has(id) && !hasPack;
  const locked = (id: string) => inPack(id) || (!!CAREER_OUTFITS[id] && !game.owned.includes(CAREER_OUTFITS[id].unlock));
  const tile = (key: string, selected: boolean, label: string, onClick: () => void, child: ReactNode) => (
    <button key={key} aria-label={label} aria-pressed={selected} onClick={() => { sfx('pop'); onClick(); }}
      className={`relative rounded-2xl border-[3px] border-ink overflow-hidden h-20 sm:h-24 ${selected ? 'bg-sun ring-4 ring-berry' : 'bg-sky/25'}`}>
      <div className="absolute inset-x-1 top-1 bottom-4 grid place-items-center">{child}</div>
      <span className="absolute bottom-0 inset-x-0 bg-white/90 text-[11px] font-body text-ink truncate px-1">{label}</span>
    </button>
  );
  const pic = (src: string) => <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  const grid = (children: ReactNode) => <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">{children}</div>;
  const swatches = (label: string, items: [string, string, string][], value: string, onPick: (v: string) => void) => (
    <div className="mt-3">
      <div className="font-display font-bold text-ink mb-1">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map(([id, sw, name]) => (
          <button key={id} aria-label={`${label}: ${name}`} title={name} onClick={() => { sfx('pop'); onPick(id); }}
            className={`w-11 h-11 rounded-full border-[3px] border-ink ${value === id ? 'ring-4 ring-berry scale-110' : ''}`} style={{ background: sw }} />
        ))}
      </div>
    </div>
  );
  const clothes = (kind: 'top' | 'bottom' | 'shoes', none: string, noneIcon: string) => grid(<>
    {tile('none', !p[kind], none, () => set({ [kind]: null } as Partial<PaperLook>), <span style={{ fontSize: 30 }}>{noneIcon}</span>)}
    {paperClothesFor(p.base, kind).map((id) => locked(id)
      ? tile(id, false, `${nice(id)} (locked)`, () => dispatch({ type: 'TOAST', text: inPack(id) ? 'Part of the Style Pack. Ask a grown-up to look in the Shop 🛍️' : `Finish “${CAREER_OUTFITS[id].mission}” to unlock this outfit!` }),
          <div className="relative w-full h-full grid place-items-center"><div className="w-full h-full opacity-25 grayscale">{pic(PAPER_CLOTHES[id].src)}</div><span className="absolute text-2xl">🔒</span></div>)
      : tile(id, p[kind] === id, nice(id), () => set({ [kind]: id } as Partial<PaperLook>), pic(PAPER_CLOTHES[id].src)))}
  </>);
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((x) => (
          <button key={x.id} onClick={() => { sfx('tap'); setTab(x.id); }}
            className={`shrink-0 rounded-2xl border-[3px] border-ink px-3 h-12 font-display font-bold text-ink shadow-chunkysm ${x.id === tab ? 'bg-sun' : 'bg-white'}`}>
            <span className="mr-1">{x.icon}</span>{x.label}
          </button>
        ))}
      </div>
      {tab === 'look' && <>
        {!lockBase && <>
          <div className="font-display font-bold text-ink mt-1">Age</div>
          {grid((['kid', 'preschool'] as const).map((b) => tile(b, p.base === b, b === 'kid' ? 'Kid' : 'Little kid', () => {
            // keep only clothes the new body can wear
            const ok = (id: string | null) => (id && paperClothesFor(b, PAPER_CLOTHES[id]?.kind ?? 'top').includes(id) ? id : null);
            set({ base: b, top: ok(p.top), bottom: ok(p.bottom), shoes: ok(p.shoes) });
          }, <PaperFaceIcon p={{ ...p, base: b }} size={62} />)))}
        </>}
        {swatches('Skin tone', PAPER_SKIN_TONES.map((c, i) => [String(i), c, SKIN_LABELS[i] ?? String(i)] as [string, string, string]), String(p.tone), (v) => set({ tone: Number(v) }))}
      </>}
      {tab === 'hair' && <>
        {grid(<>
          {tile('none', !p.hair, 'No hair', () => set({ hair: null }), <PaperFaceIcon p={{ ...p, hair: null, acc: {} }} size={62} />)}
          {Object.keys(PAPER_HAIR).map((id) => tile(id, p.hair === id, HAIR_LABELS[id] ?? nice(id), () => set({ hair: id }), <PaperFaceIcon p={{ ...p, hair: id, acc: {} }} size={62} />))}
        </>)}
        {swatches('Hair color', Object.entries(PAPER_HAIR_COLOURS).map(([id, hx]) => [id, hx, COLOUR_LABELS[id] ?? id] as [string, string, string]), p.hairColor, (v) => set({ hairColor: v }))}
      </>}
      {tab === 'top' && clothes('top', 'Plain tee', '👕')}
      {tab === 'bottom' && clothes('bottom', 'Plain shorts', '🩳')}
      {tab === 'shoes' && clothes('shoes', 'Bare feet', '🦶')}
      {tab === 'extras' && (['head', 'eyes', 'ears', 'hair', 'bag'] as const).map((slot) => {
        const list = Object.entries(PAPER_ACCESSORIES).filter(([, a]) => a.slot === slot);
        if (!list.length) return null;
        return (
          <div key={slot} className="mt-2">
            <div className="font-display font-bold text-ink text-sm">{SLOT_LABELS[slot]}</div>
            {grid(<>
              {tile(`${slot}-none`, !p.acc?.[slot], 'None', () => set({ acc: { ...p.acc, [slot]: undefined } }), <span style={{ fontSize: 26 }}>✖️</span>)}
              {list.map(([id, a]) => tile(id, p.acc?.[slot] === id, nice(id), () => set({ acc: { ...p.acc, [slot]: id } }), pic(a.src)))}
            </>)}
          </div>
        );
      })}
    </div>
  );
}
