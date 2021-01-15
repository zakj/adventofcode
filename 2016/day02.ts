import { answers, example, load } from './advent';

const keypadGrid = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

const keypadDiamond = [
  ['', '', '1', '', ''],
  ['', '2', '3', '4', ''],
  ['5', '6', '7', '8', '9'],
  ['', 'A', 'B', 'C', ''],
  ['', '', 'D', '', ''],
];

type Point = [number, number];
type Clamp = (prev: Point, next: Point, arr: string[][]) => Point;

function clampGrid<T>(prev: Point, next: Point, arr: T[][]): Point {
  next[0] = Math.max(0, Math.min(next[0], arr.length - 1));
  next[1] = Math.max(0, Math.min(next[1], arr[0].length - 1));
  return next;
}

function clampDiamond<T>(prev: Point, next: Point, arr: T[][]): Point {
  next = clampGrid(prev, next, arr);
  if (!arr[next[0]][next[1]]) return prev;
  return next;
}

function doorCode(
  instructions: string[],
  keypad: string[][],
  clamp: Clamp
): string {
  const moves: { [key: string]: (p: Point) => Point } = {
    U: (p) => [p[0] - 1, p[1]],
    D: (p) => [p[0] + 1, p[1]],
    L: (p) => [p[0], p[1] - 1],
    R: (p) => [p[0], p[1] + 1],
  };

  const is5 = (v: string) => v === '5';
  const startRow = keypad.findIndex((row) => row.findIndex(is5) !== -1);
  let point: Point = [startRow, keypad[startRow].findIndex(is5)];
  let digits = [];
  for (let instr of instructions) {
    point = instr.split('').reduce((pos, move) => {
      return clamp(pos, moves[move](pos), keypad);
    }, point);
    digits.push(keypad[point[0]][point[1]]);
  }

  return digits.join('');
}

const exampleInstructions = load(2, 'ex').lines;
example.equal(doorCode(exampleInstructions, keypadGrid, clampGrid), '1985');
example.equal(
  doorCode(exampleInstructions, keypadDiamond, clampDiamond),
  '5DB3'
);

const instructions = load(2).lines;
answers(
  () => doorCode(instructions, keypadGrid, clampGrid),
  () => doorCode(instructions, keypadDiamond, clampDiamond)
);
