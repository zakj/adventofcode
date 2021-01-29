import { STATUS_CODES } from 'http';

import { answers, example, load } from '../advent';
import { sum, zip } from '../util';

type Grid = Map<string, boolean>;

function parse(lines: string[]): Grid {
  const midPoint = Math.floor(lines.length / 2);
  return new Map(
    lines.flatMap((line, y) =>
      line
        .split('')
        .map((c, x) => [[x - midPoint, y - midPoint].join(','), c === '#'])
    )
  );
}

enum Dir {
  U,
  R,
  D,
  L,
}

const moves = new Map([
  [Dir.U, '0,-1'],
  [Dir.R, '1,0'],
  [Dir.D, '0,1'],
  [Dir.L, '-1,0'],
]);

function move(pos: string, dir: Dir): string {
  return zip(...[pos, moves.get(dir)].map((c) => c.split(',').map(Number)))
    .map(sum)
    .join(',');
}

function part1(n: number, grid: Grid): number {
  grid = new Map(grid);
  let infections = 0;
  let pos = '0,0';
  let dir = Dir.U;
  for (let i = 0; i < n; ++i) {
    const cur = grid.get(pos);
    dir = (dir + (cur ? 1 : 3)) % 4;
    grid.set(pos, !cur);
    if (!cur) infections++;
    pos = move(pos, dir);
  }
  return infections;
}

enum State {
  Clean,
  Weakened,
  Infected,
  Flagged,
}

function part2(n: number, infectedGrid: Grid): number {
  const grid = new Map<string, State>(
    [...infectedGrid.entries()].map(([k, v]) => [
      k,
      v ? State.Infected : State.Clean,
    ])
  );
  let infections = 0;
  let pos = '0,0';
  let dir = Dir.U;
  for (let i = 0; i < n; ++i) {
    const state = grid.has(pos) ? grid.get(pos) : State.Clean;
    let newState: State;
    switch (state) {
      case State.Clean:
        dir = (dir + 3) % 4;
        newState = State.Weakened;
        break;
      case State.Weakened:
        newState = State.Infected;
        infections++;
        break;
      case State.Infected:
        dir = (dir + 1) % 4;
        newState = State.Flagged;
        break;
      case State.Flagged:
        dir = (dir + 2) % 4;
        newState = State.Clean;
        break;
    }
    grid.set(pos, newState);
    pos = move(pos, dir);
  }
  return infections;
}

const exampleGrid = parse(load(22, 'ex').lines);
example.equal(part1(70, exampleGrid), 41);
example.equal(part2(100, exampleGrid), 26);
example.equal(part2(10e6, exampleGrid), 2511944);

const grid = parse(load(22).lines);
answers.expect(5399, 2511776);
answers(
  () => part1(10e3, grid),
  () => part2(10e6, grid)
);
