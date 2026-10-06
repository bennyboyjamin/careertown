import type { Entity, SceneId } from '../engine/types';

export interface SceneDef {
  id: SceneId;
  label: string;
  wall: string;
  wallPattern: 'dots' | 'stripes' | 'tiles' | 'plain' | 'panels' | 'grid';
  floor: string;
  floorPattern: 'boards' | 'tiles' | 'carpet' | 'checker';
  horizon: number; // y where wall meets floor
}

export const SCENES: Record<SceneId, SceneDef> = {
  'home-kitchen': { id: 'home-kitchen', label: 'Kitchen', wall: '#FFF1B8', wallPattern: 'tiles', floor: '#F7B98B', floorPattern: 'checker', horizon: 440 },
  'home-bedroom': { id: 'home-bedroom', label: 'Bedroom', wall: '#D9CCFF', wallPattern: 'dots', floor: '#C98F63', floorPattern: 'boards', horizon: 440 },
  'home-living': { id: 'home-living', label: 'Living room', wall: '#BFEBDD', wallPattern: 'stripes', floor: '#B98258', floorPattern: 'boards', horizon: 440 },
  'home-bathroom': { id: 'home-bathroom', label: 'Bathroom', wall: '#CDEFFF', wallPattern: 'tiles', floor: '#9FD8E8', floorPattern: 'tiles', horizon: 440 },
  'school-classroom': { id: 'school-classroom', label: 'Classroom', wall: '#FFE0C2', wallPattern: 'panels', floor: '#D7A46F', floorPattern: 'boards', horizon: 430 },
  'hospital-exam': { id: 'hospital-exam', label: 'Exam room', wall: '#E3F6F1', wallPattern: 'plain', floor: '#BFE3EA', floorPattern: 'tiles', horizon: 440 },
  'courthouse-room': { id: 'courthouse-room', label: 'Courtroom', wall: '#E6DDF8', wallPattern: 'panels', floor: '#8E5B3F', floorPattern: 'boards', horizon: 420 },
  'vet-clinic': { id: 'vet-clinic', label: 'Pet clinic', wall: '#D4F7E8', wallPattern: 'dots', floor: '#FFE3B3', floorPattern: 'checker', horizon: 440 },
  'tech-lab': { id: 'tech-lab', label: 'Coding lab', wall: '#DCE6FF', wallPattern: 'grid', floor: '#B7C6D6', floorPattern: 'tiles', horizon: 440 },
  'engineering-lab': { id: 'engineering-lab', label: 'Workshop', wall: '#D8EEFF', wallPattern: 'grid', floor: '#9AA6B8', floorPattern: 'checker', horizon: 440 },
};

let n = 0;
const it = (ref: string, x: number, y: number, state?: Record<string, unknown>): Entity =>
  ({ id: `${ref}-${++n}`, kind: 'item', ref, x, y, state });

/** Starting furniture for each room. Characters and pets are added by the player. */
export function initialScene(id: SceneId): Entity[] {
  n = 0;
  switch (id) {
    case 'home-kitchen': {
      const counter = it('counter', 330, 480);
      const table = it('table', 700, 610);
      return [
        it('window', 520, 255), it('cupboard', 800, 205), it('fridge', 115, 480), counter,
        it('stove', 515, 480), { ...it('cookiejar', 300, 312), state: { on: counter.id } }, table,
        it('chair', 540, 625), it('chair', 870, 625), it('door', 925, 470, { to: 'home-living' }),
        { ...it('apple', 670, 488), state: { on: table.id } }, { ...it('banana', 740, 488), state: { on: table.id } },
      ];
    }
    case 'home-bedroom':
      return [
        it('window', 520, 250), it('closet', 115, 480), it('rug', 560, 685), it('bed', 405, 600),
        it('secretspot', 470, 628), it('lamp', 640, 560), it('tv', 790, 470), it('toybox', 800, 655),
        it('backpack', 300, 670), it('clock', 640, 665), it('door', 925, 470, { to: 'home-bathroom' }),
      ];
    case 'home-living':
      return [
        it('window', 330, 250), it('bookshelf', 110, 470), it('rug', 470, 665), it('couch', 450, 575),
        it('tv', 800, 540), it('lamp', 660, 520), it('door', 925, 470, { to: 'home-bedroom' }),
      ];
    case 'home-bathroom':
      return [
        it('shower', 140, 500), it('toilet', 380, 490), it('mirror', 590, 235), it('bathsink', 590, 490),
        it('rug', 420, 650), it('toothbrush', 520, 650), it('duck', 160, 650), it('door', 925, 470, { to: 'home-kitchen' }),
      ];
    case 'school-classroom': {
      const tdesk = it('teacherdesk', 830, 520);
      return [
        it('chalkboard', 450, 280), it('schoolclock', 830, 150), it('window', 100, 250), tdesk,
        { ...it('bell', 760, 386), state: { on: tdesk.id } }, { ...it('globe', 850, 386), state: { on: tdesk.id } },
        { ...it('apple', 920, 386), state: { on: tdesk.id } },
        it('desk', 170, 665), it('desk', 400, 665), it('desk', 630, 665),
        it('book', 900, 670), it('pencil', 280, 690), it('backpack', 520, 690),
      ];
    }
    case 'hospital-exam':
      return [
        it('window', 200, 250), it('heartposter', 560, 260), it('medcabinet', 840, 470), it('exambed', 420, 600),
        it('chair', 820, 650), it('thermometer', 640, 660), it('bandage', 710, 670),
      ];
    case 'courthouse-room': {
      const bench = it('judgebench', 500, 410);
      const t1 = it('lawtable', 300, 640);
      return [
        it('scales', 500, 160), bench, { ...it('gavel', 610, 236), state: { on: bench.id } },
        it('witnessstand', 820, 470), it('jurybox', 165, 470), t1, it('lawtable', 700, 640),
        { ...it('folder', 260, 527), state: { on: t1.id } }, { ...it('magnifier', 340, 527), state: { on: t1.id } },
        it('scroll', 900, 680),
      ];
    }
    case 'vet-clinic':
      return [
        it('window', 200, 250), it('pawposter', 560, 260), it('petcabinet', 840, 470), it('exambed', 420, 600),
        it('petbed', 760, 680), it('petbrush', 640, 665), it('carrot', 700, 680),
        { id: 'visitor-bunny-ent', kind: 'pet', ref: 'visitor-bunny', x: 330, y: 660, pose: 'stand' },
        { id: 'visitor-puppy-ent', kind: 'pet', ref: 'visitor-puppy', x: 560, y: 690, pose: 'stand' },
      ];
    case 'tech-lab':
      return [
        it('codeposter', 470, 250), it('serverrack', 110, 480), it('window', 800, 240),
        it('computer', 360, 600, { on: true }), it('computer', 660, 600), it('chair', 250, 650), it('chair', 770, 650),
        it('robot', 900, 660), it('keyboard', 520, 680), it('headset', 160, 680), it('floppy', 600, 690),
      ];
    case 'engineering-lab': {
      const bench = it('workbench', 300, 570);
      return [
        it('blueprint', 300, 240), it('window', 720, 240), bench, it('blockbin', 620, 500),
        { ...it('toolbox', 230, 432), state: { on: bench.id } }, { ...it('wrench', 340, 432), state: { on: bench.id } },
        it('robot', 860, 620), it('block-red', 520, 670), it('block-blue', 640, 670), it('block-yellow', 740, 680),
        it('gear', 420, 680),
      ];
    }
  }
}
