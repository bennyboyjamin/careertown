import { useEffect, useRef, useState } from 'react';
import { BUILDINGS, type BuildingDef } from '../data/buildings';
import { useGame } from '../engine/store';
import townArt from '../assets/town/town-map.webp';
import balloonArt from '../assets/town/balloon.webp';
import { Person, PetPic } from '../components/Person';
import { sfx } from '../engine/sfx';
import type { BuildingId } from '../engine/types';

/** Where each building sits in the painted town picture (px in a 1536 × 1024 image): [x, y, w, h]. */
const IMG_W = 1536, IMG_H = 1024;
const SPOTS: Record<string, [number, number, number, number]> = {
  home: [36, 158, 268, 186],
  school: [338, 92, 366, 294],
  hospital: [706, 122, 274, 260],
  courthouse: [1022, 156, 252, 202],
  bank: [1306, 182, 222, 176],
  engineering: [36, 466, 316, 178],
  'animal-hospital': [412, 470, 222, 178],
  'tech-lab': [684, 470, 210, 182],
  restaurant: [946, 480, 258, 182],
  shopping: [1232, 486, 276, 178],
};
const px = (v: number, of: number) => `${(v / of) * 100}%`;

export function TownMap({ onEnter }: { onEnter: (id: BuildingId) => void }) {
  const { game, dispatch } = useGame();
  const [bump, setBump] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current; if (!el) return;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) * 0.15);
  }, []);
  const walker = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];
  const pet = game.pets[0];

  const tap = (b: BuildingDef) => {
    setBump(b.id);
    window.setTimeout(() => setBump(null), 400);
    if (!b.playable) { sfx('fail'); dispatch({ type: 'TOAST', text: `${b.name} is coming soon!` }); return; }
    sfx('pop');
    window.setTimeout(() => onEnter(b.id), 260);
  };

  return (
    <div ref={scroller} className="map-scroll h-full w-full overflow-auto">
      <div className="town town-full town-art relative overflow-hidden select-none">
        <img src={townArt} alt="" draggable={false} className="absolute inset-0 w-full h-full" style={{ objectFit: 'fill' }} />

        {/* the hot-air balloon drifts across the sky and hides a secret */}
        <button aria-label="Hot air balloon" className="balloon absolute" style={{ zIndex: 20, top: '9%', width: '5%', aspectRatio: '76 / 96' }}
          onClick={() => { if (!game.secrets.includes('balloon')) { sfx('sparkle'); dispatch({ type: 'FIND_SECRET', id: 'balloon' }); } else { sfx('pop'); dispatch({ type: 'TOAST', text: 'Wheee! The balloon waves at you.' }); } }}>
          <img src={balloonArt} alt="" draggable={false} className="w-full h-full" style={{ pointerEvents: 'none' }} />
        </button>

        {/* walker + pet on the top sidewalk */}
        {walker && (
          <div className="walker absolute pointer-events-none" style={{ zIndex: 10, top: "28.5%", width: "3.2%", height: "9.5%" }}>
            <Person c={walker} mood="happy" />
            {pet && <div className="absolute -right-[85%] bottom-0 w-[80%] h-[42%]"><PetPic p={pet} /></div>}
          </div>
        )}

        {BUILDINGS.map((b) => {
          const sp = SPOTS[b.id]; if (!sp) return null;
          const [x, y, w, h] = sp;
          return (
            <button key={b.id} onClick={() => tap(b)} aria-label={b.playable ? `Enter ${b.name}` : `${b.name}, coming soon`}
              className={`building art-building absolute ${b.playable ? '' : 'soon'} ${bump === b.id ? 'bump' : ''}`}
              style={{ left: px(x, IMG_W), top: px(y, IMG_H), width: px(w, IMG_W), height: px(h, IMG_H) }}>
              {/* the building's own piece of the picture, so it can bounce when tapped */}
              <span className="art-crop absolute inset-0" style={{ backgroundImage: `url(${townArt})`, backgroundSize: `${(IMG_W / w) * 100}% ${(IMG_H / h) * 100}%`, backgroundPosition: `${(x / (IMG_W - w)) * 100}% ${(y / (IMG_H - h)) * 100}%` }} />
              <span className="sign absolute left-1/2 -translate-x-1/2 w-max leading-tight text-center rounded-2xl border-ink bg-white font-display font-bold text-ink shadow-chunkysm"
                style={{ bottom: '-6%', fontSize: '1.25cqw', padding: '0.15cqw 0.8cqw', borderWidth: '0.22cqw', borderStyle: 'solid', borderRadius: '1cqw' }}>
                {b.icon} {b.name}
              </span>
              {!b.playable && <span className="absolute rounded-full border-ink bg-lilac text-white font-display font-bold rotate-6" style={{ top: '6%', right: '4%', fontSize: '1.2cqw', padding: '0 0.8cqw', borderWidth: '0.22cqw', borderStyle: 'solid' }}>Soon</span>}
              {b.playable && b.missions.some((m) => !game.completedMissions[m]) && <span className="mission-dot absolute rounded-full bg-berry border-ink grid place-items-center text-white font-display font-extrabold" style={{ top: '6%', left: '6%', width: '2.4cqw', height: '2.4cqw', fontSize: '1.5cqw', borderWidth: '0.22cqw', borderStyle: 'solid' }}>!</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
