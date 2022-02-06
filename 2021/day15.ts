import { load, solve } from 'lib/advent';
import { neighbors4, parseGrid, Point, PointGrid, pointHash } from 'lib/coords';
import { minDistance } from 'lib/graph';

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
  const end = { x: grid.width - 1, y: grid.height - 1 };
  const heuristic = (p) => end.x - p.x + (end.y - p.y);
  return minDistance(start, end, pointHash, edgeWeights(end, grid), {
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

const riskGrid = parseGrid(load().lines, Number);
export default solve(
  () => leastRisk(riskGrid),
  () => leastRisk(expandGrid(riskGrid))
).expect(415, 2864);
