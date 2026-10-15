/** Recolorable clothes layers for the hand-drawn family (generated). Each image is the size of the body art. */
import yuna_t_pink from '../assets/clothes/yuna-top-pink.webp';
import yuna_t_lavender from '../assets/clothes/yuna-top-lavender.webp';
import yuna_t_mint from '../assets/clothes/yuna-top-mint.webp';
import yuna_t_sky from '../assets/clothes/yuna-top-sky.webp';
import yuna_t_yellow from '../assets/clothes/yuna-top-yellow.webp';
import yuna_t_red from '../assets/clothes/yuna-top-red.webp';
import yuna_t_black from '../assets/clothes/yuna-top-black.webp';
import yuna_t_white from '../assets/clothes/yuna-top-white.webp';
import yuna_b_denim from '../assets/clothes/yuna-bottom-denim.webp';
import yuna_b_black from '../assets/clothes/yuna-bottom-black.webp';
import yuna_b_beige from '../assets/clothes/yuna-bottom-beige.webp';
import yuna_b_pink from '../assets/clothes/yuna-bottom-pink.webp';
import yuna_b_white from '../assets/clothes/yuna-bottom-white.webp';
import yuna_b_olive from '../assets/clothes/yuna-bottom-olive.webp';
import yuna_b_lavender from '../assets/clothes/yuna-bottom-lavender.webp';
import natalie_t_pink from '../assets/clothes/natalie-top-pink.webp';
import natalie_t_lavender from '../assets/clothes/natalie-top-lavender.webp';
import natalie_t_mint from '../assets/clothes/natalie-top-mint.webp';
import natalie_t_sky from '../assets/clothes/natalie-top-sky.webp';
import natalie_t_yellow from '../assets/clothes/natalie-top-yellow.webp';
import natalie_t_red from '../assets/clothes/natalie-top-red.webp';
import natalie_t_black from '../assets/clothes/natalie-top-black.webp';
import natalie_t_white from '../assets/clothes/natalie-top-white.webp';
import natalie_b_denim from '../assets/clothes/natalie-bottom-denim.webp';
import natalie_b_black from '../assets/clothes/natalie-bottom-black.webp';
import natalie_b_beige from '../assets/clothes/natalie-bottom-beige.webp';
import natalie_b_pink from '../assets/clothes/natalie-bottom-pink.webp';
import natalie_b_white from '../assets/clothes/natalie-bottom-white.webp';
import natalie_b_olive from '../assets/clothes/natalie-bottom-olive.webp';
import natalie_b_lavender from '../assets/clothes/natalie-bottom-lavender.webp';
import brother_t_pink from '../assets/clothes/brother-top-pink.webp';
import brother_t_lavender from '../assets/clothes/brother-top-lavender.webp';
import brother_t_mint from '../assets/clothes/brother-top-mint.webp';
import brother_t_sky from '../assets/clothes/brother-top-sky.webp';
import brother_t_yellow from '../assets/clothes/brother-top-yellow.webp';
import brother_t_red from '../assets/clothes/brother-top-red.webp';
import brother_t_black from '../assets/clothes/brother-top-black.webp';
import brother_t_white from '../assets/clothes/brother-top-white.webp';
import brother_b_denim from '../assets/clothes/brother-bottom-denim.webp';
import brother_b_black from '../assets/clothes/brother-bottom-black.webp';
import brother_b_beige from '../assets/clothes/brother-bottom-beige.webp';
import brother_b_pink from '../assets/clothes/brother-bottom-pink.webp';
import brother_b_white from '../assets/clothes/brother-bottom-white.webp';
import brother_b_olive from '../assets/clothes/brother-bottom-olive.webp';
import brother_b_lavender from '../assets/clothes/brother-bottom-lavender.webp';
import nene_t_pink from '../assets/clothes/nene-top-pink.webp';
import nene_t_lavender from '../assets/clothes/nene-top-lavender.webp';
import nene_t_mint from '../assets/clothes/nene-top-mint.webp';
import nene_t_sky from '../assets/clothes/nene-top-sky.webp';
import nene_t_yellow from '../assets/clothes/nene-top-yellow.webp';
import nene_t_red from '../assets/clothes/nene-top-red.webp';
import nene_t_black from '../assets/clothes/nene-top-black.webp';
import nene_t_white from '../assets/clothes/nene-top-white.webp';
import mom_t_pink from '../assets/clothes/mom-top-pink.webp';
import mom_t_lavender from '../assets/clothes/mom-top-lavender.webp';
import mom_t_mint from '../assets/clothes/mom-top-mint.webp';
import mom_t_sky from '../assets/clothes/mom-top-sky.webp';
import mom_t_yellow from '../assets/clothes/mom-top-yellow.webp';
import mom_t_red from '../assets/clothes/mom-top-red.webp';
import mom_t_black from '../assets/clothes/mom-top-black.webp';
import mom_t_white from '../assets/clothes/mom-top-white.webp';
import mom_b_denim from '../assets/clothes/mom-bottom-denim.webp';
import mom_b_black from '../assets/clothes/mom-bottom-black.webp';
import mom_b_beige from '../assets/clothes/mom-bottom-beige.webp';
import mom_b_pink from '../assets/clothes/mom-bottom-pink.webp';
import mom_b_white from '../assets/clothes/mom-bottom-white.webp';
import mom_b_olive from '../assets/clothes/mom-bottom-olive.webp';
import mom_b_lavender from '../assets/clothes/mom-bottom-lavender.webp';
import dad_t_pink from '../assets/clothes/dad-top-pink.webp';
import dad_t_lavender from '../assets/clothes/dad-top-lavender.webp';
import dad_t_mint from '../assets/clothes/dad-top-mint.webp';
import dad_t_sky from '../assets/clothes/dad-top-sky.webp';
import dad_t_yellow from '../assets/clothes/dad-top-yellow.webp';
import dad_t_red from '../assets/clothes/dad-top-red.webp';
import dad_t_black from '../assets/clothes/dad-top-black.webp';
import dad_t_white from '../assets/clothes/dad-top-white.webp';
import dad_b_denim from '../assets/clothes/dad-bottom-denim.webp';
import dad_b_black from '../assets/clothes/dad-bottom-black.webp';
import dad_b_beige from '../assets/clothes/dad-bottom-beige.webp';
import dad_b_pink from '../assets/clothes/dad-bottom-pink.webp';
import dad_b_white from '../assets/clothes/dad-bottom-white.webp';
import dad_b_olive from '../assets/clothes/dad-bottom-olive.webp';
import dad_b_lavender from '../assets/clothes/dad-bottom-lavender.webp';

export type ClothesPart = 'top' | 'bottom';
export const CLOTHES: Record<string, Record<ClothesPart, Record<string, string>>> = {
  yuna: { top: { pink: yuna_t_pink, lavender: yuna_t_lavender, mint: yuna_t_mint, sky: yuna_t_sky, yellow: yuna_t_yellow, red: yuna_t_red, black: yuna_t_black, white: yuna_t_white }, bottom: { denim: yuna_b_denim, black: yuna_b_black, beige: yuna_b_beige, pink: yuna_b_pink, white: yuna_b_white, olive: yuna_b_olive, lavender: yuna_b_lavender } },
  natalie: { top: { pink: natalie_t_pink, lavender: natalie_t_lavender, mint: natalie_t_mint, sky: natalie_t_sky, yellow: natalie_t_yellow, red: natalie_t_red, black: natalie_t_black, white: natalie_t_white }, bottom: { denim: natalie_b_denim, black: natalie_b_black, beige: natalie_b_beige, pink: natalie_b_pink, white: natalie_b_white, olive: natalie_b_olive, lavender: natalie_b_lavender } },
  brother: { top: { pink: brother_t_pink, lavender: brother_t_lavender, mint: brother_t_mint, sky: brother_t_sky, yellow: brother_t_yellow, red: brother_t_red, black: brother_t_black, white: brother_t_white }, bottom: { denim: brother_b_denim, black: brother_b_black, beige: brother_b_beige, pink: brother_b_pink, white: brother_b_white, olive: brother_b_olive, lavender: brother_b_lavender } },
  nene: { top: { pink: nene_t_pink, lavender: nene_t_lavender, mint: nene_t_mint, sky: nene_t_sky, yellow: nene_t_yellow, red: nene_t_red, black: nene_t_black, white: nene_t_white }, bottom: {  } },
  mom: { top: { pink: mom_t_pink, lavender: mom_t_lavender, mint: mom_t_mint, sky: mom_t_sky, yellow: mom_t_yellow, red: mom_t_red, black: mom_t_black, white: mom_t_white }, bottom: { denim: mom_b_denim, black: mom_b_black, beige: mom_b_beige, pink: mom_b_pink, white: mom_b_white, olive: mom_b_olive, lavender: mom_b_lavender } },
  dad: { top: { pink: dad_t_pink, lavender: dad_t_lavender, mint: dad_t_mint, sky: dad_t_sky, yellow: dad_t_yellow, red: dad_t_red, black: dad_t_black, white: dad_t_white }, bottom: { denim: dad_b_denim, black: dad_b_black, beige: dad_b_beige, pink: dad_b_pink, white: dad_b_white, olive: dad_b_olive, lavender: dad_b_lavender } },
};

export const TOP_SWATCHES: Record<string, string> = {pink: '#F7A1C4', lavender: '#B9A3F0', mint: '#7FD8B5', sky: '#8EC9F5', yellow: '#FFD45C', red: '#E2483B', black: '#3A3A42', white: '#F4F1EC'};
export const BOTTOM_SWATCHES: Record<string, string> = {denim: '#6E95DB', black: '#34343C', beige: '#D8C3A0', pink: '#F2A7C3', white: '#EEEAE2', olive: '#8A9A6B', lavender: '#B9A3F0'};
