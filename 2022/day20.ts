import { example, load, solve } from 'lib/advent';
import { iter } from 'lib/iter';
import { range } from 'lib/util';

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

const exampleData = [1, 2, -3, 3, -2, 0, 4];
example.equal(decryptCoordinates(exampleData), 3);
example.equal(decryptCoordinates(exampleData, KEY, 10), 1623178306);

const data = load().numbers;
export default solve(
  () => decryptCoordinates(data),
  () => decryptCoordinates(data, KEY, 10)
).expect(8721, 831878881825);
