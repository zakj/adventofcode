import { load, solve } from 'lib/advent';

const threeVowels = /[aeiou].*[aeiou].*[aeiou]/;
const repeatedLetter = /(.)\1/;
const badStrings = /(?:ab)|(?:cd)|(?:pq)|(?:xy)/;
const duplicatePair = /(..).*\1/;
const aba = /(.).\1/;

const part1 = (s: string) =>
  threeVowels.test(s) && repeatedLetter.test(s) && !badStrings.test(s);
const part2 = (s: string) => duplicatePair.test(s) && aba.test(s);

const strings = load().lines;
export default solve(
  () => strings.filter(part1).length,
  () => strings.filter(part2).length
).expect(238, 69);
