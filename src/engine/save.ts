import type { GameState } from './types';

/**
 * Save adapters. The game only talks to this interface, so cloud saves
 * (e.g. Supabase, one row per child profile) can be swapped in later without
 * touching gameplay code.
 */
export interface SaveAdapter {
  load(profileId: string): Promise<GameState | null>;
  save(profileId: string, state: GameState): Promise<void>;
  clear(profileId: string): Promise<void>;
}

const KEY = (id: string) => `careertown:save:${id}`;

export const localSave: SaveAdapter = {
  async load(id) {
    try {
      const raw = localStorage.getItem(KEY(id));
      return raw ? (JSON.parse(raw) as GameState) : null;
    } catch { return null; }
  },
  async save(id, state) {
    try { localStorage.setItem(KEY(id), JSON.stringify(state)); } catch { /* storage full or blocked */ }
  },
  async clear(id) {
    try { localStorage.removeItem(KEY(id)); } catch { /* ignore */ }
  },
};

/*
 * Future: Supabase adapter sketch (not bundled in the MVP).
 *
 * export const supabaseSave = (client: SupabaseClient): SaveAdapter => ({
 *   async load(profileId) {
 *     const { data } = await client.from('saves').select('state').eq('profile_id', profileId).single();
 *     return data?.state ?? null;
 *   },
 *   async save(profileId, state) {
 *     await client.from('saves').upsert({ profile_id: profileId, state, updated_at: new Date().toISOString() });
 *   },
 *   async clear(profileId) { await client.from('saves').delete().eq('profile_id', profileId); },
 * });
 *
 * Parent accounts own many child `profiles`; row-level security keeps each
 * family's saves private. No chat, no public profiles, no multiplayer.
 */

export const SAVE_VERSION = 1;
export const ACTIVE_PROFILE = 'local-child-1';
