// Character artwork sizes and rigs. The YunaVerse family are vector dress-up characters
// (data/doll.ts) like the ones kids make; each keeps their own height.
// `h` is standing height in room units.
import { DOLL_W, DOLL_H, DOLL_PAD, DOLL_EYES, DOLL_CROWN, DOLL_WAIST, DOLL_PIC, DOLL_H_ADULT, DOLL_WAIST_ADULT } from './doll';
import snowy from '../assets/yuna/snowy.webp';
import coco from '../assets/yuna/coco.webp';
import { PAPER_BASES, type PaperBase } from './paperArt';

export interface Sprite { src: string; w: number; h: number; head: number }
const S = (src: string, pw: number, ph: number, head = 0.42): Sprite => ({ src, w: Math.round(ph * 0.82 * pw / ph), h: Math.round(ph * 0.82), head });

/** Room size for a vector character `h` tall (kid or grown-up canvas). */
const V = (h: number, adult = false): Sprite => ({ src: DOLL_PIC, w: Math.round(h * DOLL_W / (adult ? DOLL_H_ADULT : DOLL_H)), h, head: adult ? 0.4 : 0.45 });

export const SPRITES: Record<string, Sprite> = {
  doll: { src: DOLL_PIC, w: 133, h: 270, head: 0.45 },
  // the family, from tallest to smallest
  'doll-adult': V(298, true),
  dad: V(300, true), mom: V(290, true),
  natalie: V(262), yuna: V(256), brother: V(232), nene: V(208),
  snowy: S(snowy, 113, 136), coco: S(coco, 104, 140),
};

/* ── Layered characters: a body per outfit + a head per face, swapped at runtime ── */
export type Face = 'happy' | 'wink' | 'sad' | 'wow';
export interface Layered {
  /** Source-art rig: canvas size, and where the body and head sit in it (px). */
  W: number; H: number;
  body: [number, number, number, number];
  head: [number, number, number, number];
  outfits: { id: string; label: string; src: string }[];
  faces: Record<Face, string>;
  /** Eye centres in rig px, used to fit worn accessories to the face. */
  eyes: [[number, number], [number, number]];
  /** Top of the skull (not hair puffs or ponytails), rig px: where a headband sits. */
  crown: number;
  /** Hip line as a fraction of the full rig height: when sitting, the legs below it fold toward the viewer. */
  hip: number;
  /** Optional fit for worn hats/glasses on this rig: width multiplier and how far to lower them (in eye-distances). */
  fit?: Partial<Record<'head' | 'eyes', { w: number; drop: number }>>;
}
/** Seated look: we draw the torso and the top of the thighs; the seat's front is drawn
 *  over the rest (Room puts a copy of the seat front on top), so they sink into the seat. */
export const SIT_EXTRA = 0.1;
/** How far below the seat line the seated crop reaches, as a fraction of standing height. */
export const sitDrop = (_l: Layered) => SIT_EXTRA + 0.05;
/** Seated height as a fraction of standing height. */
export const sitFrac = (l: Layered) => l.hip + SIT_EXTRA;

/** Vector heads are rounder and wider-eyed than the painted art: hats sit lower and a bit smaller. */
const DOLL_FIT: Layered['fit'] = { head: { w: 0.82, drop: 0.42 }, eyes: { w: 0.9, drop: 0 } };

export const LAYERED: Record<string, Layered> = {
  /** Dress-up characters from the character maker: the parts come from data/doll.ts (see components/Doll.tsx). */
  doll: {
    W: DOLL_W, H: DOLL_H, body: [0, DOLL_PAD, DOLL_W, DOLL_H - DOLL_PAD],
    head: [40, DOLL_PAD + 40, 304, 300],
    outfits: [{ id: 'doll', label: 'Outfit', src: DOLL_PIC }],
    faces: { happy: DOLL_PIC, wink: DOLL_PIC, sad: DOLL_PIC, wow: DOLL_PIC },
    eyes: [[DOLL_EYES[0][0], DOLL_EYES[0][1] + DOLL_PAD], [DOLL_EYES[1][0], DOLL_EYES[1][1] + DOLL_PAD]],
    crown: DOLL_PAD + DOLL_CROWN, hip: (DOLL_PAD + DOLL_WAIST) / DOLL_H,
    fit: DOLL_FIT,
  },
};

/** Grown-up dress-up characters: same head, longer body. */
const DOLL_ADULT: Layered = {
  W: DOLL_W, H: DOLL_H_ADULT, body: [0, DOLL_PAD, DOLL_W, DOLL_H_ADULT - DOLL_PAD],
  head: [40, DOLL_PAD + 40, 304, 300],
  outfits: [{ id: 'doll', label: 'Outfit', src: DOLL_PIC }],
  faces: { happy: DOLL_PIC, wink: DOLL_PIC, sad: DOLL_PIC, wow: DOLL_PIC },
  eyes: [[DOLL_EYES[0][0], DOLL_EYES[0][1] + DOLL_PAD], [DOLL_EYES[1][0], DOLL_EYES[1][1] + DOLL_PAD]],
  crown: DOLL_PAD + DOLL_CROWN, hip: (DOLL_PAD + DOLL_WAIST_ADULT) / DOLL_H_ADULT,
  fit: DOLL_FIT,
};
for (const k of ['yuna', 'natalie', 'brother', 'nene']) LAYERED[k] = LAYERED.doll;
for (const k of ['mom', 'dad', 'doll-adult']) LAYERED[k] = DOLL_ADULT;
/** Rig for a dress-up look (kid or grown-up). */
export const dollRig = (adult?: boolean) => (adult ? DOLL_ADULT : LAYERED.doll);

/* ── YunaVerse characters (painted pieces, data/paperArt.ts) ── */
/** Room height of a kid on the YunaVerse kid body; every body uses the same scale so sizes stay true. */
const PAPER_KID_H = 256;
const paperScale = PAPER_KID_H / PAPER_BASES.kid.canvas[3];
function paperRig(b: PaperBase): Layered {
  const B = PAPER_BASES[b]; const [cx, cy, W, H] = B.canvas;
  const headW = (B.neck - B.crown) * 1.25;
  return {
    W, H, body: [0, 0, W, H], head: [512 - cx - headW / 2, B.crown - cy, headW, B.neck - B.crown],
    outfits: [{ id: 'paper', label: 'Outfit', src: DOLL_PIC }],
    faces: { happy: DOLL_PIC, wink: DOLL_PIC, sad: DOLL_PIC, wow: DOLL_PIC },
    eyes: [[B.eyes[0][0] - cx, B.eyes[0][1] - cy], [B.eyes[1][0] - cx, B.eyes[1][1] - cy]],
    crown: B.crown - cy, hip: (B.hip - cy) / H,
  };
}
const paperSprite = (b: PaperBase): Sprite => ({ src: DOLL_PIC, w: Math.round(PAPER_BASES[b].canvas[2] * paperScale), h: Math.round(PAPER_BASES[b].canvas[3] * paperScale), head: 0.45 });
for (const b of ['kid', 'preschool', 'adult'] as PaperBase[]) { LAYERED[`paper-${b}`] = paperRig(b); SPRITES[`paper-${b}`] = paperSprite(b); }
/** Yuna, Nene, Brother, Mom and Dad are drawn in the YunaVerse style. */
LAYERED.yuna = LAYERED['paper-kid']; SPRITES.yuna = SPRITES['paper-kid'];
LAYERED.nene = LAYERED['paper-preschool']; SPRITES.nene = SPRITES['paper-preschool'];
LAYERED.mom = LAYERED['paper-adult']; SPRITES.mom = SPRITES['paper-adult'];
LAYERED.dad = LAYERED['paper-adult']; SPRITES.dad = SPRITES['paper-adult'];
LAYERED.brother = LAYERED['paper-kid']; SPRITES.brother = SPRITES['paper-kid'];
/** Rig/size key for a YunaVerse body. */
export const paperSpriteKey = (b: PaperBase) => `paper-${b}`;
