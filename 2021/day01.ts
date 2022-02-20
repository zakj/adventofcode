import { example, load, solve } from 'lib/advent';
import { Iter, iter } from 'lib/iter';
import { sum } from 'lib/util';

function countIncreases(xs: Iter<number>): number {
  return xs.aperture(2).filter(([a, b]) => b > a).size;
}

const exampleReport = iter(load('ex').numbers);
example.equal(countIncreases(exampleReport), 7);
example.equal(countIncreases(exampleReport.aperture(3).map(sum)), 5);

const report = iter(load().numbers);
export default solve(
  () => countIncreases(report),
  () => countIncreases(report.aperture(3).map(sum))
).expect(1548, 1589);
