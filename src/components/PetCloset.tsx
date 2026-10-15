import { useGame } from '../engine/store';
import { PET_LOOKS } from '../data/accessories';
import { PET_ACCESSORIES } from '../data/catalog';
import { PetPic } from './Person';
import { sfx } from '../engine/sfx';

/** Changing room for pets: outfits for the family dogs, accessories for the other pets. */
export function PetCloset({ only }: { only?: string }) {
  const { game, dispatch } = useGame();
  const pets = game.pets.filter((p) => !only || p.id === only);
  if (!pets.length) return null;
  return (
    <div className="mt-4">
      <h3 className="font-display text-xl font-extrabold text-ink">🐾 Pet closet</h3>
      {pets.map((p) => (
        <div key={p.id} className="mt-2 flex items-center gap-3">
          <div className="shrink-0" style={{ width: 64, height: 64 }}><PetPic p={p} /></div>
          <div className="min-w-0">
            <div className="font-display font-bold text-ink text-sm">{p.name}</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {p.sprite && PET_LOOKS[p.sprite] ? PET_LOOKS[p.sprite].map((lk, i) => (
                <button key={lk.label} aria-label={`${p.name}: ${lk.label}`} aria-pressed={(p.look ?? 0) === i}
                  onClick={() => { sfx('sparkle'); dispatch({ type: 'SET_PET', pet: { ...p, look: i } }); dispatch({ type: 'EVENT', name: 'dress' }); }}
                  className={`rounded-2xl border-[3px] border-ink p-1 bg-white shadow-chunkysm ${(p.look ?? 0) === i ? 'ring-4 ring-berry' : ''}`}>
                  <img src={lk.src} alt="" draggable={false} style={{ width: 52, height: 52, objectFit: 'contain' }} />
                  <div className="font-body text-xs text-ink">{lk.label}</div>
                </button>
              )) : PET_ACCESSORIES.filter((a) => a.id === 'none' || game.owned.includes(`pet:${a.id}`)).map((a) => (
                <button key={a.id} aria-pressed={p.accessory === a.id}
                  onClick={() => { sfx('sparkle'); dispatch({ type: 'SET_PET', pet: { ...p, accessory: a.id } }); }}
                  className={`rounded-2xl border-[3px] border-ink px-3 py-2 font-body text-sm text-ink shadow-chunkysm ${p.accessory === a.id ? 'bg-sun' : 'bg-white'}`}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
