import { example, load, solve } from 'lib/advent';
import { pairs, sum } from 'lib/util';

function countIncreases(xs: number[]): number {
  return pairs(xs).filter(([a, b]) => b > a).length;
}

function countIncreasesWindowed(xs: number[]): number {
  const windows = [];
  for (let i = 0; i <= xs.length - 3; ++i) {
    windows.push(sum(xs.slice(i, i + 3)));
  }
  return countIncreases(windows);
}

const exampleReport = load('ex').numbers;
example.equal(countIncreases(exampleReport), 7);
example.equal(countIncreasesWindowed(exampleReport), 5);

const report = load().numbers;
export default solve(
  () => countIncreases(report),
  () => countIncreasesWindowed(report)
).expect(1548, 1589);
