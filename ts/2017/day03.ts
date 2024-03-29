import { main } from 'lib/advent';
import { neighbors8, Point, PointMap } from 'lib/coords';
import { sum } from 'lib/util';

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

main(
  (s) => distanceTo(Number(s)),
  (s) => firstGreaterThan(Number(s))
);
