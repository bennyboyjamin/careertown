import type { DollLook } from '../engine/types';

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
