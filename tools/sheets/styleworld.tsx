import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import { CharacterArt, charViewBox, shade, type Mood } from '../../src/components/art/Character2';
import { PetArt } from '../../src/components/art/Pet';
import type { Look, Pose } from '../../src/engine/types';

// ── Style helpers (same "colored line" rule as the characters) ──
const ln = (f: string) => (f.toLowerCase() === '#ffffff' ? '#B4B8D2' : shade(f, -28));
const S = (fill: string, w = 2.2) => ({ fill, stroke: ln(fill), strokeWidth: Math.min(w, 2.4), strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });
let k = 0; const K = () => `k${k++}`;
const R = (x: number, y: number, w: number, h: number, fill: string, rx = 10, sw = 3) => <rect key={K()} x={x} y={y} width={w} height={h} rx={rx} {...S(fill, sw)} />;
const shadow = (cx: number, cy: number, rx: number, ry = 6) => <ellipse key={K()} cx={cx} cy={cy} rx={rx} ry={ry} fill="#5B3A5E" opacity={0.13} />;
const glow = (cx: number, cy: number, r: number, o = 0.55) => <circle key={K()} cx={cx} cy={cy} r={r} fill="url(#glow)" opacity={o} />;

const base: Look = { skin: '#E8AE7E', face: 'round', eyes: 'dot', hair: 'short', hairColor: '#2B1B12', top: 'tee', topColor: '#7FD3F7', bottom: 'pants', bottomColor: '#A98BFF', shoes: '#FF5D8F', glasses: 'none', hat: 'none', accessory: 'none' };
type C = { look: Partial<Look>; age?: 'child' | 'adult'; pose?: Pose; mood?: Mood };
function ch(c: C, x: number, foot: number, s0: number) {
  const s = s0 * 1.18;
  const age = c.age ?? 'child', pose = c.pose ?? 'stand';
  const look = { ...base, ...c.look } as Look;
  const vb = charViewBox(age, pose === 'sit' ? 'sit' : 'stand', look.build ?? 'average');
  const el = CharacterArt({ look, age, pose, mood: c.mood ?? 'normal' }) as ReactElement;
  const w = 120 * s, h = vb.h * s;
  return [shadow(x, foot + 2, w * 0.3, 5 * s), cloneElement(el, { key: K(), x: x - w / 2, y: foot - h, width: w, height: h, style: undefined } as never)];
}
function headOf(c: C, cx: number, cy: number, size: number) {
  const el = CharacterArt({ look: { ...base, ...c.look } as Look, age: c.age ?? 'child', mood: c.mood ?? 'normal' }) as ReactElement;
  return cloneElement(el, { key: K(), x: cx - size / 2, y: cy - size / 2, width: size, height: size, viewBox: '16 -22 88 92', style: undefined } as never);
}
function pet(species: 'puppy' | 'kitten' | 'bunny', x: number, foot: number, w: number, sleeping = false, acc = 'none') {
  const el = PetArt({ species, sleeping, accessory: acc }) as ReactElement;
  return [shadow(x, foot, w * 0.35, 4), cloneElement(el, { key: K(), x: x - w / 2, y: foot - w * 0.9, width: w, height: w * 0.9 * (100 / 90), style: undefined } as never)];
}

export const MILA: C = { age: 'child', look: { skin: '#C98B5B', face: 'oval', eyes: 'big', hair: 'long', hairColor: '#24160E', top: 'sweatshirt', topColor: '#B9A3F0', bottom: 'widejeans', bottomColor: '#6E95DB', shoes: '#FF8FB5', shoeAccent: '#5FE0B7', accessory: 'crossbody' } };

// ── Room shell ──
function room(x: number, y: number, w: number, h: number, wall: string, pat: string, floor: string, floorPat = 'boards') {
  const fy = y + h - 46;
  return [
    <rect key={K()} x={x} y={y} width={w} height={h} fill={wall} />,
    <rect key={K()} x={x} y={y} width={w} height={h - 46} fill={`url(#${pat})`} />,
    <rect key={K()} x={x} y={fy} width={w} height={46} fill={floor} />,
    <rect key={K()} x={x} y={fy} width={w} height={46} fill={`url(#${floorPat})`} />,
    <rect key={K()} x={x} y={fy - 8} width={w} height={9} fill="#FFFFFF" stroke={ln(wall)} strokeWidth={2} />,
    <rect key={K()} x={x} y={y} width={w} height={40} fill="url(#ceil)" />,
  ];
}

// ── Props ──
const books = (x: number, y: number, n: number) => Array.from({ length: n }, (_, i) => <rect key={K()} x={x + i * 11} y={y - (24 + (i % 3) * 4)} width={9} height={24 + (i % 3) * 4} rx={2} {...S(['#FF8FB5', '#FFC93C', '#7FD3F7', '#8BD46E', '#B9A3F0'][i % 5], 2)} />);
const plant = (x: number, y: number, s = 1) => <g key={K()} transform={`translate(${x} ${y}) scale(${s})`}>{[-35, -10, 15, 35].map((r, i) => <ellipse key={i} cx={0} cy={-46} rx={10} ry={26} {...S(i % 2 ? '#7FCB6A' : '#5DB858', 2.2)} transform={`rotate(${r} 0 -14)`} />)}<path d="M-16 -16 L16 -16 L12 0 L-12 0Z" {...S('#FFB27A', 2.4)} /><path d="M-14 -11 L14 -11" stroke="#fff" strokeWidth={2} opacity={0.5} /></g>;
const lamp = (x: number, y: number, h: number, shadeCol = '#FFE08A') => [glow(x, y - h + 8, 90), <g key={K()}><rect x={x - 2} y={y - h + 16} width={4} height={h - 18} fill="#8E7AA8" /><ellipse cx={x} cy={y - 2} rx={16} ry={5} {...S('#B9A3F0', 2)} /><path d={`M${x - 20} ${y - h + 24} L${x - 12} ${y - h} L${x + 12} ${y - h} L${x + 20} ${y - h + 24}Z`} {...S(shadeCol, 2.4)} /></g>];
const bin = (x: number, y: number, w: number, h: number, c: string) => <g key={K()}><rect x={x} y={y} width={w} height={h} rx={7} {...S(c, 2.4)} /><rect x={x + w / 2 - 7} y={y + 6} width={14} height={5} rx={2.5} fill={shade(c, -25)} /></g>;
const bear = (x: number, y: number, s = 1) => <g key={K()} transform={`translate(${x} ${y}) scale(${s})`}>{[[-9, -26], [9, -26]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={5} {...S('#D9A066', 2)} />)}<ellipse cx={0} cy={-8} rx={12} ry={10} {...S('#D9A066', 2)} /><circle cx={0} cy={-22} r={10} {...S('#D9A066', 2)} /><ellipse cx={0} cy={-19} rx={4} ry={3} fill="#FFE3C2" /><circle cx={-3.5} cy={-24} r={1.4} fill="#2B2350" /><circle cx={3.5} cy={-24} r={1.4} fill="#2B2350" /></g>;
const ball = (x: number, y: number, r: number, c: string) => <g key={K()}><circle cx={x} cy={y - r} r={r} {...S(c, 2.2)} /><path d={`M${x - r} ${y - r} Q${x} ${y - r - 6} ${x + r} ${y - r}`} fill="none" stroke="#fff" strokeWidth={2.4} /></g>;
const backpack = (x: number, y: number, c: string, s = 1) => <g key={K()} transform={`translate(${x} ${y}) scale(${s})`}><path d="M-8 -40 Q0 -50 8 -40" fill="none" stroke={ln(c)} strokeWidth={3} /><rect x={-16} y={-40} width={32} height={40} rx={10} {...S(c, 2.4)} /><path d="M-16 -28 Q0 -20 16 -28" fill="none" stroke={ln(c)} strokeWidth={2} /><rect x={-9} y={-16} width={18} height={11} rx={4} {...S(shade(c, 25), 2)} /></g>;
const frame = (x: number, y: number, w: number, h: number, inner: ReactNode, c = '#FFFFFF') => <g key={K()}><rect x={x} y={y} width={w} height={h} rx={6} {...S(c, 2.6)} /><g>{inner}</g></g>;
const hanger = (x: number, y: number, c: string, kind: number) => <g key={K()}><path d={`M${x} ${y} q0 -6 4 -6`} fill="none" stroke="#9AA0BF" strokeWidth={2} />{kind === 0 && <path d={`M${x - 16} ${y + 6} L${x - 6} ${y} L${x + 6} ${y} L${x + 16} ${y + 6} L${x + 12} ${y + 14} L${x + 10} ${y + 12} L${x + 10} ${y + 44} L${x - 10} ${y + 44} L${x - 10} ${y + 12} L${x - 12} ${y + 14}Z`} {...S(c, 2.2)} />}{kind === 1 && <path d={`M${x - 8} ${y} L${x + 8} ${y} L${x + 10} ${y + 16} L${x + 20} ${y + 58} L${x - 20} ${y + 58} L${x - 10} ${y + 16}Z`} {...S(c, 2.2)} />}{kind === 2 && <path d={`M${x - 14} ${y + 2} L${x + 14} ${y + 2} L${x + 16} ${y + 50} L${x + 2} ${y + 50} L${x} ${y + 20} L${x - 2} ${y + 50} L${x - 16} ${y + 50}Z`} {...S(c, 2.2)} />}{kind === 1 && [0, 1, 2].map((i) => <circle key={i} cx={x - 8 + i * 8} cy={y + 34 + (i % 2) * 8} r={2} fill="#fff" opacity={0.8} />)}{kind === 0 && <path d={`M${x - 10} ${y + 24} L${x + 10} ${y + 24} M${x - 10} ${y + 32} L${x + 10} ${y + 32}`} stroke="#fff" strokeWidth={3} opacity={0.6} />}</g>;
const rack = (x0: number, x1: number, top: number, floor: number, cols: string[]) => [<g key={K()}><rect x={x0} y={top} width={x1 - x0} height={5} rx={2.5} fill="#B8A9D9" /><rect x={x0} y={top} width={4} height={floor - top} fill="#B8A9D9" /><rect x={x1 - 4} y={top} width={4} height={floor - top} fill="#B8A9D9" /><rect x={x0 - 8} y={floor - 4} width={20} height={5} rx={2.5} fill="#8E7AA8" /><rect x={x1 - 12} y={floor - 4} width={20} height={5} rx={2.5} fill="#8E7AA8" /></g>, ...cols.map((c, i) => hanger(x0 + 18 + i * ((x1 - x0 - 36) / Math.max(1, cols.length - 1)), top + 6, c, i % 3))];
const sneaker = (x: number, y: number, c: string, a: string) => <g key={K()}><path d={`M${x} ${y} Q${x} ${y - 12} ${x + 10} ${y - 12} Q${x + 14} ${y - 6} ${x + 24} ${y - 5} Q${x + 28} ${y - 3} ${x + 28} ${y}Z`} {...S(c, 2)} /><rect x={x - 1} y={y - 2} width={30} height={4} rx={2} {...S('#ffffff', 1.4)} /><path d={`M${x + 6} ${y - 8} l8 2`} stroke={a} strokeWidth={2.4} strokeLinecap="round" /></g>;
const hat = (x: number, y: number, c: string, kind: number) => kind === 0
  ? <g key={K()}><ellipse cx={x} cy={y} rx={22} ry={5} {...S(c, 2)} /><path d={`M${x - 12} ${y - 1} Q${x - 12} ${y - 18} ${x} ${y - 18} Q${x + 12} ${y - 18} ${x + 12} ${y - 1}Z`} {...S(c, 2)} /><rect x={x - 12} y={y - 7} width={24} height={4} fill="#FF8FB5" /></g>
  : kind === 1 ? <g key={K()}><path d={`M${x - 14} ${y} Q${x - 14} ${y - 20} ${x} ${y - 20} Q${x + 14} ${y - 20} ${x + 14} ${y}Z`} {...S(c, 2)} /><circle cx={x} cy={y - 22} r={4.5} {...S('#ffffff', 1.6)} /><rect x={x - 15} y={y - 5} width={30} height={6} rx={3} {...S(shade(c, 20), 1.6)} /></g>
  : <g key={K()}><path d={`M${x - 13} ${y} Q${x - 13} ${y - 16} ${x} ${y - 16} Q${x + 13} ${y - 16} ${x + 13} ${y}Z`} {...S(c, 2)} /><path d={`M${x} ${y - 4} Q${x + 18} ${y - 6} ${x + 26} ${y}Z`} {...S(shade(c, -15), 2)} /></g>;
const cup = (x: number, y: number, c = '#ffffff') => <g key={K()}><path d={`M${x - 7} ${y - 12} L${x + 7} ${y - 12} L${x + 5} ${y} L${x - 5} ${y}Z`} {...S(c, 1.8)} /><path d={`M${x + 6} ${y - 9} q5 0 4 4 q-1 3 -5 2`} fill="none" stroke={ln(c)} strokeWidth={1.8} /><path d={`M${x - 2} ${y - 16} q-3 -4 0 -8 M${x + 3} ${y - 16} q-3 -4 0 -8`} fill="none" stroke="#C9B8E8" strokeWidth={1.6} strokeLinecap="round" /></g>;
const plate = (x: number, y: number, food: string) => <g key={K()}><ellipse cx={x} cy={y} rx={16} ry={5} {...S('#ffffff', 1.8)} /><ellipse cx={x} cy={y - 4} rx={9} ry={6} {...S(food, 1.8)} /></g>;
const pendant = (x: number, y0: number, len: number, c: string) => [glow(x, y0 + len + 30, 80, 0.5), <g key={K()}><line x1={x} y1={y0} x2={x} y2={y0 + len} stroke="#8E7AA8" strokeWidth={2} /><path d={`M${x - 16} ${y0 + len + 16} Q${x - 16} ${y0 + len} ${x} ${y0 + len} Q${x + 16} ${y0 + len} ${x + 16} ${y0 + len + 16}Z`} {...S(c, 2.2)} /><ellipse cx={x} cy={y0 + len + 17} rx={7} ry={3} fill="#FFF6C8" /></g>];
const windowW = (x: number, y: number, w: number, h: number, curtain = '#FF9FBF') => <g key={K()}><rect x={x} y={y} width={w} height={h} rx={10} {...S('#BFEAFF', 3)} /><circle cx={x + w * 0.72} cy={y + h * 0.32} r={h * 0.13} fill="#FFF3A6" /><path d={`M${x + 8} ${y + h * 0.78} q${w * 0.12} -${h * 0.2} ${w * 0.3} -${h * 0.06} q${w * 0.1} -${h * 0.1} ${w * 0.24} 0 l0 ${h * 0.06}Z`} fill="#fff" /><line x1={x + w / 2} x2={x + w / 2} y1={y + 2} y2={y + h - 2} stroke={ln('#BFEAFF')} strokeWidth={2.4} /><path d={`M${x - 6} ${y - 4} Q${x + 14} ${y + h / 2} ${x + 4} ${y + h + 6} L${x - 8} ${y + h + 6}Z`} {...S(curtain, 2.2)} /><path d={`M${x + w + 6} ${y - 4} Q${x + w - 14} ${y + h / 2} ${x + w - 4} ${y + h + 6} L${x + w + 8} ${y + h + 6}Z`} {...S(curtain, 2.2)} /><rect x={x - 12} y={y - 9} width={w + 24} height={6} rx={3} fill="#C9A7E8" /></g>;

// ── Scene ──
function scene() {
  const out: ReactNode[] = [];
  const push = (...n: ReactNode[]) => out.push(...n);
  // sky, hills, clouds
  push(<rect key={K()} width={1920} height={1080} fill="url(#sky)" />);
  push(<path key={K()} d="M0 520 Q240 440 520 500 T1100 470 T1920 450 L1920 1080 L0 1080Z" fill="#BFE6A8" />);
  push(<path key={K()} d="M920 590 Q1160 520 1420 560 T1920 540 L1920 1080 L920 1080Z" fill="#A6DB8C" stroke="#8CC774" strokeWidth={3} />);
  [[180, 70, 1], [700, 50, 0.8], [1350, 80, 1.1], [1700, 140, 0.7]].forEach(([x, y, s]) => push(<g key={K()} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.95}><ellipse cx={0} cy={20} rx={70} ry={22} fill="#fff" /><circle cx={-24} cy={6} r={26} fill="#fff" /><circle cx={16} cy={0} r={34} fill="#fff" /></g>));

  // ═══ School (back row) ═══
  push(<path key={K()} d="M940 300 L1200 210 L1460 300Z" {...S('#F2A07B')} />, R(1170, 160, 60, 70, '#FFE3C2', 8), <path key={K()} d="M1160 165 L1200 130 L1240 165Z" {...S('#F2A07B')} />, <circle key={K()} cx={1200} cy={196} r={12} {...S('#FFC93C', 2.4)} />);
  push(R(950, 296, 500, 268, '#FFE8C7', 12));
  push(...room(972, 322, 456, 228, '#FFF6E2', 'dotsY', '#E8B98D'));
  push(<rect key={K()} x={994} y={344} width={160} height={86} rx={8} {...S('#4E8C79', 3)} />, <path key={K()} d="M1012 412 l12 -30 l12 30 M1018 400 h12 M1050 384 q14 -8 20 4 q6 12 -8 16 q16 4 8 14 q-8 8 -20 0" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />, <path key={K()} d="M1112 372 l5 10 l11 1 l-8 8 l2 11 l-10 -5 l-10 5 l2 -11 l-8 -8 l11 -1Z" fill="#FFF3A6" />);
  push(<circle key={K()} cx={1190} cy={366} r={20} {...S('#ffffff', 2.6)} />, <path key={K()} d="M1190 366 L1190 352 M1190 366 L1200 371" stroke="#6B6191" strokeWidth={2.6} strokeLinecap="round" />);
  for (let i = 0; i < 4; i++) push(R(1300 + (i % 2) * 58, 350 + Math.floor(i / 2) * 58, 52, 52, '#FFFFFF', 6, 2.4), backpack(1326 + (i % 2) * 58, 398 + Math.floor(i / 2) * 58, ['#FF8FB5', '#7FD3F7', '#FFC93C', '#8BD46E'][i], 0.85));
  [1010, 1110, 1210].forEach((x, i) => {
    push(...ch({ look: [{ skin: '#7A4A2B', hair: 'braids', hairColor: '#24160E', top: 'tee', topColor: '#FFC93C', bottom: 'skirt', bottomColor: '#7FD3F7' }, { skin: '#FCE3CF', hair: 'spiky', hairColor: '#E9B44C', top: 'stripes', topColor: '#5FE0B7', bottom: 'shorts' }, { skin: '#A0663F', hair: 'afropuff', top: 'hoodie', topColor: '#FF8FB5', bottom: 'jeans', bottomColor: '#6E95DB' }][i], pose: 'sit', mood: i === 1 ? 'happy' : 'normal' }, x + 30, 540, 0.62));
    push(<g key={K()}><rect x={x} y={500} width={64} height={10} rx={4} {...S('#E6B07C', 2.2)} /><rect x={x + 6} y={510} width={52} height={32} rx={4} {...S('#FFC93C', 2.2)} /></g>);
  });
  push(...ch({ age: 'adult', look: { skin: '#E8AE7E', face: 'oval', hair: 'bob', hairColor: '#8E8E9A', glasses: 'round', top: 'sweater', topColor: '#8BD46E', bottom: 'skirt', bottomColor: '#3F4275', shoes: '#3F4275' }, pose: 'wave', mood: 'happy' }, 1255, 545, 0.66));

  // ═══ Playground (back right) ═══
  push(<g key={K()}><rect x={1872} y={380} width={16} height={180} rx={6} {...S('#B98258', 2.4)} /><circle cx={1880} cy={360} r={56} {...S('#6CC266', 3)} /><circle cx={1846} cy={392} r={34} {...S('#7FCB6A', 3)} /></g>);
  push(<g key={K()}><path d="M1500 560 L1530 400 L1560 560 M1640 560 L1610 400 L1580 560" fill="none" stroke="#FF9F6E" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /><rect x={1522} y={392} width={96} height={12} rx={6} {...S('#FF9F6E', 2.4)} /><line x1={1556} y1={404} x2={1556} y2={500} stroke="#9AA0BF" strokeWidth={2.4} /><line x1={1586} y1={404} x2={1586} y2={500} stroke="#9AA0BF" strokeWidth={2.4} /><rect x={1548} y={498} width={46} height={8} rx={4} {...S('#FFC93C', 2.2)} /></g>);
  push(...ch({ look: { skin: '#5A3520', hair: 'buns', hairColor: '#24160E', top: 'tee', topColor: '#FFB27A', bottom: 'shorts', bottomColor: '#B9A3F0', shoes: '#7FD3F7' }, pose: 'sit', mood: 'happy' }, 1571, 512, 0.6).slice(1));
  push(<g key={K()}><rect x={1700} y={430} width={14} height={130} rx={5} {...S('#7FD3F7', 2.4)} />{[455, 480, 505, 530].map((y) => <line key={y} x1={1700} x2={1740} y1={y} y2={y} stroke="#5FB8E0" strokeWidth={4} />)}<rect x={1736} y={430} width={14} height={130} rx={5} {...S('#7FD3F7', 2.4)} /><rect x={1694} y={418} width={62} height={16} rx={6} {...S('#FFC93C', 2.4)} /><path d="M1750 430 Q1800 440 1820 520 Q1828 552 1856 556 L1856 568 Q1816 568 1806 528 Q1790 456 1750 448Z" {...S('#FF8FB5', 2.6)} /></g>);
  push(R(1640, 540, 70, 22, '#F7DFA8', 8, 2.4), <g key={K()}><path d="M1660 540 l4 -14 l12 0 l4 14Z" {...S('#FF8FB5', 2)} /><circle cx={1690} cy={536} r={6} {...S('#FFC93C', 2)} /></g>);

  // ═══ House ═══
  push(<path key={K()} d="M14 292 L130 156 Q146 136 176 136 L744 136 Q774 136 790 156 L926 292Z" {...S('#F48C8C', 3.5)} />);
  for (let r = 0; r < 3; r++) push(<path key={K()} d={`M${120 - r * 34} ${186 + r * 34} L${820 + r * 34} ${186 + r * 34}`} stroke="#E07272" strokeWidth={3} strokeDasharray="22 12" />);
  push(R(690, 92, 48, 60, '#E8B4A0', 6), <circle key={K()} cx={470} cy={210} r={34} {...S('#FFF0C9', 3)} />, glow(470, 210, 50, 0.6));
  [440, 458, 476, 494].forEach((x, i) => push(<circle key={K()} cx={x} cy={194 + (i % 2) * 6} r={4} fill={['#FF8FB5', '#FFC93C', '#5FE0B7', '#B9A3F0'][i]} />));
  push(R(30, 282, 880, 680, '#FFF1E4', 14, 3.5));
  // upper floor
  push(...room(46, 296, 292, 300, '#FFD9E6', 'dotsP', '#E7B48A'));
  push(...room(346, 296, 222, 300, '#D3F4EC', 'tiles', '#BFE3EA', 'tilesF'));
  push(...room(576, 296, 318, 300, '#E9DFFF', 'stripesL', '#D9B48C'));
  push(R(30, 596, 880, 18, '#F2D4B8', 4, 3));
  push(...room(46, 614, 332, 300, '#FFF0C9', 'checkY', '#E3A776', 'checkF'));
  push(...room(386, 614, 292, 300, '#D9EEFF', 'stripesB', '#C98F63'));
  push(...room(686, 614, 208, 300, '#FFE6CC', 'paws', '#E8BC8C'));
  push(R(30, 912, 880, 48, '#E8C7A8', 6, 3));

  // Bedroom
  push(windowW(70, 330, 96, 86), frame(196, 330, 58, 76, <g><rect x={202} y={336} width={46} height={64} rx={4} fill="#FFF3D6" /><path d="M210 380 a15 15 0 0 1 30 0" fill="none" stroke="#FF8FB5" strokeWidth={4} /><path d="M215 380 a10 10 0 0 1 20 0" fill="none" stroke="#FFC93C" strokeWidth={4} /><path d="M220 380 a5 5 0 0 1 10 0" fill="none" stroke="#7FD3F7" strokeWidth={4} /></g>));
  push(<rect key={K()} x={272} y={418} width={60} height={6} rx={3} fill="#C9A7E8" />, ...books(276, 418, 5));
  push(<ellipse key={K()} cx={180} cy={560} rx={110} ry={14} fill="#FFB0C8" stroke="#F08FAE" strokeWidth={2.4} />);
  push(<g key={K()}><rect x={56} y={448} width={30} height={104} rx={12} {...S('#B9A3F0')} /><rect x={74} y={500} width={160} height={30} rx={12} {...S('#ffffff')} /><ellipse cx={104} cy={498} rx={26} ry={12} {...S('#ffffff')} /><path d="M128 494 L232 494 Q238 494 238 502 L238 530 L128 530Z" {...S('#7FD3F7')} />{[146, 170, 194, 218].map((x, i) => <path key={x} d={`M${x} ${500 + (i % 2) * 8} l5 0 l0 5 l-5 0Z`} fill="#fff" opacity={0.8} />)}<rect x={70} y={528} width={168} height={18} rx={6} {...S('#9A85D6')} /></g>);
  push(bear(160, 494, 0.95));
  push(R(242, 506, 34, 46, '#FFB27A', 7), ...lamp(259, 506, 40));
  push(bin(282, 520, 24, 32, '#5FE0B7'), bin(308, 520, 24, 32, '#FFC93C'), bin(295, 490, 24, 30, '#FF8FB5'));
  push(backpack(214, 556, '#FF8FB5', 0.9), ball(128, 556, 9, '#FFC93C'));
  // Bathroom
  push(<circle key={K()} cx={516} cy={372} r={32} {...S('#FFE08A', 3)} />, <circle key={K()} cx={516} cy={372} r={24} fill="#DDF6FF" />, <path key={K()} d="M502 366 l14 -12 M506 380 l20 -18" stroke="#fff" strokeWidth={4} strokeLinecap="round" />);
  push(<g key={K()}><rect x={512} y={450} width={14} height={102} rx={5} {...S('#ffffff')} /><path d="M484 440 L552 440 Q550 470 518 470 Q486 470 484 440Z" {...S('#ffffff')} /><path d="M518 440 L518 424 L530 424" fill="none" stroke="#B7C6D6" strokeWidth={4} strokeLinecap="round" /><rect x={538} y={424} width={10} height={16} rx={3} {...S('#7FD3F7', 2)} /></g>);
  push(<g key={K()}><path d="M354 480 L470 480 Q470 548 430 552 L388 552 Q354 548 354 480Z" {...S('#ffffff')} />{[[372, 472, 12], [392, 466, 15], [414, 472, 12], [436, 468, 14], [454, 474, 10]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" stroke="#BFE3EA" strokeWidth={2} />)}<path d="M420 456 q2 -10 10 -8 q6 2 4 8 l6 2 q-4 6 -12 4 q-8 0 -8 -6Z" {...S('#FFC93C', 1.8)} /></g>);
  push(<g key={K()}><rect x={360} y={380} width={56} height={5} rx={2.5} fill="#C9A7E8" /><path d="M370 385 L404 385 L404 432 Q387 438 370 432Z" {...S('#FF8FB5', 2.4)} /><path d="M370 420 L404 420" stroke="#fff" strokeWidth={3} opacity={0.7} /></g>, plant(552, 552, 0.7));
  // Fashion closet
  push(...rack(592, 760, 352, 552, ['#FF8FB5', '#FFC93C', '#B9A3F0', '#5FE0B7', '#FF9F6E', '#7FD3F7']));
  push(R(772, 404, 112, 148, '#FFFFFF', 10), ...[442, 486, 530].map((y) => <rect key={K()} x={776} y={y} width={104} height={4} rx={2} fill="#E3D7FF" />));
  [[780, 440, '#FF8FB5', '#5FE0B7'], [826, 440, '#7FD3F7', '#FFC93C'], [780, 484, '#FFC93C', '#FF8FB5'], [826, 484, '#B9A3F0', '#fff'], [780, 528, '#5FE0B7', '#B9A3F0'], [826, 528, '#FF9F6E', '#7FD3F7']].forEach(([x, y, c, a]) => push(sneaker(x as number, y as number, c as string, a as string)));
  push(hat(796, 402, '#FFC93C', 0), hat(842, 400, '#FF8FB5', 1), hat(874, 402, '#7FD3F7', 2));
  push(<ellipse key={K()} cx={630} cy={540} rx={28} ry={14} {...S('#FF9FBF')} />, <ellipse key={K()} cx={630} cy={533} rx={22} ry={7} fill="#FFC2D6" />);
  push(...ch({ look: { skin: '#F6CBA5', face: 'round', eyes: 'lashes', hair: 'wavy', hairColor: '#E9B44C', top: 'star', topColor: '#FFC93C', bottom: 'skirt', bottomColor: '#FF8FB5', shoes: '#B9A3F0', hat: 'beanie', accessory: 'none' }, mood: 'proud' }, 706, 552, 0.92));
  // Kitchen
  push(windowW(244, 640, 100, 66, '#FFC93C'));
  push(R(140, 640, 84, 54, '#FFB27A', 8), <line key={K()} x1={182} x2={182} y1={642} y2={692} stroke={ln('#FFB27A')} strokeWidth={2.4} />);
  push(<g key={K()}><rect x={54} y={704} width={78} height={164} rx={14} {...S('#EAF7FF')} /><line x1={54} x2={132} y1={762} y2={762} stroke={ln('#EAF7FF')} strokeWidth={2.4} /><rect x={118} y={720} width={6} height={30} rx={3} fill="#B7C6D6" /><rect x={118} y={772} width={6} height={44} rx={3} fill="#B7C6D6" /><circle cx={78} cy={730} r={6} fill="#FF8FB5" /><rect x={70} y={786} width={22} height={16} rx={2} fill="#fff" stroke="#C6D2E0" strokeWidth={1.6} /></g>);
  push(<g key={K()}><rect x={138} y={790} width={170} height={78} rx={8} {...S('#7FD3F7')} /><rect x={134} y={780} width={178} height={14} rx={6} {...S('#ffffff')} /><line x1={196} x2={196} y1={798} y2={864} stroke={ln('#7FD3F7')} strokeWidth={2} /><rect x={226} y={798} width={74} height={50} rx={8} {...S('#4A4766')} /></g>);
  push(<g key={K()}><path d="M240 780 L240 762 Q240 754 248 754 L284 754 Q292 754 292 762 L292 780Z" {...S('#FF9F6E', 2.4)} /><path d="M252 748 q-4 -10 2 -18 M266 748 q-4 -10 2 -18 M280 748 q-4 -10 2 -18" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.9} /></g>);
  push(<g key={K()}><path d="M150 780 Q170 794 190 780Z" {...S('#ffffff', 2)} /><circle cx={160} cy={774} r={7} {...S('#FF5D5D', 1.8)} /><circle cx={174} cy={772} r={7} {...S('#8BD46E', 1.8)} /><circle cx={167} cy={764} r={6} {...S('#FFC93C', 1.8)} /></g>, ...[0, 1, 2].map((i) => <ellipse key={K()} cx={214} cy={779 - i * 5} rx={14} ry={4} {...S('#ffffff', 1.8)} />));
  push(...pendant(338, 614, 70, '#FFC93C'));
  push(<g key={K()}><rect x={300} y={826} width={74} height={10} rx={4} {...S('#E6B07C', 2.4)} /><rect x={308} y={836} width={8} height={32} fill="#C9935F" /><rect x={358} y={836} width={8} height={32} fill="#C9935F" /></g>, plate(322, 826, '#FFC93C'), plate(354, 826, '#8BD46E'));
  push(...ch({ age: 'adult', look: { skin: '#7A4A2B', face: 'square', hair: 'locs', hairColor: '#24160E', top: 'tee', topColor: '#FF9F6E', bottom: 'pants', bottomColor: '#3F4275', shoes: '#FFC93C', build: 'round' }, mood: 'happy' }, 168, 868, 0.82));
  // Living room
  push(frame(406, 650, 54, 44, <g><rect x={412} y={656} width={42} height={32} fill="#BFEAFF" /><path d="M412 688 L428 668 L440 680 L446 674 L454 688Z" fill="#8BD46E" /></g>), frame(470, 640, 40, 56, <g><rect x={476} y={646} width={28} height={44} fill="#FFE3EE" /><circle cx={490} cy={662} r={8} fill="#FF8FB5" /></g>), frame(520, 652, 60, 40, <g><rect x={526} y={658} width={48} height={28} fill="#FFF3D6" /><path d="M534 680 q8 -14 16 0 q8 -14 16 0" fill="none" stroke="#B9A3F0" strokeWidth={3} /></g>, '#FFC93C'));
  push(<ellipse key={K()} cx={520} cy={880} rx={130} ry={14} fill="#FFE08A" stroke="#F2C760" strokeWidth={2.4} />);
  push(<g key={K()}><rect x={398} y={760} width={210} height={70} rx={26} {...S('#5FB8C9')} /><rect x={398} y={812} width={210} height={44} rx={16} {...S('#7FD0DE')} /><rect x={388} y={792} width={34} height={66} rx={14} {...S('#5FB8C9')} /><rect x={584} y={792} width={34} height={66} rx={14} {...S('#5FB8C9')} /><rect x={430} y={774} width={44} height={36} rx={12} {...S('#FFC93C', 2.4)} transform="rotate(-8 452 792)" /><line x1={503} x2={503} y1={816} y2={852} stroke={ln('#7FD0DE')} strokeWidth={2} /></g>);
  push(...ch({ age: 'adult', look: { skin: '#F3D6B8', face: 'oval', eyes: 'sleepy', hair: 'bob', hairColor: '#D9D9E3', glasses: 'round', top: 'sweater', topColor: '#FF9FBF', bottom: 'pants', bottomColor: '#8E7AA8', shoes: '#7FD3F7', build: 'round' }, pose: 'sit', mood: 'happy' }, 548, 856, 0.78));
  push(...lamp(642, 868, 120, '#FFE3A6'), plant(394, 868, 0.8), <g key={K()}><rect x={470} y={856} width={16} height={14} rx={3} {...S('#FF8FB5', 1.8)} /><rect x={488} y={856} width={16} height={14} rx={3} {...S('#7FD3F7', 1.8)} /><rect x={479} y={843} width={16} height={14} rx={3} {...S('#FFC93C', 1.8)} /></g>);
  // Pet room
  push(frame(790, 640, 70, 70, <g><rect x={796} y={646} width={58} height={58} fill="#FFF6E2" /><ellipse cx={825} cy={684} rx={12} ry={10} fill="#FF9F6E" />{[[810, 664], [820, 658], [830, 658], [840, 664]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={4.5} fill="#FF9F6E" />)}</g>));
  push(<g key={K()}><rect x={712} y={720} width={14} height={148} rx={6} {...S('#E8C7A8', 2.4)} />{[728, 760].map((y, i) => <rect key={y} x={700 + i * 8} y={y} width={60 - i * 8} height={12} rx={6} {...S('#B9A3F0', 2.4)} />)}<rect x={700} y={854} width={60} height={14} rx={6} {...S('#B9A3F0', 2.4)} /></g>);
  push(...pet('kitten', 728, 730, 52).slice(1));
  push(<ellipse key={K()} cx={800} cy={860} rx={44} ry={12} {...S('#FF8FB5', 2.4)} />, ...pet('puppy', 800, 864, 74, true, 'collar-red'));
  push(...pet('bunny', 866, 868, 50));
  push(<g key={K()}><path d="M752 868 l4 -10 l20 0 l4 10Z" {...S('#5FE0B7', 2)} /><circle cx={766} cy={857} r={4} fill="#C9935F" /></g>, ball(868, 840, 6, '#FFC93C'));

  // ═══ Café (front) ═══
  push(R(948, 628, 452, 332, '#FFE9D6', 12, 3.5));
  push(...room(966, 676, 416, 270, '#F7E3CF', 'stripesC', '#C98F63'));
  push(<path key={K()} d={`M938 614 L1410 614 L1410 650 ${Array.from({ length: 9 }, (_, i) => { const x0 = 1410 - i * (472 / 9); const x1 = x0 - 472 / 9; return `Q${(x0 + x1) / 2} 676 ${x1} 650`; }).join(' ')} Z`} {...S('#FF9F6E', 3)} />);
  for (let i = 0; i < 9; i += 2) push(<path key={K()} d={`M${938 + i * (472 / 9)} 614 L${938 + (i + 1) * (472 / 9)} 614 L${938 + (i + 1) * (472 / 9)} 650 L${938 + i * (472 / 9)} 650Z`} fill="#FFF1E4" opacity={0.85} />);
  push(<circle key={K()} cx={1174} cy={596} r={34} {...S('#ffffff', 3)} />, cup(1174, 608, '#FF9F6E'));
  push(...pendant(1040, 676, 40, '#FFC93C'), ...pendant(1210, 676, 30, '#FF8FB5'), ...pendant(1330, 676, 40, '#5FE0B7'));
  push(<rect key={K()} x={1170} y={714} width={120} height={70} rx={10} {...S('#4A4766', 3)} />, cup(1196, 760, '#ffffff'), <path key={K()} d="M1226 756 q8 -16 20 -12 q10 4 6 16Z" fill="#FFC93C" />, <path key={K()} d="M1266 744 l3 -3 a3 3 0 0 1 5 4 l-8 8 l-8 -8 a3 3 0 0 1 5 -4Z" fill="#FF8FB5" />);
  push(...ch({ age: 'adult', look: { skin: '#A0663F', face: 'oval', eyes: 'lashes', hair: 'topknot', hairColor: '#24160E', top: 'polo', topColor: '#5FE0B7', bottom: 'pants', bottomColor: '#3F4275', accessory: 'none' }, mood: 'happy' }, 1300, 940, 0.76).slice(1));
  push(<g key={K()}><rect x={1322} y={790} width={44} height={50} rx={8} {...S('#B7C6D6', 2.4)} /><rect x={1330} y={798} width={28} height={14} rx={4} fill="#4A4766" /></g>);
  push(<g key={K()}><rect x={1150} y={840} width={236} height={106} rx={10} {...S('#FFB27A')} /><rect x={1146} y={830} width={244} height={14} rx={6} {...S('#ffffff')} /><rect x={1162} y={856} width={120} height={56} rx={8} fill="#E7F7FF" stroke="#B7D6E6" strokeWidth={2.4} />{[[1180, 896, '#FFC93C'], [1206, 896, '#FF8FB5'], [1232, 896, '#C98F63'], [1258, 896, '#B9A3F0'], [1192, 876, '#FF9F6E'], [1222, 876, '#FFC93C'], [1252, 876, '#FF8FB5']].map(([x, y, c], i) => <ellipse key={i} cx={x as number} cy={y as number} rx={10} ry={7} {...S(c as string, 1.8)} />)}</g>, cup(1310, 830, '#FF8FB5'), cup(1350, 830, '#7FD3F7'));
  push(<g key={K()}><rect x={1076} y={872} width={68} height={10} rx={5} {...S('#E6B07C', 2.4)} /><rect x={1106} y={882} width={8} height={60} fill="#C9935F" /><ellipse cx={1110} cy={944} rx={22} ry={5} fill="#C9935F" /></g>);
  push(...ch({ age: 'adult', look: { skin: '#FCE3CF', face: 'square', hair: 'short', hairColor: '#C9473A', top: 'stripes', topColor: '#7FD3F7', bottom: 'jeans', bottomColor: '#3F4275', shoes: '#FF9F6E', glasses: 'square', build: 'slim' }, pose: 'sit', mood: 'happy' }, 1066, 940, 0.74), cup(1100, 872, '#FFC93C'), plate(1128, 872, '#FF8FB5'));
  push(plant(1390, 944, 0.8));

  // ═══ Boutique (front) ═══
  push(R(1418, 612, 494, 348, '#FFE3EE', 12, 3.5));
  push(...room(1436, 664, 458, 282, '#FFF0F5', 'stripesP', '#E7C2A0'));
  push(<path key={K()} d={`M1408 600 L1922 600 L1922 636 ${Array.from({ length: 10 }, (_, i) => { const x0 = 1922 - i * 51.4; const x1 = x0 - 51.4; return `Q${(x0 + x1) / 2} 660 ${x1} 636`; }).join(' ')} Z`} {...S('#B9A3F0', 3)} />);
  push(<circle key={K()} cx={1664} cy={580} r={30} {...S('#ffffff', 3)} />, <path key={K()} d="M1664 568 q0 -8 6 -6 q4 2 -6 10 L1648 586 L1680 586Z" fill="none" stroke="#9A7AD6" strokeWidth={3.4} strokeLinejoin="round" strokeLinecap="round" />);
  push(...pendant(1560, 664, 34, '#FFE08A'), ...pendant(1760, 664, 34, '#FFE08A'));
  push(...rack(1452, 1596, 760, 946, ['#FF8FB5', '#5FE0B7', '#FFC93C', '#B9A3F0', '#7FD3F7']));
  push(<g key={K()}><rect x={1636} y={860} width={6} height={80} fill="#8E7AA8" /><ellipse cx={1639} cy={944} rx={22} ry={5} fill="#8E7AA8" /><path d="M1620 780 Q1639 770 1658 780 L1652 820 L1666 870 L1612 870 L1626 820Z" {...S('#FF9FBF', 2.6)} />{[0, 1, 2, 3].map((i) => <circle key={i} cx={1626 + i * 9} cy={850 + (i % 2) * 8} r={2.4} fill="#fff" />)}<path d="M1626 820 L1652 820" stroke="#fff" strokeWidth={3} /></g>);
  push(R(1700, 724, 98, 222, '#FFFFFF', 10), ...[790, 856, 920].map((y) => <rect key={K()} x={1704} y={y} width={90} height={4} rx={2} fill="#F3D3E2" />));
  [[1708, 788, '#7FD3F7', '#FF8FB5'], [1750, 788, '#FFC93C', '#5FE0B7'], [1708, 854, '#B9A3F0', '#FFC93C'], [1750, 854, '#FF8FB5', '#7FD3F7'], [1708, 918, '#5FE0B7', '#FF9F6E'], [1750, 918, '#FF9F6E', '#fff']].forEach(([x, y, c, a]) => push(sneaker(x as number, y as number, c as string, a as string)));
  push(...[0, 1, 2].map((i) => <circle key={K()} cx={1830 + i * 26} cy={706} r={3} fill="#9A85D6" />), hat(1830, 722, '#FFC93C', 2), hat(1856, 726, '#5FE0B7', 0), hat(1882, 722, '#FF8FB5', 1));
  push(<g key={K()}><rect x={1814} y={752} width={84} height={6} rx={3} fill="#9A85D6" /><path d="M1816 758 Q1830 850 1818 946 L1858 946 Q1850 850 1860 758Z" {...S('#B9A3F0', 2.4)} /><path d="M1860 758 Q1872 850 1862 946 L1896 946 Q1888 850 1896 758Z" {...S('#C9B8F5', 2.4)} /></g>);
  push(...ch({ look: { skin: '#7A4A2B', face: 'round', eyes: 'big', hair: 'curly', hairColor: '#24160E', top: 'hoodie', topColor: '#FFC93C', bottom: 'widejeans', bottomColor: '#5FB8C9', shoes: '#FF8FB5', shoeAccent: '#fff' }, pose: 'walk', mood: 'wink' }, 1690, 946, 0.86));

  // ═══ Street ═══
  push(<rect key={K()} x={0} y={958} width={1920} height={122} fill="#F6E6D2" />, <rect key={K()} x={0} y={956} width={1920} height={8} fill="#E3CDB3" />);
  for (let x = 0; x < 1920; x += 96) push(<line key={K()} x1={x} x2={x - 30} y1={964} y2={1080} stroke="#EAD6BE" strokeWidth={3} />);
  push(<g key={K()}><rect x={1406} y={790} width={10} height={210} rx={4} {...S('#8E7AA8', 2)} /><ellipse cx={1411} cy={782} rx={18} ry={14} {...S('#FFF3A6', 2.4)} /></g>, glow(1411, 790, 70, 0.6));
  [[300, 976], [620, 978], [1250, 978]].forEach(([x, y]) => push(<g key={K()}>{[0, 1, 2].map((i) => <circle key={i} cx={x + i * 12} cy={y} r={5} fill={['#FF8FB5', '#FFC93C', '#B9A3F0'][i]} stroke="#fff" strokeWidth={1.4} />)}</g>));
  // Mila in front
  push(...ch({ ...MILA, pose: 'wave', mood: 'happy' }, 925, 1064, 1.85));
  push(...pet('puppy', 1030, 1064, 82, false, 'bow-pink'));
  return out;
}

// ── UI ──
const ICONS: Record<string, (c: string) => ReactNode> = {
  character: (c) => <g fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><circle cx={0} cy={-6} r={9} /><path d="M-15 15 Q-15 3 0 3 Q15 3 15 15" /><path d="M-8 -14 Q-2 -20 6 -14" /></g>,
  wardrobe: (c) => <g fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M-4 -12 Q-4 -18 1 -18 Q6 -18 6 -13 Q6 -9 0 -6 L0 -2" /><path d="M0 -2 L-17 10 Q-19 13 -15 13 L15 13 Q19 13 17 10Z" /><path d="M11 -12 l1.5 3 l3 .5 l-2.2 2 l.6 3 l-2.9 -1.5 l-2.9 1.5 l.6 -3 l-2.2 -2 l3 -.5Z" fill={c} strokeWidth={1.2} /></g>,
  backpack: (c) => <g fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M-6 -12 Q0 -19 6 -12" /><rect x={-13} y={-12} width={26} height={28} rx={8} /><path d="M-13 -2 Q0 4 13 -2" /><rect x={-6} y={4} width={12} height={7} rx={2.5} /></g>,
  home: (c) => <g fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M-15 0 L0 -14 L15 0" /><path d="M-11 -3 L-11 14 L11 14 L11 -3" /><path d="M0 11 l-4.5 -4.5 a2.6 2.6 0 0 1 4.5 -3 a2.6 2.6 0 0 1 4.5 3Z" fill={c} strokeWidth={1.6} /></g>,
  map: (c) => <g fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d="M-16 -10 L-6 -14 L6 -10 L16 -14 L16 12 L6 16 L-6 12 L-16 16Z" /><path d="M-6 -14 L-6 12 M6 -10 L6 16" strokeWidth={2.4} /><path d="M10 -2 Q10 -9 4 -9 Q-2 -9 -2 -2 Q-2 3 4 8 Q10 3 10 -2Z" fill="#fff" strokeWidth={2.6} /></g>,
  pet: (c) => <g fill={c}><ellipse cx={0} cy={6} rx={9} ry={7.5} />{[[-11, -3], [-5, -11], [5, -11], [11, -3]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={4} ry={5} />)}</g>,
};
const BTN: Record<string, string> = { character: '#C9B8F5', wardrobe: '#FFC2D6', backpack: '#FFE08A', home: '#B6EBDD', map: '#BFE3FF', pet: '#FFD3B5' };
function button(name: string, cx: number, cy: number, size = 92, badge = false, pressed = false) {
  const f = BTN[name], d = shade(f, -50);
  return <g key={K()} transform={`translate(${cx} ${cy})`}>
    {!pressed && <rect x={-size / 2} y={-size / 2 + 7} width={size} height={size} rx={size * 0.32} fill={shade(f, -22)} />}
    <rect x={-size / 2} y={-size / 2 + (pressed ? 5 : 0)} width={size} height={size} rx={size * 0.32} fill={f} stroke={shade(f, -30)} strokeWidth={3} />
    <rect x={-size / 2 + 10} y={-size / 2 + 7 + (pressed ? 5 : 0)} width={size - 20} height={size * 0.26} rx={size * 0.13} fill="#fff" opacity={0.45} />
    <g transform={`translate(0 ${pressed ? 7 : 2}) scale(${size / 92 * 1.5})`}>{ICONS[name](d)}</g>
    {badge && <g><circle cx={size / 2 - 8} cy={-size / 2 + 8} r={13} fill="#FF6B8F" stroke="#fff" strokeWidth={3.5} /><circle cx={size / 2 - 8} cy={-size / 2 + 8} r={3.5} fill="#fff" /></g>}
  </g>;
}
const coinIcon = (cx: number, cy: number, r: number) => <g key={K()}><circle cx={cx} cy={cy + 2} r={r} fill="#E0A21C" /><circle cx={cx} cy={cy} r={r} fill="#FFD25A" stroke="#E0A21C" strokeWidth={3} /><circle cx={cx} cy={cy} r={r * 0.68} fill="none" stroke="#F2B930" strokeWidth={2} /><path d={`M${cx} ${cy - r * 0.42} l${r * 0.13} ${r * 0.27} l${r * 0.3} ${r * 0.04} l-${r * 0.22} ${r * 0.2} l${r * 0.06} ${r * 0.3} l-${r * 0.27} -${r * 0.15} l-${r * 0.27} ${r * 0.15} l${r * 0.06} -${r * 0.3} l-${r * 0.22} -${r * 0.2} l${r * 0.3} -${r * 0.04}Z`} fill="#fff" /></g>;
function coinPill(x: number, y: number) {
  return <g key={K()}><rect x={x} y={y + 6} width={250} height={70} rx={35} fill="#E5D4F7" /><rect x={x} y={y} width={250} height={70} rx={35} fill="#FFFFFF" stroke="#D9C8F2" strokeWidth={3} />{coinIcon(x + 38, y + 35, 24)}<text x={x + 76} y={y + 47} fontSize={34} fontWeight={800} fill="#5B4A86" fontFamily="'Arial Rounded MT Bold', 'Trebuchet MS', 'Verdana', sans-serif">1,250</text><g transform={`translate(${x + 220} ${y + 35})`}><circle r={17} fill="#8BD46E" stroke="#6CB552" strokeWidth={2.4} /><path d="M-7 0 H7 M0 -7 V7" stroke="#fff" strokeWidth={4} strokeLinecap="round" /></g></g>;
}
function avatarButton(cx: number, cy: number) {
  return <g key={K()}><circle cx={cx} cy={cy + 6} r={52} fill={shade(BTN.character, -22)} /><circle cx={cx} cy={cy} r={52} fill={BTN.character} stroke={shade(BTN.character, -30)} strokeWidth={3} /><clipPath id="avclip"><circle cx={cx} cy={cy} r={45} /></clipPath><g clipPath="url(#avclip)"><circle cx={cx} cy={cy} r={45} fill="#F3EEFF" />{headOf({ ...MILA, mood: 'happy' }, cx, cy + 6, 104)}</g><g transform={`translate(${cx + 38} ${cy + 38})`}><circle r={18} fill="#fff" stroke={shade(BTN.character, -30)} strokeWidth={2.6} /><g transform="scale(0.62)">{ICONS.character(shade(BTN.character, -50))}</g></g></g>;
}
function ui() {
  return [avatarButton(86, 82), coinPill(162, 48), button('home', 1700, 84), button('map', 1816, 84),
    <rect key={K()} x={34} y={968} width={364} height={98} rx={49} fill="#FFFFFF" opacity={0.78} stroke="#E8DDF8" strokeWidth={3} />,
    button('wardrobe', 100, 1012, 80), button('backpack', 216, 1012, 80), button('pet', 332, 1012, 80, true)];
}

const DEFS = <defs key="defs">
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#CDEEFF" /><stop offset="0.6" stopColor="#FCEFFF" /><stop offset="1" stopColor="#FFF0DC" /></linearGradient>
  <radialGradient id="glow"><stop offset="0" stopColor="#FFF1B0" stopOpacity="0.9" /><stop offset="1" stopColor="#FFF1B0" stopOpacity="0" /></radialGradient>
  <linearGradient id="ceil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B3A5E" stopOpacity="0.14" /><stop offset="1" stopColor="#5B3A5E" stopOpacity="0" /></linearGradient>
  <pattern id="dotsP" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3.5" fill="#FFC2D6" /><circle cx="25" cy="25" r="3.5" fill="#FFC2D6" /></pattern>
  <pattern id="dotsY" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="3" fill="#FFE8B8" /></pattern>
  <pattern id="tiles" width="30" height="30" patternUnits="userSpaceOnUse"><rect x="1.5" y="1.5" width="27" height="27" rx="6" fill="none" stroke="#B9E8DB" strokeWidth="2" /></pattern>
  <pattern id="tilesF" width="30" height="30" patternUnits="userSpaceOnUse"><rect x="1.5" y="1.5" width="27" height="27" rx="4" fill="none" stroke="#A9D6E0" strokeWidth="2" /></pattern>
  <pattern id="stripesL" width="36" height="10" patternUnits="userSpaceOnUse"><rect width="14" height="10" fill="#DDD0FA" /></pattern>
  <pattern id="stripesB" width="40" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill="#CBE5FB" /></pattern>
  <pattern id="stripesC" width="40" height="10" patternUnits="userSpaceOnUse"><rect width="18" height="10" fill="#F2D8C0" /></pattern>
  <pattern id="stripesP" width="36" height="10" patternUnits="userSpaceOnUse"><rect width="12" height="10" fill="#FFE1EC" /></pattern>
  <pattern id="checkY" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#FFE8B0" opacity="0.6" /><rect x="18" y="18" width="18" height="18" fill="#FFE8B0" opacity="0.6" /></pattern>
  <pattern id="paws" width="56" height="56" patternUnits="userSpaceOnUse"><ellipse cx="20" cy="22" rx="5" ry="4" fill="#FFD3AE" /><circle cx="14" cy="15" r="2" fill="#FFD3AE" /><circle cx="20" cy="13" r="2" fill="#FFD3AE" /><circle cx="26" cy="15" r="2" fill="#FFD3AE" /></pattern>
  <pattern id="boards" width="80" height="23" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="80" y2="0" stroke="#000" strokeOpacity="0.08" strokeWidth="2" /><line x1="40" y1="0" x2="40" y2="23" stroke="#000" strokeOpacity="0.07" strokeWidth="2" /></pattern>
  <pattern id="checkF" width="46" height="23" patternUnits="userSpaceOnUse"><rect width="23" height="23" fill="#fff" opacity="0.18" /></pattern>
</defs>;

const svg = (w: number, h: number, kids: ReactNode[]) => '<?xml version="1.0" encoding="UTF-8"?>' + renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>{DEFS}{kids}</svg>);
fs.writeFileSync('out/styleworld.svg', svg(1920, 1080, [...scene(), ...ui()]));

// ── Character sheet ──
{
  const out: ReactNode[] = [<rect key="bg" width={1920} height={1080} fill="#F6F1FF" />];
  const poses: [Pose, Mood][] = [['stand', 'normal'], ['walk', 'happy'], ['sit', 'proud'], ['wave', 'happy']];
  poses.forEach(([p, m], i) => {
    const cx = 260 + i * 400;
    out.push(<circle key={K()} cx={cx} cy={380} r={175} fill={['#FFE8F1', '#E6F7FF', '#FFF4D6', '#E8FFF5'][i]} />);
    if (p === 'sit') out.push(<g key={K()}><ellipse cx={cx} cy={600} rx={96} ry={18} fill="#5B3A5E" opacity={0.12} /><path d={`M${cx - 86} 596 Q${cx - 92} 512 ${cx} 506 Q${cx + 92} 512 ${cx + 86} 596Z`} {...S('#FF9FBF', 3.5)} /><ellipse cx={cx} cy={514} rx={76} ry={15} fill="#FFC2D6" /><path d={`M${cx - 60} 560 Q${cx} 574 ${cx + 60} 560`} fill="none" stroke="#fff" strokeWidth={4} opacity={0.6} strokeLinecap="round" /></g>);
    out.push(...ch({ ...MILA, pose: p, mood: m }, cx, p === 'sit' ? 586 : 600, 2.75));
  });
  const moods: Mood[] = ['normal', 'happy', 'wink', 'wow', 'silly', 'sad', 'proud', 'sleep'];
  moods.forEach((m, i) => { const cx = 140 + i * 235; out.push(<clipPath key={K()} id={`ex${i}`}><circle cx={cx} cy={850} r={98} /></clipPath>, <circle key={K()} cx={cx} cy={850} r={98} fill="#FFFFFF" />, <g key={K()} clipPath={`url(#ex${i})`}>{headOf({ ...MILA, mood: m }, cx, 858, 210)}</g>, <circle key={K()} cx={cx} cy={850} r={98} fill="none" stroke="#D9C8F2" strokeWidth={4} />); });
  fs.writeFileSync('out/mila.svg', svg(1920, 1000, out));
}
// ── UI kit ──
{
  const out: ReactNode[] = [<rect key="bg" width={1920} height={560} fill="#FBF7FF" />];
  ['character', 'wardrobe', 'backpack', 'home', 'map', 'pet'].forEach((n, i) => { out.push(button(n, 180 + i * 210, 150, 132, n === 'pet'), button(n, 180 + i * 210, 330, 92, false, true)); });
  out.push(coinPill(1450, 100), avatarButton(1560, 330));
  out.push(<rect key={K()} x={80} y={440} width={1260} height={96} rx={48} fill="#FFFFFF" stroke="#E8DDF8" strokeWidth={3} />, ...['character', 'wardrobe', 'backpack', 'pet', 'map', 'home'].map((n, i) => button(n, 150 + i * 224, 488, 76)));
  fs.writeFileSync('out/uikit.svg', svg(1920, 560, out));
}
console.log('styleworld ok');
