import { useState } from 'react';
import { Btn } from '../ui/kit';
import { Panel, Feedback } from './MissionShell';
import { sfx } from '../engine/sfx';

/** One question: a picture/text and a few answers, then a short “why”. */
export interface QuizItem { icon?: string; text: string; options: { label: string; ok: boolean }[]; why: string }

/** A mission step made of quick questions (safe/not safe, which choice is kind, …). */
export function QuizStep({ title, intro, items, finish, onDone }: { title: string; intro: string; items: QuizItem[]; finish: string; onDone: (right: number) => void }) {
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [right, setRight] = useState(0);
  const q = items[i];
  const answer = (ok: boolean) => {
    if (msg) return;
    if (ok) setRight(right + 1);
    sfx(ok ? 'success' : 'fail');
    setMsg({ ok, text: `${ok ? 'Yes!' : 'Not quite.'} ${q.why}` });
  };
  const next = () => { setMsg(null); if (i + 1 < items.length) setI(i + 1); else onDone(right); };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">{title} ({i + 1} of {items.length})</h2>
      <p className="font-body text-ink text-lg mt-1">{intro}</p>
      <div className="mt-3 rounded-2xl border-[3px] border-ink bg-sky/25 px-4 py-4 text-center">
        {q.icon && <div style={{ fontSize: 48, lineHeight: 1.1 }}>{q.icon}</div>}
        <div className="font-display font-bold text-ink text-2xl">{q.text}</div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {q.options.map((o) => <Btn key={o.label} tone="white" onClick={() => answer(o.ok)}>{o.label}</Btn>)}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {msg && <div className="mt-3"><Btn tone="sun" onClick={next}>{i + 1 < items.length ? 'Next →' : `${finish} →`}</Btn></div>}
    </Panel>
  );
}

export const YES_NO = (yes: string, no: string, isYes: boolean) => [{ label: yes, ok: isYes }, { label: no, ok: !isYes }];
