import { ART_WIDE, type SceneDef } from '../data/scenes';
import { INK } from './art/Character';

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0')}`;
}

/** `extend` draws the same wall and floor far past the stage edges, so the room can fill any screen shape. */
export function RoomBackdrop({ def, extend = false }: { def: SceneDef; extend?: boolean }) {
  if (def.outdoor) return <OutdoorBackdrop def={def} extend={extend} />;
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

/** Outdoor places (beach, park, dock, playground, trail): sky, scenery and ground. */
function OutdoorBackdrop({ def, extend }: { def: SceneDef; extend: boolean }) {
  const H = def.horizon; const kind = def.outdoor!;
  const X0 = extend ? -5000 : 0, WW = extend ? 11000 : 1000;
  const sid = `sky-${def.id}${extend ? '-x' : ''}`, gid = `gr-${def.id}${extend ? '-x' : ''}`;
  const ground = { beach: ['#FFE9B0', '#F5CF86'], park: ['#9EDB78', '#6FBF56'], dock: ['#7FD3F7', '#3DA9E6'], playground: ['#F7D3A0', '#E9B57A'], trail: ['#8FCB73', '#5FA557'] }[kind];
  const reps = extend ? [-3, -2, -1, 0, 1, 2, 3] : [0];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden style={extend ? { overflow: 'visible' } : undefined}>
      <defs>
        <linearGradient id={sid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7CCBFF" /><stop offset="1" stopColor="#D9F2FF" /></linearGradient>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ground[0]} /><stop offset="1" stopColor={ground[1]} /></linearGradient>
      </defs>
      <rect x={X0} y={extend ? -5000 : 0} width={WW} height={extend ? H + 5000 : H} fill={`url(#${sid})`} />
      {!extend && <><circle cx="850" cy="110" r="56" fill="#FFE27A" stroke={INK} strokeWidth="5" />
        {[[180, 110, 1], [520, 70, 0.8], [700, 170, 0.6]].map(([x, y, k], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`} fill="#fff" stroke={INK} strokeWidth="4"><ellipse cx="0" cy="10" rx="80" ry="30" /><ellipse cx="-30" cy="-6" rx="40" ry="32" /><ellipse cx="25" cy="-12" rx="44" ry="38" /></g>
        ))}</>}
      {reps.map((r) => <g key={r} transform={`translate(${r * 1000} 0)`}>
        {kind === 'beach' && <><rect x="0" y={H - 110} width="1000" height="110" fill="#3DB5EE" /><path d={`M0 ${H - 110} q 50 -16 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0 t 100 0`} fill="#7FD3F7" stroke={INK} strokeWidth="4" />
          <path d={`M0 ${H - 6} q 60 -18 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`} fill="none" stroke="#fff" strokeWidth="8" opacity=".8" /></>}
        {(kind === 'park' || kind === 'playground') && <path d={`M0 ${H} C 120 ${H - 130} 260 ${H - 130} 380 ${H - 40} C 480 ${H - 150} 680 ${H - 160} 780 ${H - 50} C 860 ${H - 120} 950 ${H - 110} 1000 ${H - 40} L 1000 ${H} Z`} fill="#B6E59A" stroke={INK} strokeWidth="4" />}
        {kind === 'trail' && [60, 170, 290, 420, 560, 690, 820, 940].map((x, i) => <path key={i} d={`M${x} ${H} l 50 -${150 + (i % 3) * 30} l 50 ${150 + (i % 3) * 30} Z`} fill={i % 2 ? '#4E9A5A' : '#5FAE64'} stroke={INK} strokeWidth="4" />)}
        {kind === 'dock' && <><path d={`M0 ${H} C 150 ${H - 90} 300 ${H - 90} 450 ${H - 20} C 600 ${H - 100} 800 ${H - 110} 1000 ${H - 20} L 1000 ${H} Z`} fill="#8FCB73" stroke={INK} strokeWidth="4" /></>}
      </g>)}
      <rect x={X0} y={H} width={WW} height={extend ? 5000 : 700 - H} fill={`url(#${gid})`} />
      <line x1={X0} y1={H} x2={X0 + WW} y2={H} stroke={INK} strokeWidth="4" />
      {reps.map((r) => <g key={`f${r}`} transform={`translate(${r * 1000} 0)`}>
        {kind === 'dock' && <><rect x="0" y={H + 70} width="1000" height={700 - H - 70} fill="#C08A5B" />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1="0" y1={H + 70 + i * 30} x2="1000" y2={H + 70 + i * 30} stroke="#8A5A33" strokeWidth="4" />)}
          <line x1="0" y1={H + 70} x2="1000" y2={H + 70} stroke={INK} strokeWidth="4" />
          {[60, 300, 540, 780].map((x) => <rect key={x} x={x} y={H + 40} width="22" height="40" rx="6" fill="#8A5A33" stroke={INK} strokeWidth="3" />)}</>}
        {kind === 'trail' && <path d={`M420 ${H} L 580 ${H} L 760 700 L 240 700 Z`} fill="#D9B27C" opacity=".85" />}
        {(kind === 'park' || kind === 'trail') && Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${(i * 47) % 1000} ${H + 30 + ((i * 53) % (680 - H))} l 6 -14 l 6 14`} fill="none" stroke="#4E9A3E" strokeWidth="3" />)}
        {(kind === 'beach' || kind === 'playground') && Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 61) % 1000} cy={H + 20 + ((i * 37) % (680 - H))} r="3" fill="#D9A866" />)}
      </g>)}
    </svg>
  );
}
