import type { GameState } from '../engine/types';
import { WORKERS } from './workers';
import { TOWNFOLK } from './townfolk';

/** Sticker book: one new sticker for each day you play, plus special stickers for things you do. */
export interface Sticker { id: string; icon: string; name: string; how?: string }

export const DAILY_STICKERS: Sticker[] = [
  ['rainbow', '🌈', 'Rainbow'], ['unicorn', '🦄', 'Unicorn'], ['rocket', '🚀', 'Rocket'], ['cupcake', '🧁', 'Cupcake'], ['sun', '🌞', 'Happy sun'],
  ['panda', '🐼', 'Panda'], ['star', '⭐', 'Gold star'], ['dino', '🦖', 'Dino'], ['icecream', '🍦', 'Ice cream'], ['butterfly', '🦋', 'Butterfly'],
  ['planet', '🪐', 'Planet'], ['bunny', '🐰', 'Bunny'], ['crown', '👑', 'Crown'], ['flower', '🌸', 'Blossom'], ['dolphin', '🐬', 'Dolphin'],
  ['donut', '🍩', 'Donut'], ['robot', '🤖', 'Robot'], ['heart', '💖', 'Sparkle heart'], ['owl', '🦉', 'Owl'], ['balloon', '🎈', 'Balloon'],
  ['penguin', '🐧', 'Penguin'], ['strawberry', '🍓', 'Strawberry'], ['guitar', '🎸', 'Guitar'], ['fox', '🦊', 'Fox'], ['moon', '🌙', 'Moon'],
  ['cat', '🐱', 'Kitty'], ['palette', '🎨', 'Paints'], ['whale', '🐳', 'Whale'], ['cherry', '🍒', 'Cherries'], ['trophy', '🏆', 'Trophy'],
].map(([id, icon, name]) => ({ id: `day-${id}`, icon, name }));

export const SPECIAL_STICKERS: (Sticker & { got: (g: GameState) => boolean })[] = [
  { id: 'sp-first-mission', icon: '🎖️', name: 'First mission', how: 'Finish any career mission', got: (g) => Object.keys(g.completedMissions).length >= 1 },
  { id: 'sp-five-missions', icon: '🥇', name: 'Mission master', how: 'Finish 5 different missions', got: (g) => Object.keys(g.completedMissions).length >= 5 },
  { id: 'sp-workers', icon: '💬', name: 'Good listener', how: 'Talk to the worker in every building', got: (g) => Object.keys(WORKERS).every((b) => g.owned.includes(`talk:${b}`)) },
  { id: 'sp-townfolk', icon: '🤝', name: 'Town helper', how: 'Help every town person find their things', got: (g) => Object.keys(TOWNFOLK).every((b) => g.owned.includes(`visit:${b}`)) },
  { id: 'sp-photo', icon: '📸', name: 'Photographer', how: 'Take a photo in photo mode', got: (g) => g.owned.includes('did:photo') },
  { id: 'sp-playdate', icon: '👯', name: 'Best buddies', how: 'Have a playdate with a friend', got: (g) => g.owned.includes('did:playdate') },
  { id: 'sp-night', icon: '🌙', name: 'Night owl', how: 'Visit town at night', got: (g) => g.owned.includes('did:night') },
  { id: 'sp-week', icon: '📅', name: 'One whole week', how: 'Collect 7 daily stickers', got: (g) => (g.stickers ?? []).filter((s) => s.startsWith('day-')).length >= 7 },
  { id: 'sp-rich', icon: '💰', name: 'Coin collector', how: 'Have 200 coins at once', got: (g) => g.coins >= 200 },
];

export const ALL_STICKERS: Sticker[] = [...DAILY_STICKERS, ...SPECIAL_STICKERS];
export const stickerById = (id: string) => ALL_STICKERS.find((s) => s.id === id);
/** The next daily sticker you don't have yet (they come in order, then repeat as “extra” days). */
export const nextDailySticker = (have: string[]) => DAILY_STICKERS.find((s) => !have.includes(s.id));
