import assert from 'assert';
import { main, ocr } from 'lib/advent';
import { lines, zip } from 'lib/util';

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

function parse(s: string): Instruction[] {
  return lines(s).map((line) => {
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
  width: unknown,
  height: unknown
): Board {
  assert(typeof width == 'number' && typeof height == 'number');
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
  return board.flat().filter(Boolean).length;
}

main(
  (s, args) => count(run(parse(s), args.width, args.height)),
  (s, args) => ocr(toString(run(parse(s), args.width, args.height)), '4x6')
);
