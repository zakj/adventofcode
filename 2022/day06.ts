import { example, load, solve } from 'lib/advent';
import { Iter, iter } from 'lib/iter';

function parse(s: string): Iter<string> {
  return iter(s.split(''));
}

example.equal(5, findMarker(parse('bvwbjplbgvbhsrlpgdmjqwftvncz'), 4));
example.equal(19, findMarker(parse('mjqjpqmgbljsphdztnvjfqwrcgsmlb'), 14));

function findMarker(signal: Iter<string>, size: number): number {
  return signal
    .map((x, i) => ({ value: x, i: i + 1 }))
    .aperture(size)
    .find((xs) => new Set(xs.map((x) => x.value)).size === size)
    .pop().i;
}

const data = parse(load().raw);
export default solve(
  () => findMarker(data, 4),
  () => findMarker(data, 14)
).expect(1275, 3605);
