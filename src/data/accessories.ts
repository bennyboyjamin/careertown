// Accessories and toys cut from the YunaVerse asset sheet.

import a_cap_black from '../assets/acc/cap-black.webp';
import a_sunglasses_red from '../assets/acc/sunglasses-red.webp';
import a_phone from '../assets/acc/phone.webp';
import a_bottle_pink from '../assets/acc/bottle-pink.webp';
import a_backpack_pink from '../assets/acc/backpack-pink.webp';
import a_cap_pink from '../assets/acc/cap-pink.webp';
import a_controller_purple from '../assets/acc/controller-purple.webp';
import a_bag_blue from '../assets/acc/bag-blue.webp';
import a_cap_blue from '../assets/acc/cap-blue.webp';
import a_headphones from '../assets/acc/headphones.webp';
import a_soccer_ball from '../assets/acc/soccer-ball.webp';
import a_skateboard from '../assets/acc/skateboard.webp';
import a_controller_black from '../assets/acc/controller-black.webp';
import a_bunny_plush from '../assets/acc/bunny-plush.webp';
import a_purse_pink from '../assets/acc/purse-pink.webp';
import a_sunglasses_pink from '../assets/acc/sunglasses-pink.webp';
import a_bunny_hat from '../assets/acc/bunny-hat.webp';
import a_handbag_white from '../assets/acc/handbag-white.webp';
import a_sunglasses_black from '../assets/acc/sunglasses-black.webp';
import a_cap_rose from '../assets/acc/cap-rose.webp';
import a_boba from '../assets/acc/boba.webp';
import a_bottle_blue from '../assets/acc/bottle-blue.webp';
import a_backpack_black from '../assets/acc/backpack-black.webp';
import a_glasses from '../assets/acc/glasses.webp';
import a_cap_beige from '../assets/acc/cap-beige.webp';
import a_watch from '../assets/acc/watch.webp';
import a_tumbler from '../assets/acc/tumbler.webp';
import a_snowy_sweater from '../assets/acc/snowy-sweater.webp';
import a_coco_bandana from '../assets/acc/coco-bandana.webp';
import a_coco_bow from '../assets/acc/coco-bow.webp';
import snowyBase from '../assets/yuna/snowy.webp';
import cocoBase from '../assets/yuna/coco.webp';

export type WearSlot = 'head' | 'eyes' | 'ears' | 'bag';
export interface AccDef { id: string; name: string; img: string; w: number; h: number; toy: boolean; food?: boolean; wear?: WearSlot }
/** Size in room units (about 1.2x the sheet's pixel size). */
export const ACCESSORIES: AccDef[] = [
  { id: 'acc-cap-black', name: 'Black cap', img: a_cap_black, w: 62, h: 58, toy: false, wear: 'head' },
  { id: 'acc-sunglasses-red', name: 'Red sunglasses', img: a_sunglasses_red, w: 82, h: 30, toy: false, wear: 'eyes' },
  { id: 'acc-phone', name: 'Phone', img: a_phone, w: 38, h: 68, toy: false },
  { id: 'acc-bottle-pink', name: 'Pink water bottle', img: a_bottle_pink, w: 31, h: 85, toy: false },
  { id: 'acc-backpack-pink', name: 'Pink backpack', img: a_backpack_pink, w: 65, h: 80, toy: false, wear: 'bag' },
  { id: 'acc-cap-pink', name: 'Pink cap', img: a_cap_pink, w: 54, h: 39, toy: false, wear: 'head' },
  { id: 'acc-controller-purple', name: 'Purple game controller', img: a_controller_purple, w: 60, h: 39, toy: true },
  { id: 'acc-bag-blue', name: 'Blue bag', img: a_bag_blue, w: 53, h: 75, toy: false, wear: 'bag' },
  { id: 'acc-cap-blue', name: 'Blue cap', img: a_cap_blue, w: 63, h: 45, toy: false, wear: 'head' },
  { id: 'acc-headphones', name: 'Headphones', img: a_headphones, w: 72, h: 69, toy: false, wear: 'ears' },
  { id: 'acc-soccer-ball', name: 'Soccer ball', img: a_soccer_ball, w: 49, h: 48, toy: true },
  { id: 'acc-skateboard', name: 'Skateboard', img: a_skateboard, w: 65, h: 27, toy: true },
  { id: 'acc-controller-black', name: 'Black game controller', img: a_controller_black, w: 54, h: 37, toy: true },
  { id: 'acc-bunny-plush', name: 'Bunny plush', img: a_bunny_plush, w: 56, h: 69, toy: true },
  { id: 'acc-purse-pink', name: 'Pink purse', img: a_purse_pink, w: 48, h: 69, toy: false, wear: 'bag' },
  { id: 'acc-sunglasses-pink', name: 'Pink sunglasses', img: a_sunglasses_pink, w: 62, h: 24, toy: false, wear: 'eyes' },
  { id: 'acc-bunny-hat', name: 'Bunny hat', img: a_bunny_hat, w: 62, h: 82, toy: false, wear: 'head' },
  { id: 'acc-handbag-white', name: 'White handbag', img: a_handbag_white, w: 58, h: 60, toy: false, wear: 'bag' },
  { id: 'acc-sunglasses-black', name: 'Black sunglasses', img: a_sunglasses_black, w: 63, h: 30, toy: false, wear: 'eyes' },
  { id: 'acc-cap-rose', name: 'Rose cap', img: a_cap_rose, w: 54, h: 45, toy: false, wear: 'head' },
  { id: 'acc-boba', name: 'Boba tea', img: a_boba, w: 31, h: 63, toy: false, food: true },
  { id: 'acc-bottle-blue', name: 'Blue water bottle', img: a_bottle_blue, w: 33, h: 75, toy: false },
  { id: 'acc-backpack-black', name: 'Black backpack', img: a_backpack_black, w: 53, h: 69, toy: false, wear: 'bag' },
  { id: 'acc-glasses', name: 'Glasses', img: a_glasses, w: 61, h: 25, toy: false, wear: 'eyes' },
  { id: 'acc-cap-beige', name: 'Beige cap', img: a_cap_beige, w: 56, h: 46, toy: false, wear: 'head' },
  { id: 'acc-watch', name: 'Watch', img: a_watch, w: 37, h: 69, toy: false },
  { id: 'acc-tumbler', name: 'Travel mug', img: a_tumbler, w: 36, h: 78, toy: false },
];
export const TOY_IDS = ACCESSORIES.filter((a) => a.toy).map((a) => a.id);
export const STARTER_ACCESSORIES = ACCESSORIES.filter((a) => !a.toy).map((a) => a.id);

/** Outfits for the family dogs (full-body pictures). */
export const PET_LOOKS: Record<string, { label: string; src: string }[]> = {
  snowy: [{ label: 'Natural', src: snowyBase }, { label: 'Pink sweater', src: a_snowy_sweater }],
  coco: [{ label: 'Natural', src: cocoBase }, { label: 'Blue bandana', src: a_coco_bandana }, { label: 'Bandana + bow', src: a_coco_bow }],
};

export const ACC_BY_ID: Record<string, AccDef> = Object.fromEntries(ACCESSORIES.map((a) => [a.id, a]));
export const WEAR_SLOTS: { id: WearSlot; label: string }[] = [
  { id: 'head', label: 'Hats' }, { id: 'eyes', label: 'Glasses' }, { id: 'ears', label: 'Headphones' }, { id: 'bag', label: 'Bags' },
];
