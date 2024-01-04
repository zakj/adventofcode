import { main } from 'lib/advent';
import { DefaultDict } from 'lib/collections';
import { minDistance } from 'lib/graph';
import { chunks, combinations, lines } from 'lib/util';

type State = {
  floor: number;
  locations: number[];
};
const TOP_FLOOR = 4;

function parse(s: string): number[] {
  const re = new RegExp(
    `(?<element>\\w+)` +
      `(?:` +
      `(?<microchip>-compatible microchip)|(?<generator> generator)` +
      `)`,
    'g'
  );
  const elements = new DefaultDict<string, number[]>(() => []);
  lines(s).forEach((line, i) => {
    const matches = line.matchAll(re);
    for (const match of matches) {
      elements.get(match.groups.element)[match.groups.microchip ? 1 : 0] =
        i + 1;
    }
  });
  return [...elements.values()].flat().map(Number);
}

function isSafe({ locations }: State): boolean {
  // A microchip is safe if it is paired with its generator
  //   OR there are no generators on its floor.
  const generatorFloors = new Set(locations.filter((_, i) => i % 2 === 0));
  return chunks(locations, 2).every(
    ([g, m]) => g === m || !generatorFloors.has(m)
  );
}

function serialize({ floor, locations }: State): string {
  return [floor, ...locations].join('');
}

function edges({ floor, locations }: State): State[] {
  const lowestComponent = Math.min(...locations);
  const currentFloorIndexes = locations
    .map((f, i) => [f, i])
    .filter(([f]) => f === floor)
    .map(([, i]) => i);

  // If we can move 2 elements up, skip moving 1. If we can move 1 element down,
  // skip moving 2.
  const moves2 = [...combinations(currentFloorIndexes)];
  const moves1 = currentFloorIndexes.map((i) => [i]);
  const floorMoves = [];
  if (floor + 1 <= TOP_FLOOR) floorMoves.push([floor + 1, [moves2, moves1]]);
  if (floor - 1 >= lowestComponent)
    floorMoves.push([floor - 1, [moves1, moves2]]);

  const candidates = [];
  for (const [floor, batches] of floorMoves) {
    let found = false;
    for (const moves of batches) {
      for (const move of moves) {
        let nextLocations = locations.slice();
        for (const i of move) nextLocations[i] = floor;
        nextLocations = chunks(nextLocations, 2).sort().flat();
        const next = { floor, locations: nextLocations };
        if (!isSafe(next)) continue;
        candidates.push(next);
        found = true;
      }
      if (found) break;
    }
  }
  return candidates;
}

const goalFor = ({ locations }: State): State => ({
  floor: TOP_FLOOR,
  locations: new Array(locations.length).fill(TOP_FLOOR),
});

function start(s: string, extra: number[] = []): number {
  const start = { floor: 1, locations: [...parse(s), ...extra] };
  return minDistance(start, serialize, { goal: goalFor(start), edges });
}

main(
  (s) => start(s),
  (s) => start(s, [1, 1, 1, 1])
);
