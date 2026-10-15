import { useState, type ReactNode } from 'react';
import type { DollLook } from '../engine/types';
import { DOLL_GARMENTS, DOLL_HAIR, type GarmentKind } from '../data/doll';
import { SKIN_LABELS, SKIN_SWATCH, HAIR_TINTS, EYE_TINTS, BASIC_TINTS } from '../data/dollLooks';
import { DollFace } from './Person';
import { sfx } from '../engine/sfx';

type Tab = 'look' | 'hair' | 'top' | 'bottom' | 'shoes';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'look', label: 'Face', icon: '🙂' }, { id: 'hair', label: 'Hair', icon: '💇' },
  { id: 'top', label: 'Tops', icon: '👕' }, { id: 'bottom', label: 'Bottoms', icon: '👖' }, { id: 'shoes', label: 'Shoes', icon: '👟' },
];

function Swatches({ items, value, onPick, label }: { items: [string, string, string][]; value: string | undefined; onPick: (id: string) => void; label: string }) {
  return (
    <div className="mt-3">
      <div className="font-display font-bold text-ink mb-1">{label}</div>
      <div className="flex flex-wrap gap-2">
        {items.map(([id, swatch, name]) => (
          <button key={id} aria-label={`${label}: ${name}`} title={name} onClick={() => { sfx('pop'); onPick(id); }}
            className={`w-11 h-11 rounded-full border-[3px] border-ink ${value === id ? 'ring-4 ring-berry scale-110' : ''}`} style={{ background: swatch }} />
        ))}
      </div>
    </div>
  );
}

/** Character maker for dress-up characters: skin, face, eyes, hair, outfit and shoes. */
export function DollEditor({ d, onChange }: { d: DollLook; onChange: (d: DollLook) => void }) {
  const [tab, setTab] = useState<Tab>('look');
  const set = (patch: Partial<DollLook>) => onChange({ ...d, ...patch });
  const tile = (key: string, selected: boolean, label: string, onClick: () => void, child: ReactNode) => (
    <button key={key} aria-label={label} aria-pressed={selected} onClick={() => { sfx('pop'); onClick(); }}
      className={`relative rounded-2xl border-[3px] border-ink overflow-hidden h-20 sm:h-24 ${selected ? 'bg-sun ring-4 ring-berry' : 'bg-sky/25'}`}>
      <div className="absolute inset-x-1 top-1 bottom-4 grid place-items-center">{child}</div>
      <span className="absolute bottom-0 inset-x-0 bg-white/90 text-[11px] font-body text-ink truncate px-1">{label}</span>
    </button>
  );
  const garments = (kind: GarmentKind, none: string, field: 'top' | 'bottom' | 'shoes') => (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
      {tile('none', !d[field], none, () => set({ [field]: null } as Partial<DollLook>), <span style={{ fontSize: 30 }}>{field === 'shoes' ? '🦶' : field === 'top' ? '👕' : '🩳'}</span>)}
      {Object.entries(DOLL_GARMENTS).filter(([, g]) => g.kind === kind).map(([id, g]) =>
        tile(id, d[field] === id, g.label, () => set({ [field]: id } as Partial<DollLook>),
          <img src={g.srcs[d.tone]} alt="" draggable={false} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />))}
    </div>
  );
  const basic = Object.entries(BASIC_TINTS).map(([id, hex]) => [id, hex ?? '#FFFFFF', id] as [string, string, string]);
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
        <Swatches label="Skin tone" items={SKIN_SWATCH.map((c, i) => [String(i), c, SKIN_LABELS[i]] as [string, string, string])} value={String(d.tone)} onPick={(v) => set({ tone: Number(v) })} />
        <div className="mt-3 font-display font-bold text-ink mb-1">Face</div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {(['girl', 'boy'] as const).map((f) => tile(f, d.face === f, f === 'girl' ? 'Long lashes' : 'Short lashes', () => set({ face: f }), <DollFace d={{ ...d, face: f, hair: null }} size={64} />))}
        </div>
        <Swatches label="Eye color" items={Object.entries(EYE_TINTS).map(([id, e]) => [id, e.swatch, e.label] as [string, string, string])} value={d.eyes} onPick={(v) => set({ eyes: v })} />
      </>}
      {tab === 'hair' && <>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
          {tile('bald', !d.hair, 'No hair', () => set({ hair: null }), <DollFace d={{ ...d, hair: null }} size={64} />)}
          {Object.entries(DOLL_HAIR).map(([id, h]) => tile(id, d.hair === id, h.label, () => set({ hair: id }), <DollFace d={{ ...d, hair: id }} size={64} />))}
        </div>
        <Swatches label="Hair color" items={Object.entries(HAIR_TINTS).map(([id, h]) => [id, h.swatch, h.label] as [string, string, string])} value={d.hairColor} onPick={(v) => set({ hairColor: v })} />
      </>}
      {tab === 'top' && <>
        {garments('top', 'Plain tee', 'top')}
        <Swatches label="Plain tee color" items={basic} value={d.teeColor ?? 'white'} onPick={(v) => set({ teeColor: v === 'white' ? undefined : v })} />
      </>}
      {tab === 'bottom' && <>
        {garments('bottom', 'Plain shorts', 'bottom')}
        <Swatches label="Plain shorts color" items={basic} value={d.shortsColor ?? 'white'} onPick={(v) => set({ shortsColor: v === 'white' ? undefined : v })} />
      </>}
      {tab === 'shoes' && garments('shoes', 'Bare feet', 'shoes')}
    </div>
  );
}
