import type { CharacterData, DollLook, Look, PaperLook } from '../engine/types';
import { PAPER_BASES } from './paperArt';
const PAPER_ASPECT = Object.fromEntries(Object.entries(PAPER_BASES).map(([b, B]) => [b, B.canvas[2] / B.canvas[3]])) as Record<keyof typeof PAPER_BASES, number>;

export const SKIN_LABELS = ['Light', 'Medium', 'Tan', 'Deep brown'];
export const SKIN_SWATCH = ['#FAD5B8', '#F3BE97', '#DDA071', '#A8693F'];
/** Hair colours. */
export const HAIR_TINTS: Record<string, { label: string; hex: string; swatch: string }> = {
  darkbrown: { label: 'Dark brown', hex: '#6B3D26', swatch: '#6B3D26' },
  black: { label: 'Black', hex: '#2E2628', swatch: '#2E2628' },
  brown: { label: 'Brown', hex: '#8A5A3A', swatch: '#8A5A3A' },
  blonde: { label: 'Blonde', hex: '#E8BC70', swatch: '#E8BC70' },
  ginger: { label: 'Ginger', hex: '#D46E3A', swatch: '#D46E3A' },
  pink: { label: 'Pink', hex: '#F496BE', swatch: '#F496BE' },
  lavender: { label: 'Lavender', hex: '#AC8EE6', swatch: '#AC8EE6' },
  blue: { label: 'Blue', hex: '#6092E0', swatch: '#6092E0' },
  silver: { label: 'Silver', hex: '#A9ABB6', swatch: '#A9ABB6' },
};
export const EYE_TINTS: Record<string, { label: string; hex: string; swatch: string }> = {
  brown: { label: 'Brown', hex: '#7A4424', swatch: '#7A4424' },
  hazel: { label: 'Hazel', hex: '#967837', swatch: '#967837' },
  green: { label: 'Green', hex: '#3F8A55', swatch: '#3F8A55' },
  blue: { label: 'Blue', hex: '#3F7FCC', swatch: '#3F7FCC' },
  gray: { label: 'Gray', hex: '#828C96', swatch: '#828C96' },
  purple: { label: 'Purple', hex: '#965FC8', swatch: '#965FC8' },
};
/** Colours for the plain tee and shorts a character wears when no top or bottom is picked. */
export const BASIC_TINTS: Record<string, string> = {
  white: '#FFFFFF', pink: '#F7A1C4', lavender: '#B9A3F0', mint: '#7FD8B5', sky: '#8EC9F5', yellow: '#FFD45C', red: '#E2483B', navy: '#3D4E8F', black: '#3A3A42',
};

export const DEFAULT_DOLL: DollLook = {
  tone: 1, face: 'girl', hair: 'long', hairColor: 'darkbrown', eyes: 'brown',
  top: 'pink-hoodie', bottom: 'jeans', shoes: 'white-sneakers',
};

/** The YunaVerse family, drawn as vector dress-up characters (same outfits as their original artwork). */
const FAM = { tone: 2, hairColor: 'black', eyes: 'brown' } as const;
export const FAMILY_DOLLS: Record<string, DollLook> = {
  yuna:    { ...FAM, face: 'girl', hair: 'wavy', top: 'red-hoodie', bottom: 'wide-jeans', shoes: 'red-sneakers' },
  natalie: { ...FAM, face: 'girl', hair: 'ponytail', top: 'raglan-tee', bottom: 'track-pants', shoes: 'pink-sneakers' },
  brother: { ...FAM, face: 'boy', hair: 'messy', top: 'royal-hoodie', bottom: 'cargo-shorts', shoes: 'blue-sneakers' },
  nene:    { ...FAM, face: 'girl', hair: 'bunnybob', top: 'bunny-dress', bottom: null, shoes: 'bow-shoes' },
  mom:     { ...FAM, face: 'girl', hair: 'lowbun', top: 'cardigan', bottom: 'khaki-wide', shoes: 'cream-sneakers', adult: true },
  dad:     { ...FAM, face: 'boy', hair: 'sidepart', top: 'navy-sweater', bottom: 'wide-jeans', shoes: 'gray-sneakers', adult: true },
};

/** Career outfits: worn by anyone, but only after the mission that unlocks them (game.owned). */
export const CAREER_OUTFITS: Record<string, { unlock: string; mission: string }> = {
  'lab-coat':    { unlock: 'wear:top:labcoat', mission: 'Check-up for Pip' },
  'suit-jacket': { unlock: 'wear:top:suit', mission: 'The Missing Science Trophy' },
  'safety-vest': { unlock: 'wear:top:vest', mission: 'The River Bridge' },
  'chef-coat':   { unlock: 'wear:top:chef', mission: 'Pizza Party at Café Sunny' },
};
/** Doll garment for a 'wear:top:…' unlock, if there is one. */
export const garmentForUnlock = (u: string) => Object.entries(CAREER_OUTFITS).find(([, o]) => o.unlock === u)?.[0];

/** Mission characters, drawn like everyone else. */
export const NPC_DOLLS: Record<string, DollLook> = {
  pip:   { tone: 1, face: 'girl', hair: 'buns', hairColor: 'ginger', eyes: 'brown', top: null, bottom: null, shoes: 'boots', teeColor: 'sky', shortsColor: 'lavender' },
  ava:   { tone: 3, face: 'girl', hair: 'ponytail', hairColor: 'black', eyes: 'brown', top: 'puff-top', bottom: 'pleat-skirt', shoes: 'white-sneakers' },
  ben:   { tone: 0, face: 'boy', hair: 'spiky', hairColor: 'blonde', eyes: 'blue', top: 'green-tee', bottom: null, shoes: 'green-sneakers', shortsColor: 'sky' },
  chloe: { tone: 2, face: 'girl', hair: 'wavyboy', hairColor: 'brown', eyes: 'hazel', top: 'pink-hoodie', bottom: 'jeans', shoes: 'boots' },
  judge: { tone: 2, face: 'girl', hair: 'bangs', hairColor: 'silver', eyes: 'brown', top: 'suit-jacket', bottom: 'khaki-wide', shoes: 'cream-sneakers', adult: true },
  sunny: { tone: 1, face: 'girl', hair: 'topbun', hairColor: 'darkbrown', eyes: 'green', top: 'chef-coat', bottom: 'jeans', shoes: 'clogs', adult: true },
};
/** A stand-in character record for drawing an NPC with <Person>. */
/** Mission kids drawn in the painted YunaVerse style (grown-ups keep the vector look until their body is added). */
export const NPC_PAPER: Record<string, PaperLook> = {
  pip:   { base: 'kid', tone: 1, hair: 'spacebuns', hairColor: 'ginger', top: 'heart-crop-tee', bottom: 'overalls', shoes: 'pink-sneakers', acc: {} },
  ava:   { base: 'kid', tone: 3, hair: 'ponytail', hairColor: 'black', top: 'pink-cardigan', bottom: 'lavender-skirt', shoes: 'loafers', acc: {} },
  ben:   { base: 'kid', tone: 0, hair: 'sideswept', hairColor: 'blonde', top: 'jersey-23', bottom: 'black-shorts', shoes: 'navy-sneakers', acc: {} },
  chloe: { base: 'kid', tone: 2, hair: 'braids', hairColor: 'brown', top: 'ghost-hoodie', bottom: 'baggy-jeans', shoes: 'black-boots', acc: { eyes: 'heart-glasses' } },
  judge: { base: 'adult', tone: 2, hair: 'lowbun', hairColor: 'black', top: 'judge-suit', bottom: 'gray-trousers', shoes: 'black-shoes', acc: {} },
  sunny: { base: 'adult', tone: 1, hair: 'sleekbob', hairColor: 'darkbrown', top: 'chef-coat', bottom: 'blue-jeans', shoes: 'white-clogs', acc: {} },
};
export const npc = (id: string, name: string): CharacterData => NPC_PAPER[id]
  ? { id: `npc-${id}`, name, age: NPC_PAPER[id].base === 'adult' ? 'adult' : 'child', look: {} as Look, sprite: `paper-${NPC_PAPER[id].base}`, doll: NPC_DOLLS[id], paper: NPC_PAPER[id] }
  : { id: `npc-${id}`, name, age: NPC_DOLLS[id].adult ? 'adult' : 'child', look: {} as Look, sprite: NPC_DOLLS[id].adult ? 'doll-adult' : 'doll', doll: NPC_DOLLS[id] };
/** Width / height of how a character is drawn (for sizing boxes). */
export const npcAspect = (c: CharacterData) => (c.paper ? PAPER_ASPECT[c.paper.base] ?? PAPER_ASPECT.kid : c.age === 'adult' ? 384 / 881 : 384 / 780);

/* ── Older characters (made before the dress-up maker) → dress-up look ── */
const rgbOf = (h: string) => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const dist = (a: string, b: string) => { const [r, g, bl] = rgbOf(a), [r2, g2, b2] = rgbOf(b); return (r - r2) ** 2 + (g - g2) ** 2 + (bl - b2) ** 2; };
const nearest = <T extends string>(hex: string, opts: Record<T, string>) => (Object.keys(opts) as T[]).reduce((best, k) => (dist(hex, opts[k]) < dist(hex, opts[best]) ? k : best));
const HAIR_MAP: Record<string, string | null> = { short: 'sidepart', bob: 'bangs', long: 'long', ponytail: 'ponytail', buns: 'buns', curly: 'wavyboy', spiky: 'spiky',
  buzz: 'swoop', wavy: 'wavy', locs: 'long', braids: 'braids', afropuff: 'topbun', topknot: 'topbun', headscarf: 'bangs' };
const TOP_MAP: Record<string, string> = { tee: 'pocket-tee', stripes: 'green-tee', sweater: 'navy-sweater', star: 'sport-tee', polo: 'pocket-tee',
  labcoat: 'lab-coat', suit: 'suit-jacket', vest: 'safety-vest', sweatshirt: 'navy-sweater' };
const HOODIES: Record<string, string> = { 'red-hoodie': '#E8573F', 'pink-hoodie': '#FF8FB8', 'blue-hoodie': '#7FB2F0', 'royal-hoodie': '#2F6BD9' };
export function lookToDoll(look: Look, adult: boolean): DollLook {
  const tints = Object.fromEntries(Object.entries(HAIR_TINTS).map(([k, v]) => [k, v.hex])) as Record<string, string>;
  const skins = Object.fromEntries(SKIN_SWATCH.map((c, i) => [String(i), c])) as Record<string, string>;
  const shorts = look.bottom === 'shorts' ? nearest(look.bottomColor ?? '#FFFFFF', BASIC_TINTS) : undefined;
  return {
    tone: Number(nearest(look.skin ?? SKIN_SWATCH[1], skins)),
    face: ['short', 'spiky', 'buzz'].includes(look.hair) ? 'boy' : 'girl',
    hair: HAIR_MAP[look.hair] ?? 'long', hairColor: nearest(look.hairColor ?? '#6B3D26', tints), eyes: 'brown',
    top: look.bottom === 'dress' ? 'bunny-dress' : look.top === 'hoodie' ? nearest(look.topColor ?? '#FF8FB8', HOODIES) : TOP_MAP[look.top] ?? 'pocket-tee',
    bottom: ({ pants: 'jeans', jeans: 'jeans', widejeans: 'wide-jeans', skirt: 'pleat-skirt' } as Record<string, string>)[look.bottom] ?? null,
    shoes: 'white-sneakers', ...(shorts && shorts !== 'white' ? { shortsColor: shorts } : {}), ...(adult ? { adult: true } : {}),
  };
}

/** Family members drawn in the painted YunaVerse style (the rest keep their vector look until their pieces exist). */
export const FAMILY_PAPER: Record<string, PaperLook> = {
  yuna: { base: 'kid', tone: 2, hair: 'wavy', hairColor: 'black', top: 'red-hoodie', bottom: 'wide-jeans', shoes: 'red-sneakers', acc: {} },
  nene: { base: 'preschool', tone: 2, hair: 'bob', hairColor: 'black', top: 'bunny-dress', bottom: null, shoes: 'bow-shoes', acc: {} },
  natalie: { base: 'kid', tone: 2, hair: 'scrunchieponytail', hairColor: 'darkbrown', top: 'cream-bow-sweater', bottom: 'cream-cargos', shoes: 'gray-sneakers', acc: {} },
  brother: { base: 'kid', tone: 2, hair: 'boyshort', hairColor: 'black', top: 'dino-tee', bottom: 'khaki-cargo-shorts', shoes: 'gray-low-sneakers', acc: {} },
  mom: { base: 'adult', tone: 2, hair: 'momwaves', hairColor: 'black', top: 'mom-cream-cardigan', bottom: 'mom-blue-jeans', shoes: 'mom-white-sneakers', acc: {} },
  dad: { base: 'adult', tone: 2, hair: 'dadshort', hairColor: 'black', top: 'dad-navy-hoodie', bottom: 'dad-blue-jeans', shoes: 'dad-brown-loafers', acc: {} },
};
