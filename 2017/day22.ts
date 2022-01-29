import { example, load, solve } from 'lib/advent';
import {
  Dir,
  move,
  parseMap,
  Point,
  PointMap,
  turnAround,
  turnLeft,
  turnRight,
} from 'lib/coords';
import { ValuesOf } from 'lib/util';

type Start = { grid: PointMap<boolean>; pos: Point };

function parse(lines: string[]): Start {
  const midPoint = Math.floor(lines.length / 2);
  return {
    grid: parseMap(lines, (c) => c === '#'),
    pos: { x: midPoint, y: midPoint },
  };
}

function part1(n: number, start: Start): number {
  const grid = new PointMap(start.grid);
  let infections = 0;
  let pos: Point = start.pos;
  let dir: Dir = Dir.Up;
  for (let i = 0; i < n; ++i) {
    const infected = grid.get(pos);
    dir = infected ? turnRight(dir) : turnLeft(dir);
    grid.set(pos, !infected);
    if (!infected) infections++;
    pos = move(pos, dir);
  }
  return infections;
}

const State = {
  Clean: 0,
  Weakened: 1,
  Infected: 2,
  Flagged: 3,
} as const;
type State = ValuesOf<typeof State>;

function part2(n: number, start: Start): number {
  const grid = new PointMap<State>(
    [...start.grid.entries()].map(([k, v]) => [
      k,
      v ? State.Infected : State.Clean,
    ])
  );
  let infections = 0;
  let pos: Point = start.pos;
  let dir: Dir = Dir.Up;
  for (let i = 0; i < n; ++i) {
    const state = grid.get(pos) ?? State.Clean;
    let newState: State;
    switch (state) {
      case State.Clean:
        dir = turnLeft(dir);
        newState = State.Weakened;
        break;
      case State.Weakened:
        newState = State.Infected;
        infections++;
        break;
      case State.Infected:
        dir = turnRight(dir);
        newState = State.Flagged;
        break;
      case State.Flagged:
        dir = turnAround(dir);
        newState = State.Clean;
        break;
    }
    grid.set(pos, newState);
    pos = move(pos, dir);
  }
  return infections;
}

const exampleGrid = parse(load('ex').lines);
example.equal(part1(70, exampleGrid), 41);
example.equal(part2(100, exampleGrid), 26);
example.equal(part2(10e6, exampleGrid), 2511944);

const grid = parse(load().lines);
export default solve(
  () => part1(10e3, grid),
  () => part2(10e6, grid)
).expect(5399, 2511776);
