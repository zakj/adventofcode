import { main } from 'lib/advent';
import { neighbors4, parseGrid, Point, PointGrid, pointHash } from 'lib/coords';
import { minDistance } from 'lib/graph';
import { lines } from 'lib/util';

type RiskGrid = PointGrid<number>;

function edgeWeights(end: Point, grid: RiskGrid) {
  return function edgeWeights(p: Point): [Point, number][] {
    return neighbors4(p)
      .filter((p) => grid.has(p))
      .map((p) => [p, grid.get(p)]);
  };
}

function leastRisk(grid: RiskGrid): number {
  const start = { x: 0, y: 0 };
  const goal = { x: grid.width - 1, y: grid.height - 1 };
  const heuristic = (p) => goal.x - p.x + (goal.y - p.y);
  return minDistance(start, pointHash, {
    goal,
    edgeWeights: edgeWeights(goal, grid),
    heuristic,
  });
}

function expandGrid(grid: RiskGrid, by = 5): RiskGrid {
  const next = Array(grid.height * by);
  for (const y of grid.ys) {
    for (let i = 0; i < by; ++i) {
      const row = [];
      next[y + grid.height * i] = row;
      for (const x of grid.xs) {
        for (let j = 0; j < by; ++j) {
          row[x + grid.width * j] = ((grid.get(x, y) + (i + j) - 1) % 9) + 1;
        }
      }
    }
  }
  return PointGrid.from(next);
}

main(
  (s) => leastRisk(parseGrid(lines(s), Number)),
  (s) => leastRisk(expandGrid(parseGrid(lines(s), Number)))
);
