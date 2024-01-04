import { main } from 'lib/advent';
import { Dir, Point, PointGrid, move, parseGrid } from 'lib/coords';
import { lines } from 'lib/util';

const keypadGrid = parseGrid(['123', '456', '789'], (c) => c);
const gStart = { x: 1, y: 1 };

const keypadDiamond = parseGrid(
  ['  1  ', ' 234 ', '56789', ' ABC ', '  D  '],
  (c) => (c !== ' ' ? c : undefined)
);
const dStart = { x: 0, y: 2 };

const dirMap = { U: Dir.Up, R: Dir.Right, D: Dir.Down, L: Dir.Left };

function doorCode(
  instructions: string[],
  keypad: PointGrid<string>,
  start: Point
): string {
  let point = start;
  return instructions
    .map((instr) => {
      point = instr.split('').reduce((pos, dir) => {
        const next = move(pos, dirMap[dir]);
        return keypad.has(next) && keypad.get(next) ? next : pos;
      }, point);
      return keypad.get(point);
    })
    .join('');
}

main(
  (s) => doorCode(lines(s), keypadGrid, gStart),
  (s) => doorCode(lines(s), keypadDiamond, dStart)
);
