import type { SfxName } from '../engine/sfx';
import { ACCESSORIES, TOY_IDS } from './accessories';
import pCouch from '../assets/furniture/couch.webp';
import pArmchair from '../assets/furniture/armchair.webp';
import pTv from '../assets/furniture/tv.webp';
import pLamp from '../assets/furniture/lamp.webp';
import pBookshelf from '../assets/furniture/bookshelf.webp';
import pDoor from '../assets/furniture/door.webp';
import pRug from '../assets/furniture/rug.webp';
import pPlant from '../assets/furniture/plant.webp';
import pBed from '../assets/furniture/bed.webp';
import pCloset from '../assets/furniture/closet.webp';
import pToybox from '../assets/furniture/toybox.webp';
import pDoorPink from '../assets/furniture/door-pink.webp';
import pStudyDesk from '../assets/furniture/studydesk.webp';
import pLampPink from '../assets/furniture/lamp-pink.webp';

// Tags drive the interaction engine (engine/interactions.ts).
export type ItemTag =
  | 'food' | 'cookable' | 'washable' | 'small' | 'toy' | 'tool' | 'medical'
  | 'seat' | 'bed' | 'table' | 'stove' | 'sink' | 'door' | 'behind'
  | 'block' | 'floor' | 'shower' | 'petfood' | 'brush' | 'decor' | 'groom' | 'wall' | 'float';

export type TapAction =
  | { type: 'toggle'; sfx?: SfxName }
  | { type: 'spawn'; items: string[]; toggle?: boolean }
  | { type: 'wardrobe' }
  | { type: 'custom'; id: string }
  | { type: 'anim'; anim: string; sfx?: SfxName; bubble?: string[] }
  | { type: 'secret'; secretId: string; taps: number; anim?: string; sfx?: SfxName }
  | { type: 'roll'; bubble?: string[]; sfx?: SfxName }
  | { type: 'pop' };

export interface ItemDef {
  id: string;
  name: string;
  w: number;            // room units
  h: number;
  emoji?: string;       // small props are drawn as emoji stickers
  img?: string;         // hand-drawn sticker art
  wear?: import('./accessories').WearSlot; // characters with layered art can wear it
  art?: string;         // big furniture is drawn as SVG (components/art/Furniture.tsx)
  paint?: string;       // painted furniture picture (used instead of the SVG art)
  tags: ItemTag[];
  fixed?: boolean;      // can't be dragged, only tapped
  tap?: TapAction;
  cooksInto?: string;
  medical?: 'thermometer' | 'stethoscope' | 'bandage';
  seatLift?: number;    // how far above the item's base a sitter's feet go
}

const food = (id: string, name: string, emoji: string, extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, emoji, w: 62, h: 62, tags: ['food', 'small', 'washable'], ...extra,
});
const prop = (id: string, name: string, emoji: string, tags: ItemTag[], extra: Partial<ItemDef> = {}): ItemDef => ({
  id, name, emoji, w: 70, h: 70, tags: ['small', ...tags], ...extra,
});

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(
  ([
    // ── Food ──────────────────────────────────────────
    food('apple', 'Apple', '🍎'),
    food('banana', 'Banana', '🍌'),
    food('carrot', 'Carrot', '🥕'),
    food('broccoli', 'Broccoli', '🥦'),
    food('cheese', 'Cheese', '🧀', { tags: ['food', 'small'] }),
    food('milk', 'Milk', '🥛', { tags: ['food', 'small'] }),
    food('egg', 'Egg', '🥚', { tags: ['food', 'small', 'cookable'], cooksInto: 'friedegg' }),
    food('friedegg', 'Fried egg', '🍳', { tags: ['food', 'small'] }),
    food('corn', 'Corn', '🌽', { tags: ['food', 'small', 'cookable', 'washable'], cooksInto: 'popcorn' }),
    food('popcorn', 'Popcorn', '🍿', { tags: ['food', 'small'] }),
    food('batter', 'Pancake mix', '🥣', { tags: ['food', 'small', 'cookable'], cooksInto: 'pancakes' }),
    food('pancakes', 'Pancakes', '🥞', { tags: ['food', 'small'] }),
    food('cupcake', 'Cupcake', '🧁', { tags: ['food', 'small'] }),
    food('juice', 'Juice box', '🧃', { tags: ['food', 'small'] }),
    food('cookie', 'Golden cookie', '🍪', { tags: ['food', 'small'] }),
    { id: 'petfood', name: 'Pet food', emoji: '🦴', w: 60, h: 60, tags: ['petfood', 'small'] },

    // ── Small props ───────────────────────────────────
    prop('plate', 'Plate', '🍽️', ['washable']),
    prop('cup', 'Cup', '☕', ['washable']),
    prop('toothbrush', 'Toothbrush', '🪥', ['brush']),
    prop('backpack', 'Backpack', '🎒', ['tool']),
    prop('book', 'Book', '📘', ['toy']),
    prop('teddy', 'Teddy bear', '🧸', ['toy'], { tap: { type: 'anim', anim: 'hop', sfx: 'pop', bubble: ['Hug me!', 'I love you!', 'Squishy!'] } }),
    prop('ball', 'Ball', '⚽', ['toy'], { tap: { type: 'roll', sfx: 'pop' } }),
    prop('yarn', 'Yarn ball', '🧶', ['toy']),
    prop('train', 'Toy train', '🚂', ['toy'], { tap: { type: 'roll', sfx: 'ring', bubble: ['Choo choo!', 'All aboard!'] } }),
    prop('paints', 'Paint set', '🎨', ['toy']),
    prop('duck', 'Rubber duck', '🦆', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'beep', bubble: ['Squeak!', 'Quack quack!'] } }),
    prop('balloon', 'Balloon', '🎈', ['toy', 'float'], { tap: { type: 'pop' } }),
    prop('drum', 'Drum', '🥁', ['toy'], { tap: { type: 'anim', anim: 'shake', sfx: 'bang', bubble: ['Boom boom!', 'Ba-dum tss!'] } }),
    prop('soap', 'Soap', '🧼', ['tool']),
    prop('clock', 'Alarm clock', '⏰', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'ring', bubble: ['Rise and shine!'] } }),
    prop('globe', 'Globe', '🌍', ['toy'], { tap: { type: 'anim', anim: 'spin', sfx: 'whoosh' } }),
    prop('bell', 'School bell', '🔔', ['tool'], { tap: { type: 'anim', anim: 'shake', sfx: 'ring', bubble: ['Class is starting!'] } }),
    prop('pencil', 'Pencils', '✏️', ['tool']),
    prop('ruler', 'Ruler', '📐', ['tool']),
    prop('thermometer', 'Thermometer', '🌡️', ['tool', 'medical'], { medical: 'thermometer' }),
    prop('stethoscope', 'Stethoscope', '🩺', ['tool', 'medical'], { medical: 'stethoscope' }),
    prop('bandage', 'Bandage', '🩹', ['tool', 'medical'], { medical: 'bandage' }),
    prop('gavel', 'Gavel', '🔨', ['tool'], { tap: { type: 'secret', secretId: 'gavel', taps: 5, anim: 'bang', sfx: 'bang' } }),
    prop('magnifier', 'Magnifying glass', '🔍', ['tool']),
    prop('folder', 'Case file', '📁', ['tool']),
    prop('scroll', 'Evidence note', '📜', ['tool']),
    prop('wrench', 'Wrench', '🔧', ['tool']),
    prop('gear', 'Gear', '⚙️', ['tool']),
    prop('toolbox', 'Toolbox', '🧰', ['tool']),
    prop('cookiejar', 'Cookie jar', '🫙', ['tool'], { fixed: true, tap: { type: 'secret', secretId: 'cookiejar', taps: 3, anim: 'shake', sfx: 'pop' } }),

    // ── Animal hospital & tech lab props ──────────────
    prop('petbrush', 'Pet brush', '🪮', ['tool', 'groom']),
    prop('keyboard', 'Keyboard', '⌨️', ['tool']),
    prop('headset', 'Headphones', '🎧', ['tool']),
    prop('floppy', 'Save disk', '💾', ['toy']),
    prop('minibot', 'Mini robot', '🤖', ['toy', 'decor'], { tap: { type: 'anim', anim: 'dance', sfx: 'beep', bubble: ['Beep boop!', 'Forward, turn, repeat!'] } }),

    // ── Building blocks (engineering free play) ───────
    { id: 'block-red', name: 'Red block', art: 'block', w: 90, h: 70, tags: ['block', 'small'], },
    { id: 'block-blue', name: 'Blue block', art: 'block', w: 90, h: 70, tags: ['block', 'small'] },
    { id: 'block-yellow', name: 'Yellow block', art: 'block', w: 90, h: 70, tags: ['block', 'small'] },
    { id: 'block-roof', name: 'Roof block', art: 'roofblock', w: 90, h: 60, tags: ['block', 'small'] },

    // ── Furniture: home ───────────────────────────────
    { id: 'fridge', name: 'Fridge', art: 'fridge', w: 165, h: 310, fixed: true, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['apple', 'banana', 'egg', 'milk', 'cheese', 'carrot', 'corn', 'batter', 'broccoli', 'cupcake', 'juice', 'petfood'] } },
    { id: 'stove', name: 'Stove', art: 'stove', w: 160, h: 175, fixed: true, tags: ['stove'] },
    { id: 'counter', name: 'Sink', art: 'kitchensink', w: 190, h: 175, fixed: true, tags: ['sink', 'table'] },
    { id: 'cupboard', name: 'Cupboard', art: 'cupboard', w: 230, h: 110, fixed: true, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['plate', 'cup', 'cupcake'] } },
    { id: 'table', name: 'Table', art: 'table', w: 280, h: 125, tags: ['table'] },
    { id: 'chair', name: 'Chair', art: 'chair', w: 90, h: 150, tags: ['seat'], seatLift: 62, tap: { type: 'anim', anim: 'spin', sfx: 'whoosh' } },
    { id: 'bed', name: 'Bed', art: 'bed', paint: pBed, w: 300, h: 263, tags: ['bed'], tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['So fluffy!', 'Boing boing!'] } },
    { id: 'closet', name: 'Closet', art: 'closet', paint: pCloset, w: 262, h: 250, fixed: true, tags: [], tap: { type: 'wardrobe' } },
    { id: 'toybox', name: 'Toy box', art: 'toybox', paint: pToybox, w: 170, h: 140, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['teddy', 'train', 'balloon', 'drum', ...TOY_IDS, 'paints', 'book', 'yarn'] } },
    { id: 'lamp', name: 'Lamp', art: 'lamp', paint: pLamp, w: 92, h: 200, tags: ['decor'], tap: { type: 'toggle', sfx: 'click' } },
    { id: 'tv', name: 'TV', art: 'tv', paint: pTv, w: 240, h: 160, tags: [], tap: { type: 'toggle', sfx: 'click' } },
    { id: 'window', name: 'Window', art: 'window', w: 200, h: 165, fixed: true, tags: [], tap: { type: 'toggle', sfx: 'whoosh' } },
    { id: 'rug', name: 'Rug', art: 'rug', paint: pRug, w: 300, h: 108, tags: ['floor'] },
    { id: 'couch', name: 'Couch', art: 'couch', paint: pCouch, w: 380, h: 144, tags: ['seat'], seatLift: 66, tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['Comfy!', 'Pillow fort time?'] } },
    { id: 'armchair', name: 'Armchair', art: 'couch', paint: pArmchair, w: 170, h: 146, tags: ['seat'], seatLift: 64, tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['So soft!', 'My reading chair!'] } },
    { id: 'bookshelf', name: 'Bookshelf', art: 'bookshelf', paint: pBookshelf, w: 150, h: 280, fixed: true, tags: [],
      tap: { type: 'spawn', toggle: false, items: ['book', 'paints', 'clock'] } },
    { id: 'shower', name: 'Shower', art: 'shower', w: 190, h: 340, fixed: true, tags: ['shower'] },
    { id: 'toilet', name: 'Toilet', art: 'toilet', w: 115, h: 155, fixed: true, tags: ['seat'], seatLift: 58 },
    { id: 'bathsink', name: 'Bathroom sink', art: 'bathsink', w: 135, h: 185, fixed: true, tags: ['sink'],
      tap: { type: 'spawn', toggle: false, items: ['toothbrush', 'soap', 'duck'] } },
    { id: 'mirror', name: 'Mirror', art: 'mirror', w: 120, h: 150, fixed: true, tags: [], tap: { type: 'anim', anim: 'shine', sfx: 'sparkle', bubble: ['Looking great!', 'Who is that? It\'s you!'] } },
    { id: 'door', name: 'Door', art: 'door', paint: pDoor, w: 150, h: 275, fixed: true, tags: ['door'] },
    { id: 'door-pink', name: 'Door', art: 'door', paint: pDoorPink, w: 174, h: 275, fixed: true, tags: ['door'] },
    { id: 'lamp-pink', name: 'Table lamp', art: 'lamp', paint: pLampPink, w: 96, h: 143, tags: ['decor'], tap: { type: 'toggle', sfx: 'click' } },
    { id: 'studydesk', name: 'Study desk', art: 'desk', paint: pStudyDesk, w: 236, h: 217, tags: ['table', 'decor'], tap: { type: 'anim', anim: 'shake', sfx: 'pop', bubble: ['Homework time! ✏️', 'Let’s draw something!', 'So tidy!'] } },
    { id: 'secretspot', name: 'Sparkle', art: 'sparkle', w: 70, h: 50, fixed: true, tags: [],
      tap: { type: 'secret', secretId: 'underbed', taps: 1, sfx: 'sparkle' } },

    // ── Shop / reward decor ───────────────────────────
    { id: 'plant', name: 'Leafy plant', art: 'plant', paint: pPlant, w: 125, h: 123, tags: ['decor'], tap: { type: 'anim', anim: 'shake', sfx: 'whoosh', bubble: ['Rustle rustle', 'Thanks for the water!'] } },
    { id: 'beanbag', name: 'Beanbag', art: 'beanbag', w: 140, h: 100, tags: ['seat', 'decor'], seatLift: 38 },
    { id: 'fishbowl', name: 'Fishbowl', art: 'fishbowl', w: 110, h: 110, tags: ['decor'], tap: { type: 'anim', anim: 'shake', sfx: 'splash', bubble: ['Blub blub!'] } },
    { id: 'starrug', name: 'Star rug', art: 'starrug', w: 300, h: 70, tags: ['floor', 'decor'] },
    { id: 'rocketposter', name: 'Rocket poster', art: 'rocketposter', w: 130, h: 160, tags: ['decor', 'wall'] },
    { id: 'trophy', name: 'Gold trophy', emoji: '🏆', w: 80, h: 80, tags: ['small', 'decor'] },
    { id: 'petbed', name: 'Pet bed', art: 'petbed', w: 150, h: 70, tags: ['bed', 'decor'] },

    // ── Furniture: school ─────────────────────────────
    { id: 'chalkboard', name: 'Chalkboard', art: 'chalkboard', w: 440, h: 220, fixed: true, tags: [], tap: { type: 'custom', id: 'draw' } },
    { id: 'desk', name: 'Desk', art: 'desk', w: 170, h: 135, tags: ['seat', 'behind'], seatLift: 30 },
    { id: 'teacherdesk', name: 'Teacher desk', art: 'teacherdesk', w: 270, h: 140, tags: ['table'] },
    { id: 'schoolclock', name: 'Clock', art: 'wallclock', w: 100, h: 100, fixed: true, tags: [],
      tap: { type: 'secret', secretId: 'schoolclock', taps: 3, anim: 'spin', sfx: 'tick' } },

    // ── Furniture: hospital ───────────────────────────
    { id: 'exambed', name: 'Exam bed', art: 'exambed', w: 320, h: 160, tags: ['bed'] },
    { id: 'medcabinet', name: 'Supply cabinet', art: 'medcabinet', w: 165, h: 230, fixed: true, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['thermometer', 'stethoscope', 'bandage', 'juice', 'teddy'] } },
    { id: 'heartposter', name: 'Heart poster', art: 'heartposter', w: 140, h: 170, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'pulse', sfx: 'heartbeat', bubble: ['Your heart pumps blood all around your body!', 'A resting kid heart beats about 70–110 times a minute.'] } },

    // ── Furniture: courthouse ─────────────────────────
    { id: 'judgebench', name: 'Judge bench', art: 'judgebench', w: 400, h: 180, fixed: true, tags: ['seat', 'behind'], seatLift: 70 },
    { id: 'witnessstand', name: 'Witness stand', art: 'witnessstand', w: 175, h: 150, fixed: true, tags: ['seat', 'behind'], seatLift: 45 },
    { id: 'jurybox', name: 'Jury box', art: 'jurybox', w: 300, h: 135, fixed: true, tags: ['seat', 'behind'], seatLift: 35 },
    { id: 'lawtable', name: 'Lawyer table', art: 'lawtable', w: 250, h: 120, tags: ['table'] },
    { id: 'scales', name: 'Scales sign', art: 'scales', w: 130, h: 130, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'tilt', sfx: 'click', bubble: ['Fair means listening to every side.'] } },

    // ── Furniture: animal hospital ────────────────────
    { id: 'petcabinet', name: 'Pet supplies', art: 'medcabinet', w: 165, h: 230, fixed: true, tags: [],
      tap: { type: 'spawn', toggle: true, items: ['stethoscope', 'thermometer', 'bandage', 'petbrush', 'petfood', 'carrot', 'ball', 'yarn'] } },
    { id: 'pawposter', name: 'Paw poster', art: 'pawposter', w: 140, h: 170, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'pulse', sfx: 'pop', bubble: ['Pets need food, water, exercise, sleep and love.', 'Bunnies’ teeth never stop growing! Hay keeps them short.'] } },

    // ── Furniture: tech lab ───────────────────────────
    { id: 'computer', name: 'Computer', art: 'computer', w: 230, h: 190, tags: [], tap: { type: 'toggle', sfx: 'beep' } },
    { id: 'serverrack', name: 'Server rack', art: 'serverrack', w: 140, h: 270, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'pulse', sfx: 'beep', bubble: ['Servers are computers that store websites and games.'] } },
    { id: 'codeposter', name: 'Code poster', art: 'codeposter', w: 230, h: 160, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'shine', sfx: 'click', bubble: ['Computers follow steps in order. That’s a sequence!', 'A loop repeats steps so you don’t have to write them again.'] } },

    // ── Furniture: engineering lab ────────────────────
    { id: 'workbench', name: 'Workbench', art: 'workbench', w: 310, h: 145, tags: ['table'] },
    { id: 'blueprint', name: 'Blueprint board', art: 'blueprint', w: 250, h: 170, fixed: true, tags: [],
      tap: { type: 'anim', anim: 'shine', sfx: 'click', bubble: ['Ask → Imagine → Plan → Build → Test → Improve!'] } },
    { id: 'robot', name: 'Robot helper', art: 'robot', w: 120, h: 165, tags: [],
      tap: { type: 'secret', secretId: 'robot', taps: 3, anim: 'dance', sfx: 'beep' } },
    { id: 'blockbin', name: 'Block bin', art: 'blockbin', w: 170, h: 110, fixed: true, tags: [],
      tap: { type: 'spawn', toggle: false, items: ['block-red', 'block-blue', 'block-yellow', 'block-roof'] } },
    // ── Hand-drawn accessories & toys ────────────────
    ...ACCESSORIES.map((a): ItemDef => ({ id: a.id, name: a.name, img: a.img, w: a.w, h: a.h, wear: a.wear, tags: a.food ? ['food', 'small'] : a.toy ? ['small', 'toy'] : ['small'] })),
  ] as ItemDef[]).map((d) => [d.id, d]),
);

export const has = (def: ItemDef | undefined, tag: ItemTag) => !!def && def.tags.includes(tag);
