import { answers, example, load } from '../advent';
import { cartesianProduct, sum } from '../util';

type Point = { x: number; y: number };

function* gridCoords(): Generator<Point> {
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = -1;
  for (let i = 1; ; ++i) {
    yield { x, y };
    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y))
      [dx, dy] = [-dy, dx];
    x += dx;
    y += dy;
  }
}

function distanceTo(n: number): number {
  let i = 1;
  for (const p of gridCoords()) {
    if (i++ === n) return Math.abs(p.x) + Math.abs(p.y);
  }
}

function neighbors(p: Point): Point[] {
  const d = [-1, 0, 1];
  return cartesianProduct(d, d)
    .filter((x) => x.some(Boolean))
    .map(([x, y]) => ({ x: p.x + x, y: p.y + y }));
}

function firstGreaterThan(n: number): number {
  const grid = new Map<string, number>();
  const h = (p: Point): string => [p.x, p.y].join(',');
  for (const p of gridCoords()) {
    const val = sum(neighbors(p).map((np) => grid.get(h(np)) || 0)) || 1;
    if (val > n) return val;
    grid.set(h(p), val);
  }
}

example.equal(distanceTo(1), 0);
example.equal(distanceTo(12), 3);
example.equal(distanceTo(23), 2);
example.equal(distanceTo(1024), 31);

const input = Number(load(3).raw);
answers.expect(371, 369601);
answers(
  () => distanceTo(input),
  () => firstGreaterThan(input)
);
