import { example, load, solve } from 'lib/advent';
import { neighbors8, parseGrid, Point, PointGrid } from 'lib/coords';
import { ValuesOf } from 'lib/util';

const Type = {
  Floor: '.',
  EmptySeat: 'L',
  OccupiedSeat: '#',
} as const;
type PositionType = ValuesOf<typeof Type>;

type Grid = PointGrid<PositionType>;

function parse(lines: string[]): Grid {
  const charToType = {
    ['.']: Type.Floor,
    ['L']: Type.EmptySeat,
    ['#']: Type.OccupiedSeat,
  };
  return parseGrid(lines, (c) => charToType[c]);
}

function runSeatingRound1(grid: Grid): [grid: Grid, changed: boolean] {
  const next = grid.copy();
  let changed = false;
  for (const x of grid.xs) {
    for (const y of grid.ys) {
      const type = grid.get(x, y);
      const occupiedNeighbors = neighbors8({ x, y }).filter(
        (p) => grid.has(p) && grid.get(p) === Type.OccupiedSeat
      ).length;
      if (type === Type.EmptySeat && occupiedNeighbors === 0) {
        changed = true;
        next.set(x, y, Type.OccupiedSeat);
      } else if (type === Type.OccupiedSeat && occupiedNeighbors >= 4) {
        changed = true;
        next.set(x, y, Type.EmptySeat);
      }
    }
  }
  return [next, changed];
}

function firstSeat(grid: Grid, from: Point, direction: Point): PositionType {
  const cur = { x: from.x + direction.x, y: from.y + direction.y };
  while (grid.has(cur)) {
    const type = grid.get(cur);
    if (type !== Type.Floor) return type;
    cur.x += direction.x;
    cur.y += direction.y;
  }
}

function countVisibleSeats(grid: Grid, from: Point): number {
  const directions = neighbors8({ x: 0, y: 0 });
  return directions.reduce((seats, dir) => {
    const type = firstSeat(grid, from, dir);
    return seats + (type === Type.OccupiedSeat ? 1 : 0);
  }, 0);
}

function runSeatingRound2(grid: Grid): [grid: Grid, changed: boolean] {
  const next = grid.copy();
  let changed = false;
  for (const x of grid.xs) {
    for (const y of grid.ys) {
      const type = grid.get(x, y);
      const occupiedVisibleSeats = countVisibleSeats(grid, { x, y });
      if (type === Type.EmptySeat && occupiedVisibleSeats === 0) {
        changed = true;
        next.set(x, y, Type.OccupiedSeat);
      }
      if (type === Type.OccupiedSeat && occupiedVisibleSeats >= 5) {
        changed = true;
        next.set(x, y, Type.EmptySeat);
      }
    }
  }
  return [next, changed];
}

function stabilize(grid: Grid, round: (grid: Grid) => [Grid, boolean]): number {
  let changed = true;
  while (changed) [grid, changed] = round(grid);
  return grid.filter((t) => t === Type.OccupiedSeat).length;
}

const exampleGrid = parse(load('ex').lines);
example.equal(37, stabilize(exampleGrid, runSeatingRound1));
example.equal(26, stabilize(exampleGrid, runSeatingRound2));

const grid = parse(load().lines);
export default solve(
  () => stabilize(grid, runSeatingRound1),
  () => stabilize(grid, runSeatingRound2)
).expect(2263, 2002);
