import { main } from 'lib/advent';
import { allNumbers, product, sum } from 'lib/util';

function findSums(target: number, xs: number[]): number[][] {
  if (xs.length === 0) return [];
  const [head, tail] = [xs[0], xs.slice(1)];
  let results = [];
  if (head === target) {
    results = results.concat([[head]]);
  }
  if (head < target) {
    results = results.concat(
      findSums(target - head, tail).map((v) => [head].concat(v))
    );
  }
  return results.concat(findSums(target, tail));
}

const min = <T>(xs: T[]): T => xs.reduce((min, x) => (x < min ? x : min));

function smallestGroup(target: number, packages: number[]): number {
  const possibleGroups = findSums(target, packages);
  const minGroupSize = min(possibleGroups.map((g) => g.length));
  const smallestGroups = possibleGroups.filter(
    (g) => g.length === minGroupSize
  );
  return min(smallestGroups.map(product));
}

main(
  (s) => smallestGroup(sum(allNumbers(s)) / 3, allNumbers(s)),
  (s) => smallestGroup(sum(allNumbers(s)) / 4, allNumbers(s))
);
