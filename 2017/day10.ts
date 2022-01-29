import { example, load, solve } from 'lib/advent';
import { product, range } from 'lib/util';
import { knotHash, round } from './knot-hash';

example.deepEqual(round(range(0, 5), [3, 4, 1, 5]).list, [3, 4, 2, 1, 0]);
example.equal(knotHash(''), 'a2582a3a0e66e6e86e3812dcb672a272');
example.equal(knotHash('AoC 2017'), '33efeb34ea91902bb2f59c9920caa6cd');
example.equal(knotHash('1,2,3'), '3efbe78a8d82f29979031a4aa0b16a9d');
example.equal(knotHash('1,2,4'), '63960835bcdc130f0b66d7ff4f6a5a8e');

const input = load().raw.trim();
export default solve(
  () =>
    product(
      round(range(0, 256), input.split(',').map(Number)).list.slice(0, 2)
    ),
  () => knotHash(input)
).expect(38628, 'e1462100a34221a7f0906da15c1c979a');
