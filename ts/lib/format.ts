import { sum } from 'lib/util';

export const color = (() => {
  const c = (n: number) => (text: string) => `\x1b[${n}m${text}\x1b[0m`;
  return {
    red: c(31),
    green: c(32),
    yellow: c(33),
    grey: c(90),
    white: c(97),
  };
})();

export function makeTable(columns: number[], stream: NodeJS.WriteStream) {
  // 3 = 1 border, 2 padding. +1 for trailing border
  const totalWidth = sum(columns) + 3 * columns.length + 1;
  const box = {
    cornerBL: '└',
    cornerBR: '┘',
    cornerTL: '┌',
    cornerTR: '┐',
    lineH: '─',
    lineV: '│',
    tBottom: '┴',
    tLeft: '├',
    tRight: '┤',
    tTop: '┬',
  };
  const g = color.grey;
  const w = color.white;
  const colLineH = columns.map((n) => box.lineH.repeat(n + 2));
  let currentCell = 0;

  return {
    header(title: string) {
      stream.write(
        [
          g(box.cornerTL + colLineH.join(box.lineH) + box.cornerTR),
          g(box.lineV) + ' ' + w(title.padEnd(totalWidth - 3)) + g(box.lineV),
          g(box.tLeft + colLineH.join(box.tTop) + box.tRight),
        ].join('\n') + '\n'
      );
    },

    startRow() {
      currentCell = 0;
      stream.write(
        g(
          box.lineV +
            columns.map((n) => ' '.repeat(n + 2)).join(box.lineV) +
            box.lineV
        )
      );
    },

    cell(value: string) {
      const prevCells = columns.slice(0, currentCell);
      stream.cursorTo(sum(prevCells) + prevCells.length * 3 + 2);
      stream.write(value);
      currentCell++;
    },

    endRow() {
      currentCell = 0;
      stream.write('\n');
    },

    footer() {
      stream.write(
        g(box.cornerBL + colLineH.join(box.tBottom) + box.cornerBR) + '\n\n'
      );
    },
  };
}
