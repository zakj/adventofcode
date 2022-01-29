import { load, solve } from 'lib/advent';
import { iter } from 'lib/iter';
import { zip } from 'lib/util';

function parse(lines: string[]): number[][] {
  return lines.map((line) => line.trim().split(/\s+/).map(Number));
}

function isValidTriangle([a, b, c]: number[]): boolean {
  return a < b + c && b < a + c && c < a + b;
}

function fromColumns(lines: number[][]): number[][] {
  // TODO Iter.zip?
  return iter(zip(...lines))
    .flat()
    .splitEvery(3)
    .toArray();
}

const triangles = parse(load().lines);
export default solve(
  () => triangles.filter(isValidTriangle).length,
  () => fromColumns(triangles).filter(isValidTriangle).length
).expect(983, 1836);
