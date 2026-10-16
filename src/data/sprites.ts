// Family artwork. Each family member is a headless body (one per outfit) plus four
// interchangeable faces, positioned by a rig measured from the source sheets.
// `h` is standing height in room units.
import { DOLL_W, DOLL_H, DOLL_PAD, DOLL_OX, DOLL_EYES, DOLL_BODY, DOLL_HEADS } from './doll';
import snowy from '../assets/yuna/snowy.webp';
import coco from '../assets/yuna/coco.webp';
import yunaBody from '../assets/yuna/yuna-body.webp';
import yunaHappy from '../assets/yuna/yuna-head-happy.webp';
import yunaWink from '../assets/yuna/yuna-head-wink.webp';
import yunaSad from '../assets/yuna/yuna-head-sad.webp';
import yunaWow from '../assets/yuna/yuna-head-wow.webp';
import natalieBody from '../assets/yuna/natalie-body.webp';
import natalieHappy from '../assets/yuna/natalie-head-happy.webp';
import natalieWink from '../assets/yuna/natalie-head-wink.webp';
import natalieSad from '../assets/yuna/natalie-head-sad.webp';
import natalieWow from '../assets/yuna/natalie-head-wow.webp';
import brotherBody from '../assets/yuna/brother-body.webp';
import brotherHappy from '../assets/yuna/brother-head-happy.webp';
import brotherWink from '../assets/yuna/brother-head-wink.webp';
import brotherSad from '../assets/yuna/brother-head-sad.webp';
import brotherWow from '../assets/yuna/brother-head-wow.webp';
import neneBody from '../assets/yuna/nene-body.webp';
import neneHappy from '../assets/yuna/nene-head-happy.webp';
import neneWink from '../assets/yuna/nene-head-wink.webp';
import neneSad from '../assets/yuna/nene-head-sad.webp';
import neneWow from '../assets/yuna/nene-head-wow.webp';
import momBody from '../assets/yuna/mom-body.webp';
import momHappy from '../assets/yuna/mom-head-happy.webp';
import momWink from '../assets/yuna/mom-head-wink.webp';
import momSad from '../assets/yuna/mom-head-sad.webp';
import momWow from '../assets/yuna/mom-head-wow.webp';
import dadBody from '../assets/yuna/dad-body.webp';
import dadHappy from '../assets/yuna/dad-head-happy.webp';
import dadWink from '../assets/yuna/dad-head-wink.webp';
import dadSad from '../assets/yuna/dad-head-sad.webp';
import dadWow from '../assets/yuna/dad-head-wow.webp';

export interface Sprite { src: string; w: number; h: number; head: number }
const S = (src: string, pw: number, ph: number, head = 0.42): Sprite => ({ src, w: Math.round(ph * 0.82 * pw / ph), h: Math.round(ph * 0.82), head });

export const SPRITES: Record<string, Sprite> = {
  yuna: { src: yunaHappy, w: 96, h: 245, head: 0.4 },
  doll: { src: DOLL_HEADS['girl-happy-1'].src, w: 96, h: 272, head: 0.4 },
  natalie: { src: natalieHappy, w: 99, h: 252, head: 0.4 },
  brother: { src: brotherHappy, w: 85, h: 205, head: 0.4 },
  nene: { src: neneHappy, w: 86, h: 182, head: 0.4 },
  mom: { src: momHappy, w: 104, h: 262, head: 0.4 },
  dad: { src: dadHappy, w: 105, h: 272, head: 0.4 },
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
}
/** Seated look: we draw the torso and the top of the thighs; the seat's front is drawn
 *  over the rest (Room puts a copy of the seat front on top), so they sink into the seat. */
export const SIT_EXTRA = 0.1;
/** How far below the seat line the seated crop reaches, as a fraction of standing height. */
export const sitDrop = (_l: Layered) => SIT_EXTRA + 0.05;
/** Seated height as a fraction of standing height. */
export const sitFrac = (l: Layered) => l.hip + SIT_EXTRA;

export const LAYERED: Record<string, Layered> = {
  /** Dress-up characters from the character maker: the parts come from data/doll.ts (see components/Doll.tsx). */
  doll: {
    W: DOLL_W, H: DOLL_H, body: [0, DOLL_PAD, DOLL_W, DOLL_H - DOLL_PAD],
    head: [DOLL_HEADS['girl-happy-1'].box[0], DOLL_PAD, DOLL_HEADS['girl-happy-1'].box[2], DOLL_HEADS['girl-happy-1'].box[3]],
    outfits: [{ id: 'doll', label: 'Outfit', src: DOLL_BODY[1] }],
    faces: { happy: DOLL_HEADS['girl-happy-1'].src, wink: DOLL_HEADS['girl-wink-1'].src, sad: DOLL_HEADS['girl-sad-1'].src, wow: DOLL_HEADS['girl-wow-1'].src },
    eyes: [[DOLL_EYES[0][0] + DOLL_OX[1], DOLL_EYES[0][1] + DOLL_PAD], [DOLL_EYES[1][0] + DOLL_OX[1], DOLL_EYES[1][1] + DOLL_PAD]],
    crown: DOLL_PAD + 6, hip: (DOLL_PAD + 508) / DOLL_H,
  },
  yuna: {
    W: 527, H: 1343, body: [0, 283, 527, 1060], head: [47, 0, 429, 416],
    outfits: [{ id: 'default', label: 'Red hoodie', src: yunaBody }],
    faces: { happy: yunaHappy, wink: yunaWink, sad: yunaSad, wow: yunaWow },
    eyes: [[215, 210], [318, 210]],
    crown: 12, hip: 0.645,
  },
  natalie: {
    W: 556, H: 1411, body: [0, 335, 556, 1076], head: [94, 0, 435, 421],
    outfits: [{ id: 'default', label: 'Track pants', src: natalieBody }],
    faces: { happy: natalieHappy, wink: natalieWink, sad: natalieSad, wow: natalieWow },
    eyes: [[225, 250], [330, 250]],
    crown: 72, hip: 0.655,
  },
  brother: {
    W: 563, H: 1357, body: [0, 302, 563, 1055], head: [71, 0, 392, 328],
    outfits: [{ id: 'default', label: 'Blue hoodie', src: brotherBody }],
    faces: { happy: brotherHappy, wink: brotherWink, sad: brotherSad, wow: brotherWow },
    eyes: [[227, 225], [330, 225]],
    crown: 18, hip: 0.66,
  },
  nene: {
    W: 560, H: 1188, body: [0, 298, 560, 890], head: [47, 0, 438, 334],
    outfits: [{ id: 'default', label: 'Bunny dress', src: neneBody }],
    faces: { happy: neneHappy, wink: neneWink, sad: neneSad, wow: neneWow },
    eyes: [[228, 215], [338, 215]],
    crown: 8, hip: 0.665,
  },
  mom: {
    W: 552, H: 1393, body: [0, 292, 552, 1101], head: [84, 0, 358, 367],
    outfits: [{ id: 'default', label: 'Cozy cardigan', src: momBody }],
    faces: { happy: momHappy, wink: momWink, sad: momSad, wow: momWow },
    eyes: [[222, 215], [330, 215]],
    crown: 18, hip: 0.628,
  },
  dad: {
    W: 567, H: 1468, body: [0, 321, 567, 1147], head: [115, 0, 323, 344],
    outfits: [{ id: 'default', label: 'Navy sweater', src: dadBody }],
    faces: { happy: dadHappy, wink: dadWink, sad: dadSad, wow: dadWow },
    eyes: [[225, 200], [328, 200]],
    crown: 15, hip: 0.618,
  },
};
