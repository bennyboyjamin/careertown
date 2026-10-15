import { ITEMS } from '../data/items';
import { FurnitureArt } from './art/Furniture';

/** Small picture of an item for trays, menus and the shop. */
export function ItemIcon({ id, size = 48 }: { id: string; size?: number }) {
  const d = ITEMS[id];
  if (!d) return <span>?</span>;
  if (d.img || d.paint) return <img src={(d.img ?? d.paint)!} alt="" draggable={false} style={{ width: size, height: size, objectFit: 'contain' }} />;
  if (d.emoji) return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{d.emoji}</span>;
  if (d.art) return <div style={{ width: size, height: size * 0.85 }}><FurnitureArt art={d.art} w={d.w} h={d.h} variant={id} /></div>;
  return <span>?</span>;
}
