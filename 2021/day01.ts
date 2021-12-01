import { answers, example, load } from '../advent';
import { pairs, sum } from '../util';

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

const exampleReport = load(1, 'ex').numbers;
example.equal(countIncreases(exampleReport), 7);
example.equal(countIncreasesWindowed(exampleReport), 5);

const report = load(1).numbers;
answers.expect(1548, 1589);
answers(
  () => countIncreases(report),
  () => countIncreasesWindowed(report)
);
