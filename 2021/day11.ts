import { answers, load } from '../advent';
import { neighbors8, parseMap, PointMap, PointSet } from '../coords';

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

const octopuses = parseMap(load(11).lines, Number);
answers.expect(1642, 320);
answers(
  () => {
    let flashes = 0;
    for (let i = 0; i < 100; ++i) {
      flashes += stepFlashes(octopuses);
    }
    return flashes;
  },
  () => {
    // XXX mutable octopii :/
    const octopuses = parseMap(load(11).lines, Number);
    let i = 1;
    while (true) {
      if (stepFlashes(octopuses) === octopuses.size) return i;
      ++i;
    }
  }
);
