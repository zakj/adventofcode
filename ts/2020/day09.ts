import { main } from 'lib/advent';
import { allNumbers, sum } from 'lib/util';

function isSumOfTwoElements(needle: number, haystack: number[]): boolean {
  for (let i = 0; i < haystack.length; ++i) {
    for (let j = i + 1; j < haystack.length; ++j) {
      if (haystack[i] + haystack[j] === needle) return true;
    }
  }
  return false;
}

function firstFailingNumber(data: number[], preambleLength: number): number {
  return data
    .slice(preambleLength)
    .find((n, i) => !isSumOfTwoElements(n, data.slice(i, i + preambleLength)));
}

function contiguousSum(needle: number, haystack: number[]): number {
  for (let i = 0; i < haystack.length; ++i) {
    for (let j = i + 1; j < haystack.length; ++j) {
      const slice = haystack.slice(i, j + 1);
      if (sum(slice) === needle) return Math.min(...slice) + Math.max(...slice);
    }
  }
}

main(
  (s, { preamble }) => firstFailingNumber(allNumbers(s), preamble as number),
  (s, { preamble }) => {
    const data = allNumbers(s);
    return contiguousSum(firstFailingNumber(data, preamble as number), data);
  }
);
