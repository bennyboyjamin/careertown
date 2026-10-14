import type { CharacterData, PetData, Pose } from '../engine/types';
import { CharacterArt, type Mood } from './art/Character';
import { PetArt } from './art/Pet';
import { SPRITES } from '../data/sprites';

/** Draws a character: hand-drawn artwork if it has a sprite, otherwise the vector style. */
export function Person({ c, pose = 'stand', mood = 'normal', bandage = false }: { c: CharacterData; pose?: Pose; mood?: Mood; bandage?: boolean }) {
  const sp = c.sprite ? SPRITES[c.sprite] : undefined;
  if (!sp) return <CharacterArt age={c.age} look={c.look} pose={pose} mood={mood} bandage={bandage} />;
  // Sitting: show the top of the artwork so the legs tuck behind the seat.
  return (
    <div className="sprite-wrap w-full h-full overflow-hidden" style={{ position: 'relative' }}>
      <img src={sp.src} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: pose === 'sit' ? `${100 / 0.8}%` : '100%', objectFit: 'contain', objectPosition: 'top' }} />
    </div>
  );
}

export function PetPic({ p, sleeping = false, bandage = false }: { p: PetData; sleeping?: boolean; bandage?: boolean }) {
  const sp = p.sprite ? SPRITES[p.sprite] : undefined;
  if (!sp) return <PetArt species={p.species} accessory={p.accessory} sleeping={sleeping} bandage={bandage} />;
  return <img src={sp.src} alt="" draggable={false} className="sprite-img" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', transform: sleeping ? 'rotate(-12deg) translateY(6%)' : undefined }} />;
}

/** Round face icon. */
export function SpriteFace({ sprite, size }: { sprite: string; size: number }) {
  const sp = SPRITES[sprite];
  const imgH = (size * 0.95) / sp.head;
  return (
    <div style={{ width: size, height: size, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <img src={sp.src} alt="" draggable={false} style={{ height: imgH, width: 'auto', maxWidth: 'none', marginTop: size * 0.04 }} />
    </div>
  );
}
