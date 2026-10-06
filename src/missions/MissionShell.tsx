import type { ReactNode } from 'react';
import { MISSIONS } from '../data/missions';
import { Btn } from '../ui/kit';

export function MissionShell({ id, step, steps, onExit, children, color = '#FFC93C' }: {
  id: string; step: number; steps: string[]; onExit: () => void; children: ReactNode; color?: string;
}) {
  const m = MISSIONS[id];
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 pb-2 flex items-center gap-3">
        <Btn tone="white" onClick={onExit} aria-label="Leave mission" className="!px-3">✕</Btn>
        <div className="min-w-0">
          <div className="font-display font-extrabold text-ink text-lg sm:text-2xl truncate">{m.title}</div>
        </div>
        <div className="flex-1" />
        <ol className="hidden sm:flex items-center gap-1" aria-label="Mission steps">
          {steps.map((s, i) => (
            <li key={s} title={s} className={`h-9 min-w-9 px-2 rounded-full border-[3px] border-ink grid place-items-center font-display font-bold text-sm ${i < step ? 'bg-mint text-ink' : i === step ? 'text-ink' : 'bg-white text-ink/40'}`} style={i === step ? { background: color } : undefined}>
              {i === step ? s : i + 1}
            </li>
          ))}
        </ol>
        <div className="sm:hidden rounded-full border-[3px] border-ink bg-white px-3 py-1 font-display font-bold text-ink">{steps[step]} {step + 1}/{steps.length}</div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto px-3 pb-4">{children}</div>
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
