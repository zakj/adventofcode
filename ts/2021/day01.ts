import { main } from 'lib/advent';
import { Iter, iter } from 'lib/iter';
import { allNumbers, sum } from 'lib/util';

function countIncreases(xs: Iter<number>): number {
  return xs.aperture(2).filter(([a, b]) => b > a).size;
}

main(
  (s) => countIncreases(iter(allNumbers(s))),
  (s) => countIncreases(iter(allNumbers(s)).aperture(3).map(sum))
);
