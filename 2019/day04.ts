import { pairs } from './util';

const data = '197487-673251';
const [start, end] = data.split('-').map(x => parseInt(x, 10));

type MatchingCriteria = (x: number, start: number, end: number) => boolean;

const matchesCriteriaPart1: MatchingCriteria = function (x, start, end) {
  return (
    x.toString().length === 6 &&
    x >= start &&
    x <= end &&
    hasTwoSameAdjacentDigits(x) &&
    !hasDecreasingDigits(x)
  );
}

const matchesCriteriaPart2: MatchingCriteria = function (x, start, end) {
  return (
    matchesCriteriaPart1(x, start, end) && hasExactlyTwoSameAdjacentDigits(x)
  );
}

function hasTwoSameAdjacentDigits(x: number): boolean {
  return pairs(x.toString().split('')).reduce<boolean>(
    (found, [a, b]) => found || a === b,
    false
  );
}

function hasExactlyTwoSameAdjacentDigits(x: number): boolean {
  const digits = x.toString().split('');
  let lastDigit = digits[0];
  let run = 1;
  let found = false;
  digits.slice(1).forEach(digit => {
    if (digit !== lastDigit) {
      if (run === 2) {
        found = true;
      }
      run = 1;
      lastDigit = digit;
    } else {
      run++;
    }
  });
  if (run === 2) found = true;
  return found;
}

function hasDecreasingDigits(x: number) {
  return pairs(
    x
      .toString()
      .split('')
      .map(x => parseInt(x, 10))
  ).reduce((found, [a, b]) => found || b < a, false);
}

function matchingNumbersInRange(start: number, end: number, test: MatchingCriteria) {
  let matches = [];
  for (let i = start; i <= end; ++i) {
    if (test(i, start, end)) matches.push(i);
  }
  return matches;
}

console.log(matchingNumbersInRange(start, end, matchesCriteriaPart1).length);
console.log(matchingNumbersInRange(start, end, matchesCriteriaPart2).length);
