import { useEffect, useRef, useState } from 'react';
import { BUILDINGS, type BuildingDef } from '../data/buildings';
import { useGame } from '../engine/store';
import { INK } from '../components/art/Character';
import { Person, PetPic } from '../components/Person';
import { sfx } from '../engine/sfx';
import type { BuildingId } from '../engine/types';

const S = { stroke: 'rgba(43,35,80,0.42)', strokeWidth: 2.6, strokeLinejoin: 'round' as const };

function BuildingArt({ b }: { b: BuildingDef }) {
  const w = 200, h = 190;
  const win = (x: number, y: number, k: number) => <rect key={k} x={x} y={y} width={30} height={30} rx={6} fill="#BFEFFF" {...S} strokeWidth={3} />;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{ overflow: 'visible' }} aria-hidden>
      <ellipse cx={100} cy={186} rx={96} ry={10} fill={INK} opacity={0.18} />
      {b.shape === 'house' && <>
        <rect x={30} y={80} width={140} height={104} rx={10} fill={b.wall} {...S} />
        <path d="M14 92 L100 18 L186 92Z" fill={b.roof} {...S} />
        <rect x={136} y={30} width={20} height={36} fill="#fff" {...S} strokeWidth={3} />
        <rect x={84} y={124} width={34} height={60} rx={14} fill={b.roof} {...S} />
        {win(44, 106, 1)}{win(130, 106, 2)}
      </>}
      {b.shape === 'civic' && <>
        <rect x={20} y={74} width={160} height={110} rx={8} fill={b.wall} {...S} />
        <path d="M10 80 L100 18 L190 80Z" fill={b.roof} {...S} />
        {[40, 72, 112, 144].map((x) => <rect key={x} x={x} y={88} width={16} height={92} rx={4} fill="#fff" {...S} strokeWidth={3} />)}
        <rect x={84} y={128} width={32} height={56} rx={12} fill={b.roof} {...S} />
      </>}
      {b.shape === 'tower' && <>
        <rect x={34} y={30} width={132} height={154} rx={12} fill={b.wall} {...S} />
        <rect x={26} y={20} width={148} height={24} rx={10} fill={b.roof} {...S} />
        <path d="M90 56 h20 v16 h16 v20 h-16 v16 h-20 v-16 h-16 v-20 h16Z" fill="#FF5D8F" {...S} strokeWidth={3} />
        {win(48, 124, 1)}{win(122, 124, 2)}
        <rect x={84} y={134} width={32} height={50} rx={6} fill="#BFEFFF" {...S} />
      </>}
      {b.shape === 'lab' && <>
        <rect x={22} y={84} width={156} height={100} rx={12} fill={b.wall} {...S} />
        <path d="M46 88 A54 54 0 0 1 154 88Z" fill={b.roof} {...S} />
        <circle cx={100} cy={64} r={13} fill="#fff" {...S} strokeWidth={3} />
        {win(40, 110, 1)}{win(130, 110, 2)}
        <rect x={82} y={124} width={36} height={60} rx={8} fill={b.roof} {...S} />
      </>}
      {b.shape === 'shop' && <>
        <rect x={24} y={70} width={152} height={114} rx={10} fill={b.wall} {...S} />
        <path d="M16 70 L184 70 L176 104 L24 104Z" fill="#fff" {...S} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${24 + i * 26} 72 l13 0 l-2 30 l-13 0Z`} fill={b.roof} />)}
        <rect x={40} y={118} width={52} height={40} rx={6} fill="#BFEFFF" {...S} strokeWidth={3} />
        <rect x={114} y={118} width={40} height={66} rx={8} fill={b.roof} {...S} />
      </>}
    </svg>
  );
}

export function TownMap({ onEnter }: { onEnter: (id: BuildingId) => void }) {
  const { game, dispatch } = useGame();
  const [bump, setBump] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current; if (!el) return;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) * 0.15);
  }, []);
  const walker = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];
  const pet = game.pets[0];

  const tap = (b: BuildingDef) => {
    setBump(b.id);
    window.setTimeout(() => setBump(null), 400);
    if (!b.playable) { sfx('fail'); dispatch({ type: 'TOAST', text: `${b.name} is coming soon!` }); return; }
    sfx('pop');
    window.setTimeout(() => onEnter(b.id), 260);
  };

  return (
    <div ref={scroller} className="map-scroll h-full w-full overflow-auto">
      <div className="town town-full relative overflow-hidden select-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden>
          <rect width="1000" height="700" fill="#8BD46E" />
          <rect width="1000" height="96" fill="#BDEBFF" />
          <path d="M0 96 Q120 70 240 96 T480 96 T720 96 T1000 96 L1000 110 L0 110Z" fill="#8BD46E" />
          {/* main street */}
          <rect x="0" y="318" width="1000" height="74" fill="#6F6A8F" stroke="rgba(43,35,80,0.4)" strokeWidth="2.6" />
          <line x1="0" y1="355" x2="1000" y2="355" stroke="#FFF36B" strokeWidth="6" strokeDasharray="34 26" />
          <rect x="0" y="292" width="1000" height="26" fill="#EDE6FF" stroke="rgba(43,35,80,0.4)" strokeWidth="2.6" />
          <rect x="0" y="392" width="1000" height="22" fill="#EDE6FF" stroke="rgba(43,35,80,0.4)" strokeWidth="2.6" />
          {/* paths to second row */}
          {[150, 375, 550, 715, 880].map((x) => <rect key={x} x={x - 18} y="412" width="36" height="200" fill="#F7E3B5" stroke="rgba(43,35,80,0.4)" strokeWidth="2" />)}
          {[115, 325, 540, 750, 925].map((x) => <rect key={x} x={x - 16} y="270" width="32" height="24" fill="#F7E3B5" stroke="rgba(43,35,80,0.4)" strokeWidth="2" />)}
          {/* pond & trees */}
          <ellipse cx="470" cy="660" rx="80" ry="26" fill="#7FD3F7" stroke="rgba(43,35,80,0.4)" strokeWidth="2.6" />
          {[[40, 470], [260, 470], [640, 470], [960, 470], [60, 680], [290, 690], [630, 690], [800, 690], [980, 680]].map(([x, y], i) => (
            <g key={i}><rect x={x - 6} y={y - 30} width="12" height="30" fill="#8E5B3F" stroke="rgba(43,35,80,0.4)" strokeWidth="2" /><circle cx={x} cy={y - 46} r="26" fill={i % 2 ? '#5DB84A' : '#4FA83E'} stroke="rgba(43,35,80,0.4)" strokeWidth="2.6" /></g>
          ))}
          {[[120, 520], [700, 520], [940, 520]].map(([x, y], i) => <g key={i}>{[0, 1, 2].map((k) => <circle key={k} cx={x + k * 14} cy={y} r="7" fill={['#FF5D8F', '#FFC93C', '#fff'][k]} stroke="rgba(43,35,80,0.4)" strokeWidth="2" />)}</g>)}
        </svg>

        {/* clouds */}
        <div className="cloud absolute top-[3%] left-[8%] w-[12%] h-[7%]" /><div className="cloud cloud2 absolute top-[6%] left-[60%] w-[10%] h-[6%]" />

        {/* secret balloon */}
        <button aria-label="Hot air balloon" className="balloon absolute top-[1%] w-[6%] h-[13%]" onClick={() => { if (!game.secrets.includes('balloon')) { sfx('sparkle'); dispatch({ type: 'FIND_SECRET', id: 'balloon' }); } else { sfx('pop'); dispatch({ type: 'TOAST', text: 'Wheee! The balloon waves at you.' }); } }}>
          <svg viewBox="0 0 60 90" width="100%" height="100%"><path d="M30 4 C6 4 2 34 22 52 L38 52 C58 34 54 4 30 4Z" fill="#FF7FB5" stroke="rgba(43,35,80,0.4)" strokeWidth="2" /><path d="M30 4 C22 20 22 40 26 52 M30 4 C38 20 38 40 34 52" fill="none" stroke="#FFF36B" strokeWidth="4" /><rect x="22" y="64" width="16" height="14" rx="3" fill="#C98F63" stroke="rgba(43,35,80,0.4)" strokeWidth="2" /><path d="M23 52 L24 64 M37 52 L36 64" stroke="rgba(43,35,80,0.4)" strokeWidth="2" /></svg>
        </button>

        {/* car */}
        <div className="car absolute top-[47.5%] w-[9%] h-[6%]">
          <svg viewBox="0 0 90 44" width="100%" height="100%"><rect x="4" y="14" width="82" height="20" rx="8" fill="#FF8A3D" stroke="rgba(43,35,80,0.4)" strokeWidth="2" /><path d="M20 14 Q26 2 44 2 Q60 2 66 14Z" fill="#BFEFFF" stroke="rgba(43,35,80,0.4)" strokeWidth="2" /><circle cx="24" cy="36" r="7" fill={INK} /><circle cx="68" cy="36" r="7" fill={INK} /></svg>
        </div>

        {/* walker + pet on the sidewalk */}
        {walker && (
          <div className="walker absolute z-10 top-[33.5%] w-[4.2%] h-[11%] pointer-events-none">
            <Person c={walker} mood="happy" />
            {pet && <div className="absolute -right-[85%] bottom-0 w-[80%] h-[42%]"><PetPic p={pet} /></div>}
          </div>
        )}

        {BUILDINGS.map((b) => {
          const h = b.w * 0.95;
          return (
            <button key={b.id} onClick={() => tap(b)} aria-label={b.playable ? `Enter ${b.name}` : `${b.name}, coming soon`}
              className={`building absolute ${b.playable ? '' : 'soon'} ${bump === b.id ? 'bump' : ''}`}
              style={{ left: `${((b.x - b.w / 2) / 1000) * 100}%`, top: `${((b.y - h) / 700) * 100}%`, width: `${(b.w / 1000) * 100}%`, height: `${(h / 700) * 100}%` }}>
              <BuildingArt b={b} />
              <span className="sign absolute left-1/2 -translate-x-1/2 -bottom-[14%] w-max max-w-[118%] leading-tight text-center rounded-2xl border-[3px] border-ink bg-white px-2 sm:px-3 py-0.5 font-display font-bold text-ink text-[1.65cqw] !px-[0.9cqw] !py-[0.15cqw] !border-[0.3cqw] shadow-chunkysm">
                {b.icon} {b.name}
              </span>
              {!b.playable && <span className="absolute -top-[6%] right-[2%] rounded-full border-[3px] border-ink bg-lilac text-white px-[0.8cqw] font-display font-bold text-[1.35cqw] !border-[0.3cqw] rotate-6">Soon</span>}
              {b.playable && b.missions.some((m) => !game.completedMissions[m]) && <span className="mission-dot absolute top-[2%] left-[8%] w-[16%] aspect-square rounded-full bg-berry border-[3px] border-ink grid place-items-center text-white font-display font-extrabold text-[1.8cqw] !border-[0.3cqw]">!</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
