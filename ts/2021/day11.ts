import { main } from 'lib/advent';
import { neighbors8, parseMap, PointMap, PointSet } from 'lib/coords';
import { range } from 'lib/iter';
import { lines } from 'lib/util';

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

main(
  (s) => {
    const octopuses = parseMap(lines(s), Number);
    return range(100)
      .map(() => stepFlashes(octopuses))
      .sum();
  },
  (s) => {
    const octopuses = parseMap(lines(s), Number);
    return (
      range(Infinity)
        .map((i) => ({ flashes: stepFlashes(octopuses), i }))
        .find(({ flashes }) => flashes === octopuses.size).i + 1
    );
  }
);
