/**
 * Nearby playdates (iPhone/iPad app only): two devices in the same room find each other with Apple's
 * MultipeerConnectivity (Wi-Fi/Bluetooth, no internet, no server). The native side is in
 * .github/workflows/ios-app.yml (NearbyBridge); events arrive through window.__nearby.
 */
export type NearbyEvent =
  | { type: 'found' | 'lost' | 'invite'; id: string; name?: string }
  | { type: 'state'; id: string; name?: string; state: 'connecting' | 'connected' | 'disconnected' }
  | { type: 'data'; id: string; data: string };

type Handler = { postMessage: (m: unknown) => Promise<{ ok?: boolean; error?: string }> };
const handler = (): Handler | undefined => (window as unknown as { webkit?: { messageHandlers?: { nearby?: Handler } } }).webkit?.messageHandlers?.nearby;
export const canNearby = () => !!handler();

const listeners = new Set<(e: NearbyEvent) => void>();
(window as unknown as { __nearby: (e: NearbyEvent) => void }).__nearby = (e) => listeners.forEach((f) => f(e));
export function onNearby(f: (e: NearbyEvent) => void) { listeners.add(f); return () => { listeners.delete(f); }; }

const call = (m: Record<string, unknown>) => handler()?.postMessage(m).catch(() => ({ error: 'failed' }));
export const nearby = {
  /** Start looking for friends nearby (and let them see us), shown to them by this name. */
  start: (name: string) => call({ action: 'start', name }),
  stop: () => call({ action: 'stop' }),
  invite: (id: string) => call({ action: 'invite', id }),
  answer: (id: string, accept: boolean) => call({ action: 'answer', id, accept }),
  send: (msg: unknown) => call({ action: 'send', data: JSON.stringify(msg) }),
};
