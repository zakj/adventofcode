import { example, load, solve } from 'lib/advent';
import { XMap } from 'lib/util';

enum Cell {
  Open = '.',
  Tree = '|',
  Lumberyard = '#',
}
type Point = { x: number; y: number };
type PointHash = string;
type Area = XMap<Point, Cell, PointHash>;

function parse(lines: string[]): Area {
  return new XMap(
    ({ x, y }: Point): PointHash => `${x},${y}`,
    lines.flatMap((row, y) =>
      row.split('').map((c, x) => [{ x, y }, c] as [Point, Cell])
    )
  );
}

function adjacentCells(grid: Area, p: Point): Cell[] {
  return [
    { x: p.x, y: p.y - 1 },
    { x: p.x + 1, y: p.y - 1 },
    { x: p.x + 1, y: p.y },
    { x: p.x + 1, y: p.y + 1 },
    { x: p.x, y: p.y + 1 },
    { x: p.x - 1, y: p.y + 1 },
    { x: p.x - 1, y: p.y },
    { x: p.x - 1, y: p.y - 1 },
  ]
    .filter((p) => grid.has(p))
    .map((p) => grid.get(p));
}

function toString(grid: Area): string {
  const maxX = grid.keys().reduce((max, p) => (p.x > max.x ? p : max)).x;
  const maxY = grid.keys().reduce((max, p) => (p.y > max.y ? p : max)).y;
  const rows = [];
  for (let y = 0; y <= maxY; ++y) {
    const row = [];
    for (let x = 0; x <= maxX; ++x) {
      row.push(grid.get({ x, y }));
    }
    rows.push(row.join(''));
  }
  return rows.join('\n');
}

function cycle(grid: Area): Area {
  const next = grid.copy();
  for (const [p, cell] of grid) {
    const neighbors = adjacentCells(grid, p);
    const nc = (t: Cell): number => neighbors.filter((c) => c === t).length;
    if (cell === Cell.Open) {
      if (nc(Cell.Tree) >= 3) next.set(p, Cell.Tree);
    } else if (cell === Cell.Tree) {
      if (nc(Cell.Lumberyard) >= 3) next.set(p, Cell.Lumberyard);
    } else if (cell === Cell.Lumberyard) {
      if (nc(Cell.Lumberyard) < 1 || nc(Cell.Tree) < 1) next.set(p, Cell.Open);
    }
  }
  return next;
}

function cycles(grid: Area, n: number): number {
  const seen = new Map([[toString(grid), 0]]);
  const history = [grid];
  for (let i = 1; i <= n; ++i) {
    grid = cycle(grid);
    const s = toString(grid);
    if (seen.has(s)) {
      const loop = history.slice(seen.get(s));
      grid = loop[(n - i) % loop.length];
      break;
    }
    seen.set(s, i);
    history.push(grid);
  }
  return (
    grid.values().filter((c) => c === Cell.Tree).length *
    grid.values().filter((c) => c === Cell.Lumberyard).length
  );
}

const exampleGrid = parse(load('ex').lines);
example.equal(cycles(exampleGrid, 10), 1147);

const grid = parse(load().lines);
export default solve(
  () => cycles(grid, 10),
  () => cycles(grid, 1e9)
).expect(560091, 202301);
