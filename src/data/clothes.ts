/** Recolour layers for hand-drawn characters. The YunaVerse family are now vector dress-up
 *  characters (data/doll.ts), so no hand-drawn clothes layers remain. */
export type ClothesPart = 'top' | 'bottom';
export const CLOTHES: Record<string, Record<ClothesPart, Record<string, string>>> = {};

export const TOP_SWATCHES: Record<string, string> = {pink: '#F7A1C4', lavender: '#B9A3F0', mint: '#7FD8B5', sky: '#8EC9F5', yellow: '#FFD45C', red: '#E2483B', black: '#3A3A42', white: '#F4F1EC'};
export const BOTTOM_SWATCHES: Record<string, string> = {denim: '#6E95DB', black: '#34343C', beige: '#D8C3A0', pink: '#F2A7C3', white: '#EEEAE2', olive: '#8A9A6B', lavender: '#B9A3F0'};
