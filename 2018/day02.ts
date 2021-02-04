import { answers, load } from '../advent';
import { combinations, Counter, hammingDistance, zip } from '../util';

function checksum(xs: string[]): number {
  let twos = 0;
  let threes = 0;
  xs.forEach((x) => {
    const counts = new Counter(x.split('')).mostCommon;
    if (counts.some(([chr, cnt]) => cnt === 3)) threes++;
    if (counts.some(([chr, cnt]) => cnt === 2)) twos++;
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

const boxIds = load(2).lines;
answers.expect(5904, 'jiwamotgsfrudclzbyzkhlrvp');
answers(
  () => checksum(boxIds),
  () => commonLetters(boxIds)
);
