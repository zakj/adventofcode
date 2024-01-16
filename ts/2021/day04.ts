import { main } from 'lib/advent';
import { paragraphs, range, sum, zip } from 'lib/util';

type Board = number[][];
type Game = {
  numbers: number[];
  boards: Board[];
};

function parse(chunks: string[][]): Game {
  const numbers = chunks.shift()[0].split(',').map(Number);
  const boards = chunks.map((lines) => {
    return lines.map((line) => line.trim().split(/\s+/).map(Number));
  });
  return { numbers, boards };
}

function isWinner(board: Board, called: Set<number>): boolean {
  return (
    board.some((values) => values.every((v) => called.has(v))) ||
    zip(...board).some((values) => values.every((v) => called.has(v)))
  );
}

function boardValue(board: Board, called: Set<number>): number {
  return sum(board.flat().filter((v) => !called.has(v)));
}

function firstWinner({ numbers, boards }: Game): number {
  const called = new Set<number>();
  for (const num of numbers) {
    called.add(num);
    const winner = boards.find((b) => isWinner(b, called));
    if (winner) return boardValue(winner, called) * num;
  }
}

function lastWinner({ numbers, boards }: Game): number {
  let lastWinnerValue: number = null;
  const won = new Set<number>();
  const called = new Set<number>();
  for (const num of numbers) {
    called.add(num);
    for (const i of range(0, boards.length)) {
      if (won.has(i)) continue;
      const board = boards[i];
      if (isWinner(board, called)) {
        won.add(i);
        lastWinnerValue = boardValue(board, called) * num;
      }
    }
    if (won.size === boards.length) break;
  }
  return lastWinnerValue;
}

main(
  (s) => firstWinner(parse(paragraphs(s))),
  (s) => lastWinner(parse(paragraphs(s)))
);
