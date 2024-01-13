import { main } from 'lib/advent';
import { combinations, lines, sum } from 'lib/util';

function parse(s: string) {
  return lines(s).map((line) => line.split(/\s+/).map(Number));
}

function part1(sheet: number[][]): number {
  return sum(sheet.map((row) => Math.max(...row) - Math.min(...row)));
}

function part2(sheet: number[][]): number {
  return sum(
    sheet.map((row) => {
      for (const [a, b] of combinations(row)) {
        if (a % b === 0) return a / b;
        if (b % a === 0) return b / a;
      }
      return 0;
    })
  );
}

main(
  (s) => part1(parse(s)),
  (s) => part2(parse(s))
);
