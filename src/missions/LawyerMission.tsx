import { useState } from 'react';
import { useGame } from '../engine/store';
import { Person } from '../components/Person';
import { npc } from '../data/dollLooks';
import { DragChip } from '../ui/DragChip';
import { Btn, Modal } from '../ui/kit';
import { MissionShell, Panel, Feedback, Stars } from './MissionShell';
import { sfx } from '../engine/sfx';

// ── Case data (fictional, playful, no real-world law) ─────
const PEOPLE: Record<string, { name: string }> = {
  ava: { name: 'Ava' }, ben: { name: 'Ben' }, chloe: { name: 'Chloe' }, judge: { name: 'Judge Marigold' },
};

const STATEMENTS = [
  { who: 'ava', text: 'At 3:10 I saw Ben walk past the trophy case holding something shiny. Ben is always showing off, so I think he took it.' },
  { who: 'ben', text: 'I didn’t take it! I was at soccer practice from 3:00 to 4:00. The shiny thing was my new silver water bottle.' },
  { who: 'chloe', text: 'I was in the art room all afternoon making our science fair poster. I never went near the trophy case. The trophy is the prettiest thing in the school.' },
];

const EVIDENCE = [
  { id: 'signin', icon: '📋', title: 'Soccer sign-in sheet', detail: 'Ben signed in at 2:58 PM. Coach wrote: “Ben stayed until 4:00. Great goalie!”' },
  { id: 'bottle', icon: '🥤', title: 'Ben’s water bottle', detail: 'A shiny silver bottle with BEN written on it in marker.' },
  { id: 'glitter', icon: '✨', title: 'Glitter trail', detail: 'Gold glitter on the empty trophy shelf. The sparkly trail goes down the hall… right to the art room door.' },
  { id: 'poster', icon: '🖼️', title: 'Science fair poster', detail: 'A poster from the art room with a big drawing of the trophy, covered in gold glitter.' },
];

const SORT = [
  { text: 'Ben signed in at soccer at 2:58 PM.', fact: true },
  { text: 'Ben is always showing off.', fact: false },
  { text: 'There is gold glitter on the trophy shelf.', fact: true },
  { text: 'The trophy is the prettiest thing in the school.', fact: false },
  { text: 'Ben’s water bottle is silver.', fact: true },
  { text: 'I think Ben took it.', fact: false },
];

const QUESTIONS = [
  { to: 'ava', q: 'What did the shiny thing look like?', a: 'Um… it was silver and shaped like a bottle. The trophy is gold.', helpful: true },
  { to: 'chloe', q: 'Why is there gold glitter on the trophy shelf?', a: 'Oh… I borrowed the trophy so I could draw it for our poster. I forgot to ask first. It’s in the art room!', helpful: true, key: true },
  { to: 'ben', q: 'What position do you play in soccer?', a: 'I’m the goalie!', helpful: false },
  { to: 'ava', q: 'What is your favorite color?', a: 'Purple!', helpful: false },
];

const ARG = {
  claim: ['Ben did not take the trophy.', 'Ava is being mean.', 'Trophies are shiny.'],
  evidence: ['Ben signed in at soccer at 2:58 and stayed until 4:00.', 'Ben likes soccer a lot.', 'The trophy is very pretty.'],
  reasoning: ['Ben couldn’t be at soccer and at the trophy case at the same time, and the shiny thing Ava saw was his silver bottle.', 'Because I said so.', 'Glitter is sparkly.'],
};

const STEPS = ['Case', 'Witnesses', 'Evidence', 'Fact or opinion', 'Contradiction', 'Questions', 'Best evidence', 'Argument', 'Verdict'];

function Portrait({ who, size = 'w-20 h-28' }: { who: string; size?: string }) {
  return <div className={`${size} shrink-0 rounded-2xl border-[3px] border-ink bg-[#E6DDF8] overflow-hidden`}><div className="w-full" style={{ aspectRatio: who === 'judge' ? '384 / 881' : '384 / 780', marginTop: '-6%' }}><Person c={npc(who, PEOPLE[who].name)} mood="happy" /></div></div>;
}

export function LawyerMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [heard, setHeard] = useState<string[]>([]);
  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [sorted, setSorted] = useState<Record<number, 'fact' | 'opinion'>>({});
  const [armed, setArmed] = useState<number | null>(null);
  const [asked, setAsked] = useState<number[]>([]);
  const [arg, setArg] = useState<{ claim?: number; evidence?: number; reasoning?: number }>({});

  const oops = (text: string) => { setMistakes((m) => m + 1); setMsg({ ok: false, text }); sfx('fail'); };
  const good = (text: string) => { setMsg({ ok: true, text }); sfx('success'); };
  const next = () => { setMsg(null); setStep((s) => s + 1); sfx('pop'); };

  const sortCard = (i: number, bin: string | null) => {
    setArmed(null);
    if (bin !== 'fact' && bin !== 'opinion') return;
    const right = SORT[i].fact === (bin === 'fact');
    if (right) { setSorted((s) => ({ ...s, [i]: bin })); sfx('pop'); setMsg(null); }
    else oops(SORT[i].fact ? 'Can we check or prove it? Then it’s a fact.' : 'That’s what someone thinks or feels. That makes it an opinion.');
  };
  const allSorted = Object.keys(sorted).length === SORT.length;
  const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;

  return (
    <MissionShell id="lawyer-trophy" step={step} steps={STEPS} onExit={onExit} color="#A98BFF">
      <div className="mx-auto max-w-4xl">
        {step === 0 && (
          <Panel tone="bg-[#E6DDF8]">
            <div className="flex gap-4 items-start">
              <Portrait who="judge" size="w-24 h-32" />
              <div>
                <h2 className="font-display text-3xl font-extrabold text-ink">The Missing Science Trophy</h2>
                <p className="font-body text-ink text-lg mt-2">On Tuesday afternoon the golden science trophy disappeared from the school trophy case. Some students think Ben took it.</p>
                <p className="font-body text-ink text-lg mt-2">You are Ben’s lawyer. Your job: look carefully at what people say and at the evidence, then show the judge what really happened.</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border-[3px] border-ink bg-white p-3 font-body text-ink">
              <b className="font-display">Lawyer words:</b> A <b>claim</b> is what you want to prove. <b>Evidence</b> is the stuff that helps prove it.
            </div>
            <Btn tone="lilac" className="mt-4 text-lg" onClick={next}>Open the case</Btn>
          </Panel>
        )}

        {step === 1 && (
          <Panel>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Hear the witnesses</h2>
            <p className="font-body text-ink mt-1">Tap each student to hear their statement.</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-3">
              {STATEMENTS.map((s) => (
                <button key={s.who} onClick={() => { sfx('pop'); setHeard((h) => (h.includes(s.who) ? h : [...h, s.who])); }}
                  className={`text-left rounded-2xl border-[3px] border-ink p-3 ${heard.includes(s.who) ? 'bg-white' : 'bg-sun shadow-chunkysm'}`}>
                  <div className="flex items-center gap-2"><Portrait who={s.who} size="w-14 h-20" /><span className="font-display font-bold text-xl text-ink">{PEOPLE[s.who].name}</span></div>
                  {heard.includes(s.who) ? <p className="font-body text-ink mt-2 statement-in">“{s.text}”</p> : <p className="font-body text-ink/70 mt-2">Tap to listen</p>}
                </button>
              ))}
            </div>
            {heard.length === 3 && <Btn tone="lilac" className="mt-4 text-lg" onClick={next}>Look at the evidence</Btn>}
          </Panel>
        )}

        {step === 2 && (
          <Panel>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Examine the evidence</h2>
            <p className="font-body text-ink mt-1">Tap each item to look closely with your magnifying glass.</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {EVIDENCE.map((e) => (
                <button key={e.id} onClick={() => { sfx('sparkle'); setOpen(e.id); setSeen((s) => (s.includes(e.id) ? s : [...s, e.id])); }}
                  className={`evidence-card rounded-2xl border-[3px] border-ink p-4 text-center ${seen.includes(e.id) ? 'bg-white' : 'bg-sky/40 shadow-chunkysm'}`}>
                  <div className="text-5xl">{e.icon}</div>
                  <div className="font-display font-bold text-ink mt-1">{e.title}</div>
                  <div className="font-body text-sm text-ink/70">{seen.includes(e.id) ? '✓ Examined' : '🔍 Tap to examine'}</div>
                </button>
              ))}
            </div>
            {seen.length === EVIDENCE.length && <Btn tone="lilac" className="mt-4 text-lg" onClick={next}>Sort the clues</Btn>}
            {open && (() => { const e = EVIDENCE.find((x) => x.id === open)!; return (
              <Modal title={e.title} onClose={() => setOpen(null)}>
                <div className="text-7xl text-center magnify">{e.icon}</div>
                <p className="font-body text-ink text-lg mt-3">{e.detail}</p>
              </Modal>
            ); })()}
          </Panel>
        )}

        {step === 3 && (
          <Panel>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Fact or opinion?</h2>
            <p className="font-body text-ink mt-1">A <b>fact</b> can be checked. An <b>opinion</b> is what someone thinks or feels. Drag each card into a box, or tap a card and then a box.</p>
            <div className="flex flex-wrap gap-2 mt-3 min-h-[60px]">
              {SORT.map((c, i) => !sorted[i] && (
                <DragChip key={i} selected={armed === i} onTap={() => setArmed(armed === i ? null : i)} onDrop={(z) => sortCard(i, z)}
                  className="rounded-2xl border-[3px] border-ink bg-sun shadow-chunkysm px-3 py-2 font-body text-ink text-left max-w-[300px]">
                  {c.text}
                </DragChip>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {(['fact', 'opinion'] as const).map((bin) => (
                <div key={bin} data-drop={bin} onClick={() => armed !== null && sortCard(armed, bin)}
                  className={`rounded-[22px] border-[4px] border-dashed border-ink p-3 min-h-[160px] ${bin === 'fact' ? 'bg-mint/40' : 'bg-[#FFE0E8]'} ${armed !== null ? 'drop-zone-armed' : ''}`}>
                  <div className="font-display font-extrabold text-2xl text-ink">{bin === 'fact' ? '✅ Fact' : '💭 Opinion'}</div>
                  <ul className="mt-2 space-y-1">{SORT.map((c, i) => sorted[i] === bin && <li key={i} className="rounded-xl bg-white border-2 border-ink px-2 py-1 font-body text-sm text-ink">{c.text}</li>)}</ul>
                </div>
              ))}
            </div>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {allSorted && <><Feedback ok>All sorted! Lawyers use facts to prove things. Opinions alone aren’t enough.</Feedback><Btn tone="lilac" className="mt-4 text-lg" onClick={next}>Find the contradiction</Btn></>}
          </Panel>
        )}

        {step === 4 && (
          <Panel>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Spot the contradiction</h2>
            <p className="font-body text-ink mt-1">A contradiction is when something someone says doesn’t match the evidence. Which statement doesn’t match?</p>
            <div className="space-y-2 mt-3">
              {[
                { who: 'ava', t: '“I saw Ben holding something shiny.”', r: 'That one matches. Ben’s bottle is shiny!' },
                { who: 'ben', t: '“I was at soccer practice from 3:00 to 4:00.”', r: 'That one matches the sign-in sheet.' },
                { who: 'chloe', t: '“I never went near the trophy case.”', r: '', ok: true },
              ].map((o) => (
                <button key={o.who} onClick={() => (o.ok ? good('Yes! The glitter trail goes from the trophy shelf to the art room, where Chloe was working. Her words don’t match the evidence.') : oops(o.r))}
                  className="w-full flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-white p-2 text-left font-body text-ink text-lg shadow-chunkysm">
                  <Portrait who={o.who} size="w-12 h-16" />{o.t}
                </button>
              ))}
            </div>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {msg?.ok && <Btn tone="lilac" className="mt-4 text-lg" onClick={next}>Ask questions</Btn>}
          </Panel>
        )}

        {step === 5 && (
          <Panel>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Ask the witnesses</h2>
            <p className="font-body text-ink mt-1">Good questions are about the evidence. Choose your questions.</p>
            <div className="space-y-2 mt-3">
              {QUESTIONS.map((q, i) => (
                <div key={i}>
                  <button disabled={asked.includes(i)} onClick={() => { setAsked([...asked, i]); sfx(q.helpful ? 'sparkle' : 'tap'); if (!q.helpful) setMistakes((m) => m + 0.5); }}
                    className="w-full flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-sun p-2 text-left font-body text-ink shadow-chunkysm disabled:bg-white disabled:shadow-none">
                    <Portrait who={q.to} size="w-12 h-16" /><span><b className="font-display">Ask {PEOPLE[q.to].name}:</b> {q.q}</span>
                  </button>
                  {asked.includes(i) && (
                    <div className="statement-in ml-6 mt-1 rounded-2xl border-[3px] border-ink bg-white p-3 font-body text-ink">
                      “{q.a}” <span className={`ml-2 inline-block rounded-full border-2 border-ink px-2 text-sm ${q.helpful ? 'bg-mint' : 'bg-ink/10'}`}>{q.helpful ? 'Helpful clue!' : 'Not about the case'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {asked.includes(1) && <Btn tone="lilac" className="mt-4 text-lg" onClick={next}>Pick your best evidence</Btn>}
          </Panel>
        )}

        {step === 6 && (
          <Panel>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Strongest evidence</h2>
            <p className="font-body text-ink mt-1">Which evidence best proves Ben did <b>not</b> take the trophy?</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {[
                { i: '📋', t: 'Soccer sign-in sheet', ok: true },
                { i: '🥤', t: 'Ben’s water bottle', r: 'It explains the shiny thing, but it doesn’t show where Ben was.' },
                { i: '✨', t: 'Glitter trail', r: 'It points to the art room, but it doesn’t tell us where Ben was.' },
                { i: '💭', t: 'Ava’s opinion that Ben shows off', r: 'Opinions aren’t evidence. We can’t check them.' },
              ].map((o) => (
                <button key={o.t} onClick={() => (o.ok ? good('Yes! The sign-in sheet shows Ben was at soccer the whole time. That’s strong because a coach wrote it down when it happened.') : oops(o.r!))}
                  className="rounded-2xl border-[3px] border-ink bg-white p-3 text-left font-body text-ink text-lg shadow-chunkysm flex items-center gap-3">
                  <span className="text-4xl">{o.i}</span>{o.t}
                </button>
              ))}
            </div>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
            {msg?.ok && <Btn tone="lilac" className="mt-4 text-lg" onClick={next}>Build your argument</Btn>}
          </Panel>
        )}

        {step === 7 && (
          <Panel>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Build your argument</h2>
            <p className="font-body text-ink mt-1">A strong argument has a <b>claim</b>, <b>evidence</b> and <b>reasoning</b> that connects them. Pick one of each.</p>
            {(['claim', 'evidence', 'reasoning'] as const).map((k) => (
              <div key={k} className="mt-3">
                <div className="font-display font-extrabold text-ink text-xl capitalize">{k}</div>
                <div className="grid gap-2 mt-1">
                  {ARG[k].map((t, i) => (
                    <button key={i} onClick={() => { sfx('tap'); setArg({ ...arg, [k]: i }); setMsg(null); }}
                      className={`rounded-2xl border-[3px] border-ink p-2 text-left font-body text-ink ${arg[k] === i ? 'bg-lilac text-white' : 'bg-white'}`}>{t}</button>
                  ))}
                </div>
              </div>
            ))}
            <Btn tone="berry" className="mt-4 text-lg" disabled={arg.claim === undefined || arg.evidence === undefined || arg.reasoning === undefined}
              onClick={() => (arg.claim === 0 && arg.evidence === 0 && arg.reasoning === 0
                ? (good('Persuasive! You used facts and explained why they matter.'), window.setTimeout(next, 1200))
                : oops(arg.claim !== 0 ? 'Your claim should say what you want to prove about Ben.' : arg.evidence !== 0 ? 'Pick evidence that can be checked and shows where Ben was.' : 'Your reasoning should connect the evidence to the claim.'))}>
              🔨 Present to the judge
            </Btn>
            {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
          </Panel>
        )}

        {step === 8 && (
          <Panel tone="bg-[#E6DDF8]">
            <div className="flex gap-4 items-start">
              <Portrait who="judge" size="w-24 h-32" />
              <div>
                <h2 className="font-display text-3xl font-extrabold text-ink">Case closed!</h2>
                <p className="font-body text-ink text-lg mt-2">“Thank you, counselor. The evidence shows Ben was at soccer practice. Chloe borrowed the trophy to draw it for the science fair poster, and it’s back in the case. Next time, Chloe, ask first!”</p>
              </div>
            </div>
            <div className="mt-3"><Stars n={stars} /></div>
            <div className="grid sm:grid-cols-2 gap-2 mt-3 font-body text-ink">
              {[['Claim', 'What you want to prove.'], ['Evidence', 'Facts that help prove it.'], ['Fact', 'Something you can check.'], ['Opinion', 'What someone thinks or feels.'], ['Reasoning', 'Explaining how evidence proves the claim.'], ['Persuasion', 'Helping others agree using good reasons.']].map(([t, d]) => (
                <div key={t} className="rounded-2xl border-[3px] border-ink bg-white p-2"><b className="font-display">{t}:</b> {d}</div>
              ))}
            </div>
            <Btn tone="berry" className="mt-4 text-lg" onClick={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'lawyer-trophy' }); onExit(); }}>Collect rewards</Btn>
          </Panel>
        )}
      </div>
    </MissionShell>
  );
}
