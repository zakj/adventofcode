import { main } from 'lib/advent';
import { iter } from 'lib/iter';
import { lines, zip } from 'lib/util';

function parse(input: string): number[][] {
  return lines(input).map((line) => line.trim().split(/\s+/).map(Number));
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

main(
  (s) => parse(s).filter(isValidTriangle).length,
  (s) => fromColumns(parse(s)).filter(isValidTriangle).length
);
