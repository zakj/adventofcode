import { main } from 'lib/advent';
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
import { lines, ValuesOf } from 'lib/util';

type Start = { grid: PointMap<boolean>; pos: Point };

function parse(s: string): Start {
  const midPoint = Math.floor(lines(s).length / 2);
  return {
    grid: parseMap(lines(s), (c) => c === '#'),
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

main(
  (s, { bursts1 }) => part1(bursts1 as number, parse(s)),
  (s, { bursts2 }) => part2(bursts2 as number, parse(s))
);
