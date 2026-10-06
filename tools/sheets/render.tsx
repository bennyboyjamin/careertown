import { cloneElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import { CharacterArt, charViewBox, type Mood, type Build } from '../../src/components/art/Character2';
import type { Look } from '../../src/engine/types';

const base: Look = { skin: '#E8AE7E', face: 'round', eyes: 'dot', hair: 'short', hairColor: '#2B1B12', top: 'tee', topColor: '#7FD3F7', bottom: 'pants', bottomColor: '#A98BFF', shoes: '#FF5D8F', glasses: 'none', hat: 'none', accessory: 'none' };
type C = { look: Partial<Look>; age: 'child' | 'adult'; build?: Build; mood?: Mood };
const L = (c: C) => ({ ...base, ...c.look, build: c.build ?? 'average' }) as Look;

function body(c: C, x: number, groundY: number, s: number, key: string) {
  const vb = charViewBox(c.age, 'stand', c.build ?? 'average');
  const el = CharacterArt({ look: L(c), age: c.age, build: c.build, mood: c.mood ?? 'normal' }) as ReactElement;
  const w = 120 * s, h = vb.h * s;
  return [<ellipse key={key + 's'} cx={x} cy={groundY + 2} rx={w * 0.32} ry={7} fill="#2B2350" opacity={0.12} />,
    cloneElement(el, { key, x: x - w / 2, y: groundY - h, width: w, height: h, style: undefined } as never)];
}
function head(c: C, x: number, y: number, size: number, key: string) {
  const el = CharacterArt({ look: L(c), age: c.age, build: c.build, mood: c.mood ?? 'normal' }) as ReactElement;
  return cloneElement(el, { key, x: x - size / 2, y: y - size / 2, width: size, height: size, viewBox: '20 -18 80 86', style: undefined } as never);
}
const svg = (w: number, h: number, kids: unknown[]) => '<?xml version="1.0" encoding="UTF-8"?>' + renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>{kids as never}</svg>);

// ── Cast ──
export const CAST: (C & { name: string })[] = [
  { name: 'Amara', age: 'adult', build: 'round', look: { skin: '#7A4A2B', face: 'oval', eyes: 'lashes', hair: 'afropuff', hairColor: '#2B1B12', top: 'sweater', topColor: '#FFC93C', bottom: 'skirt', bottomColor: '#3D7BFF', shoes: '#FF5D8F', accessory: 'necklace' } },
  { name: 'Kai', age: 'child', look: { skin: '#C98B5B', eyes: 'big', hair: 'curly', hairColor: '#2B1B12', top: 'star', topColor: '#FF8A3D', bottom: 'shorts', bottomColor: '#3D7BFF', shoes: '#5FE0B7' } },
  { name: 'Noor', age: 'child', build: 'slim', look: { skin: '#E8AE7E', face: 'oval', eyes: 'big', hair: 'headscarf', hairColor: '#A98BFF', top: 'tee', topColor: '#5FE0B7', bottom: 'jeans', bottomColor: '#3D7BFF', shoes: '#FFC93C' } },
  { name: 'Mateo', age: 'adult', build: 'slim', look: { skin: '#A0663F', face: 'square', hair: 'short', hairColor: '#2B1B12', glasses: 'square', top: 'polo', topColor: '#FF8A3D', bottom: 'pants', bottomColor: '#3F4275', shoes: '#8E5B3F' } },
  { name: 'Lily', age: 'child', build: 'round', look: { skin: '#FCE3CF', eyes: 'lashes', hair: 'braids', hairColor: '#E9B44C', bottom: 'dress', bottomColor: '#FF7FB5', shoes: '#A98BFF', accessory: 'bow' } },
  { name: 'Grandpa Ken', age: 'adult', build: 'round', look: { skin: '#F3D6B8', face: 'square', eyes: 'sleepy', hair: 'buzz', hairColor: '#B9B9C6', glasses: 'round', top: 'sweater', topColor: '#8BD46E', bottom: 'pants', bottomColor: '#8E5B3F', shoes: '#3F4275' } },
  { name: 'Zuri', age: 'child', look: { skin: '#5A3520', face: 'oval', hair: 'locs', hairColor: '#2B1B12', top: 'hoodie', topColor: '#3D7BFF', bottom: 'shorts', bottomColor: '#FFC93C', shoes: '#FF5D8F', accessory: 'headphones' } },
  { name: 'Dr. Jun', age: 'adult', build: 'slim', look: { skin: '#F6CBA5', face: 'oval', eyes: 'lashes', hair: 'topknot', hairColor: '#2B1B12', top: 'labcoat', topColor: '#7FD3F7', bottom: 'pants', bottomColor: '#A98BFF', shoes: '#FFFFFF' } },
  { name: 'Rosa', age: 'adult', look: { skin: '#E8AE7E', face: 'oval', eyes: 'big', hair: 'wavy', hairColor: '#A8652F', top: 'stripes', topColor: '#FF5D8F', bottom: 'jeans', bottomColor: '#3D7BFF', shoes: '#FFC93C', accessory: 'scarf' } },
];

// 1. Lineup
{
  const s = 2.35, gy = 560, kids: unknown[] = [<rect key="g" x={20} y={gy - 6} width={1660} height={40} rx={20} fill="#8BD46E" />];
  const order = [0, 1, 4, 3, 2, 7, 6, 5, 8];
  order.forEach((ci, i) => kids.push(...body(CAST[ci], 110 + i * 185, gy, s, 'c' + i)));
  fs.writeFileSync('out/lineup.svg', svg(1700, 620, kids));
}
// 2. Anatomy: proportions + face + expressions
{
  const kids: unknown[] = [];
  const s = 3.1, gy = 640;
  const adult = CAST[8], child = CAST[1];
  // head-unit guides
  const guide = (x0: number, top: number, unit: number, n: number, k: string) => Array.from({ length: n + 1 }, (_, i) =>
    <line key={k + i} x1={x0} x2={x0 + 300} y1={top + i * unit} y2={top + i * unit} stroke="#A98BFF" strokeWidth={2} strokeDasharray="6 8" />);
  const vA = charViewBox('adult'), vC = charViewBox('child');
  const aTop = gy - vA.h * s + (34 - 25 * 1.15 + 26) * s, aUnit = 50 * 1.15 * s;
  const cTop = gy - vC.h * s + (34 - 25 * 1.22 + 26) * s, cUnit = 50 * 1.22 * s;
  kids.push(...guide(20, aTop, aUnit, 3, 'ga'), ...guide(330, cTop, cUnit, 2, 'gc'));
  kids.push(...body(adult, 170, gy, s, 'pa'), ...body(child, 480, gy, s, 'pc'));
  // big face with construction lines
  const fx = 900, fy = 300, fs_ = 520;
  kids.push(<circle key="fbg" cx={fx} cy={fy} r={250} fill="#FFF6E0" />);
  kids.push(head({ ...CAST[2], mood: 'normal' }, fx, fy, fs_, 'face'));
  const u = fs_ / 76; // px per unit; head center 34 → y 300 + (34 - 22)*u
  const yAt = (v: number) => fy - fs_ / 2 + (v + 16) * u;
  kids.push(<line key="mid" x1={fx - 200} x2={fx + 200} y1={yAt(34)} y2={yAt(34)} stroke="#FF5D8F" strokeWidth={2} strokeDasharray="4 6" />,
    <line key="eye" x1={fx - 200} x2={fx + 200} y1={yAt(39)} y2={yAt(39)} stroke="#3D7BFF" strokeWidth={2} strokeDasharray="4 6" />,
    <line key="vert" x1={fx} x2={fx} y1={fy - 230} y2={fy + 230} stroke="#A98BFF" strokeWidth={2} strokeDasharray="4 6" />);
  // expressions
  const moods: Mood[] = ['normal', 'happy', 'wow', 'sad', 'proud', 'eat', 'brush', 'sleep'];
  const who = [CAST[1], CAST[4], CAST[6], CAST[2], CAST[0], CAST[8], CAST[3], CAST[5]];
  moods.forEach((m, i) => { kids.push(<circle key={'eb' + i} cx={90 + i * 180} cy={800} r={80} fill={['#FFE8A3', '#FFD3E0', '#D6F2FF', '#E6DDFF', '#D4F7E8', '#FFE3D1', '#FFE8A3', '#E6DDFF'][i]} />, head({ ...who[i], mood: m }, 90 + i * 180, 806, 168, 'e' + i)); });
  fs.writeFileSync('out/anatomy.svg', svg(1500, 900, kids));
}
// 3. Wardrobe: hair, builds, outfits
{
  const kids: unknown[] = [];
  const hairs: [Look['hair'], string, string][] = [['short', '#2B1B12', '#C98B5B'], ['bob', '#C9473A', '#FCE3CF'], ['long', '#5B3A21', '#E8AE7E'], ['wavy', '#A8652F', '#F6CBA5'], ['ponytail', '#E9B44C', '#F3D6B8'], ['buns', '#6C5CE7', '#A0663F'], ['curly', '#2B1B12', '#7A4A2B'],
    ['afropuff', '#2B1B12', '#5A3520'], ['locs', '#3B2516', '#7A4A2B'], ['braids', '#2B1B12', '#A0663F'], ['topknot', '#2B1B12', '#F6CBA5'], ['spiky', '#3FC1C9', '#E8AE7E'], ['buzz', '#8E8E9A', '#C98B5B'], ['headscarf', '#FF7FB5', '#E8AE7E']];
  hairs.forEach(([h, hc, sk], i) => {
    const x = 100 + (i % 7) * 185, y = 110 + Math.floor(i / 7) * 190;
    kids.push(<circle key={'hb' + i} cx={x} cy={y} r={80} fill="#F2F0FF" />, head({ age: 'child', look: { hair: h, hairColor: hc, skin: sk, eyes: i % 3 ? 'dot' : 'big' } }, x, y + 6, 175, 'h' + i));
  });
  const s = 2.3, gy = 900;
  const outfits: C[] = [
    { age: 'adult', build: 'slim', look: { skin: '#A0663F', hair: 'short', top: 'tee', topColor: '#7FD3F7', bottom: 'pants', bottomColor: '#FF8A3D', shoes: '#3F4275' } },
    { age: 'adult', build: 'average', look: { skin: '#A0663F', hair: 'short', top: 'tee', topColor: '#7FD3F7', bottom: 'pants', bottomColor: '#FF8A3D', shoes: '#3F4275' } },
    { age: 'adult', build: 'round', look: { skin: '#A0663F', hair: 'short', top: 'tee', topColor: '#7FD3F7', bottom: 'pants', bottomColor: '#FF8A3D', shoes: '#3F4275' } },
    { age: 'child', look: { skin: '#FCE3CF', hair: 'bob', hairColor: '#C9473A', top: 'stripes', topColor: '#FF5D8F', bottom: 'shorts', bottomColor: '#3D7BFF' } },
    { age: 'child', look: { skin: '#7A4A2B', hair: 'buns', hairColor: '#2B1B12', top: 'sweater', topColor: '#A98BFF', bottom: 'skirt', bottomColor: '#FFC93C', shoes: '#FF5D8F' } },
    { age: 'child', look: { skin: '#E8AE7E', hair: 'ponytail', hairColor: '#5B3A21', bottom: 'dress', bottomColor: '#5FE0B7', shoes: '#FFC93C' } },
    { age: 'adult', build: 'round', look: { skin: '#C98B5B', hair: 'locs', hairColor: '#2B1B12', top: 'suit', topColor: '#FF5D8F', bottom: 'pants', bottomColor: '#3F4275', shoes: '#2B2350' } },
    { age: 'adult', build: 'slim', look: { skin: '#F3D6B8', hair: 'bob', hairColor: '#8E8E9A', top: 'labcoat', topColor: '#5FE0B7', bottom: 'jeans', bottomColor: '#3D7BFF', glasses: 'round' } },
    { age: 'child', look: { skin: '#5A3520', hair: 'afropuff', hairColor: '#2B1B12', top: 'vest', topColor: '#7FD3F7', bottom: 'jeans', bottomColor: '#3D7BFF', hat: 'hardhat' } },
  ];
  kids.push(<rect key="g" x={20} y={gy - 6} width={1660} height={34} rx={17} fill="#8BD46E" />);
  outfits.forEach((c, i) => kids.push(...body(c, 100 + i * 185 + (i >= 3 ? 30 : 0), gy, s, 'o' + i)));
  fs.writeFileSync('out/wardrobe.svg', svg(1720, 950, kids));
}
console.log('sheets ok');
