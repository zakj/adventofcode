import { main } from 'lib/advent';
import { lines, range, sum } from 'lib/util';

function nextRow(row: string) {
  return range(0, row.length)
    .map((i) => {
      const l = row[i - 1] === '^' ? 1 : 0;
      const r = row[i + 1] === '^' ? 1 : 0;
      return l ^ r ? '^' : '.';
    })
    .join('');
}

function buildTiles(firstRow: string, n: number): string[] {
  const rows = [firstRow];
  while (rows.length < n) {
    rows.push(nextRow(rows[rows.length - 1]));
  }
  return rows;
}

function countSafeTiles(rows: string[]): number {
  return sum(rows.map((row) => row.split('').filter((c) => c === '.').length));
}

main(
  (s, { part1_rows }) =>
    countSafeTiles(buildTiles(lines(s)[0], part1_rows as number)),
  (s, { part2_rows }) =>
    countSafeTiles(buildTiles(lines(s)[0], part2_rows as number))
);
