import { useEffect, useState } from 'react';
import { useGame } from '../engine/store';
import { sfx } from '../engine/sfx';

type Reply = { ok?: boolean; error?: string; denied?: boolean };
type Handler = { postMessage: (m: unknown) => Promise<Reply> };
const photoHandler = (): Handler | undefined => (window as unknown as { webkit?: { messageHandlers?: { photo?: Handler } } }).webkit?.messageHandlers?.photo;

const FRAMES = [
  { id: 'stars', label: '⭐ Stars', deco: ['⭐', '✨', '⭐', '✨'] },
  { id: 'hearts', label: '💖 Hearts', deco: ['💖', '💕', '💖', '💕'] },
  { id: 'flowers', label: '🌸 Flowers', deco: ['🌸', '🌼', '🌷', '🌸'] },
  { id: 'none', label: 'No frame', deco: [] },
];

/**
 * Photo mode: the buttons hide so the room looks like a picture. Kids can still drag characters to pose them.
 * In the iPhone/iPad app, “Take photo” saves the picture to Photos; on the website it explains how to take a screenshot.
 */
export function PhotoMode({ title, onClose }: { title: string; onClose: () => void }) {
  const { dispatch } = useGame();
  const [frame, setFrame] = useState(0);
  const [shooting, setShooting] = useState(false);
  const [flash, setFlash] = useState(false);
  useEffect(() => { document.body.classList.add('photo-mode'); return () => document.body.classList.remove('photo-mode'); }, []);
  const f = FRAMES[frame];
  const date = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const shoot = async () => {
    setShooting(true); sfx('click');
    await new Promise((r) => window.setTimeout(r, 120));   // let the buttons hide first
    const h = photoHandler();
    let text: string;
    if (h) {
      const r: Reply = await h.postMessage({ action: 'save' }).catch((e) => ({ error: String(e) }));
      text = r.ok ? 'Saved to your Photos! 📸' : r.denied ? 'Ask a grown-up to let CareerTown save photos (Settings › CareerTown › Photos).' : 'The photo couldn’t be saved. Try again?';
    } else {
      text = 'Take a screenshot to keep this picture! 📸';
    }
    setFlash(true); sfx('sparkle');
    window.setTimeout(() => setFlash(false), 450);
    setShooting(false);
    dispatch({ type: 'OWN', id: 'did:photo' });
    dispatch({ type: 'TOAST', text });
  };

  return (
    <>
      <div className={`photo-frame frame-${f.id}`} aria-hidden>
        {f.deco.map((d, i) => <span key={i} className={`photo-deco d${i}`}>{d}</span>)}
        <div className="photo-caption">CareerTown · {title} · {date}</div>
      </div>
      {flash && <div className="photo-flash" aria-hidden />}
      {!shooting && (
        <div className="photo-bar">
          <span className="photo-tip">Drag characters to pose them</span>
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={() => { sfx('tap'); setFrame((frame + 1) % FRAMES.length); }} className="photo-btn">🖼️ {f.label}</button>
            <button onClick={shoot} className="photo-btn shoot">📸 Take photo</button>
            <button onClick={() => { sfx('tap'); onClose(); }} className="photo-btn">✕ Done</button>
          </div>
        </div>
      )}
    </>
  );
}
