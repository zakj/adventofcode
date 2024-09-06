import { main } from 'lib/advent';
import { neighbors4, parseGrid, Point, PointGrid, pointHash } from 'lib/coords';
import { minDistance } from 'lib/graph';
import { iter } from 'lib/iter';
import { lines } from 'lib/util';

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
  const edgeCache = new Map<number, Point[]>();
  const edges = (cur: Point) => {
    const h = pointHash(cur);
    if (edgeCache.has(h)) return edgeCache.get(h);
    const height = grid.get(cur);
    const ns = neighbors4(cur).filter((p) => grid.get(p) <= height + 1);
    edgeCache.set(h, ns);
    return ns;
  };
  return iter(starts)
    .map((start) => minDistance(start, pointHash, { goal: end, edges }))
    .filter((v) => v > 0)
    .min();
}

main(
  (s) => {
    const { grid, start, end } = parse(lines(s));
    return shortestPath(grid, [start], end);
  },
  (s) => {
    const { grid, end } = parse(lines(s));
    return shortestPath(
      grid,
      iter(grid)
        .filter(([, c]) => c === 0)
        .map(([p]) => p)
        .toArray(),
      end
    );
  }
);
