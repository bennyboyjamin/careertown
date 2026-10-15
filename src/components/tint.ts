import { useEffect, useState } from 'react';

/** Recolour a picture at runtime, keeping its shading (used for hair, eyes and the basic tee/shorts). */
const done = new Map<string, string>();
const busy = new Map<string, Promise<string>>();

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function tintURL(src: string, hex: string): Promise<string> {
  const key = `${src}|${hex}`;
  const hit = done.get(key); if (hit) return Promise.resolve(hit);
  const run = busy.get(key); if (run) return run;
  const p = new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const g = c.getContext('2d')!; g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height); const px = d.data;
        const hist = new Uint32Array(256); let n = 0;
        for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 128) { hist[Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2])]++; n++; }
        let acc = 0, ref = 128;
        for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= n * 0.6) { ref = Math.max(v, 1); break; } }
        const T = hexRgb(hex);
        for (let i = 0; i < px.length; i += 4) {
          if (!px[i + 3]) continue;
          const r = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / ref;
          const lo = Math.min(r, 1), hi = px[i + 3] < 230 ? 0 : Math.max(0, Math.min((r - 1) * 0.55, 0.6));
          for (let k = 0; k < 3; k++) px[i + k] = Math.max(0, Math.min(255, T[k] * lo + (255 - T[k]) * hi));
        }
        g.putImageData(d, 0, 0);
        const url = c.toDataURL('image/png'); done.set(key, url); resolve(url);
      } catch { resolve(src); }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
  busy.set(key, p);
  return p;
}

/** The recoloured picture (or the original while it is being made / when no colour is given). */
export function useTint(src: string, hex?: string): string {
  const key = hex ? `${src}|${hex}` : '';
  const [url, setUrl] = useState(() => (hex ? done.get(key) : undefined) ?? src);
  useEffect(() => {
    if (!hex) { setUrl(src); return; }
    const hit = done.get(key); if (hit) { setUrl(hit); return; }
    let live = true; void tintURL(src, hex).then((u) => live && setUrl(u));
    return () => { live = false; };
  }, [src, hex, key]);
  return url;
}
