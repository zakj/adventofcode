import { example, load, solve } from '../advent';
import { sum } from '../util';

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

const exampleData = load('ex').numbers;
example.equal(127, firstFailingNumber(exampleData, 5));
example.equal(62, contiguousSum(127, exampleData));

const data = load().numbers;
const part1 = firstFailingNumber(data, 25);
export default solve(
  () => part1,
  () => contiguousSum(part1, data)
).expect(104054607, 13935797);
