import { example, load, solve } from 'lib/advent';
import {
  Dir,
  findBounds,
  move,
  parseMap,
  PointMap,
  turnLeft,
  turnRight,
} from 'lib/coords';
import { iter, range } from 'lib/iter';
import { sum, ValuesOf } from 'lib/util';

const Cell = {
  Void: ' ',
  Empty: '.',
  Wall: '#',
} as const;
type Cell = ValuesOf<typeof Cell>;

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

function part1(
  map: PointMap<Cell>,
  directions: ('R' | 'L' | number)[]
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
          if (dir === Dir.Right) {
            const x = range(bounds.min.x, bounds.max.x + 1).find((x) =>
              map.has({ x, y: cur.y })
            );
            next = { x, y: cur.y };
          } else if (dir === Dir.Left) {
            const x = range(bounds.max.x, bounds.min.x - 1).find((x) =>
              map.has({ x, y: cur.y })
            );
            next = { x, y: cur.y };
          } else if (dir === Dir.Up) {
            const y = range(bounds.max.y, bounds.min.y - 1).find((y) =>
              map.has({ x: cur.x, y })
            );
            next = { x: cur.x, y };
          } else if (dir === Dir.Down) {
            const y = range(bounds.min.y, bounds.max.y + 1).find((y) =>
              map.has({ x: cur.x, y })
            );
            next = { x: cur.x, y };
          }
          if (map.get(next) === Cell.Empty) cur = next;
        } else throw new Error();
      }
    } else if (d === 'R') dir = turnRight(dir);
    else if (d === 'L') dir = turnLeft(dir);
    else throw new Error();
  }

  const dirValue = {
    [Dir.Right]: 0,
    [Dir.Down]: 1,
    [Dir.Left]: 2,
    [Dir.Up]: 3,
  };

  return sum([(cur.y + 1) * 1000, (cur.x + 1) * 4, dirValue[dir]]);
}

const exampleData = parse(load('ex').paragraphs);
example.equal(part1(exampleData.map, exampleData.directions), 6032);

const data = parse(load().paragraphs);
export default solve(
  // NOT 6374
  // NOT 46362
  () => part1(data.map, data.directions),
  () => 0,
  () => 0
).expect(67390);
