import { main } from 'lib/advent';
import { Dir, move, Point, PointMap } from 'lib/coords';
import { iter } from 'lib/iter';
import { lines, ValuesOf } from 'lib/util';

const EMITTER = { x: 500, y: 0 };
const Cell = {
  ROCK: '#',
  SAND: 'o',
} as const;
type Cell = ValuesOf<typeof Cell>;
type Cave = PointMap<Cell>;

function parse(lines: string[]) {
  return lines.map((line) => {
    return line.split(' -> ').map((s) => {
      const [x, y] = s.split(',').map(Number);
      return { x, y };
    });
  });
}

function makeCave(segments: Point[][]): Cave {
  const cave = new PointMap<Cell>();
  for (const points of segments) {
    const cur = { ...points[0] };
    cave.set(cur, Cell.ROCK);
    for (const point of points.slice(1)) {
      while (cur.x !== point.x) {
        cur.x += Math.sign(point.x - cur.x);
        cave.set(cur, Cell.ROCK);
      }
      while (cur.y !== point.y) {
        cur.y += Math.sign(point.y - cur.y);
        cave.set(cur, Cell.ROCK);
      }
    }
  }
  return cave;
}

function overflowCave(cave: Cave): Cave {
  const bottom = iter(cave.keys())
    .map((p) => p.y)
    .max();

  for (;;) {
    let sand = move(EMITTER, Dir.Down);
    for (;;) {
      const down = move(sand, Dir.Down);
      if (down.y > bottom) return cave;
      const fall = [down, move(down, Dir.Left), move(down, Dir.Right)].find(
        (p) => !cave.has(p)
      );
      if (fall) sand = fall;
      else {
        cave.set(sand, Cell.SAND);
        break;
      }
    }
  }
}

function fillCave(cave: Cave): Cave {
  const bottom =
    iter(cave.keys())
      .map((p) => p.y)
      .max() + 2;

  while (!cave.has(EMITTER)) {
    let sand = EMITTER;
    for (;;) {
      const down = move(sand, Dir.Down);
      const fall = [down, move(down, Dir.Left), move(down, Dir.Right)].find(
        (p) => p.y < bottom && !cave.has(p)
      );
      if (fall) sand = fall;
      else {
        cave.set(sand, Cell.SAND);
        break;
      }
    }
  }
  return cave;
}

function countSand(cave: Cave): number {
  return cave.values().filter((v) => v === Cell.SAND).length;
}

main(
  (s) => countSand(overflowCave(makeCave(parse(lines(s))))),
  (s) => countSand(fillCave(makeCave(parse(lines(s)))))
);
