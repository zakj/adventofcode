import { answers, example, load } from '../advent';
import search from '../graph';
import { chunks, combinations, DefaultDict } from '../util';

type State = {
  floor: number;
  locations: number[];
};
const TOP_FLOOR = 4;

function parse(lines: string[]): number[] {
  const re = new RegExp(
    `(?<element>\\w+)` +
      `(?:` +
      `(?<microchip>-compatible microchip)|(?<generator> generator)` +
      `)`,
    'g'
  );
  const elements = new DefaultDict<string, number[]>(() => []);
  lines.forEach((line, i) => {
    const matches = line.matchAll(re);
    for (const match of matches) {
      elements.get(match.groups.element)[match.groups.microchip ? 1 : 0] =
        i + 1;
    }
  });
  return [...elements.values()].flat().map(Number);
}

function isSafe({ floor, locations }: State): boolean {
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

function edgeWeights({ floor, locations }: State): [State, number][] {
  const lowestComponent = Math.min(...locations);
  const currentFloorIndexes = locations
    .map((f, i) => [f, i])
    .filter(([f]) => f === floor)
    .map(([f, i]) => i);

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
  return candidates.map((state) => [state, 1]);
}

const goalFor = ({ locations }: State): State => ({
  floor: TOP_FLOOR,
  locations: new Array(locations.length).fill(TOP_FLOOR),
});

const exampleStart = { floor: 1, locations: parse(load(11, 'ex').lines) };
example.equal(
  search(exampleStart, goalFor(exampleStart), serialize, edgeWeights),
  11
);

const start = { floor: 1, locations: parse(load(11).lines) };
const start2 = { floor: 1, locations: [...start.locations, ...[1, 1, 1, 1]] };
answers.expect(37, 61);
answers(
  () => search(start, goalFor(start), serialize, edgeWeights),
  () => search(start2, goalFor(start2), serialize, edgeWeights)
);
