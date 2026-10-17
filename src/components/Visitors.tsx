import { useState } from 'react';
import type { BuildingId } from '../engine/types';
import { NPC_PAPER } from '../data/dollLooks';
import { PAPER_BASES } from '../data/paperArt';
import { PaperArt } from './Paper';
import { NpcChat } from './NpcChat';
import { sfx } from '../engine/sfx';

/** Kids from around town who hang out in places. Tap one to chat. */
const KIDS: Record<string, { name: string; dream: string; hello: string; fact: string }> = {
  pip: { name: 'Pip', dream: 'future doctor', hello: 'Hi! I’m Pip! I love helping people feel better.', fact: 'I want to be a doctor when I grow up! I practise check-ups on my teddy.' },
  ava: { name: 'Ava', dream: 'future artist', hello: 'Hey! I’m Ava. Want to see my drawings?', fact: 'I want to be an artist or a dancer. Maybe both!' },
  ben: { name: 'Ben', dream: 'future engineer', hello: 'Yo! I’m Ben. I like building stuff and playing soccer.', fact: 'I want to be an engineer and build the biggest bridge ever!' },
  chloe: { name: 'Chloe', dream: 'future detective', hello: 'Hi, I’m Chloe! I notice EVERYTHING. 🔍', fact: 'I want to be a lawyer or a detective. I love solving mysteries!' },
  zina: { name: 'Zina', dream: 'friend', hello: 'Hi, I’m Zina! I’m learning to be a better friend. Want to play?', fact: 'I’m not sure what I want to be yet. Maybe a coach, so I can help kids be good teammates!' },
};
const WHO: Partial<Record<BuildingId, string[]>> = {
  school: ['ben', 'ava'], hospital: ['pip'], courthouse: ['chloe'], engineering: ['ben'], 'animal-hospital': ['ava'], 'tech-lab': ['chloe'], restaurant: ['pip'],
  beach: ['ben', 'chloe'], park: ['ava', 'pip'], cafe: ['chloe'], fishing: ['ben'], playground: ['zina', 'pip'], 'nature-trail': ['ava'],
  shopping: ['chloe', 'zina'], bank: ['ben'], kpop: ['ava', 'zina'],
};

export function Visitors({ building }: { building: BuildingId }) {
  const ids = WHO[building] ?? [];
  const [open, setOpen] = useState<string | null>(null);
  const [face, setFace] = useState<Record<string, string>>({});
  if (!ids.length) return null;
  return (
    <div className="visitors absolute" style={{ left: '2%', bottom: '9%', height: '44%', display: 'flex', gap: '1%', zIndex: 24, pointerEvents: 'none' }}>
      {ids.map((id, i) => {
        const k = KIDS[id]; const look = NPC_PAPER[id]; if (!k || !look) return null;
        const B = PAPER_BASES[look.base]; void i;
        return (
          <div key={id} className="visitor" style={{ position: 'relative', height: '100%', aspectRatio: String(B.canvas[2] / B.canvas[3]), zIndex: open === id ? 2 : 1 }}>
            <button aria-label={`Talk to ${k.name}`} className="worker-btn w-full h-full" onClick={() => { sfx('pop'); setOpen(open === id ? null : id); setFace((f) => ({ ...f, [id]: 'laughing' })); }}>
              <PaperArt p={look} face={face[id] ?? 'happy'} />
            </button>
            {open === id
              ? (
                <div className="visitor-bubble rounded-[28px] border-[3px] border-ink bg-white p-3 shadow-chunkysm">
                  <div className="flex items-center gap-2">
                    <div className="font-display font-bold text-ink text-sm" style={{ flex: 1 }}>{k.name}</div>
                    <button aria-label="Close" onClick={() => setOpen(null)} className="rounded-full border-[3px] border-ink bg-white h-8 w-8 font-display">✕</button>
                  </div>
                  <p className="font-body text-ink mt-1" style={{ lineHeight: 1.35 }}>{k.hello}</p>
                  <NpcChat npc={{ name: k.name, job: k.dream, fact: k.fact, kid: true }} onMood={(m) => setFace((f) => ({ ...f, [id]: m === 'cheeky' ? 'silly' : 'laughing' }))} />
                </div>
              )
              : <span className="worker-tag">💬 {k.name}</span>}
          </div>
        );
      })}
    </div>
  );
}
