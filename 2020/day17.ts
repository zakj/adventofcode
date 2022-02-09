import { example, load, solve } from 'lib/advent';
import { iter } from 'lib/iter';
import {
  cartesianProduct,
  pairingSzudzik,
  pairingSzudzikSigned,
  XMap,
  XSet,
} from 'lib/util';

type PointNd = number[];
type Grid = XSet<PointNd, number>;
type Neighbors = (p: PointNd) => PointNd[];

function parse(lines: string[]): Grid {
  const grid = new XSet<PointNd, number>(pointNdHash);
  lines.forEach((line, y) => {
    [...line].forEach((value, x) => {
      if (value !== '#') return;
      const point = [x, y, 0];
      grid.add(point);
    });
  });
  return grid;
}

function to4d(grid: Grid): Grid {
  return new XSet<PointNd, number>(
    pointNdHash,
    [...grid].map((p) => p.concat(0))
  );
}

function pointNdHash(p: PointNd): number {
  const a = pairingSzudzikSigned(p[0], p[1]);
  const b = pairingSzudzikSigned(p[2], p[3] ?? 0);
  return pairingSzudzik(a, b);
}

function neighbors(dimensions: 3 | 4) {
  const neighborCache = new XMap<PointNd, PointNd[], number>(pointNdHash);
  const ds = [-1, 0, 1];
  const deltas = [ds, ds, ds];
  if (dimensions === 4) deltas.push(ds);
  const product = cartesianProduct(...deltas).filter((d) => d.some((x) => x));
  const combine: (p: PointNd, d: PointNd) => PointNd = {
    3: (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]],
    4: (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2], p[3] + d[3]],
  }[dimensions];

  return (point: PointNd) => {
    if (!neighborCache.has(point)) {
      neighborCache.set(
        point,
        product.map((d) => combine(point, d))
      );
    }
    return neighborCache.get(point);
  };
}

function round(grid: Grid, neighbors: Neighbors): Grid {
  const next = new XSet<PointNd, number>(pointNdHash);
  const seen = new XSet<PointNd, number>(pointNdHash);

  const candidates = [...grid].flatMap((p) => neighbors(p));
  for (const cur of candidates) {
    if (seen.has(cur)) continue;
    seen.add(cur);
    const activeNeighbors = iter(neighbors(cur))
      .filter((p) => grid.has(p))
      .take(4).size;
    if (activeNeighbors === 3 || (grid.has(cur) && activeNeighbors === 2))
      next.add(cur);
  }
  return next;
}

function rounds(grid: Grid, neighbors: Neighbors, n: number): number {
  for (let i = 0; i < n; ++i) grid = round(grid, neighbors);
  return grid.size;
}

const exampleInput = parse(load('ex').lines);
example.equal(112, rounds(exampleInput, neighbors(3), 6));
example.equal(848, rounds(to4d(exampleInput), neighbors(4), 6));

const input = parse(load().lines);
export default solve(
  () => rounds(input, neighbors(3), 6),
  () => rounds(to4d(input), neighbors(4), 6)
).expect(426, 1892);

// 1.75s -> 495ms
