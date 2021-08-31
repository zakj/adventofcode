import { answers, load } from '../advent';
import { chunks, sum } from '../util';
import { compile, parse } from './intcode';

enum Dir {
  Up,
  Right,
  Down,
  Left,
}
type Point = { x: number; y: number };
type Grid = string[][];

function toGrid(s: string): Grid {
  return s.split('\n').map((row) => row.split(''));
}

function alignmentParameters(grid: Grid): number {
  const parameters = [];
  for (let row = 1; row < grid.length - 1; ++row) {
    for (let col = 1; col < grid[0].length - 1; ++col) {
      const points = [
        [row, col],
        [row + 1, col],
        [row - 1, col],
        [row, col + 1],
        [row, col - 1],
      ];
      if (points.every(([row, col]) => grid[row][col] === '#'))
        parameters.push(row * col);
    }
  }
  return sum(parameters);
}

function neighbors(grid: Grid, row: number, col: number): string[] {
  const points = [
    [row + 1, col],
    [row - 1, col],
    [row, col + 1],
    [row, col - 1],
  ];
  return points.map(([row, col]) => grid[row]?.[col]);
}

function findPath(grid: Grid): string {
  let start: Point;
  let finish: Point;
  // TODO improve
  for (let row = 0; row < grid.length; ++row) {
    for (let col = 0; col < grid[0].length; ++col) {
      const c = grid[row][col];
      if (['<', '>', '^', 'v'].includes(c)) start = { x: col, y: row };
      else if (
        c === '#' &&
        neighbors(grid, row, col).filter((c) => c === '.').length === 3
      )
        finish = { x: col, y: row };
    }
  }

  let cur = start;
  let dir = {
    '^': Dir.Up,
    '>': Dir.Right,
    v: Dir.Down,
    '<': Dir.Left,
  }[grid[start.y][start.x]];

  const walkable = (d: Dir) => {
    const row = cur.y + (d === Dir.Up ? -1 : d === Dir.Down ? 1 : 0);
    const col = cur.x + (d === Dir.Left ? -1 : d === Dir.Right ? 1 : 0);
    if (grid[row]?.[col] === '#') return { x: col, y: row };
    return null;
  };

  let forward = 0;
  const path = [];
  while (cur.x !== finish.x || cur.y !== finish.y) {
    const next = walkable(dir);
    if (next) {
      forward++;
      cur = next;
    } else {
      if (forward > 0) {
        path.push(forward);
        forward = 0;
      }
      const left = (dir + 3) % 4;
      const right = (dir + 1) % 4;
      if (walkable(left)) {
        path.push('L');
        dir = left;
      } else {
        path.push('R');
        dir = right;
      }
    }
  }
  if (forward > 0) path.push(forward);
  return path.join(',');
}

// TODO this is such a hack
function compress(path: string): {
  main: string;
  A: string;
  B: string;
  C: string;
} {
  // Each subroutine should start with a turn and end with a move, so we can
  // split into pairs.
  const pairs = chunks(path.split(','), 2).map((x) => x.join(','));
  // Replace pairs with single characters for ease of comparison later.
  const replacements = 'TUVWXYZ';
  const map = new Map<string, string>();
  let i = 0;
  for (const pair of pairs) {
    if (map.has(pair)) continue;
    map.set(pair, replacements[i++]);
  }

  const replaced = pairs.map((p) => map.get(p)).join('');
  let A: string;
  let B: string;
  let C: string;
  outer: for (let aLen = 2; aLen < 7; ++aLen) {
    A = replaced.slice(0, aLen + 1);
    for (let cLen = 2; cLen < 7; ++cLen) {
      C = replaced.slice(-cLen);
      const fragments = replaced.split(A).join('').split(C).filter(Boolean);
      if (fragments.length === 1) continue;
      // TODO: Fails if the shortest fragment is always duplicated.
      B = fragments.reduce((min, f) => (f.length < min.length ? f : min));
      if (fragments.some((f) => f.replaceAll(B, '').length)) continue;
      // Otherwise we have a working set of subroutines.
      break outer;
    }
  }

  const revmap = new Map([...map.entries()].map(([k, v]) => [v, k]));
  const toSub = (s: string): string =>
    s
      .split('')
      .map((c) => revmap.get(c))
      .join(',');
  A = toSub(A);
  B = toSub(B);
  C = toSub(C);
  return {
    main: path.replaceAll(A, 'A').replaceAll(B, 'B').replaceAll(C, 'C'),
    A,
    B,
    C,
  };
}

const program = parse(load(17).raw);
answers.expect(2804, 833429);
answers(
  () => {
    const robot = compile(program);
    const grid = toGrid(robot.ascii());
    return alignmentParameters(grid);
  },
  () => {
    const robot = compile(program);
    robot.memory.set(0, 2);
    const path = findPath(toGrid(robot.ascii()));
    const routines = compress(path);
    return robot(
      routines.main,
      routines.A,
      routines.B,
      routines.C,
      'n' // continuous?
    ).pop();
  }
);
