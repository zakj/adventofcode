import { load, solve } from '../advent';
import { combinations, product, sum } from '../util';

type Point = {
  x: number;
  y: number;
  z: number;
};
type Velocity = {
  x: number;
  y: number;
  z: number;
};
type Moon = Point & { v: Velocity };

function parse(lines: string[]): Moon[] {
  const re = /^<x=(-?\d+), y=(-?\d+), z=(-?\d+)>$/;
  return lines.map((line) => {
    const match = line.match(re);
    const [x, y, z] = match.slice(1, 4).map(Number);
    return { x, y, z, v: { x: 0, y: 0, z: 0 } };
  });
}

function step(moons: Moon[]): void {
  for (const [a, b] of combinations(moons)) {
    for (const p of ['x', 'y', 'z']) {
      if (a[p] === b[p]) continue;
      if (a[p] > b[p]) {
        a.v[p]--;
        b.v[p]++;
      } else {
        a.v[p]++;
        b.v[p]--;
      }
    }
  }

  for (const moon of moons) {
    for (const p of ['x', 'y', 'z']) {
      moon[p] += moon.v[p];
    }
  }
}

function moonEnergy(moon: Moon): number {
  const pot = Math.abs(moon.x) + Math.abs(moon.y) + Math.abs(moon.z);
  const kin = Math.abs(moon.v.x) + Math.abs(moon.v.y) + Math.abs(moon.v.z);
  return pot * kin;
}

function lcm(...xs: number[]): number {
  const max = Math.max(...xs);
  let hcf: number;
  for (let i = 1; i < max; ++i) {
    if (xs.every((x) => x % i === 0)) hcf = i;
  }
  return product(xs) / Math.pow(hcf, xs.length - 1);
}

const moons = parse(load().lines);
export default solve(
  () => {
    for (let i = 0; i < 1000; ++i) step(moons);
    return sum(moons.map(moonEnergy));
  },
  () => {
    const hash = (p: string) =>
      moons.map((moon) => `${moon[p]},${moon.v[p]}`).join('|');
    const start = {
      x: hash('x'),
      y: hash('y'),
      z: hash('z'),
    };
    const cycle = { x: null, y: null, z: null };
    for (let steps = 1; !(cycle.x && cycle.y && cycle.z); ++steps) {
      step(moons);
      if (!cycle.x && hash('x') === start.x) cycle.x = steps;
      if (!cycle.y && hash('y') === start.y) cycle.y = steps;
      if (!cycle.z && hash('z') === start.z) cycle.z = steps;
    }
    return lcm(cycle.x, cycle.y, cycle.z);
  }
).expect(9127, 353620566035124);
