// Hand-drawn character artwork (the user's YunaVerse family), cut out of the
// character sheet. `h` is standing height in room units; images keep their aspect.
import yuna from '../assets/yuna/yuna.webp';
import natalie from '../assets/yuna/natalie.webp';
import brother from '../assets/yuna/brother.webp';
import nene from '../assets/yuna/nene.webp';
import mom from '../assets/yuna/mom.webp';
import dad from '../assets/yuna/dad.webp';
import snowy from '../assets/yuna/snowy.webp';
import coco from '../assets/yuna/coco.webp';

export interface Sprite { src: string; w: number; h: number; head: number }
const S = (src: string, pw: number, ph: number, head = 0.42): Sprite => ({ src, w: Math.round(ph * 0.82 * pw / ph), h: Math.round(ph * 0.82), head });

/** head = fraction of image height covered by the head, used for round face icons. */
export const SPRITES: Record<string, Sprite> = {
  yuna: S(yuna, 179, 288, 0.42), natalie: S(natalie, 141, 313, 0.36), brother: S(brother, 126, 238, 0.45),
  nene: S(nene, 135, 200, 0.5), mom: S(mom, 140, 319, 0.35), dad: S(dad, 137, 322, 0.36),
  snowy: S(snowy, 113, 136), coco: S(coco, 104, 140),
};
