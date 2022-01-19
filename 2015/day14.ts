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

const reindeer = parse(load().lines);
export default solve(
  () => Math.max(...reindeer.map((r) => distanceAtSecond(r, SECONDS))),
  () => {
    const points = new Array(reindeer.length).fill(0);
    for (let i = 1; i <= SECONDS; ++i) {
      const distances = reindeer.map((r) => distanceAtSecond(r, i));
      const lead = Math.max(...distances);
      for (let j = 0; j < distances.length; ++j) {
        if (distances[j] === lead) ++points[j];
      }
    }
    return Math.max(...points);
  }
).expect(2660, 1256);
