import { useEffect, useRef, useState } from 'react';
import { useGame } from '../engine/store';
import { INK } from '../components/art/Character';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { sfx } from '../engine/sfx';

// ── Tiny visual programming language: Forward, Turn left, Turn right, Repeat ──
type Cmd = 'F' | 'L' | 'R';
type Block = { cmd: Cmd; times: number }; // times > 1 means "Repeat ×times"
type Dir = 0 | 1 | 2 | 3; // 0 east, 1 south, 2 west, 3 north
const CMD: Record<Cmd, { icon: string; label: string }> = {
  F: { icon: '⬆️', label: 'Forward' }, L: { icon: '↩️', label: 'Turn left' }, R: { icon: '↪️', label: 'Turn right' },
};
const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];

interface Level { name: string; concept: string; text: string; map: string[]; max: number; prefill?: Block[]; tip: string }
const LEVELS: Level[] = [
  { name: 'First steps', concept: 'Sequence', text: 'Computers do exactly what you say, one step at a time. Get Bolt to the charger ⚡.',
    map: ['......', '.R..C.', '......'], max: 6, tip: 'Count the squares between Bolt and the charger.' },
  { name: 'Around the corner', concept: 'Logic', text: 'Bolt can only turn when you tell it to. Which way is “right” for Bolt?',
    map: ['R...#', '###.#', '...C#'], max: 8, tip: 'Turn right means Bolt’s right, the way its arrow points.' },
  { name: 'The long hallway', concept: 'Loops', text: 'You only have 3 blocks! A Repeat block does the same step many times.',
    map: ['R......', '######.', '######.', '######C'], max: 3, tip: 'Tap Repeat, then use + to choose how many times. Tap the block to change its step.' },
  { name: 'Find the bug', concept: 'Debugging', text: 'Someone wrote this program, but Bolt bumps into a wall. Run it, find the bug and fix it.',
    map: ['R..', '##.', 'C..'], max: 8, prefill: [{ cmd: 'F', times: 1 }, { cmd: 'F', times: 1 }, { cmd: 'R', times: 1 }, { cmd: 'F', times: 1 }, { cmd: 'F', times: 1 }, { cmd: 'L', times: 1 }, { cmd: 'F', times: 1 }, { cmd: 'F', times: 1 }],
    tip: 'Tap a block to change it. Look at the step where Bolt crashed.' },
];

function find(map: string[], ch: string) {
  for (let y = 0; y < map.length; y++) { const x = map[y].indexOf(ch); if (x >= 0) return { x, y }; }
  return { x: 0, y: 0 };
}

export function RobotMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [lvl, setLvl] = useState(0);
  const L = LEVELS[lvl];
  const start = find(L.map, 'R'), goal = find(L.map, 'C');
  const [prog, setProg] = useState<Block[]>(L.prefill ?? []);
  const [bot, setBot] = useState({ ...start, dir: 0 as Dir, bump: false });
  const [running, setRunning] = useState(-1);
  const [crash, setCrash] = useState(-1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [solved, setSolved] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const reset = (n = lvl) => {
    timers.current.forEach(window.clearTimeout); timers.current = [];
    const s = find(LEVELS[n].map, 'R');
    setBot({ ...s, dir: 0, bump: false }); setRunning(-1); setCrash(-1);
  };
  const goLevel = (n: number) => { setLvl(n); setProg(LEVELS[n].prefill ?? []); setMsg(null); reset(n); sfx('pop'); };

  const add = (cmd: Cmd, repeat = false) => {
    if (running >= 0) return;
    if (prog.length >= L.max) { setMsg({ ok: false, text: `Only ${L.max} blocks fit in Bolt’s memory. Try a Repeat block!` }); sfx('fail'); return; }
    setProg([...prog, { cmd, times: repeat ? 2 : 1 }]); setMsg(null); sfx('click');
  };
  const cycle = (i: number) => { if (running >= 0) return; const order: Cmd[] = ['F', 'R', 'L']; setProg(prog.map((b, k) => (k === i ? { ...b, cmd: order[(order.indexOf(b.cmd) + 1) % 3] } : b))); setMsg(null); setCrash(-1); sfx('tap'); };
  const setTimes = (i: number, d: number) => setProg(prog.map((b, k) => (k === i ? { ...b, times: Math.max(2, Math.min(9, b.times + d)) } : b)));

  const run = () => {
    if (!prog.length) { setMsg({ ok: false, text: 'Add some blocks first!' }); return; }
    reset(); setMsg(null);
    const steps: { cmd: Cmd; src: number }[] = prog.flatMap((b, src) => Array.from({ length: b.times }, () => ({ cmd: b.cmd, src })));
    let s = { ...start, dir: 0 as Dir };
    let t = 350;
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      if (st.cmd === 'F') {
        const nx = s.x + DX[s.dir], ny = s.y + DY[s.dir];
        const blocked = ny < 0 || ny >= L.map.length || nx < 0 || nx >= L.map[0].length || L.map[ny][nx] === '#';
        if (blocked) {
          const at = { ...s };
          timers.current.push(window.setTimeout(() => {
            setRunning(-1); setCrash(st.src); setBot({ ...at, bump: true }); sfx('crack');
            setMsg({ ok: false, text: `Bonk! Block ${st.src + 1} sent Bolt into a wall. Debug time: which block should change?` });
          }, t));
          return;
        }
        s = { ...s, x: nx, y: ny };
      } else s = { ...s, dir: ((s.dir + (st.cmd === 'R' ? 1 : 3)) % 4) as Dir };
      const snap = { ...s };
      const reached = snap.x === goal.x && snap.y === goal.y;
      timers.current.push(window.setTimeout(() => { setRunning(st.src); setBot({ ...snap, bump: false }); sfx(st.cmd === 'F' ? 'tick' : 'click'); }, t));
      t += 450;
      if (reached) {
        timers.current.push(window.setTimeout(() => {
          setRunning(-1); sfx('success');
          setSolved((v) => { const n = [...v]; n[lvl] = true; return n; });
          setMsg({ ok: true, text: ['Charged! A list of steps in order is called a sequence.', 'You used logic to plan the turns!', `A loop! ${prog.length} blocks did the work of ${steps.length} steps.`, 'Bug fixed! Finding and fixing mistakes is called debugging.'][lvl] });
        }, t));
        return;
      }
    }
    timers.current.push(window.setTimeout(() => { setRunning(-1); sfx('fail'); setMsg({ ok: false, text: 'Bolt ran out of steps before reaching the charger. Add more blocks!' }); }, t));
  };

  const cols = L.map[0].length, rows = L.map.length;
  const STEP_NAMES = LEVELS.map((l) => l.concept).concat('Done');

  if (finished) return (
    <MissionShell id="software-robot" step={4} steps={STEP_NAMES} onExit={onExit} color="#3D7BFF">
      <Panel className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-extrabold text-ink">Bolt is charged up! ⚡</h2>
        <p className="font-body text-ink text-lg mt-2">You wrote real programs. No typing needed, just thinking like a software engineer.</p>
        <div className="grid sm:grid-cols-2 gap-2 mt-3 font-body text-ink">
          {[['Sequence', 'Steps that happen in order.'], ['Pattern', 'Something that repeats, like forward, forward, forward.'], ['Loop', 'A block that repeats steps for you.'], ['Debugging', 'Finding and fixing mistakes.'], ['Logic', 'Thinking through what will happen.']].map(([t, d]) => (
            <div key={t} className="rounded-2xl border-[3px] border-ink bg-white p-2"><b className="font-display">{t}:</b> {d}</div>
          ))}
        </div>
        <Btn tone="berry" className="mt-4 text-lg" onClick={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'software-robot' }); onExit(); }}>Collect rewards</Btn>
      </Panel>
    </MissionShell>
  );

  return (
    <MissionShell id="software-robot" step={lvl} steps={STEP_NAMES} onExit={onExit} color="#3D7BFF">
      <div className="mx-auto max-w-5xl grid lg:grid-cols-[1.1fr_1fr] gap-4 items-start">
        <Panel tone="bg-[#DCE6FF]">
          <h2 className="font-display text-2xl font-extrabold text-ink">Level {lvl + 1}: {L.name}</h2>
          <p className="font-body text-ink mt-1">{L.text}</p>
          <div className="relative mt-3 mx-auto rounded-2xl border-[4px] border-ink overflow-hidden bg-[#B7C6D6]" style={{ aspectRatio: `${cols}/${rows}`, maxWidth: `${cols * 84}px` }}>
            {L.map.map((row, y) => row.split('').map((c, x) => (
              <div key={`${x}-${y}`} className="absolute border border-ink/20" style={{ left: `${(x / cols) * 100}%`, top: `${(y / rows) * 100}%`, width: `${100 / cols}%`, height: `${100 / rows}%`, background: c === '#' ? '#4A4766' : (x + y) % 2 ? '#E9F0FF' : '#F7FAFF' }}>
                {c === 'C' && <div className="w-full h-full grid place-items-center text-[min(7vw,40px)] glow">⚡</div>}
                {c === '#' && <div className="absolute inset-[12%] rounded-md bg-[#6F6A8F] border-2 border-ink" />}
              </div>
            )))}
            <div className={`absolute transition-all duration-300 ${bot.bump ? 'anim-shake' : ''}`} style={{ left: `${(bot.x / cols) * 100}%`, top: `${(bot.y / rows) * 100}%`, width: `${100 / cols}%`, height: `${100 / rows}%` }}>
              <svg viewBox="0 0 60 60" className="w-full h-full transition-transform duration-300" style={{ transform: `rotate(${bot.dir * 90}deg)` }}>
                <rect x="10" y="12" width="36" height="36" rx="10" fill="#7FD3F7" stroke={INK} strokeWidth="3" />
                <rect x="16" y="20" width="22" height="20" rx="5" fill={INK} />
                <circle cx="31" cy="26" r="3" fill="#5FE0B7" /><circle cx="31" cy="34" r="3" fill="#5FE0B7" />
                <path d="M46 22 L57 30 L46 38Z" fill="#FFC93C" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p className="font-body text-ink/80 text-sm mt-2">💡 {L.tip}</p>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-extrabold text-ink">Program</h3>
            <span className={`rounded-full border-[3px] border-ink px-3 font-display font-bold ${prog.length >= L.max ? 'bg-berry text-white' : 'bg-white text-ink'}`}>{prog.length} / {L.max} blocks</span>
          </div>
          <ol className="mt-2 space-y-1.5 min-h-[60px]" aria-label="Program blocks">
            {prog.length === 0 && <li className="rounded-2xl border-[3px] border-dashed border-ink/40 p-3 font-body text-ink/60">Tap the blocks below to add steps.</li>}
            {prog.map((b, i) => (
              <li key={i} className={`flex items-center gap-2 rounded-2xl border-[3px] border-ink p-1.5 pl-2 ${running === i ? 'bg-sun scale-[1.02]' : crash === i ? 'bg-[#FFE0E8] ring-4 ring-berry' : b.times > 1 ? 'bg-lilac/30' : 'bg-white'} transition-transform`}>
                <span className="w-7 h-7 rounded-full bg-ink text-white grid place-items-center font-display text-sm shrink-0">{i + 1}</span>
                {b.times > 1 && <span className="font-display font-bold text-ink">🔁 Repeat</span>}
                <button onClick={() => cycle(i)} aria-label={`Change block ${i + 1}`} className="flex-1 text-left rounded-xl bg-sky/40 border-2 border-ink px-2 py-1 font-display font-bold text-ink">{CMD[b.cmd].icon} {CMD[b.cmd].label}</button>
                {b.times > 1 && <>
                  <button aria-label="Fewer times" onClick={() => setTimes(i, -1)} className="w-9 h-9 rounded-full border-2 border-ink bg-white font-display text-xl text-ink">−</button>
                  <span className="font-display font-extrabold text-ink w-8 text-center">×{b.times}</span>
                  <button aria-label="More times" onClick={() => setTimes(i, 1)} className="w-9 h-9 rounded-full border-2 border-ink bg-white font-display text-xl text-ink">+</button>
                </>}
                <button aria-label={`Remove block ${i + 1}`} onClick={() => { if (running < 0) { setProg(prog.filter((_, k) => k !== i)); sfx('tap'); } }} className="w-9 h-9 rounded-full border-2 border-ink bg-berry text-white font-display">✕</button>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {(Object.keys(CMD) as Cmd[]).map((c) => <Btn key={c} tone="sky" aria-label={`Add ${CMD[c].label}`} onClick={() => add(c)}>{CMD[c].icon} {CMD[c].label}</Btn>)}
            <Btn tone="lilac" aria-label="Add Repeat" onClick={() => add('F', true)}>🔁 Repeat</Btn>
          </div>
          <div className="flex gap-2 mt-3">
            <Btn tone="mint" className="flex-1 text-xl" disabled={running >= 0} onClick={run}>▶ Run</Btn>
            <Btn tone="white" onClick={() => { reset(); setMsg(null); }}>Reset</Btn>
            <Btn tone="white" onClick={() => { setProg(L.prefill ?? []); reset(); setMsg(null); }}>Clear</Btn>
          </div>
          {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
          {solved[lvl] && msg?.ok && (
            lvl < LEVELS.length - 1
              ? <Btn tone="berry" className="mt-4 text-lg" onClick={() => goLevel(lvl + 1)}>Next level</Btn>
              : <Btn tone="berry" className="mt-4 text-lg" onClick={() => { setFinished(true); sfx('success'); }}>Finish</Btn>
          )}
        </Panel>
      </div>
    </MissionShell>
  );
}
