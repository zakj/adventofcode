import { answers, example, load } from '../advent';

type Point = [x: number, y: number];
type PointHash = string;
type Grid = Map<PointHash, boolean>;

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
  [Dir.U, [0, -1]],
  [Dir.R, [1, 0]],
  [Dir.D, [0, 1]],
  [Dir.L, [-1, 0]],
]);

function move(pos: Point, dir: Dir): Point {
  const move = moves.get(dir);
  return [pos[0] + move[0], pos[1] + move[1]];
}

function part1(n: number, grid: Grid): number {
  grid = new Map(grid);
  let infections = 0;
  let pos: Point = [0, 0];
  let dir = Dir.U;
  for (let i = 0; i < n; ++i) {
    const key = pos.join(',');
    const cur = grid.get(key);
    dir = (dir + (cur ? 1 : 3)) % 4;
    grid.set(key, !cur);
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
  const grid = new Map<PointHash, State>(
    [...infectedGrid.entries()].map(([k, v]) => [
      k,
      v ? State.Infected : State.Clean,
    ])
  );
  let infections = 0;
  let pos: Point = [0, 0];
  let dir = Dir.U;
  for (let i = 0; i < n; ++i) {
    const key = pos.join(',');
    const state = grid.has(key) ? grid.get(key) : State.Clean;
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
    grid.set(key, newState);
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
