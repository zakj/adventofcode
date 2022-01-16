import { answers, example, load, ocr } from '../advent';
import { sum, zip } from '../util';

type RectInstruction = {
  type: 'rect';
  w: number;
  h: number;
};

type RotateInstruction = {
  type: 'rotate';
  column?: number;
  row?: number;
  by: number;
};

type Instruction = RectInstruction | RotateInstruction;

type Board = boolean[][];

function parse(lines: string[]): Instruction[] {
  return lines.map((line) => {
    const words = line.split(' ');
    const [head, tail] = [words[0], words.slice(1)];
    if (head === 'rect') {
      const [w, h] = tail[0].split('x');
      return {
        type: 'rect',
        w: Number(w),
        h: Number(h),
      };
    } else if (head === 'rotate') {
      return {
        type: 'rotate',
        [tail[0]]: Number(tail[1].split('=')[1]),
        by: Number(tail[3]),
      };
    } else {
      throw new Error();
    }
  });
}

function run(
  instructions: Instruction[],
  width: number,
  height: number
): Board {
  let board = [];
  for (let i = 0; i < height; ++i) {
    board.push(new Array(width).fill(false));
  }

  for (const instr of instructions) {
    if (instr.type === 'rect') {
      for (let i = 0; i < instr.h; ++i) {
        for (let j = 0; j < instr.w; ++j) {
          board[i][j] = true;
        }
      }
    } else if (instr.type === 'rotate') {
      if ('row' in instr) {
        const row = board[instr.row];
        for (let i = 0; i < instr.by; ++i) {
          row.unshift(row.pop());
        }
      } else if ('column' in instr) {
        const transposed = zip(...board);
        const row = transposed[instr.column];
        for (let i = 0; i < instr.by; ++i) {
          row.unshift(row.pop());
        }
        board = zip(...transposed);
      }
    }
  }
  return board;
}

function toString(board: Board): string {
  return board
    .map((line) => line.map((x) => (x ? '#' : ' ')).join(''))
    .join('\n');
}

function count(board: Board): number {
  return sum(board.map((row) => row.filter(Boolean).length));
}

const exampleInstructions = parse(load(8, 'ex').lines);
example.equal(count(run(exampleInstructions, 7, 3)), 6);

const instructions = parse(load(8).lines);
answers.expect(116, 'UPOJFLBCEZ');
answers(
  () => count(run(instructions, 50, 6)),
  () => ocr(toString(run(instructions, 50, 6)), '4x6')
);
