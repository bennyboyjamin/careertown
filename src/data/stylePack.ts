import type { CharacterData, Look, PaperLook } from '../engine/types';

/** The Style Pack: YunaVerse clothes and five friends, bought by a grown-up in the iPhone/iPad app. */
export const STYLE_PACK = {
  /** App Store Connect product ID (non-consumable). */
  productId: 'careertown.stylepack',
  name: 'Style Pack',
  fallbackPrice: '$2.99',
} as const;

export const STYLE_PACK_CLOTHES = new Set([
  // tops
  'black-star-tank', 'pink-heart-cami', 'denim-corset',
  'black-pink-zip-hoodie', 'cream-bow-cardigan', 'pink-off-shoulder-sweater', 'pink-ruffle-cardigan',
  'white-butterfly-sweater', 'white-pink-puff-top', 'black-layered-top',
  // bottoms
  'black-chain-cargos', 'black-belted-shorts', 'ivory-ruffle-skirt', 'cream-ruffle-skirt', 'star-baggy-jeans',
  'navy-pleated-skirt', 'olive-cargos', 'blue-lace-skirt', 'pink-cargos', 'pink-bow-skirt',
  // shoes
  'black-white-sneakers', 'black-white-low-tops', 'black-combat-boots', 'blue-high-tops', 'white-platform-sneakers',
  'cream-platform-sneakers', 'pink-high-tops', 'pink-lace-boots', 'pink-chunky-sneakers',
]);

const L = { skin: '#DDA071', face: 'round', eyes: 'dot', hair: 'long', hairColor: '#24160E', top: 'tee', topColor: '#222222', bottom: 'jeans', bottomColor: '#222222', shoes: '#FFFFFF', glasses: 'none', hat: 'none', accessory: 'none' } as Look;
const friend = (id: string, name: string, paper: PaperLook): CharacterData =>
  ({ id: `style-${id}`, name, age: 'child', look: L, sprite: 'paper-kid', paper } as CharacterData);

/** The five friends that come with the pack (wearing pack clothes). */
export const STYLE_PACK_FRIENDS: CharacterData[] = [
  friend('jade', 'Jade', { base: 'kid', tone: 1, hair: 'ponytail', hairColor: 'darkbrown', top: 'black-star-tank', bottom: 'black-chain-cargos', shoes: 'white-platform-sneakers', acc: {} }),
  friend('lily', 'Lily', { base: 'kid', tone: 0, hair: 'longwaves', hairColor: 'brown', top: 'white-pink-puff-top', bottom: 'cream-ruffle-skirt', shoes: 'pink-chunky-sneakers', acc: { bag: 'bunny-bag' } }),
  friend('maya', 'Maya', { base: 'kid', tone: 1, hair: 'long', hairColor: 'black', top: 'denim-corset', bottom: 'star-baggy-jeans', shoes: 'blue-high-tops', acc: {} }),
  friend('rosie', 'Rosie', { base: 'kid', tone: 1, hair: 'braids', hairColor: 'black', top: 'pink-heart-cami', bottom: 'navy-pleated-skirt', shoes: 'black-combat-boots', acc: { bag: 'backpack' } }),
  friend('ivy', 'Ivy', { base: 'kid', tone: 1, hair: 'spacebuns', hairColor: 'darkbrown', top: 'white-butterfly-sweater', bottom: 'pink-cargos', shoes: 'white-platform-sneakers', acc: {} }),
];
