import { answers, example, load } from '../advent';
import { range } from '../util';

type Point = {
  x: number;
  y: number;
  dir: number;
};

function walk(path: string): Point[] {
  const directions = {
    0: { y: -1 },
    90: { x: 1 },
    180: { y: 1 },
    270: { x: -1 },
  };
  let p: Point = { x: 0, y: 0, dir: 0 };
  return path.split(', ').map((step) => {
    const [turn, blocks] = [step[0], Number(step.slice(1))];
    const dir = (turn === 'R' ? p.dir + 90 : p.dir - 90 + 360) % 360;
    const delta = directions[dir];
    return (p = {
      dir,
      x: p.x + (delta.x || 0) * blocks,
      y: p.y + (delta.y || 0) * blocks,
    });
  });
}

function distanceToEnd(path: string): number {
  const route = walk(path);
  const end = route[route.length - 1];
  return Math.abs(end.x) + Math.abs(end.y);
}

function pointsBetween(from: Point, to: Point): Point[] {
  const axis = from.x === to.x ? 'y' : 'x';
  return range(from[axis], to[axis]).map((val) => ({ ...from, [axis]: val }));
}

function distanceToFirstRepeat(path): number {
  const route = walk(path);
  const visited = new Set<string>();
  let prev: Point = { x: 0, y: 0, dir: 0 };
  for (const p of route) {
    for (const btwn of pointsBetween(prev, p)) {
      const key = [btwn.x, btwn.y].join(',');
      if (visited.has(key)) return Math.abs(btwn.x) + Math.abs(btwn.y);
      visited.add(key);
    }
    prev = p;
  }
}

example.equal(distanceToEnd('R2, L3'), 5);
example.equal(distanceToEnd('R2, R2, R2'), 2);
example.equal(distanceToEnd('R5, L5, R5, R3'), 12);
example.equal(distanceToFirstRepeat('R8, R4, R4, R8'), 4);

const path = load(1).lines[0];
answers(
  () => distanceToEnd(path),
  () => distanceToFirstRepeat(path)
);
