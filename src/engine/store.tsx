import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import type { CareerId, CharacterData, Entity, GameState, PetData, Reward, SceneId } from './types';
import { initialScene } from '../data/scenes';
import { BADGES, SECRETS } from '../data/catalog';
import { MISSIONS } from '../data/missions';
import { dailyFor, todayKey } from '../data/daily';
import { localSave, SAVE_VERSION, ACTIVE_PROFILE, type SaveAdapter } from './save';
import { uid } from './ids';
import { setSoundEnabled, sfx } from './sfx';

// ── Defaults ───────────────────────────────────────────
export const DEFAULT_CHARACTERS: CharacterData[] = [
  { id: 'kai', name: 'Kai', age: 'child', look: {
    skin: '#C98B5B', face: 'round', eyes: 'happy', hair: 'curly', hairColor: '#2B1B12', top: 'star', topColor: '#FFC93C',
    bottom: 'shorts', bottomColor: '#3D7BFF', shoes: '#FF5D8F', glasses: 'none', hat: 'none', accessory: 'none' } },
  { id: 'rosa', name: 'Rosa', age: 'adult', look: {
    skin: '#F6CBA5', face: 'oval', eyes: 'lashes', hair: 'long', hairColor: '#A8652F', top: 'sweater', topColor: '#5FE0B7',
    bottom: 'jeans', bottomColor: '#3D7BFF', shoes: '#2B2350', glasses: 'round', hat: 'none', accessory: 'necklace' } },
];

export function freshGame(): GameState {
  const date = todayKey();
  const kitchen = initialScene('home-kitchen');
  kitchen.push(
    { id: 'char-kai', kind: 'character', ref: 'kai', x: 420, y: 660, pose: 'stand' },
    { id: 'char-rosa', kind: 'character', ref: 'rosa', x: 270, y: 670, pose: 'stand' },
  );
  return {
    version: SAVE_VERSION, playerName: 'Player', coins: 20, xp: 0, careerXp: {}, badges: [],
    completedMissions: {}, owned: [], characters: DEFAULT_CHARACTERS, pets: [],
    scenes: { 'home-kitchen': kitchen }, secrets: [],
    daily: { date, id: dailyFor(date).id, progress: 0, done: false },
    stats: {}, settings: { sound: true }, activeCharacterId: 'kai', seenIntro: false,
  };
}

export const playerLevel = (xp: number) => 1 + Math.floor(xp / 150);
export const levelProgress = (xp: number) => (xp % 150) / 150;

// ── Actions ────────────────────────────────────────────
export interface Popup { id: string; title: string; reward: Reward }
interface Root { game: GameState; queue: Popup[]; toast?: { id: string; text: string } }

export type Action =
  | { type: 'LOAD'; game: GameState }
  | { type: 'PATCH_ENTITIES'; scene: SceneId; patches: { id: string; patch: Partial<Entity> }[] }
  | { type: 'ENSURE_SCENE'; scene: SceneId }
  | { type: 'ADD_ENTITY'; scene: SceneId; entity: Entity }
  | { type: 'REMOVE_ENTITIES'; scene: SceneId; ids: string[] }
  | { type: 'PLACE_ACTOR'; to: SceneId; entity: Entity }  // characters & pets exist in one room at a time
  | { type: 'REMOVE_ACTOR'; kind: Entity['kind']; ref: string }
  | { type: 'REWARD'; reward: Reward }
  | { type: 'COMPLETE_MISSION'; id: string }
  | { type: 'EVENT'; name: string }
  | { type: 'FIND_SECRET'; id: string }
  | { type: 'SAVE_CHARACTER'; character: CharacterData }
  | { type: 'DELETE_CHARACTER'; id: string }
  | { type: 'SET_ACTIVE'; id: string }
  | { type: 'BUY'; id: string; price: number }
  | { type: 'SET_PET'; pet: PetData }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SEEN_INTRO' }
  | { type: 'DISMISS_POPUP' }
  | { type: 'TOAST'; text: string }
  | { type: 'RESET' };

export const sceneOf = (g: GameState, id: SceneId): Entity[] => g.scenes[id] ?? initialScene(id);

const PET_NAMES: Record<string, string> = { puppy: 'Biscuit', kitten: 'Mochi', bunny: 'Pebble' };

/** Free-play actions also grow career XP so the discovery panel can notice what a kid enjoys. */
const EVENT_CAREER: Record<string, [CareerId, number]> = {
  medical: ['doctor', 6], 'pet-care': ['vet', 6], draw: ['teacher', 30], tower4: ['engineer', 25], cook: ['entrepreneur', 0],
};

function applyReward(g: GameState, r: Reward): GameState {
  const next: GameState = { ...g, coins: g.coins + (r.coins ?? 0), xp: g.xp + (r.xp ?? 0) };
  if (r.career && r.careerXp) next.careerXp = { ...g.careerXp, [r.career]: (g.careerXp[r.career] ?? 0) + r.careerXp };
  if (r.badge && !g.badges.includes(r.badge)) next.badges = [...g.badges, r.badge];
  for (const u of r.unlocks ?? []) {
    if (u === 'pet:puppy' || u === 'pet:kitten' || u === 'pet:bunny') {
      const species = u.slice(4) as PetData['species'];
      if (next.pets.some((p) => p.species === species)) continue;
      const pet: PetData = { id: uid('pet'), species, name: PET_NAMES[species], accessory: 'none' };
      next.pets = [...next.pets, pet];
      const living = sceneOf(next, 'home-living');
      next.scenes = { ...next.scenes, 'home-living': [...living, { id: uid('petent'), kind: 'pet', ref: pet.id, x: 300 + Math.random() * 300, y: 660, pose: 'stand' }] };
    } else if (!next.owned.includes(u)) {
      next.owned = [...next.owned, u];
    }
  }
  return next;
}

function withPopup(root: Root, game: GameState, reward: Reward, title: string): Root {
  return { ...root, game: applyReward(game, reward), queue: [...root.queue, { id: uid('pop'), title, reward }] };
}

function reducer(root: Root, a: Action): Root {
  const g = root.game;
  const setScene = (scene: SceneId, list: Entity[]): Root => ({ ...root, game: { ...g, scenes: { ...g.scenes, [scene]: list } } });

  switch (a.type) {
    case 'LOAD': return { ...root, game: a.game };
    case 'PATCH_ENTITIES': {
      const map = new Map(a.patches.map((p) => [p.id, p.patch]));
      return setScene(a.scene, sceneOf(g, a.scene).map((e) => (map.has(e.id) ? { ...e, ...map.get(e.id) } : e)));
    }
    case 'ENSURE_SCENE': return g.scenes[a.scene] ? root : setScene(a.scene, initialScene(a.scene));
    case 'ADD_ENTITY': return setScene(a.scene, [...sceneOf(g, a.scene), a.entity]);
    case 'REMOVE_ENTITIES': {
      const ids = new Set(a.ids);
      return setScene(a.scene, sceneOf(g, a.scene)
        .filter((e) => !ids.has(e.id))
        .map((e) => (e.holding && ids.has(e.holding) ? { ...e, holding: undefined } : e)));
    }
    case 'PLACE_ACTOR':
    case 'REMOVE_ACTOR': {
      const kind = a.type === 'PLACE_ACTOR' ? a.entity.kind : a.kind;
      const ref = a.type === 'PLACE_ACTOR' ? a.entity.ref : a.ref;
      const scenes: GameState['scenes'] = {};
      for (const [id, list] of Object.entries(g.scenes) as [SceneId, Entity[]][]) {
        const leaving = list.find((e) => e.kind === kind && e.ref === ref);
        scenes[id] = list
          .filter((e) => !(e.kind === kind && e.ref === ref))
          // whatever they were holding stays behind in the old room
          .map((e) => (leaving && e.heldBy === leaving.id ? { ...e, heldBy: undefined, x: leaving.x + 40, y: leaving.y } : e));
      }
      if (a.type === 'PLACE_ACTOR') scenes[a.to] = [...(scenes[a.to] ?? initialScene(a.to)), a.entity];
      return { ...root, game: { ...g, scenes } };
    }
    case 'REWARD': return withPopup(root, g, a.reward, a.reward.title ?? 'Nice work!');
    case 'COMPLETE_MISSION': {
      const m = MISSIONS[a.id];
      const times = g.completedMissions[a.id] ?? 0;
      const reward = times === 0 ? m.reward : m.repeatReward;
      const game = { ...g, completedMissions: { ...g.completedMissions, [a.id]: times + 1 } };
      const r1 = withPopup(root, game, reward, reward.title ?? 'Mission complete!');
      return reducer(r1, { type: 'EVENT', name: `mission:${a.id}` });
    }
    case 'EVENT': {
      let game: GameState = { ...g, stats: { ...g.stats, [a.name]: (g.stats[a.name] ?? 0) + 1 } };
      let r: Root = { ...root, game };
      const ce = EVENT_CAREER[a.name];
      if (ce && ce[1]) game = r.game = { ...game, careerXp: { ...game.careerXp, [ce[0]]: (game.careerXp[ce[0]] ?? 0) + ce[1] } };
      // Daily challenge
      const today = todayKey();
      let daily = game.daily.date === today ? game.daily : { date: today, id: dailyFor(today).id, progress: 0, done: false };
      const def = dailyFor(today);
      if (!daily.done && def.event === a.name) {
        daily = { ...daily, progress: daily.progress + 1 };
        if (daily.progress >= def.target) {
          daily = { ...daily, done: true };
          r = withPopup(r, { ...game, daily }, { coins: def.coins, xp: 30 }, 'Daily challenge done!');
          game = r.game;
        }
      }
      game = { ...game, daily };
      r = { ...r, game };
      // Free-play badges
      const badge = (id: string, cond: boolean, extra: Reward = {}) => {
        if (cond && !r.game.badges.includes(id)) r = withPopup(r, r.game, { badge: id, xp: 25, coins: 15, ...extra }, `New badge: ${BADGES[id].label}!`);
      };
      badge('chef', (game.stats.cook ?? 0) >= 3);
      badge('artist', (game.stats.draw ?? 0) >= 1);
      return r;
    }
    case 'FIND_SECRET': {
      if (g.secrets.includes(a.id)) return { ...root, toast: { id: uid('t'), text: 'You already found this secret!' } };
      const s = SECRETS[a.id];
      let r = withPopup(root, { ...g, secrets: [...g.secrets, a.id] }, s.reward, s.reward.title ?? 'Secret found!');
      if (r.game.secrets.length >= 3 && !r.game.badges.includes('explorer'))
        r = withPopup(r, r.game, { badge: 'explorer', coins: 30, xp: 40 }, 'New badge: Explorer!');
      return reducer(r, { type: 'EVENT', name: 'secret' });
    }
    case 'SAVE_CHARACTER': {
      const exists = g.characters.some((c) => c.id === a.character.id);
      const characters = exists ? g.characters.map((c) => (c.id === a.character.id ? a.character : c)) : [...g.characters, a.character];
      return { ...root, game: { ...g, characters, activeCharacterId: a.character.id } };
    }
    case 'DELETE_CHARACTER': {
      const r = reducer(root, { type: 'REMOVE_ACTOR', kind: 'character', ref: a.id });
      return { ...r, game: { ...r.game, characters: r.game.characters.filter((c) => c.id !== a.id) } };
    }
    case 'SET_ACTIVE': return { ...root, game: { ...g, activeCharacterId: a.id } };
    case 'BUY': {
      if (g.coins < a.price || g.owned.includes(a.id)) return root;
      return { ...root, game: { ...g, coins: g.coins - a.price, owned: [...g.owned, a.id] }, toast: { id: uid('t'), text: 'Bought! Find it in your stuff.' } };
    }
    case 'SET_PET': return { ...root, game: { ...g, pets: g.pets.map((p) => (p.id === a.pet.id ? a.pet : p)) } };
    case 'TOGGLE_SOUND': return { ...root, game: { ...g, settings: { ...g.settings, sound: !g.settings.sound } } };
    case 'SEEN_INTRO': return { ...root, game: { ...g, seenIntro: true } };
    case 'DISMISS_POPUP': return { ...root, queue: root.queue.slice(1) };
    case 'TOAST': return { ...root, toast: { id: uid('t'), text: a.text } };
    case 'RESET': return { game: freshGame(), queue: [] };
  }
}

// ── Context ────────────────────────────────────────────
interface Ctx { game: GameState; queue: Popup[]; toast?: Root['toast']; dispatch: (a: Action) => void }
const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children, adapter = localSave }: { children: ReactNode; adapter?: SaveAdapter }) {
  const [root, dispatch] = useReducer(reducer, undefined, () => ({ game: freshGame(), queue: [] }));
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    adapter.load(ACTIVE_PROFILE).then((saved) => {
      if (saved && saved.version === SAVE_VERSION) dispatch({ type: 'LOAD', game: { ...freshGame(), ...saved } });
      setLoaded(true);
    });
  }, [adapter]);

  useEffect(() => {
    setSoundEnabled(root.game.settings.sound);
    if (!loaded) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void adapter.save(ACTIVE_PROFILE, root.game), 400);
  }, [root.game, loaded, adapter]);

  const prevQueue = useRef(0);
  useEffect(() => {
    if (root.queue.length > prevQueue.current) sfx('success');
    prevQueue.current = root.queue.length;
  }, [root.queue.length]);

  if (!loaded) return null;
  return <GameCtx.Provider value={{ game: root.game, queue: root.queue, toast: root.toast, dispatch }}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error('useGame outside GameProvider');
  return c;
}
