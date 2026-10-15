import { useGame } from '../engine/store';
import { ACCESSORIES, WEAR_SLOTS, type WearSlot } from '../data/accessories';
import type { CharacterData } from '../engine/types';
import { sfx } from '../engine/sfx';

/** Tap an accessory to put it on; tap again to take it off. */
export function WearPicker({ wear, onChange }: { wear: CharacterData['wear']; onChange: (slot: WearSlot, item: string | null) => void }) {
  const { game } = useGame();
  return (
    <div className="mt-4">
      <h3 className="font-display text-xl font-extrabold text-ink">Accessories</h3>
      {WEAR_SLOTS.map((s) => {
        const list = ACCESSORIES.filter((a) => a.wear === s.id && game.owned.includes(a.id));
        if (!list.length) return null;
        return (
          <div key={s.id} className="mt-2">
            <div className="font-display font-bold text-ink text-sm">{s.label}</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {list.map((a) => {
                const on = wear?.[s.id] === a.id;
                return (
                  <button key={a.id} aria-label={on ? `Take off ${a.name}` : `Wear ${a.name}`} aria-pressed={on}
                    onClick={() => { sfx(on ? 'tap' : 'sparkle'); onChange(s.id, on ? null : a.id); }}
                    className={`rounded-2xl border-[3px] border-ink bg-white p-1 shadow-chunkysm ${on ? 'ring-4 ring-berry' : ''}`} style={{ width: 64, height: 64 }}>
                    <img src={a.img} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
