import type { CharacterData, PetData, Pose } from '../engine/types';
import { CharacterArt, type Mood } from './art/Character';
import { PetArt } from './art/Pet';
import { PET_LOOKS } from '../data/accessories';
import { SPRITES, LAYERED, type Face, type Layered } from '../data/sprites';

/** Draws a character: hand-drawn artwork if it has a sprite, otherwise the vector style. */
export function Person({ c, pose = 'stand', mood = 'normal', bandage = false }: { c: CharacterData; pose?: Pose; mood?: Mood; bandage?: boolean }) {
  const lay = c.sprite ? LAYERED[c.sprite] : undefined;
  if (lay) return <LayeredArt lay={lay} outfit={c.outfit ?? 0} face={faceFor(mood)} sit={pose === 'sit'} />;
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
  const looks = PET_LOOKS[p.sprite!];
  const src = looks?.[p.look ?? 0]?.src ?? sp.src;
  return <img src={src} alt="" draggable={false} className="sprite-img" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', transform: sleeping ? 'rotate(-12deg) translateY(6%)' : undefined }} />;
}

/** Round face icon. */
export function SpriteFace({ sprite, size }: { sprite: string; size: number }) {
  const lay = LAYERED[sprite];
  if (lay) return (
    <div style={{ width: size, height: size, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <img src={lay.faces.happy} alt="" draggable={false} style={{ height: size * 1.35, width: 'auto', maxWidth: 'none', marginTop: -size * 0.06 }} />
    </div>
  );
  const sp = SPRITES[sprite];
  const imgH = (size * 0.95) / sp.head;
  return (
    <div style={{ width: size, height: size, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <img src={sp.src} alt="" draggable={false} style={{ height: imgH, width: 'auto', maxWidth: 'none', marginTop: size * 0.04 }} />
    </div>
  );
}

/** Which drawn face to show for what the character is doing. */
export function faceFor(mood: Mood): Face {
  if (mood === 'wink' || mood === 'silly') return 'wink';
  if (mood === 'wow') return 'wow';
  if (mood === 'sad') return 'sad';
  return 'happy';
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
export function LayeredArt({ lay, outfit, face, sit = false }: { lay: Layered; outfit: number; face: Face; sit?: boolean }) {
  const [bx, by, bw, bh] = lay.body;
  const [hx, hy, hw, hh] = lay.head;
  const body = lay.outfits[outfit] ?? lay.outfits[0];
  return (
    <div className="w-full h-full overflow-hidden" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: sit ? `${100 / 0.8}%` : '100%' }}>
        <img src={body.src} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', left: pct(bx, lay.W), top: pct(by, lay.H), width: pct(bw, lay.W), height: pct(bh, lay.H) }} />
        <img src={lay.faces[face]} alt="" draggable={false} className="sprite-img layered-head" style={{ position: 'absolute', left: pct(hx, lay.W), top: pct(hy, lay.H), width: pct(hw, lay.W), height: pct(hh, lay.H) }} />
      </div>
    </div>
  );
}
