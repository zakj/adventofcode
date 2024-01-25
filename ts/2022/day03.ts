import { main } from 'lib/advent';
import { iter } from 'lib/iter';
import { lines } from 'lib/util';

function parse(lines: string[]) {
  return iter(lines.map((line) => line.split('')));
}

const intersect = <T>(...xs: T[][]): T =>
  [
    ...xs
      .map((x) => new Set(x))
      .reduce((a, b) => new Set([...b].filter((x) => a.has(x)))),
  ].pop();

const lowerCaseOffset = 'a'.charCodeAt(0) - 1;
const upperCaseOffset = 'A'.charCodeAt(0) - 27;
const priority = (s: string): number =>
  s.charCodeAt(0) - (s.toLowerCase() === s ? lowerCaseOffset : upperCaseOffset);

main(
  (s) =>
    parse(lines(s))
      .map((line) => {
        const len = line.length / 2;
        return priority(intersect(line.slice(0, len), line.slice(len)));
      })
      .sum(),
  (s) =>
    parse(lines(s))
      .splitEvery(3)
      .map((lines) => priority(intersect(...lines)))
      .sum()
);
