import { useMemo, useState } from 'react';
import type { CharacterData } from '../engine/types';
import type { Mood } from '../components/art/Character';
import { useGame } from '../engine/store';
import { npc, npcAspect } from '../data/dollLooks';
import { TOWNFOLK } from '../data/townfolk';
import { Person } from '../components/Person';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { sfx } from '../engine/sfx';
import townArt from '../assets/town/town-map.webp';
import { SPOTS, IMG_W, IMG_H } from '../scenes/TownMap';

const STEPS = ['Notice', 'Speak up', 'Get help', 'Kindness', 'Together'];
const PIP = npc('pip', 'Pip');
const ZINA = npc('zina', 'Zina');
/** Zina joins your friends after the mission. */
export const ZINA_FRIEND: CharacterData = { ...ZINA, id: 'friend-zina' };

type Choice = { label: string; ok: boolean; reply: string };
interface Beat {
  say: { who: 'zina' | 'pip' | 'coach' | 'me'; text: string }[];
  ask: string;
  choices: Choice[];
  moods: { zina: Mood; pip: Mood; coach?: boolean };
  after: string;   // what happens when you pick the kind choice
}

const BEATS: Beat[] = [
  {
    say: [{ who: 'pip', text: 'Look, I drew a dragon!' }, { who: 'zina', text: 'Ha! That looks like a potato. And you can’t play on the slide with us.' }],
    ask: 'Pip looks sad. Some kids are laughing. What do you do?',
    moods: { zina: 'grumpy', pip: 'sad' },
    choices: [
      { label: '😆 Laugh along so Zina likes me', ok: false, reply: 'Laughing along makes Pip feel even more alone. Zina might keep going because people are laughing. Try a different choice.' },
      { label: '🙈 Pretend I didn’t see', ok: false, reply: 'It’s hard to know what to do! But if nobody helps, Pip stays sad. Is there something you could do?' },
      { label: '🙋 Stand next to Pip', ok: true, reply: 'Great start! Just standing with Pip shows they are not alone.' },
    ],
    after: 'You walk over and stand next to Pip.',
  },
  {
    say: [{ who: 'zina', text: 'What are YOU looking at?' }],
    ask: 'How can you speak up?',
    moods: { zina: 'grumpy', pip: 'sad' },
    choices: [
      { label: '😡 “Your drawings are worse, Zina!”', ok: false, reply: 'Being mean back usually makes things bigger and turns into a fight. Try saying it calmly.' },
      { label: '🗣️ “That’s not kind. Pip, come play with me.”', ok: true, reply: 'Yes! You spoke up calmly and clearly, then helped Pip get away. That’s what an upstander does.' },
      { label: '✋ Push Zina away', ok: false, reply: 'Pushing can hurt someone and get you in trouble too. Words and walking away are safer.' },
    ],
    after: 'You and Pip walk toward the swings together.',
  },
  {
    say: [{ who: 'zina', text: 'Fine! But you still can’t use the slide. It’s MINE.' }, { who: 'pip', text: 'She does this every day…' }],
    ask: 'This keeps happening. What should you do?',
    moods: { zina: 'grumpy', pip: 'sad', coach: true },
    choices: [
      { label: '🤐 Keep it a secret', ok: false, reply: 'When someone keeps getting hurt, it’s important to tell. Grown-ups can help in ways kids can’t.' },
      { label: '🧑‍🏫 Tell Coach Jay what happened', ok: true, reply: 'Good thinking! Telling a trusted grown-up isn’t tattling when someone is being hurt. It’s getting help.' },
      { label: '😠 Get all my friends to be mean to Zina', ok: false, reply: 'Ganging up on someone is bullying too, even if they started it. Let’s find a better way.' },
    ],
    after: 'Coach Jay says: “Thank you for telling me. Everyone shares the slide here. I’ll have a chat with Zina.”',
  },
  {
    say: [{ who: 'coach', text: 'Zina is sitting on the bench by herself. She looks upset.' }],
    ask: 'Zina is sad now. What could you do?',
    moods: { zina: 'sad', pip: 'normal', coach: true },
    choices: [
      { label: '😝 “Ha ha, now YOU’RE sad!”', ok: false, reply: 'Teasing her back would hurt her the same way. Kindness can change things. Try again.' },
      { label: '💬 Ask, “Are you okay, Zina?”', ok: true, reply: 'That was brave and kind.' },
      { label: '🚶 Stay far away from her forever', ok: false, reply: 'It’s OK to keep yourself safe. But Zina isn’t being mean right now, and she looks like she needs a friend.' },
    ],
    after: 'Zina sniffs: “My best friend moved away last week. I didn’t have anyone to play with, so I was grumpy at everyone. That wasn’t fair.”',
  },
  {
    say: [{ who: 'zina', text: 'Pip… I’m sorry I said your dragon looked like a potato. It’s actually really cool.' }, { who: 'pip', text: 'Thanks, Zina.' }],
    ask: 'How could the three of you end the day?',
    moods: { zina: 'normal', pip: 'happy', coach: true },
    choices: [
      { label: '🛝 “Let’s all take turns on the slide!”', ok: true, reply: 'Everyone gets a turn, and nobody is left out. 🎉' },
      { label: '🙅 “We still don’t want to play with you.”', ok: false, reply: 'You don’t have to be best friends right away. But Zina said sorry, and giving her a chance could help everyone feel better.' },
    ],
    after: 'Zina, Pip and you take turns on the slide and laugh together.',
  },
];

function Stage({ moods, coach, me, speaking }: { moods: Beat['moods']; coach?: boolean; me: CharacterData | undefined; speaking?: string }) {
  const bg = useMemo(() => {
    const [x, y, w, h] = SPOTS.playground; const cx = x + w / 2, cy = y + h / 2;
    const W = Math.min(IMG_W, w * 1.9), H = Math.min(IMG_H, W * 0.42);
    const x0 = Math.max(0, Math.min(IMG_W - W, cx - W / 2)), y0 = Math.max(0, Math.min(IMG_H - H, cy - H / 2));
    return { backgroundImage: `url(${townArt})`, backgroundSize: `${(IMG_W / W) * 100}% ${(IMG_H / H) * 100}%`, backgroundPosition: `${(x0 / (IMG_W - W)) * 100}% ${(y0 / (IMG_H - H)) * 100}%` };
  }, []);
  const coachC = TOWNFOLK.playground ? ({ id: 'coach', name: 'Coach Jay', age: 'adult', look: {}, sprite: 'paper-adult', paper: TOWNFOLK.playground.look } as unknown as CharacterData) : undefined;
  const fig = (c: CharacterData | undefined, mood: Mood, h: number, key: string) => c && (
    <div key={key} className={`up-fig ${speaking === key ? 'talking' : ''}`} style={{ height: `${h}%`, aspectRatio: String(npcAspect(c)) }}>
      <Person c={c} mood={mood} /><span className="up-name">{c.name}</span>
    </div>
  );
  return (
    <div className="up-stage rounded-[28px] border-[4px] border-ink overflow-hidden" style={bg}>
      <div className="up-row">
        {fig(me, 'normal', 74, 'me')}
        {fig(PIP, moods.pip, 74, 'pip')}
        {fig(ZINA, moods.zina, 74, 'zina')}
        {coach && fig(coachC, 'happy', 96, 'coach')}
      </div>
    </div>
  );
}

export function UpstanderMission({ onExit }: { onExit: () => void }) {
  const { game, dispatch } = useGame();
  const me = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [done, setDone] = useState(false);
  const b = BEATS[i];
  const pick = (c: Choice) => { if (picked?.ok) return; sfx(c.ok ? 'success' : 'fail'); setPicked(c); };
  const next = () => { setPicked(null); if (i + 1 < BEATS.length) setI(i + 1); else { setDone(true); sfx('sparkle'); } };
  const name = (w: string) => (w === 'zina' ? 'Zina' : w === 'pip' ? 'Pip' : w === 'coach' ? 'Coach Jay' : me?.name ?? 'You');

  if (done) return (
    <MissionShell id="playground-upstander" step={STEPS.length - 1} steps={STEPS} onExit={onExit} color="#FFC6E0">
      <Stage moods={{ zina: 'happy', pip: 'happy', coach: true }} coach me={me} />
      <Panel className="mt-3">
        <h2 className="font-display text-2xl font-bold text-ink">You’re an upstander! 🦸</h2>
        <p className="font-body text-ink text-lg mt-1">An upstander helps when someone is being treated unkindly. You did all four steps:</p>
        <ul className="font-body text-ink text-lg mt-2 up-steps">
          <li>🙋 <b>Stand with them</b> so they aren’t alone</li>
          <li>🗣️ <b>Speak up calmly</b>: “That’s not kind.”</li>
          <li>🧑‍🏫 <b>Tell a trusted grown-up</b> when it keeps happening</li>
          <li>💛 <b>Be kind</b>, even to someone who was unkind. They might be having a hard time.</li>
        </ul>
        <p className="font-body text-ink/80 mt-2">If someone is unkind to <i>you</i>, you can always tell a grown-up you trust. It’s never your fault.</p>
        <p className="font-body text-ink mt-2">🎁 Zina is now one of your friends. Find her in Characters!</p>
        <div className="mt-3"><Btn tone="mint" onClick={() => {
          dispatch({ type: 'ADD_CHARACTERS', characters: [ZINA_FRIEND], mark: 'pack:friend-zina' });
          dispatch({ type: 'COMPLETE_MISSION', id: 'playground-upstander' }); onExit();
        }}>Finish →</Btn></div>
      </Panel>
    </MissionShell>
  );

  return (
    <MissionShell id="playground-upstander" step={i} steps={STEPS} onExit={onExit} color="#FFC6E0">
      <Stage moods={picked?.ok && i === 0 ? { ...b.moods, pip: 'normal' } : b.moods} coach={b.moods.coach} me={me} speaking={b.say[b.say.length - 1].who} />
      <Panel className="mt-3">
        {b.say.map((s, k) => <p key={k} className="font-body text-ink text-lg"><b className="font-display">{name(s.who)}:</b> {s.who === 'coach' ? <i>{s.text}</i> : `“${s.text}”`}</p>)}
        <h2 className="font-display text-xl font-bold text-ink mt-3">{b.ask}</h2>
        <div className="grid gap-2 mt-2">
          {b.choices.map((c) => (
            <button key={c.label} onClick={() => pick(c)} disabled={!!picked?.ok}
              className={`up-choice ${picked === c ? (c.ok ? 'good' : 'oops') : ''}`}>{c.label}</button>
          ))}
        </div>
        {picked && <Feedback ok={picked.ok}>{picked.reply}{picked.ok && <><br /><span className="font-body">{b.after}</span></>}</Feedback>}
        {picked?.ok && <div className="mt-3"><Btn tone="mint" onClick={next}>Next →</Btn></div>}
      </Panel>
    </MissionShell>
  );
}
