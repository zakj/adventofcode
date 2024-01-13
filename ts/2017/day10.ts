import { main } from 'lib/advent';
import { allNumbers, product, range } from 'lib/util';
import { knotHash, round } from './knot-hash';

main(
  (s) => product(round(range(0, 256), allNumbers(s)).list.slice(0, 2)),
  (s) => knotHash(s.trim())
);
