import { example, loadDayLines } from './util';

function joltageJumps(adapters: number[]): { [key: number]: number } {
  adapters = [0].concat(adapters);
  adapters.sort((a, b) => a - b);
  adapters.push(adapters[adapters.length - 1] + 3); // device is always +3 from highest
  return adapters
    .slice(1)
    .map((joltage, i) => joltage - adapters[i])
    .reduce((xs, x) => {
      if (!xs[x]) xs[x] = 0;
      xs[x]++;
      return xs;
    }, {});
}

function countValidPaths(adapters: number[]): number {
  const pathsPerContiguousNumber = {
    0: 1,
    1: 1,
    2: 2,
    3: 4,
    4: 7,
  };
  adapters = [0].concat(adapters);
  adapters.sort((a, b) => a - b);
  let contiguousCount = 0;
  const result = adapters.slice(1).reduce((acc, x, i) => {
    switch (x - adapters[i]) {
      case 3:
        acc *= pathsPerContiguousNumber[contiguousCount];
        contiguousCount = 0;
        break;
      case 1:
        contiguousCount++;
        break;
      default:
        throw new Error(`unexpected diff of ${x - adapters[i]} at index ${i}`);
        break;
    }
    return acc;
  }, 1);
  return result * pathsPerContiguousNumber[contiguousCount];
}

const exampleAdapters = loadDayLines(10, 'example').map(Number);
const exampleDiffs = joltageJumps(exampleAdapters);
example.deepEqual([22, 10], [exampleDiffs[1], exampleDiffs[3]]);
example.equal(
  8,
  countValidPaths([16, 10, 15, 5, 1, 11, 7, 19, 6, 12, 4])
);
example.equal(19208, countValidPaths(exampleAdapters));

const adapters = loadDayLines(10).map(Number);
const diffs = joltageJumps(adapters);
console.log({
  1: diffs[1] * diffs[3],
  2: countValidPaths(adapters),
});
