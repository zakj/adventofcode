import { main } from 'lib/advent';
import { parseGrid, PointGrid } from 'lib/coords';
import { lines, ValuesOf } from 'lib/util';

const Cell = {
  Empty: '.',
  East: '>',
  South: 'v',
} as const;
type Cell = ValuesOf<typeof Cell>;

function stepsToStabilize(grid: PointGrid<Cell>): number {
  let steps = 0;

  for (;;) {
    ++steps;

    const eastMoves = [];
    for (const y of grid.ys) {
      for (const x of grid.xs) {
        const next = (x + 1) % grid.width;
        if (grid.get(x, y) === Cell.East && grid.get(next, y) === Cell.Empty)
          eastMoves.push([x, y, next]);
      }
    }
    for (const [x, y, next] of eastMoves) {
      grid.set(x, y, Cell.Empty);
      grid.set(next, y, Cell.East);
    }

    const southMoves = [];
    for (const y of grid.ys) {
      for (const x of grid.xs) {
        const next = (y + 1) % grid.height;
        if (grid.get(x, y) === Cell.South && grid.get(x, next) === Cell.Empty)
          southMoves.push([x, y, next]);
      }
    }
    for (const [x, y, next] of southMoves) {
      grid.set(x, y, Cell.Empty);
      grid.set(x, next, Cell.South);
    }

    if (eastMoves.length + southMoves.length === 0) return steps;
  }
}

main((s) => stepsToStabilize(parseGrid(lines(s), (v) => v as Cell)));
