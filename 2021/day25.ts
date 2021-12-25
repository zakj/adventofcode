import { answers, load } from '../advent';
import {
  Dir,
  findBounds,
  intersect,
  move,
  parseMap,
  PointSet,
  Rect,
} from '../coords';
import { ValuesOf } from '../util';

const Cell = {
  Empty: '.',
  East: '>',
  South: 'v',
} as const;
type Cell = ValuesOf<typeof Cell>;
type Floor = { bounds: Rect; east: PointSet; south: PointSet };

function parse(lines: string[]) {
  const floor = parseMap(lines, (c) => c as Cell);
  return {
    east: new PointSet(
      [...floor]
        .filter(([point, cell]) => cell === Cell.East)
        .map(([point]) => point)
    ),
    south: new PointSet(
      [...floor]
        .filter(([point, cell]) => cell === Cell.South)
        .map(([point]) => point)
    ),
    bounds: findBounds(floor),
  };
}

function step(floor: Floor): boolean {
  let changed = false;
  let remove = new PointSet();
  let add = new PointSet();
  for (const cur of floor.east) {
    const next = move(cur, Dir.Right);
    if (!intersect(next, floor.bounds)) next.x = 0;
    if (floor.east.has(next) || floor.south.has(next)) continue;
    remove.add(cur);
    add.add(next);
  }
  for (const p of remove) floor.east.delete(p);
  for (const p of add) floor.east.add(p);
  if (remove.size) changed = true;

  remove = new PointSet();
  add = new PointSet();
  for (const cur of floor.south) {
    const next = move(cur, Dir.Down);
    if (!intersect(next, floor.bounds)) next.y = 0;
    if (floor.east.has(next) || floor.south.has(next)) continue;
    remove.add(cur);
    add.add(next);
  }
  for (const p of remove) floor.south.delete(p);
  for (const p of add) floor.south.add(p);
  if (remove.size) changed = true;

  return changed;
}

const floor = parse(load(25).lines);
// TODO: speedup
answers.expect(498);
answers(() => {
  let steps = 1;
  while (step(floor)) steps++;
  return steps;
});
