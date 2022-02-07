import { example, load, solve } from 'lib/advent';
import { Dir, move, parseGrid, Point, PointGrid } from 'lib/coords';

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

const exampleInstructions = load('ex').lines;
example.equal(doorCode(exampleInstructions, keypadGrid, gStart), '1985');
example.equal(doorCode(exampleInstructions, keypadDiamond, dStart), '5DB3');

const instructions = load().lines;
export default solve(
  () => doorCode(instructions, keypadGrid, gStart),
  () => doorCode(instructions, keypadDiamond, dStart)
).expect('33444', '446A6');
