import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { sfx } from '../engine/sfx';

/**
 * A chip kids can drag onto any element marked data-drop="zoneId".
 * Tapping instead of dragging calls onTap, so every mission also works tap-tap
 * (better for small hands and accessibility).
 */
export function DragChip({ children, onDrop, onTap, selected = false, disabled = false, className = '' }: {
  children: ReactNode; onDrop: (zone: string | null) => void; onTap?: () => void; selected?: boolean; disabled?: boolean; className?: string;
}) {
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        style={{ touchAction: 'none' }}
        className={`drag-chip ${selected ? 'ring-4 ring-berry scale-105' : ''} ${ghost ? 'opacity-40' : ''} ${className}`}
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          start.current = { x: e.clientX, y: e.clientY, moved: false };
        }}
        onPointerMove={(e) => {
          const s = start.current; if (!s) return;
          if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) { s.moved = true; sfx('pop'); }
          if (s.moved) setGhost({ x: e.clientX, y: e.clientY });
        }}
        onPointerUp={(e) => {
          const s = start.current; start.current = null; setGhost(null);
          if (!s) return;
          if (!s.moved) { sfx('tap'); onTap?.(); return; }
          const zone = document.elementsFromPoint(e.clientX, e.clientY)
            .map((el) => (el as HTMLElement).closest?.('[data-drop]') as HTMLElement | null)
            .find(Boolean);
          onDrop(zone?.dataset.drop ?? null);
        }}
        onPointerCancel={() => { start.current = null; setGhost(null); }}
      >
        {children}
      </button>
      {ghost && createPortal(
        <div className="fixed z-[200] pointer-events-none -translate-x-1/2 -translate-y-1/2 scale-110 drop-shadow-xl" style={{ left: ghost.x, top: ghost.y }}>
          <div className={`drag-chip ${className}`}>{children}</div>
        </div>,
        document.body,
      )}
    </>
  );
}
