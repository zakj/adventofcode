import { example, load, solve } from 'lib/advent';
import { Dir, move, parseGrid, Point, PointGrid } from 'lib/coords';
import { Iter, iter } from 'lib/iter';

function valuesEachDir<T>(grid: PointGrid<T>, p: Point): T[][] {
  return Object.values(Dir).map((dir) => {
    const values = [];
    for (let cur = move(p, dir); grid.has(cur); cur = move(cur, dir)) {
      values.push(grid.get(cur));
    }
    return values;
  });
}

function isVisible(grid: PointGrid<number>, x: number, y: number): boolean {
  const val = grid.get(x, y);
  return valuesEachDir(grid, { x, y }).some((values) =>
    values.every((v) => v < val)
  );
}

function scenicScore(grid: PointGrid<number>, x: number, y: number): number {
  const val = grid.get(x, y);
  return valuesEachDir(grid, { x, y })
    .map((values) => iter(values).takeWhile((v) => v < val, true).size)
    .reduce((a, b) => a * b);
}

type Mapper<T> = (grid: PointGrid<number>, x: number, y: number) => T;
const projectGrid = <T>(grid: PointGrid<number>, fn: Mapper<T>): Iter<T> =>
  iter(grid.map((val, { x, y }) => fn(grid, x, y)));

const exampleGrid = parseGrid(
  ['30373', '25512', '65332', '33549', '35390'],
  Number
);
example.equal(21, projectGrid(exampleGrid, isVisible).filter(Boolean).size);
example.equal(8, projectGrid(exampleGrid, scenicScore).max());

const grid = parseGrid(load().lines, Number);
export default solve(
  () => projectGrid(grid, isVisible).filter(Boolean).size,
  () => projectGrid(grid, scenicScore).max()
).expect(1763, 671160);
