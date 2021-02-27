import { answers, load } from '../advent';
import { XMap, XSet } from '../util';
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
type Point = { x: number; y: number };
type Grid = XMap<Point, Status>;
const h = ({ x, y }: Point) => `${x},${y}`;

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
  const grid = new XMap<Point, Status>(h);
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
  const visited = new XSet(h, [start]);
  const q: [Point, number][] = [[start, 0]];
  const hTarget = h(grid.entries().find(([p, s]) => s === Status.Oxygen)[0]);
  while (q.length) {
    const [cur, steps] = q.shift();
    if (h(cur) == hTarget) return steps;
    for (const moveFrom of moves.values()) {
      const next = moveFrom(cur);
      if (!visited.has(next) && grid.get(next) !== Status.Wall) {
        visited.add(next);
        q.push([next, steps + 1]);
      }
    }
  }
  return -1;
}

function fill(grid: Grid): number {
  const start = grid.entries().find(([p, s]) => s === Status.Oxygen)[0];
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

const program = parse(load(15).raw);
answers.expect(298, 346);
answers(
  () => walk(buildGrid(program)),
  () => fill(buildGrid(program))
);
