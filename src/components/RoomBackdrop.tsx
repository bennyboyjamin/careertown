import { ART_WIDE, type SceneDef } from '../data/scenes';
import { INK } from './art/Character';

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0')}`;
}

/** `extend` draws the same wall and floor far past the stage edges, so the room can fill any screen shape. */
export function RoomBackdrop({ def, extend = false }: { def: SceneDef; extend?: boolean }) {
  if (def.art) {
    // Painted room: the image is ART_WIDE times wider than the room, centred, so wide screens see more wall and floor.
    return (
      <>
        {extend && <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden style={{ overflow: 'visible' }}>
          <rect x={-5000} y={-5000} width={11000} height={5000 + def.horizon} fill={def.wall} />
          <rect x={-5000} y={def.horizon} width={11000} height={5000} fill={def.floor} />
        </svg>}
        <img src={def.art} alt="" draggable={false} aria-hidden className="absolute pointer-events-none select-none"
          style={{ left: `${-((ART_WIDE - 1) / 2) * 100}%`, top: 0, width: `${ART_WIDE * 100}%`, height: '100%', maxWidth: 'none' }} />
      </>
    );
  }
  const H = def.horizon;
  const w2 = shade(def.wall, -14);
  const f2 = shade(def.floor, -18);
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden style={extend ? { overflow: 'visible' } : undefined}>
      <defs>
        <pattern id={`wp-${def.id}${extend ? '-x' : ''}`} width="60" height="60" patternUnits="userSpaceOnUse">
          {def.wallPattern === 'dots' && <circle cx="30" cy="30" r="6" fill={w2} />}
          {def.wallPattern === 'stripes' && <rect x="0" y="0" width="22" height="60" fill={w2} />}
          {def.wallPattern === 'tiles' && <rect x="2" y="2" width="56" height="56" rx="8" fill="none" stroke={w2} strokeWidth="4" />}
          {def.wallPattern === 'grid' && <path d="M60 0 L0 0 0 60" fill="none" stroke={w2} strokeWidth="3" />}
        </pattern>
        <pattern id={`fp-${def.id}${extend ? '-x' : ''}`} width="120" height="60" patternUnits="userSpaceOnUse">
          {def.floorPattern === 'boards' && <><line x1="0" y1="0" x2="120" y2="0" stroke={f2} strokeWidth="4" /><line x1="60" y1="0" x2="60" y2="30" stroke={f2} strokeWidth="4" /><line x1="0" y1="30" x2="120" y2="30" stroke={f2} strokeWidth="4" /><line x1="20" y1="30" x2="20" y2="60" stroke={f2} strokeWidth="4" /></>}
          {def.floorPattern === 'tiles' && <rect x="2" y="2" width="56" height="56" rx="4" fill="none" stroke={f2} strokeWidth="4" />}
          {def.floorPattern === 'checker' && <><rect x="0" y="0" width="60" height="30" fill={f2} /><rect x="60" y="30" width="60" height="30" fill={f2} /></>}
          {def.floorPattern === 'carpet' && <circle cx="30" cy="30" r="3" fill={f2} />}
        </pattern>
        <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B3A5E" stopOpacity="0.14" /><stop offset="1" stopColor="#5B3A5E" stopOpacity="0" /></linearGradient>
        <linearGradient id="ceilShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B3A5E" stopOpacity="0.12" /><stop offset="1" stopColor="#5B3A5E" stopOpacity="0" /></linearGradient>
      </defs>
      <rect x={extend ? -5000 : 0} y={extend ? -5000 : 0} width={extend ? 11000 : 1000} height={extend ? H + 5000 : H} fill={def.wall} />
      <rect x={extend ? -5000 : 0} y={extend ? -5000 : 0} width={extend ? 11000 : 1000} height={extend ? H + 5000 : H} fill={`url(#wp-${def.id}${extend ? '-x' : ''})`} />
      {def.wallPattern === 'panels' && [0, 1, 2, 3, 4].map((i) => <rect key={i} x={30 + i * 195} y={H - 150} width={160} height={120} rx={14} fill="none" stroke={w2} strokeWidth="6" />)}
      <rect x={extend ? -5000 : 0} y={H} width={extend ? 11000 : 1000} height={extend ? 5000 : 700 - H} fill={def.floor} />
      <rect x={extend ? -5000 : 0} y={H} width={extend ? 11000 : 1000} height={extend ? 5000 : 700 - H} fill={`url(#fp-${def.id}${extend ? '-x' : ''})`} />
      <rect x={extend ? -5000 : 0} y={H - 14} width={extend ? 11000 : 1000} height="18" fill="#fff" stroke="rgba(43,35,80,0.25)" strokeWidth="2" />
      <rect x={extend ? -5000 : 0} y={H + 4} width={extend ? 11000 : 1000} height="26" fill="url(#floorShade)" />
      {!extend && <ellipse cx="500" cy={H + 140} rx="420" ry="60" fill="#fff" opacity="0.12" />}
    </svg>
  );
}
