import type { PetSpecies } from '../../engine/types';
import { PET_ACCESSORIES } from '../../data/catalog';
import { INK } from './Character';

const ST = { stroke: 'rgba(43,35,80,0.42)', strokeWidth: 2.2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export function PetArt({ species, accessory = 'none', sleeping = false, bandage = false }: { species: PetSpecies; accessory?: string; sleeping?: boolean; bandage?: boolean }) {
  const pup = species === 'puppy';
  const bun = species === 'bunny';
  const body = pup ? '#E3A869' : bun ? '#F4EDE4' : '#F2A65A';
  const dark = pup ? '#8E5B3F' : bun ? '#FFB0C8' : '#C9733A';
  const acc = PET_ACCESSORIES.find((a) => a.id === accessory);
  const eyes = sleeping
    ? <g fill="none" {...ST} strokeWidth={2.6}><path d="M44 42 Q48 45 52 42" /><path d="M58 42 Q62 45 66 42" /></g>
    : <g fill={INK}><circle cx={47} cy={41} r={3.6} /><circle cx={63} cy={41} r={3.6} /><circle cx={48.3} cy={39.6} r={1.2} fill="#fff" /><circle cx={64.3} cy={39.6} r={1.2} fill="#fff" /></g>;
  return (
    <svg viewBox="0 0 110 100" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }} aria-hidden>
      {/* tail */}
      {bun ? <circle cx={92} cy={66} r={10} fill="#fff" {...ST} /> : <>
      {pup ? <path d="M86 66 Q102 52 96 40" fill="none" {...ST} strokeWidth={6.5} /> : <path d="M86 70 Q108 64 100 36" fill="none" {...ST} strokeWidth={8} />}
      {pup ? <path d="M86 66 Q102 52 96 40" fill="none" stroke={body} strokeWidth={3} strokeLinecap="round" /> : <path d="M86 70 Q108 64 100 36" fill="none" stroke={body} strokeWidth={3.5} strokeLinecap="round" />}</>}
      {/* body */}
      <ellipse cx={58} cy={sleeping ? 78 : 72} rx={34} ry={sleeping ? 16 : 22} fill={body} {...ST} />
      {species === 'kitten' && !sleeping && <path d="M48 56 L50 66 M60 54 L60 66 M72 56 L70 66" stroke={dark} strokeWidth={3} strokeLinecap="round" />}
      {!sleeping && [36, 50, 66, 80].map((x) => <rect key={x} x={x - 5} y={80} width={10} height={14} rx={5} fill={body} {...ST} />)}
      {/* head */}
      <g transform={sleeping ? 'translate(-8 18)' : undefined}>
        {bun
          ? <><ellipse cx={45} cy={6} rx={8} ry={22} fill={body} {...ST} transform="rotate(-8 45 26)" /><ellipse cx={45} cy={8} rx={3.5} ry={15} fill={dark} transform="rotate(-8 45 26)" /><ellipse cx={66} cy={6} rx={8} ry={22} fill={body} {...ST} transform="rotate(8 66 26)" /><ellipse cx={66} cy={8} rx={3.5} ry={15} fill={dark} transform="rotate(8 66 26)" /></>
          : pup
          ? <><ellipse cx={30} cy={40} rx={9} ry={17} fill={dark} {...ST} transform="rotate(18 30 40)" /><ellipse cx={80} cy={40} rx={9} ry={17} fill={dark} {...ST} transform="rotate(-18 80 40)" /></>
          : <><path d="M34 34 L36 12 L52 26Z" fill={body} {...ST} /><path d="M76 34 L74 12 L58 26Z" fill={body} {...ST} /><path d="M38 28 L39 18 L46 25Z" fill="#FFB0C8" /><path d="M72 28 L71 18 L64 25Z" fill="#FFB0C8" /></>}
        <circle cx={55} cy={42} r={24} fill={body} {...ST} />
        <ellipse cx={55} cy={52} rx={12} ry={9} fill="#FFF3E2" {...ST} strokeWidth={2.4} />
        <ellipse cx={55} cy={48} rx={4.5} ry={3.2} fill={bun ? '#FF7FB5' : INK} />
        {bun && <rect x={52} y={56} width={6} height={6} rx={1.5} fill="#fff" stroke={INK} strokeWidth={1.6} />}
        <path d="M51 55 Q55 58 59 55" fill="none" {...ST} strokeWidth={2.2} />
        {!pup && <g stroke={INK} strokeWidth={1.6}><path d="M40 50 L26 47 M40 54 L27 56 M70 50 L84 47 M70 54 L83 56" /></g>}
        {eyes}
        {acc && acc.id.startsWith('collar') && <path d="M36 62 Q55 72 74 62" fill="none" stroke={acc.color} strokeWidth={6} strokeLinecap="round" />}
        {acc && acc.id.startsWith('bow') && <g {...ST} strokeWidth={2.2} fill={acc.color}><path d="M70 22 L60 14 L60 30Z" /><path d="M70 22 L80 14 L80 30Z" /></g>}
      </g>
      {bandage && <rect x={60} y={64} width={18} height={9} rx={3} fill="#FFD6A5" {...ST} strokeWidth={2} transform="rotate(-15 69 68)" />}
    </svg>
  );
}
