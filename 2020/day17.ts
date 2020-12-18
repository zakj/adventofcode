import { answers, example, loadDayLines, range } from './util';

type Bound = [number, number];

class TupleMap<T> extends Map<string, T> {
  bounds: { x: Bound; y: Bound; z: Bound, w: Bound };
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
  if (active) grid.setActive(key)
  else grid.setInactive(key)
}

function countActiveNeighbors3d(grid: Grid, [sx, sy, sz]): number {
  let count = 0;
  for (let x = sx - 1; x <= sx + 1; ++x) {
    for (let y = sy - 1; y <= sy + 1; ++y) {
      for (let z = sz - 1; z <= sz + 1; ++z) {
        if (x === sx && y === sy && z === sz) continue;
        if (grid.get([x, y, z])) count++
      }
    }
  }
  return count;
}

function round3d(grid: Grid): Grid {
  const next: Grid = new TupleMap();
  for (let x = grid.bounds.x[0] - 1; x <= grid.bounds.x[1] + 1; ++x) {
    for (let y = grid.bounds.y[0] - 1; y <= grid.bounds.y[1] + 1; ++y) {
      for (let z = grid.bounds.z[0] - 1; z <= grid.bounds.z[1] + 1; ++z) {
        const active = grid.get([x, y, z]);
        const activeNeighbors = countActiveNeighbors3d(grid, [x, y, z])
        set(next, [x, y, z], activeNeighbors === 3 || (active && activeNeighbors === 2))
      }
    }
  }
  return next;
}

function countActiveNeighbors4d(grid: Grid, [sx, sy, sz, sw]): number {
  let count = 0;
  for (let x = sx - 1; x <= sx + 1; ++x) {
    for (let y = sy - 1; y <= sy + 1; ++y) {
      for (let z = sz - 1; z <= sz + 1; ++z) {
        for (let w = sw - 1; w <= sw + 1; ++w) {
          if (x === sx && y === sy && z === sz && w == sw) continue;
          if (grid.get([x, y, z, w])) count++
        }
      }
    }
  }
  return count;
}

function round4d(grid: Grid): Grid {
  const next: Grid = new TupleMap();
  for (let x = grid.bounds.x[0] - 1; x <= grid.bounds.x[1] + 1; ++x) {
    for (let y = grid.bounds.y[0] - 1; y <= grid.bounds.y[1] + 1; ++y) {
      for (let z = grid.bounds.z[0] - 1; z <= grid.bounds.z[1] + 1; ++z) {
        for (let w = grid.bounds.w[0] - 1; w <= grid.bounds.w[1] + 1; ++w) {
          const active = grid.get([x, y, z, w]);
          const activeNeighbors = countActiveNeighbors4d(grid, [x, y, z, w])
          set(next, [x, y, z, w], activeNeighbors === 3 || (active && activeNeighbors === 2))
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

const exampleGrid3d = parse(loadDayLines(17, 'example'));
const exampleGrid4d = parse(loadDayLines(17, 'example'), 4);
example.equal(112, rounds(round3d, exampleGrid3d, 6).size);
example.equal(848, rounds(round4d, exampleGrid4d, 6).size);

const grid3d = parse(loadDayLines(17))
const grid4d = parse(loadDayLines(17), 4)
answers(
  () => rounds(round3d, grid3d, 6).size,
  () => rounds(round4d, grid4d, 6).size,
);
