import { answers, example, load } from '../advent';
import { chunks, combinations, DefaultDict, PriorityQueue, sum } from '../util';

// first digit: elevator floor. then pairs of generator/microchip floor locations.
type State = string;

function parse(lines: string[]): State {
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
  return [...elements.values()].map((x) => x.join('')).join('');
}

function isSafe(state: State): boolean {
  // A microchip is safe if it is paired with its generator
  //   OR there are no generators on its floor.
  const [floor, ...locations] = state.split('').map(Number);
  const generatorFloors = new Set(locations.filter((_, i) => i % 2 === 0));
  return chunks(locations, 2).every(
    ([g, m]) => g === m || !generatorFloors.has(m)
  );
}

function heuristic(state: State): number {
  const [floor, ...locations] = state.split('').map(Number);
  return sum(locations.map((x) => 4 - x)) / 2 + floor - Math.min(...locations);
}

function minPath(
  start: State,
  goal?: State,
  bottomFloor = 1,
  topFloor = 4
): number {
  if (!goal) goal = start.replaceAll(/./g, topFloor.toString());
  // const cameFrom = new Map<State, State>();
  const stepsToReach = new DefaultDict<State, number>(() => Infinity);
  stepsToReach.set(start, 0);
  const cost = (state: State) => stepsToReach.get(state) + heuristic(state);
  const q = new PriorityQueue(cost, [start]);
  while (q.length) {
    const cur = q.shift();
    if (cur === goal) return stepsToReach.get(cur);
    const [floor, ...locations] = cur.split('').map(Number);
    const lowestComponent = Math.min(...locations);
    const indexes = [];
    for (let i = 0; i < locations.length; ++i) {
      if (locations[i] === floor) indexes.push(i);
    }
    const moves = [].concat(
      [...combinations(indexes)],
      indexes.map((i) => [i])
    );
    let movedTwoUp = false;
    let movedOneDown = false;
    for (const dir of [1, -1]) {
      const nextFloor = floor + dir;
      if (
        nextFloor < bottomFloor ||
        nextFloor > topFloor ||
        nextFloor < lowestComponent
      )
        continue;
      for (const move of moves) {
        // Focus on keeping elements higher up.
        if (movedTwoUp && dir === 1 && move.length === 1) continue;
        if (movedOneDown && dir === -1 && move.length === 2) continue;

        let nextLocations = [...locations];
        for (const i of move) nextLocations[i] = nextFloor;
        // Which element is which is irrelevant.
        nextLocations = chunks(nextLocations, 2).sort().flat();

        const next = [].concat(nextFloor, nextLocations).join('');
        const nextSteps = stepsToReach.get(cur) + 1;
        if (!(nextSteps < stepsToReach.get(next) && isSafe(next))) continue;
        if (dir === 1 && move.length === 2) movedTwoUp = true;
        if (dir === -1 && move.length === 1) movedOneDown = true;
        // cameFrom.set(next, cur);
        stepsToReach.set(next, nextSteps);
        q.add(next);
      }
    }
  }
  throw new Error();
}

const exampleState = '1' + parse(load(11, 'ex').lines);
example.equal(minPath(exampleState), 11);

const state = '1' + parse(load(11).lines);
const state2 = state + '1111';
answers(
  () => minPath(state),
  () => minPath(state2)
);
