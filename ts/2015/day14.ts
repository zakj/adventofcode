import { main } from 'lib/advent';
import { Iter, iter, range } from 'lib/iter';
import { lines } from 'lib/util';

type Reindeer = { speed: number; on: number; off: number };

const SECONDS = 2503;

function parse(s: string): Iter<Reindeer> {
  const digitRe = /(\d+)/g;
  return iter(
    lines(s)
      .map((line) => line.match(digitRe).map(Number))
      .map(([speed, on, off]) => ({ speed, on, off }))
  );
}

function distanceAtSecond({ speed, on, off }: Reindeer, n: number): number {
  const cycle = on + off;
  return Math.floor(n / cycle) * speed * on + speed * Math.min(n % cycle, on);
}

main(
  (s) =>
    parse(s)
      .map((r) => distanceAtSecond(r, SECONDS))
      .max(),
  (s) => {
    // TODO: map seconds to wins, then consolidate wins?
    const reindeer = parse(s);
    return iter(
      range(1, SECONDS)
        .map((i) => reindeer.map((r) => distanceAtSecond(r, i)))
        .reduce((points, rPositions) => {
          const lead = rPositions.max();
          rPositions.forEach((p, i) => {
            if (p === lead) points[i]++;
          });
          return points;
        }, new Array(reindeer.size).fill(0))
    ).max();
  }
);
