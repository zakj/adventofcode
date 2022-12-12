import { load, solve } from 'lib/advent';
import { neighbors4, parseGrid, Point, PointGrid, pointHash } from 'lib/coords';
import { minDistance } from 'lib/graph';
import { iter } from 'lib/iter';

type HeightMap = {
  grid: PointGrid<number>;
  start: Point;
  end: Point;
};

const A_VAL = 'a'.charCodeAt(0);
const Z_VAL = 'z'.charCodeAt(0) - A_VAL;

function parse(lines: string[]): HeightMap {
  let start: Point;
  let end: Point;
  const grid = parseGrid(lines, (c) => {
    if (c === 'S') return -Infinity;
    else if (c === 'E') return Infinity;
    else return c.charCodeAt(0) - A_VAL;
  });
  iter(grid).forEach(([p, v]) => {
    if (v === -Infinity) {
      start = p;
      grid.set(p, A_VAL);
    } else if (v === Infinity) {
      end = p;
      grid.set(p, Z_VAL);
    }
  });
  return { grid, start, end };
}

function shortestPath(
  grid: PointGrid<number>,
  starts: Point[],
  end: Point
): number {
  const edges = (cur: Point) => {
    const height = grid.get(cur);
    return neighbors4(cur).filter((p) => grid.get(p) <= height + 1);
  };
  return iter(starts)
    .map((start) => minDistance(start, pointHash, { goal: end, edges }))
    .filter((v) => v > 0)
    .min();
}

const { grid, start, end } = parse(load().lines);
export default solve(
  () => shortestPath(grid, [start], end),
  () =>
    shortestPath(
      grid,
      iter(grid)
        .filter(([, c]) => c === 0)
        .map(([p]) => p)
        .toArray(),
      end
    )
).expect(481, 480);
