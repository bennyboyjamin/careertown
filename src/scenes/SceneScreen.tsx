import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { BuildingId, Entity, SceneId } from '../engine/types';
import { useGame, sceneOf } from '../engine/store';
import { Room, placeActor } from '../components/Room';
import { BUILDINGS } from '../data/buildings';
import { ITEMS } from '../data/items';
import { Btn, Face, Modal } from '../ui/kit';
import { Person, PetPic } from '../components/Person';
import { ItemIcon } from '../components/ItemIcon';
import { ClothesPicker } from '../components/ClothesPicker';
import { WearPicker } from '../components/WearPicker';
import { LAYERED } from '../data/sprites';
import { FurnitureArt } from '../components/art/Furniture';
import { LookEditor } from './CharacterCreator';
import { uid } from '../engine/ids';
import { sfx } from '../engine/sfx';
import { MISSIONS } from '../data/missions';

export function SceneScreen({ sceneId, onScene, onMission }: { sceneId: SceneId; onScene: (s: SceneId) => void; onMission: (id: string) => void }) {
  const { game, dispatch } = useGame();
  const b = BUILDINGS.find((x) => x.rooms.some((r) => r.sceneId === sceneId))!;
  const [tray, setTray] = useState<'people' | 'stuff' | null>(null);
  const [wardrobe, setWardrobe] = useState<string | null>(null);
  const [drawOn, setDrawOn] = useState<Entity | null>(null);
  const here = sceneOf(game, sceneId);
  const isHome = b.id === 'home';

  const allPlaced = new Set(Object.values(game.scenes).flatMap((l) => (l ?? []).map((e) => e.ref)));
  const worn = new Set(game.characters.flatMap((c) => Object.values(c.wear ?? {})));
  const stuff = game.owned.filter((id) => ITEMS[id] && !allPlaced.has(id) && !worn.has(id));

  return (
    <div className="scene-screen relative h-full">
      <div className="absolute inset-0">
        <Room sceneId={sceneId} onWardrobe={setWardrobe} onCustomTap={(e) => e.ref === 'chalkboard' && setDrawOn(e)} />
      </div>

      <div className="room-tabs absolute inset-x-0 flex items-center gap-2 px-2 sm:px-3 pb-2 overflow-x-auto pointer-events-none [&>*]:pointer-events-auto">
        {b.rooms.length > 1 && b.rooms.map((r) => (
          <button key={r.sceneId} onClick={() => { sfx('tap'); onScene(r.sceneId); }}
            className={`shrink-0 rounded-2xl border-[3px] border-ink px-3 h-11 font-display font-bold text-ink shadow-chunkysm ${r.sceneId === sceneId ? 'bg-sun' : 'bg-white'}`}>
            <span className="mr-1">{r.icon}</span>{r.label}
          </button>
        ))}
        {b.rooms.length === 1 && <div className="shrink-0 rounded-2xl border-[3px] border-ink bg-white px-3 py-1 shadow-chunkysm font-display font-extrabold text-ink text-lg">{b.icon} {b.rooms[0].label}: free play</div>}
        <div className="flex-1 tabs-spacer" />
        {b.missions.map((m) => (
          <Btn key={m} tone="berry" className="shrink-0 !min-h-[44px]" onClick={() => onMission(m)}>⭐ {MISSIONS[m].title}</Btn>
        ))}
      </div>

      <div className="scene-actions absolute bottom-2 flex items-center gap-2">
        <Btn tone="sky" onClick={() => setTray(tray === 'people' ? null : 'people')}>🧑‍🤝‍🧑 People{game.pets.length ? ' & pets' : ''}</Btn>
        {isHome && <Btn tone="mint" onClick={() => setTray(tray === 'stuff' ? null : 'stuff')}>📦 My stuff{stuff.length ? ` (${stuff.length})` : ''}</Btn>}
        <Hint building={b.id} />
      </div>

      {tray && (
        <div className="tray-in fixed inset-x-2 bottom-20 z-[45] mx-auto max-w-2xl rounded-[24px] border-[4px] border-ink bg-white shadow-chunky p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-display font-extrabold text-ink text-lg">{tray === 'people' ? 'Tap someone to bring them here' : 'Tap to place in this room'}</div>
            <button onClick={() => setTray(null)} className="w-10 h-10 rounded-full border-[3px] border-ink bg-berry text-white font-display" aria-label="Close tray">✕</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {tray === 'people' && game.characters.map((c) => {
              const inRoom = here.some((e) => e.kind === 'character' && e.ref === c.id);
              return (
                <button key={c.id} onClick={() => { if (inRoom) { dispatch({ type: 'SET_ACTIVE', id: c.id }); sfx('tap'); } else placeActor(dispatch, sceneId, 'character', c.id); }}
                  className={`shrink-0 flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-2 w-20 ${inRoom ? 'bg-sun' : 'bg-white'}`}>
                  <Face c={c} size={52} /><span className="font-body text-xs text-ink truncate w-full text-center">{inRoom ? `✓ ${c.name}` : c.name}</span>
                </button>
              );
            })}
            {tray === 'people' && game.pets.map((p) => {
              const inRoom = here.some((e) => e.kind === 'pet' && e.ref === p.id);
              return (
                <button key={p.id} onClick={() => !inRoom && placeActor(dispatch, sceneId, 'pet', p.id)}
                  className={`shrink-0 flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-2 w-20 ${inRoom ? 'bg-sun' : 'bg-white'}`}>
                  <div className="w-14 h-14"><PetPic p={p} /></div><span className="font-body text-xs text-ink">{inRoom ? `✓ ${p.name}` : p.name}</span>
                </button>
              );
            })}
            {tray === 'people' && game.pets.length === 0 && <p className="font-body text-ink/70 self-center">Finish a career mission to adopt a pet! 🐶🐱</p>}
            {tray === 'stuff' && stuff.map((id) => (
              <button key={id} onClick={() => { dispatch({ type: 'ADD_ENTITY', scene: sceneId, entity: { id: uid('it'), kind: 'item', ref: id, x: 300 + Math.random() * 400, y: 640 } }); sfx('pop'); }}
                className="shrink-0 flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-2 w-24 bg-white">
                <div className="w-16 h-14 grid place-items-center"><ItemIcon id={id} size={52} /></div>
                <span className="font-body text-xs text-ink truncate w-full text-center">{ITEMS[id].name}</span>
              </button>
            ))}
            {tray === 'stuff' && stuff.length === 0 && <p className="font-body text-ink/70">Everything is placed! Earn or buy more decorations. Drag things to “Put away” to store them again.</p>}
          </div>
        </div>
      )}

      {wardrobe && <WardrobeSheet characterId={wardrobe} onClose={() => setWardrobe(null)} />}
      {drawOn && <Chalkboard entity={drawOn} sceneId={sceneId} onClose={() => setDrawOn(null)} />}
    </div>
  );
}

const HINTS: Partial<Record<BuildingId, string>> = {
  home: 'Try: drag an egg onto the stove, or someone onto the bed.',
  school: 'Try: seat kids at desks, then tap the chalkboard to draw.',
  hospital: 'Try: drag a thermometer onto a character.',
  courthouse: 'Try: put a judge behind the bench and tap the gavel.',
  engineering: 'Try: stack blocks into a tower 4 high.',
  'animal-hospital': 'Try: drag the pet brush or stethoscope onto Clover.',
  'tech-lab': 'Try: tap a computer to turn it on, then sit someone nearby.',
};
function Hint({ building }: { building: BuildingId }) {
  return <p className="hidden lg:block font-body text-ink/80 text-sm max-w-xs">{HINTS[building]}</p>;
}

function WardrobeSheet({ characterId, onClose }: { characterId: string; onClose: () => void }) {
  const { game, dispatch } = useGame();
  const c = game.characters.find((x) => x.id === characterId);
  if (!c) return null;
  return (
    <Modal title={`${c.name}’s closet`} onClose={onClose} wide>
      {c.sprite && LAYERED[c.sprite] ? <OutfitPicker c={c} /> : <div className="grid sm:grid-cols-[160px_1fr] gap-4">
        <div className="hidden sm:grid place-items-center rounded-2xl border-[3px] border-ink bg-sky/30 h-64">
          <div className="w-[70%] h-[90%]"><CharacterPreview id={characterId} /></div>
        </div>
        {c.sprite && LAYERED[c.sprite] ? <OutfitPicker c={c} /> : c.sprite ? <div className="h-full grid place-items-center text-center p-6"><div><div className="text-5xl">🎨</div><p className="font-display text-2xl font-extrabold text-ink mt-2">{c.name}’s look is hand-drawn artwork</p><p className="font-body text-ink mt-2 max-w-sm">Their outfit stays the same. Tap <b>+</b> to make a new character you can dress up any way you like.</p></div></div> : <LookEditor clothesOnly age={c.age} look={c.look} onChange={(look) => { dispatch({ type: 'SAVE_CHARACTER', character: { ...c, look } }); dispatch({ type: 'EVENT', name: 'dress' }); }} />}
      </div>}
    </Modal>
  );
}
function CharacterPreview({ id }: { id: string }) {
  const { game } = useGame();
  const c = game.characters.find((x) => x.id === id)!;
  return <Person c={c} mood="happy" />;
}

function Chalkboard({ entity, sceneId, onClose }: { entity: Entity; sceneId: SceneId; onClose: () => void }) {
  const { dispatch } = useGame();
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#FFFFFF');
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const COLORS = ['#FFFFFF', '#FFC93C', '#FF7FB5', '#7FD3F7', '#8BD46E'];

  useEffect(() => {
    const cv = ref.current!; const g = cv.getContext('2d')!;
    const img = entity.state?.img as string | undefined;
    if (img) { const i = new Image(); i.onload = () => g.drawImage(i, 0, 0, cv.width, cv.height); i.src = img; }
  }, [entity]);

  const pos = (ev: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * ref.current!.width, y: ((ev.clientY - r.top) / r.height) * ref.current!.height };
  };
  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const g = ref.current!.getContext('2d')!;
    g.globalCompositeOperation = color === 'erase' ? 'destination-out' : 'source-over';
    g.strokeStyle = color === 'erase' ? '#000' : color; g.lineWidth = color === 'erase' ? 36 : 9; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  };
  const save = () => {
    const url = ref.current!.toDataURL('image/png');
    dispatch({ type: 'PATCH_ENTITIES', scene: sceneId, patches: [{ id: entity.id, patch: { state: { ...(entity.state ?? {}), img: url } } }] });
    dispatch({ type: 'EVENT', name: 'draw' });
    sfx('success'); onClose();
  };

  return (
    <Modal title="Chalkboard" onClose={onClose} wide>
      <canvas ref={ref} width={808} height={344} style={{ touchAction: 'none' }}
        className="w-full rounded-2xl border-[4px] border-ink bg-[#2F5D50] cursor-crosshair"
        onPointerDown={(ev) => { ev.currentTarget.setPointerCapture(ev.pointerId); drawing.current = pos(ev); line(drawing.current, drawing.current); }}
        onPointerMove={(ev) => { if (!drawing.current) return; const p = pos(ev); line(drawing.current, p); drawing.current = p; }}
        onPointerUp={() => { drawing.current = null; }} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {COLORS.map((c) => <button key={c} aria-label={`Chalk ${c}`} onClick={() => setColor(c)} className={`w-11 h-11 rounded-full border-[3px] border-ink ${color === c ? 'ring-4 ring-berry' : ''}`} style={{ background: c }} />)}
        <Btn tone="white" onClick={() => setColor('erase')} className={color === 'erase' ? 'ring-4 ring-berry' : ''}>🧽 Eraser</Btn>
        <Btn tone="white" onClick={() => { const cv = ref.current!; cv.getContext('2d')!.clearRect(0, 0, cv.width, cv.height); }}>Clear</Btn>
        <div className="flex-1" />
        <Btn tone="mint" onClick={save}>Put it on the board</Btn>
      </div>
    </Modal>
  );
}

function OutfitPicker({ c }: { c: import('../engine/types').CharacterData }) {
  const { dispatch } = useGame();
  const lay = LAYERED[c.sprite!];
  return (
    <div>
      <ClothesPicker c={c} onChange={(colors) => { dispatch({ type: 'SAVE_CHARACTER', character: { ...c, colors } }); dispatch({ type: 'EVENT', name: 'dress' }); }} />
      <WearPicker wear={c.wear} onChange={(slot, item) => dispatch({ type: 'WEAR', character: c.id, slot, item })} />
    </div>
  );
}
