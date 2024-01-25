import { main } from 'lib/advent';
import { Iter, iter } from 'lib/iter';

function parse(s: string): Iter<string> {
  return iter(s.split(''));
}

function findMarker(signal: Iter<string>, size: number): number {
  return signal
    .map((x, i) => ({ value: x, i: i + 1 }))
    .aperture(size)
    .find((xs) => new Set(xs.map((x) => x.value)).size === size)
    .pop().i;
}

main(
  (s) => findMarker(parse(s), 4),
  (s) => findMarker(parse(s), 14)
);
