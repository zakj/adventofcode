import { main } from 'lib/advent';
import { Dir, move, parseGrid, Point, PointGrid } from 'lib/coords';
import { Iter, iter } from 'lib/iter';
import { lines } from 'lib/util';

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

function parse(s: string): Iter<[Point, number, PointGrid<number>]> {
  return iter(parseGrid(lines(s), Number));
}

main(
  (s) => parse(s).map(isVisible).filter(Boolean).size,
  (s) => parse(s).map(scenicScore).max()
);
