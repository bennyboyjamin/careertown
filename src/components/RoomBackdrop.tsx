import type { SceneDef } from '../data/scenes';
import { INK } from './art/Character';

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0')}`;
}

export function RoomBackdrop({ def }: { def: SceneDef }) {
  const H = def.horizon;
  const w2 = shade(def.wall, -14);
  const f2 = shade(def.floor, -18);
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden>
      <defs>
        <pattern id={`wp-${def.id}`} width="60" height="60" patternUnits="userSpaceOnUse">
          {def.wallPattern === 'dots' && <circle cx="30" cy="30" r="6" fill={w2} />}
          {def.wallPattern === 'stripes' && <rect x="0" y="0" width="22" height="60" fill={w2} />}
          {def.wallPattern === 'tiles' && <rect x="2" y="2" width="56" height="56" rx="8" fill="none" stroke={w2} strokeWidth="4" />}
          {def.wallPattern === 'grid' && <path d="M60 0 L0 0 0 60" fill="none" stroke={w2} strokeWidth="3" />}
        </pattern>
        <pattern id={`fp-${def.id}`} width="120" height="60" patternUnits="userSpaceOnUse">
          {def.floorPattern === 'boards' && <><line x1="0" y1="0" x2="120" y2="0" stroke={f2} strokeWidth="4" /><line x1="60" y1="0" x2="60" y2="30" stroke={f2} strokeWidth="4" /><line x1="0" y1="30" x2="120" y2="30" stroke={f2} strokeWidth="4" /><line x1="20" y1="30" x2="20" y2="60" stroke={f2} strokeWidth="4" /></>}
          {def.floorPattern === 'tiles' && <rect x="2" y="2" width="56" height="56" rx="4" fill="none" stroke={f2} strokeWidth="4" />}
          {def.floorPattern === 'checker' && <><rect x="0" y="0" width="60" height="30" fill={f2} /><rect x="60" y="30" width="60" height="30" fill={f2} /></>}
          {def.floorPattern === 'carpet' && <circle cx="30" cy="30" r="3" fill={f2} />}
        </pattern>
        <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B3A5E" stopOpacity="0.14" /><stop offset="1" stopColor="#5B3A5E" stopOpacity="0" /></linearGradient>
        <linearGradient id="ceilShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B3A5E" stopOpacity="0.12" /><stop offset="1" stopColor="#5B3A5E" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height={H} fill={def.wall} />
      <rect x="0" y="0" width="1000" height={H} fill={`url(#wp-${def.id})`} />
      {def.wallPattern === 'panels' && [0, 1, 2, 3, 4].map((i) => <rect key={i} x={30 + i * 195} y={H - 150} width={160} height={120} rx={14} fill="none" stroke={w2} strokeWidth="6" />)}
      <rect x="0" y={H} width="1000" height={700 - H} fill={def.floor} />
      <rect x="0" y={H} width="1000" height={700 - H} fill={`url(#fp-${def.id})`} />
      <rect x="0" y={H - 14} width="1000" height="18" fill="#fff" stroke="rgba(43,35,80,0.25)" strokeWidth="2" />
      <rect x="0" y={H + 4} width="1000" height="26" fill="url(#floorShade)" />
      <ellipse cx="500" cy={H + 140} rx="420" ry="60" fill="#fff" opacity="0.12" />
      <rect x="0" y="0" width="1000" height="60" fill="url(#ceilShade)" />
    </svg>
  );
}
