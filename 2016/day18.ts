import { answers, example, load } from './advent';
import { range, sum } from './util';

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

const firstRow = load(18).lines[0];
answers(
  () => countSafeTiles(buildTiles(firstRow, 40)),
  () => countSafeTiles(buildTiles(firstRow, 400000))
);
