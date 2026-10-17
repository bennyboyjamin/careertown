/**
 * The game's two fonts ship with the game (no Google Fonts request): it works offline in the
 * iPhone/iPad app and doesn't share players' IP addresses with anyone. Both fonts are under the
 * SIL Open Font License (see assets/fonts/OFL-*.txt). Trimmed to Latin letters and punctuation.
 */
import lexend from './assets/fonts/lexend.woff';
import grandstander from './assets/fonts/grandstander.woff';

const FONTS: [string, string, string][] = [['Lexend', lexend, '100 900'], ['Grandstander', grandstander, '100 900']];

export function loadFonts() {
  if (typeof FontFace === 'undefined' || !document.fonts) return;
  for (const [family, url, weight] of FONTS) {
    const face = new FontFace(family, `url(${url}) format("woff")`, { weight, display: 'swap' });
    document.fonts.add(face);
    face.load().catch(() => { /* falls back to the system rounded font */ });
  }
}
