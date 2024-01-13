import { main } from 'lib/advent';
import { Counter } from 'lib/collections';
import { lines } from 'lib/util';

function noRepeats(s: string): boolean {
  const counts = new Counter(s.split(/\s+/));
  return counts.mostCommon[0][1] === 1;
}

function noRepeatAnagrams(s: string): boolean {
  const counts = new Counter(
    s.split(/\s+/).map((w) => w.split('').sort().join(''))
  );
  return counts.mostCommon[0][1] === 1;
}

main(
  (s) => lines(s).filter(noRepeats).length,
  (s) => lines(s).filter(noRepeatAnagrams).length
);
