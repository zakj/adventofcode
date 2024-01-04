import { main } from 'lib/advent';
import { Counter } from 'lib/collections';
import { last, lines, zip } from 'lib/util';

function errorCorrect(signals: string[]): string {
  return zip(...signals.map((x) => x.split('')))
    .map((column) => new Counter(column).mostCommon[0][0])
    .join('');
}

function errorCorrectLeast(signals: string[]): string {
  return zip(...signals.map((x) => x.split('')))
    .map((column) => last(new Counter(column).mostCommon)[0])
    .join('');
}

main(
  (s) => errorCorrect(lines(s)),
  (s) => errorCorrectLeast(lines(s))
);
