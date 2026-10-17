import { useEffect, useMemo, useState } from 'react';
import type { BuildingId, SceneId } from '../engine/types';
import { building } from '../data/buildings';
import { TOWNFOLK } from '../data/townfolk';
import { MISSIONS } from '../data/missions';
import { PAPER_BASES } from '../data/paperArt';
import { PaperArt } from '../components/Paper';
import { useGame } from '../engine/store';
import { sfx } from '../engine/sfx';
import { Btn } from '../ui/kit';
import { NpcChat } from '../components/NpcChat';
import { Visitors } from '../components/Visitors';
import townArt from '../assets/town/town-map.webp';
import { SPOTS, IMG_W, IMG_H } from './TownMap';

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
function say(text: string) {
  if (!canSpeak()) return;
  const s = window.speechSynthesis; s.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.92; u.pitch = 1.05; s.speak(u);
}

const WHERE: Partial<Record<BuildingId, string>> = { fishing: 'the fishing dock', 'nature-trail': 'the nature trail', park: 'the park', beach: 'the beach', playground: 'the playground', cafe: 'the cafe', bank: 'the bank' };

type Step = 'hello' | 'fact' | 'find' | 'done';

/** A place without a mission yet: meet the person who works there and help with a small "find it" job. */
export function VisitScreen({ id, onBack, onMission, onPlay }: { id: BuildingId; onBack: () => void; onMission?: (m: string) => void; onPlay?: (s: SceneId) => void }) {
  const { game, dispatch } = useGame();
  const b = building(id); const t = TOWNFOLK[id]!;
  const [step, setStep] = useState<Step>('hello');
  const [found, setFound] = useState<number[]>([]);
  const [chat, setChat] = useState(false);
  const [cheeky, setCheeky] = useState(false);
  const [closeKids, setCloseKids] = useState(0);
  useEffect(() => () => { if (canSpeak()) window.speechSynthesis.cancel(); }, []);

  // the place's own piece of the town picture, zoomed out a little so there's room to search
  const bg = useMemo(() => {
    if (t.inside) return { backgroundImage: `url(${t.inside})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    const [x, y, w, h] = SPOTS[id]; const cx = x + w / 2, cy = y + h / 2;
    const W = Math.min(IMG_W, w * 2.1), H = Math.min(IMG_H, W * 0.62);
    const x0 = Math.max(0, Math.min(IMG_W - W, cx - W / 2)), y0 = Math.max(0, Math.min(IMG_H - H, cy - H / 2));
    return { backgroundImage: `url(${townArt})`, backgroundSize: `${(IMG_W / W) * 100}% ${(IMG_H / H) * 100}%`, backgroundPosition: `${(x0 / (IMG_W - W)) * 100}% ${(y0 / (IMG_H - H)) * 100}%` };
  }, [id]);
  // hiding places, away from the person on the left
  const round = found.length === 0 && step === 'find';
  const items = useMemo(() => (t.pick ? [...t.find].sort(() => Math.random() - 0.5).slice(0, t.pick) : t.find), [t, round]);
  const spots = useMemo(() => items.map((_, i) => ({ x: 36 + ((i * 19 + Math.random() * 14) % 54), y: 38 + ((i * 17 + Math.random() * 30) % 44), r: Math.round(Math.random() * 40 - 20), d: 2.5 + Math.random() * 2 })), [t, round]);

  const line = step === 'hello' ? t.hello : step === 'fact' ? t.fact : step === 'find' ? t.ask : t.thanks;

  const tapItem = (i: number) => {
    if (found.includes(i)) return;
    sfx('pop'); const next = [...found, i]; setFound(next);
    if (next.length === items.length) {
      const first = !game.owned.includes(`visit:${id}`);
      window.setTimeout(() => {
        sfx('success'); setStep('done');
        dispatch({ type: 'OWN', id: `visit:${id}` });
        dispatch({ type: 'REWARD', reward: first
          ? { coins: 15, xp: 10, ...(t.career ? { career: t.career, careerXp: 5 } : {}), title: `You helped ${t.name} the ${t.job.toLowerCase()}!` }
          : { coins: 5, xp: 3, title: `Thanks for helping ${t.name} again!` } });
      }, 350);
    }
  };
  const again = () => { setFound([]); setStep('find'); };
  const aspect = PAPER_BASES[t.look.base].canvas[2] / PAPER_BASES[t.look.base].canvas[3];

  return (
    <div className="relative h-full w-full overflow-hidden select-none" style={{ ...bg, backgroundRepeat: 'no-repeat' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 55%, rgba(255,255,255,0.35))' }} />

      {/* the town person */}
      <button aria-label={`Talk to ${t.name}`} onClick={() => { sfx('pop'); if (step === 'hello') setStep('fact'); }}
        className="visit-person absolute" style={{ left: '3%', bottom: '2%', height: '78%', aspectRatio: String(aspect) }}>
        <PaperArt p={t.look} face={cheeky ? 'silly' : step === 'done' ? 'laughing' : step === 'find' ? 'happy' : 'giggle'} />
      </button>

      {/* speech bubble */}
      <div className="visit-bubble absolute rounded-[28px] border-[4px] border-ink bg-white p-3 shadow-chunkysm" style={{ left: '30%', top: '4%', maxWidth: 560, right: '3%' }}>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="font-display font-bold text-ink">{t.name} · {t.job} at {WHERE[id] ?? `the ${b.name}`}</div>
            <p className="font-body text-ink text-lg mt-1" style={{ lineHeight: 1.35 }}>{line}</p>
            {step === 'find' && <p className="font-display font-bold text-ink mt-1">Found {found.length} of {items.length}</p>}
          </div>
          {canSpeak() && <button aria-label="Read to me" onClick={() => say(line)} className="shrink-0 h-11 w-11 rounded-2xl border-[3px] border-ink bg-white shadow-chunkysm">🔊</button>}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Btn tone="white" onClick={() => { sfx('tap'); if (!chat) setCloseKids((k) => k + 1); setChat(!chat); }}>💬 Chat</Btn>
          {step === 'hello' && <Btn tone="sun" onClick={() => setStep('fact')}>What do you do?</Btn>}
          {onPlay && b.rooms[0] && <Btn tone="sky" onClick={() => onPlay(b.rooms[0].sceneId)}>🧸 Free play</Btn>}
          {onMission && b.missions.map((m) => <Btn key={m} tone="berry" onClick={() => onMission(m)}>⭐ {MISSIONS[m].title}</Btn>)}
          {step === 'fact' && <Btn tone="mint" onClick={() => { setFound([]); setStep('find'); }}>Can I help?</Btn>}
          {step === 'done' && <><Btn tone="mint" onClick={again}>Play again</Btn><Btn tone="white" onClick={onBack}>Back to town</Btn></>}
        </div>
        {chat && <NpcChat npc={{ name: t.name, job: t.job, fact: t.fact }} onMood={(m) => setCheeky(m === 'cheeky')} />}
      </div>

      {step !== 'find' && <div className="absolute inset-0 pointer-events-none visit-kids" style={{ left: '22%' }}><Visitors building={id} closeKey={closeKids} onOpen={() => setChat(false)} /></div>}

      {/* things to find */}
      {step === 'find' && items.map((e, i) => (
        <button key={i} aria-label={`Hidden ${e.includes('/') || e.includes('.') ? 'thing' : e} ${i + 1}`} onClick={() => tapItem(i)}
          className={`visit-item absolute ${t.moving ? 'visit-move' : ''} ${found.includes(i) ? 'visit-found' : ''}`}
          style={{ left: `${spots[i].x}%`, top: `${spots[i].y}%`, transform: `rotate(${spots[i].r}deg)`, animationDuration: `${spots[i].d}s` }}>
          {e.includes('/') || e.startsWith('data:') ? <img src={e} alt="" draggable={false} className="visit-pic" /> : e}
        </button>
      ))}
    </div>
  );
}
