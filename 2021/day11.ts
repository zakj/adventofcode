import { load, solve } from 'lib/advent';
import { neighbors8, parseMap, PointMap, PointSet } from 'lib/coords';

function stepFlashes(octopuses: PointMap<number>): number {
  for (const [point, energy] of octopuses) {
    octopuses.set(point, energy + 1);
  }

  let checkFlashes = true;
  const flashed = new PointSet();
  while (checkFlashes) {
    checkFlashes = false;
    for (const [point, energy] of octopuses) {
      if (energy > 9 && !flashed.has(point)) {
        checkFlashes = true;
        flashed.add(point);
        neighbors8(point)
          .filter((p) => octopuses.has(p))
          .forEach((n) => octopuses.set(n, octopuses.get(n) + 1));
      }
    }
  }

  [...flashed].forEach((o) => octopuses.set(o, 0));
  return flashed.size;
}

const octopuses = parseMap(load().lines, Number);
export default solve(
  () => {
    let flashes = 0;
    for (let i = 0; i < 100; ++i) {
      flashes += stepFlashes(octopuses);
    }
    return flashes;
  },
  () => {
    // XXX mutable octopii :/
    const octopuses = parseMap(load().lines, Number);
    let i = 1;
    while (true) {
      if (stepFlashes(octopuses) === octopuses.size) return i;
      ++i;
    }
  }
).expect(1642, 320);
