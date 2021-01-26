import { answers, example, load } from '../advent';
import { Counter } from '../util';

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

example.equal(noRepeats('aa bb cc dd ee'), true);
example.equal(noRepeats('aa bb cc dd aa'), false);
example.equal(noRepeats('aa bb cc dd aaa'), true);

const passphrases = load(4).lines;
answers.expect(337, 231);
answers(
  () => passphrases.filter(noRepeats).length,
  () => passphrases.filter(noRepeatAnagrams).length
);
