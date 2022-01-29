import { iter, range } from 'lib/iter';
import { load, solve } from '../advent';

type Reindeer = { speed: number; on: number; off: number };

const SECONDS = 2503;

function parse(lines: string[]): Reindeer[] {
  const digitRe = /(\d+)/g;
  return lines
    .map((line) => line.match(digitRe).map(Number))
    .map(([speed, on, off]) => ({ speed, on, off }));
}

function distanceAtSecond({ speed, on, off }: Reindeer, n: number): number {
  const cycle = on + off;
  return Math.floor(n / cycle) * speed * on + speed * Math.min(n % cycle, on);
}

const reindeer = iter(parse(load().lines));
export default solve(
  () => reindeer.map((r) => distanceAtSecond(r, SECONDS)).max(),
  () =>
    // TODO: map seconds to wins, then consolidate wins?
    iter(
      range(1, SECONDS)
        .map((i) => reindeer.map((r) => distanceAtSecond(r, i)))
        .reduce((points, rPositions) => {
          const lead = rPositions.max();
          rPositions.forEach((p, i) => {
            if (p === lead) points[i]++;
          });
          return points;
        }, new Array(reindeer.size).fill(0))
    ).max()
).expect(2660, 1256);
