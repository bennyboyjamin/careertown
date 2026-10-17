import { useEffect, useState } from 'react';

/** Time of day in town. Follows the device clock unless the player picks one with the sun/moon button. */
export type Phase = 'morning' | 'day' | 'sunset' | 'night';
export const PHASES: Phase[] = ['morning', 'day', 'sunset', 'night'];
export const PHASE_ICON: Record<Phase, string> = { morning: '🌄', day: '☀️', sunset: '🌅', night: '🌙' };
export const PHASE_LABEL: Record<Phase, string> = { morning: 'Morning', day: 'Daytime', sunset: 'Sunset', night: 'Night' };

export function clockPhase(d = new Date()): Phase {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 6 && h < 7.5) return 'morning';
  if (h >= 7.5 && h < 17.5) return 'day';
  if (h >= 17.5 && h < 19.5) return 'sunset';
  return 'night';
}

let chosen: Phase | null = null;   // null = follow the clock
const listeners = new Set<() => void>();
export const currentPhase = () => chosen ?? clockPhase();
/** Next phase in the cycle (the button on the map). */
export function nextPhase() { chosen = PHASES[(PHASES.indexOf(currentPhase()) + 1) % PHASES.length]; listeners.forEach((f) => f()); }

export function useDayPhase(): Phase {
  const [p, setP] = useState<Phase>(currentPhase());
  useEffect(() => {
    const f = () => setP(currentPhase()); listeners.add(f);
    const id = window.setInterval(f, 60_000);   // the clock moves on
    return () => { listeners.delete(f); window.clearInterval(id); };
  }, []);
  return p;
}
