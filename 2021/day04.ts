import { answers, load } from '../advent';
import { sum } from '../util';

function parse(paras: string[][]) {
  const numbers = paras.shift()[0].split(',').map(Number);
  const boards = paras.map((lines) => {
    return lines.map((line) => line.trim().split(/\s+/).map(Number));
  });
  return { numbers, boards };
}

const MARK = Symbol('mark');

function part1({
  numbers,
  boards,
}: {
  numbers: number[];
  boards: (number | typeof MARK)[][][];
}) {
  for (const num of numbers) {
    for (const board of boards) {
      for (const row of board) {
        for (let i = 0; i < row.length; ++i) {
          if (row[i] === num) {
            row[i] = MARK;
            if (row.every((v) => v === MARK)) {
              return (
                sum(board.flat().filter((x) => x !== MARK) as number[]) * num
              );
            }
            if (board.every((row) => row[i] === MARK)) {
              return (
                sum(board.flat().filter((x) => x !== MARK) as number[]) * num
              );
            }
          }
        }
      }
    }
  }
}

function part2({
  numbers,
  boards,
}: {
  numbers: number[];
  boards: (number | typeof MARK)[][][];
}) {
  let winners = [];
  let winnerVals = [];
  for (const num of numbers) {
    for (let boardIdx = 0; boardIdx < boards.length; boardIdx++) {
      const board = boards[boardIdx];
      for (const row of board) {
        for (let i = 0; i < row.length; ++i) {
          if (row[i] === num) {
            row[i] = MARK;
            if (row.every((v) => v === MARK)) {
              if (!winners.includes(boardIdx)) {
                winners.push(boardIdx);
                winnerVals.push(
                  sum(board.flat().filter((x) => x !== MARK) as number[]) * num
                );
              }
            }
            if (board.every((row) => row[i] === MARK)) {
              if (!winners.includes(boardIdx)) {
                winners.push(boardIdx);
                winnerVals.push(
                  sum(board.flat().filter((x) => x !== MARK) as number[]) * num
                );
              }
            }
          }
        }
      }
    }
  }
  return winnerVals.pop();
}

const bingoData = parse(load(4).paragraphs);
answers.expect(44088, 23670);
answers(
  () => part1(bingoData),
  () => part2(bingoData)
);
