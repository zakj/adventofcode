import { main } from 'lib/advent';
import { lines } from 'lib/util';

const threeVowels = /[aeiou].*[aeiou].*[aeiou]/;
const repeatedLetter = /(.)\1/;
const badStrings = /(?:ab)|(?:cd)|(?:pq)|(?:xy)/;
const duplicatePair = /(..).*\1/;
const aba = /(.).\1/;

const part1 = (s: string) =>
  threeVowels.test(s) && repeatedLetter.test(s) && !badStrings.test(s);
const part2 = (s: string) => duplicatePair.test(s) && aba.test(s);

main(
  (s) => lines(s).filter(part1).length,
  (s) => lines(s).filter(part2).length
);
