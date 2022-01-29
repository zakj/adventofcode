import { example, load, solve } from 'lib/advent';
import { range, sum } from 'lib/util';

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

example.equal(countSafeTiles(buildTiles('.^^.^.^^^^', 10)), 38);

const firstRow = load().lines[0];
export default solve(
  () => countSafeTiles(buildTiles(firstRow, 40)),
  () => countSafeTiles(buildTiles(firstRow, 400000))
).expect(1939, 19999535);
