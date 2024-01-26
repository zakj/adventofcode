import { main } from 'lib/advent';
import { iter } from 'lib/iter';
import { allNumbers, range } from 'lib/util';

const KEY = 811589153;

function decryptCoordinates(xs: number[], key = 1, iterations = 1): number {
  const values = xs.map((x) => x * key);
  const indexes = range(0, values.length);
  for (let iter = 0; iter < iterations; ++iter) {
    for (let i = 0; i < values.length; ++i) {
      const pos = indexes.indexOf(i);
      indexes.splice(pos, 1);
      indexes.splice((pos + values[i]) % (values.length - 1), 0, i);
    }
  }

  const zero = indexes.indexOf(values.indexOf(0));
  return iter([1000, 2000, 3000])
    .map((n) => values[indexes[(zero + n) % values.length]])
    .sum();
}

main(
  (s) => decryptCoordinates(allNumbers(s)),
  (s) => decryptCoordinates(allNumbers(s), KEY, 10)
);
