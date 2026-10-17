import { useState } from 'react';
import type { BuildingId, CareerId, SceneId } from '../engine/types';
import { useGame, playerLevel, levelProgress } from '../engine/store';
import { building } from '../data/buildings';
import { CAREERS, careerLevel, careerProgress } from '../data/careers';
import { MISSIONS } from '../data/missions';
import { BADGES, PET_ACCESSORIES, SECRETS, SHOP } from '../data/catalog';
import { Btn, Coin, Face, Modal } from '../ui/kit';
import { PetPic } from '../components/Person';
import { PET_LOOKS } from '../data/accessories';
import { sfx } from '../engine/sfx';
import { StylePackCard } from '../components/StylePack';
import { StickerBook } from '../components/StickerBook';

export function BuildingScreen({ id, onScene, onMission }: { id: BuildingId; onScene: (s: SceneId) => void; onMission: (m: string) => void }) {
  const { game } = useGame();
  const b = building(id);
  const c = b.career ? CAREERS[b.career] : undefined;
  const xp = c ? game.careerXp[c.id] ?? 0 : 0;
  return (
    <div className="h-full overflow-auto p-3 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[30px] border-[4px] border-ink shadow-chunky p-5 sm:p-7 career-hero" style={{ background: c?.color ?? '#FFC93C' }}>
          <div className="flex items-center gap-4">
            <div className="text-6xl sm:text-7xl drop-shadow">{c?.icon ?? b.icon}</div>
            <div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-ink leading-none">Future {c?.title}</h1>
              <p className="font-body text-ink mt-2 text-base sm:text-lg max-w-xl">{c?.blurb}</p>
            </div>
          </div>
          {c && (
            <div className="mt-4 flex items-center gap-3">
              <span className="rounded-full bg-white border-[3px] border-ink px-3 py-1 font-display font-bold text-ink">Level {careerLevel(xp)}</span>
              <div className="flex-1 max-w-xs h-4 rounded-full bg-white border-[3px] border-ink overflow-hidden"><div className="h-full bg-mint" style={{ width: `${careerProgress(xp) * 100}%` }} /></div>
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <button onClick={() => { sfx('pop'); onScene(b.rooms[0].sceneId); }} className="mode-card text-left rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-5">
            <div className="text-5xl">🎈</div>
            <h2 className="font-display text-2xl font-extrabold text-ink mt-2">Free play</h2>
            <p className="font-body text-ink/80 mt-1">Explore the {b.rooms[0].label.toLowerCase()}, move things around and pretend.</p>
            <span className="inline-block mt-3 rounded-2xl border-[3px] border-ink bg-sky px-4 py-2 font-display font-bold text-ink shadow-chunkysm">Go in</span>
          </button>
          {b.missions.map((mid) => {
            const m = MISSIONS[mid]; const done = game.completedMissions[mid] ?? 0;
            return (
              <button key={mid} onClick={() => { sfx('pop'); onMission(mid); }} className="mode-card text-left rounded-[28px] border-[4px] border-ink bg-sun shadow-chunky p-5">
                <div className="flex justify-between items-start"><div className="text-5xl">⭐</div>{done > 0 && <span className="rounded-full bg-mint border-[3px] border-ink px-3 py-1 font-display font-bold text-ink">✓ Solved</span>}</div>
                <h2 className="font-display text-2xl font-extrabold text-ink mt-2">{m.title}</h2>
                <p className="font-body text-ink/90 mt-1">{m.pitch}</p>
                <div className="mt-3 flex flex-wrap gap-2 items-center font-body text-ink text-sm">
                  <span className="rounded-full bg-white border-2 border-ink px-2 py-0.5 flex items-center gap-1"><Coin className="!w-5 !h-5 !text-[10px]" /> {done ? m.repeatReward.coins : m.reward.coins}</span>
                  {!done && m.reward.badge && <span className="rounded-full bg-white border-2 border-ink px-2 py-0.5">{BADGES[m.reward.badge].icon} badge</span>}
                  {!done && m.reward.unlocks?.some((u) => u.startsWith('pet:')) && <span className="rounded-full bg-white border-2 border-ink px-2 py-0.5">🐾 new pet</span>}
                  <span className="rounded-full bg-white border-2 border-ink px-2 py-0.5">⏱ ~{m.minutes} min</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Passport() {
  const { game, dispatch } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const ranked = (Object.keys(CAREERS) as CareerId[]).map((id) => ({ id, xp: game.careerXp[id] ?? 0 })).sort((a, b) => b.xp - a.xp);
  const strengths = ranked.filter((r) => r.xp >= 40).slice(0, 2);
  const tryNext = ranked.filter((r) => CAREERS[r.id].available && r.xp < 40).slice(0, 2);
  const hero = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];

  return (
    <div className="h-full overflow-auto p-3 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="passport-cover rounded-[30px] border-[4px] border-ink shadow-chunky p-5 sm:p-7 bg-lilac text-white">
          <div className="flex items-center gap-4">
            {hero && <Face c={hero} size={84} />}
            <div className="flex-1">
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold leading-none">Career Passport</h1>
              <p className="font-body mt-2">Level {playerLevel(game.xp)} explorer, {game.xp} XP so far</p>
              <div className="mt-2 h-4 max-w-sm rounded-full bg-white border-[3px] border-ink overflow-hidden"><div className="h-full bg-sun" style={{ width: `${levelProgress(game.xp) * 100}%` }} /></div>
            </div>
          </div>
        </section>

        <StickerBook />

        <section className="rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-4 sm:p-6">
          <h2 className="font-display text-2xl font-extrabold text-ink mb-3">Careers explored</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {(Object.keys(CAREERS) as CareerId[]).map((id) => {
              const c = CAREERS[id]; const xp = game.careerXp[id] ?? 0;
              return (
                <div key={id} className={`flex items-center gap-3 rounded-2xl border-[3px] border-ink p-3 ${c.available ? 'bg-white' : 'bg-ink/5'}`}>
                  <div className="w-14 h-14 rounded-2xl border-[3px] border-ink grid place-items-center text-3xl" style={{ background: c.color }}>{c.icon}</div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-ink text-lg">{c.title} <span className="ml-1 rounded-full bg-ink/10 px-2 text-sm text-ink/80">{c.available ? `Level ${careerLevel(xp)}` : 'Coming soon'}</span></div>
                    <div className="mt-1 h-3 rounded-full bg-ink/10 border-2 border-ink overflow-hidden"><div className="h-full" style={{ width: `${careerProgress(xp) * 100}%`, background: c.color }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border-[4px] border-ink bg-sun shadow-chunky p-4 sm:p-6">
          <h2 className="font-display text-2xl font-extrabold text-ink mb-2">What we noticed</h2>
          {strengths.length === 0
            ? <p className="font-body text-ink">Play some career missions and we’ll notice what you enjoy most!</p>
            : <ul className="space-y-2">{strengths.map((s) => <li key={s.id} className="font-body text-ink text-lg flex gap-2"><span>{CAREERS[s.id].icon}</span>{CAREERS[s.id].strength}</li>)}</ul>}
          {tryNext.length > 0 && <p className="font-body text-ink mt-3">Want to explore something new? Try visiting the {tryNext.map((t) => `${CAREERS[t.id].title.toLowerCase()}’s workplace`).join(' or the ')}.</p>}
        </section>

        <section className="rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-4 sm:p-6">
          <h2 className="font-display text-2xl font-extrabold text-ink mb-3">Badges</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Object.entries(BADGES).map(([id, b]) => {
              const got = game.badges.includes(id);
              return (
                <div key={id} title={b.desc} className={`badge rounded-2xl border-[3px] border-ink p-2 text-center ${got ? 'bg-mint' : 'bg-ink/5'}`}>
                  <div className={`text-4xl ${got ? '' : 'grayscale opacity-40'}`}>{b.icon}</div>
                  <div className="font-body text-xs text-ink mt-1 leading-tight">{got ? b.label : '???'}</div>
                </div>
              );
            })}
          </div>
          <p className="font-body text-ink/80 mt-3">Secrets found: {game.secrets.length} of {Object.keys(SECRETS).length} 🔍 Keep exploring the town!</p>
        </section>

        <section className="rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-4 sm:p-6">
          <h2 className="font-display text-2xl font-extrabold text-ink mb-3">My pets</h2>
          {game.pets.length === 0 && <p className="font-body text-ink">No pets yet. Finish career missions to adopt a puppy, kitten or bunny!</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            {game.pets.map((p) => (
              <div key={p.id} className="rounded-2xl border-[3px] border-ink p-3 flex gap-3 items-center">
                <div className="w-24 h-24 shrink-0"><PetPic p={p} /></div>
                <div className="flex-1">
                  <div className="font-display font-bold text-ink text-xl">{p.name}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.sprite && PET_LOOKS[p.sprite] ? PET_LOOKS[p.sprite].map((lk, i) => (
                      <button key={lk.label} aria-label={lk.label} onClick={() => { sfx('pop'); dispatch({ type: 'SET_PET', pet: { ...p, look: i } }); }}
                        className={`rounded-xl border-2 border-ink p-1 bg-white ${(p.look ?? 0) === i ? 'ring-4 ring-berry' : ''}`}>
                        <img src={lk.src} alt="" style={{ width: 56, height: 56, objectFit: 'contain' }} />
                        <div className="font-body text-xs text-ink">{lk.label}</div>
                      </button>
                    )) : PET_ACCESSORIES.filter((a) => a.id === 'none' || game.owned.includes(`pet:${a.id}`)).map((a) => (
                      <button key={a.id} onClick={() => { sfx('pop'); dispatch({ type: 'SET_PET', pet: { ...p, accessory: a.id } }); }}
                        className={`rounded-xl border-2 border-ink px-2 py-1 font-body text-xs text-ink ${p.accessory === a.id ? 'bg-sun' : 'bg-white'}`}>{a.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border-[4px] border-dashed border-ink/50 p-4 sm:p-6">
          <h2 className="font-display text-xl font-bold text-ink">For grown-ups</h2>
          <p className="font-body text-ink/80 mt-1">CareerTown saves progress only on this device. There are no chats, ads or sharing. In the iPhone and iPad app, a grown-up can buy the optional Style Pack after a grown-ups check; everything else is free. Career suggestions describe what a child enjoyed, never what they should become.</p>
          <Btn tone="white" className="mt-3" onClick={() => setConfirmReset(true)}>Start over</Btn>
        </section>
      </div>
      {confirmReset && (
        <Modal title="Start over?" onClose={() => setConfirmReset(false)}>
          <p className="font-body text-ink">This clears coins, badges, characters and rooms on this device.</p>
          <div className="flex gap-2 mt-4"><Btn tone="berry" onClick={() => { dispatch({ type: 'RESET' }); setConfirmReset(false); }}>Yes, start over</Btn><Btn tone="white" onClick={() => setConfirmReset(false)}>Keep playing</Btn></div>
        </Modal>
      )}
    </div>
  );
}

export function Shop({ onClose }: { onClose: () => void }) {
  const { game, dispatch } = useGame();
  return (
    <Modal title="Town Shop" onClose={onClose} wide>
      <StylePackCard />
      <p className="font-body text-ink/80 -mt-1 mb-3 flex items-center gap-2">Spend pretend coins you earned. You have <Coin /> <b>{game.coins}</b></p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SHOP.map((s) => {
          const owned = game.owned.includes(s.id);
          const can = game.coins >= s.price;
          return (
            <div key={s.id} className={`rounded-2xl border-[3px] border-ink p-3 text-center ${owned ? 'bg-mint/40' : 'bg-white'}`}>
              <div className="text-5xl">{s.icon}</div>
              <div className="font-display font-bold text-ink mt-1 leading-tight">{s.label}</div>
              {owned ? <div className="mt-2 font-display text-ink">✓ Yours</div> : (
                <button disabled={!can} onClick={() => { sfx('coin'); dispatch({ type: 'BUY', id: s.id, price: s.price }); }}
                  className="mt-2 w-full rounded-xl border-[3px] border-ink bg-sun h-11 font-display font-bold text-ink shadow-chunkysm disabled:opacity-40 flex items-center justify-center gap-1">
                  <Coin className="!w-5 !h-5 !text-[10px]" /> {s.price}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="font-body text-ink/70 mt-3 text-sm">Decorations appear in “My stuff” at home. Pet accessories are in your Career Passport.</p>
    </Modal>
  );
}
