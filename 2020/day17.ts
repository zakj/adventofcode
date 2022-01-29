import { example, load, solve } from 'lib/advent';
import { cartesianProduct, sum } from 'lib/util';

type Bound = [number, number];

class TupleMap<T> extends Map<string, T> {
  bounds: { x: Bound; y: Bound; z: Bound; w: Bound };
  constructor() {
    super();
    this.bounds = { x: [0, 0], y: [0, 0], z: [0, 0], w: [0, 0] };
  }
  setActive(k) {
    const [x, y, z, w] = k;
    this.bounds.x = [
      Math.min(x, this.bounds.x[0]),
      Math.max(x, this.bounds.x[1]),
    ];
    this.bounds.y = [
      Math.min(y, this.bounds.y[0]),
      Math.max(y, this.bounds.y[1]),
    ];
    this.bounds.z = [
      Math.min(z, this.bounds.z[0]),
      Math.max(z, this.bounds.z[1]),
    ];
    if (typeof w === 'number') {
      this.bounds.w = [
        Math.min(w, this.bounds.w[0]),
        Math.max(w, this.bounds.w[1]),
      ];
    }
    return this.set(k, true);
  }
  setInactive(k) {
    return this.delete(k);
  }
  delete(k) {
    return super.delete(k.join(','));
  }
  get(k) {
    return super.get(k.join(','));
  }
  set(k, v) {
    return super.set(k.join(','), v);
  }
}

type Grid = TupleMap<boolean>;

function parse(lines: string[], dimensions: 3 | 4 = 3): Grid {
  const grid: Grid = new TupleMap();
  lines.forEach((line, y) => {
    [...line].forEach((value, x) => {
      if (value !== '#') return;
      const point = [x, y];
      while (point.length < dimensions) point.push(0);
      grid.setActive(point);
    });
  });
  return grid;
}

function set(grid: Grid, key: number[], active: boolean): void {
  if (active) grid.setActive(key);
  else grid.setInactive(key);
}

// Faster than the n-ary zip in util
const zip = <T, U>(a: T[], b: U[]): [T, U][] => a.map((k, i) => [k, b[i]]);

const deltaCache: Record<number, number[][]> = {};
function countActiveNeighbors(grid: Grid, point: number[]): number {
  let deltas = deltaCache[point.length];
  if (!deltas) {
    const toCombine: number[][] = [];
    for (let i = 0; i < point.length; ++i) toCombine.push([-1, 0, 1]);
    deltas = deltaCache[point.length] = cartesianProduct(...toCombine).filter(
      (delta) => delta.some((x) => x !== 0)
    );
  }
  return deltaCache[point.length].filter((delta) =>
    grid.get(zip(point, delta).map(sum))
  ).length;
}

function round3d(grid: Grid): Grid {
  const next: Grid = new TupleMap();
  for (let x = grid.bounds.x[0] - 1; x <= grid.bounds.x[1] + 1; ++x) {
    for (let y = grid.bounds.y[0] - 1; y <= grid.bounds.y[1] + 1; ++y) {
      for (let z = grid.bounds.z[0] - 1; z <= grid.bounds.z[1] + 1; ++z) {
        const active = grid.get([x, y, z]);
        const activeNeighbors = countActiveNeighbors(grid, [x, y, z]);
        set(
          next,
          [x, y, z],
          activeNeighbors === 3 || (active && activeNeighbors === 2)
        );
      }
    }
  }
  return next;
}

function round4d(grid: Grid): Grid {
  const next: Grid = new TupleMap();
  for (let x = grid.bounds.x[0] - 1; x <= grid.bounds.x[1] + 1; ++x) {
    for (let y = grid.bounds.y[0] - 1; y <= grid.bounds.y[1] + 1; ++y) {
      for (let z = grid.bounds.z[0] - 1; z <= grid.bounds.z[1] + 1; ++z) {
        for (let w = grid.bounds.w[0] - 1; w <= grid.bounds.w[1] + 1; ++w) {
          const active = grid.get([x, y, z, w]);
          const activeNeighbors = countActiveNeighbors(grid, [x, y, z, w]);
          set(
            next,
            [x, y, z, w],
            activeNeighbors === 3 || (active && activeNeighbors === 2)
          );
        }
      }
    }
  }
  return next;
}

function rounds(fn: (grid: Grid) => Grid, grid: Grid, n: number): Grid {
  for (let i = 0; i < n; ++i) {
    grid = fn(grid);
  }
  return grid;
}

const exampleInput = load('ex').lines;
example.equal(112, rounds(round3d, parse(exampleInput), 6).size);
example.equal(848, rounds(round4d, parse(exampleInput, 4), 6).size);

const input = load().lines;
export default solve(
  () => rounds(round3d, parse(input), 6).size,
  () => rounds(round4d, parse(input, 4), 6).size
).expect(426, 1892);
