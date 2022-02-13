import { load, solve } from 'lib/advent';
import { Point, pointHash, PointMap } from 'lib/coords';
import { minDistance } from 'lib/graph';
import { compile, parse, Program } from './intcode';

enum Move {
  N = 1,
  S = 2,
  W = 3,
  E = 4,
}
enum Status {
  Wall = 0,
  Path = 1,
  Oxygen = 2,
}
type Grid = PointMap<Status>;

const opposite: Record<Move, Move> = {
  [Move.N]: Move.S,
  [Move.S]: Move.N,
  [Move.W]: Move.E,
  [Move.E]: Move.W,
};

const moves: Map<Move, (p: Point) => Point> = new Map([
  [Move.N, ({ x, y }) => ({ x, y: y - 1 })],
  [Move.S, ({ x, y }) => ({ x, y: y + 1 })],
  [Move.W, ({ x, y }) => ({ x: x - 1, y })],
  [Move.E, ({ x, y }) => ({ x: x + 1, y })],
]);

function buildGrid(program: Program): Grid {
  const droid = compile(program);
  const grid = new PointMap<Status>();
  let cur = { x: 0, y: 0 };
  grid.set(cur, Status.Path);

  const q: Move[] = [];
  do {
    for (const [move, moveTo] of moves.entries()) {
      if (grid.has(moveTo(cur))) continue;
      q.push(opposite[move]);
      q.push(move);
    }

    const move = q.pop();
    const next = moves.get(move)(cur);
    const result = droid(move)[0] as Status;
    grid.set(moves.get(move)(cur), result);

    // Remove backtrack from the queue or update position.
    if (result === Status.Wall) q.pop();
    else cur = next;
  } while (q.length);

  return grid;
}

function walk(grid: Grid): number {
  const start = { x: 0, y: 0 };
  const goal = grid.entries().find(([, s]) => s === Status.Oxygen)[0];
  const edges = (p: Point) =>
    [...moves.values()]
      .map((f) => f(p))
      .filter((n) => grid.get(n) !== Status.Wall);
  return minDistance(start, pointHash, { goal, edges });
}

function fill(grid: Grid): number {
  const start = grid.entries().find(([, s]) => s === Status.Oxygen)[0];
  const q: [Point, number][] = [[start, 0]];
  let maxMinutes = 0;
  while (q.length) {
    const [cur, minutes] = q.pop();
    maxMinutes = Math.max(maxMinutes, minutes);

    for (const moveFrom of moves.values()) {
      const next = moveFrom(cur);
      if (grid.get(next) === Status.Path) {
        grid.set(next, Status.Oxygen);
        q.push([next, minutes + 1]);
      }
    }
  }
  return maxMinutes;
}

const program = parse(load().raw);
export default solve(
  () => walk(buildGrid(program)),
  () => fill(buildGrid(program))
).expect(298, 346);
