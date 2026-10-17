import type { CSSProperties } from 'react';
import type { DollLook } from '../engine/types';
import type { Face } from '../data/sprites';
import { DOLL_W, DOLL_H, DOLL_PAD, DOLL_OX, DOLL_BODY, DOLL_HEADS, DOLL_IRIS, DOLL_HAIR, DOLL_BASIC, DOLL_GARMENTS } from '../data/doll';
import { HAIR_TINTS, EYE_TINTS, BASIC_TINTS } from '../data/dollLooks';
import { useTint } from './tint';

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
/** A picture placed at [x, y, w, h] in doll canvas px (y measured from the body top; the canvas has DOLL_PAD above). */
function Piece({ src, box, dx = 0, tint }: { src: string; box: number[]; dx?: number; tint?: string | null }) {
  const url = useTint(src, tint ?? undefined);
  const [x, y, w, h] = box;
  return <img src={url} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', left: pct(x + dx, DOLL_W), top: pct(y + DOLL_PAD, DOLL_H), width: pct(w, DOLL_W), height: pct(h, DOLL_H), filter: 'none' }} />;
}
const tone = (d: DollLook) => Math.max(0, Math.min(3, d.tone | 0));

/** Body, underclothes, shoes and outfit (clipped with the body when sitting). */
export function DollBody({ d }: { d: DollLook }) {
  const t = tone(d);
  const g = (id: string | null) => (id && DOLL_GARMENTS[id] ? <Piece key={id} src={DOLL_GARMENTS[id].srcs[t]} box={DOLL_GARMENTS[id].boxes[t]} /> : null);
  const tee = d.teeColor ? BASIC_TINTS[d.teeColor] : null;
  const shorts = d.shortsColor ? BASIC_TINTS[d.shortsColor] : null;
  // Hide the body (and plain tee/shorts) wherever a garment is worn, so no skin or outlines peek out at the edges.
  const hides = [d.shoes, d.top, d.bottom].map((id) => (id ? DOLL_GARMENTS[id]?.hide : undefined)).filter(Boolean) as string[];
  const under: CSSProperties = { position: 'absolute', inset: 0 };
  if (hides.length) {
    const img = hides.map((u) => `url(${u})`).join(', ');
    const size = hides.map(() => `100% ${pct(DOLL_H - DOLL_PAD, DOLL_H)}`).join(', ');
    const pos = hides.map(() => '0 100%').join(', ');
    Object.assign(under, {
      WebkitMaskImage: img, maskImage: img, WebkitMaskSize: size, maskSize: size,
      WebkitMaskPosition: pos, maskPosition: pos, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
      WebkitMaskComposite: hides.map(() => 'source-in').join(', '), maskComposite: 'intersect',
    });
  }
  return (
    <>
      <div style={under}>
        <img src={DOLL_BODY[t]} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', left: 0, top: pct(DOLL_PAD, DOLL_H), width: '100%', height: pct(DOLL_H - DOLL_PAD, DOLL_H) }} />
        {tee && <Piece src={DOLL_BASIC[`tee-${t}`].src} box={DOLL_BASIC[`tee-${t}`].box} tint={tee} />}
        {shorts && <Piece src={DOLL_BASIC[`shorts-${t}`].src} box={DOLL_BASIC[`shorts-${t}`].box} tint={shorts} />}
      </div>
      {g(d.shoes)}{g(d.top)}{g(d.bottom)}
    </>
  );
}

/** Head with the chosen face and mood, eye colour and hair. */
/** The 8 drawn expressions: the 4 shared faces plus laugh, cry, grumpy and silly for dress-up characters. */
function exprFor(face: Face, mood?: string) {
  if (mood === 'silly') return face === 'wink' ? 'silly' : 'laugh';   // tickled: giggle and stick tongue out
  if (mood === 'grumpy') return 'angry';
  if (mood === 'sad') return 'cry';
  return face;
}

export function DollHead({ d, face, mood }: { d: DollLook; face: Face; mood?: string }) {
  const t = tone(d);
  const expr = exprFor(face, mood);
  const head = DOLL_HEADS[`${d.face}-${expr}-${t}`] ?? DOLL_HEADS[`${d.face}-${face}-${t}`] ?? DOLL_HEADS[`${d.face}-happy-${t}`];
  const iris = DOLL_IRIS[`${d.face}-${expr}`];
  const eye = EYE_TINTS[d.eyes]?.hex;
  const hair = d.hair ? DOLL_HAIR[d.hair] : undefined;
  return (
    <>
      <Piece src={head.src} box={head.box} />
      {iris && eye && <Piece src={iris.src} box={iris.box} dx={DOLL_OX[t]} tint={eye} />}
      {hair && <Piece src={hair.src} box={hair.box} dx={DOLL_OX[t]} tint={HAIR_TINTS[d.hairColor]?.hex} />}
    </>
  );
}
