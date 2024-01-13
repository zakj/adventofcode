import { main } from 'lib/advent';
import { Counter } from 'lib/collections';
import { combinations, hammingDistance, lines, zip } from 'lib/util';

function checksum(xs: string[]): number {
  let twos = 0;
  let threes = 0;
  xs.forEach((x) => {
    const counts = new Counter(x.split('')).mostCommon;
    if (counts.some(([, cnt]) => cnt === 3)) threes++;
    if (counts.some(([, cnt]) => cnt === 2)) twos++;
  });
  return twos * threes;
}

function commonLetters(xs: string[]): string {
  for (const [a, b] of combinations(xs)) {
    if (hammingDistance(a, b) === 1) {
      const i = zip(a.split(''), b.split('')).findIndex(([x, y]) => x !== y);
      return a.slice(0, i) + a.slice(i + 1);
    }
  }
}

main(
  (s) => checksum(lines(s)),
  (s) => commonLetters(lines(s))
);
