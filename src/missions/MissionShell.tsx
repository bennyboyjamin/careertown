import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { MISSIONS } from '../data/missions';
import { Btn } from '../ui/kit';

export function MissionShell({ id, step, steps, onExit, children, color = '#FFC93C' }: {
  id: string; step: number; steps: string[]; onExit: () => void; children: ReactNode; color?: string;
}) {
  const m = MISSIONS[id];
  const body = useRef<HTMLDivElement>(null);
  return (
    <div className="h-full flex flex-col">
      <div className="mission-head px-3 pb-2 flex items-center gap-3">
        <Btn tone="white" onClick={onExit} aria-label="Leave mission" className="!px-3 shrink-0">✕ Leave</Btn>
        <div className="min-w-0">
          <div className="font-display font-extrabold text-ink text-lg sm:text-2xl truncate">{m.title}</div>
        </div>
        <div className="flex-1" />
        <ReadAloud target={body} />
        <ol className="hidden sm:flex items-center gap-1" aria-label="Mission steps">
          {steps.map((s, i) => (
            <li key={s} title={s} className={`h-9 min-w-9 px-2 rounded-full border-[3px] border-ink grid place-items-center font-display font-bold text-sm ${i < step ? 'bg-mint text-ink' : i === step ? 'text-ink' : 'bg-white text-ink/40'}`} style={i === step ? { background: color } : undefined}>
              {i === step ? s : i + 1}
            </li>
          ))}
        </ol>
        <div className="sm:hidden rounded-full border-[3px] border-ink bg-white px-3 py-1 font-display font-bold text-ink">{steps[step]} {step + 1}/{steps.length}</div>
      </div>
      <div ref={body} className="flex-1 min-h-0 overflow-auto px-3 pb-4"><div className="mission-body">{children}</div></div>
    </div>
  );
}

export function Panel({ children, className = '', tone = 'bg-white' }: { children: ReactNode; className?: string; tone?: string }) {
  return <div className={`rounded-[26px] border-[4px] border-ink shadow-chunky p-4 sm:p-6 ${tone} ${className}`}>{children}</div>;
}

export function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className={`feedback-in mt-3 rounded-2xl border-[3px] border-ink px-4 py-3 font-body text-ink text-base sm:text-lg ${ok ? 'bg-mint' : 'bg-[#FFE0E8]'}`}>
      <span className="mr-2 text-xl">{ok ? '🎉' : '🤔'}</span>{children}
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return <div className="text-5xl tracking-widest" aria-label={`${n} of 3 stars`}>{[0, 1, 2].map((i) => <span key={i} className={i < n ? 'star-pop inline-block' : 'opacity-25 grayscale inline-block'} style={{ animationDelay: `${i * 0.15}s` }}>⭐</span>)}</div>;
}

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/** Reads the mission's headings, instructions and feedback aloud with the device's own voice (works offline). */
function ReadAloud({ target }: { target: RefObject<HTMLDivElement | null> }) {
  const [on, setOn] = useState(false);
  useEffect(() => () => { if (canSpeak()) window.speechSynthesis.cancel(); }, []);
  if (!canSpeak()) return null;
  const read = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    if (on) { setOn(false); return; }
    const el = target.current;
    if (!el) return;
    const text = [...el.querySelectorAll('h2, p, .feedback-in, li')]
      .filter((n) => !n.closest('button') && (n as HTMLElement).offsetParent !== null)
      .map((n) => (n.textContent ?? '').trim()).filter(Boolean).join('. ');
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.92; u.pitch = 1.05;
    u.onend = u.onerror = () => setOn(false);
    setOn(true);
    synth.speak(u);
  };
  return (
    <button onClick={read} aria-pressed={on} aria-label={on ? 'Stop reading' : 'Read to me'}
      className="read-btn shrink-0 h-11 px-3 rounded-2xl border-[3px] border-ink bg-white shadow-chunkysm font-display font-bold text-ink">
      {on ? '⏹️' : '🔊'}<span className="hidden sm:inline ml-1">{on ? 'Stop' : 'Read to me'}</span>
    </button>
  );
}
