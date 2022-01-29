import { load, solve } from '../advent';
import { combinations, sum } from '../util';

function parse(lines: string[]) {
  return lines.map((line) => line.split(/\s+/).map(Number));
}

function part1(sheet: number[][]): number {
  return sum(sheet.map((row) => Math.max(...row) - Math.min(...row)));
}

function part2(sheet: number[][]): number {
  return sum(
    sheet.map((row) => {
      for (let [a, b] of combinations(row)) {
        if (a % b === 0) return a / b;
        if (b % a === 0) return b / a;
      }
      return 0;
    })
  );
}

const spreadsheet = parse(load().lines);
export default solve(
  () => part1(spreadsheet),
  () => part2(spreadsheet)
).expect(45972, 326);
