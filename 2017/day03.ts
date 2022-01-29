import { example, load, solve } from '../advent';
import { neighbors8, Point, PointMap } from '../coords';
import { sum } from '../util';

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

function firstGreaterThan(n: number): number {
  const grid = new PointMap<number>();
  for (const p of gridCoords()) {
    const val = sum(neighbors8(p).map((np) => grid.get(np) || 0)) || 1;
    if (val > n) return val;
    grid.set(p, val);
  }
}

example.equal(distanceTo(1), 0);
example.equal(distanceTo(12), 3);
example.equal(distanceTo(23), 2);
example.equal(distanceTo(1024), 31);

const input = Number(load().raw);
export default solve(
  () => distanceTo(input),
  () => firstGreaterThan(input)
).expect(371, 369601);
