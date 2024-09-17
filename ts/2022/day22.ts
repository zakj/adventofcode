import { main } from 'lib/advent';
import {
  Dir,
  findBounds,
  move,
  parseMap,
  Point,
  PointMap,
  Rect,
  turnLeft,
  turnRight,
} from 'lib/coords';
import { iter, range } from 'lib/iter';
import { paragraphs, sum, ValuesOf } from 'lib/util';

type Cave = PointMap<Cell>;

const Cell = {
  Void: ' ',
  Empty: '.',
  Wall: '#',
} as const;
type Cell = ValuesOf<typeof Cell>;

const dirValue: Record<Dir, number> = {
  [Dir.Right]: 0,
  [Dir.Down]: 1,
  [Dir.Left]: 2,
  [Dir.Up]: 3,
};

function parse(chunks: string[][]) {
  const [mapStr, directionsLines] = chunks;
  const map = parseMap<Cell>(mapStr, (c) =>
    c === ' ' ? Cell.Void : c === '.' ? Cell.Empty : Cell.Wall
  );
  iter(map).forEach(([p, c]) => {
    if (c === Cell.Void) map.delete(p);
  });

  const directionsStr = directionsLines[0];
  const directions = [];
  for (let i = 0; i < directionsStr.length; ++i) {
    const n = [];
    while (!isNaN(+directionsStr[i])) n.push(directionsStr[i++]);
    if (n.length) directions.push(Number(n.join('')));
    if (i < directionsStr.length) directions.push(directionsStr[i]);
  }
  return { map, directions };
}

function wrap2d(map: Cave, bounds: Rect, p: Point, d: Dir): [Point, Dir] {
  const axis = d === Dir.Left || d === Dir.Right ? 'x' : 'y';
  const values: [number, number] =
    d === Dir.Right || d === Dir.Down
      ? [bounds.min[axis], bounds.max[axis]]
      : [bounds.max[axis], bounds.min[axis]];
  const x = range(...values).find((x) => map.has({ ...p, [axis]: x }));
  return [{ ...p, [axis]: x }, d];
}

function walk(
  map: Cave,
  directions: ('R' | 'L' | number)[],
  wrap: typeof wrap2d
): number {
  let startX = Infinity;
  iter(map).forEach(([p, cell]) => {
    if (p.y === 0 && cell === Cell.Empty) {
      if (p.x < startX) startX = p.x;
    }
  });

  const bounds = findBounds(map);

  let cur = { x: startX, y: 0 };
  let dir: Dir = Dir.Right;
  for (const d of directions) {
    if (typeof d === 'number') {
      for (let i = 0; i < d; ++i) {
        let next = move(cur, dir);
        const nextCell = map.get(next);
        if (nextCell === Cell.Empty) {
          cur = next;
        } else if (nextCell === Cell.Wall) {
          continue;
        } else if (!nextCell) {
          [next, dir] = wrap(map, bounds, cur, dir);
          if (map.get(next) === Cell.Empty) cur = next;
        }
      }
    } else if (d === 'R') {
      dir = turnRight(dir);
    } else if (d === 'L') {
      dir = turnLeft(dir);
    }
  }

  return sum([(cur.y + 1) * 1000, (cur.x + 1) * 4, dirValue[dir]]);
}

main(
  (s) => {
    const data = parse(paragraphs(s));
    return walk(data.map, data.directions, wrap2d);
  }
  // XXX part 2 is solved in python
  // () => walk(data.map, data.directions, wrap3d),
);
