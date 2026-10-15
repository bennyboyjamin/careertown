import type { CharacterData } from '../engine/types';
import { CLOTHES, TOP_SWATCHES, BOTTOM_SWATCHES, type ClothesPart } from '../data/clothes';
import { LAYERED } from '../data/sprites';
import { LayeredArt } from './Person';
import { sfx } from '../engine/sfx';

type Colors = NonNullable<CharacterData['colors']>;

/** Closet: mirror preview plus colour swatches for the top and the bottom. */
export function ClothesPicker({ c, onChange, preview = true }: { c: CharacterData; onChange: (colors: Colors) => void; preview?: boolean }) {
  const lay = LAYERED[c.sprite!];
  const cl = CLOTHES[c.sprite!];
  if (!lay || !cl) return null;
  const colors = c.colors ?? {};
  const set = (part: ClothesPart, v: string | undefined) => {
    const next = { ...colors, [part]: v };
    if (!v) delete next[part];
    sfx(v ? 'sparkle' : 'tap');
    onChange(next);
  };
  const surprise = () => {
    const pick = (o: Record<string, string>) => { const k = Object.keys(o); return k.length ? k[Math.floor(Math.random() * k.length)] : undefined; };
    sfx('success');
    const next: Colors = { top: pick(cl.top) };
    const b = pick(cl.bottom); if (b) next.bottom = b;
    onChange(next);
  };
  const row = (part: ClothesPart, label: string, sw: Record<string, string>) => {
    const keys = Object.keys(cl[part]);
    if (!keys.length) return null;
    const btn = (key: string | undefined, bg: string, name: string) => {
      const on = colors[part] === key || (!key && !colors[part]);
      return (
        <button key={name} aria-label={`${label}: ${name}`} aria-pressed={on} onClick={() => set(part, key)}
          className={`rounded-full border-[3px] border-ink shadow-chunkysm shrink-0 ${on ? 'ring-4 ring-berry' : ''}`}
          style={{ width: 46, height: 46, background: bg }} title={name}>
          {!key && <span className="font-display font-bold text-ink text-xs">✨</span>}
        </button>
      );
    };
    return (
      <div className="mt-3">
        <div className="font-display font-bold text-ink text-sm">{label}</div>
        <div className="flex flex-wrap gap-2 mt-1">
          {btn(undefined, '#FFFFFF', 'Original')}
          {keys.map((k) => btn(k, sw[k] ?? '#ccc', k))}
        </div>
      </div>
    );
  };
  const onlyTop = !Object.keys(cl.bottom).length;
  return (
    <div className="flex flex-wrap gap-4 items-start">
      {preview && <div className="rounded-2xl border-[3px] border-ink bg-white p-2 shadow-chunkysm shrink-0" style={{ width: 132 }}>
        <div style={{ width: 112, height: 285 }}>
          <LayeredArt lay={lay} outfit={c.outfit ?? 0} face="happy" wear={c.wear} name={c.sprite} colors={c.colors} />
        </div>
      </div>}
      <div className="flex-1 min-w-0" style={{ minWidth: 220 }}>
        <h3 className="font-display text-xl font-extrabold text-ink">Clothes</h3>
        {row('top', onlyTop ? 'Dress color' : 'Top color', TOP_SWATCHES)}
        {row('bottom', 'Bottom color', BOTTOM_SWATCHES)}
        <button onClick={surprise} className="mt-4 rounded-2xl border-[3px] border-ink bg-white px-4 py-2 shadow-chunkysm font-display font-bold text-ink">🎲 Surprise me</button>
      </div>
    </div>
  );
}
