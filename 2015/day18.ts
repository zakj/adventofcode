import { example, load, solve } from 'lib/advent';
import { range, sum } from 'lib/util';

class Life {
  public grid: Boolean[][];

  constructor(public size: number, public isStuck: Boolean = false) {
    this.grid = range(0, size).map(() => new Array(size).fill(false));
  }

  get stuck(): Life {
    const next = new Life(this.size, true);
    next.grid = this.grid.map((row) => [...row]);
    next.grid[0][0] = true;
    next.grid[0][next.size - 1] = true;
    next.grid[next.size - 1][0] = true;
    next.grid[next.size - 1][next.size - 1] = true;
    return next;
  }

  activeNeighbors(row: number, col: number) {
    const deltas = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    return deltas
      .map(([rowD, colD]) => ({ row: row + rowD, col: col + colD }))
      .filter(
        ({ row, col }) =>
          row >= 0 &&
          row < this.size &&
          col >= 0 &&
          col < this.size &&
          this.grid[row][col]
      ).length;
  }

  cycle() {
    const next = new Life(this.size, this.isStuck);
    const bounds = [0, this.size - 1];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const active = this.grid[row][col];
        const neighbors = this.activeNeighbors(row, col);
        const isStuck =
          this.isStuck && bounds.includes(row) && bounds.includes(col);
        next.grid[row][col] =
          isStuck || neighbors === 3 || (active && neighbors === 2);
      }
    }
    return next;
  }

  toString() {
    return this.grid
      .map((row) => row.map((c) => (c ? '#' : '.')).join(''))
      .join('\n');
  }
}

function parseGrid(lines: string[]): Life {
  const life = new Life(lines[0].length);
  lines.forEach((line, row) => {
    line.split('').forEach((c, col) => {
      if (c === '#') life.grid[row][col] = true;
    });
  });
  return life;
}

function run(life: Life, rounds: number): number {
  for (let i = 0; i < rounds; ++i) {
    life = life.cycle();
  }
  return sum(life.grid.map((row) => row.filter(Boolean).length));
}

const exampleGrid = parseGrid(load('ex').lines);
example.equal(run(exampleGrid, 4), 4);
example.equal(run(exampleGrid.stuck, 5), 17);

const grid = parseGrid(load().lines);
export default solve(
  () => run(grid, 100),
  () => run(grid.stuck, 100)
).expect(821, 886);
