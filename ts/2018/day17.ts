import { main } from 'lib/advent';
import { Point, PointMap, PointSet, pointToString } from 'lib/coords';
import { lines, range } from 'lib/util';

enum Cell {
  Sand = '.',
  Clay = '#',
  Flow = '|',
  Water = '~',
}
type Grid = {
  minY: number;
  maxY: number;
  cells: PointMap<Cell>;
};
const FOUNTAIN: Point = { x: 500, y: 0 };

function parse(s: string): Grid {
  let minY = Infinity;
  let maxY = -Infinity;
  const cells = new PointMap<Cell>();
  lines(s).forEach((line) => {
    const elements = line.split(', ');
    const ps: { x: number[]; y: number[] } = { x: null, y: null };
    for (const el of elements) {
      const [name, vals] = el.split('=');
      if (vals.includes('.')) {
        const [low, high] = vals.split('..').map(Number);
        ps[name] = range(low, high + 1);
      } else {
        ps[name] = [Number(vals)];
      }
    }
    for (const x of ps.x) {
      for (const y of ps.y) {
        minY = Math.min(y, minY);
        maxY = Math.max(y, maxY);
        cells.set({ x, y }, Cell.Clay);
      }
    }
  });
  return { cells, minY, maxY };
}

function toString(grid: Grid): string {
  let minX = FOUNTAIN.x;
  let maxX = FOUNTAIN.x;
  [...grid.cells.keys()].forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  });
  const rows = [];
  const fHash = pointToString(FOUNTAIN);
  const padding = Math.max(maxX.toString().length, grid.maxY.toString().length);
  for (const y of range(Math.min(FOUNTAIN.y, grid.minY), grid.maxY + 1)) {
    const row = [`${y} `.padStart(padding + 1)];
    for (const x of range(minX, maxX + 1)) {
      const hash = pointToString({ x, y });
      row.push(hash === fHash ? '+' : grid.cells.get({ x, y }) || Cell.Sand);
    }
    rows.push(row.join(''));
  }
  return rows.join('\n');
}

function fill(grid: Grid): Grid {
  const cells = new PointMap(grid.cells);
  grid = { ...grid, cells };

  const cell = (p: Point) => cells.get(p) || Cell.Sand;
  const canFlow = (p: Point): boolean =>
    [Cell.Flow, Cell.Sand].includes(cell(p));

  const q = [FOUNTAIN];
  while (q.length) {
    const cur = q.shift();
    const below = { x: cur.x, y: cur.y + 1 };
    if (below.y > grid.maxY || cell(below) === Cell.Flow) {
      continue;
    } else if (cell(below) === Cell.Sand) {
      // Flow down.
      cells.set(below, Cell.Flow);
      q.push(below);
    } else {
      // Blocked on settled water or clay; flow sideways.
      let overflow = false;
      const filled = new PointSet([cur]);
      for (const d of [-1, 1]) {
        let side = cur;
        for (;;) {
          side = { x: side.x + d, y: side.y };
          if (!canFlow(side)) break;
          filled.add(side);
          if (canFlow({ x: side.x, y: side.y + 1 })) {
            overflow = true;
            q.push(side);
            break;
          }
        }
      }
      if (overflow) {
        [...filled].forEach((hash) => cells.set(hash, Cell.Flow));
      } else {
        // Trapped water; move back up the flow.
        [...filled].forEach((hash) => cells.set(hash, Cell.Water));
        q.push({ x: cur.x, y: cur.y - 1 });
      }
    }
  }
  return grid;
}

function countCells(grid: Grid, types: Cell[]): number {
  return [...grid.cells.entries()].filter(([{ y }, c]) => {
    return y >= grid.minY && y <= grid.maxY && types.includes(c);
  }).length;
}

main(
  (s) => countCells(fill(parse(s)), [Cell.Flow, Cell.Water]),
  (s) => countCells(fill(parse(s)), [Cell.Water])
);
