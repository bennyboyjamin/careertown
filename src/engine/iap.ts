import { useEffect, useState } from 'react';

/**
 * Real-money purchases (iPhone/iPad app only). The native app adds a `store` message handler
 * (StoreKit 2, see .github/workflows/ios-app.yml); on the website nothing can be bought.
 * What's owned is remembered on this device and checked with Apple again every launch.
 */
type Reply = { ok?: boolean; cancelled?: boolean; pending?: boolean; error?: string; owned?: string[]; products?: { id: string; price: string }[] };
type Handler = { postMessage: (m: unknown) => Promise<Reply> };
const handler = (): Handler | undefined => (window as unknown as { webkit?: { messageHandlers?: { store?: Handler } } }).webkit?.messageHandlers?.store;

export const canBuy = () => !!handler();

const KEY = 'careertown:iap-owned';
let owned = new Set<string>(read());
const listeners = new Set<() => void>();
function read(): string[] { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; } }
function setOwned(ids: string[]) {
  owned = new Set(ids);
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* private mode: owned for this session only */ }
  listeners.forEach((f) => f());
}
async function call(action: string, id?: string): Promise<Reply> {
  const h = handler(); if (!h) return { error: 'Purchases work in the iPhone and iPad app.' };
  try { return (await h.postMessage({ action, id })) ?? {}; } catch (e) { return { error: String(e) }; }
}

export const isOwned = (id: string) => owned.has(id);
/** Re-renders when what's owned changes. */
export function useOwned(id: string) {
  const [v, setV] = useState(isOwned(id));
  useEffect(() => { const f = () => setV(isOwned(id)); listeners.add(f); f(); return () => { listeners.delete(f); }; }, [id]);
  return v;
}

/** Ask Apple what this Apple ID owns (quietly, at launch). */
export async function refreshOwned() {
  if (!handler()) return;
  const r = await call('owned'); if (r.owned) setOwned(r.owned);
}
export async function priceOf(id: string): Promise<string | undefined> {
  const r = await call('products', id); return r.products?.find((p) => p.id === id)?.price;
}
export async function buy(id: string): Promise<Reply> {
  const r = await call('buy', id); if (r.ok) setOwned([...owned, id]); return r;
}
export async function restore(): Promise<Reply> {
  const r = await call('restore'); if (r.owned) setOwned(r.owned); return r;
}
