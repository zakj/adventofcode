import { main } from 'lib/advent';
import { allNumbers } from 'lib/util';

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

main(
  (s) => {
    const diffs = joltageJumps(allNumbers(s));
    return diffs[1] * diffs[3];
  },
  (s) => countValidPaths(allNumbers(s))
);
