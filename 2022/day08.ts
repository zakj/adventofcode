import { example, load, solve } from 'lib/advent';
import { Dir, move, parseGrid, Point, PointGrid } from 'lib/coords';
import { iter } from 'lib/iter';

// TODO: optimize
function heightsEachDir(p: Point, grid: PointGrid<number>): number[][] {
  return Object.values(Dir).map((dir) => {
    const values = [];
    for (let cur = move(p, dir); grid.has(cur); cur = move(cur, dir)) {
      values.push(grid.get(cur));
    }
    return values;
  });
}

type GridIterator = [Point, number, PointGrid<number>];

function isVisible([p, height, grid]: GridIterator): boolean {
  return heightsEachDir(p, grid).some((values) =>
    values.every((v) => v < height)
  );
}

function scenicScore([p, height, grid]: GridIterator): number {
  return heightsEachDir(p, grid)
    .map((values) => iter(values).takeWhile((v) => v < height, true).size)
    .reduce((a, b) => a * b);
}

const exampleGrid = parseGrid(
  ['30373', '25512', '65332', '33549', '35390'],
  Number
);
example.equal(21, iter(exampleGrid).map(isVisible).filter(Boolean).size);
example.equal(8, iter(exampleGrid).map(scenicScore).max());

const grid = parseGrid(load().lines, Number);
export default solve(
  () => iter(grid).map(isVisible).filter(Boolean).size,
  () => iter(grid).map(scenicScore).max()
).expect(1763, 671160);
